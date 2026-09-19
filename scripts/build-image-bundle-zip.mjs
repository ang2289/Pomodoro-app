import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";
import dotenv from "dotenv";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });

const masterPath = path.join(root, "private-data", "images-master.json");
const outputDir = path.join(root, "outputs");
const outputName = "RXV_高畫質圖片素材庫_1583張.zip";
const outputPath = path.join(outputDir, outputName);
const partialPath = `${outputPath}.partial`;
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function fail(message) {
  throw new Error(message);
}

function validateMaster(images) {
  if (!Array.isArray(images) || images.length !== 1583) {
    fail(`Master image count must be 1583; received ${Array.isArray(images) ? images.length : "invalid"}.`);
  }

  const ids = new Set();
  const keys = new Set();
  for (const image of images) {
    const id = String(image?.id || "").trim();
    const key = String(image?.original_key || "").trim();
    const ext = path.extname(key).toLowerCase();
    if (!id || !key) fail("Master contains an image without id or original_key.");
    if (ids.has(id)) fail(`Master contains duplicate image id: ${id}`);
    if (keys.has(key)) fail(`Master contains duplicate original_key for image id: ${id}`);
    if (!imageExtensions.has(ext)) fail(`Master has an unsupported original extension for image id: ${id}`);
    if (/thumbnail|preview|(^|\/)private\//i.test(key) || /(?:test|codex|\.zip)(?:\/|$)/i.test(key)) {
      fail(`Master original_key is not a permitted original image for image id: ${id}`);
    }
    ids.add(id);
    keys.add(key);
  }
  return { ids, keys };
}

function createR2Client() {
  const bucketName = String(process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "").trim();
  const required = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ];
  const missing = required.filter((name) => !String(process.env[name] || "").trim());
  if (!bucketName) missing.push("R2_BUCKET_NAME");
  if (missing.length) fail(`Missing local R2 environment variables: ${missing.join(", ")}`);

  return {
    bucketName,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    }),
  };
}

async function downloadOriginalWithRetry(r2, bucketName, image, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await r2.send(
        new GetObjectCommand({ Bucket: bucketName, Key: image.original_key }),
      );
      if (!result.Body || !result.ContentLength || result.ContentLength <= 0) {
        fail(`R2 original is unavailable for image id: ${image.id}`);
      }
      const chunks = [];
      for await (const chunk of result.Body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks);
      if (body.length !== result.ContentLength) {
        fail(`R2 original length mismatch for image id: ${image.id}`);
      }
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 750));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("R2 download failed");
}

function appendArchiveEntry(archive, body, entryName) {
  return new Promise((resolve, reject) => {
    const onEntry = (entry) => {
      if (entry.name !== entryName) return;
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      archive.off("entry", onEntry);
      archive.off("error", onError);
    };
    archive.on("entry", onEntry);
    archive.once("error", onError);
    archive.append(body, { name: entryName });
  });
}

async function main() {
  const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
  const images = master.images;
  const { ids: masterIds } = validateMaster(images);
  const { client: r2, bucketName } = createR2Client();

  fs.mkdirSync(outputDir, { recursive: true });
  fs.rmSync(partialPath, { force: true });

  const output = fs.createWriteStream(partialPath, { flags: "wx" });
  const archive = archiver("zip", { zlib: { level: 9 } });
  const archiveErrors = [];
  archive.on("warning", (error) => archiveErrors.push(error));
  archive.on("error", (error) => archiveErrors.push(error));
  output.on("error", (error) => archiveErrors.push(error));
  archive.pipe(output);

  const downloadedIds = new Set();
  const zipNames = new Set();
  const failures = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const ext = path.extname(image.original_key).toLowerCase();
    const entryName = `${image.id}_original${ext}`;
    if (zipNames.has(entryName)) fail(`Duplicate ZIP filename: ${entryName}`);

    try {
      const body = await downloadOriginalWithRetry(r2, bucketName, image);
      await appendArchiveEntry(archive, body, entryName);
      downloadedIds.add(image.id);
      zipNames.add(entryName);
    } catch (error) {
      failures.push({ id: image.id, message: error instanceof Error ? error.message : "R2 download failed" });
      break;
    }

    if ((index + 1) % 100 === 0 || index + 1 === images.length) {
      console.log(`ZIP progress: ${index + 1}/${images.length}`);
    }
  }

  if (failures.length || archiveErrors.length) {
    archive.abort();
    output.destroy();
    fs.rmSync(partialPath, { force: true });
    const failure = failures[0] || { id: "archive", message: archiveErrors[0]?.message || "ZIP stream failed" };
    fail(`ZIP aborted at ${failure.id}: ${failure.message}`);
  }

  const finalized = new Promise((resolve, reject) => {
    output.once("close", resolve);
    output.once("error", reject);
    archive.finalize().catch(reject);
  });
  await finalized;
  if (archiveErrors.length) {
    fs.rmSync(partialPath, { force: true });
    fail(`ZIP archive failed: ${archiveErrors[0].message}`);
  }

  fs.rmSync(outputPath, { force: true });
  fs.renameSync(partialPath, outputPath);
  const zipSize = fs.statSync(outputPath).size;
  const missingFromZip = [...masterIds].filter((id) => !downloadedIds.has(id));
  console.log(JSON.stringify({
    masterCount: masterIds.size,
    r2DownloadSuccess: downloadedIds.size,
    r2DownloadFailed: failures.length,
    zipImageCount: zipNames.size,
    zipDuplicateCount: zipNames.size - new Set(zipNames).size,
    zipMissingFromMaster: [...downloadedIds].filter((id) => !masterIds.has(id)).length,
    masterMissingFromZip: missingFromZip.length,
    zipSize,
    outputPath,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
