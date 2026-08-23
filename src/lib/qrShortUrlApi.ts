/**
 * QR 工具短網址：只呼叫專案內 POST /api/shorten（Supabase short_links，無第三方短網址 API）
 */

const SHORTEN_API_PATH = "/api/shorten";

export type ShortenSuccess = {
  ok: true;
  shortUrl: string;
  reused?: boolean;
  code?: string;
};
export type ShortenFailure = {
  ok: false;
  message: string;
  errorCode?: string;
  status: number;
  details?: string;
};

function devLog(...args: unknown[]) {
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.log("[qrShortUrl]", ...args);
  }
}

export async function requestShortenApi(body: {
  url: string;
  title?: string;
  description?: string;
}): Promise<ShortenSuccess | ShortenFailure> {
  const siteBase = typeof window !== "undefined" ? window.location.origin : "";

  devLog("原始要縮短的網址 (url)", body.url?.slice(0, 200));
  devLog("→ 呼叫 API 路徑", SHORTEN_API_PATH);
  devLog("→ siteBase (供後端組 short_url)", siteBase);

  let res: Response;
  try {
    res = await fetch(SHORTEN_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: body.url,
        title: body.title ?? "",
        description: body.description ?? body.url,
        siteBase,
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "NETWORK_ERROR";
    devLog("fetch threw", msg);
    return { ok: false, message: msg, errorCode: "NETWORK", status: 0 };
  }

  const text = await res.text();
  devLog("← response.status", res.status);
  devLog("← response 原始文字", text?.slice(0, 1200));

  let data: Record<string, unknown> | null = null;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    devLog("← JSON 解析失敗");
    return {
      ok: false,
      message: text?.slice(0, 200) || "INVALID_JSON",
      errorCode: "PARSE",
      status: res.status,
    };
  }

  devLog("← parse 後 JSON", data);

  const pickErrorCode = (): string | undefined => {
    const e = data?.error;
    return typeof e === "string" ? e : undefined;
  };

  if (!res.ok) {
    const msg =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      `HTTP_${res.status}`;
    return {
      ok: false,
      message: msg,
      errorCode: pickErrorCode(),
      details: typeof data?.details === "string" ? data.details : undefined,
      status: res.status,
    };
  }

  if (data && data.ok === false) {
    const msg =
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      "SHORTEN_FAILED";
    return {
      ok: false,
      message: msg,
      errorCode: pickErrorCode(),
      details: typeof data.details === "string" ? data.details : undefined,
      status: res.status,
    };
  }

  if (data?.fallback === true) {
    const msg =
      (typeof data.message === "string" && data.message) ||
      (typeof data.warning === "string" && data.warning) ||
      "FALLBACK";
    return { ok: false, message: msg, errorCode: "FALLBACK", status: res.status };
  }

  const shortUrl =
    typeof data?.short_url === "string"
      ? data.short_url.trim()
      : typeof data?.shortUrl === "string"
        ? data.shortUrl.trim()
        : "";

  if (!shortUrl) {
    return { ok: false, message: "MISSING_SHORT_URL", errorCode: "FORMAT", status: res.status };
  }

  const code = typeof data?.code === "string" ? data.code : undefined;

  devLog("✓ 最終 short_url", shortUrl, "code", code);

  return {
    ok: true,
    shortUrl,
    code,
    reused: data?.reused === true,
  };
}

/** 將使用者輸入轉成可送給後端的 http(s) 網址；失敗時回傳 null */
export function normalizeHttpUrlForShorten(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
