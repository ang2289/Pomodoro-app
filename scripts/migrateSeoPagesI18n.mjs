/**
 * 將 seoPages.json 改為 titleKey/descKey，並把文案合併進 locales/zh-TW.json、en-US.json
 * 執行：node scripts/migrateSeoPagesI18n.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SEO_JSON = path.join(ROOT, "src", "data", "seoPages.json");
const ZH = path.join(ROOT, "src", "locales", "zh-TW.json");
const EN = path.join(ROOT, "src", "locales", "en-US.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

const data = readJson(SEO_JSON);
const slugsZh = {};
const slugsEn = {};

const next = data.map((entry) => {
  const { title, description, ...rest } = entry;
  if (!title || !description) {
    throw new Error(`Missing title/description for slug ${entry.slug}`);
  }
  const titleKey = `seoPages.slugs.${entry.slug}.title`;
  const descKey = `seoPages.slugs.${entry.slug}.desc`;
  slugsZh[entry.slug] = { title, desc: description };
  // 英文先沿用中文，之後可逐步替換翻譯；i18n fallback 亦會回到 zh-TW
  slugsEn[entry.slug] = { title, desc: description };
  return {
    ...rest,
    titleKey,
    descKey,
  };
});

writeJson(SEO_JSON, next);

function mergeSeoPages(localePath, slugs) {
  const loc = readJson(localePath);
  loc.seoPages = loc.seoPages || {};
  loc.seoPages.slugs = { ...(loc.seoPages.slugs || {}), ...slugs };
  writeJson(localePath, loc);
}

mergeSeoPages(ZH, slugsZh);
mergeSeoPages(EN, slugsEn);

console.log("Updated seoPages.json + locales (seoPages.slugs.*), entries:", next.length);
