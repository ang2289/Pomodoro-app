import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

dotenv.config({ path: path.resolve(".env.local"), override: true });

const env = process.env;
const accountId = String(env.R2_ACCOUNT_ID || "").trim();
const accessKeyId = String(env.R2_ACCESS_KEY_ID || "").trim();
const secretAccessKey = String(env.R2_SECRET_ACCESS_KEY || "").trim();
const privateBucket = String(env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging").trim();
const publicBucket = String(env.R2_PUBLIC_BUCKET_NAME || "rxv-healing-images-public").trim();
const publicBase = String(env.R2_PUBLIC_ASSET_URL || env.VITE_PUBLIC_R2_URL || "").replace(/\/$/, "");
const manifestKey = "catalog/images-public.json";

for (const [name, value] of Object.entries({
  R2_ACCOUNT_ID: accountId,
  R2_ACCESS_KEY_ID: accessKeyId,
  R2_SECRET_ACCESS_KEY: secretAccessKey,
  R2_PUBLIC_ASSET_URL: publicBase,
})) {
  if (!value) throw new Error(`ENV_MISSING:${name}`);
}

if (!/^https:\/\//i.test(publicBase) || /r2\.cloudflarestorage\.com/i.test(publicBase)) {
  throw new Error("R2_PUBLIC_ASSET_URL_INVALID");
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function bodyToText(body) {
  if (!body) throw new Error("EMPTY_BODY");
  if (typeof body.transformToString === "function") return body.transformToString("utf-8");
  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function parseCatalog(raw) {
  if (Array.isArray(raw)) return { root: raw, images: raw, field: "array" };
  for (const field of ["images", "data", "items"]) {
    if (Array.isArray(raw?.[field])) return { root: raw, images: raw[field], field };
  }
  throw new Error("CATALOG_FORMAT_INVALID");
}

function rebuild(doc, images) {
  if (doc.field === "array") return images;
  return { ...doc.root, images: doc.field === "images" ? images : doc.root.images, data: doc.field === "data" ? images : doc.root.data, items: doc.field === "items" ? images : doc.root.items, total: images.length, updated_at: new Date().toISOString() };
}

function safeText(v) { return String(v ?? "").trim(); }
function planType(image) {
  return safeText(image?.price_type || image?.plan_type).toLowerCase() === "free" ? "free" : "bundle";
}
function extFromKey(key) {
  const m = safeText(key).match(/\.([a-z0-9]+)$/i);
  const ext = safeText(m?.[1]).toLowerCase();
  return ["jpg","jpeg","png","webp"].includes(ext) ? ext : "";
}
function publicUrlFor(key) {
  return `${publicBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
function keyFromPublicUrl(value) {
  try {
    const url = new URL(safeText(value));
    const base = new URL(publicBase);
    if (url.origin !== base.origin) return "";
    return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
}
async function exists(bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (e) {
    const status = e?.$metadata?.httpStatusCode;
    if (status === 404 || e?.name === "NotFound" || e?.name === "NoSuchKey") return false;
    throw e;
  }
}
async function findPrivateSource(id) {
  const prefix = `originals/by-image-id/${id}/`;
  const listed = await client.send(new ListObjectsV2Command({
    Bucket: privateBucket,
    Prefix: prefix,
    MaxKeys: 20,
  }));
  return (listed.Contents || [])
    .map((x) => safeText(x?.Key))
    .find((key) => /^original\.(?:jpg|jpeg|png|webp)$/i.test(key.slice(prefix.length))) || "";
}
async function copyToPublic(sourceKey, destKey, contentType) {
  const copySource = `/${privateBucket}/${sourceKey.split("/").map(encodeURIComponent).join("/")}`;
  await client.send(new CopyObjectCommand({
    Bucket: publicBucket,
    Key: destKey,
    CopySource: copySource,
    ContentType: contentType,
    MetadataDirective: "REPLACE",
    CacheControl: "public, max-age=31536000, immutable",
  }));
}

console.log("RXV 免費圖片原圖修復");
console.log("不顯示任何 R2 密鑰。");
console.log("--------------------------------");

const object = await client.send(new GetObjectCommand({ Bucket: publicBucket, Key: manifestKey }));
const raw = JSON.parse(await bodyToText(object.Body));
const doc = parseCatalog(raw);
const freeImages = doc.images.filter((image) => planType(image) === "free");

let alreadyOk = 0;
let repaired = 0;
let catalogFixed = 0;
const unresolved = [];
const nextImages = [...doc.images];

for (const image of freeImages) {
  const id = safeText(image?.id);
  if (!id) continue;

  let usableKey = "";
  const currentKey = keyFromPublicUrl(image?.download_url);
  if (currentKey && extFromKey(currentKey) && await exists(publicBucket, currentKey)) {
    usableKey = currentKey;
  }

  if (!usableKey) {
    for (const ext of ["webp","jpg","jpeg","png"]) {
      const key = `free/originals/${id}.${ext}`;
      if (await exists(publicBucket, key)) {
        usableKey = key;
        break;
      }
    }
  }

  if (usableKey) {
    alreadyOk += 1;
  } else {
    const sourceKey = await findPrivateSource(id);
    if (!sourceKey) {
      unresolved.push(id);
      continue;
    }
    const ext = extFromKey(sourceKey);
    const destKey = `free/originals/${id}.${ext}`;
    await copyToPublic(
      sourceKey,
      destKey,
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`,
    );
    usableKey = destKey;
    repaired += 1;
  }

  const index = nextImages.findIndex((row) => safeText(row?.id) === id);
  if (index >= 0) {
    const expectedUrl = publicUrlFor(usableKey);
    if (safeText(nextImages[index]?.download_url) !== expectedUrl) {
      nextImages[index] = {
        ...nextImages[index],
        plan_type: "free",
        price_type: "free",
        is_free: true,
        download_url: expectedUrl,
      };
      catalogFixed += 1;
    }
  }
}

if (repaired || catalogFixed) {
  const payload = rebuild(doc, nextImages);
  await client.send(new PutObjectCommand({
    Bucket: publicBucket,
    Key: manifestKey,
    Body: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
    ContentType: "application/json; charset=utf-8",
    CacheControl: "no-cache",
  }));
}

console.log(`免費圖片總數 : ${freeImages.length}`);
console.log(`原本正常     : ${alreadyOk}`);
console.log(`已補公開原圖 : ${repaired}`);
console.log(`已修 catalog : ${catalogFixed}`);
console.log(`仍找不到原圖 : ${unresolved.length}`);
if (unresolved.length) {
  console.log("仍找不到的 ID：");
  for (const id of unresolved.slice(0, 100)) console.log(`  ${id}`);
}
console.log("--------------------------------");
console.log(unresolved.length ? "修復未完全完成，請把上面的 ID 清單貼給 ChatGPT。" : "修復完成。");
