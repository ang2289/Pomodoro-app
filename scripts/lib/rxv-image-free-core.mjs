import { createHash } from "node:crypto";

const SAFE_ID = /^[a-f0-9-]{16,64}$/i;
const SAFE_ORIGINAL = /^(?:originals\/by-image-id\/[a-f0-9-]{16,64}\/original|images\/originals\/\d{4}\/\d{2}\/[a-z0-9-]+)\.(?:jpg|jpeg|png|webp)$/i;

export function readManifest(parsed) {
  if (Array.isArray(parsed)) return { root: parsed, images: parsed, field: "array" };
  for (const field of ["images", "data", "items"]) {
    if (Array.isArray(parsed?.[field])) return { root: parsed, images: parsed[field], field };
  }
  throw new Error("Manifest must be an array or contain images/data/items");
}

export function rebuildManifest(doc, images) {
  if (doc.field === "array") return images;
  return { ...doc.root, [doc.field]: images, ...(Object.hasOwn(doc.root, "count") ? { count: images.length } : {}), ...(Object.hasOwn(doc.root, "total") ? { total: images.length } : {}) };
}

export function validateId(id) {
  return typeof id === "string" && SAFE_ID.test(id);
}

export function imageIsFree(image) {
  if (image?.price_type && image.price_type !== "free") return false;
  if (image?.plan_type && image.plan_type !== "free") return false;
  if (image?.is_free === false) return false;
  return image?.price_type === "free" || image?.plan_type === "free" || image?.is_free === true;
}

export function validateMasterKey(key) {
  return typeof key === "string" && SAFE_ORIGINAL.test(key) && !key.includes("..");
}

export function extensionFor(key) {
  const match = String(key).match(/\.(jpg|jpeg|png|webp)$/i);
  if (!match) throw new Error("Unsupported image extension: " + key);
  return match[1].toLowerCase();
}

export function contentTypeFor(key) {
  const ext = extensionFor(key);
  return "image/" + (ext === "jpg" ? "jpeg" : ext);
}

export function makeFreePublicKey(id, sourceKey) {
  if (!validateId(id) || !validateMasterKey(sourceKey)) throw new Error("Invalid image ID or source key");
  return "free/originals/" + id + "." + extensionFor(sourceKey);
}

export function publicUrl(base, key) {
  const u = new URL(base);
  if (u.protocol !== "https:" || u.username || u.password || /\.r2\.cloudflarestorage\.com$/i.test(u.hostname)) {
    throw new Error("Public R2 URL must be HTTPS public asset domain");
  }
  return base.replace(/\/+$/, "") + "/" + key.split("/").map(encodeURIComponent).join("/");
}

export function changeToFree(image, downloadUrl) {
  if (!validateId(image?.id) || !downloadUrl?.startsWith("https://")) throw new Error("Unsafe free image record");
  return { ...image, price_type: "free", plan_type: "free", is_free: true, download_url: downloadUrl };
}

export function indexOriginals(master) {
  const records = Array.isArray(master) ? master : (Array.isArray(master?.images) ? master.images : []);
  return new Map(records.filter((v) => validateId(v?.id) && validateMasterKey(v?.original_key)).map((v) => [v.id, v.original_key]));
}

export function sourceCandidates(id, index) {
  if (!validateId(id)) return [];
  const known = index.get(id);
  if (known) return [known];
  return ["jpg", "jpeg", "png", "webp"].map((ext) => "originals/by-image-id/" + id + "/original." + ext);
}

export function imageNeedsPublish(image, publicBase) {
  // An existing free badge is insufficient unless the file has a real
  // publicly downloadable original. API-proxy URLs still cost Vercel.
  const url = String(image?.download_url || "");
  const prefix = publicBase.replace(/\/+$/, "") + "/free/originals/" + image?.id + ".";
  return !imageIsFree(image) || !url.startsWith(prefix) || !/\.(jpg|jpeg|png|webp)$/i.test(url);
}

export function catalogFingerprint(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function validateCatalogIds(doc) {
  const ids = doc.images.map((v) => v?.id);
  if (ids.some((id) => !validateId(id))) throw new Error("Invalid image ID in catalog");
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate image ID in catalog");
}

export function plannedLockedImages(doc) {
  validateCatalogIds(doc);
  return doc.images.filter((img) => !imageIsFree(img));
}

export function checkPreviewStatus(doc) {
  validateCatalogIds(doc);
  const free = doc.images.filter(imageIsFree).length;
  return { total: doc.images.length, free, locked: doc.images.length - free };
}
