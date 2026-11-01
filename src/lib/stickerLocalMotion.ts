/**
 * TUTU local motion V2: animation from one flattened PNG.
 * Uses conservative, feathered local pixel warps instead of moving the whole sticker.
 * This is NOT true skeletal animation; independent face/arm layers still need
 * separate source artwork for perfectly accurate blinking or waving.
 */
export type LocalStickerMotion = "wave" | "nod" | "blink" | "busy" | "cheer";

export const LOCAL_MOTION_ORDER: readonly LocalStickerMotion[] =
  ["wave", "nod", "blink", "busy", "cheer"];

export function isLocalStickerMotion(value: string): value is LocalStickerMotion {
  return (LOCAL_MOTION_ORDER as readonly string[]).includes(value);
}

/** Caption is optional: handoff has phrases, image-only uploads rotate five styles. */
export function pickLocalStickerMotion(caption: string | undefined, index: number): LocalStickerMotion {
  const value = (caption || "").replace(/\s+/g, "");
  if (/忙|處理|準備|稍等|工作|開會|煮|做飯|打掃|洗衣|資料/.test(value)) return "busy";
  if (/加油|完成|太好|好棒|成功|恭喜|下班|開心/.test(value)) return "cheer";
  if (/放心|辛苦|沒事|平安|安心|休息|晚安|睡/.test(value)) return "blink";
  if (/好[的呀喔]|了解|知道|沒問題|確認|同意|可以|收到/.test(value)) return "nod";
  if (/你好|您好|謝謝|感謝|再見|歡迎|早安|哈囉|掰掰/.test(value)) return "wave";
  return LOCAL_MOTION_ORDER[((index % LOCAL_MOTION_ORDER.length) + LOCAL_MOTION_ORDER.length) % LOCAL_MOTION_ORDER.length];
}

export type LocalMotionPose = {
  headX: number; headY: number;
  leftX: number; leftY: number;
  rightX: number; rightY: number;
  eyesClose: number;
};

/** Pixel values are logical 320x270 units; last pose closes the loop. */
export function localMotionPose(preset: LocalStickerMotion, frame: number): LocalMotionPose {
  const i = ((frame % 8) + 8) % 8;
  const zero = [0, 0, 0, 0, 0, 0, 0, 0];
  const poses: Record<LocalStickerMotion, {
    headX: number[]; headY: number[];
    leftX: number[]; leftY: number[];
    rightX: number[]; rightY: number[];
    eyesClose: number[];
  }> = {
    wave: {
      headX: [0, 0.7, -0.5, 0.8, -0.9, 0.5, -0.3, 0], headY: zero,
      leftX: zero, leftY: zero,
      rightX: [0, 3, -5, 5, -5, 4, -2, 0], rightY: [0, -2, -4, -2, -5, -3, -1, 0],
      eyesClose: [0, 0, 0, 0.4, 0.9, 0.2, 0, 0],
    },
    nod: {
      headX: zero, headY: [0, 2, 6, 1, 7, 2.5, 3.5, 0],
      leftX: zero, leftY: zero, rightX: zero, rightY: zero,
      eyesClose: [0, 0, 0.2, 0, 0.5, 0, 0.1, 0],
    },
    blink: {
      headX: [0, 0.7, -1, 0.5, 1, -0.8, 0.4, 0], headY: [0, -0.5, 0.5, 0.8, -0.3, 0.5, -0.5, 0],
      leftX: zero, leftY: zero, rightX: zero, rightY: zero,
      eyesClose: [0, 0.15, 0.65, 1, 0.9, 0.4, 0.08, 0],
    },
    busy: {
      headX: [0, -0.5, -1, 0.4, -0.6, 0.5, 0.1, 0], headY: [0, 0.7, 1.6, 0.5, 1.9, 0.7, 1, 0],
      leftX: [0, -2, 2.5, -2.5, 3, -2, 1, 0], leftY: [0, 2, -2, 2, -3, 2.5, -1, 0],
      rightX: [0, 1.8, -2, 2.8, -2.5, 2, -1, 0], rightY: [0, -2, 2, -2, 2, -2, 0.8, 0],
      eyesClose: zero,
    },
    cheer: {
      headX: [0, 0, -0.7, 0.6, -0.8, 0.5, 0.2, 0], headY: [0, -1.5, -3, -1, -4, -2, -0.7, 0],
      leftX: [0, -2, -4, -2, -5, -3, -1, 0], leftY: [0, -3, -6, -4, -7, -5, -2, 0],
      rightX: [0, 2, 4, 2, 5, 3, 1, 0], rightY: [0, -3, -6, -4, -7, -5, -2, 0],
      eyesClose: [0, 0, 0.4, 0.2, 0.5, 0, 0, 0],
    },
  };
  const p = poses[preset];
  return {
    headX: p.headX[i], headY: p.headY[i],
    leftX: p.leftX[i], leftY: p.leftY[i],
    rightX: p.rightX[i], rightY: p.rightY[i],
    eyesClose: p.eyesClose[i],
  };
}

type Rect = { left: number; top: number; width: number; height: number };

function feather(x: number, y: number, cx: number, cy: number, rx: number, ry: number): number {
  const dx = (x - cx) / Math.max(rx, 1);
  const dy = (y - cy) / Math.max(ry, 1);
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r >= 1) return 0;
  if (r <= 0.62) return 1;
  const t = (1 - r) / 0.38;
  return t * t * (3 - 2 * t);
}

/**
 * Warp already-isolated character pixels, leaving the text and decoration layers untouched.
 * Feather to zero at feature boundaries; no holes, hard circular cutouts or detached hands.
 */
export function warpLocalCharacter(
  source: HTMLCanvasElement, character: Rect,
  preset: LocalStickerMotion, frameIndex: number, scale = 1,
): HTMLCanvasElement {
  const result = document.createElement("canvas");
  result.width = source.width;
  result.height = source.height;
  const ctx = result.getContext("2d", { willReadFrequently: true });
  const input = source.getContext("2d", { willReadFrequently: true });
  if (!ctx || !input) throw new Error("無法建立局部動畫畫布。");
  const original = input.getImageData(0, 0, source.width, source.height);
  const pose = localMotionPose(preset, frameIndex);
  if (frameIndex % 8 === 0 || frameIndex % 8 === 7) {
    ctx.putImageData(original, 0, 0);
    return result;
  }
  const data = original.data;
  const out = ctx.createImageData(source.width, source.height);
  out.data.set(data);
  const w = character.width, h = character.height;
  const X = (v: number) => character.left + w * v;
  const Y = (v: number) => character.top + h * v;
  const margin = 14 * scale;
  const xMin = Math.max(0, Math.floor(character.left - margin));
  const xMax = Math.min(source.width, Math.ceil(character.left + w + margin));
  const yMin = Math.max(0, Math.floor(character.top - margin));
  const yMax = Math.min(source.height, Math.ceil(character.top + h + margin));

  const sample = (x: number, y: number, channel: number): number => {
    const xx = Math.max(0, Math.min(source.width - 1, x));
    const yy = Math.max(0, Math.min(source.height - 1, y));
    const ix = Math.floor(xx), iy = Math.floor(yy);
    const jx = Math.min(ix + 1, source.width - 1), jy = Math.min(iy + 1, source.height - 1);
    const tx = xx - ix, ty = yy - iy;
    const a = data[(iy * source.width + ix) * 4 + channel] * (1 - tx)
      + data[(iy * source.width + jx) * 4 + channel] * tx;
    const b = data[(jy * source.width + ix) * 4 + channel] * (1 - tx)
      + data[(jy * source.width + jx) * 4 + channel] * tx;
    return a * (1 - ty) + b * ty;
  };

  for (let y = yMin; y < yMax; y++) {
    for (let x = xMin; x < xMax; x++) {
      const head = feather(x, y, X(0.5), Y(0.32), w * 0.47, h * 0.37);
      const left = feather(x, y, X(0.21), Y(0.68), w * 0.26, h * 0.26);
      const right = feather(x, y, X(0.79), Y(0.68), w * 0.26, h * 0.26);
      const eyeLeft = feather(x, y, X(0.38), Y(0.35), w * 0.115, h * 0.075);
      const eyeRight = feather(x, y, X(0.62), Y(0.35), w * 0.115, h * 0.075);
      const eye = Math.max(eyeLeft, eyeRight) * pose.eyesClose;
      if (!head && !left && !right && !eye) continue;
      const shiftX = scale * (head * pose.headX + left * pose.leftX + right * pose.rightX);
      const shiftY = scale * (head * pose.headY + left * pose.leftY + right * pose.rightY);
      // Vertical eye compression approximates a blink; the rest of the face is preserved.
      const eyeY = (y - Y(0.35)) * eye * 1.65;
      const sx = x - shiftX, sy = y - shiftY + eyeY;
      const offset = (y * source.width + x) * 4;
      for (let c = 0; c < 4; c++) out.data[offset + c] = Math.round(sample(sx, sy, c));
    }
  }
  ctx.putImageData(out, 0, 0);
  return result;
}
