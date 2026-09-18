"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const axios = require("axios");

const TIKTOK_API_BASE = "https://open.tiktokapis.com";
const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const MIN_CHUNK = 5 * 1024 * 1024;
const DEFAULT_CHUNK = 32 * 1024 * 1024;
const MAX_CHUNK = 64 * 1024 * 1024;

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim().replace(/^['"]+|['"]+$/g, "");
}

function boolEnv(name, fallback = false) {
  const raw = env(name, fallback ? "1" : "0").toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

function safeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createHttpError(message, code = "TIKTOK_API_ERROR", status = 0, extra = {}) {
  const error = new Error(String(message || code));
  error.code = String(code || "TIKTOK_API_ERROR");
  error.status = Number(status || 0);
  Object.assign(error, extra || {});
  return error;
}

function normalizeScopes(value, mode) {
  const raw = String(value || "")
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  const scopes = new Set(raw);
  scopes.add("user.info.basic");
  if (mode === "direct") {
    scopes.add("video.publish");
    scopes.add("video.upload");
  } else {
    scopes.add("video.upload");
  }
  return [...scopes];
}

function truncateUtf16(value, maxUnits = 2200) {
  return String(value || "").slice(0, Math.max(0, Number(maxUnits || 0)));
}

function normalizeHashtagText(value) {
  const parts = String(value || "")
    .split(/[\s,，,]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (x.startsWith("#") ? x : `#${x.replace(/^#+/, "")}`));
  return [...new Set(parts)].join(" ");
}

function composeTikTokTitle({ publishText = "", payload = {}, row = {} } = {}) {
  const platformPayload = payload?.platforms?.tiktok || {};
  let text = String(
    publishText ||
      platformPayload?.publishText ||
      platformPayload?.caption ||
      platformPayload?.body ||
      "",
  ).trim();

  const affiliateUrl = String(
    payload?.affiliateUrl || row?.affiliate_url || row?.affiliateUrl || "",
  ).trim();
  const hashtags = normalizeHashtagText(platformPayload?.hashtags || "");

  if (affiliateUrl && !text.includes(affiliateUrl)) {
    text = `${text}${text ? "\n\n" : ""}商品連結：${affiliateUrl}\n部分連結為分潤連結`;
  }

  if (hashtags) {
    const missing = hashtags
      .split(/\s+/)
      .filter((tag) => tag && !text.includes(tag));
    if (missing.length) text = `${text}${text ? "\n\n" : ""}${missing.join(" ")}`;
  }

  return truncateUtf16(text.trim(), 2200);
}

function chooseUploadPlan(size) {
  const total = Number(size || 0);
  if (!Number.isFinite(total) || total <= 0) {
    throw createHttpError("VIDEO_FILE_INVALID", "VIDEO_FILE_INVALID");
  }

  if (total < MIN_CHUNK || total <= MAX_CHUNK) {
    return {
      videoSize: total,
      chunkSize: total,
      totalChunkCount: 1,
      chunks: [{ start: 0, end: total - 1, size: total }],
    };
  }

  const chunkSize = DEFAULT_CHUNK;
  const totalChunkCount = Math.max(1, Math.floor(total / chunkSize));
  const chunks = [];
  for (let i = 0; i < totalChunkCount; i += 1) {
    const start = i * chunkSize;
    const end = i === totalChunkCount - 1 ? total - 1 : start + chunkSize - 1;
    const sizeOfChunk = end - start + 1;
    chunks.push({ start, end, size: sizeOfChunk });
  }

  return { videoSize: total, chunkSize, totalChunkCount, chunks };
}

function createTikTokOfficialApi(options = {}) {
  const tokenDir = path.join(process.env.USERPROFILE || os.homedir(), ".rxv");
  const tokenFile = path.join(tokenDir, "tiktok-oauth.json");
  const oauthStates = new Map();

  const cache = {
    verifiedAt: "",
    user: null,
    creator: null,
    error: "",
  };

  function config() {
    const mode = ["direct", "upload"].includes(env("TIKTOK_POST_MODE", "upload").toLowerCase())
      ? env("TIKTOK_POST_MODE", "upload").toLowerCase()
      : "upload";
    return {
      clientKey: env("TIKTOK_CLIENT_KEY"),
      clientSecret: env("TIKTOK_CLIENT_SECRET"),
      redirectUri: env("TIKTOK_REDIRECT_URI", "http://localhost:3006/tiktok/oauth/callback/"),
      mode,
      privacyLevel: env("TIKTOK_PRIVACY_LEVEL", "SELF_ONLY").toUpperCase(),
      audited: boolEnv("TIKTOK_CLIENT_AUDITED", false),
      directSelfOnlyTest: boolEnv("TIKTOK_DIRECT_SELF_ONLY_TEST", !boolEnv("TIKTOK_CLIENT_AUDITED", false)),
      brandContent: boolEnv("TIKTOK_BRAND_CONTENT_TOGGLE", false),
      brandOrganic: boolEnv("TIKTOK_BRAND_ORGANIC_TOGGLE", false),
      isAigc: boolEnv("TIKTOK_IS_AIGC", false),
      allowScheduledUpload: boolEnv("TIKTOK_ALLOW_SCHEDULED_UPLOAD", false),
      timeoutMs: Math.max(15000, Number(env("TIKTOK_HTTP_TIMEOUT_MS", "180000")) || 180000),
      scopes: normalizeScopes(env("TIKTOK_OAUTH_SCOPES"), mode),
    };
  }

  function effectivePostMode(c = config()) {
    return c.mode;
  }

  function hasClientConfig() {
    const c = config();
    return Boolean(c.clientKey && c.clientSecret && c.redirectUri);
  }

  function readTokenStore() {
    try {
      if (!fs.existsSync(tokenFile)) return {};
      const parsed = JSON.parse(fs.readFileSync(tokenFile, "utf8"));
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeTokenStore(tokens = {}) {
    fs.mkdirSync(tokenDir, { recursive: true });
    const prior = readTokenStore();
    const now = Date.now();
    const safe = {
      ...prior,
      access_token: String(tokens.access_token || prior.access_token || ""),
      refresh_token: String(tokens.refresh_token || prior.refresh_token || ""),
      token_type: String(tokens.token_type || prior.token_type || "Bearer"),
      open_id: String(tokens.open_id || prior.open_id || ""),
      scope: String(tokens.scope || prior.scope || ""),
      account_display_name: String(tokens.account_display_name || prior.account_display_name || ""),
      creator_username: String(tokens.creator_username || prior.creator_username || ""),
      creator_nickname: String(tokens.creator_nickname || prior.creator_nickname || ""),
      access_expires_at: Number(
        tokens.access_expires_at ||
          (tokens.expires_in ? now + Number(tokens.expires_in) * 1000 : prior.access_expires_at || 0),
      ),
      refresh_expires_at: Number(
        tokens.refresh_expires_at ||
          (tokens.refresh_expires_in
            ? now + Number(tokens.refresh_expires_in) * 1000
            : prior.refresh_expires_at || 0),
      ),
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(tokenFile, JSON.stringify(safe, null, 2), "utf8");
    return safe;
  }

  function clearTokenStore() {
    try {
      if (fs.existsSync(tokenFile)) fs.unlinkSync(tokenFile);
    } catch {}
    cache.verifiedAt = "";
    cache.user = null;
    cache.creator = null;
    cache.error = "";
  }

  function grantedScopes() {
    return String(readTokenStore().scope || "")
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function hasStoredAuthorization() {
    const store = readTokenStore();
    return Boolean(
      store.refresh_token ||
        (store.access_token && Number(store.access_expires_at || 0) > Date.now() + 30000),
    );
  }

  function pkceVerifier() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const bytes = crypto.randomBytes(64);
    let out = "";
    for (const b of bytes) out += alphabet[b % alphabet.length];
    return out.slice(0, 64);
  }

  function pkceChallenge(verifier) {
    return crypto.createHash("sha256").update(String(verifier || "")).digest("hex");
  }

  function cleanupOauthStates() {
    const now = Date.now();
    for (const [key, value] of oauthStates.entries()) {
      if (!value || Number(value.expiresAt || 0) <= now) oauthStates.delete(key);
    }
  }

  function buildOAuthUrl() {
    if (!hasClientConfig()) throw createHttpError("TIKTOK_CLIENT_CONFIG_MISSING", "TIKTOK_CLIENT_CONFIG_MISSING");
    const c = config();
    cleanupOauthStates();
    const state = crypto.randomBytes(24).toString("hex");
    const verifier = pkceVerifier();
    const challenge = pkceChallenge(verifier);
    oauthStates.set(state, {
      verifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    const params = new URLSearchParams({
      client_key: c.clientKey,
      response_type: "code",
      scope: c.scopes.join(","),
      redirect_uri: c.redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    return `${TIKTOK_AUTH_URL}?${params.toString()}`;
  }

  async function exchangeCode(code, verifier) {
    const c = config();
    const body = new URLSearchParams({
      client_key: c.clientKey,
      client_secret: c.clientSecret,
      code: String(code || ""),
      grant_type: "authorization_code",
      redirect_uri: c.redirectUri,
      code_verifier: String(verifier || ""),
    });
    const response = await axios.post(`${TIKTOK_API_BASE}/v2/oauth/token/`, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      timeout: c.timeoutMs,
      validateStatus: () => true,
    });
    if (response.status < 200 || response.status >= 300 || response?.data?.error) {
      throw createHttpError(
        response?.data?.error_description || response?.data?.message || response?.data?.error || `TIKTOK_OAUTH_HTTP_${response.status}`,
        String(response?.data?.error || "TIKTOK_OAUTH_EXCHANGE_FAILED"),
        response.status,
      );
    }
    return writeTokenStore(response.data || {});
  }

  async function refreshAccessToken() {
    const c = config();
    const prior = readTokenStore();
    if (!prior.refresh_token) throw createHttpError("TIKTOK_REFRESH_TOKEN_MISSING", "TIKTOK_REFRESH_TOKEN_MISSING");
    const body = new URLSearchParams({
      client_key: c.clientKey,
      client_secret: c.clientSecret,
      grant_type: "refresh_token",
      refresh_token: String(prior.refresh_token),
    });
    const response = await axios.post(`${TIKTOK_API_BASE}/v2/oauth/token/`, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      timeout: c.timeoutMs,
      validateStatus: () => true,
    });
    if (response.status < 200 || response.status >= 300 || response?.data?.error) {
      throw createHttpError(
        response?.data?.error_description || response?.data?.message || response?.data?.error || `TIKTOK_REFRESH_HTTP_${response.status}`,
        String(response?.data?.error || "TIKTOK_TOKEN_REFRESH_FAILED"),
        response.status,
      );
    }
    return writeTokenStore(response.data || {});
  }

  async function getAccessToken() {
    if (!hasClientConfig()) throw createHttpError("TIKTOK_CLIENT_CONFIG_MISSING", "TIKTOK_CLIENT_CONFIG_MISSING");
    let store = readTokenStore();
    if (store.access_token && Number(store.access_expires_at || 0) > Date.now() + 60000) {
      return String(store.access_token);
    }
    store = await refreshAccessToken();
    if (!store.access_token) throw createHttpError("TIKTOK_ACCESS_TOKEN_MISSING", "TIKTOK_ACCESS_TOKEN_MISSING");
    return String(store.access_token);
  }

  function assertTikTokOk(response, fallbackCode) {
    const data = response?.data || {};
    const apiError = data?.error || {};
    const code = String(apiError?.code || "");
    if (response.status < 200 || response.status >= 300 || (code && code !== "ok")) {
      let message = apiError?.message || data?.message || `${fallbackCode}_HTTP_${response.status}`;
      if (code === "unaudited_client_can_only_post_to_private_accounts") {
        message = "TikTok 測試模式限制：目前 API client 尚未完成 audit。請先把目標 TikTok 帳號設為「私人帳號」，並維持影片隱私 SELF_ONLY，再重新發布。";
      } else if (code === "privacy_level_option_mismatch") {
        message = "TikTok 隱私設定不符合目前帳號可用選項，請重新驗證帳號後再發布。";
      } else if (code === "scope_not_authorized") {
        message = "TikTok OAuth 尚未授權 video.publish，請重新連接 TikTok OAuth。";
      }
      throw createHttpError(
        message,
        code && code !== "ok" ? code : fallbackCode,
        response.status,
        { logId: apiError?.log_id || apiError?.logid || "", providerMessage: apiError?.message || data?.message || "" },
      );
    }
    return data?.data || {};
  }

  async function apiGet(pathname, params = {}) {
    const token = await getAccessToken();
    const c = config();
    const response = await axios.get(`${TIKTOK_API_BASE}${pathname}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
      timeout: c.timeoutMs,
      validateStatus: () => true,
    });
    return assertTikTokOk(response, "TIKTOK_GET_FAILED");
  }

  async function apiPost(pathname, body = {}) {
    const token = await getAccessToken();
    const c = config();
    const response = await axios.post(`${TIKTOK_API_BASE}${pathname}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      timeout: c.timeoutMs,
      validateStatus: () => true,
    });
    return assertTikTokOk(response, "TIKTOK_POST_FAILED");
  }

  async function getUserInfo() {
    const data = await apiGet("/v2/user/info/", {
      fields: "open_id,union_id,avatar_url,display_name",
    });
    return data?.user || {};
  }

  async function queryCreatorInfo() {
    return apiPost("/v2/post/publish/creator_info/query/", {});
  }

  async function verifyConnection() {
    const result = {
      ok: true,
      configured: hasClientConfig(),
      authorized: hasStoredAuthorization(),
      mode: effectivePostMode(config()),
      configuredMode: config().mode,
      scopesRequested: config().scopes,
      scopesGranted: grantedScopes(),
      user: null,
      creator: null,
      verifiedAt: new Date().toISOString(),
      error: "",
    };
    if (!result.configured) {
      result.ok = false;
      result.error = "TIKTOK_CLIENT_CONFIG_MISSING";
      return result;
    }
    if (!result.authorized) {
      result.ok = false;
      result.error = "TIKTOK_OAUTH_REQUIRED";
      return result;
    }
    try {
      result.user = await getUserInfo();
      if (grantedScopes().includes("video.publish")) {
        result.creator = await queryCreatorInfo();
      }
      cache.verifiedAt = result.verifiedAt;
      cache.user = result.user || null;
      cache.creator = result.creator || null;
      cache.error = "";
      writeTokenStore({
        account_display_name: String(result.user?.display_name || ""),
        creator_username: String(result.creator?.creator_username || ""),
        creator_nickname: String(result.creator?.creator_nickname || ""),
      });
    } catch (error) {
      result.ok = false;
      result.error = String(error?.code || error?.message || error);
      cache.verifiedAt = result.verifiedAt;
      cache.error = result.error;
    }
    return result;
  }

  function publicStatus() {
    const c = config();
    const store = readTokenStore();
    const persistedUser = store.account_display_name ? { display_name: String(store.account_display_name) } : null;
    const persistedCreator = (store.creator_username || store.creator_nickname)
      ? {
          creator_username: String(store.creator_username || ""),
          creator_nickname: String(store.creator_nickname || ""),
        }
      : null;
    return {
      provider: "tiktok-content-posting-api",
      configured: hasClientConfig(),
      authorized: hasStoredAuthorization(),
      clientKey: c.clientKey ? "present-not-exposed" : "missing",
      clientSecret: c.clientSecret ? "present-not-exposed" : "missing",
      redirectUri: c.redirectUri,
      configuredPostMode: c.mode,
      postMode: effectivePostMode(c),
      privacyLevel: c.privacyLevel,
      effectivePrivacyLevel: c.mode === "direct" && c.directSelfOnlyTest ? "SELF_ONLY" : c.privacyLevel,
      directSelfOnlyTest: Boolean(c.directSelfOnlyTest),
      audited: c.audited,
      auditStatusSource: "local_env_only",
      auditStatusNote: "TIKTOK_CLIENT_AUDITED is only a local setting; it is not fetched from TikTok.",
      scopesRequested: c.scopes,
      scopesGranted: grantedScopes(),
      needsUploadReauth: effectivePostMode(c) === "upload" && !grantedScopes().includes("video.upload"),
      openId: store.open_id ? "present-not-exposed" : "missing",
      tokenStorage: "local-user-profile",
      tokenFile,
      user: cache.user || persistedUser,
      creator: cache.creator || persistedCreator,
      verifiedAt: cache.verifiedAt,
      error: cache.error,
      cloudStagingUsed: false,
      browserAutomationUsed: false,
    };
  }

  async function uploadChunks(uploadUrl, videoPath, plan) {
    const c = config();
    for (let i = 0; i < plan.chunks.length; i += 1) {
      const chunk = plan.chunks[i];
      const isLast = i === plan.chunks.length - 1;
      const response = await axios.put(
        uploadUrl,
        fs.createReadStream(videoPath, { start: chunk.start, end: chunk.end }),
        {
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": String(chunk.size),
            "Content-Range": `bytes ${chunk.start}-${chunk.end}/${plan.videoSize}`,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: c.timeoutMs,
          validateStatus: () => true,
        },
      );
      const expected = isLast ? [200, 201] : [200, 206];
      if (!expected.includes(response.status)) {
        throw createHttpError(
          `TikTok upload chunk ${i + 1}/${plan.chunks.length} failed (HTTP ${response.status})`,
          "TIKTOK_FILE_UPLOAD_FAILED",
          response.status,
        );
      }
    }
  }

  async function fetchPublishStatus(publishId) {
    if (!publishId) throw createHttpError("TIKTOK_PUBLISH_ID_REQUIRED", "TIKTOK_PUBLISH_ID_REQUIRED");
    return apiPost("/v2/post/publish/status/fetch/", { publish_id: String(publishId) });
  }

  async function waitForStatus(publishId, desired, timeoutMs = 90000) {
    const started = Date.now();
    let last = null;
    while (Date.now() - started < timeoutMs) {
      last = await fetchPublishStatus(publishId);
      const status = String(last?.status || "");
      if (status === "FAILED") {
        throw createHttpError(
          String(last?.fail_reason || "TIKTOK_PROCESSING_FAILED"),
          "TIKTOK_PROCESSING_FAILED",
          0,
          { providerStatus: status, providerData: last },
        );
      }
      if (desired.includes(status)) return last;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return last || { status: "PROCESSING_UPLOAD" };
  }

  async function initUploadDraft({ plan }) {
    return apiPost("/v2/post/publish/inbox/video/init/", {
      source_info: {
        source: "FILE_UPLOAD",
        video_size: plan.videoSize,
        chunk_size: plan.chunkSize,
        total_chunk_count: plan.totalChunkCount,
      },
    });
  }

  async function initDirectPost({ plan, title, creator, postOptions = {} }) {
    const c = config();
    const options = Array.isArray(creator?.privacy_level_options)
      ? creator.privacy_level_options.map((x) => String(x))
      : [];

    const requestedPrivacy = String(postOptions?.privacyLevel || "").trim().toUpperCase();
    let privacyLevel = c.directSelfOnlyTest ? "SELF_ONLY" : (requestedPrivacy || c.privacyLevel);
    if (options.length && !options.includes(privacyLevel)) {
      privacyLevel = options.includes("SELF_ONLY") ? "SELF_ONLY" : options[0];
    }
    if (!privacyLevel) throw createHttpError("TIKTOK_PRIVACY_LEVEL_UNAVAILABLE", "TIKTOK_PRIVACY_LEVEL_UNAVAILABLE");

    const allowComment = !Boolean(creator?.comment_disabled) && postOptions?.allowComment !== false;
    const allowDuet = !Boolean(creator?.duet_disabled) && postOptions?.allowDuet !== false;
    const allowStitch = !Boolean(creator?.stitch_disabled) && postOptions?.allowStitch !== false;
    const brandContent = privacyLevel === "SELF_ONLY" ? false : Boolean(postOptions?.brandContent);
    const brandOrganic = privacyLevel === "SELF_ONLY" ? false : Boolean(postOptions?.brandOrganic);

    return apiPost("/v2/post/publish/video/init/", {
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_duet: !allowDuet,
        disable_comment: !allowComment,
        disable_stitch: !allowStitch,
        video_cover_timestamp_ms: 1000,
        brand_content_toggle: brandContent,
        brand_organic_toggle: brandOrganic,
        is_aigc: Boolean(c.isAigc),
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: plan.videoSize,
        chunk_size: plan.chunkSize,
        total_chunk_count: plan.totalChunkCount,
      },
    });
  }

  async function publishPublisherJob({ row, payload, publishText, source = "manual", postOptions = {} } = {}) {
    const c = config();
    const publishMode = effectivePostMode(c);
    if (!hasClientConfig()) throw createHttpError("TIKTOK_CLIENT_CONFIG_MISSING", "TIKTOK_CLIENT_CONFIG_MISSING");
    if (!hasStoredAuthorization()) throw createHttpError("TIKTOK_OAUTH_REQUIRED", "TIKTOK_OAUTH_REQUIRED");

    if (publishMode === "upload" && !grantedScopes().includes("video.upload")) {
      throw createHttpError(
        "目前使用 Upload Draft，但 OAuth 沒有 video.upload 權限。請重新連接 TikTok 後再試一次。",
        "TIKTOK_UPLOAD_SCOPE_REQUIRED",
      );
    }

    const manual = String(source || "") === "manual";
    if (!manual && !(publishMode === "upload" && c.allowScheduledUpload)) {
      throw createHttpError(
        "TikTok 官方 Content Posting API 需要使用者在送出內容時明確同意；V40.0 預設只允許手動按「立即發布」觸發。",
        "TIKTOK_EXPLICIT_CONSENT_REQUIRED",
      );
    }

    const videoPath = String(row?.video_path || "").trim();
    if (!videoPath || !fs.existsSync(videoPath)) {
      throw createHttpError("VIDEO_FILE_NOT_FOUND", "VIDEO_FILE_NOT_FOUND");
    }
    if (publishMode === "upload" && !/_tiktok_safe\.mp4$/i.test(videoPath)) {
      throw createHttpError(
        "這支是舊版促銷 MP4。請先重新產生 TikTok 專用乾淨版（無 QR、網址、LINE、價格 CTA）再上傳。",
        "TIKTOK_SAFE_VIDEO_REQUIRED",
      );
    }

    const stat = await fsp.stat(videoPath);
    if (!stat.isFile() || stat.size <= 0) {
      throw createHttpError("VIDEO_FILE_INVALID", "VIDEO_FILE_INVALID");
    }
    const plan = chooseUploadPlan(stat.size);
    const title = composeTikTokTitle({ publishText, payload, row });

    if (publishMode === "upload") {
      const init = await initUploadDraft({ plan });
      const publishId = String(init?.publish_id || "");
      const uploadUrl = String(init?.upload_url || "");
      if (!publishId || !uploadUrl) {
        throw createHttpError("TIKTOK_UPLOAD_INIT_RESPONSE_INVALID", "TIKTOK_UPLOAD_INIT_RESPONSE_INVALID");
      }
      await uploadChunks(uploadUrl, videoPath, plan);
      const status = await waitForStatus(
        publishId,
        ["SEND_TO_USER_INBOX", "PUBLISH_COMPLETE"],
        90000,
      );
      return {
        needsManualAction: true,
        remotePostId: publishId,
        publishedUrl: "",
        message: "影片已透過 TikTok 官方 Upload API 傳到帳號草稿／收件匣；請在 TikTok App 內完成最後編輯與發布。",
        providerResponse: {
          mode: "upload",
          configuredMode: c.mode,
          autoFallbackFromDirect: c.mode === "direct" && !c.audited,
          publishId,
          status,
          cloudStagingUsed: false,
        },
      };
    }

    const creator = await queryCreatorInfo();
    const maxDuration = Number(creator?.max_video_post_duration_sec || 0);
    const rowDuration = Number(row?.duration_sec || row?.video_duration || 0);
    if (maxDuration > 0 && rowDuration > 0 && rowDuration > maxDuration) {
      throw createHttpError(
        `影片長度 ${rowDuration}s 超過 TikTok 目前允許的 ${maxDuration}s`,
        "TIKTOK_VIDEO_DURATION_EXCEEDS_CREATOR_LIMIT",
      );
    }

    const init = await initDirectPost({ plan, title, creator, postOptions });
    const publishId = String(init?.publish_id || "");
    const uploadUrl = String(init?.upload_url || "");
    if (!publishId || !uploadUrl) {
      throw createHttpError("TIKTOK_DIRECT_INIT_RESPONSE_INVALID", "TIKTOK_DIRECT_INIT_RESPONSE_INVALID");
    }
    await uploadChunks(uploadUrl, videoPath, plan);
    const status = await waitForStatus(publishId, ["PUBLISH_COMPLETE"], 120000);
    const finished = String(status?.status || "") === "PUBLISH_COMPLETE";
    if (!finished) {
      return {
        processing: true,
        remotePostId: publishId,
        publishedUrl: "",
        message: `TikTok 已收件，目前狀態：${String(status?.status || "PROCESSING")}`,
        providerResponse: {
          mode: "direct",
          publishId,
          status,
          privacyLevel: c.directSelfOnlyTest ? "SELF_ONLY" : c.privacyLevel,
          directSelfOnlyTest: Boolean(c.directSelfOnlyTest),
          cloudStagingUsed: false,
        },
      };
    }

    const publicIds = Array.isArray(status?.publicaly_available_post_id)
      ? status.publicaly_available_post_id
      : [];
    const postId = publicIds.length ? String(publicIds[0]) : "";
    const username = String(creator?.creator_username || "").replace(/^@+/, "");
    const publishedUrl = postId && username ? `https://www.tiktok.com/@${username}/video/${postId}` : "";
    return {
      remotePostId: postId || publishId,
      publishedUrl,
      providerResponse: {
        mode: "direct",
        publishId,
        postId,
        status,
        privacyLevel: c.directSelfOnlyTest ? "SELF_ONLY" : c.privacyLevel,
        directSelfOnlyTest: Boolean(c.directSelfOnlyTest),
        creatorUsername: username,
        cloudStagingUsed: false,
      },
    };
  }

  function setupHtml({ verified = null } = {}) {
    const s = publicStatus();
    const user = verified?.user || s.user || {};
    const creator = verified?.creator || s.creator || {};
    const scopes = (s.scopesGranted || []).join(", ") || "尚未授權";
    const requested = (s.scopesRequested || []).join(", ");
    const connected = Boolean(s.authorized);
    const configured = Boolean(s.configured);
    const modeText = s.postMode === "direct"
      ? (s.directSelfOnlyTest ? "Direct Post 測試（SELF_ONLY／僅自己可見）" : "Direct Post（直接發布）")
      : "Upload Draft（上傳草稿）";
    const warning = s.postMode === "direct"
      ? (s.directSelfOnlyTest
          ? "目前沿用先前蝦皮影音成功測試路徑：Direct Post + SELF_ONLY。若 API client 尚未完成 audit，TikTok 要求目標帳號本身也必須先設為私人帳號。測試成功後再處理公開權限。"
          : "Direct Post 會直接呼叫 TikTok 官方 API。Audit 顯示僅為本機設定，不代表 TikTok 官方即時審核狀態。")
      : (s.needsUploadReauth
          ? "目前需要重新連接 TikTok，取得 video.upload 授權後才能傳到草稿／收件匣。"
          : "Upload Draft 會把 TikTok 專用乾淨版 MP4 傳到帳號草稿／收件匣；最後文字與正式發布請在 TikTok App 完成。");

    return `<!doctype html>
<meta charset="utf-8">
<title>RxV V40.0 TikTok Official API</title>
<style>
body{font-family:Arial,"Microsoft JhengHei",sans-serif;background:#f7f8fb;color:#18181b;margin:0;padding:28px}
.card{max-width:860px;margin:auto;background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,.05)}
h1{font-size:24px;margin:0 0 16px}.ok{color:#087f5b}.bad{color:#c92a2a}.muted{color:#71717a}.row{padding:8px 0;border-bottom:1px solid #f1f1f1}.btn{display:inline-block;margin:12px 8px 0 0;padding:10px 15px;border-radius:10px;background:#111827;color:#fff;text-decoration:none;border:0;cursor:pointer}.secondary{background:#475569}.warn{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px;margin-top:16px;line-height:1.6}code{background:#f4f4f5;padding:2px 5px;border-radius:5px}
</style>
<div class="card">
<h1>RxV V40.0｜TikTok Official API</h1>
<div class="row">設定：<b class="${configured ? "ok" : "bad"}">${configured ? "完成" : "尚未設定 Client Key / Secret"}</b></div>
<div class="row">OAuth：<b class="${connected ? "ok" : "bad"}">${connected ? "已授權" : "尚未授權"}</b></div>
<div class="row">模式：<b>${safeHtml(modeText)}</b></div>\n<div class="row">實際隱私：<b>${safeHtml(s.effectivePrivacyLevel || s.privacyLevel || "")}</b></div>\n<div class="row">Upload 授權：<b class="${s.needsUploadReauth ? "bad" : "ok"}">${s.needsUploadReauth ? "需要重新連接 TikTok" : "可用"}</b></div>
<div class="row">Redirect URI：<code>${safeHtml(s.redirectUri)}</code></div>
<div class="row">要求 Scopes：<code>${safeHtml(requested)}</code></div>
<div class="row">已授權 Scopes：<code>${safeHtml(scopes)}</code></div>
<div class="row">TikTok 帳號：<b>${safeHtml(user.display_name || creator.creator_nickname || "尚未驗證")}</b></div>
<div class="row">Creator username：<b>${safeHtml(creator.creator_username || "")}</b></div>
<div class="row">Audit：<b>${s.audited ? "本機設定：已標記通過" : "本機設定：未標記（非 TikTok 官方查詢結果）"}</b></div>
<a class="btn" href="/tiktok/oauth/start">連接 TikTok OAuth</a>
<a class="btn secondary" href="/tiktok/setup?verify=1">重新驗證</a>
<button class="btn secondary" onclick="fetch('/tiktok/disconnect',{method:'POST'}).then(()=>location.reload())">清除本機 TikTok 授權</button>
<div class="warn"><b>目前模式說明：</b><br>${safeHtml(warning)}<br><br>影片來源固定使用本機 <code>D:\\out_mp4</code> 的 job 影片，透過 TikTok 官方 <code>FILE_UPLOAD</code> 傳送；不需要 R2，也不再操作 TikTok Studio DOM。</div>
${verified && !verified.ok ? `<div class="warn bad"><b>驗證失敗：</b> ${safeHtml(verified.error || "")}</div>` : ""}
</div>`;
  }

  function registerRoutes(app) {
    if (!app || typeof app.get !== "function") return;

    app.get("/tiktok/status", async (req, res) => {
      try {
        const verify = String(req.query?.verify || "") === "1";
        const verified = verify ? await verifyConnection() : null;
        return res.status(verified && !verified.ok ? 409 : 200).json({
          ok: !verified || verified.ok,
          status: publicStatus(),
          verified,
        });
      } catch (error) {
        return res.status(500).json({
          ok: false,
          error: String(error?.code || "TIKTOK_STATUS_FAILED"),
          message: String(error?.message || error),
          status: publicStatus(),
        });
      }
    });

    app.get("/tiktok/setup", async (req, res) => {
      let verified = null;
      if (String(req.query?.verify || "") === "1" && hasStoredAuthorization()) {
        try { verified = await verifyConnection(); } catch (error) {
          verified = { ok: false, error: String(error?.code || error?.message || error) };
        }
      }
      res.type("html").send(setupHtml({ verified }));
    });

    app.get("/tiktok/oauth/start", (req, res) => {
      try {
        const url = buildOAuthUrl();
        if (String(req.query?.format || "") === "json") return res.json({ ok: true, authUrl: url });
        return res.redirect(url);
      } catch (error) {
        return res.status(409).send(`TikTok OAuth 尚未設定：${safeHtml(error?.message || error)}`);
      }
    });

    const oauthCallback = async (req, res) => {
      const oauthError = String(req.query?.error || "");
      const description = String(req.query?.error_description || "");
      const code = String(req.query?.code || "");
      const state = String(req.query?.state || "");
      if (oauthError) return res.status(400).send(`TikTok 授權未完成：${safeHtml(description || oauthError)}`);
      cleanupOauthStates();
      const stateData = oauthStates.get(state);
      oauthStates.delete(state);
      if (!state || !stateData || Number(stateData.expiresAt || 0) < Date.now()) {
        return res.status(400).send("TikTok OAuth state 無效或已過期，請回 RxV 重新連接。");
      }
      if (!code) return res.status(400).send("TikTok OAuth 沒有回傳授權碼。");
      try {
        await exchangeCode(code, stateData.verifier);
        const verified = await verifyConnection();
        const display = safeHtml(verified?.user?.display_name || verified?.creator?.creator_nickname || "TikTok 帳號");
        return res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:Arial,'Microsoft JhengHei';padding:32px"><h2>TikTok 已連線</h2><p>帳號：${display}</p><p>可以關閉這個視窗，回 RxV 發布中心。</p><p><a href="/tiktok/setup">查看 TikTok API 狀態</a></p><script>if(window.opener){try{window.opener.postMessage({type:'rxv-tiktok-oauth-success'},'http://localhost:3005')}catch(e){}}setTimeout(()=>{try{window.close()}catch(e){}},1800);</script></body>`);
      } catch (error) {
        return res.status(500).send(`TikTok 授權交換失敗：${safeHtml(error?.message || error)}`);
      }
    };
    app.get("/tiktok/oauth/callback", oauthCallback);
    app.get("/tiktok/oauth/callback/", oauthCallback);

    app.post("/tiktok/test", async (_req, res) => {
      try {
        const verified = await verifyConnection();
        return res.status(verified.ok ? 200 : 409).json({
          ok: verified.ok,
          verified,
          status: publicStatus(),
        });
      } catch (error) {
        return res.status(500).json({
          ok: false,
          error: String(error?.code || "TIKTOK_CONNECTION_TEST_FAILED"),
          message: String(error?.message || error),
          status: publicStatus(),
        });
      }
    });

    app.post("/tiktok/disconnect", (_req, res) => {
      clearTokenStore();
      return res.json({ ok: true, status: publicStatus() });
    });

    app.post("/tiktok/publish-status", async (req, res) => {
      try {
        const publishId = String(req.body?.publishId || "").trim();
        const status = await fetchPublishStatus(publishId);
        return res.json({ ok: true, publishId, status });
      } catch (error) {
        return res.status(500).json({
          ok: false,
          error: String(error?.code || "TIKTOK_STATUS_FETCH_FAILED"),
          message: String(error?.message || error),
        });
      }
    });
  }

  if (hasStoredAuthorization()) {
    setTimeout(() => {
      verifyConnection().catch((error) => {
        cache.error = String(error?.code || error?.message || error || "");
      });
    }, 150);
  }

  return {
    registerRoutes,
    hasClientConfig,
    hasStoredAuthorization,
    publicStatus,
    verifyConnection,
    publishPublisherJob,
    fetchPublishStatus,
    getUserInfo,
    queryCreatorInfo,
    composeTikTokTitle,
  };
}

module.exports = { createTikTokOfficialApi };
