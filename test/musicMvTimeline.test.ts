import test from "node:test";
import assert from "node:assert/strict";
import { buildMusicTimeline, imageSelectionLimit } from "../src/lib/musicMvTimeline";

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
