import test from "node:test";
import assert from "node:assert/strict";
import {
  readManifest, rebuildManifest, checkPreviewStatus, imageIsFree,
  indexOriginals, sourceCandidates, validateMasterKey, changeToFree, imageNeedsPublish,
  publicUrl, makeFreePublicKey, plannedLockedImages, catalogFingerprint,
} from "../scripts/lib/rxv-image-free-core.mjs";

const id1 = "11111111-1111-4111-8111-111111111111";
const id2 = "22222222-2222-4222-8222-222222222222";
const id3 = "33333333-3333-4333-8333-333333333333";
const locked = { id: id1, title: "clinic", plan_type: "bundle", price_type: "bundle", is_free: false, thumbnail_url: "https://example.org/thumb.webp" };
const free = { id: id2, plan_type: "free", price_type: "free", is_free: true, download_url: "https://example.org/free.jpg" };

test("readManifest supports legacy array and current object while keeping categories", () => {
  const old = readManifest([locked, free]);
  assert.equal(old.field, "array");
  assert.equal(checkPreviewStatus(old).locked, 1);
  const next = readManifest({ version: 3, count: 2, categories: ["flowers"], images: [locked, free] });
  assert.deepEqual(rebuildManifest(next, [free]), { version: 3, count: 1, categories: ["flowers"], images: [free] });
});

test("only a truly free record is considered downloadable", () => {
  assert.equal(imageIsFree(locked), false);
  assert.equal(imageIsFree(free), true);
  assert.equal(imageIsFree({ ...free, is_free: false }), false);
  assert.equal(imageIsFree({ ...locked, price_type: "free" }), false);
  assert.equal(imageIsFree({ ...locked, plan_type: "free" }), false);
});

test("free update preserves title thumbnail category and inserts direct URL", () => {
  const changed = changeToFree(locked, "https://assets.example.org/free/originals/" + id1 + ".png");
  assert.equal(changed.plan_type, "free");
  assert.equal(changed.price_type, "free");
  assert.equal(changed.is_free, true);
  assert.equal(changed.title, "clinic");
  assert.equal(changed.thumbnail_url, locked.thumbnail_url);
  assert.match(changed.download_url, /free\/originals/);
  assert.equal(locked.plan_type, "bundle");
});

test("never expose private source path or R2 S3 credentials in public manifest", () => {
  const sourceKey = "images/originals/2026/08/" + id1 + ".jpg";
  assert.equal(validateMasterKey(sourceKey), true);
  assert.equal(validateMasterKey("../../secret"), false);
  assert.equal(validateMasterKey("originals/" + id1 + ".txt"), false);
  const publicKey = makeFreePublicKey(id1, sourceKey);
  assert.equal(publicKey, "free/originals/" + id1 + ".jpg");
  const downloadUrl = publicUrl("https://cdn.example.com", publicKey);
  assert.equal(downloadUrl, "https://cdn.example.com/free/originals/" + id1 + ".jpg");
  assert.ok(!JSON.stringify(changeToFree(locked, downloadUrl)).includes(sourceKey));
  assert.throws(() => publicUrl("http://example.com", publicKey), /HTTPS/);
  assert.throws(() => publicUrl("https://my.r2.cloudflarestorage.com", publicKey), /HTTPS/);
});

test("legacy map and deterministic new uploads are resolved separately", () => {
  const legacyKey = "images/originals/2026/08/" + id1 + ".webp";
  const index = indexOriginals({ images: [{ id: id1, original_key: legacyKey }] });
  assert.deepEqual(sourceCandidates(id1, index), [legacyKey]);
  assert.deepEqual(sourceCandidates(id3, index), [
    "originals/by-image-id/" + id3 + "/original.jpg",
    "originals/by-image-id/" + id3 + "/original.jpeg",
    "originals/by-image-id/" + id3 + "/original.png",
    "originals/by-image-id/" + id3 + "/original.webp",
  ]);
});

test("catalog with duplicate IDs is blocked instead of modifying unknown entries", () => {
  assert.throws(() => plannedLockedImages(readManifest([locked, locked])), /Duplicate/);
  assert.deepEqual(plannedLockedImages(readManifest([locked, free])), [locked]);
});

test("fingerprint changes when the actual catalog bytes change", () => {
  const a = catalogFingerprint(JSON.stringify([locked, free]));
  const b = catalogFingerprint(JSON.stringify([free, locked]));
  assert.notEqual(a, b);
});


test("a free badge without a direct R2 download URL must be repaired", () => {
  const cdn = "https://assets.example.org";
  assert.equal(imageNeedsPublish(locked, cdn), true);
  assert.equal(imageNeedsPublish(free, cdn), true);
  const downloadable = changeToFree(locked, cdn + "/free/originals/" + id1 + ".png");
  assert.equal(imageNeedsPublish(downloadable, cdn), false);
  assert.equal(imageNeedsPublish({ ...downloadable, download_url: "" }, cdn), true);
});
