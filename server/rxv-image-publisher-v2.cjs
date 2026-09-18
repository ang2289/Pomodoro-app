"use strict";
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Module = require("node:module");

function loadBundledSource(prefix) {
  const files = fs.readdirSync(__dirname)
    .filter((name) => name.startsWith(prefix + ".src.b64.part-"))
    .sort();
  if (!files.length) throw new Error("RXV v2 source bundle missing: " + prefix);
  const b64 = files.map((name) => fs.readFileSync(path.join(__dirname, name), "utf8").trim()).join("");
  return zlib.gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
}

function patchAccountDisplay(sourceText) {
  let source = String(sourceText || "");

  const localStatusPattern = /function localTikTokStatus\(\) \{[\s\S]*?\n\}/;
  if (localStatusPattern.test(source)) {
    source = source.replace(
      localStatusPattern,
      `function localTikTokStatus() {
  const s = tiktokOfficial.publicStatus();
  const user = s && s.user ? s.user : {};
  const creator = s && s.creator ? s.creator : {};
  return {
    configured: Boolean(s.configured),
    authorized: Boolean(s.authorized),
    postMode: String(s.postMode || ""),
    audited: Boolean(s.audited),
    scopesGranted: Array.isArray(s.scopesGranted) ? s.scopesGranted : [],
    displayName: String(user.display_name || creator.creator_nickname || ""),
    creatorUsername: String(creator.creator_username || "").replace(/^@+/, ""),
    verifiedAt: String(s.verifiedAt || ""),
    accountError: String(s.error || ""),
    ffmpegPath: resolveFfmpegPath()
  };
}`
    );
  } else {
    console.warn("[RXV v2] localTikTokStatus patch target not found");
  }

  const uiStatusPattern = /document\.getElementById\('tiktokStatus'\)\.textContent=[^;]+;/;
  if (uiStatusPattern.test(source)) {
    source = source.replace(
      uiStatusPattern,
      "document.getElementById('tiktokStatus').textContent='TikTok 帳號：'+(ts.creatorUsername?('@'+ts.creatorUsername):(ts.displayName||(ts.authorized?'查詢中…':'尚未授權')))+'｜授權：'+(ts.authorized?'已授權':'未授權')+'｜模式：'+(ts.postMode||'-')+'｜Audit：'+(ts.audited?'已通過':'未通過/測試')+'｜FFmpeg：'+(ts.ffmpegPath?'已找到':'未找到');"
    );
  } else {
    console.warn("[RXV v2] TikTok status UI patch target not found");
  }

  return source;
}

let source = loadBundledSource("rxv-image-publisher-v2.cjs");
source = patchAccountDisplay(source);

process.env.RXV_V2_BUNDLE_MAIN = "1";
const inner = new Module(path.join(__dirname, "rxv-image-publisher-v2.source.cjs"), module);
inner.filename = path.join(__dirname, "rxv-image-publisher-v2.source.cjs");
inner.paths = module.paths;
inner._compile(source, inner.filename);
module.exports = inner.exports;
