import test from "node:test";
import assert from "node:assert/strict";
import { buildMusicTimeline, combinePictureSelections, imageSelectionLimit } from "../src/lib/musicMvTimeline";

test("MP3 duration is master and QR tail stays inside it", () => {
  const duration = 200;
  const fps = 24;
  const timeline = buildMusicTimeline(duration, 20, fps, 3.2);
  assert.equal(timeline.totalFrames, duration * fps);
  assert.equal(timeline.finalFrames, Math.round(3.2 * fps));
  assert.equal(timeline.contentFrames + timeline.finalFrames, timeline.totalFrames);
  assert.equal(timeline.scenes.reduce((sum, x) => sum + x.frames, 0), timeline.contentFrames);
  assert.ok(Math.abs(timeline.totalSeconds - duration) <= 1 / fps);
});

test("all scenes remain contiguous even for VBR audio fractional seconds", () => {
  for (const fps of [15, 18, 24]) {
    const result = buildMusicTimeline(179.331, 9, fps, 3.2);
    assert.ok(Math.abs(result.totalSeconds - 179.331) <= 1 / fps);
    let startFrames = 0;
    for (const scene of result.scenes) {
      assert.ok(scene.frames > 0);
      assert.ok(Math.abs(scene.start - startFrames / fps) < 0.000001);
      assert.ok(Math.abs(scene.frames / fps - scene.duration) < 0.000001);
      assert.ok(scene.imageIndex >= 0 && scene.imageIndex < 9);
      startFrames += scene.frames;
    }
    assert.equal(startFrames, result.contentFrames);
  }
});

test("short songs clamp QR to leave at least one picture frame", () => {
  const result = buildMusicTimeline(2, 3, 24, 5);
  assert.equal(result.contentFrames, 1);
  assert.equal(result.finalFrames, 47);
  assert.equal(result.scenes.length, 1);
});

test("long songs repeat selected images without a silent gap", () => {
  const result = buildMusicTimeline(241, 5, 24, 0);
  assert.ok(result.scenes.length > 5);
  assert.equal(result.scenes[0].imageIndex, 0);
  assert.equal(result.scenes[5].imageIndex, 0);
  assert.ok(result.scenes.every(s => s.duration > 0));
});

test("missing audio or images cannot fabricate a timeline", () => {
  assert.equal(buildMusicTimeline(0, 8, 24).totalFrames, 0);
  assert.equal(buildMusicTimeline(120, 0, 24).scenes.length, 0);
  assert.equal(buildMusicTimeline(NaN, 5, 24).totalFrames, 0);
});

test("full-song mode accepts 48 desktop pictures, 24 on phones/fallback", () => {
  assert.equal(imageSelectionLimit("music", false, true), 48);
  assert.equal(imageSelectionLimit("music", true, true), 24);
  assert.equal(imageSelectionLimit("music", false, false), 24);
  assert.equal(imageSelectionLimit("slideshow", false, true), 12);
  assert.equal(imageSelectionLimit("slideshow", true, true), 12);
});

test("48 unique images fit a 188.8 second song, without extending duration", () => {
  const timeline = buildMusicTimeline(188.8, 48, 24, 3.2);
  assert.equal(timeline.scenes.length, 48);
  assert.deepEqual(timeline.scenes.map(s => s.imageIndex), Array.from({length: 48}, (_, i) => i));
  assert.equal(timeline.scenes.reduce((sum, scene) => sum + scene.frames, 0), timeline.contentFrames);
  assert.ok(Math.abs(timeline.totalSeconds - 188.8) < 1/24);
});

test("selecting a second 12-picture batch appends to the first without losing order", () => {
  const first = Array.from({ length: 12 }, (_, i) => `first-${i + 1}`);
  const next = Array.from({ length: 12 }, (_, i) => `second-${i + 1}`);
  const combined = combinePictureSelections(first, next, 48, "append");
  assert.equal(combined.length, 24);
  assert.deepEqual(combined.slice(0, 12), first);
  assert.deepEqual(combined.slice(12), next);
});

test("desktop MV can fill 48 images across four batches; overflows are ignored", () => {
  let selected: string[] = [];
  for (let batch = 0; batch < 4; batch += 1) {
    const incoming = Array.from({ length: 12 }, (_, i) => `img-${batch * 12 + i + 1}`);
    selected = combinePictureSelections(selected, incoming, 48, "append");
  }
  assert.equal(selected.length, 48);
  assert.equal(selected[0], "img-1");
  assert.equal(selected[47], "img-48");
  assert.deepEqual(combinePictureSelections(selected, ["too-many"], 48, "append"), selected);
});

test("mobile caps to 24 and replace and clear never append old frames", () => {
  const oldImages = Array.from({length: 12}, (_, i) => `old-${i}`);
  const next = Array.from({length: 30}, (_, i) => `new-${i}`);
  const limited = combinePictureSelections(oldImages, next, 24, "append");
  assert.equal(limited.length, 24);
  assert.deepEqual(limited.slice(0, 12), oldImages);
  assert.deepEqual(combinePictureSelections(oldImages, next, 48, "replace"), next);
  assert.deepEqual(combinePictureSelections(oldImages, [], 48, "replace"), []);
});
