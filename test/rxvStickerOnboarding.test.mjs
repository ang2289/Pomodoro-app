import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("新手教學與首頁、工具中心相連", () => {
  const homepage = read("src/pages/index.tsx");
  const toolsHub = read("src/pages/tools.tsx");
  const guide = read("src/components/NewUserStickerGuide.tsx");
  assert.match(homepage, /第 1 步｜從零製作貼圖/);
  assert.match(toolsHub, /<NewUserStickerGuide \/>/);
  for (let n = 1; n <= 5; n++) assert.match(guide, new RegExp(`number: ${n},`));
  assert.match(guide, /tools\/sticker-prompt#sticker-start/);
  assert.match(guide, /tools\/line-sticker#mother-upload/);
});

test("跨頁導覽有目標錨點與標示", () => {
  const progress = read("src/components/LineStickerFlowSteps.tsx");
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const slicer = read("src/pages/tools/LineStickerTool.tsx");
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  for (const name of ["sticker-start", "sticker-copy"]) assert.ok(prompt.includes(`id="${name}"`));
  for (const name of ["mother-upload", "mother-split", "sticker-download"]) assert.ok(slicer.includes(`id="${name}"`));
  assert.ok(animated.includes('id="animated-sticker-batch"'));
  assert.match(progress, /to=\{paths\[item.step - 1\]\}/);
  assert.match(slicer, /第 4 步｜確認格數/);
});

test("完整教學不引用不存在影片，保留實際示範圖", () => {
  const guide = read("src/pages/tools/LineStickerGuide.tsx");
  assert.doesNotMatch(guide, /line-sticker-guide\.mp4/);
  for (const file of ["demo-prompt.png", "demo-result.png", "demo-pack.png"]) {
    assert.ok(guide.includes(file));
    assert.ok(existsSync(new URL(`../public/images/sticker-prompt-demo/${file}`, import.meta.url)));
  }
});

test("持續保留近期 QA、零成本與減流量修正", () => {
  const apng = read("src/lib/animatedLineStickerAuto.ts");
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  const page = read("src/pages/tools/LineStickerTool.tsx");
  const html = read("index.html");
  const gallery = read("src/pages/tools/StickerShowcaseGallery.tsx");
  assert.match(apng, /ensureVisibleMotion/);
  assert.match(apng, /auditStickerFrames/);
  assert.match(apng, /const overscan = 80 \* renderScale/);
  assert.match(animated, /const OUTPUT_SAFE_PADDING = 12/);
  assert.match(page, /WhatsAppMobileZipHandoff/);
  assert.match(html, /href="\/icon.png"/);
  assert.match(gallery, /loading="lazy"/);
  assert.ok(existsSync(new URL("../scripts/rxv-images-batch-free.mjs", import.meta.url)));
  assert.ok(existsSync(new URL("../.github/workflows/rxv-image-free-qa.yml", import.meta.url)));
});
