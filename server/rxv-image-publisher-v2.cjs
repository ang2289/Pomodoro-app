"use strict";
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Module = require("node:module");
const http = require("node:http");
const { createTikTokOfficialApi } = require("./tiktok-official-api.cjs");

function loadBundledSource(prefix) {
  const files = fs.readdirSync(__dirname)
    .filter((name) => name.startsWith(prefix + ".src.b64.part-"))
    .sort();
  if (!files.length) throw new Error("RXV v2 source bundle missing: " + prefix);
  const b64 = files.map((name) => fs.readFileSync(path.join(__dirname, name), "utf8").trim()).join("");
  return zlib.gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
}

const accountApi = createTikTokOfficialApi();
let accountCache = {
  checkedAt: 0,
  pending: false,
  data: null,
};

function normalizeAccount(status, verified) {
  const s = status || {};
  const v = verified || {};
  const user = v.user || s.user || {};
  const creator = v.creator || s.creator || {};
  const username = String(creator.creator_username || "").replace(/^@+/, "");
  const displayName = String(user.display_name || creator.creator_nickname || "");
  return {
    ok: Boolean(v.ok !== false),
    authorized: Boolean(v.authorized ?? s.authorized),
    configured: Boolean(v.configured ?? s.configured),
    username,
    displayName,
    postMode: String(v.mode || s.postMode || ""),
    configuredPostMode: String(v.configuredMode || s.configuredPostMode || ""),
    audited: Boolean(s.audited),
    auditStatusSource: String(s.auditStatusSource || ""),
    needsUploadReauth: Boolean(s.needsUploadReauth),
    verifiedAt: String(v.verifiedAt || s.verifiedAt || ""),
    error: String(v.error || s.error || ""),
  };
}

async function getAccountInfo(force = false) {
  const now = Date.now();
  if (!force && accountCache.data && now - accountCache.checkedAt < 30000) {
    return accountCache.data;
  }
  if (accountCache.pending && accountCache.data) return accountCache.data;

  accountCache.pending = true;
  try {
    const status = accountApi.publicStatus();
    let verified = null;
    if (status.authorized) {
      try {
        verified = await accountApi.verifyConnection();
      } catch (error) {
        verified = {
          ok: false,
          authorized: true,
          configured: status.configured,
          mode: status.postMode,
          error: String(error?.code || error?.message || error),
        };
      }
    }
    const data = normalizeAccount(accountApi.publicStatus(), verified);
    accountCache = { checkedAt: Date.now(), pending: false, data };
    return data;
  } catch (error) {
    const data = {
      ok: false,
      authorized: false,
      configured: false,
      username: "",
      displayName: "",
      postMode: "",
      configuredPostMode: "",
      audited: false,
      needsUploadReauth: false,
      verifiedAt: "",
      error: String(error?.message || error),
    };
    accountCache = { checkedAt: Date.now(), pending: false, data };
    return data;
  }
}

const originalCreateServer = http.createServer;
http.createServer = function patchedCreateServer(listener, ...rest) {
  if (typeof listener !== "function") {
    return originalCreateServer.call(http, listener, ...rest);
  }

  const wrapped = async function rxvWrappedListener(req, res) {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      if (url.pathname === "/api/rxv-tiktok-account") {
        const force = url.searchParams.get("force") === "1";
        const info = await getAccountInfo(force);
        res.statusCode = info.authorized ? 200 : 409;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ ok: true, account: info }));
        return;
      }
    } catch {}
    return listener(req, res);
  };

  return originalCreateServer.call(http, wrapped, ...rest);
};

function injectTikTokAccountBanner(sourceText) {
  let source = String(sourceText || "");
  if (source.includes("rxvTikTokAccountBanner")) return source;

  const banner = `
<div id="rxvTikTokAccountBanner" style="margin:10px 0 4px;padding:12px 14px;border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;color:#0f172a;font-weight:700">
  TikTok 已連線帳號：查詢中…
</div>
<div id="rxvTikTokUploadHint" style="display:none;margin:6px 0 4px;padding:10px 14px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed;color:#9a3412">
  Audit 狀態目前只是本機設定，不代表 TikTok 官方即時審核結果。
  <a href="http://localhost:3006/tiktok/setup" target="_blank" rel="noopener" style="font-weight:700;color:#9a3412">開啟 TikTok 設定</a>
</div>
<script>
(function(){
  var el=document.getElementById('rxvTikTokAccountBanner');
  var hint=document.getElementById('rxvTikTokUploadHint');
  if(!el)return;
  var tries=0;
  async function loadAccount(){
    tries++;
    try{
      var r=await fetch('/api/rxv-tiktok-account'+(tries===1?'?force=1':''),{cache:'no-store'});
      var j=await r.json();
      var a=j&&j.account?j.account:{};
      var who=a.username?('@'+a.username):(a.displayName||'尚未取得帳號名稱');
      var auth=a.authorized?'已授權':'未授權';
      var mode=a.postMode||'-';
      var audit=a.audited?'本機已標記通過':'本機未標記';
      var modeLabel=mode==='upload'?'Upload Draft':(mode==='direct'?'Direct Post':mode);
      var reauth=a.needsUploadReauth?'｜Upload：需重新授權':'';
      el.textContent='TikTok 已連線帳號：'+who+'｜授權：'+auth+'｜模式：'+modeLabel+'｜Audit設定：'+audit+reauth;
      if(hint){
        hint.style.display=a.needsUploadReauth?'block':'none';
      }
      if(a.authorized&&!a.username&&tries<8)setTimeout(loadAccount,1200);
    }catch(e){
      el.textContent='TikTok 已連線帳號：查詢失敗，請重新整理';
      if(tries<5)setTimeout(loadAccount,1500);
    }
  }
  loadAccount();
})();
</script>`;

  const exact = "RXV 圖片自動推廣器 v2</h1>";
  if (source.includes(exact)) {
    return source.replace(exact, exact + banner);
  }

  const h1Pattern = /(RXV 圖片自動推廣器 v2[\s\S]{0,120}?<\/h1>)/;
  if (h1Pattern.test(source)) {
    return source.replace(h1Pattern, "$1" + banner);
  }

  console.warn("[RXV v2] TikTok account banner injection target not found");
  return source;
}

let source = loadBundledSource("rxv-image-publisher-v2.cjs");
source = injectTikTokAccountBanner(source);

process.env.RXV_V2_BUNDLE_MAIN = "1";
const inner = new Module(path.join(__dirname, "rxv-image-publisher-v2.source.cjs"), module);
inner.filename = path.join(__dirname, "rxv-image-publisher-v2.source.cjs");
inner.paths = module.paths;
inner._compile(source, inner.filename);
module.exports = inner.exports;
