/**
 * RxV local R2 image free-release tool. Never publishes the private master map.
 * Work modes:
 *   --mode=preview  read-only
 *   --mode=test     publish up to 10 locked originals, after confirmation
 *   --mode=all      require every remaining source to exist before proceeding
 *   --mode=restore  restore exact original manifest and remove only copied originals
 *
 * Run from Windows with scripts/RXV-IMAGES-FREE-TOOL.cmd.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import https from "node:https";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import readline from "node:readline/promises";
import dotenv from "dotenv";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import {
  S3Client, GetObjectCommand, PutObjectCommand, CopyObjectCommand,
  HeadObjectCommand, DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  readManifest, rebuildManifest, checkPreviewStatus, catalogFingerprint,
  indexOriginals, sourceCandidates, validateMasterKey, contentTypeFor,
  makeFreePublicKey, publicUrl, imageIsFree, imageNeedsPublish, changeToFree,
} from "./lib/rxv-image-free-core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const flags = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--") && a.includes("=")).map((a) => a.slice(2).split(/=(.*)/s).slice(0, 2)));
const mode = flags.mode || "preview";
if (!["preview", "test", "all", "restore"].includes(mode)) throw new Error("Valid modes: preview, test, all, restore");
const localSource = process.platform === "win32" ? "D:\\Pomodoro-app" : root;
const envPath = path.resolve(flags.env || (fs.existsSync(path.join(localSource, ".env.local")) ? path.join(localSource, ".env.local") : path.join(root, ".env.local")));
const privateMasterPath = path.resolve(flags.master || path.join(localSource, "private-data", "images-master.json"));
const stateDir = path.resolve(flags["state-dir"] || path.join(os.homedir(), "Documents", "RXV-Image-Free-Backups"));
const activePath = path.join(stateDir, "active.json");
const manifestKey = "catalog/images-public.json";
const chunkSize = 10;

function loadEnv(file) {
  const fileValues = fs.existsSync(file) ? dotenv.parse(fs.readFileSync(file)) : {};
  return { ...fileValues, ...process.env };
}
const env = loadEnv(envPath);
const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
for (const key of required) if (!env[key]) throw new Error("Missing R2 setting " + key + " in " + envPath);
const publicBucket = env.R2_PUBLIC_BUCKET_NAME || "rxv-healing-images-public";
const privateBucket = env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging";
const publicBase = String(env.R2_PUBLIC_ASSET_URL || env.R2_PUBLIC_BASE_URL || env.R2_PUBLIC_URL || env.VITE_PUBLIC_R2_URL || "").replace(/\/$/, "");
if (!publicBase) throw new Error("Missing public R2 asset URL in .env.local");
const client = new S3Client({
  region: "auto",
  endpoint: "https://" + env.R2_ACCOUNT_ID + ".r2.cloudflarestorage.com",
  requestHandler: new NodeHttpHandler({ httpsAgent: new https.Agent({ keepAlive: false, maxCachedSessions: 0, maxSockets: 3 }) }),
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

function isMissing(error) {
  return error?.name === "NotFound" || error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404;
}
async function call(command) {
  let last;
  for (let tries = 0; tries < 4; tries++) {
    try { return await client.send(command); }
    catch (error) {
      if (isMissing(error)) throw error;
      last = error;
      if (tries < 3) await new Promise((r) => setTimeout(r, (tries + 1) * 500));
    }
  }
  throw last;
}
async function head(bucket, key) {
  try { return await call(new HeadObjectCommand({ Bucket: bucket, Key: key })); }
  catch (e) { if (isMissing(e)) return null; throw e; }
}
async function readLive() {
  const object = await call(new GetObjectCommand({ Bucket: publicBucket, Key: manifestKey }));
  const text = await object.Body.transformToString("utf8");
  const doc = readManifest(JSON.parse(text));
  checkPreviewStatus(doc);
  return { doc, text, sha: catalogFingerprint(text) };
}
async function writeLive(text) {
  await call(new PutObjectCommand({
    Bucket: publicBucket, Key: manifestKey, Body: Buffer.from(text, "utf8"),
    ContentType: "application/json; charset=utf-8", CacheControl: "no-cache",
  }));
  const fresh = await readLive();
  if (fresh.sha !== catalogFingerprint(text)) throw new Error("R2 catalog did not match our write. STOP; check backup before retrying.");
  return fresh;
}
function saveState(state) {
  fs.mkdirSync(stateDir, { recursive: true });
  const temp = activePath + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(state, null, 2), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temp, activePath);
}
function loadState() {
  return fs.existsSync(activePath) ? JSON.parse(fs.readFileSync(activePath, "utf8")) : null;
}
function loadMaster() {
  if (!fs.existsSync(privateMasterPath)) {
    console.log("WARN: Legacy original map not found at " + privateMasterPath);
    console.log("Older private originals may be unresolved. No mapping will be made public.");
    return new Map();
  }
  const master = JSON.parse(fs.readFileSync(privateMasterPath, "utf8"));
  return indexOriginals(master);
}
async function locateOriginal(image, index) {
  const candidates = sourceCandidates(image.id, index);
  for (const key of candidates) {
    if (!validateMasterKey(key)) continue;
    const metadata = await head(privateBucket, key);
    if (metadata) {
      if (!metadata.ContentLength || metadata.ContentLength < 1) return { id: image.id, error: "Empty original" };
      return { id: image.id, sourceKey: key, sourceHead: metadata, destKey: makeFreePublicKey(image.id, key) };
    }
  }
  return { id: image.id, error: "Private original not found" };
}
async function preflight(images, masterIndex) {
  const output = [];
  let current = 0;
  const concurrency = 4;
  await Promise.all(Array.from({ length: Math.min(concurrency, images.length) }, async () => {
    while (true) {
      const idx = current++;
      if (idx >= images.length) return;
      output[idx] = await locateOriginal(images[idx], masterIndex);
      if ((idx + 1) % 100 === 0) console.log("Checked " + (idx + 1) + "/" + images.length);
    }
  }));
  return output;
}
async function confirm(phrase) {
  if (flags.yes === "true") return; // For automated integration tests only; never enabled in Windows menu.
  if (!process.stdin.isTTY) throw new Error("Confirmation requires a live terminal");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const typed = await rl.question('Type "' + phrase + '" to continue: ');
    if (typed.trim() !== phrase) throw new Error("Cancelled; no further changes.");
  } finally { rl.close(); }
}
async function startBackup(live) {
  const existing = loadState();
  if (existing) {
    if (existing.publicBucket !== publicBucket || existing.privateBucket !== privateBucket) throw new Error("Previous backup belongs to different R2 buckets");
    if (existing.lastSha !== live.sha && !(mode === "restore" && existing.originalSha === live.sha)) {
      throw new Error("R2 catalog changed outside this tool. Stopped to protect concurrent edits.");
    }
    return existing;
  }
  const sessionId = new Date().toISOString().replace(/[-:.TZ]/g, "") + "-" + randomUUID().slice(0, 8);
  const backupKey = "rxv-free-release-backups/" + sessionId + "/images-public.json";
  const state = {
    version: 1, sessionId, createdAt: new Date().toISOString(),
    publicBucket, privateBucket, backupKey,
    originalText: live.text, originalSha: live.sha, lastSha: live.sha, ownedKeys: [], processedIds: [],
  };
  fs.mkdirSync(stateDir, { recursive: true });
  const backupFile = path.join(stateDir, "rxv-original-catalog-" + sessionId + ".json");
  fs.writeFileSync(backupFile, live.text, { encoding: "utf8", flag: "wx", mode: 0o600 });
  await call(new PutObjectCommand({
    Bucket: privateBucket, Key: backupKey, Body: Buffer.from(live.text, "utf8"),
    ContentType: "application/json; charset=utf-8", CacheControl: "private, no-store",
  }));
  saveState(state);
  console.log("Backup saved locally: " + backupFile);
  console.log("Backup saved in PRIVATE R2: " + backupKey);
  return state;
}
function copySource(bucket, key) {
  return "/" + bucket + "/" + key.split("/").map(encodeURIComponent).join("/");
}
async function makeOriginalPublic(item, state) {
  const source = item.sourceHead;
  const existing = await head(publicBucket, item.destKey);
  if (existing) {
    if (!state.ownedKeys.includes(item.destKey) &&
        (existing.ContentLength !== source.ContentLength || !existing.ETag || existing.ETag !== source.ETag)) {
      throw new Error("Public destination collision; refusing to overwrite: " + item.destKey);
    }
  } else {
    // Reserve and persist the exact public key BEFORE copying, so rollback
    // can remove it even if the process exits immediately after R2 copy.
    if (!state.ownedKeys.includes(item.destKey)) {
      state.ownedKeys.push(item.destKey);
      saveState(state);
    }
    await call(new CopyObjectCommand({
      Bucket: publicBucket, Key: item.destKey,
      CopySource: copySource(privateBucket, item.sourceKey),
      ContentType: contentTypeFor(item.sourceKey), MetadataDirective: "REPLACE",
      CacheControl: "public, max-age=31536000, immutable",
    }));
  }
  const verified = await head(publicBucket, item.destKey);
  if (!verified || verified.ContentLength !== source.ContentLength) {
    throw new Error("Original copy not verified: " + item.id);
  }
  return publicUrl(publicBase, item.destKey);
}
async function doPreview(live, index) {
  const count = checkPreviewStatus(live.doc);
  const unknownLegacy = live.doc.images.filter((v) => imageNeedsPublish(v, publicBase) && !index.has(v.id)).length;
  console.log(JSON.stringify({ mode: "preview", counts: count, mappedOriginals: index.size,
    lockedWithoutLegacyMapping: unknownLegacy, sourceFile: privateMasterPath,
    previewOnly: true, changesMade: false }, null, 2));
  const subset = live.doc.images.filter((v) => imageNeedsPublish(v, publicBase)).slice(0, 10);
  console.log("Checking up to 10 locked originals...");
  const results = await preflight(subset, index);
  console.log(JSON.stringify({ sampleResolved: results.filter((v) => v.sourceKey).length,
    sampleMissingIds: results.filter((v) => v.error).map((v) => v.id) }, null, 2));
}
async function doRelease(live, index) {
  if (!live.doc.images.some((v) => imageNeedsPublish(v, publicBase))) {
    console.log("All catalog images are already free. Nothing to change.");
    return;
  }
  const locked = live.doc.images.filter((v) => imageNeedsPublish(v, publicBase));
  const target = mode === "test" ? locked.slice(0, chunkSize) : locked;
  const plan = await preflight(target, index);
  const missing = plan.filter((item) => !item.sourceKey);
  if (missing.length) {
    console.log(JSON.stringify({ missingOriginalCount: missing.length, missingSamples: missing.slice(0, 20), mode, changesMade: false }, null, 2));
    throw new Error("Some private originals are missing. Nothing changed in this run. Supply your local private-data/images-master.json for legacy images.");
  }
  const state = loadState();
  if (state && live.sha !== state.lastSha) throw new Error("R2 catalog changed outside tool; no changes made");
  console.log("Verified all selected originals: " + plan.length);
  console.log("THIS WILL PUBLISH ORIGINAL-SIZE IMAGES TO THE PUBLIC R2 BUCKET.");
  await confirm(mode === "test" ? "TEST 10" : "FREE ALL");
  let active = await startBackup(live);
  let current = live;
  for (let offset = 0; offset < plan.length; offset += chunkSize) {
    const chunk = plan.slice(offset, offset + chunkSize);
    const latest = await readLive();
    if (latest.sha !== active.lastSha) throw new Error("Catalog changed during batch. Stopped before next update.");
    const changedUrls = new Map();
    for (const item of chunk) changedUrls.set(item.id, await makeOriginalPublic(item, active));
    const nextImages = latest.doc.images.map((image) => changedUrls.has(image.id)
      ? changeToFree(image, changedUrls.get(image.id))
      : image);
    const nextText = JSON.stringify(rebuildManifest(latest.doc, nextImages), null, 2) + "\n";
    current = await writeLive(nextText);
    for (const item of chunk) {
      const nowFree = current.doc.images.find((img) => img.id === item.id);
      if (!imageIsFree(nowFree) || nowFree.download_url !== changedUrls.get(item.id)) {
        throw new Error("Post-write verification failed for " + item.id);
      }
    }
    active.lastSha = current.sha;
    active.processedIds.push(...chunk.map((item) => item.id));
    saveState(active);
    console.log("Published " + Math.min(offset + chunk.length, plan.length) + "/" + plan.length
      + "; remaining locked=" + checkPreviewStatus(current.doc).locked);
  }
  console.log("DONE. Backup retained for rollback. Never delete " + activePath + " before restore.");
}
async function doRestore(live) {
  const state = loadState();
  if (!state) throw new Error("No active backup to restore");
  if (state.publicBucket !== publicBucket || state.privateBucket !== privateBucket) throw new Error("Backup bucket mismatch");
  if (live.sha !== state.lastSha && live.sha !== state.originalSha) throw new Error("Catalog was modified by another process; refusing to overwrite edits");
  await confirm("RESTORE");
  if (live.sha !== state.originalSha) {
    console.log("Restoring original public catalog...");
    await writeLive(state.originalText);
  }
  // Never remove R2 keys unless they were first reserved by this tool.
  const originalCatalog = readManifest(JSON.parse(state.originalText));
  const oldText = JSON.stringify(originalCatalog.root);
  for (const key of state.ownedKeys) {
    const matching = key.match(/^free\/originals\/([a-f0-9-]{16,64})\.(jpg|jpeg|png|webp)$/i);
    if (!matching) throw new Error("Unsafe rollback object key " + key);
    if (oldText.includes(publicUrl(publicBase, key))) continue;
    await call(new DeleteObjectCommand({ Bucket: publicBucket, Key: key }));
    console.log("Removed published original: " + key);
  }
  const historyPath = path.join(stateDir, "restored-" + state.sessionId + ".json");
  fs.writeFileSync(historyPath, JSON.stringify({ ...state, restoredAt: new Date().toISOString() }, null, 2), { encoding: "utf8", flag: "wx", mode: 0o600 });
  fs.unlinkSync(activePath);
  console.log("RESTORED. Local and private R2 backups are retained.");
}

async function main() {
  console.log("RXV Image Free Release QA | Mode: " + mode);
  console.log("Public bucket: " + publicBucket + " | Private bucket: " + privateBucket);
  const live = await readLive();
  const index = loadMaster();
  const count = checkPreviewStatus(live.doc);
  const incomplete = live.doc.images.filter((v) => imageNeedsPublish(v, publicBase)).length;
  console.log("Live catalog " + count.total + " | free " + count.free + " | locked " + count.locked + " | requiring download setup " + incomplete);
  if (mode === "preview") await doPreview(live, index);
  else if (mode === "restore") await doRestore(live);
  else await doRelease(live, index);
}
main().catch((error) => { console.error("STOP: " + (error?.message || error)); process.exitCode = 1; });
