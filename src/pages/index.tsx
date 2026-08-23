import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { featureFlags } from "@/config/featureFlags";
import { isLoggedIn } from "@/lib/auth";
import { trackEvent } from "@/utils/analytics";
import SEO, { getBaseUrl } from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";
import {
  isLocalDevelopment,
  isVideoToolPublicPath,
} from "@/lib/isLocalDevelopment";

const RXV_ADMIN_EMAILS = ["ang2289@yahoo.com.tw", "ang2289@gmail.com"];

// 團購／亞尼克暫停：首頁完全隱藏，保留其他功能不受影響。
const SHOW_GROUP_BUY = false;

function getAuthTokenFromStorage(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("auth_token") ||
    window.localStorage.getItem("token") ||
    ""
  ).trim();
}

function getCurrentUserEmailFromStorage(): string {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "userEmail",
    "email",
    "rxv_user_email",
    "currentUserEmail",
    "loginEmail",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.includes("@")) return value.trim().toLowerCase();
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const email =
        parsed?.email ||
        parsed?.user?.email ||
        parsed?.profile?.email ||
        parsed?.account?.email;

      if (typeof email === "string" && email.includes("@")) {
        return email.trim().toLowerCase();
      }
    } catch {
      // ignore non-JSON localStorage values
    }
  }

  return "";
}

const PENDING_POINT_TRANSFER_KEY = "rxv_pending_point_transfer_v1";

type PendingPointTransfer = {
  planId: "99" | "199";
  amount: number;
  email?: string;
  createdAt?: string;
};

type CustomerNextAction = {
  key: string;
  title: string;
  description: string;
  href: string;
  tone: 'amber' | 'rose' | 'violet' | 'emerald' | string;
};

type CustomerStorefrontStatus = {
  id: string;
  slug: string;
  displayName: string;
  pageMode: string;
  status: string;
  isPublic: boolean;
  expiresAt?: string | null;
};

type CustomerServiceStatus = {
  pointTransfers: Array<{ id: string; planId: string; amountNtd: number; status: string; transferredAt?: string | null; createdAt?: string | null }>;
  paidProductImageOrders: Array<{ orderNo: string; amountNtd: number; points: number; status: string; createdAt?: string | null }>;
  businessCardOrders: Array<{ id: string; orderCode: string; templateTitle?: string | null; totalAmountNtd: number; status: string; createdAt?: string | null; updatedAt?: string | null }>;
  productImageGenerations: Array<{ id: string; resultImageUrl?: string | null; styleTitle?: string | null; pointsUsed: number; createdAt?: string | null }>;
  storefront?: CustomerStorefrontStatus | null;
  entitlement?: { planCode: string; maxItems: number; expiresAt?: string | null } | null;
  nextActions?: CustomerNextAction[];
  generationHistoryReady: boolean;
};

function customerActionStyle(tone: string) {
  const styles: Record<string, string> = {
    amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    rose: 'border-rose-200 bg-rose-50 hover:bg-rose-100',
    violet: 'border-violet-200 bg-violet-50 hover:bg-violet-100',
    emerald: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
  };
  return styles[tone] || 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100';
}

function customerActionTextStyle(tone: string) {
  const styles: Record<string, string> = {
    amber: 'text-amber-950',
    rose: 'text-rose-950',
    violet: 'text-violet-950',
    emerald: 'text-emerald-950',
  };
  return styles[tone] || 'text-cyan-950';
}

function customerActionDetailStyle(tone: string) {
  const styles: Record<string, string> = {
    amber: 'text-amber-800',
    rose: 'text-rose-800',
    violet: 'text-violet-800',
    emerald: 'text-emerald-800',
  };
  return styles[tone] || 'text-cyan-800';
}


function readPendingPointTransfer(currentEmail: string): PendingPointTransfer | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PENDING_POINT_TRANSFER_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as PendingPointTransfer;
    const planId = value?.planId === "199" ? "199" : value?.planId === "99" ? "99" : "";
    const amount = Number(value?.amount || 0);
    const savedEmail = String(value?.email || "").trim().toLowerCase();

    if (!planId || !Number.isInteger(amount) || amount <= 0) return null;
    if (savedEmail && currentEmail && savedEmail !== currentEmail.trim().toLowerCase()) return null;
    return { ...value, planId, amount };
  } catch {
    return null;
  }
}

interface ToolCard {
  id: string;
  titleKey: string;
  badge?: string;
  descriptionKey: string;
  icon: string;
  href: string | null;
  disabled?: boolean;
  categoryKey: string;
  ringColor: string;
  hoverColor: string;
  badgeColor?: string;
  onClick?: (e: React.MouseEvent) => void;
  extraContent?: React.ReactNode;
  featureFlag?: keyof typeof featureFlags;
}

/** 首頁工具卡左側分類色條（與 home_category_* 對應） */
function categoryIndicatorClass(categoryKey: string): string {
  switch (categoryKey) {
    case "home_category_ai":
    case "home_category_learn":
      return "border-l-indigo-500";
    case "home_category_design":
      return "border-l-cyan-500";
    case "home_category_productivity":
    case "home_category_task":
      return "border-l-amber-500";
    case "home_category_life":
    case "home_category_mindful":
    case "home_category_chant":
      return "border-l-green-500";
    case "home_category_admin":
      return "border-l-slate-400";
    default:
      return "border-l-slate-300";
  }
}

/** 熱門工具卡片：共用互動與版型（不含分類色） */
const POPULAR_TOOL_CARD_CLASS =
  "group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer " +
  "transition-all duration-200 ease-out " +
  "hover:-translate-y-1 hover:shadow-xl hover:border-sky-300 hover:bg-slate-50/80 " +
  "active:translate-y-0 active:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";

type FeaturedToolTheme = {
  leftBar: string;
  topBar: string;
  iconBg: string;
  iconHover: string;
  titleHover: string;
};

const FEATURED_TOOL_THEME: Record<string, FeaturedToolTheme> = {
  images: {
    leftBar: "border-l-emerald-500",
    topBar: "border-t-[4px] border-t-emerald-400",
    iconBg: "bg-emerald-50",
    iconHover: "group-hover:bg-emerald-100",
    titleHover: "group-hover:text-emerald-700",
  },
  "ai-summary": {
    leftBar: "border-l-indigo-500",
    topBar: "border-t-[4px] border-t-indigo-400",
    iconBg: "bg-indigo-50",
    iconHover: "group-hover:bg-indigo-100",
    titleHover: "group-hover:text-indigo-700",
  },
  "homework-helper": {
    leftBar: "border-l-indigo-500",
    topBar: "border-t-[4px] border-t-indigo-400",
    iconBg: "bg-indigo-50",
    iconHover: "group-hover:bg-indigo-100",
    titleHover: "group-hover:text-indigo-700",
  },
  "image-resize": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "qr-code": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "line-sticker": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "animated-sticker-prompt": {
    leftBar: "border-l-pink-500",
    topBar: "border-t-[4px] border-t-pink-400",
    iconBg: "bg-pink-50",
    iconHover: "group-hover:bg-pink-100",
    titleHover: "group-hover:text-pink-700",
  },
  "animated-line-sticker": {
    leftBar: "border-l-fuchsia-500",
    topBar: "border-t-[4px] border-t-fuchsia-400",
    iconBg: "bg-fuchsia-50",
    iconHover: "group-hover:bg-fuchsia-100",
    titleHover: "group-hover:text-fuchsia-700",
  },
  "image-compress": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "image-convert": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "image-crop": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "image-prompt": {
    leftBar: "border-l-violet-500",
    topBar: "border-t-[4px] border-t-violet-400",
    iconBg: "bg-violet-50",
    iconHover: "group-hover:bg-violet-100",
    titleHover: "group-hover:text-violet-700",
  },
  "pet-prompt": {
    leftBar: "border-l-pink-500",
    topBar: "border-t-[4px] border-t-pink-400",
    iconBg: "bg-pink-50",
    iconHover: "group-hover:bg-pink-100",
    titleHover: "group-hover:text-pink-700",
  },

  "product-image-generator": {
    leftBar: "border-l-emerald-500",
    topBar: "border-t-[4px] border-t-emerald-400",
    iconBg: "bg-emerald-50",
    iconHover: "group-hover:bg-emerald-100",
    titleHover: "group-hover:text-emerald-700",
  },
  "product-showcase-page": {
    leftBar: "border-l-cyan-500",
    topBar: "border-t-[4px] border-t-cyan-400",
    iconBg: "bg-cyan-50",
    iconHover: "group-hover:bg-cyan-100",
    titleHover: "group-hover:text-cyan-700",
  },
  "commercial-image": {
    leftBar: "border-l-orange-500",
    topBar: "border-t-[4px] border-t-orange-400",
    iconBg: "bg-orange-50",
    iconHover: "group-hover:bg-orange-100",
    titleHover: "group-hover:text-orange-700",
  },
  "business-card": {
    leftBar: "border-l-violet-500",
    topBar: "border-t-[4px] border-t-violet-400",
    iconBg: "bg-violet-50",
    iconHover: "group-hover:bg-violet-100",
    titleHover: "group-hover:text-violet-700",
  },
  "eat-no-fat-game": {
    leftBar: "border-l-rose-500",
    topBar: "border-t-[4px] border-t-rose-400",
    iconBg: "bg-rose-50",
    iconHover: "group-hover:bg-rose-100",
    titleHover: "group-hover:text-rose-700",
  },
  "traffic-accident": {
    leftBar: "border-l-amber-500",
    topBar: "border-t-[4px] border-t-amber-400",
    iconBg: "bg-amber-50",
    iconHover: "group-hover:bg-amber-100",
    titleHover: "group-hover:text-amber-700",
  },
};

function featuredToolTheme(toolId: string): FeaturedToolTheme {
  return (
    FEATURED_TOOL_THEME[toolId] ?? {
      leftBar: "border-l-slate-300",
      topBar: "border-t-[4px] border-t-slate-300",
      iconBg: "bg-slate-100",
      iconHover: "group-hover:bg-sky-100",
      titleHover: "group-hover:text-sky-700",
    }
  );
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [pendingBankTransferCount, setPendingBankTransferCount] = useState(0);
  const [pendingBusinessCardOrderCount, setPendingBusinessCardOrderCount] = useState(0);
  // 名片 API 若讀取失敗，不能假裝沒有待處理訂單；要明確提醒管理者檢查後端。
  const [businessCardReminderError, setBusinessCardReminderError] = useState("");

  // 客戶自己可見的待匯款提醒：商品圖點數採瀏覽器暫存，名片訂單則由後端訂單狀態讀取。
  const [pendingPointTransfer, setPendingPointTransfer] = useState<PendingPointTransfer | null>(null);
  const [customerServiceStatus, setCustomerServiceStatus] = useState<CustomerServiceStatus | null>(null);

  useEffect(() => {
    // 檢查登入狀態
    setLoggedIn(isLoggedIn());
    setCurrentUserEmail(getCurrentUserEmailFromStorage());

    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      setLoggedIn(isLoggedIn());
      setCurrentUserEmail(getCurrentUserEmailFromStorage());
    };
    window.addEventListener("storage", handleStorageChange);

    // 定期檢查登入狀態
    const interval = setInterval(() => {
      setLoggedIn(isLoggedIn());
      setCurrentUserEmail(getCurrentUserEmailFromStorage());
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 首頁團購功能暫停：除了資料來源不再列出，也防止其他共用元件殘留亞尼克／團購入口。
  useEffect(() => {
    if (SHOW_GROUP_BUY || typeof document === "undefined") return;

    const hidePausedGroupBuyEntries = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>('a, button, section, article, [role="link"]'),
      );

      candidates.forEach((element) => {
        const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
        const compactText = (element.textContent || "").replace(/\s+/g, "");
        const isGroupBuyEntry =
          href.includes("/group-buy") ||
          compactText.includes("亞尼克第一團") ||
          compactText.includes("亞尼克生乳捲第一團") ||
          compactText === "團購管理";

        if (isGroupBuyEntry) element.style.setProperty("display", "none", "important");
      });
    };

    hidePausedGroupBuyEntries();
    const observer = new MutationObserver(hidePausedGroupBuyEntries);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);


  // 修正共用導覽列按鈕文字顏色，並讓登入／登出按鈕顯示在文章專區右側。
  // 注意：截圖上方導覽列通常在 Header / Navbar / Layout 元件，非首頁本身。
  // 這裡用首頁層級的保護補丁先處理目前畫面，之後若上傳 Header 檔，可再改成元件級修正。
  useEffect(() => {
    if (typeof window === "undefined") return;

    const styleId = "rxv-nav-auth-visible-and-active-fix";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .rxv-nav-auth-readable {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 38px !important;
          padding: 8px 18px !important;
          border-radius: 10px !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-weight: 900 !important;
          background: linear-gradient(135deg, #059669, #10b981) !important;
          border: 1px solid rgba(16, 185, 129, 0.35) !important;
          box-shadow: 0 6px 14px rgba(5, 150, 105, 0.22) !important;
          text-decoration: none !important;
          white-space: nowrap !important;
        }
        .rxv-nav-auth-readable,
        .rxv-nav-auth-readable:visited,
        .rxv-nav-auth-readable:hover,
        .rxv-nav-auth-readable:focus,
        .rxv-nav-auth-readable *,
        .rxv-nav-auth-readable:hover *,
        .rxv-nav-auth-readable:focus * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-weight: 900 !important;
          text-decoration: none !important;
          white-space: nowrap !important;
        }
        .rxv-nav-auth-readable:hover {
          background: linear-gradient(135deg, #047857, #059669) !important;
          transform: translateY(-1px);
        }
        .rxv-nav-active-readable {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 38px !important;
          padding: 8px 18px !important;
          border-radius: 10px !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-weight: 900 !important;
          background: linear-gradient(135deg, #6d28d9, #8b5cf6) !important;
          box-shadow: 0 6px 14px rgba(109, 40, 217, 0.3) !important;
          text-shadow: 0 1px 2px rgba(15, 23, 42, 0.45) !important;
          text-decoration: none !important;
        }
        .rxv-nav-active-readable,
        .rxv-nav-active-readable:visited,
        .rxv-nav-active-readable:hover,
        .rxv-nav-active-readable:focus,
        .rxv-nav-active-readable *,
        .rxv-nav-active-readable:hover *,
        .rxv-nav-active-readable:focus * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-weight: 900 !important;
          text-decoration: none !important;
        }
        .rxv-nav-normal-readable {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 38px !important;
          padding: 8px 18px !important;
          border-radius: 10px !important;
          color: #2563eb !important;
          -webkit-text-fill-color: #2563eb !important;
          font-weight: 900 !important;
          background: #ffffff !important;
          border: 1px solid #bfdbfe !important;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.1) !important;
          text-decoration: none !important;
        }
        .rxv-nav-normal-readable,
        .rxv-nav-normal-readable:visited,
        .rxv-nav-normal-readable *,
        .rxv-nav-normal-readable:visited * {
          color: #2563eb !important;
          -webkit-text-fill-color: #2563eb !important;
          font-weight: 900 !important;
          text-decoration: none !important;
        }
        .rxv-nav-normal-readable:hover,
        .rxv-nav-normal-readable:hover * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: linear-gradient(135deg, #2563eb, #0ea5e9) !important;
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(style);
    }

    const normalizeText = (value: string) =>
      value.replace(/\s+/g, "").trim();

    const navLabels = ["首頁", "工具專區", "文章專區"];
    const authLabels = ["登入", "登出", "Login", "Logout"];

    const applyNavFix = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>(
          "header a, header button, nav a, nav button",
        ),
      );

      candidates.forEach((el) => {
        const label = normalizeText(el.textContent || "");

        if (authLabels.includes(label)) {
          el.classList.remove("rxv-hide-auth-nav");
          el.classList.add("rxv-nav-auth-readable");
          return;
        }

        const matchedNavLabel = navLabels.find((item) => label.includes(item));
        if (!matchedNavLabel) return;

        const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || "" : "";
        const currentPath = window.location.pathname;
        const isActive =
          (href === "/" && currentPath === "/") ||
          (href !== "/" && href && currentPath.startsWith(href));

        el.classList.toggle("rxv-nav-active-readable", isActive);
        el.classList.toggle("rxv-nav-normal-readable", !isActive);
      });
    };

    applyNavFix();
    const timer = window.setInterval(applyNavFix, 500);
    return () => window.clearInterval(timer);
  }, []);

  // TODO: 為了上線摘要與作業功能，暫時隱藏集氣願望模組
  // 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
  const isChantWishEnabled =
    import.meta.env.VITE_ENABLE_CHANT === "true" ||
    import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === "true";

  // 判斷是否為 localhost 環境（僅在本地端顯示管理工具）
  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const isAdminEmail = RXV_ADMIN_EMAILS.includes(
    currentUserEmail.toLowerCase(),
  );
  const canShowAdminTools = isLocalhost || isAdminEmail;

  // 付款、商品頁開通與名片訂單提醒屬於內部管理資訊。
  // 即使在 localhost 測試，一般客戶帳號也不顯示、不讀取這些提醒。
  const canShowAdminReminders = isAdminEmail;

  // 管理者首頁提醒：讀取匯款與所有進行中的名片訂單。
  // 讀取失敗時顯示警告，不再靜默當成 0 筆。
  useEffect(() => {
    if (!loggedIn || !canShowAdminReminders) {
      setPendingBankTransferCount(0);
      setPendingBusinessCardOrderCount(0);
      setBusinessCardReminderError("");
      return;
    }

    const token = getAuthTokenFromStorage();
    if (!token) {
      setPendingBankTransferCount(0);
      setPendingBusinessCardOrderCount(0);
      setBusinessCardReminderError("");
      return;
    }

    let cancelled = false;

    const loadPendingAdminItems = async () => {
      try {
        const [bankResponse, businessCardResponse] = await Promise.all([
          fetch("/api/main?action=admin-list-bank-transfer-reports", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/main?action=admin-list-business-card-orders", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const bankData = await bankResponse.json().catch(() => ({}));
        const businessCardData = await businessCardResponse.json().catch(() => ({}));
        const reports = bankResponse.ok && Array.isArray(bankData?.reports) ? bankData.reports : [];
        const newBusinessCardCount = Number(businessCardData?.summary?.newCount || 0);
        const activeBusinessCardCount = Number(businessCardData?.summary?.activeCount || 0);
        const businessCardCount = Math.max(
          Number.isFinite(newBusinessCardCount) ? newBusinessCardCount : 0,
          Number.isFinite(activeBusinessCardCount) ? activeBusinessCardCount : 0,
        );
        const reminderError = businessCardResponse.ok
          ? ""
          : String(businessCardData?.error || `名片提醒讀取失敗（HTTP ${businessCardResponse.status}）`);

        if (!cancelled) {
          setPendingBankTransferCount(reports.length);
          setPendingBusinessCardOrderCount(businessCardCount);
          setBusinessCardReminderError(reminderError);
        }
      } catch {
        if (!cancelled) {
          setPendingBankTransferCount(0);
          setPendingBusinessCardOrderCount(0);
          setBusinessCardReminderError("名片提醒讀取失敗，請檢查後端設定。");
        }
      }
    };

    void loadPendingAdminItems();

    const intervalId = window.setInterval(() => void loadPendingAdminItems(), 60_000);
    const refreshOnFocus = () => void loadPendingAdminItems();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loggedIn, canShowAdminReminders, currentUserEmail]);

  const hasBusinessCardReminderError = Boolean(businessCardReminderError);
  const hasPendingBusinessCardOrders = pendingBusinessCardOrderCount > 0;
  const hasPendingBankTransfers = pendingBankTransferCount > 0;

  // 商品圖「尚未送出匯款回報」目前只有瀏覽器暫存可辨識；
  // 一旦客戶送出回報，首頁改以後端資料庫狀態為準。
  useEffect(() => {
    if (!loggedIn) {
      setPendingPointTransfer(null);
      return;
    }

    const refresh = () => setPendingPointTransfer(readPendingPointTransfer(currentUserEmail));
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("rxv-pending-payment-changed", refresh as EventListener);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("rxv-pending-payment-changed", refresh as EventListener);
    };
  }, [loggedIn, currentUserEmail]);

  useEffect(() => {
    if (!loggedIn) {
      setCustomerServiceStatus(null);
      return;
    }
    const token = getAuthTokenFromStorage();
    if (!token) {
      setCustomerServiceStatus(null);
      return;
    }
    let cancelled = false;
    const loadCustomerServiceStatus = async () => {
      try {
        const response = await fetch('/api/main?action=get-my-customer-service-status', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(String(data?.error || '讀取訂單狀況失敗。'));
        if (!cancelled) setCustomerServiceStatus({
          pointTransfers: Array.isArray(data?.pointTransfers) ? data.pointTransfers : [],
          paidProductImageOrders: Array.isArray(data?.paidProductImageOrders) ? data.paidProductImageOrders : [],
          businessCardOrders: Array.isArray(data?.businessCardOrders) ? data.businessCardOrders : [],
          productImageGenerations: Array.isArray(data?.productImageGenerations) ? data.productImageGenerations : [],
          storefront: data?.storefront || null,
          entitlement: data?.entitlement || null,
          nextActions: Array.isArray(data?.nextActions) ? data.nextActions : [],
          generationHistoryReady: data?.generationHistoryReady !== false,
        });
      } catch {
        if (!cancelled) setCustomerServiceStatus(null);
      }
    };
    void loadCustomerServiceStatus();
    const refresh = () => void loadCustomerServiceStatus();
    window.addEventListener('focus', refresh);
    return () => { cancelled = true; window.removeEventListener('focus', refresh); };
  }, [loggedIn, currentUserEmail]);

  // 店家網站設定入口：已開通者直接進設定；尚未開通者導向對應的購買／訂購入口。
  const hasActiveStorefrontAccess = Boolean(
    customerServiceStatus?.storefront &&
    customerServiceStatus?.entitlement &&
    customerServiceStatus.storefront.status !== "suspended",
  );

  const openStorefrontSettings = (source: "business-card" | "product-image") => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    if (hasActiveStorefrontAccess) {
      navigate("/settings/storefront");
      return;
    }

    if (source === "business-card") {
      navigate("/tools/business-card-order");
      return;
    }

    navigate("/tools/product-image-generator#product-image-plans");
  };

  // 動態 LINE 貼圖 APNG 打包工具先開放給客戶免費使用。
  // 後續若要收費，可再改為登入／點數／方案權限控管。
  const canShowAnimatedLineStickerTool = true;
  const SHOW_PAUSED_AI_TOOLS = false;
  const pausedAiToolIds = new Set(["ai-summary", "homework-helper"]);

  const getHomeShareUrl = () => {
    const productionUrl = "https://pomodoro-app-eight-rouge.vercel.app";

    if (typeof window !== "undefined") {
      const { origin, hostname } = window.location;

      // 社群分享不要帶 localhost，LINE / FB 只會顯示本機網址，外部使用者也打不開。
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return productionUrl;
      }

      return origin;
    }

    const base = getBaseUrl();
    return base.includes("localhost") ? productionUrl : base.replace(/\/$/, "");
  };

  const homeShareTitle = "RxV 高畫質圖片素材庫｜1,583+ 張完整版 NT$399";
  const homeShareText =
    "1,583+ 張高畫質圖片素材庫完整版 NT$399，涵蓋食物、商業、花卉、社群、桌布與更多分類；網站另提供部分圖片免費試用。";

  const getHomeFullShareText = () =>
    `${homeShareTitle}\n${homeShareText}\n${getHomeShareUrl()}`;

  const handleCopyHomeShareLink = async () => {
    const shareText = getHomeFullShareText();

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const input = document.createElement("textarea");
        input.value = shareText;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      alert("已複製分享文字與連結，可以貼到 LINE、FB 或社團分享。");
    } catch {
      alert("複製失敗，請手動複製網址列連結與說明文字。");
    }
  };

  const openHomeShareWindow = (type: "line" | "facebook" | "x") => {
    const shareUrlValue = getHomeShareUrl();
    const url = encodeURIComponent(shareUrlValue);
    const text = encodeURIComponent(`${homeShareTitle}｜${homeShareText}`);
    const fullText = encodeURIComponent(getHomeFullShareText());

    const shareUrl =
      type === "line"
        ? `https://social-plugins.line.me/lineit/share?url=${url}&text=${fullText}`
        : type === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
          : `https://twitter.com/intent/tweet?url=${url}&text=${text}`;

    window.open(shareUrl, "_blank", "noopener,noreferrer,width=720,height=640");
  };

  const HomeShareButtons = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={
        compact
          ? "mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4"
          : "mt-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-sky-50 p-4"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-relaxed text-slate-700">
          覺得工具實用？分享給正在做圖片、商品圖或 LINE 貼圖的朋友
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openHomeShareWindow("line")}
            className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg active:translate-y-0"
            style={{ color: "#ffffff" }}
          >
            LINE 分享
          </button>
          <button
            type="button"
            onClick={() => openHomeShareWindow("facebook")}
            className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0"
            style={{ color: "#ffffff" }}
          >
            FB 分享
          </button>
          <button
            type="button"
            onClick={() => openHomeShareWindow("x")}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg active:translate-y-0"
            style={{ color: "#ffffff" }}
          >
            X 分享
          </button>
          <button
            type="button"
            onClick={handleCopyHomeShareLink}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-blue-700 hover:shadow-lg active:translate-y-0"
          >
            複製分享文
          </button>
        </div>
      </div>
    </div>
  );

  // 工具卡資料陣列
  const toolCards: ToolCard[] = [
    {
      id: "ai-summary",
      titleKey: "ai_summary",
      descriptionKey: "home_tool_ai_summary_desc",
      icon: "🤖",
      href: "/summary",
      categoryKey: "home_category_ai",
      ringColor: "ring-sky-100",
      hoverColor: "hover:bg-sky-50",
      badgeColor: "text-sky-600",
    },
    {
      id: "images",
      titleKey: "image_library",
      descriptionKey: "home_tool_images_desc",
      icon: "🖼️",
      href: "/images",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "image-prompt",
      titleKey: "AI 生圖提示詞產生器",
      descriptionKey:
        "快速產生商品宣傳圖、社群圖、LINE 貼圖、角色圖與封面圖提示詞。",
      icon: "🖼️",
      href: "/tools/image-prompt",
      categoryKey: "home_category_design",
      ringColor: "ring-violet-100",
      hoverColor: "hover:bg-violet-50",
      badgeColor: "text-violet-700",
    },
    {
      id: "sticker-prompt",
      titleKey: "LINE 貼圖提示詞產生器",
      descriptionKey:
        "職業、店家、情緒、寵物、遊戲與品牌角色貼圖提示詞，一鍵整理成可複製版本。",
      icon: "💬",
      href: "/tools/sticker-prompt",
      categoryKey: "home_category_design",
      ringColor: "ring-violet-100",
      hoverColor: "hover:bg-violet-50",
      badgeColor: "text-violet-700",
    },
    {
      id: "emotional-value-sticker-prompt",
      titleKey: "情緒價值系 LINE 貼圖提示詞",
      descriptionKey:
        "療癒陪伴、男友感心動、哄人安慰、晚安陪聊、霸道總裁、上班回訊息等主題，快速產生 4x4 LINE 貼圖提示詞。",
      icon: "💗",
      href: "/tools/emotional-value-sticker-prompt",
      categoryKey: "home_category_design",
      ringColor: "ring-pink-100",
      hoverColor: "hover:bg-pink-50",
      badgeColor: "text-pink-700",
    },
    {
      id: "pet-prompt",
      titleKey: "寵物 AI 提示詞產生器",
      descriptionKey:
        "快速產生毛孩 LINE 貼圖、寵物寫實美圖、寵物店宣傳圖提示詞。",
      icon: "🐾",
      href: "/tools/pet-prompt",
      categoryKey: "home_category_design",
      ringColor: "ring-pink-100",
      hoverColor: "hover:bg-pink-50",
      badgeColor: "text-pink-700",
    },

    {
      id: "product-image-generator",
      titleKey: "隨手拍商品圖生成器",
      descriptionKey:
        "上傳手機隨手拍商品照，選擇白底、高級質感、社群吸睛、外送平台或促銷風格，使用點數直接生成可發文商品圖。",
      icon: "📷",
      href: "/tools/product-image-generator",
      categoryKey: "home_category_design",
      ringColor: "ring-emerald-100",
      hoverColor: "hover:bg-emerald-50",
      badgeColor: "text-emerald-700",
    },
    {
      id: "product-showcase-page",
      titleKey: "小店商品展示頁",
      descriptionKey:
        "NT$199／3 個月，可建立商品目錄頁，放商品照片、價格、介紹、LINE 詢問、公開網址與 QR Code。",
      icon: "🛒",
      href: "/tools/product-showcase-page",
      categoryKey: "home_category_design",
      ringColor: "ring-cyan-100",
      hoverColor: "hover:bg-cyan-50",
      badgeColor: "text-cyan-700",
    },
    {
      id: "business-card",
      titleKey: "人工名片設計＋代印",
      descriptionKey:
        "先選喜歡風格、填寫名片資料並上傳 Logo／圖片，由工作室協助人工排版，可加 QR Code，確認預覽後再匯款送印。",
      icon: "🪪",
      href: "/tools/business-card-order",
      categoryKey: "home_category_design",
      ringColor: "ring-violet-100",
      hoverColor: "hover:bg-violet-50",
      badgeColor: "text-violet-700",
    },
    {
      id: "eat-no-fat-game",
      titleKey: "吃不胖星球",
      descriptionKey: "點美食、餵角色、累積快樂值，解鎖可愛食物圖鑑的療癒小遊戲。",
      icon: "🍰",
      href: "/tools/eat-no-fat-game",
      categoryKey: "home_category_life",
      ringColor: "ring-rose-100",
      hoverColor: "hover:bg-rose-50",
      badgeColor: "text-rose-700",
    },
    {
      id: "image-resize",
      titleKey: "home_tool_image_resize_title",
      descriptionKey: "home_tool_image_resize_desc",
      icon: "📐",
      href: "/tools/image-resize",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "image-crop",
      titleKey: "home_tool_image_crop_title",
      descriptionKey: "home_tool_image_crop_desc",
      icon: "✂️",
      href: "/tools/image-crop",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "image-convert",
      titleKey: "home_tool_image_convert_title",
      descriptionKey: "home_tool_image_convert_desc",
      icon: "🔄",
      href: "/tools/image-convert",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "line-sticker",
      titleKey: "home_tool_line_sticker_title",
      descriptionKey: "home_tool_line_sticker_desc",
      icon: "📦",
      href: "/tools/line-sticker",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "animated-sticker-prompt",
      titleKey: "LINE 動態貼圖提示詞產生器",
      descriptionKey: "產生 8／16／24 張動態 LINE 貼圖企劃、動畫分鏡、幀數秒數建議與提示詞。",
      icon: "🎞️",
      href: "/tools/animated-sticker-prompt",
      categoryKey: "home_category_design",
      ringColor: "ring-pink-100",
      hoverColor: "hover:bg-pink-50",
      badgeColor: "text-pink-700",
    },
    ...(canShowAnimatedLineStickerTool
      ? [
          {
            id: "animated-line-sticker",
            titleKey: "動態 LINE 貼圖 APNG 打包工具",
            descriptionKey: "上傳多張禎圖，檢查 LINE 動態貼圖規格，預覽動畫並匯出 APNG 或逐禎 ZIP。",
            icon: "✨",
            href: "/tools/animated-line-sticker",
            categoryKey: "home_category_design",
            ringColor: "ring-fuchsia-100",
            hoverColor: "hover:bg-fuchsia-50",
            badgeColor: "text-fuchsia-700",
          },
        ]
      : []),
    {
      id: "image-compress",
      titleKey: "圖片壓縮工具",
      descriptionKey: "快速壓縮 JPG、PNG、WebP，縮小檔案大小。",
      icon: "🗜️",
      href: "/tools/image-compress",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "free-resources",
      titleKey: "免費資源中心",
      descriptionKey: "LINE 貼圖咒語、AI 生圖提示詞、文案模板與部分免費圖片試用。",
      icon: "🎁",
      href: "/free",
      categoryKey: "home_category_design",
      ringColor: "ring-pink-100",
      hoverColor: "hover:bg-pink-50",
      badgeColor: "text-pink-700",
    },
    {
      id: "scam-check",
      titleKey: "scam_check_title",
      descriptionKey: "home_tool_scam_check_desc",
      icon: "🛡️",
      href: "/tools/scam-check",
      categoryKey: "home_category_life",
      ringColor: "ring-amber-100",
      hoverColor: "hover:bg-amber-50",
      badgeColor: "text-amber-700",
    },
    {
      id: "traffic-accident",
      titleKey: "車禍現場與筆錄前自保清單",
      descriptionKey: "路口車禍、機車擦撞、追撞時可用，整理現場 SOP、拍照清單、筆錄前重點與後續待辦。",
      icon: "🚗",
      href: "/tools/traffic-accident",
      categoryKey: "home_category_life",
      ringColor: "ring-amber-100",
      hoverColor: "hover:bg-amber-50",
      badgeColor: "text-amber-700",
    },
    {
      id: "qr-code",
      titleKey: "tool_qr_code_title",
      descriptionKey: "tool_qr_code_desc",
      icon: "📱",
      href: "/tools/qr-code",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
    },
    {
      id: "homework-helper",
      titleKey: "homework_helper",
      descriptionKey: "home_tool_homework_desc",
      icon: "📘",
      href: "/tools/homework-helper",
      categoryKey: "home_category_learn",
      ringColor: "ring-amber-100",
      hoverColor: "hover:bg-amber-50",
      badgeColor: "text-amber-700",
    },
    // 好物推薦／比價入口：測試階段先關閉，避免導流與分潤功能過早曝光。
    {
      id: "video-tool",
      titleKey: "home_tool_video_title",
      descriptionKey: "home_tool_video_desc",
      icon: "🎬",
      href: "/tools/shopee-video",
      disabled: false,
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
      extraContent: (
        <p className="mt-2 text-xs text-gray-500">{t("home_tool_video_ps")}</p>
      ),
    },
    {
      id: "image-to-video",
      titleKey: "home_tool_image_to_video_title",
      descriptionKey: "home_tool_image_to_video_desc",
      icon: "🎞️",
      href: "/tools/image-to-video",
      categoryKey: "home_category_design",
      ringColor: "ring-teal-100",
      hoverColor: "hover:bg-teal-50",
      badgeColor: "text-teal-700",
      extraContent: (
        <p className="mt-2 text-xs text-gray-500">{t("home_tool_video_ps")}</p>
      ),
    },
    {
      id: "pomodoro",
      titleKey: "home_tool_pomodoro_title",
      descriptionKey: "home_tool_pomodoro_desc",
      icon: "🍅",
      href: "/pomodoro",
      categoryKey: "home_category_productivity",
      ringColor: "ring-rose-100",
      hoverColor: "hover:bg-rose-50",
      badgeColor: "text-rose-700",
    },
    {
      id: "todo",
      titleKey: "todo",
      descriptionKey: "home_tool_todo_desc",
      icon: "✅",
      href: "/todo",
      categoryKey: "home_category_task",
      ringColor: "ring-amber-100",
      hoverColor: "hover:bg-amber-50",
      badgeColor: "text-amber-700",
    },
    {
      id: "chant",
      titleKey: "home_tool_chant_title",
      descriptionKey: "home_tool_chant_desc",
      icon: "🔔",
      href: "/chant",
      categoryKey: "home_category_mindful",
      ringColor: "ring-indigo-100",
      hoverColor: "hover:bg-indigo-50",
      badgeColor: "text-indigo-700",
    },
    // TODO: 為了上線摘要與作業功能，暫時隱藏集氣願望模組
    // 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
    ...(isChantWishEnabled
      ? [
          {
            id: "chant-wish-wall",
            titleKey: "home_tool_chant_wish_title",
            descriptionKey: "home_tool_chant_wish_desc",
            icon: "🕯",
            href: "/chant-wish-wall",
            categoryKey: "home_category_chant",
            ringColor: "ring-purple-100",
            hoverColor: "hover:bg-purple-50",
            badgeColor: "text-purple-700",
            extraContent: (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-purple-700">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/chant-wish-create");
                  }}
                  className="underline cursor-pointer hover:text-purple-900"
                >
                  {t("home_create_chant_link")}
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/chant-stats");
                  }}
                  className="underline cursor-pointer hover:text-purple-900"
                >
                  {t("home_chant_stats_link")}
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/chant-ranking");
                  }}
                  className="underline cursor-pointer hover:text-purple-900"
                >
                  {t("home_chant_ranking_link")}
                </div>
              </div>
            ),
          },
        ]
      : []),
    // 圖片管理工具：本機或指定管理帳號顯示
    ...(canShowAdminTools
      ? [
          {
            id: "admin-images-upload",
            titleKey: "home_tool_admin_images_title",
            descriptionKey: "home_tool_admin_images_desc",
            icon: "📤",
            href: "/admin/images",
            categoryKey: "home_category_admin",
            ringColor: "ring-red-100",
            hoverColor: "hover:bg-red-50",
            badgeColor: "text-red-700",
          },
          {
            id: "admin-images-list",
            titleKey: "home_tool_admin_images_list_title",
            descriptionKey: "home_tool_admin_images_list_desc",
            icon: "📋",
            href: "/admin/images/list",
            categoryKey: "home_category_admin",
            ringColor: "ring-red-100",
            hoverColor: "hover:bg-red-50",
            badgeColor: "text-red-700",
          },
        ]
      : []),
  ];

  const baseUrl = getBaseUrl().replace(/\/$/, "");

  const homeQuickToolButtons = toolCards
    .filter((card) => !pausedAiToolIds.has(card.id))
    .filter(
      (card) => !["video-tool", "image-to-video"].includes(card.id) || canShowAdminTools,
    )
    .filter((card) => !card.featureFlag || featureFlags[card.featureFlag])
    .filter((card) => SHOW_GROUP_BUY || (!String(card.href || "").includes("/group-buy") && !/亞尼克|團購/.test(String(card.titleKey || ""))))
    .filter((card) => card.href && !card.disabled)
    .filter((card, index, array) => array.findIndex((item) => item.href === card.href) === index);

  const homeToolGroups = [
    { key: "sticker", title: "LINE 貼圖工具", match: (card: (typeof toolCards)[number]) => card.id.includes("sticker") || String(card.href).includes("sticker") || String(card.href).includes("line-sticker") },
    { key: "image", title: "圖片與生圖工具", match: (card: (typeof toolCards)[number]) => ["images", "image-prompt", "pet-prompt", "image-resize", "image-crop", "image-convert", "qr-code"].includes(card.id) },
    { key: "business", title: "小商家接單與印刷服務", match: (card: (typeof toolCards)[number]) => ["product-showcase-page", "product-image-generator", "business-card"].includes(card.id) },
    { key: "video", title: "短影音工具", match: (card: (typeof toolCards)[number]) => ["video-tool", "image-to-video"].includes(card.id) },
    { key: "life", title: "遊戲／生活／效率", match: (card: (typeof toolCards)[number]) => ["eat-no-fat-game", "scam-check", "traffic-accident", "pomodoro", "todo", "chant", "homework-helper"].includes(card.id) },
    { key: "resource", title: "免費資源", match: (card: (typeof toolCards)[number]) => ["free-resources", "admin-images-upload", "admin-images-list"].includes(card.id) || String(card.href).includes("/free") || String(card.href).includes("services") },
  ]
    .map((group) => ({ ...group, items: homeQuickToolButtons.filter(group.match) }))
    .filter((group) => group.items.length > 0);

  const renderHomeQuickButton = (card: (typeof toolCards)[number]) => {
    const videoLocked =
      Boolean(card.href) &&
      card.href !== "/tools/animated-line-sticker" &&
      !isAdminEmail &&
      !isLocalDevelopment() &&
      isVideoToolPublicPath(card.href as string);
    if (videoLocked) return null;

    const imageLibraryDescription =
      "1,583+ 張高畫質圖片素材庫完整版 NT$399，另提供部分圖片免費試用。";

    return (
      <Link
        key={card.id}
        to={card.href as string}
        className={`group relative flex min-h-[168px] flex-col rounded-2xl border border-slate-200 border-l-4 ${categoryIndicatorClass(card.categoryKey)} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-lg`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl shadow-sm" aria-hidden>
            {card.icon}
          </span>
          {card.id === "images" ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
              NT$399
            </span>
          ) : card.badge ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
              {card.badge}
            </span>
          ) : null}
        </div>
        <h4 className="mt-4 text-lg font-black leading-snug text-slate-950 transition group-hover:text-sky-700">
          {card.id === "images" ? "高畫質圖片素材庫" : t(card.titleKey)}
        </h4>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {card.id === "images" ? imageLibraryDescription : t(card.descriptionKey)}
        </p>
        <span className="mt-auto pt-4 text-sm font-black text-sky-700">
          {card.id === "images" ? "查看 NT$399 素材庫 →" : "開啟工具 →"}
        </span>
      </Link>
    );
  };

  const featuredTools = [
    {
      id: "images",
      icon: "🖼️",
      titleKey: "image_library",
      descKey: "home_tool_images_desc",
      href: "/images",
    },
    {
      id: "line-sticker",
      icon: "💬",
      titleKey: "home_featured_line_sticker_title",
      descKey: "home_featured_line_sticker_desc",
      href: "/tools/line-sticker",
    },
    ...(canShowAnimatedLineStickerTool
      ? [
          {
            id: "animated-line-sticker",
            icon: "✨",
            titleKey: "動態 LINE 貼圖 APNG 打包工具",
            descKey: "上傳第 1 禎到第 N 禎，預覽動畫、檢查 LINE 規格，快速匯出 APNG、GIF、MP4 或逐禎 ZIP。先免費開放使用。",
            href: "/tools/animated-line-sticker",
          },
        ]
      : []),
    {
      id: "image-prompt",
      icon: "🖼️",
      titleKey: "AI 生圖提示詞產生器",
      descKey: "快速產生商品宣傳圖、社群圖、LINE 貼圖、角色圖與封面圖提示詞。",
      href: "/tools/image-prompt",
    },
    {
      id: "pet-prompt",
      icon: "🐾",
      titleKey: "寵物 AI 提示詞產生器",
      descKey: "毛孩貼圖、寵物美圖、寵物店宣傳圖，一鍵產生寵物專用提示詞。",
      href: "/tools/pet-prompt",
    },
    {
      id: "product-showcase-page",
      icon: "🛒",
      titleKey: "小店商品展示頁",
      descKey: "NT$199／3 個月，建立可分享的商品目錄頁，放商品照片、價格、LINE 詢問與 QR Code。",
      href: "/tools/product-showcase-page",
    },
    {
      id: "business-card",
      icon: "🪪",
      titleKey: "人工名片設計＋代印",
      descKey: "選擇名片風格、填寫資料並上傳 Logo／圖片，由工作室人工排版；確認預覽後再匯款送印，可加 QR Code。",
      href: "/tools/business-card-order",
    },
    {
      id: "eat-no-fat-game",
      icon: "🍰",
      titleKey: "吃不胖星球",
      descKey: "點美食、餵角色、累積快樂值，解鎖可愛食物圖鑑。",
      href: "/tools/eat-no-fat-game",
    },
    {
      id: "traffic-accident",
      icon: "🚗",
      titleKey: "車禍現場與筆錄前自保清單",
      descKey: "發生路口車禍或機車擦撞時，快速整理現場 SOP、拍照蒐證與筆錄前重點。",
      href: "/tools/traffic-accident",
    },
    {
      id: "free-resources",
      icon: "🎁",
      titleKey: "免費資源中心",
      descKey: "LINE 貼圖咒語、AI 生圖提示詞、文案模板與部分免費圖片試用。",
      href: "/free",
    },
    {
      id: "image-resize",
      icon: "🖼️",
      titleKey: "home_featured_image_resize_title",
      descKey: "home_featured_image_resize_desc",
      href: "/tools/image-resize",
    },
    {
      id: "image-compress",
      icon: "🗜️",
      titleKey: "home_featured_image_compress_title",
      descKey: "home_featured_image_compress_desc",
      href: "/tools/image-compress",
    },
    {
      id: "image-convert",
      icon: "🔄",
      titleKey: "home_featured_image_convert_title",
      descKey: "home_featured_image_convert_desc",
      href: "/tools/image-convert",
    },
    {
      id: "image-crop",
      icon: "✂️",
      titleKey: "home_featured_image_crop_title",
      descKey: "home_featured_image_crop_desc",
      href: "/tools/image-crop",
    },
    ...(canShowAdminTools
      ? [
          {
            id: "video-tool",
            icon: "🎬",
            titleKey: "home_tool_video_title",
            descKey: "home_tool_video_desc",
            href: "/tools/shopee-video",
          },
        ]
      : []),
  ];

  return (
    <>
      <SEO
        title={t("home.seo.title")}
        description={t("home.seo.description")}
        keywords={t("home.seo.keywords")}
        path="/"
        jsonLdList={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: t("home.jsonLd.websiteName"),
            url: `${baseUrl}/`,
            potentialAction: {
              "@type": "SearchAction",
              target: `${baseUrl}/blog?category={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: t("home.jsonLd.organizationName"),
            url: `${baseUrl}/`,
            logo: `${baseUrl}/icons/icon-512.png`,
          },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50">
        {/* 商品圖工具帳號入口＋商品展示頁加贈推廣。 */}
        <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-white shadow-sm">
            {/* 改為直式版面，避免管理按鈕過寬時把左側文字擠成逐字換行。 */}
            <div className="p-5 sm:p-6">
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  AI 商品圖工具
                </span>
                <p className="mt-3 text-lg font-black leading-snug text-slate-900 sm:text-xl">
                  先登入帳號，再使用點數生成商品圖
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  第一次使用請先註冊；已有帳號可登入後使用商品圖生成器與點數功能。
                </p>
              </div>

              {loggedIn ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex min-h-[48px] max-w-full items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black leading-relaxed text-emerald-700">
                    <span className="break-all text-center">已登入{currentUserEmail ? `：${currentUserEmail}` : ""}</span>
                  </span>
                  <Link
                    to="/tools/product-image-generator"
                    className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                    style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                  >
                    前往商品圖工具
                  </Link>

                  <section className="w-full rounded-2xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-950">我的店家網頁</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          可建立一頁式品牌／公司介紹網站，或商品圖片、價格、聯絡方式與 QR Code 分享頁。
                        </p>
                        <p className={`mt-2 text-sm font-bold ${hasActiveStorefrontAccess ? "text-emerald-700" : "text-slate-500"}`}>
                          {hasActiveStorefrontAccess
                            ? "已開通店家網頁資格，現在可直接進入設定。"
                            : "尚未開通時，按下按鈕會帶你前往對應的名片或商品圖方案。"}
                        </p>
                      </div>
                      {hasActiveStorefrontAccess ? (
                        <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
                          已開通
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openStorefrontSettings("business-card")}
                        className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-black text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md"
                      >
                        設定名片／公司介紹網站
                      </button>
                      <button
                        type="button"
                        onClick={() => openStorefrontSettings("product-image")}
                        className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-black text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md"
                      >
                        設定商品展示頁
                      </button>
                      <Link
                        to="/tools/product-showcase-page"
                        className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md"
                        style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                      >
                        商品展示頁方案
                      </Link>
                      <Link
                        to="/tools/business-card-order"
                        className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-md"
                        style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                      >
                        人工名片設計＋印刷
                      </Link>
                    </div>
                  </section>

                  {customerServiceStatus ? (() => {
                    const serverActions = Array.isArray(customerServiceStatus.nextActions) ? customerServiceStatus.nextActions : [];
                    const hasServerProductTransferAction = serverActions.some((action) => String(action.key || '').startsWith('product-image-transfer'));
                    const localPaymentAction: CustomerNextAction | null = pendingPointTransfer && !hasServerProductTransferAction
                      ? {
                          key: 'product-image-transfer-awaiting-report',
                          title: `商品圖方案待匯款｜NT$${pendingPointTransfer.amount}`,
                          description: '請先依帳號完成匯款，再回填匯款日期與帳號後五碼。',
                          href: `/payment/bank-transfer?plan=${encodeURIComponent(pendingPointTransfer.planId)}`,
                          tone: 'amber',
                        }
                      : null;
                    const actions = [...(localPaymentAction ? [localPaymentAction] : []), ...serverActions].slice(0, 3);

                    return actions.length ? (
                      <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-slate-950">需要處理</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">首頁只顯示最新待處理事項；舊訂單與商品圖紀錄請到「我的服務與訂單」查看。</p>
                          </div>
                          <Link
                            to="/my-services"
                            className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            我的服務與訂單
                          </Link>
                        </div>
                        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {actions.map((action) => (
                            <Link
                              key={action.key}
                              to={action.href}
                              className={`rounded-xl border px-4 py-3 text-left transition ${customerActionStyle(action.tone)}`}
                            >
                              <p className={`text-sm font-black ${customerActionTextStyle(action.tone)}`}>{action.title}</p>
                              <p className={`mt-1 text-sm leading-relaxed ${customerActionDetailStyle(action.tone)}`}>{action.description}</p>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ) : (
                      <Link
                        to="/my-services"
                        className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                      >
                        查看我的服務與訂單
                      </Link>
                    );
                  })() : null}
                  {canShowAdminReminders ? (
                    <div className="flex w-full flex-wrap gap-2">
                      <Link
                        to="/admin/business-card-orders"
                        className={`inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
                          hasBusinessCardReminderError
                            ? "bg-amber-600 hover:bg-amber-700"
                            : hasPendingBusinessCardOrders
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "bg-violet-600 hover:bg-violet-700"
                        }`}
                        style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                      >
                        {hasBusinessCardReminderError
                          ? "⚠ 名片提醒讀取失敗，請檢查"
                          : hasPendingBusinessCardOrders
                            ? `⚠ 待處理名片 ${pendingBusinessCardOrderCount} 筆`
                            : "名片訂單後台"}
                      </Link>

                      <Link
                        to="/admin/payments"
                        className={`inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
                          hasPendingBankTransfers
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-sky-600 hover:bg-sky-700"
                        }`}
                        style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                      >
                        {hasPendingBankTransfers
                          ? `⚠ 待核對商品圖匯款 ${pendingBankTransferCount} 筆`
                          : "商品圖付款後台"}
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                    style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                  >
                    免費註冊帳號
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
                  >
                    已有帳號，登入
                  </Link>
                  <Link
                    to="/tools/business-card-order"
                    className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg"
                    style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                  >
                    人工名片設計＋印刷
                  </Link>
                  <Link
                    to="/tools/product-showcase-page"
                    className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg"
                    style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                  >
                    小店商品展示頁
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-emerald-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-5 sm:p-6">
              <div className="min-w-0">
                <div className="inline-flex items-center rounded-full bg-cyan-600 px-3 py-1 text-xs font-black !text-white shadow-sm" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                  🛒 小店接單工具
                </div>
                <h2 className="mt-3 text-xl font-black leading-snug text-slate-950 sm:text-2xl">
                  商品展示頁可單獨購買，也可搭配名片與商品圖使用
                </h2>
                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  建立商品照片、價格、介紹、LINE 詢問、公開網址與 QR Code，讓客人從名片、小卡、社群貼文或私訊連到同一個商品目錄頁。
                </p>
              </div>

              <div className={`mt-5 grid w-full gap-4 ${loggedIn ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                <Link
                  to="/tools/product-showcase-page"
                  className="group flex min-h-[150px] flex-col rounded-2xl border border-cyan-200 border-l-4 border-l-cyan-500 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:bg-cyan-50/40 hover:shadow-lg"
                >
                  <span className="text-2xl" aria-hidden>🛒</span>
                  <h3 className="mt-3 text-base font-black text-slate-950">商品展示頁正式版</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">NT$199／3 個月，建立可分享的商品目錄與 LINE 詢問頁。</p>
                  <span className="mt-auto pt-3 text-sm font-black text-cyan-700">查看方案 →</span>
                </Link>
                <Link
                  to="/pricing"
                  className="group flex min-h-[150px] flex-col rounded-2xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:bg-emerald-50/40 hover:shadow-lg"
                >
                  <span className="text-2xl" aria-hidden>📷</span>
                  <h3 className="mt-3 text-base font-black text-slate-950">商品圖點數方案</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">上傳隨手拍商品照，使用點數生成白底、商業或社群商品圖。</p>
                  <span className="mt-auto pt-3 text-sm font-black text-emerald-700">查看點數 →</span>
                </Link>
                <Link
                  to="/shop/rxv"
                  className="group flex min-h-[150px] flex-col rounded-2xl border border-amber-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:bg-amber-50/40 hover:shadow-lg"
                >
                  <span className="text-2xl" aria-hidden>👀</span>
                  <h3 className="mt-3 text-base font-black text-slate-950">商品頁展示範例</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">先看看實際公開商品頁的排版、商品資訊與聯絡入口。</p>
                  <span className="mt-auto pt-3 text-sm font-black text-amber-700">查看範例 →</span>
                </Link>
                {loggedIn ? (
                  <button
                    type="button"
                    onClick={() => openStorefrontSettings("product-image")}
                    className="group flex min-h-[150px] flex-col rounded-2xl border border-sky-200 border-l-4 border-l-sky-500 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:bg-sky-50/40 hover:shadow-lg"
                  >
                    <span className="text-2xl" aria-hidden>⚙️</span>
                    <h3 className="mt-3 text-base font-black text-slate-950">設定我的商品展示頁</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">已開通的帳號可直接管理商品、公開內容與聯絡資訊。</p>
                    <span className="mt-auto pt-3 text-sm font-black text-sky-700">前往設定 →</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* 頁面最大寬度 */}
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 lg:py-12 flex flex-col">
          {/* Hero 區：標題＋主推工具 */}
          <section className="mb-10 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-sky-100 sm:p-8 order-2">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1 space-y-3">
                <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  🖼️ 1,583+ 張高畫質圖片素材庫
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  高畫質圖片素材庫完整版 NT$399｜部分圖片免費試用
                </h1>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  一次取得 1,583+ 張高畫質圖片素材，適合網站、社群貼文、廣告、短影音與商業設計；
                  網站保留部分圖片免費試用，也可搭配 LINE 貼圖與圖片工具使用。
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/images"
                    className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-base font-bold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-xl"
                  >
                    🖼️ 查看 NT$399 完整素材庫
                  </Link>
                  <Link
                    to="/tools/sticker-prompt"
                    className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-base font-bold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl"
                  >
                    💬 LINE 貼圖提示詞
                  </Link>
                  <Link
                    to="/tools/line-sticker"
                    className="inline-flex items-center rounded-full bg-cyan-600 px-6 py-3 text-base font-bold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-700 hover:shadow-xl"
                  >
                    🧩 LINE 貼圖分割打包
                  </Link>
                  <Link
                    to="/tools/image-prompt"
                    className="inline-flex items-center rounded-full bg-violet-600 px-6 py-3 text-base font-bold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-violet-700 hover:shadow-xl"
                  >
                    🖼️ 生圖提示詞
                  </Link>
                  <Link
                    to="/tools/emotional-value-sticker-prompt"
                    className="inline-flex items-center rounded-full bg-rose-600 px-6 py-3 text-base font-bold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-rose-700 hover:shadow-xl"
                  >
                    💗 情緒價值貼圖
                  </Link>
                  <Link
                    to="/free"
                    className="inline-flex items-center rounded-full bg-pink-600 px-6 py-3 text-base font-bold !text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-pink-700 hover:shadow-xl"
                  >
                    🎁 免費資源中心
                  </Link>
                  <Link
                    to="/tools/image-resize"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition-all duration-200 hover:scale-[1.03] hover:bg-sky-50 hover:text-blue-700 hover:shadow-lg"
                  >
                    📐 圖片尺寸轉換
                  </Link>
                </div>
                <HomeShareButtons />
              </div>
              <div className="flex-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/images"
                    className="relative flex flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white shadow-lg ring-1 ring-white/10 transition-all hover:shadow-xl"
                  >
                    <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                      NT$399
                    </span>
                    <div className="flex items-center pr-14">
                      <span className="text-lg font-semibold text-white">
                        🖼️ 高畫質圖片素材庫
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white">
                      1,583+ 張完整版 NT$399，部分圖片可免費試用；適合社群、網站、短影音、廣告與商業設計。
                    </p>
                  </Link>
                  <Link
                    to="/tools/line-sticker"
                    className="relative flex flex-col justify-between rounded-2xl border border-cyan-200 bg-white p-4 shadow-md transition-all hover:shadow-lg"
                  >
                    <span className="absolute right-3 top-3 rounded-full bg-cyan-600 px-2 py-0.5 text-xs font-bold text-white">
                      貼圖
                    </span>
                    <div className="flex items-center pr-14">
                      <span className="text-lg font-bold text-slate-900">
                        💬 LINE 貼圖整理
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700">
                      4x4／5x4 貼圖大圖可分割、整理與 ZIP 打包，適合後續上架使用。
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </section>


          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm order-1 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">所有工具卡片入口</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  全部入口統一使用卡片版型；依分類查看功能、用途與前往入口。
                </p>
              </div>
              <Link to="/tools" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-bold !text-white shadow hover:bg-sky-700">
                工具總覽
              </Link>
            </div>
            <div className="space-y-8">
              {homeToolGroups.map((group) => (
                <div key={group.key}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-base font-black text-slate-800">{group.title}</h3>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.items.map(renderHomeQuickButton)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <LineStickerAuthorCard compact className="order-4 md:order-3" />

          <section className="hidden">
            <h2 className="text-xl font-bold text-slate-900">
              🔥 {t("home_section_popular_tools_title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("home_section_popular_tools_desc")}
            </p>
            <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {featuredTools
                .filter((tool) => !pausedAiToolIds.has(tool.id))
                .map((tool) => {
                  const th = featuredToolTheme(tool.id);
                  return (
                    <Link
                      key={tool.id}
                      to={tool.href}
                      className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-sky-50"
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-1 text-base ${th.iconBg} ${th.iconHover}`}
                          aria-hidden
                        >
                          {tool.icon}
                        </span>
                        <span
                          className={`min-w-0 font-semibold text-slate-900 ${th.titleHover}`}
                        >
                          {t(tool.titleKey)}
                        </span>
                      </span>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {tool.id === "images"
                          ? "1,583+ 張高畫質圖片素材庫完整版 NT$399，網站另提供部分圖片免費試用。"
                          : t(tool.descKey)}
                      </p>
                    </Link>
                  );
                })}
            </div>
          </section>

          <section className="hidden">
            <h2 className="text-xl font-bold text-slate-900">
              {t("home_section_tool_categories_title")}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-teal-100 bg-white px-4 py-3">
                <h3 className="text-xl font-bold text-teal-900">圖片工具</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal-800">
                  圖片素材、提示詞、壓縮、轉尺寸、裁切與 LINE 貼圖整理
                </p>
                <ul className="mt-3 space-y-2 text-base font-semibold text-blue-600">
                  <li>
                    <Link to="/images" className="hover:underline">
                      🖼️ 高畫質圖片素材庫 NT$399
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/image-prompt" className="hover:underline">
                      🖼️ 生圖提示詞產生器
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/emotional-value-sticker-prompt" className="hover:underline">
                      情緒價值系 LINE 貼圖提示詞
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/image-resize" className="hover:underline">
                      圖片尺寸轉換
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/image-compress"
                      className="hover:underline"
                    >
                      圖片壓縮
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/image-convert" className="hover:underline">
                      圖片格式轉換
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/image-crop" className="hover:underline">
                      線上圖片裁切
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/line-sticker" className="hover:underline">
                      LINE 貼圖整理工具
                    </Link>
                  </li>
                  {canShowAdminTools && (
                    <li>
                      <Link
                        to="/tools/shopee-video"
                        className="hover:underline"
                      >
                        🎬 蝦皮短影音工具
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/tools/line-sticker" className="hover:underline">
                      LINE 貼圖分割與打包
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/qr-code" className="hover:underline">
                      QR Code 產生器
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <h3 className="text-xl font-bold text-rose-900">效率工具</h3>
                <p className="mt-2 text-sm leading-relaxed text-rose-800">
                  番茄鐘與待辦清單
                </p>
                <ul className="mt-3 space-y-2 text-base font-semibold text-blue-600">
                  <li>
                    <Link to="/pomodoro" className="hover:underline">
                      番茄鐘 Pomodoro
                    </Link>
                  </li>
                  <li>
                    <Link to="/todo" className="hover:underline">
                      待辦清單 Todo
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-100 bg-white px-4 py-3">
                <h3 className="text-xl font-bold text-amber-900">生活工具</h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                  詐騙判斷與政策白話解釋
                </p>
                <ul className="mt-3 space-y-2 text-base font-semibold text-blue-600">
                  <li>
                    <Link to="/tools/scam-check" className="hover:underline">
                      詐騙風險判斷
                    </Link>
                  </li>
                  <li>
                    <Link to="/policy-explained" className="hover:underline">
                      政策白話解釋
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 🚀 快速工具入口 */}
          <section className="hidden">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <span className="mr-2">🚀</span>
              {t("home_quick_tools_title")}
            </h3>
            <div className="mb-6 p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-200">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                🖼️ 高畫質圖片素材庫持續更新中
              </h4>
              <p className="text-sm leading-relaxed text-gray-700">
                目前提供 1,583+ 張高畫質圖片素材，完整版一次取得 NT$399；網站另保留部分圖片免費試用。
                適合社群貼文、短影音封面、網站、廣告與商業設計，並會持續新增素材。
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/images"
                  className="inline-flex rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold !text-white shadow hover:bg-emerald-700 hover:!text-white"
                  style={{ color: "#ffffff" }}
                >
                  查看 NT$399 完整素材庫
                </Link>
                <a
                  href="mailto:rxv0227@gmail.com?subject=我想許願圖片素材風格"
                  className="inline-flex rounded-lg border border-emerald-300 bg-white px-5 py-2 text-sm font-bold text-emerald-700 shadow hover:bg-emerald-50"
                >
                  Email 許願圖片風格
                </a>
                <span className="self-center text-sm font-bold text-emerald-900">
                  MAIL：rxv0227@gmail.com
                </span>
                <a
                  href="https://p.ecpay.com.tw/FD7CD6D"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg bg-amber-600 px-5 py-2 text-sm font-bold !text-white shadow hover:bg-amber-700 hover:!text-white"
                  style={{ color: "#ffffff" }}
                >
                  ☕ 台灣小額支持
                </a>
                <a
                  href="https://ko-fi.com/ang2289"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold !text-white shadow hover:bg-blue-700 hover:!text-white"
                  style={{ color: "#ffffff" }}
                >
                  🌍 Ko-fi 海外支持
                </a>
              </div>
            </div>

            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                🎨 貼圖創作者推薦工具
              </h4>
              <p className="text-sm leading-relaxed text-gray-700">
                想自己製作 LINE 貼圖，可以先用 PhotoRoom 產生貼紙角色素材，再用
                PhotoRoom 去背工具處理透明背景，最後回到 RxV 工具整理尺寸與打包
                ZIP。
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://app.photoroom.com/create"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold !text-white shadow hover:bg-blue-700 hover:!text-white"
                  style={{ color: "#ffffff" }}
                >
                  PhotoRoom 貼紙素材
                </a>
                <a
                  href="https://www.photoroom.com/zh-tw/tools/background-remover"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold !text-white shadow hover:bg-purple-700 hover:!text-white"
                  style={{ color: "#ffffff" }}
                >
                  PhotoRoom 去背工具
                </a>
              </div>
            </div>

            <HomeShareButtons compact />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHOW_PAUSED_AI_TOOLS && (
                <>
                  {/* 作業解題神器 */}
                  <Link
                    to="/tools/homework-helper"
                    onClick={() => {
                      trackEvent("click_homework_entry", {
                        source_page: "home",
                        position: "quick_tools",
                      });
                    }}
                    className="block p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
                  >
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 text-lg">
                      {t("home_quick_homework_title")}
                    </h4>
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      {t("home_quick_homework_desc")}
                    </p>
                    <div className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow transition-all duration-200 ease-out group-hover:bg-blue-700 text-sm">
                      {t("home_go_btn")}
                    </div>
                  </Link>

                  {/* 文章摘要工具 */}
                  <Link
                    to="/summary"
                    className="block p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
                  >
                    <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-2 text-lg">
                      {t("home_quick_summary_title")}
                    </h4>

                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      {t("home_quick_summary_desc")}
                    </p>
                    <div className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow transition-all duration-200 ease-out group-hover:bg-blue-700 text-sm">
                      {t("home_go_btn")}
                    </div>
                  </Link>
                </>
              )}

              <Link
                to="/tools/image-prompt"
                className="block p-5 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
              >
                <h4 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors mb-2 text-lg">
                  🖼️ AI 生圖提示詞產生器
                </h4>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  不只 LINE 貼圖，這裡也可產生一般圖片
                  Prompt。適合社群吸睛圖、商品宣傳圖、品牌形象圖、桌布圖與封面圖。
                </p>
                <div
                  className="inline-flex items-center rounded-lg bg-violet-600 px-5 py-2 font-semibold !text-white shadow transition-all duration-200 ease-out group-hover:bg-violet-700 text-sm"
                  style={{ color: "#ffffff" }}
                >
                  前往生圖提示詞頁
                </div>
              </Link>

              <Link
                to="/tools/pet-prompt"
                className="block p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
              >
                <h4 className="font-bold text-gray-900 group-hover:text-pink-700 transition-colors mb-2 text-lg">
                  🐾 寵物 AI 提示詞產生器
                </h4>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  專門產生毛孩 LINE 貼圖、寵物寫實美圖、寵物店宣傳圖 Prompt，分類跟人物版分開。
                </p>
                <div
                  className="inline-flex items-center rounded-lg bg-pink-600 px-5 py-2 font-semibold !text-white shadow transition-all duration-200 ease-out group-hover:bg-pink-700 text-sm"
                  style={{ color: "#ffffff" }}
                >
                  前往寵物提示詞頁
                </div>
              </Link>

              {/* 圖片分享頁 */}
              <Link
                to="/images"
                className="block p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
              >
                <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-2 text-lg">
                  🖼️ 高畫質圖片素材庫
                </h4>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  1,583+ 張高畫質圖片素材完整版 NT$399，部分圖片可免費試用；適合社群貼文、網站、短影音與商業設計。
                </p>
                <div
                  className="inline-flex items-center rounded-lg bg-teal-600 px-5 py-2 font-semibold !text-white shadow transition-all duration-200 ease-out group-hover:bg-teal-700 text-sm"
                  style={{ color: "#ffffff" }}
                >
                  查看 NT$399 完整素材庫
                </div>
              </Link>
            </div>
          </section>

          {/* 📋 政策白話解釋（突出顯示） */}
          <section className="mb-10 order-12 md:order-11">
            <Link
              to="/policy-explained"
              className="block p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📋</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {t("home_policy_title")}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("home_policy_subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {t("home_policy_desc")}
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-purple-600 group-hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 text-sm ml-4">
                  {t("home_view_btn")}
                </div>
              </div>
            </Link>
          </section>

          <section className="hidden">
            <h2 className="text-xl font-bold text-slate-900">
              {t("home_section_efficiency_title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("home_section_efficiency_desc")}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href="/pomodoro"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 hover:bg-rose-100 hover:shadow-lg"
              >
                {t("home_efficiency_pomodoro_label")}
              </a>
              <a
                href="/todo"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100 hover:shadow-lg"
              >
                {t("home_efficiency_todo_label")}
              </a>
            </div>
          </section>

          {/* 區塊 2：AI / 生產力 / 靜心工具卡片 */}
          <section className="hidden">
            {/* 所有工具快速入口 */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  🧰 所有工具快速入口
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  依分類列出目前可用入口，方便快速找到要用的工具。
                </p>
              </div>
              <Link
                to="/tools"
                className="inline-flex rounded-full bg-sky-600 px-4 py-2 text-sm font-bold !text-white shadow hover:bg-sky-700"
                style={{ color: "#ffffff" }}
              >
                查看工具頁
              </Link>
            </div>

            {/* 卡片群組 */}
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {toolCards
                .filter((card) => !pausedAiToolIds.has(card.id))
                .filter(
                  (card) =>
                    !["video-tool", "image-to-video"].includes(card.id) ||
                    canShowAdminTools,
                )
                .filter(
                  (card) => !card.featureFlag || featureFlags[card.featureFlag],
                )
                .map((card) => {
                  const videoLocked =
                    Boolean(card.href) &&
                    !isAdminEmail &&
                    !isLocalDevelopment() &&
                    isVideoToolPublicPath(card.href as string);
                  const effectivelyDisabled = card.disabled || videoLocked;

                  const baseClassName = `group flex items-start justify-between gap-3 px-4 py-3 ${
                    effectivelyDisabled
                      ? "cursor-not-allowed opacity-70 pointer-events-none"
                      : "cursor-pointer transition-colors hover:bg-sky-50 focus:bg-sky-50 focus:outline-none"
                  }`;

                  const cardContent = (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-slate-900">
                          {card.icon} {t(card.titleKey)}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {videoLocked && (
                            <span className="text-xs font-semibold text-white bg-amber-500 px-2 py-0.5 rounded-full">
                              {t("home_badge_in_development")}
                            </span>
                          )}
                          {(card.disabled || card.badge) && !videoLocked && (
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              {card.badge || t("coming_soon")}
                            </span>
                          )}
                          <span
                            className={`text-xs ${card.badgeColor || "text-slate-600"}`}
                          >
                            {t(card.categoryKey)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {card.id === "images"
                          ? "1,583+ 張高畫質圖片素材庫完整版 NT$399，網站另提供部分圖片免費試用。"
                          : t(card.descriptionKey)}
                      </p>
                      {videoLocked && (
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {t("home_video_locked_hint")}
                        </p>
                      )}
                      {card.extraContent && !card.disabled && card.extraContent}
                    </>
                  );

                  if (effectivelyDisabled || !card.href) {
                    return (
                      <div key={card.id} className={baseClassName}>
                        {cardContent}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={card.id}
                      to={card.href}
                      className={baseClassName}
                      onClick={(e) => {
                        if (card.disabled) {
                          e.preventDefault();
                          return;
                        }
                        if (card.onClick) {
                          card.onClick(e);
                        }
                      }}
                    >
                      {cardContent}
                    </Link>
                  );
                })}
            </div>
          </section>

          {/* 區塊 3：文章專區（Blog） */}
          <section className="mb-10 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 sm:p-7 order-9 md:order-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  📝 {t("home_section_blog_tutorials_title")}
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm hidden md:block">
                  {t("home_blog_intro")}
                </p>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center md:inline-flex md:justify-start px-5 py-3 rounded-xl bg-sky-600 !text-white font-semibold shadow-md hover:bg-sky-700 transition-all text-sm"
              >
                {t("home_blog_view_all")}
              </Link>
            </div>

            {/* 文章卡片列表：手機隱藏、桌機顯示 */}
            <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/blog"
                className="flex flex-col rounded-xl bg-sky-50/80 p-4 hover:bg-sky-100"
              >
                <span className="text-sm font-semibold text-sky-900">
                  🎯 {t("home_blog_focus_title")}
                </span>
                <p className="mt-1 text-xs text-sky-800">
                  {t("home_blog_focus_desc")}
                </p>
              </Link>

              <Link
                to="/finance"
                className="flex flex-col rounded-xl bg-emerald-50/80 p-4 hover:bg-emerald-100"
              >
                <span className="text-sm font-semibold text-emerald-900">
                  💰 {t("home_blog_finance_title")}
                </span>
                <p className="mt-1 text-xs text-emerald-800">
                  {t("home_blog_finance_desc")}
                </p>
              </Link>

              <Link
                to="/aids"
                className="flex flex-col rounded-xl bg-amber-50/80 p-4 hover:bg-amber-100"
              >
                <span className="text-sm font-semibold text-amber-900">
                  🏛 {t("home_blog_subsidy_title")}
                </span>
                <p className="mt-1 text-xs text-amber-800">
                  {t("home_blog_subsidy_desc")}
                </p>
              </Link>

              <Link
                to="/blog?category=ai"
                className="flex flex-col rounded-xl bg-violet-50/80 p-4 hover:bg-violet-100"
              >
                <span className="text-sm font-semibold text-violet-900">
                  🤖 {t("home_blog_ai_title")}
                </span>
                <p className="mt-1 text-xs text-violet-800">
                  {t("home_blog_ai_desc")}
                </p>
              </Link>
            </div>
          </section>

          {/* 區塊 4：網站說明 / SEO 區塊 */}
          <section className="mb-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4 text-xs text-slate-600 sm:text-sm order-12 md:order-11">
            <p>{t("home_about_1")}</p>
            <p className="mt-1">{t("home_about_2")}</p>
          </section>
        </div>
      </div>
    </>
  );
};

export default HomePage;
