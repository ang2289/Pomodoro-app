#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const DEFAULT_SCHEDULE = path.join("output", "social-affiliate-automation", "latest", "social_schedule.json");
const DEFAULT_GRAPH_VERSION = "v20.0";

function parseArgs(argv) {
  const args = {
    schedule: DEFAULT_SCHEDULE,
    pageId: process.env.FB_PAGE_ID || process.env.FACEBOOK_PAGE_ID || "",
    token: process.env.FB_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "",
    graphVersion: process.env.FB_GRAPH_VERSION || DEFAULT_GRAPH_VERSION,
    live: false,
    limit: 1,
    id: "",
    delayMs: 2500,
    out: "",
    help: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--schedule") args.schedule = argv[++i] || args.schedule;
    else if (arg === "--page-id") args.pageId = argv[++i] || args.pageId;
    else if (arg === "--token") args.token = argv[++i] || args.token;
    else if (arg === "--graph-version") args.graphVersion = argv[++i] || args.graphVersion;
    else if (arg === "--live") args.live = true;
    else if (arg === "--limit") args.limit = Number(argv[++i] || args.limit) || args.limit;
    else if (arg === "--id") args.id = argv[++i] || "";
    else if (arg === "--delay-ms") args.delayMs = Number(argv[++i] || args.delayMs) || args.delayMs;
    else if (arg === "--out") args.out = argv[++i] || "";
    else positional.push(arg);
  }

  if (positional[0]) args.schedule = positional[0];
  if (positional[1] && Number.isFinite(Number(positional[1]))) {
    args.limit = Number(positional[1]);
  } else if (positional[1]) {
    args.id = positional[1];
  }
  if (!args.out && positional[2]) args.out = positional[2];
  return args;
}

function usage() {
  return [
    "Usage:",
    "  npm run social:facebook:publish -- output/social-affiliate-automation/latest/social_schedule.json 1",
    "  npm run social:facebook:publish -- output/social-affiliate-automation/latest/social_schedule.json 004-facebook output/social-affiliate-automation/latest/fb-dry-run-004.json",
    "  FB_PAGE_ID=... FB_PAGE_ACCESS_TOKEN=... npm run social:facebook:publish -- --live --limit 1",
    "",
    "Options:",
    "  --schedule <file>       Schedule JSON. Default: output/social-affiliate-automation/latest/social_schedule.json",
    "  --page-id <id>          Facebook Page ID. Can also use FB_PAGE_ID.",
    "  --token <token>         Facebook Page access token. Can also use FB_PAGE_ACCESS_TOKEN.",
    "  --live                  Actually publish. Without this, dry-run only.",
    "  --limit <number>        Number of draft Facebook posts to publish/check. Default: 1.",
    "  --id <schedule-id>      Publish/check one schedule row, for example 004-facebook.",
    "  --delay-ms <number>     Delay between live posts. Default: 2500.",
    "  --out <file>            Result JSON file path.",
  ].join("\n");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function removeLinkFromMessage(message, link) {
  const expected = String(link || "").trim();
  return String(message || "")
    .split(/\r?\n/)
    .filter((line) => {
      const value = line.trim();
      if (!value) return true;
      if (expected && value === expected) return false;
      return !/^https?:\/\/\S+$/i.test(value);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function selectPosts(posts, args) {
  let selected = posts.filter((post) => post.platform === "Facebook" && post.status !== "published");
  if (args.id) selected = selected.filter((post) => post.id === args.id);
  return selected.slice(0, Math.max(1, args.limit));
}

async function publishPagePost(post, args) {
  const endpoint = `https://graph.facebook.com/${args.graphVersion}/${encodeURIComponent(args.pageId)}/feed`;
  const params = new URLSearchParams();
  params.set("access_token", args.token);
  params.set("message", removeLinkFromMessage(post.post_text, post.link));
  if (post.link) params.set("link", post.link);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.error?.message || response.statusText;
    throw new Error(`Facebook API ${response.status}: ${detail}`);
  }
  return body;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const schedulePath = path.resolve(args.schedule);
  if (!fs.existsSync(schedulePath)) {
    throw new Error(`Schedule file not found: ${schedulePath}`);
  }

  const posts = JSON.parse(await fsp.readFile(schedulePath, "utf8"));
  const selected = selectPosts(posts, args);
  if (!selected.length) {
    console.log("[OK] No matching Facebook draft posts.");
    return;
  }

  if (args.live && (!args.pageId || !args.token)) {
    throw new Error("Live publishing requires FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN.");
  }

  const results = [];
  for (const post of selected) {
    const message = removeLinkFromMessage(post.post_text, post.link);
    if (!args.live) {
      results.push({
        id: post.id,
        platform: post.platform,
        mode: "dry-run",
        pageId: args.pageId || "(missing)",
        message,
        link: post.link,
      });
      continue;
    }

    const published = await publishPagePost(post, args);
    results.push({
      id: post.id,
      platform: post.platform,
      mode: "published",
      pageId: args.pageId,
      facebookPostId: published.id || "",
      link: post.link,
    });
    await sleep(args.delayMs);
  }

  const outPath = path.resolve(
    args.out || path.join(path.dirname(schedulePath), `facebook_publish_results_${Date.now()}.json`),
  );
  await fsp.writeFile(outPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`[OK] ${args.live ? "Published" : "Dry-run checked"} ${results.length} Facebook post(s)`);
  console.log(`[OUT] ${outPath}`);
  if (!args.live) {
    console.log("[DRY-RUN] Add --live with FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN to publish to a Facebook Page.");
  }
}

main().catch((error) => {
  console.error(`[ERROR] ${error?.message || error}`);
  process.exitCode = 1;
});
