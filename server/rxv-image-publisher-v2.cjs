"use strict";
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Module = require("node:module");
const http = require("node:http");
const { createTikTokOfficialApi } = require("./tiktok-official-api.cjs");

function loadBundledSource(prefix) {
  const plainName = String(prefix).replace(/\.cjs$/i, ".source.cjs");
  const plainPath = path.join(__dirname, plainName);
  if (fs.existsSync(plainPath)) {
    return fs.readFileSync(plainPath, "utf8");
  }
  const files = fs.readdirSync(__dirname)
    .filter((name) => name.startsWith(prefix + ".src.b64.part-"))
    .sort();
  if (!files.length) throw new Error("RXV v2 source missing: " + prefix);
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
    privacyLevel: String(s.effectivePrivacyLevel || s.privacyLevel || ""),
    directSelfOnlyTest: Boolean(s.directSelfOnlyTest),
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
      if (url.pathname === "/api/rxv-tiktok-creator-info") {
        const creator = await accountApi.queryCreatorInfo();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ ok: true, creator: {
          creator_username: String(creator?.creator_username || "").replace(/^@+/, ""),
          privacy_level_options: Array.isArray(creator?.privacy_level_options) ? creator.privacy_level_options.map(String) : [],
          direct_self_only_test: Boolean(accountApi.publicStatus().directSelfOnlyTest),
          comment_disabled: Boolean(creator?.comment_disabled),
          duet_disabled: Boolean(creator?.duet_disabled),
          stitch_disabled: Boolean(creator?.stitch_disabled),
          max_video_post_duration_sec: Number(creator?.max_video_post_duration_sec || 0),
        } }));
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
  目前 Direct Post 測試會使用 SELF_ONLY（僅自己可見），先確認 TikTok API 可成功到 PUBLISH_COMPLETE。
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
      var modeLabel=mode==='upload'?'Upload Draft':(mode==='direct'?(a.directSelfOnlyTest?'Direct Post 測試（SELF_ONLY）':'Direct Post'):mode);
      var privacy=a.privacyLevel?('｜隱私：'+a.privacyLevel):'';
      var reauth=a.needsUploadReauth?'｜Upload：需重新授權':'';
      el.textContent='TikTok 已連線帳號：'+who+'｜授權：'+auth+'｜模式：'+modeLabel+privacy+'｜Audit設定：'+audit+reauth;
      if(hint){
        hint.style.display=(a.needsUploadReauth||a.directSelfOnlyTest)?'block':'none';
        if(a.directSelfOnlyTest){hint.firstChild.textContent='TikTok 測試模式：請先把 @'+(a.username||'目標帳號')+' 設為「私人帳號」，再用 SELF_ONLY 發布測試。 ';}
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

  const exactV3 = "RXV 圖片自動推廣器 v3</h1>";
  const exactV2 = "RXV 圖片自動推廣器 v2</h1>";
  if (source.includes(exactV3)) {
    return source.replace(exactV3, exactV3 + banner);
  }
  if (source.includes(exactV2)) {
    return source.replace(exactV2, exactV2 + banner);
  }

  const h1Pattern = /(RXV 圖片自動推廣器 v[23][\s\S]{0,120}?<\/h1>)/;
  if (h1Pattern.test(source)) {
    return source.replace(h1Pattern, "$1" + banner);
  }

  console.warn("[RXV v2] TikTok account banner injection target not found");
  return source;
}

function injectTikTokReviewDemo(sourceText) {
  let source = String(sourceText || "");
  if (source.includes("rxvTikTokReviewDemo")) return source;

  source = source.replace(
    'async function publishVideoJob(videoId, editedCaption = "") {',
    'async function publishVideoJob(videoId, editedCaption = "", tiktokOptions = {}) {'
  );
  source = source.replace(
    '      source: "manual",\n    });',
    '      source: "manual",\n      postOptions: tiktokOptions,\n    });'
  );
  source = source.replace(
    'return json(res, 200, await publishVideoJob(String(body.videoId || "").trim(), String(body.caption || "")));',
    'return json(res, 200, await publishVideoJob(String(body.videoId || "").trim(), String(body.caption || ""), body.tiktokOptions || {}));'
  );
  source = source.replace(
    '      message: String(result && result.message || ""),\n    };',
    '      message: String(result && result.message || ""),\n      providerStatus: String(result && result.providerResponse && result.providerResponse.status && result.providerResponse.status.status || (published ? "PUBLISH_COMPLETE" : needsManualAction ? "SEND_TO_USER_INBOX" : processing ? "PROCESSING_UPLOAD" : "")),\n      providerResponse: result && result.providerResponse || null,\n    };'
  );

  const demo = `
<style>
.rxvTikTokReviewDemo{margin-top:10px;padding:12px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc}.rxvTikTokReviewDemo label{display:block;margin:7px 0;font-size:13px}.rxvTikTokReviewDemo select{width:100%;padding:8px;margin-top:4px}.rxvTikTokReviewDemo .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px}.rxvTikTokReviewDemo .notice{font-size:12px;color:#475569;margin:8px 0}.rxvTikTokReviewDemo .result{white-space:pre-wrap;font-size:12px;margin-top:8px}.rxvTikTokReviewDemo .error{color:#b91c1c}
</style>
<script id="rxvTikTokReviewDemo">
(function(){
  var creator=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  async function api(url,init){var r=await fetch(url,init);var d=await r.json().catch(function(){return {}});if(!r.ok||!d.ok)throw new Error(d.message||d.error||('HTTP '+r.status));return d}
  function choice(label,key,disabled,checked){return '<label><input type="checkbox" data-rxv="'+key+'" '+(checked?'checked ':'')+(disabled?'disabled ':'')+'> '+label+(disabled?'（TikTok 目前停用）':'')+'</label>'}
  function decorate(){document.querySelectorAll('#jobs .card').forEach(function(card){if(card.querySelector('.rxvTikTokReviewDemo'))return;var old=card.querySelector('[data-a="publish"]');if(!old)return;old.style.display='none';var video=card.querySelector('video');var id=decodeURIComponent(old.dataset.id||'');var c=creator||{};var options=Array.isArray(c.privacy_level_options)?c.privacy_level_options:[];var selfOnly=options.length===1&&options[0]==='SELF_ONLY';var privacy='<option value="">請主動選擇誰可以觀看</option>'+options.map(function(x){return '<option value="'+esc(x)+'" '+(selfOnly&&x==='SELF_ONLY'?'selected':'')+'>'+esc(x)+'</option>'}).join('');var panel=document.createElement('section');panel.className='rxvTikTokReviewDemo';panel.innerHTML='<b>TikTok Production Review 發布確認</b><div class="notice">已授權帳號：'+esc(c.creator_username?'@'+c.creator_username:'查詢中')+'｜發布前請確認下方 MP4 預覽、文案與選項。</div>'+(video?'':'<div class="error">尚未產生可預覽 MP4，不能發布。</div>')+'<label>誰可以觀看<select data-rxv="privacy" '+(selfOnly?'disabled':'')+'>'+privacy+'</select></label><div class="grid">'+choice('Allow Comment','comment',!!c.comment_disabled,!c.comment_disabled)+choice('Allow Duet','duet',!!c.duet_disabled,!c.duet_disabled)+choice('Allow Stitch','stitch',!!c.stitch_disabled,!c.stitch_disabled)+'</div><div class="notice"><b>Commercial Content disclosure</b>（SELF_ONLY 測試時固定關閉）</div><div class="grid">'+choice('Promote my own brand','brandOrganic',selfOnly,false)+choice('Branded content','brandContent',selfOnly,false)+'</div><label><input type="checkbox" data-rxv="music"> By posting, you agree to TikTok\'s Music Usage Confirmation</label><button class="btn" data-rxv="confirm" '+(video?'':'disabled')+'>確認並發布 TikTok</button><div class="result" data-rxv="result"></div>';old.parentNode.insertBefore(panel,old);panel.querySelector('[data-rxv="confirm"]').addEventListener('click',async function(){var result=panel.querySelector('[data-rxv="result"]');var privacyEl=panel.querySelector('[data-rxv="privacy"]');var music=panel.querySelector('[data-rxv="music"]');if(!video){result.textContent='需要 MP4 預覽後才能發布。';return}if(!privacyEl.value){result.textContent='請先選擇「誰可以觀看」。';return}if(!music.checked){result.textContent='請先主動勾選 Music Usage Confirmation。';return}this.disabled=true;result.textContent='正在依 TikTok 官方流程發布：creator_info/query → video/init → FILE_UPLOAD → status/fetch…';try{var cap=card.querySelector('textarea');var d=await api('/api/jobs/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({videoId:id,caption:cap?cap.value:'',tiktokOptions:{privacyLevel:privacyEl.value,allowComment:!!panel.querySelector('[data-rxv="comment"]').checked,allowDuet:!!panel.querySelector('[data-rxv="duet"]').checked,allowStitch:!!panel.querySelector('[data-rxv="stitch"]').checked,brandOrganic:!!panel.querySelector('[data-rxv="brandOrganic"]').checked,brandContent:!!panel.querySelector('[data-rxv="brandContent"]').checked}})});result.textContent='publish_id: '+(d.publishId||'-')+'\\nTikTok processing status: '+(d.providerStatus||'-')+'\\n'+(d.published?'PUBLISH_COMPLETE':d.processing?'PROCESSING':d.needsManualAction?'SEND_TO_USER_INBOX':'')+(d.message?'\\n'+d.message:'');}catch(e){result.className='result error';result.textContent='FAILED: '+e.message}finally{this.disabled=false}})})}
  async function load(){try{var d=await api('/api/rxv-tiktok-creator-info?force=1');creator=d.creator||{};decorate()}catch(e){creator={privacy_level_options:[]};decorate();console.warn('[RXV TikTok review demo]',e.message)}}
  new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});load();
})();
</script>`;
  return source.replace('</body></html>', demo + '</body></html>');
}

let source = loadBundledSource("rxv-image-publisher-v2.cjs");
source = source.replace(/Audit：測試\/未通過/g, "Audit：本機未標記");
source = source.replace(/Audit：已通過/g, "Audit：本機已標記");
source = injectTikTokAccountBanner(source);
source = injectTikTokReviewDemo(source);

process.env.RXV_V2_BUNDLE_MAIN = "1";
const inner = new Module(path.join(__dirname, "rxv-image-publisher-v2.source.cjs"), module);
inner.filename = path.join(__dirname, "rxv-image-publisher-v2.source.cjs");
inner.paths = module.paths;
inner._compile(source, inner.filename);
module.exports = inner.exports;
