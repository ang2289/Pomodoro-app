// scripts/generateSitemap.ts
import fs from "fs";
import path from "path";
import { comparisonRoutePaths } from "../src/data/comparisonSeoContent";
import { searchSeoIndexablePaths } from "../src/data/searchSeoPages";
import { seoPagesToolRoutePaths } from "../src/data/seoPages";
import {
  guideRoutePaths,
  toolCategoryRoutePaths,
  toolLandingRoutePaths,
} from "../src/data/toolSeoContent";

const BASE_URL =
  process.env.VITE_SITE_URL || "https://pomodoro-app-eight-rouge.vercel.app";

const WINDOWS_FILE_RETRY_DELAYS_MS = [40, 80, 160, 320, 640];

function waitSync(milliseconds: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function writeFileAtomically(outputPath: string, contents: string) {
  const tempPath = `${outputPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, contents, { encoding: "utf8", flag: "wx" });

  try {
    for (let attempt = 0; ; attempt += 1) {
      try {
        fs.renameSync(tempPath, outputPath);
        return;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        const retryable = process.platform === "win32"
          && ["EACCES", "EBUSY", "EPERM", "UNKNOWN"].includes(String(code));

        if (!retryable || attempt >= WINDOWS_FILE_RETRY_DELAYS_MS.length) {
          throw error;
        }

        waitSync(WINDOWS_FILE_RETRY_DELAYS_MS[attempt]);
      }
    }
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

// 靜態頁面
const staticPages = [
  "/",
  "/tools",
  "/summary",
  "/tools/summary",
  "/tools/homework-helper",
  "/tools/qr-code",
  "/tools/image-resize",
  "/tools/image-compress",
  "/tools/image-convert",
  "/tools/image-crop",
  "/pomodoro",
  "/tools/line-sticker",
  "/services/design-commission",
  "/tools/scam-check",
  "/aids",
  "/finance",
  "/retirement",
  "/blog",
  "/privacy",
  "/terms",
  "/policy-explained",
  ...toolCategoryRoutePaths,
  ...toolLandingRoutePaths,
  ...seoPagesToolRoutePaths,
  ...comparisonRoutePaths,
  ...guideRoutePaths,
  ...searchSeoIndexablePaths,
];

// 檔案名到路由名稱的映射
const blogFileToRouteMap: Record<string, string> = {
  "ArticleTemplate": "pomodoro-focus",
  "ChantFocusArticle": "chant-focus",
  "MorningMeditationArticle": "morning-meditation",
  "EveningDetox": "evening-detox",
  "PerfectBreakfastTime": "perfect-breakfast-time",
  "evening-meditation": "evening-meditation",
  "AfternoonStretch": "afternoon-stretch",
  "HealthyLunch": "healthy-lunch",
  "HydrationMeditation": "hydration-meditation",
  "MorningRitual": "morning-ritual",
  "NightReset": "night-reset",
  "SelfDialogueMeditation": "self-dialogue-meditation",
  "EmotionalDetox": "emotional-detox",
  "FocusReset": "focus-reset",
  "FocusAndEmotion": "focus-and-emotion",
  "FocusMeditation": "focus-meditation",
  "MorningBreath": "morning-breath",
  "EveningBreath": "evening-breath",
  "WeeklyBreathChallenge": "weekly-breath-challenge",
  "CalmBreath": "calm-breath",
  "FocusBreath": "focus-breath",
  "BreathPrayer": "breath-prayer",
  "GratitudeBreathJournal": "gratitude-breath-journal",
  "ChantEnergyBreath": "chant-energy-breath",
  "MoonlightMeditationBreath": "moonlight-meditation-breath",
  "SleepSoundTherapy": "sleep-sound-therapy",
  "EveningGratitudeJournal": "evening-gratitude-journal",
  "MorningAffirmations": "morning-affirmations",
  "PowerOfSilence": "power-of-silence",
  "ThreeMinuteMeditation": "three-minute-meditation",
  "AboutSpiritualGrowth": "about-spiritual-growth"
};

// 不需要在 sitemap 中的檔案
const excludeFiles = ["BlogHome.tsx", "LazyHome.tsx", "aids.tsx", "finance.tsx", "retirement.tsx"];

// 從檔案更新時間取得 lastmod
function getFileLastModified(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split("T")[0]; // YYYY-MM-DD
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// 從指定資料夾自動擷取文章頁面
function getDynamicPagesFromDir(dirPath: string, urlPrefix: string): { url: string; lastmod: string }[] {
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath);
  return files
    .filter((f) => f.endsWith(".tsx") && !excludeFiles.includes(f))
    .map((f) => {
      const baseName = f.replace(".tsx", "");
      const routePath = blogFileToRouteMap[baseName] || baseName.toLowerCase();
      const filePath = path.join(dirPath, f);
      return {
        url: `${urlPrefix}${routePath}`,
        lastmod: getFileLastModified(filePath),
      };
    });
}

// 從 src/pages/blog 和 src/pages/aids 自動擷取文章頁面
function getDynamicPages(): { url: string; lastmod: string }[] {
  const blogDir = path.join(process.cwd(), "src", "pages", "blog");
  const aidsDir = path.join(process.cwd(), "src", "pages", "aids");
  
  const blogPosts = getDynamicPagesFromDir(blogDir, "/blog/");
  const aidsPosts = getDynamicPagesFromDir(aidsDir, "/aids/");
  
  return [...blogPosts, ...aidsPosts];
}

function generateSitemap() {
  const allPages = [
    ...staticPages.map((url) => ({
      url,
      lastmod: new Date().toISOString().split("T")[0],
    })),
    ...getDynamicPages(),
  ];

  const urls = allPages
    .map(
      (page) => `
    <url>
      <loc>${BASE_URL}${page.url}</loc>
      <lastmod>${page.lastmod}</lastmod>
      <changefreq>${
        page.url.includes("/blog") ? "weekly" : "monthly"
      }</changefreq>
      <priority>${page.url === "/" ? "1.0" : "0.8"}</priority>
    </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
  >
  ${urls}
  </urlset>`;

  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  writeFileAtomically(outputPath, sitemap.trim());
  console.log("✅ 自動 Sitemap 生成完成，含 lastmod / changefreq");
}

generateSitemap();
