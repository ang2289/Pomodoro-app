#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const DEFAULT_DISCLOSURE = "含分潤連結：";
const DEFAULT_CAMPAIGN = "shopee_affiliate_social";
const DEFAULT_INPUT = "批量產生結果_2026-04-29 (6).xlsx";

function parseArgs(argv) {
  const args = {
    input: "",
    out: "",
    start: "",
    postsPerDay: 2,
    spacingMinutes: 180,
    campaign: DEFAULT_CAMPAIGN,
    directShopeeLink: false,
    help: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--out") {
      args.out = argv[++i] || "";
    } else if (arg === "--start") {
      args.start = argv[++i] || "";
    } else if (arg === "--posts-per-day") {
      args.postsPerDay = Number(argv[++i] || args.postsPerDay) || args.postsPerDay;
    } else if (arg === "--spacing-minutes") {
      args.spacingMinutes = Number(argv[++i] || args.spacingMinutes) || args.spacingMinutes;
    } else if (arg === "--campaign") {
      args.campaign = argv[++i] || args.campaign;
    } else if (arg === "--direct-shopee-link") {
      args.directShopeeLink = true;
    } else {
      positional.push(arg);
    }
  }

  if (!args.input && positional[0]) args.input = positional[0];
  if (!args.start && positional[1] && !Number.isFinite(Number(positional[1]))) args.start = positional[1];
  if (positional[2] && Number.isFinite(Number(positional[2]))) {
    args.postsPerDay = Number(positional[2]) || args.postsPerDay;
  }
  if (!args.out && positional[3]) args.out = positional[3];

  return args;
}

function usage() {
  return [
    "Usage:",
    "  npm run social:affiliate -- \"批量產生結果_2026-04-29 (6).xlsx\"",
    "  npm run social:affiliate -- \"批量產生結果_2026-04-29 (6).xlsx\" \"2026-06-24T09:00:00+08:00\" 2",
    "  npm run social:affiliate -- \"批量產生結果_2026-04-29 (6).xlsx\" \"2026-06-24T09:00:00+08:00\" 2 output/social-affiliate-automation/latest",
    "",
    "Options:",
    "  --out <dir>                 Output directory. Default: output/social-affiliate-automation/<timestamp>",
    "  --start <datetime>          First scheduled time. Example: 2026-06-24T09:00:00+08:00",
    "  --posts-per-day <number>    Items per day per platform. Default: 2",
    "  --spacing-minutes <number>  Minutes between posts in a day. Default: 180",
    "  --campaign <name>           UTM campaign name. Default: shopee_affiliate_social",
    "  --direct-shopee-link        Use the Shopee affiliate URL instead of the product share page",
  ].join("\n");
}

function normalizeHeader(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLowerCase();
}

function pick(row, candidates) {
  for (const key of candidates) {
    if (row[key] != null && String(row[key]).trim()) return String(row[key]).trim();
    const normalized = normalizeHeader(key);
    if (row[normalized] != null && String(row[normalized]).trim()) return String(row[normalized]).trim();
  }
  return "";
}

function stripShopeeUrl(text) {
  return String(text || "")
    .replace(/\n?https:\/\/s\.shopee\.tw\/\S+/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHashtags(text) {
  return String(text || "")
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compactWhitespace(text) {
  return String(text || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function splitTags(value) {
  const raw = String(value || "")
    .split(/[\s,，#]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const seen = new Set();
  const tags = [];
  for (const tag of raw) {
    const normalized = tag.replace(/^#/, "");
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    tags.push(`#${normalized}`);
  }
  return tags;
}

function addUtm(url, source, campaign, content) {
  const value = String(url || "").trim();
  if (!/^https?:\/\//i.test(value)) return value;
  const parsed = new URL(value);
  parsed.searchParams.set("utm_source", source);
  parsed.searchParams.set("utm_medium", "social");
  parsed.searchParams.set("utm_campaign", campaign);
  parsed.searchParams.set("utm_content", content);
  return parsed.toString();
}

function limitText(text, maxLength) {
  const value = String(text || "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function buildThreadsPost(item, link) {
  const tags = item.tags.slice(0, 3).join(" ");
  const makePost = (description, tagText) => [
    DEFAULT_DISCLOSURE,
    "",
    item.shortTitle,
    description,
    "",
    link,
    "",
    tagText,
  ].filter((part) => part != null && String(part).trim() !== "").join("\n");

  const core = makePost(item.shortDescription, tags);
  if (core.length <= 500) return core;

  const reserved = [
    DEFAULT_DISCLOSURE,
    item.shortTitle,
    link,
    tags,
  ].join("\n\n").length;
  const descriptionLimit = Math.max(0, 490 - reserved);
  const shorter = makePost(limitText(item.shortDescription, descriptionLimit), tags);
  if (shorter.length <= 500) return shorter;

  const noTagsReserved = [
    DEFAULT_DISCLOSURE,
    item.shortTitle,
    link,
  ].join("\n\n").length;
  const noTagsDescriptionLimit = Math.max(0, 490 - noTagsReserved);
  return makePost(limitText(item.shortDescription, noTagsDescriptionLimit), "");
}

function buildFacebookPost(item, link) {
  const tags = item.tags.slice(0, 6).join(" ");
  const body = stripHashtags(stripShopeeUrl(item.fullPost)) || [item.shortTitle, "", item.shortDescription].join("\n");
  return compactWhitespace([
    DEFAULT_DISCLOSURE,
    "",
    body,
    "",
    link,
    "",
    tags,
  ].filter(Boolean).join("\n"));
}

function nextDefaultStart() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

function scheduleTime(start, itemIndex, platformIndex, postsPerDay, spacingMinutes) {
  const day = Math.floor(itemIndex / postsPerDay);
  const slot = itemIndex % postsPerDay;
  const date = new Date(start.getTime());
  date.setDate(date.getDate() + day);
  date.setMinutes(date.getMinutes() + slot * spacingMinutes + platformIndex * 30);
  return date;
}

function toLocalIso(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

async function writeCsv(filePath, rows, headers) {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];
  await fsp.writeFile(filePath, `\uFEFF${lines.join("\n")}\n`, "utf8");
}

async function writeUtf8Bom(filePath, content) {
  await fsp.writeFile(filePath, `\uFEFF${content}`, "utf8");
}

function loadRows(inputPath) {
  const workbook = xlsx.readFile(inputPath, { cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  return rawRows
    .map((row) => {
      const normalized = { ...row };
      for (const [key, value] of Object.entries(row)) {
        normalized[normalizeHeader(key)] = value;
      }
      return normalized;
    })
    .filter((row) => {
      const status = pick(row, ["狀態", "status"]);
      return status !== "失敗" && Boolean(pick(row, ["商品名稱", "productName", "title"]));
    });
}

function toItem(row, index) {
  const title = pick(row, ["商品名稱", "productName", "title"]);
  const shortTitle = pick(row, ["短影片標題", "shortTitle", "hook"]) || limitText(title, 40);
  const shortDescription = pick(row, ["短描述", "shortDescription", "description"]);
  const fullPost = pick(row, ["完整貼文內容", "fullPost", "post"]);
  const hashtags = pick(row, ["Hashtag關鍵字", "hashtags", "hashtag"]);
  const affiliateUrl = pick(row, ["推廣連結", "affiliateUrl", "shopeeAffiliateUrl"]);
  const sharePage = pick(row, ["商品分享頁", "sharePage", "shareUrl"]);
  const videoUrl = pick(row, ["影片公開網址", "videoUrl", "publicVideoUrl"]);
  const videoFile = pick(row, ["影片檔案", "videoFile", "localVideoFile"]);
  const imageUrl = pick(row, ["圖片網址", "imageUrl", "image"]);

  return {
    id: String(pick(row, ["編號", "id"]) || index + 1).padStart(3, "0"),
    title,
    shortTitle,
    shortDescription,
    fullPost,
    tags: splitTags(hashtags),
    affiliateUrl,
    sharePage,
    videoUrl,
    videoFile,
    imageUrl,
  };
}

function classifyItem(item) {
  const text = `${item.title} ${item.shortTitle} ${item.shortDescription}`;
  if (/洗衣|衛生紙|保久乳|康寶|清潔|補充包/.test(text)) return "家庭補貨";
  if (/零食|可可|巧克力|威化|爆米花|夾心|魚片|追劇/.test(text)) return "追劇零食";
  if (/AirPods|藍芽|耳機|3C|Apple/i.test(text)) return "3C";
  if (/貓|寵物/.test(text)) return "寵物";
  if (/外套|風衣|穿搭/.test(text)) return "穿搭";
  return "生活好物";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const inputPath = path.resolve(PROJECT_ROOT, args.input || DEFAULT_INPUT);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
  const outputDir = path.resolve(
    PROJECT_ROOT,
    args.out || path.join("output", "social-affiliate-automation", timestamp),
  );

  const start = args.start ? new Date(args.start) : nextDefaultStart();
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid --start value: ${args.start}`);
  }

  await fsp.mkdir(outputDir, { recursive: true });

  const items = loadRows(inputPath).map(toItem);
  const scheduleRows = [];
  const trackingRows = [];
  const jsonPosts = [];
  const textBlocks = [];

  items.forEach((item, index) => {
    const category = classifyItem(item);
    const baseUrl = args.directShopeeLink ? item.affiliateUrl : (item.sharePage || item.affiliateUrl);
    const trackedThreadsLink = addUtm(baseUrl, "threads", args.campaign, `${item.id}-${category}`);
    const threadsLink = trackedThreadsLink.length > 220 && item.affiliateUrl
      ? item.affiliateUrl
      : trackedThreadsLink;
    const facebookLink = addUtm(baseUrl, "facebook", args.campaign, `${item.id}-${category}`);
    const threadsPost = buildThreadsPost(item, threadsLink);
    const facebookPost = buildFacebookPost(item, facebookLink);

    const platformConfigs = [
      {
        platform: "Threads",
        source: "threads",
        scheduledAt: scheduleTime(start, index, 0, args.postsPerDay, args.spacingMinutes),
        postText: threadsPost,
        link: threadsLink,
        manualUrl: `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsPost)}`,
      },
      {
        platform: "Facebook",
        source: "facebook",
        scheduledAt: scheduleTime(start, index, 1, args.postsPerDay, args.spacingMinutes),
        postText: facebookPost,
        link: facebookLink,
        manualUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookLink)}`,
      },
    ];

    for (const config of platformConfigs) {
      const row = {
        id: `${item.id}-${config.source}`,
        platform: config.platform,
        scheduled_at: toLocalIso(config.scheduledAt),
        category,
        product_name: item.title,
        post_text: config.postText,
        link: config.link,
        affiliate_url: item.affiliateUrl,
        share_page: item.sharePage,
        video_url: item.videoUrl,
        video_file: item.videoFile,
        image_url: item.imageUrl,
        manual_publish_url: config.manualUrl,
        status: "draft",
        notes: "",
      };
      scheduleRows.push(row);
      jsonPosts.push(row);
      textBlocks.push([
        `===== ${row.id} | ${row.platform} | ${row.scheduled_at} =====`,
        row.post_text,
        "",
        `Manual URL: ${row.manual_publish_url}`,
        "",
      ].join("\n"));
      trackingRows.push({
        id: row.id,
        platform: row.platform,
        category,
        product_name: item.title,
        scheduled_at: row.scheduled_at,
        published_url: "",
        impressions: "",
        reactions: "",
        comments: "",
        shares: "",
        link_clicks: "",
        shopee_orders: "",
        commission_ntd: "",
        notes: "",
      });
    }
  });

  await writeCsv(path.join(outputDir, "social_schedule.csv"), scheduleRows, [
    "id",
    "platform",
    "scheduled_at",
    "category",
    "product_name",
    "post_text",
    "link",
    "affiliate_url",
    "share_page",
    "video_url",
    "video_file",
    "image_url",
    "manual_publish_url",
    "status",
    "notes",
  ]);

  await writeCsv(path.join(outputDir, "tracking_template.csv"), trackingRows, [
    "id",
    "platform",
    "category",
    "product_name",
    "scheduled_at",
    "published_url",
    "impressions",
    "reactions",
    "comments",
    "shares",
    "link_clicks",
    "shopee_orders",
    "commission_ntd",
    "notes",
  ]);

  await fsp.writeFile(path.join(outputDir, "social_schedule.json"), JSON.stringify(jsonPosts, null, 2), "utf8");
  await writeUtf8Bom(path.join(outputDir, "posts.txt"), textBlocks.join("\n"));

  const guide = [
    "# Social affiliate automation output",
    "",
    `Source: ${path.basename(inputPath)}`,
    `Items: ${items.length}`,
    `Posts: ${scheduleRows.length}`,
    "",
    "Files:",
    "- social_schedule.csv: import this into a scheduler or use it as the publishing checklist.",
    "- social_schedule.json: machine-readable version for a future Meta API publisher.",
    "- posts.txt: copy-ready post text grouped by platform and time.",
    "- tracking_template.csv: fill in impressions, clicks, orders, and commission after posting.",
    "",
    "Recommended workflow:",
    "1. Post 2 items per day per platform for 7-8 days.",
    "2. Use the share-page links first; they include UTM parameters for source tracking.",
    "3. Mark every affiliate post clearly with the disclosure line already included in each post.",
    "4. After 14 days, keep categories with clicks and orders; pause categories with zero clicks.",
    "",
    "Direct API publishing is intentionally not enabled here. Facebook Pages and Threads require a Meta app, permissions, and access tokens tied to your account/page.",
  ].join("\n");

  await writeUtf8Bom(path.join(outputDir, "README.md"), guide);

  console.log(`[OK] Loaded ${items.length} items`);
  console.log(`[OK] Generated ${scheduleRows.length} platform posts`);
  console.log(`[OUT] ${outputDir}`);
}

main().catch((error) => {
  console.error(`[ERROR] ${error?.message || error}`);
  process.exitCode = 1;
});
