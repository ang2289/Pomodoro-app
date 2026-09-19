import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import SEO, { getBaseUrl } from "@/components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";
import "./QrCodeTool.css";
import {
  compositeQrToCanvas,
  type LabelPosition,
  type LabelStyle,
} from "@/lib/qrCompositeCanvas";
import {
  normalizeHttpUrlForShorten,
  requestShortenApi,
  type ShortenFailure,
} from "@/lib/qrShortUrlApi";



type QrType = "url" | "text" | "email" | "phone" | "wifi";
type WifiSec = "WPA" | "WPA3" | "WEP" | "nopass";
type BusinessTemplate = "restaurant" | "ig" | "card" | null;

const SIZE_OPTIONS = [256, 512, 720, 1080] as const;

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function escapeWifiValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:");
}

function buildWifiPayload(
  ssid: string,
  password: string,
  security: WifiSec,
) {
  const safeSsid = escapeWifiValue(ssid.trim() || "WiFi");
  const safePassword = escapeWifiValue(password.trim());

  if (security === "nopass") {
    return `WIFI:T:nopass;S:${safeSsid};;`;
  }

  return `WIFI:T:${security};S:${safeSsid};P:${safePassword};;`;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "").trim();
  const normalized = value.length === 3
    ? value.split("").map((char) => `${char}${char}`).join("")
    : value;

  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) return { r: 0, g: 0, b: 0 };

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const values = [r, g, b].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function getContrast(foreground: string, background: string) {
  const fg = getRelativeLuminance(foreground);
  const bg = getRelativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);

  return (lighter + 0.05) / (darker + 0.05);
}

function PhotoRoomAffiliateBlock() {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = "RxV QR Code 產生器，可快速製作商家、名片、社群分享用 QR Code。";

  const openShareWindow = (target: string) => {
    if (typeof window === "undefined") return;
    window.open(target, "_blank", "noopener,noreferrer,width=720,height=640");
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    alert("已複製分享連結");
  };

  return (
    <section className="mt-10 mb-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
          AI Creator Tools
        </span>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          PhotoRoom 創作者推薦工具
        </h3>
      </div>
      <p className="mb-5 text-sm text-slate-500 leading-relaxed">
        可搭配本頁工具使用：先用 PhotoRoom 產生圖片素材、去背整理，再壓縮、轉尺寸、做成貼圖、QR 圖卡或短影音。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://www.photoroom.com/zh-tw/tools/ai-image-generator"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            AI
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
              PhotoRoom AI 圖片生成
            </h4>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
              HOT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            不會畫畫也能快速產生商品圖、貼圖角色、社群素材與短影音封面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white group-hover:bg-blue-700">
            立即生成圖片
          </span>
        </a>
        <a
          href="https://www.photoroom.com/zh-tw/tools/background-remover"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            BG
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
              PhotoRoom AI 去背工具
            </h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
              推薦
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            上架貼圖、商品圖或社群圖前先去背，讓素材更乾淨、更好搭配版面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-purple-600 px-3 py-2 text-xs font-black text-white group-hover:bg-purple-700">
            立即去背圖片
          </span>
        </a>
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-sm font-bold text-slate-700">分享這個 QR Code 工具</h4>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={() => openShareWindow(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold !text-white hover:bg-emerald-600">LINE</button>
          <button type="button" onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold !text-white hover:bg-blue-700">FB</button>
          <button type="button" onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold !text-white hover:bg-black">X</button>
          <button type="button" onClick={copyShareLink} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">複製</button>
        </div>
      </div>
    </section>
  );
}

export default function QrCodeTool() {
  const { t, i18n } = useTranslation();

  const typeTabs = useMemo(
    () =>
      [
        { id: "url" as const, label: t("qr.tabs.url") },
        { id: "text" as const, label: t("qr.tabs.text") },
        { id: "email" as const, label: t("qr.tabs.email") },
        { id: "phone" as const, label: t("qr.tabs.phone") },
        { id: "wifi" as const, label: t("qr.tabs.wifi") },
      ] satisfies { id: QrType; label: string }[],
    [t],
  );

  const socialSizes = useMemo(
    () => [
      { name: t("qr.social.ig"), size: 1080 },
      { name: t("qr.social.line"), size: 720 },
      { name: t("qr.social.card"), size: 512 },
    ],
    [t],
  );

  const wifiSecOptions = useMemo(
    () =>
      [
        { value: "WPA" as const, label: t("qr.wifiSec.wpa") },
        { value: "WPA3" as const, label: t("qr.wifiSec.wpa3") },
        { value: "WEP" as const, label: t("qr.wifiSec.wep") },
        { value: "nopass" as const, label: t("qr.wifiSec.nopass") },
      ] as const,
    [t],
  );

  const [qrType, setQrType] = useState<QrType>("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<WifiSec>("WPA");

  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState<number>(512);
  const [qrStyle, setQrStyle] = useState<"classic" | "blue" | "green" | "gold">(
    "classic",
  );
  const didPickQrStyleRef = useRef(false);

  const getQRStyle = () => {
    switch (qrStyle) {
      case "blue":
        return { color: "#2563eb", bg: "#ffffff" };
      case "green":
        return { color: "#16a34a", bg: "#ffffff" };
      case "gold":
        return { color: "#b45309", bg: "#000000" };
      case "classic":
      default:
        return { color: "#000000", bg: "#ffffff" };
    }
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);
  /** data: URL，下載 SVG 時可內嵌、離線仍有效（blob: 無法寫入檔案） */
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const [shortUrl, setShortUrl] = useState("");
  const [shortUrlLoading, setShortUrlLoading] = useState(false);
  const [shortUrlError, setShortUrlError] = useState("");
  const [shortUrlNotice, setShortUrlNotice] = useState("");
  /** 按下「產生短網址」成功後，提示已寫回網址欄 */
  const [shortUrlAppliedToField, setShortUrlAppliedToField] = useState(false);
  const [businessTemplate, setBusinessTemplate] =
    useState<BusinessTemplate>(null);

  /** QR 說明貼紙／標籤卡片 */
  const [labelShowDescription, setLabelShowDescription] = useState(false);
  const [labelDescription, setLabelDescription] = useState("掃描查看內容");
  const [labelShowPayload, setLabelShowPayload] = useState(false);
  const [labelPosition, setLabelPosition] = useState<LabelPosition>("bottom");
  const [labelStyle, setLabelStyle] = useState<LabelStyle>("simple_white");

  /** 從 ?data= 還原的 QR 內容（與表單擇一；編輯表單後會清空） */
  const [content, setContent] = useState("");

  const contrastRatio = getContrast(fgColor, bgColor);
  const isLowContrast = contrastRatio < 4;

  const applyBusinessTemplate = (template: Exclude<BusinessTemplate, null>) => {
    setBusinessTemplate(template);
    setLogoFile(null);
    setContent("");

    if (template === "restaurant") {
      setQrType("url");
      setUrlInput(t("qr.template.restaurantUrl"));
      setFgColor("#d4af37");
      setBgColor("#111111");
      return;
    }

    if (template === "ig") {
      setQrType("url");
      setUrlInput(t("qr.template.igUrl"));
      // 以鮮豔粉色系近似 IG 風格（QR 本體不支援漸層模組）
      setFgColor("#ec4899");
      setBgColor("#fff1f7");
      return;
    }

    setQrType("text");
    setTextInput(t("qr.template.vcard"));
    setFgColor("#1f2937");
    setBgColor("#ffffff");
  };

  const resetBusinessTemplate = () => {
    setBusinessTemplate(null);
    setQrType("url");
    setUrlInput("");
    setTextInput("");
    setEmailInput("");
    setPhoneInput("");
    setWifiSsid("");
    setWifiPassword("");
    setWifiSecurity("WPA");
    setContent("");
    setFgColor("#000000");
    setBgColor("#ffffff");
    setLogoFile(null);
  };

  const previewCardClass =
    businessTemplate === "restaurant"
      ? "border border-amber-200 bg-gradient-to-br from-[#1b1b1b] to-[#101010]"
      : businessTemplate === "ig"
        ? "border border-pink-200 bg-gradient-to-br from-pink-100 via-fuchsia-50 to-purple-100"
        : "bg-gray-100";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const compositePreviewRef = useRef<HTMLCanvasElement>(null);
  const compositePhoneRef = useRef<HTMLCanvasElement>(null);
  const skipClearContentFromInputsEffect = useRef(true);

  // 商業模板只在使用者點模板後才套用顏色，避免覆蓋 localStorage/手動輸入
  useEffect(() => {
    if (!didPickQrStyleRef.current) return;
    const style = getQRStyle();
    setFgColor(style.color);
    setBgColor(style.bg);
  }, [qrStyle]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) {
      try {
        setContent(decodeURIComponent(data));
      } catch {
        /* ignore 無效編碼 */
      }
    }
  }, []);

  /** 使用者編輯表單後改以表單為準，不再沿用網址帶入的 content */
  useEffect(() => {
    if (skipClearContentFromInputsEffect.current) {
      skipClearContentFromInputsEffect.current = false;
      return;
    }
    setContent("");
  }, [urlInput, textInput, emailInput, phoneInput, wifiSsid, wifiPassword]);

  useEffect(() => {
    const savedFg = localStorage.getItem("qr_fg");
    const savedBg = localStorage.getItem("qr_bg");

    if (savedFg) setFgColor(savedFg);
    if (savedBg) setBgColor(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem("qr_fg", fgColor);
    localStorage.setItem("qr_bg", bgColor);
  }, [fgColor, bgColor]);

  useEffect(() => {
    if (!logoFile) {
      setLogoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.onerror = () => setLogoDataUrl(null);
    reader.readAsDataURL(logoFile);
  }, [logoFile]);

  // 排行榜區塊已先由頁面/元件層停用；不要用全頁文字掃描隱藏，避免把整個 QR 頁一起隱藏。

  /** 預覽／貼紙上顯示的「實際內容」文字（與 QR 編碼一致、可讀格式） */
  const payloadDisplayText = useMemo(() => {
    if (content.trim()) return content.trim();
    switch (qrType) {
      case "url":
        return urlInput.trim();
      case "text":
        return textInput.trim();
      case "email":
        return emailInput.trim() ? `mailto:${emailInput.trim()}` : "";
      case "phone": {
        const n = normalizePhone(phoneInput.trim());
        return n ? `tel:${n}` : "";
      }
      case "wifi":
        return wifiSsid.trim()
          ? `Wi-Fi：${wifiSsid.trim()}（${wifiSecurity === "nopass" ? "無密碼" : wifiSecurity}）`
          : "";
      default:
        return "";
    }
  }, [
    content,
    qrType,
    urlInput,
    textInput,
    emailInput,
    phoneInput,
    wifiSsid,
    wifiSecurity,
  ]);

  const encodedValue = useMemo(() => {
    const fromUrl = content.trim();
    if (fromUrl) return fromUrl;
    switch (qrType) {
      case "url": {
        const u = urlInput.trim();
        return u.length > 0 ? u : "https://example.com";
      }
      case "text": {
        const textTrimmed = textInput.trim();
        return textTrimmed.length > 0
          ? textTrimmed
          : t("qr.placeholder.textDefault");
      }
      case "email": {
        const e = emailInput.trim();
        return e.length > 0 ? `mailto:${e}` : "mailto:example@email.com";
      }
      case "phone": {
        const p = phoneInput.trim();
        const n = normalizePhone(p);
        return n.length > 0 ? `tel:${n}` : "tel:0912345678";
      }
      case "wifi":
        return buildWifiPayload(wifiSsid, wifiPassword, wifiSecurity);
      default:
        return "";
    }
  }, [
    content,
    qrType,
    urlInput,
    textInput,
    emailInput,
    phoneInput,
    wifiSsid,
    wifiPassword,
    wifiSecurity,
    t,
  ]);

  const shareUrl = `${window.location.origin}/tools/qr-code?data=${encodeURIComponent(encodedValue || "")}`;
  const shareText = t("qr.share.ogText");

  const ogImageUrl = `${getBaseUrl().replace(/\/$/, "")}/qr-preview.png`;
  const canonicalUrl = `${getBaseUrl().replace(/\/$/, "")}/tools/qr-code`;
  const webPageJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("qr.jsonLd.webName"),
      description: t("qr.jsonLd.webDesc"),
      url: canonicalUrl,
      inLanguage: i18n.language?.startsWith("zh") ? "zh-TW" : "en",
    }),
    [t, i18n.language, canonicalUrl],
  );
  const softwareJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: t("qr.jsonLd.webName"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      description: t("qr.jsonLd.appDesc"),
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TWD",
      },
    }),
    [t, canonicalUrl],
  );
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: t("qr.jsonLd.faq1q"),
          acceptedAnswer: { "@type": "Answer", text: t("qr.jsonLd.faq1a") },
        },
        {
          "@type": "Question",
          name: t("qr.jsonLd.faq2q"),
          acceptedAnswer: { "@type": "Answer", text: t("qr.jsonLd.faq2a") },
        },
      ],
    }),
    [t],
  );

  const mapShortenFailure = useCallback(
    (result: ShortenFailure) => {
      const code = (result.errorCode || "").toUpperCase();
      const msg = (result.message || "").trim();

      if (import.meta.env.DEV && result.details) {
        console.log("[qr] shorten failure details", result.details);
      }

      if (result.status === 0) return t("qr.err.shortNetwork");

      if (code === "CONFIG_ERROR" || code === "SERVICE_UNAVAILABLE") {
        return msg || t("qr.err.shortConfig");
      }
      if (code === "DB_ERROR") {
        return msg || t("qr.err.shortDb");
      }
      if (code === "INVALID_URL" || result.status === 400) {
        return msg || t("qr.err.shortInvalidUrl");
      }
      if (result.status === 404) {
        return t("qr.err.shortApiRoute");
      }
      if (result.status === 502 || result.status === 504) {
        return t("qr.err.shortBadGateway");
      }
      if (code === "FALLBACK") return t("qr.err.shortGeneric");
      if (code === "PARSE" || code === "FORMAT") {
        return msg || t("qr.err.shortFmt");
      }

      if (result.status >= 500 && result.status < 600) {
        if (msg && !msg.startsWith("HTTP_")) return msg;
        return t("qr.err.shortServer");
      }

      if (msg && msg !== "MISSING_SHORT_URL") return msg;
      return t("qr.err.shortGeneric");
    },
    [t],
  );

  /** 分享連結：短網址 API 目前不穩定，先改為直接使用原分享網址，避免使用者看到錯誤。 */
  const shortenShareLink = useCallback(async (): Promise<string> => {
    setShortUrlError("");
    setShortUrlNotice(
      t("qr.shortUrl.maintenance", {
        defaultValue: "短網址功能維護中，已改用原始分享連結。",
      }),
    );
    setShortUrl(shareUrl);
    return shareUrl;
  }, [shareUrl, t]);

  const handleGenerateShortUrl = useCallback(async () => {
    setShortUrlError("");
    setShortUrlNotice("");
    setShortUrlAppliedToField(false);

    if (qrType !== "url") {
      setShortUrlError(t("qr.err.shortNeedUrlMode"));
      return;
    }
    const candidate = normalizeHttpUrlForShorten(urlInput);
    if (!candidate) {
      setShortUrlError(t("qr.err.shortInvalidUrl"));
      return;
    }

    // 短網址後端目前會出現 FUNCTION_INVOCATION_FAILED，先不呼叫 API，避免錯誤訊息影響使用者。
    setUrlInput(candidate);
    setShortUrl(candidate);
    setShortUrlAppliedToField(true);
    setShortUrlNotice(
      t("qr.shortUrl.maintenance", {
        defaultValue: "短網址功能維護中，已先使用原網址。",
      }),
    );
  }, [qrType, urlInput, t]);

  const openShortUrl = () => {
    if (!shortUrl) return;
    window.open(shortUrl, "_blank");
  };

  const copyShortUrl = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    alert(t("qr.alert.copiedShort"));
  };

  const openLineShare = async () => {
    const popup = window.open("about:blank", "_blank");
    try {
      const shortUrl = await shortenShareLink();
      const target = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(shareText)}`;
      if (popup) popup.location.href = target;
      else window.location.href = target;
    } catch (error) {
      if (popup) popup.close();
      const message =
        error instanceof Error ? error.message : t("qr.err.shortGeneric");
      alert(t("qr.alert.shortFail", { msg: message }));
    }
  };

  const openFbShare = async () => {
    const popup = window.open("about:blank", "_blank");
    try {
      const shortUrl = await shortenShareLink();
      const target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`;
      if (popup) popup.location.href = target;
      else window.location.href = target;
    } catch (error) {
      if (popup) popup.close();
      const message =
        error instanceof Error ? error.message : t("qr.err.shortGeneric");
      alert(t("qr.alert.shortFail", { msg: message }));
    }
  };

  const openXShare = async () => {
    const popup = window.open("about:blank", "_blank");
    try {
      const shortUrl = await shortenShareLink();
      const target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(shareText)}`;
      if (popup) popup.location.href = target;
      else window.location.href = target;
    } catch (error) {
      if (popup) popup.close();
      const message =
        error instanceof Error ? error.message : t("qr.err.shortGeneric");
      alert(t("qr.alert.shortFail", { msg: message }));
    }
  };

  const handleCopy = async () => {
    try {
      const shortUrl = await shortenShareLink();
      await navigator.clipboard.writeText(shortUrl);
      alert(t("qr.alert.copiedLink"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("qr.err.shortFallback");
      await navigator.clipboard.writeText(shareUrl);
      alert(t("qr.alert.copyFallback", { msg: message }));
    }
  };

  const hasUserContent = useMemo(() => {
    if (content.trim().length > 0) return true;
    switch (qrType) {
      case "url":
        return urlInput.trim().length > 0;
      case "text":
        return textInput.trim().length > 0;
      case "email":
        return emailInput.trim().length > 0;
      case "phone":
        return phoneInput.trim().length > 0;
      case "wifi":
        return wifiSsid.trim().length > 0 || wifiPassword.trim().length > 0;
      default:
        return false;
    }
  }, [
    content,
    qrType,
    urlInput,
    textInput,
    emailInput,
    phoneInput,
    wifiSsid,
    wifiPassword,
  ]);

  const logoW = Math.round(qrSize * 0.2);
  const logoH = Math.round(qrSize * 0.2);
  const errorLevel = logoDataUrl ? "H" : "M";

  const imageSettings = logoDataUrl
    ? {
        src: logoDataUrl,
        width: logoW,
        height: logoH,
        excavate: true,
      }
    : undefined;

  const paintCompositeCanvases = useCallback(() => {
    const src = canvasRef.current;
    const prev = compositePreviewRef.current;
    const phone = compositePhoneRef.current;
    if (!src || !src.width) return;

    const composed = compositeQrToCanvas(src, {
      labelPosition,
      labelStyle,
      showDescription: labelShowDescription,
      descriptionText: labelDescription,
      showPayload: labelShowPayload,
      payloadText: payloadDisplayText,
    });

    const drawFit = (dest: HTMLCanvasElement | null, maxW: number) => {
      if (!dest) return;
      const scale = Math.min(1, maxW / composed.width);
      const dw = Math.max(1, Math.floor(composed.width * scale));
      const dh = Math.max(1, Math.floor(composed.height * scale));
      dest.width = dw;
      dest.height = dh;
      const ctx = dest.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, dw, dh);
      ctx.drawImage(composed, 0, 0, dw, dh);
    };

    drawFit(prev, 420);
    drawFit(phone, 108);
  }, [
    labelPosition,
    labelStyle,
    labelShowDescription,
    labelDescription,
    labelShowPayload,
    payloadDisplayText,
  ]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        paintCompositeCanvases();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [
    paintCompositeCanvases,
    encodedValue,
    fgColor,
    bgColor,
    qrSize,
    logoDataUrl,
  ]);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const composed = compositeQrToCanvas(canvas, {
      labelPosition,
      labelStyle,
      showDescription: labelShowDescription,
      descriptionText: labelDescription,
      showPayload: labelShowPayload,
      payloadText: payloadDisplayText,
    });
    const a = document.createElement("a");
    a.href = composed.toDataURL("image/png");
    a.download = "qrcode-sticker.png";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [
    labelPosition,
    labelStyle,
    labelShowDescription,
    labelDescription,
    labelShowPayload,
    payloadDisplayText,
  ]);

  const downloadSvg = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns=/)) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const clearLogo = () => {
    setLogoFile(null);
  };

  const onPickQrStyle = useCallback(() => {
    didPickQrStyleRef.current = true;
  }, []);

  const fieldClass =
    "mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 ease-out focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200";

  return (
    <>
      <SEO
        title={t("qr.seo.title")}
        description={t("qr.seo.description")}
        keywords={t("qr.seo.keywords")}
        path="/tools/qr-code"
        jsonLdList={[webPageJsonLd, softwareJsonLd, faqJsonLd]}
      />
      <Helmet>
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${getBaseUrl().replace(/\/$/, "")}/tools/qr-code`}
        />
        <meta property="og:image" content={ogImageUrl} />
      </Helmet>

      <div className="qr-saas-page min-h-full bg-[#f5f5f7]">
        <div className="qr-saas-shell mx-auto px-4 py-5 md:px-6 md:py-6 xl:px-8">
          <header className="qr-tool-hero qr-tool-hero--v2">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl md:text-[2.25rem]">
              {t("qr.hero.h1")}
            </h1>
            <p className="mt-2 text-base text-gray-600">{t("qr.hero.p1")}</p>
            <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-600">
              <p>
                <span className="font-medium text-gray-800">
                  {t("qr.hero.audience_label")}
                </span>
                {t("qr.hero.audience")}
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  {t("qr.hero.scenario_label")}
                </span>
                {t("qr.hero.scenario")}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              <span className="font-medium text-gray-800">
                {t("qr.hero.pair_label")}
              </span>
              {t("qr.hero.pair_before_resize")}{" "}
              <Link
                to="/tools/image-resize"
                className="text-blue-600 hover:underline"
              >
                {t("qr.hero.resize_link")}
              </Link>{" "}
              {t("qr.hero.pair_mid")}{" "}
              <Link
                to="/tools/image-compress"
                className="text-blue-600 hover:underline"
              >
                {t("qr.hero.compress_link")}
              </Link>{" "}
              {t("qr.hero.pair_after_compress")}{" "}
              <Link to="/summary" className="text-blue-600 hover:underline">
                {t("qr.hero.ai_link")}
              </Link>
              {t("qr.hero.pair_end")}
            </p>
            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {t("site_nav_back_home")}
              </Link>
            </div>
          </header>

          <div className="qr-tool-main qr-tool-main--v2 mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[430px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
            <aside className="qr-tool-sidebar order-2 w-full min-w-0 max-w-[470px] justify-self-center lg:order-1 lg:justify-self-start">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  QR Code 設定
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  輸入內容後右側會即時產生 QR Code。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {typeTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQrType(tab.id)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${qrType === tab.id ? "bg-blue-600 !text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  {qrType === "url" ? (
                    <label className="block text-sm font-medium text-gray-700">
                      網址
                      <input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com"
                        className={fieldClass}
                      />
                      <span className="mt-1 block text-xs text-gray-500">
                        請輸入完整網址，留空時會顯示示範網址。
                      </span>
                    </label>
                  ) : null}
                  {qrType === "text" ? (
                    <label className="block text-sm font-medium text-gray-700">
                      文字內容
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="輸入要產生 QR Code 的文字"
                        className={`${fieldClass} min-h-[120px]`}
                      />
                    </label>
                  ) : null}
                  {qrType === "email" ? (
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                      <input
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="hello@example.com"
                        className={fieldClass}
                      />
                    </label>
                  ) : null}
                  {qrType === "phone" ? (
                    <label className="block text-sm font-medium text-gray-700">
                      電話
                      <input
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="0912345678"
                        className={fieldClass}
                      />
                    </label>
                  ) : null}
                  {qrType === "wifi" ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        WiFi 名稱
                        <input
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          className={fieldClass}
                        />
                      </label>
                      <label className="block text-sm font-medium text-gray-700">
                        WiFi 密碼
                        <input
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          className={fieldClass}
                        />
                      </label>
                      <label className="block text-sm font-medium text-gray-700">
                        加密方式
                        <select
                          value={wifiSecurity}
                          onChange={(e) =>
                            setWifiSecurity(e.target.value as WifiSec)
                          }
                          className={fieldClass}
                        >
                          {wifiSecOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    樣式設定
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      前景色
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white"
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      背景色
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white"
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                      尺寸
                      <select
                        value={qrSize}
                        onChange={(e) => setQrSize(Number(e.target.value))}
                        className={fieldClass}
                      >
                        {SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size} × {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {isLowContrast ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFgColor("#000000");
                        setBgColor("#ffffff");
                      }}
                      className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold !text-white hover:bg-amber-600 hover:!text-white"
                    >
                      修正為高對比黑白 QR
                    </button>
                  ) : null}
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    商業模板
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    快速套用常見用途；不需要可略過。
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => applyBusinessTemplate("restaurant")}
                      className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50"
                    >
                      餐飲店
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBusinessTemplate("ig")}
                      className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm font-bold text-pink-700 hover:bg-pink-50"
                    >
                      IG 宣傳
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBusinessTemplate("card")}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      名片文字
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={resetBusinessTemplate}
                    className="mt-3 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    清除模板
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Logo / 中央小圖
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    可加入品牌 Logo；建議先測試 QR 是否能掃描。
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {logoFile ? (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="mt-3 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                    >
                      移除 Logo
                    </button>
                  ) : null}
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    社群輸出尺寸
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    切換預覽尺寸，方便做 IG、LINE、名片素材。
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {socialSizes.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setQrSize(item.size)}
                        className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                      >
                        {item.name} {item.size}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    QR Code 說明貼紙 / 標籤卡片
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG 下載可輸出合成圖；未勾選說明文字時只輸出 QR。
                  </p>
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={labelShowDescription}
                      onChange={(e) =>
                        setLabelShowDescription(e.target.checked)
                      }
                    />
                    顯示說明文字
                  </label>
                  {labelShowDescription ? (
                    <input
                      value={labelDescription}
                      onChange={(e) => setLabelDescription(e.target.value)}
                      placeholder="例如：掃描查看菜單 / 掃描加入好友"
                      className={fieldClass}
                    />
                  ) : null}
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={labelShowPayload}
                      onChange={(e) => setLabelShowPayload(e.target.checked)}
                    />
                    顯示 QR 內容摘要
                  </label>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      文字位置
                      <select
                        value={labelPosition}
                        onChange={(e) =>
                          setLabelPosition(e.target.value as LabelPosition)
                        }
                        className={fieldClass}
                      >
                        <option value="bottom">下方</option>
                        <option value="top">上方</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      卡片風格
                      <select
                        value={labelStyle}
                        onChange={(e) =>
                          setLabelStyle(e.target.value as LabelStyle)
                        }
                        className={fieldClass}
                      >
                        <option value="simple_white">簡潔白底</option>
                        <option value="dark">深色卡片</option>
                        <option value="warm">溫暖卡片</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </aside>
            <div className="qr-tool-preview-col order-1 min-w-0 lg:order-2 lg:sticky lg:top-6 lg:z-10 lg:self-start">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  QR Code 預覽
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  確認可掃描後再下載使用。
                </p>
                <div className="mt-5 flex justify-center rounded-3xl bg-gray-100 p-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <QRCodeCanvas
                      value={encodedValue}
                      size={Math.min(qrSize, 320)}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={errorLevel}
                      marginSize={2}
                      imageSettings={imageSettings}
                    />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={downloadPng}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98]"
                  >
                    下載 PNG
                  </button>
                  <button
                    type="button"
                    onClick={downloadSvg}
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-purple-700 hover:!text-white active:scale-[0.98]"
                  >
                    下載 SVG
                  </button>
                </div>
                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-bold text-gray-700">分享連結</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={openLineShare}
                      className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold !text-white hover:bg-emerald-600 hover:!text-white"
                    >
                      LINE
                    </button>
                    <button
                      type="button"
                      onClick={openFbShare}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold !text-white hover:bg-blue-700 hover:!text-white"
                    >
                      FB
                    </button>
                    <button
                      type="button"
                      onClick={openXShare}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold !text-white hover:bg-black hover:!text-white"
                    >
                      X
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                    >
                      複製
                    </button>
                  </div>
                </div>
                {labelShowDescription || labelShowPayload ? (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-bold text-gray-700">
                      合成貼紙預覽
                    </h3>
                    <canvas
                      ref={compositePreviewRef}
                      className="mt-3 mx-auto max-w-full rounded-xl bg-white shadow-sm"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* 輕量贊助區塊：放在工具主功能後，避免干擾操作，同時提供支持入口 */}
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
            <div className="text-center">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                ❤️ 支持免費工具開發
              </h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                如果這個 QR Code
                工具有幫助到你，可以小額支持；不用也沒關係，有幫助再支持就好 🙌
              </p>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="https://p.ecpay.com.tw/FD7CD6D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-amber-600 hover:!text-white active:scale-[0.98]"
              >
                ☕ 台灣小額支持
              </a>
              <a
                href="https://ko-fi.com/ang2289"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98]"
              >
                🌍 Ko-fi 海外支持
              </a>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              建議支持：50 元 / 100 元 / 200 元　｜　💡 功能建議：
              <a
                href="mailto:rxv0227@gmail.com"
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                rxv0227@gmail.com
              </a>
            </p>
          </section>

          {/* 隱藏 Canvas / SVG 供下載（含 Logo 內嵌，與預覽疊加視覺一致） */}
          <div
            className="pointer-events-none fixed left-[-9999px] top-0 opacity-0"
            aria-hidden
          >
            <QRCodeCanvas
              ref={canvasRef}
              value={encodedValue}
              size={qrSize}
              fgColor={fgColor}
              bgColor={bgColor}
              level={errorLevel}
              marginSize={2}
              imageSettings={imageSettings}
            />
            <QRCodeSVG
              ref={svgRef}
              value={encodedValue}
              size={qrSize}
              fgColor={fgColor}
              bgColor={bgColor}
              level={errorLevel}
              marginSize={2}
              imageSettings={imageSettings}
            />
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">{t("qr.how.title")}</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {t("qr.how.p")}
            </p>

            <h3 className="font-semibold mt-4 mb-2">{t("qr.how.steps")}</h3>
            <ol className="list-decimal ml-5 text-gray-600 space-y-1">
              <li>{t("qr.how.s1")}</li>
              <li>{t("qr.how.s2")}</li>
              <li>{t("qr.how.s3")}</li>
            </ol>

            <h3 className="font-semibold mt-4 mb-2">{t("qr.how.cases")}</h3>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>{t("qr.how.c1")}</li>
              <li>{t("qr.how.c2")}</li>
              <li>{t("qr.how.c3")}</li>
            </ul>
          </section>

          <section className="mt-24 space-y-8 rounded-3xl border border-gray-200 bg-white p-10 text-sm leading-relaxed text-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("qr.seoBlock.h2")}
            </h2>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("qr.seoBlock.what_qr")}
              </h3>
              <p className="mt-2 text-gray-600">{t("qr.seoBlock.what_qr_p")}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("qr.seoBlock.faq_h")}
              </h3>
              <dl className="mt-4">
                <div>
                  <dt className="mt-4 font-medium text-gray-800">
                    {t("qr.seoBlock.faq_q1")}
                  </dt>
                  <dd className="mt-1 text-base text-gray-600">
                    {t("qr.seoBlock.faq_a1")}
                  </dd>
                </div>
                <div>
                  <dt className="mt-4 font-medium text-gray-800">
                    {t("qr.seoBlock.faq_q2")}
                  </dt>
                  <dd className="mt-1 text-base text-gray-600">
                    {t("qr.seoBlock.faq_a2")}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("qr.seoBlock.how_make_h")}
              </h3>
              <p className="mt-2 text-gray-600">
                {t("qr.seoBlock.how_make_p")}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("qr.seoBlock.logo_h")}
              </h3>
              <p className="mt-2 text-gray-600">{t("qr.seoBlock.logo_p")}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("qr.seoBlock.fail_h")}
              </h3>
              <ul className="mt-2 list-disc pl-5 text-gray-600">
                <li>{t("qr.seoBlock.f1")}</li>
                <li>{t("qr.seoBlock.f2")}</li>
                <li>{t("qr.seoBlock.f3")}</li>
              </ul>
            </div>
          </section>

          <section className="mt-12 rounded-3xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("qr.bottom.what_h")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              {t("qr.bottom.what_p")}
            </p>

            <h2 className="mt-6 text-2xl font-semibold text-gray-900">
              {t("qr.bottom.why_h")}
            </h2>
            <ul className="mt-3 list-disc pl-5 text-gray-600">
              <li>{t("qr.bottom.w1")}</li>
              <li>{t("qr.bottom.w2")}</li>
              <li>{t("qr.bottom.w3")}</li>
            </ul>

            <PhotoRoomAffiliateBlock />
            <RelatedTools
              items={getRelatedToolsItems("qr-code")}
              title={t("related_tools_section_title")}
            />
            <RelatedGuides items={getRelatedGuideItems("qr-code")} />
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {t("qr.bottom.long_p")}
            </p>
            <div className="mt-8">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold !text-white hover:!text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
              >
                {t("batch1_tools_hub_cta")}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
