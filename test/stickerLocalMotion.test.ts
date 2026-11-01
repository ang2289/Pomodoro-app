import test from "node:test";
import assert from "node:assert/strict";
import {
  LOCAL_MOTION_ORDER, isLocalStickerMotion, localMotionPose, pickLocalStickerMotion,
} from "../src/lib/stickerLocalMotion";

test("five local motion presets are distinct and available", () => {
  assert.deepEqual(LOCAL_MOTION_ORDER, ["wave", "nod", "blink", "busy", "cheer"]);
  for (const preset of LOCAL_MOTION_ORDER) assert.equal(isLocalStickerMotion(preset), true);
  assert.equal(isLocalStickerMotion("pulse"), false);
});

test("sticker text selects its intended local animation", () => {
  const cases = [
    ["您好", "wave"], ["謝謝家長", "wave"],
    ["收到", "nod"], ["好的", "nod"],
    ["請您放心", "blink"], ["辛苦了", "blink"],
    ["稍等一下", "busy"], ["忙碌中", "busy"],
    ["加油撐住", "cheer"], ["已完成", "cheer"],
  ] as const;
  for (const [text, expected] of cases)
    assert.equal(pickLocalStickerMotion(text, 0), expected, text);
});

test("no caption rotates all five local motions", () => {
  assert.deepEqual(Array.from({ length: 10 }, (_, i) => pickLocalStickerMotion("", i)),
    [...LOCAL_MOTION_ORDER, ...LOCAL_MOTION_ORDER]);
});

test("eight poses loop with no character-wide scale transforms", () => {
  for (const preset of LOCAL_MOTION_ORDER) {
    const poses = Array.from({ length: 8 }, (_, i) => localMotionPose(preset, i));
    assert.deepEqual(poses[0], poses[7], preset + " should close the loop");
    assert.ok(new Set(poses.map((pose) => JSON.stringify(pose))).size >= 5,
      preset + " should provide five distinct poses");
    assert.ok(poses.some((pose) => Object.values(pose).some((value) => value !== 0)),
      preset + " must move a local body region");
    assert.ok(poses.every((pose) => pose.eyesClose >= 0 && pose.eyesClose <= 1));
  }
});
