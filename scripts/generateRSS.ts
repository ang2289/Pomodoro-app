// scripts/generateRSS.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_URL = "https://rxv-dreamstudio.vercel.app";
const OUTPUT_PATH = path.join(process.cwd(), "public", "rss.xml");

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

// 不需要在 RSS 中的檔案
const excludeFiles = ["BlogHome.tsx", "LazyHome.tsx", "aids.tsx", "finance.tsx", "retirement.tsx"];

/**
 * 將特殊符號轉成 XML 安全格式
 * 避免 &、<、> 導致 rss.xml 無法解析
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getBlogPostsFromDir(dirPath: string, urlPrefix: string) {
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath);
  return files
    .filter((f) => 
      (f.endsWith(".tsx") || f.endsWith(".md") || f.includes(".en.") || f.includes(".zh.")) && 
      !excludeFiles.includes(f)
    )
    .map((file) => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      let baseName = file.replace(/\.(tsx|md)$/, "");
      let routePath = blogFileToRouteMap[baseName] || baseName.toLowerCase();

      let title = baseName;
      let description = "";
      let date = stats.mtime.toISOString();
      let lang = "zh-TW"; // 預設語言
      let slug = "";

      // 判斷語言從檔名
      if (file.includes(".en.")) {
        lang = "en";
        baseName = baseName.replace(".en", "");
        routePath = blogFileToRouteMap[baseName] || baseName.toLowerCase();
        slug = baseName;
      } else if (file.includes(".zh.")) {
        lang = "zh-TW";
        baseName = baseName.replace(".zh", "");
        routePath = blogFileToRouteMap[baseName] || baseName.toLowerCase();
        slug = baseName;
      } else {
        slug = baseName;
      }

      const content = fs.readFileSync(filePath, "utf-8");

      if (file.endsWith(".md")) {
        // 處理 Markdown 檔案
        try {
          const { data, content: mdContent } = matter(content);
          title = data.title || title;
          description = data.description || mdContent.slice(0, 100) + "...";
          if (data.date) date = data.date;
        } catch (e) {
          console.log(`⚠️ 無法解析 ${file} 的 front-matter`);
        }
      } else {
        // 處理 TSX 檔案 - 提取 <h1> 標題
        const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/s);
        const descMatch = content.match(/<p[^>]*>(.*?)<\/p>/s);
        title = titleMatch ? titleMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : title;
        description = descMatch ? descMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : description;
      }

      return {
        title,
        url: `${BASE_URL}${urlPrefix}${routePath}`,
        date,
        description: description || `文章更新於 ${new Date(stats.mtime).toLocaleDateString("zh-TW")}`,
        lang,
      };
    });
}

function getBlogPosts() {
  // 從 blog 和 aids 資料夾讀取文章
  const blogDir = path.join(process.cwd(), "src", "pages", "blog");
  const aidsDir = path.join(process.cwd(), "src", "pages", "aids");
  
  const blogPosts = getBlogPostsFromDir(blogDir, "/blog/");
  const aidsPosts = getBlogPostsFromDir(aidsDir, "/aids/");
  
  return [...blogPosts, ...aidsPosts];
}

function generateRSS() {
  const posts = getBlogPosts();

  // 按日期排序（最新的在前）
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${escapeXml(post.url)}</link>
      <guid>${escapeXml(post.url)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description}]]></description>
      <language>${post.lang}</language>
    </item>`
    )
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>${escapeXml("RxV 專注力與健康生活專欄｜Focus & Mindfulness Blog")}</title>
      <link>${escapeXml(BASE_URL)}</link>
      <description>${escapeXml("由 RxV 夢想創作工作室開發的中英雙語專注力、健康與理財平台。")}</description>
      <language>zh-TW,en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      ${rssItems}
    </channel>
  </rss>`;

  fs.writeFileSync(OUTPUT_PATH, rssFeed.trim());
  console.log(`✅ RSS Feed 已生成：${OUTPUT_PATH} (共 ${posts.length} 篇文章)`);
}

generateRSS();
