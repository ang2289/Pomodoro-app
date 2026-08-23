import fs from "node:fs";
import https from "node:https";
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
import { NodeHttpHandler } from "@smithy/node-http-handler";

// Load the checked-in local settings last, so the current local R2 token wins.
const env = {
  ...(fs.existsSync(".env") ? dotenv.parse(fs.readFileSync(".env")) : {}),
  ...(fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {}),
};

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
const missing = required.filter((name) => !env[name]);
if (missing.length) throw new Error(`R2_ENV_MISSING:${missing.join(",")}`);

const sourceBucket = env.R2_PRIVATE_BUCKET_NAME || env.R2_BUCKET_NAME || env.R2_BUCKET;
const publicBucket = env.R2_PUBLIC_BUCKET_NAME;
const publicBaseUrl = String(env.R2_PUBLIC_BASE_URL || env.R2_PUBLIC_URL || "").replace(/\/$/, "");
if (!sourceBucket || !publicBucket || !publicBaseUrl) {
  throw new Error("R2_BUCKET_OR_PUBLIC_URL_MISSING");
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  requestHandler: new NodeHttpHandler({
    // Avoid the Windows/OpenSSL TLS-session error seen during bulk CopyObject calls.
    httpsAgent: new https.Agent({ keepAlive: false, maxCachedSessions: 0, maxSockets: 1 }),
  }),
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function request(command) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await client.send(command);
    } catch (error) {
      lastError = error;
      if (attempt === 5) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  throw lastError;
}

const masterPath = path.resolve("private-data/images-master.json");
const fallbackManifestPath = path.resolve("public/data/images-public.json");
const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const images = Array.isArray(master.images) ? master.images : [];
if (images.length !== 1583 || new Set(images.map((image) => image.id)).size !== 1583) {
  throw new Error("MASTER_COUNT_OR_IDS_INVALID");
}

const freeImages = images.filter((image) => image.plan_type === "free");
if (freeImages.length !== 37) throw new Error("FREE_IMAGE_COUNT_INVALID");
const args = new Set(process.argv.slice(2));

function extensionFor(key) {
  const match = String(key || "").match(/\.([a-z0-9]+)$/i);
  if (!match || !/^(jpg|jpeg|png|webp)$/i.test(match[1])) throw new Error(`UNSAFE_IMAGE_EXTENSION:${key}`);
  return match[1].toLowerCase();
}

function publicUrlFor(key) {
  return `${publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function copySourceFor(key) {
  return `/${sourceBucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function copy(sourceKey, destinationKey, contentType) {
  try {
    await request(new HeadObjectCommand({ Bucket: publicBucket, Key: destinationKey }));
    return "existing";
  } catch (error) {
    if (error?.name !== "NotFound" && error?.$metadata?.httpStatusCode !== 404) throw error;
  }
  await request(new CopyObjectCommand({
    Bucket: publicBucket,
    Key: destinationKey,
    CopySource: copySourceFor(sourceKey),
    ContentType: contentType,
    MetadataDirective: "REPLACE",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return "copied";
}

async function runPool(items, worker, concurrency = 3) {
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      await worker(items[current]);
    }
  });
  await Promise.all(workers);
}

const freePublicKeys = new Map(
  freeImages.map((image) => [image.id, `free/originals/${image.id}.${extensionFor(image.original_key)}`]),
);
const migrationAssets = [
  ...images.map((image) => ({
    sourceKey: image.thumbnail_key,
    destinationKey: image.thumbnail_key,
    contentType: "image/webp",
  })),
  ...freeImages.map((image) => ({
    sourceKey: image.original_key,
    destinationKey: freePublicKeys.get(image.id),
    contentType: `image/${extensionFor(image.original_key) === "jpg" ? "jpeg" : extensionFor(image.original_key)}`,
  })),
];

const batchArg = process.argv.find((arg) => arg.startsWith("--batch="));
if (batchArg) {
  const [offsetText, limitText = "10"] = batchArg.slice("--batch=".length).split(":");
  const offset = Number(offsetText);
  const limit = Number(limitText);
  if (!Number.isInteger(offset) || !Number.isInteger(limit) || offset < 0 || limit < 1) {
    throw new Error("BATCH_ARGUMENT_INVALID");
  }
  const batch = migrationAssets.slice(offset, offset + limit);
  await runPool(batch, async (asset) => {
    await copy(asset.sourceKey, asset.destinationKey, asset.contentType);
  }, 1);
  console.log(JSON.stringify({ batchOffset: offset, copied: batch.length, totalAssets: migrationAssets.length }));
  process.exit(0);
}

const thumbnailResults = { copied: 0, existing: 0 };
if (!args.has("--finalize")) {
  await runPool(images, async (image) => {
    if (!image.thumbnail_key || !String(image.thumbnail_key).startsWith("thumbnails/")) {
      throw new Error(`THUMBNAIL_KEY_INVALID:${image.id}`);
    }
    const status = await copy(image.thumbnail_key, image.thumbnail_key, "image/webp");
    thumbnailResults[status] += 1;
  });
}

const freeResults = { copied: 0, existing: 0 };
if (!args.has("--finalize")) {
  await runPool(freeImages, async (image) => {
    const extension = extensionFor(image.original_key);
    const key = freePublicKeys.get(image.id);
    const status = await copy(image.original_key, key, `image/${extension === "jpg" ? "jpeg" : extension}`);
    freeResults[status] += 1;
  });
}

const publicImages = images.map((image) => {
  const planType = image.plan_type === "free" ? "free" : "bundle";
  const item = {
    id: image.id,
    title: image.title || "圖片素材",
    category: image.category || image.category_id || "other",
    category_id: image.category_id || image.category || "other",
    category_name: image.category_name || "其他素材",
    thumbnail_url: publicUrlFor(image.thumbnail_key),
    preview_url: publicUrlFor(image.thumbnail_key),
    plan_type: planType,
  };
  if (planType === "free") item.download_url = publicUrlFor(freePublicKeys.get(image.id));
  return item;
});

const publicJson = JSON.stringify(publicImages, null, 2) + "\n";
const forbidden = /original_key|original_url|R2_SECRET|R2_ACCESS|private\//i;
if (forbidden.test(publicJson)) throw new Error("PUBLIC_MANIFEST_LEAK_BLOCKED");

await request(new PutObjectCommand({
  Bucket: publicBucket,
  Key: "catalog/images-public.json",
  Body: publicJson,
  ContentType: "application/json; charset=utf-8",
  CacheControl: "no-cache",
}));

// Retain the exact same sanitized catalog as the emergency Vercel fallback.
fs.writeFileSync(fallbackManifestPath, publicJson, "utf8");

async function listImageCount(prefix) {
  let continuationToken;
  let count = 0;
  do {
    const page = await request(new ListObjectsV2Command({
      Bucket: publicBucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    count += (page.Contents || []).filter((item) => /\.(jpg|jpeg|png|webp)$/i.test(item.Key || "")).length;
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
  return count;
}

const publicThumbnailCount = await listImageCount("thumbnails/");
const publicFreeCount = await listImageCount("free/originals/");

const result = {
  publicManifestCount: publicImages.length,
  publicThumbnailCount,
  publicFreeOriginalCount: publicFreeCount,
  publicBundleOriginalCount: 0,
  thumbnailCopies: thumbnailResults,
  freeOriginalCopies: freeResults,
};
console.log(JSON.stringify(result));
