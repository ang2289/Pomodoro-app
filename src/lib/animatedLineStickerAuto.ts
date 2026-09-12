export type AutoMotionPreset =
  | "auto"
  | "salute"
  | "bounce"
  | "shake"
  | "nod"
  | "textPop"
  | "sparkle";

export const AUTO_MOTION_PRESETS: { value: AutoMotionPreset; labelKey: string }[] = [
  { value: "auto", labelKey: "animated_line_sticker.auto_motion_auto" },
  { value: "salute", labelKey: "animated_line_sticker.auto_motion_salute" },
  { value: "bounce", labelKey: "animated_line_sticker.auto_motion_bounce" },
  { value: "shake", labelKey: "animated_line_sticker.auto_motion_shake" },
  { value: "nod", labelKey: "animated_line_sticker.auto_motion_nod" },
  { value: "textPop", labelKey: "animated_line_sticker.auto_motion_text_pop" },
  { value: "sparkle", labelKey: "animated_line_sticker.auto_motion_sparkle" },
];

const OUTPUT_WIDTH = 320;
const OUTPUT_HEIGHT = 270;
const FRAME_COUNT = 8;
const ALPHA_THRESHOLD = 8;

type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type Component = Bounds & {
  id: number;
  area: number;
};

type Layer = {
  canvas: HTMLCanvasElement;
  bounds: Bounds | null;
};

type Transform = {
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  dx?: number;
  dy?: number;
  opacity?: number;
};

function makeBounds(left: number, top: number, right: number, bottom: number): Bounds {
  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function detectBoundsFromData(data: Uint8ClampedArray, width: number, height: number): Bounds | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;
      if (x < left) left = x;
      if (y < top) top = y;
      if (x > right) right = x;
      if (y > bottom) bottom = y;
    }
  }
  return right < left || bottom < top ? null : makeBounds(left, top, right + 1, bottom + 1);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`無法讀取圖片：${file.name}`));
    };
    image.src = url;
  });
}

function normalizeSource(image: HTMLImageElement): HTMLCanvasElement {
  const source = document.createElement("canvas");
  source.width = image.naturalWidth || image.width;
  source.height = image.naturalHeight || image.height;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("無法建立圖片處理畫布。");
  sourceContext.clearRect(0, 0, source.width, source.height);
  sourceContext.drawImage(image, 0, 0);
  const sourceData = sourceContext.getImageData(0, 0, source.width, source.height);
  const bounds = detectBoundsFromData(sourceData.data, source.width, source.height);
  if (!bounds) throw new Error("圖片沒有可辨識的內容，請確認透明PNG內有角色或文字。");

  const padding = 6;
  const scale = Math.min(
    (OUTPUT_WIDTH - padding * 2) / bounds.width,
    (OUTPUT_HEIGHT - padding * 2) / bounds.height,
  );
  const targetWidth = Math.max(1, Math.round(bounds.width * scale));
  const targetHeight = Math.max(1, Math.round(bounds.height * scale));
  const targetX = Math.round((OUTPUT_WIDTH - targetWidth) / 2);
  const targetY = Math.round((OUTPUT_HEIGHT - targetHeight) / 2);

  const output = document.createElement("canvas");
  output.width = OUTPUT_WIDTH;
  output.height = OUTPUT_HEIGHT;
  const context = output.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("無法建立動畫畫布。");
  context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    source,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  );
  return output;
}

function findComponents(imageData: ImageData): { labels: Int32Array; components: Component[] } {
  const { width, height, data } = imageData;
  const labels = new Int32Array(width * height);
  const components: Component[] = [];
  const stack: number[] = [];
  let nextId = 0;

  for (let start = 0; start < labels.length; start += 1) {
    if (labels[start] !== 0 || data[start * 4 + 3] <= ALPHA_THRESHOLD) continue;
    nextId += 1;
    labels[start] = nextId;
    stack.push(start);
    let area = 0;
    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;

    while (stack.length) {
      const index = stack.pop() as number;
      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;

      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        const nextY = y + offsetY;
        if (nextY < 0 || nextY >= height) continue;
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          const nextX = x + offsetX;
          if (nextX < 0 || nextX >= width) continue;
          const nextIndex = nextY * width + nextX;
          if (labels[nextIndex] !== 0 || data[nextIndex * 4 + 3] <= ALPHA_THRESHOLD) continue;
          labels[nextIndex] = nextId;
          stack.push(nextIndex);
        }
      }
    }

    components.push({
      id: nextId,
      area,
      ...makeBounds(left, top, right + 1, bottom + 1),
    });
  }
  return { labels, components };
}

function makeLayer(
  sourceData: ImageData,
  labels: Int32Array,
  allowedIds: Set<number>,
): Layer {
  const canvas = document.createElement("canvas");
  canvas.width = sourceData.width;
  canvas.height = sourceData.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("無法建立動畫分層。");
  const layerData = context.createImageData(sourceData.width, sourceData.height);
  for (let pixel = 0; pixel < labels.length; pixel += 1) {
    if (!allowedIds.has(labels[pixel])) continue;
    const offset = pixel * 4;
    layerData.data[offset] = sourceData.data[offset];
    layerData.data[offset + 1] = sourceData.data[offset + 1];
    layerData.data[offset + 2] = sourceData.data[offset + 2];
    layerData.data[offset + 3] = sourceData.data[offset + 3];
  }
  context.putImageData(layerData, 0, 0);
  return {
    canvas,
    bounds: detectBoundsFromData(layerData.data, layerData.width, layerData.height),
  };
}

function makeWholeLayer(source: HTMLCanvasElement): Layer {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("無法建立動畫分層。");
  context.drawImage(source, 0, 0);
  const data = context.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, bounds: detectBoundsFromData(data.data, canvas.width, canvas.height) };
}

function splitLayers(source: HTMLCanvasElement): {
  text: Layer;
  character: Layer;
  accents: Layer;
  segmented: boolean;
} {
  const context = source.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("無法分析圖片內容。");
  const imageData = context.getImageData(0, 0, source.width, source.height);
  const { labels, components } = findComponents(imageData);
  const meaningful = components.filter((component) => component.area >= 12);
  if (meaningful.length < 2) {
    const blank = makeLayer(imageData, labels, new Set());
    return { text: blank, character: makeWholeLayer(source), accents: blank, segmented: false };
  }

  const character = meaningful.reduce((best, component) => {
    const lowerBodyBonus = component.bottom > OUTPUT_HEIGHT * 0.6 ? 1.35 : 1;
    const bestBonus = best.bottom > OUTPUT_HEIGHT * 0.6 ? 1.35 : 1;
    return component.area * lowerBodyBonus > best.area * bestBonus ? component : best;
  });
  const textCandidates = meaningful.filter((component) => (
    component.id !== character.id
    && component.area >= 35
    && component.top < character.top + Math.min(36, character.height * 0.15)
    && component.bottom < OUTPUT_HEIGHT * 0.58
  ));
  if (textCandidates.length === 0) {
    const blank = makeLayer(imageData, labels, new Set());
    return { text: blank, character: makeWholeLayer(source), accents: blank, segmented: false };
  }

  const textIds = new Set(textCandidates.map((component) => component.id));
  const characterIds = new Set([character.id]);
  const accentIds = new Set(
    meaningful
      .filter((component) => !textIds.has(component.id) && component.id !== character.id)
      .map((component) => component.id),
  );
  return {
    text: makeLayer(imageData, labels, textIds),
    character: makeLayer(imageData, labels, characterIds),
    accents: makeLayer(imageData, labels, accentIds),
    segmented: true,
  };
}

function drawLayer(context: CanvasRenderingContext2D, layer: Layer, transform: Transform = {}) {
  if (!layer.bounds) return;
  const centerX = (layer.bounds.left + layer.bounds.right) / 2;
  const centerY = (layer.bounds.top + layer.bounds.bottom) / 2;
  context.save();
  context.globalAlpha = transform.opacity ?? 1;
  context.translate(centerX + (transform.dx ?? 0), centerY + (transform.dy ?? 0));
  context.rotate(((transform.rotation ?? 0) * Math.PI) / 180);
  context.scale(transform.scaleX ?? 1, transform.scaleY ?? 1);
  context.drawImage(layer.canvas, -centerX, -centerY);
  context.restore();
}

function getTransforms(preset: AutoMotionPreset, frameIndex: number) {
  const textScale = [1, 0.94, 1.06, 1.015, 1, 1.025, 0.985, 1][frameIndex];
  const textY = [0, 4, -3, -1, 0, -1, 1, 0][frameIndex];
  const bounceY = [0, 5, -5, -1, 0, -2, 1, 0][frameIndex];
  const bounceScaleY = [1, 0.96, 1.035, 1.01, 1, 1.015, 0.99, 1][frameIndex];
  const shakeRotation = [0, -2.5, 2.5, -1.4, 0, 1.5, -0.8, 0][frameIndex];
  const nodRotation = [0, -1, 1.8, 3.2, 1.5, -0.8, 0.5, 0][frameIndex];
  const accentOpacity = [0.55, 0.8, 1, 0.65, 1, 0.82, 0.55, 0.55][frameIndex];

  const text: Transform = {};
  const character: Transform = {};
  const accents: Transform = { opacity: accentOpacity };

  if (preset === "auto" || preset === "textPop") {
    text.scaleX = textScale;
    text.scaleY = textScale;
    text.dy = textY;
  }
  if (preset === "auto" || preset === "bounce") {
    character.dy = bounceY;
    character.scaleY = bounceScaleY;
    character.scaleX = 2 - bounceScaleY;
  }
  if (preset === "shake" || preset === "salute") {
    character.rotation = shakeRotation;
    character.dx = [0, -2, 2, -1, 0, 1, -1, 0][frameIndex];
  }
  if (preset === "nod") {
    character.rotation = nodRotation;
    character.dy = [0, 1, 3, 5, 2, -1, 0, 0][frameIndex];
  }
  if (preset === "sparkle") {
    text.scaleX = [1, 1.01, 1.025, 1.01, 1, 1.015, 1, 1][frameIndex];
    text.scaleY = text.scaleX;
  }
  return { text, character, accents };
}

function drawMotionMarks(
  context: CanvasRenderingContext2D,
  preset: AutoMotionPreset,
  frameIndex: number,
) {
  context.save();
  context.lineCap = "round";
  if ((preset === "salute" || preset === "auto") && (frameIndex === 2 || frameIndex === 3)) {
    context.strokeStyle = "rgba(255,153,0,0.95)";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(62, 120, 24, Math.PI * 1.05, Math.PI * 1.75);
    context.stroke();
    context.strokeStyle = "rgba(255,210,45,0.9)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(62, 120, 32, Math.PI * 1.08, Math.PI * 1.72);
    context.stroke();
  }
  if ((preset === "shake" || preset === "auto") && (frameIndex === 5 || frameIndex === 6)) {
    context.strokeStyle = "rgba(35,111,232,0.95)";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(276, 170, 25, -Math.PI * 0.42, Math.PI * 0.42);
    context.stroke();
    context.strokeStyle = "rgba(101,184,255,0.9)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(276, 170, 33, -Math.PI * 0.4, Math.PI * 0.4);
    context.stroke();
  }
  context.restore();
}

function renderFrames(source: HTMLCanvasElement, preset: AutoMotionPreset): HTMLCanvasElement[] {
  const layers = splitLayers(source);
  const fallback = !layers.segmented;
  return Array.from({ length: FRAME_COUNT }, (_, frameIndex) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("無法建立動畫影格。");
    context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    const transforms = getTransforms(preset, frameIndex);
    if (fallback) {
      drawLayer(context, layers.character, {
        ...transforms.character,
        scaleX: transforms.text.scaleX ?? transforms.character.scaleX,
        scaleY: transforms.text.scaleY ?? transforms.character.scaleY,
        dy: (transforms.character.dy ?? 0) + (transforms.text.dy ?? 0),
      });
    } else {
      drawLayer(context, layers.text, transforms.text);
      drawLayer(context, layers.character, transforms.character);
      drawLayer(context, layers.accents, transforms.accents);
    }
    drawMotionMarks(context, preset, frameIndex);
    return canvas;
  });
}

function canvasToPngFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("動畫影格產生失敗，請重新整理後再試一次。"));
        return;
      }
      resolve(new File([blob], name, { type: "image/png", lastModified: Date.now() }));
    }, "image/png");
  });
}

export async function generateAutoAnimationFrameFiles(
  sourceFile: File,
  preset: AutoMotionPreset,
): Promise<File[]> {
  const image = await loadImage(sourceFile);
  const normalized = normalizeSource(image);
  const frames = renderFrames(normalized, preset);
  return Promise.all(
    frames.map((canvas, index) => canvasToPngFile(
      canvas,
      `auto_frame_${String(index + 1).padStart(3, "0")}.png`,
    )),
  );
}
