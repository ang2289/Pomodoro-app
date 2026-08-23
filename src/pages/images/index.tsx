import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

// === GA4 Tracking Start ===
function trackEvent(name: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  } else {
    console.log("[GA DEBUG]", name, params);
  }
}
// === GA4 Tracking End ===

import { Card } from "@/components/ui/card";
import { isLoggedIn, getCurrentUserId } from "@/lib/auth";
import { getCurrentCreditSummary } from "@/lib/accountApi";

// ===== 圖片素材庫：免費試用 + NT$399 完整素材包 =====
// 免費圖片可直接下載；其餘圖片作為完整版素材庫展示。

async function forceDownloadImage(downloadUrl: string, filename: string) {
  if (!downloadUrl) throw new Error("這張圖片目前沒有可用的下載網址");

  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error("下載失敗");

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

// 圖片方案類型：對應 images.plan_type 或 price_type
type PlanType = "free" | "bundle";

// 圖片素材資料型別
interface ImageAsset {
  id: string;
  title: string;
  previewUrl: string;
  downloadUrl: string;
  planType: PlanType;
  category_id?: string | null;
}

// 分類資料型別
interface ImageCategory {
  id: string;
  name: string;
  slug: string;
}


interface PublicImageManifestItem {
  id: string;
  title?: string;
  category?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  download_url?: string | null; // 只允許免費圖片提供
  plan_type?: string | null;
  price_type?: string | null;
}

interface PublicImageManifest {
  version?: number;
  updated_at?: string;
  total?: number;
  categories?: ImageCategory[];
  images: PublicImageManifestItem[];
}

const PUBLIC_R2_MANIFEST_BASE = String(import.meta.env.VITE_PUBLIC_R2_URL || "").replace(/\/$/, "");
// Production uses the separate public R2 bucket. The local static manifest is
// deliberately retained as a safe fallback while the public endpoint is absent.
const IMAGE_MANIFEST_URL = PUBLIC_R2_MANIFEST_BASE
  ? `${PUBLIC_R2_MANIFEST_BASE}/catalog/images-public.json`
  : import.meta.env.VITE_IMAGE_MANIFEST_URL || "/data/images-public.json";

// 新版公開 manifest 使用 category 作為穩定分類 ID；名稱一律由此處補足。
// 即使舊格式沒有 category_name，也不會被錯誤歸為「其他素材」。
const CATEGORY_NAME_MAP: Record<string, string> = {
  "food-drink": "食物／飲品",
  "business-office": "商業／辦公",
  "product-display": "商品展示",
  "beauty-fashion": "美容／時尚",
  "home-lifestyle": "居家／生活",
  education: "教育／學習",
  "pet-animal": "寵物／動物",
  "wedding-event": "婚禮／活動",
  "travel-hotel": "旅遊／住宿",
  finance: "金融／理財",
  "professional-service": "專業服務",
  "taiwan-local": "台灣在地生活",
  "flower-plant": "花卉／植物",
  "nature-landscape": "自然／風景",
  "background-wallpaper": "背景／桌布",
  festival: "節慶／節日",
  "religion-healing": "宗教／療癒",
  technology: "科技／數位",
  other: "其他素材",
};

/** 分類名稱（資料庫）→ i18n key，選英文時顯示英文，不更動既有載入邏輯 */
const CATEGORY_NAME_TO_I18N_KEY: Record<string, string> = {
  極簡背景: "images_category_minimal",
  著色頁: "images_category_coloring",
  食物素材: "images_category_food",
  產品展示: "images_category_product",
  社群貼文背景: "images_category_social",
  桌面工作場景: "images_category_desktop",
  節慶主題: "images_category_holiday",
  商業圖: "images_category_business",
  花卉素材: "images_category_floral",
};

// 資料庫分類名稱可以保留原本資料，只在前台顯示成較好懂、較短的名稱。
const CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  極簡背景: "背景素材",
  著色頁: "著色頁",
  食物素材: "食物素材",
  產品展示: "產品展示",
  社群貼文背景: "社群背景",
  桌面工作場景: "工作場景",
  桌布: "桌布",
  "桌布-電腦模式": "電腦桌布",
  "桌布-手機直式": "手機桌布",
  節慶主題: "節慶主題",
  商業圖: "商業圖",
  花卉素材: "花卉桌布",
  "LINE貼圖示範圖": "LINE貼圖示範",
  "隨手拍的圖改商業圖示範圖": "商品照改圖示範",
};

function getCategoryDisplayName(
  category: ImageCategory,
  t: (k: string) => string,
): string {
  if (category.name && category.name !== "其他") return category.name;
  if (CATEGORY_NAME_MAP[category.id]) return CATEGORY_NAME_MAP[category.id];
  const key = CATEGORY_NAME_TO_I18N_KEY[category.name];
  const translated = key ? t(key) : "";
  if (translated && translated !== key) return translated;
  return CATEGORY_DISPLAY_LABELS[category.name] ?? "其他素材";
}

// 由 price_type / plan_type 轉為 PlanType
function toPlanType(
  priceType: string | null | undefined,
  planType?: string | null,
): PlanType {
  const value = String(priceType || planType || "free").toLowerCase();
  return value === "free" ? "free" : "bundle";
}

function getImageCost(_planType: PlanType): number {
  return 0;
}

// 下載按鈕：免費圖片直接下載；完整版圖片導向 NT$399 素材包。
function getDownloadButton(
  _t: (k: string) => string,
  planType: PlanType,
  _isLoggedInFlag: boolean,
  _remainingChars: number | null,
  _alreadyDownloaded: boolean,
): { buttonText: string; action: "download" | "bundle" } {
  return planType === "free"
    ? { buttonText: "免費下載", action: "download" }
    : { buttonText: "取得完整版", action: "bundle" };
}

// 首批顯示 24 張，避免客戶誤以為圖片很少；後續按鈕再載入更多。
const PAGE_SIZE = 24;

export default function ImagesPage() {
  const { t } = useTranslation();
  const [downloadToastId, setDownloadToastId] = useState(0);
  const navigate = useNavigate();
  const sharePageUrl = typeof window !== "undefined" ? window.location.href : "";
  const sharePageText = "RxV 圖片素材庫：1,583 張完整版素材包，適合社群、網站、影片與商業設計。";

  const openShareWindow = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=640");
  };

  const copyShareLink = async () => {
    if (!sharePageUrl) return;
    await navigator.clipboard.writeText(sharePageUrl);
    alert("已複製分享連結");
  };


  // 📈 追蹤圖片進入畫面（view_image_detail）
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const imageId = target.getAttribute("data-image-id");
            const planType = target.getAttribute("data-plan-type");
            const categoryId = target.getAttribute("data-category-id");
            if (imageId) {
              trackEvent("view_image_detail", {
                image_id: imageId,
                image_plan_type: planType,
                image_category: categoryId,
              });
              observer.unobserve(target); // 僅記一次
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    const elements = document.querySelectorAll("[data-track-image]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const [images, setImages] = useState<ImageAsset[]>([]);
  const [allImages, setAllImages] = useState<ImageAsset[]>([]);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [remainingChars, setRemainingChars] = useState<number | null>(null);
  const [downloadedImageIds, setDownloadedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalImages, setTotalImages] = useState<number | null>(null);

  // 下載成功只顯示短暫小提示，避免連續下載時一直要求客戶手動關閉。
  useEffect(() => {
    if (!downloadToastId) return;

    const timer = window.setTimeout(() => {
      setDownloadToastId(0);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [downloadToastId]);

  // 保留舊版同步函式，全面免費期間不會觸發付費流程
  const refreshRemainingChars = async () => {
    if (!isLoggedIn()) {
      setRemainingChars(null);
      return;
    }
    try {
      const data = await getCurrentCreditSummary();
      setRemainingChars(data.remaining_chars ?? null);
    } catch (err) {
      console.error("同步使用者資料失敗", err);
    }
  };

  // 登入時：保留舊版已下載圖片列表同步，全面免費期間不影響下載
  useEffect(() => {
    if (!isLoggedIn()) {
      setRemainingChars(null);
      setDownloadedImageIds(new Set());
      return;
    }
    const uid = getCurrentUserId();
    if (!uid) return;

    const apiBase = import.meta.env.VITE_API_BASE || "";

    (async () => {
      try {
        const data = await getCurrentCreditSummary();
        setRemainingChars(data.remaining_chars ?? null);
      } catch {
        setRemainingChars(null);
      }
      try {
        const r = await fetch(`${apiBase}/api/user-image-downloads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid }),
        });
        const d = await r.json();
        setDownloadedImageIds(
          new Set(Array.isArray(d?.imageIds) ? d.imageIds : []),
        );
      } catch {
        setDownloadedImageIds(new Set());
      }
    })();
  }, []);

  // 圖片庫改讀 R2 / 靜態 JSON，不再依賴 Supabase 圖片表。
  useEffect(() => {
    let cancelled = false;

    const loadManifest = async () => {
      setLoading(true);
      setLoadingCategories(true);

      try {
        const response = await fetch(IMAGE_MANIFEST_URL, {
          method: "GET",
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error(`圖片清單載入失敗：HTTP ${response.status}`);
        }

        const raw = (await response.json()) as
          | PublicImageManifest
          | PublicImageManifestItem[];

        const manifest: PublicImageManifest = Array.isArray(raw)
          ? { images: raw }
          : raw;

        const sourceImages = Array.isArray(manifest.images)
          ? manifest.images
          : [];

        const categoryMap = new Map<string, ImageCategory>();

        (manifest.categories || []).forEach((category) => {
          if (category?.id) categoryMap.set(category.id, category);
        });

        const formatted: ImageAsset[] = sourceImages
          .filter((img) => img?.id)
          .map((img) => {
            const categoryId =
              img.category_id ||
              img.category_slug ||
              img.category_name ||
              img.category ||
              null;

            if (categoryId && !categoryMap.has(categoryId)) {
              categoryMap.set(categoryId, {
                id: categoryId,
                name:
                  img.category_name ||
                  CATEGORY_NAME_MAP[categoryId] ||
                  "其他素材",
                slug: img.category_slug || categoryId,
              });
            }

            const planType = toPlanType(img.price_type, img.plan_type);

            return {
              id: img.id,
              title: img.title || t("images_unnamed"),
              previewUrl:
                img.preview_url ||
                img.thumbnail_url ||
                "",
              downloadUrl:
                planType === "free"
                  ? img.download_url || ""
                  : "",
              planType,
              category_id: categoryId,
            };
          })
          .sort((left, right) => {
            // Let visitors try the free originals before browsing bundle-only cards.
            return Number(right.planType === "free") - Number(left.planType === "free");
          });

        if (cancelled) return;

        setAllImages(formatted);
        setCategories(Array.from(categoryMap.values()));
        setManifestLoaded(true);
      } catch (err) {
        console.error("圖片 JSON 載入失敗:", err);

        if (!cancelled) {
          setAllImages([]);
          setImages([]);
          setCategories([]);
          setTotalImages(null);
          setHasMore(false);
          setManifestLoaded(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingCategories(false);
        }
      }
    };

    void loadManifest();

    return () => {
      cancelled = true;
    };
  }, [t]);

  // 分類與分頁直接在瀏覽器端處理。
  const loadImages = (nextPage = 0, append = false) => {
    if (!manifestLoaded) return;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const filtered = selectedCategoryId
        ? allImages.filter((img) => img.category_id === selectedCategoryId)
        : allImages;

      const from = nextPage * PAGE_SIZE;
      const pageImages = filtered.slice(from, from + PAGE_SIZE);
      const nextImages = append ? [...images, ...pageImages] : pageImages;

      setImages(nextImages);
      setTotalImages(filtered.length);
      setPage(nextPage);
      setHasMore(nextImages.length < filtered.length);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!manifestLoaded) return;

    setImages([]);
    setPage(0);
    setHasMore(false);
    setTotalImages(null);
    loadImages(0, false);
  }, [selectedCategoryId, manifestLoaded, allImages]);

  const goToBundleCheckout = () => {
    trackEvent("image_bundle_checkout_click", { product_code: "image-bundle-full", amount_ntd: 399 });
    navigate("/payment/bank-transfer?product=image-bundle-full");
  };

  const handleDownload = async (image: ImageAsset) => {
    if (image.planType !== "free") {
      goToBundleCheckout();
      return;
    }

    try {
      trackEvent("download_free_image", { image_id: image.id, image_plan_type: image.planType });
      await forceDownloadImage(image.downloadUrl, `${image.title || "RxV-免費圖片"}`);
      setDownloadedImageIds((prev) => new Set(prev).add(image.id));
      setDownloadToastId((previous) => previous + 1);
    } catch (e) {
      console.error("免費圖片下載失敗", e);
      alert(e instanceof Error ? e.message : t("images_alert_download_failed"));
    }
  };

  const handleButtonClick = (image: ImageAsset) => {
    if (image.planType === "bundle") {
      goToBundleCheckout();
      return;
    }
    void handleDownload(image);
  };

  const handleImageClick = (image: ImageAsset) => {
    setPreviewImage(image);
  };

  // 圖庫採原圖比例瀑布流：不裁切、不固定高度，完整呈現每張圖片。
  const getDownloadIconClass = (action: "download" | "bundle") => {
    const base =
      "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/92 text-lg font-black shadow-md backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
    if (action === "download")
      return `${base} text-emerald-700 hover:scale-105 hover:bg-emerald-600 hover:text-white`;
    return `${base} text-amber-700 hover:scale-105 hover:bg-amber-600 hover:text-white`;
  };

  const selectedCategory = selectedCategoryId
    ? categories.find((category) => category.id === selectedCategoryId)
    : null;
  const selectedCategoryName = selectedCategory
    ? getCategoryDisplayName(selectedCategory, t)
    : "全部素材";

  return (
    <div className="relative left-1/2 min-h-screen w-screen max-w-none -translate-x-1/2 overflow-x-hidden bg-slate-50 py-5 sm:py-7">
      <div className="w-full max-w-none px-3 sm:px-6 lg:px-8 2xl:px-10">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {t("images_back_home")}
          </Link>
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">
            🖼️ {t("image_library")}
          </h1>
          <div className="mb-6 rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-5 py-6 text-center shadow-sm">
            <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-sm font-black text-white">完整素材庫限時方案</span>
            <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">1,583 張高畫質圖片素材庫完整版</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              食物、花卉、商業圖、社群背景、桌布、節慶與更多分類，持續增加。適合網站、社群貼文、廣告、YouTube／短影音與商業設計使用。
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="text-3xl font-black text-rose-600">NT$399</span>
              <Link
                to="/payment/bank-transfer?product=image-bundle-full"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                立即取得完整素材庫
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">網站保留部分圖片免費下載試用；完整版素材不可轉售、轉包或作為素材庫再次販售。</p>
          </div>

          <p className="text-base sm:text-lg text-gray-600">
            先免費試用喜歡的圖片；需要大量素材時，可一次取得完整素材庫。
          </p>
        </div>

        {/* 分類篩選：手機版改成橫向滑動，避免按鈕全部擠在一起。 */}
        {!loadingCategories && categories.length > 0 && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-black text-gray-800">
                快速分類
              </label>
              <span className="text-xs font-medium text-gray-400 sm:hidden">
                可左右滑動
              </span>
            </div>
            <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1">
              <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    selectedCategoryId === null
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  全部
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                      selectedCategoryId === c.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {getCategoryDisplayName(c, t)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 圖片總數與載入狀態 */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700">
                圖片素材庫持續更新中
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {!manifestLoaded
                  ? "圖片清單暫時無法載入，請稍後重新整理。"
                  : totalImages === null
                    ? "正在統計圖片數量…"
                    : selectedCategoryId
                      ? `「${selectedCategoryName}」共有 ${totalImages} 張素材，目前先顯示 ${images.length} 張。`
                      : `目前素材庫已累積 ${totalImages} 張素材，本頁先顯示 ${images.length} 張；免費圖片可直接下載，其餘可加入 NT$399 完整素材庫。`}
              </p>
            </div>
            {totalImages !== null && totalImages > 0 && (
              <div className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                部分圖片免費下載
              </div>
            )}
          </div>
        </div>


        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t("images_loading")}</p>
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedCategoryId
                ? t("images_no_images_in_category")
                : t("images_no_images")}
            </p>
          </div>
        )}

        {/* 圖片卡片 */}
        {!loading && images.length > 0 && (
          <>
            {!selectedCategoryId && images.some((image) => image.planType === "free") && (
              <section className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="text-lg font-black text-emerald-950">免費高畫質素材試下載</h2>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900">
                  先免費下載喜歡的圖片試用，滿意再一次取得 1,583 張完整素材庫。
                </p>
                <p className="mt-2 text-sm font-bold text-emerald-700">下方優先顯示免費高畫質下載素材；可繼續載入查看全部 37 張免費素材。</p>
              </section>
            )}
            <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5 2xl:columns-5 2xl:gap-6">
              {images.map((image) => {
                const btn = getDownloadButton(
                  t,
                  image.planType,
                  isLoggedIn(),
                  remainingChars,
                  downloadedImageIds.has(image.id),
                );
                const downloadIconClass = getDownloadIconClass(btn.action);
                const usageTitle = (() => {
                  const cat = categories.find(
                    (c) => c.id === image.category_id,
                  );
                  return cat
                    ? getCategoryDisplayName(cat, t)
                    : t("images_multi_usage");
                })();

                return (
                  <Card
                    key={image.id}
                    className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl sm:mb-4 lg:mb-5"
                  >
                    <div
                      data-track-image
                      data-image-id={image.id}
                      data-plan-type={image.planType}
                      data-category-id={image.category_id || ""}
                      className="relative w-full cursor-pointer overflow-hidden bg-slate-100"
                      onClick={() => handleImageClick(image)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleImageClick(image);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={image.planType === "free" ? `下載${usageTitle}圖片` : `取得${usageTitle}完整素材庫`}
                    >
                      <img
                        src={image.previewUrl}
                        alt={usageTitle}
                        className="block h-auto w-full transition duration-500 ease-out group-hover:scale-[1.02]"
                        loading="lazy"
                        onError={(e) => {
                          const imgEl = e.target as HTMLImageElement;
                          imgEl.src =
                            "https://via.placeholder.com/800x800/E5E7EB/9CA3AF?text=" +
                            encodeURIComponent(t("images_placeholder_alt"));
                        }}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-black !text-white opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:opacity-100" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                        {image.planType === "free" ? "免費下載" : "完整版素材"}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleButtonClick(image);
                        }}
                        className={`absolute bottom-3 right-3 z-10 ${downloadIconClass}`}
                        aria-label={image.planType === "free" ? `下載${usageTitle}圖片` : `取得${usageTitle}完整素材庫`}
                        title={image.planType === "free" ? "免費下載圖片" : "取得完整素材庫"}
                      >
                        {image.planType === "free" ? "↓" : "🔒"}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">
                {totalImages !== null
                  ? `已顯示 ${images.length} / ${totalImages} 張素材`
                  : `已顯示 ${images.length} 張素材`}
              </p>
              {hasMore ? (
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => loadImages(page + 1, true)}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold !text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:brightness-110 hover:ring-2 hover:ring-blue-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loadingMore
                    ? "載入中…"
                    : `載入更多圖片（每次 ${PAGE_SIZE} 張）`}
                </button>
              ) : (
                <div className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-600">
                  已顯示全部圖片
                </div>
              )}
            </div>
          </>
        )}
        {/* 小店家工具推薦：移到圖片列表下方，先讓使用者專注瀏覽 NT$399 圖片素材庫。 */}
        <section className="mb-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 shadow-sm">
            <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
              小店家推薦
            </span>
            <h2 className="mt-3 text-lg font-black text-emerald-950">
              📸 隨手拍商品照，也能快速做成商品圖
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900">
              上傳自己拍的餐點、飲料、甜點、手作或蝦皮商品照，
              可製作白底商品圖、高級商業圖、社群宣傳圖與外送平台主圖。
            </p>
            <p className="mt-3 text-sm font-black text-emerald-700">
              白底商品圖約 NT$19 起｜高級商業圖約 NT$29 起
            </p>
            <Link
              to="/tools/product-image-generator"
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
              style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
            >
              前往隨手拍商品圖工具
            </Link>
          </article>

          <article className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm">
            <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-black !text-white" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
              名片印刷服務
            </span>
            <h2 className="mt-3 text-lg font-black text-violet-950">
              🪪 不會排版也沒關係，人工名片設計＋印刷
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-violet-900">
              選喜歡的名片款式、填寫資料並上傳 Logo 或照片，
              由工作室協助人工排版；確認預覽後再送印。
            </p>
            <p className="mt-3 text-sm font-black text-violet-700">
              人工排版名片 200 張 NT$349 起
            </p>
            <p className="mt-1 text-xs font-bold text-violet-700">
              符合方案加贈一頁式品牌／公司介紹網站
            </p>
            <Link
              to="/tools/business-card-order"
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-violet-300 bg-white px-5 py-2.5 text-sm font-black text-violet-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-100 hover:shadow-md"
            >
              查看名片款式與訂購
            </Link>
          </article>
        </section>

        {/* 🎨 免費圖片後續使用流程：移到圖片列表下方，避免妨礙下載 */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🎨 免費圖片可以這樣使用
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate("/tools/line-sticker")}
              className="cursor-pointer rounded-xl bg-white p-5 border shadow-sm hover:shadow-md hover:border-cyan-400 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
            >
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-semibold mb-2">LINE 貼圖工具</h4>
              <p className="text-sm text-gray-600 mb-4">
                下載圖片後，可回到 LINE 貼圖整理工具處理尺寸與 ZIP 打包。
              </p>
              <button className="text-sm font-medium text-white bg-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-700">
                前往貼圖工具
              </button>
            </div>
            <div
              onClick={() => navigate("/tools/image-resize")}
              className="cursor-pointer rounded-xl bg-white p-5 border shadow-sm hover:shadow-md hover:border-blue-400 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
            >
              <div className="text-2xl mb-2">📐</div>
              <h4 className="font-semibold mb-2">圖片尺寸轉換</h4>
              <p className="text-sm text-gray-600 mb-4">
                可將圖片改成社群貼文、商品圖、網站圖片或短影音封面的尺寸。
              </p>
              <button className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
                調整圖片尺寸
              </button>
            </div>
            <div
              onClick={() => navigate("/tools/image-compress")}
              className="cursor-pointer rounded-xl bg-white p-5 border shadow-sm hover:shadow-md hover:border-green-400 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
            >
              <div className="text-2xl mb-2">🗜️</div>
              <h4 className="font-semibold mb-2">圖片壓縮</h4>
              <p className="text-sm text-gray-600 mb-4">
                上傳網站或社群前，可先壓縮圖片，減少檔案大小。
              </p>
              <button className="text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700">
                壓縮圖片
              </button>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="font-bold text-amber-900">
              ☕ 支持 RxV 持續分享更多免費圖片
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              如果這些免費圖片對你有幫助，歡迎小額支持，讓 RxV
              能持續製作更多風格的免費圖片分享。
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="https://p.ecpay.com.tw/FD7CD6D"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold !text-white hover:bg-amber-700 hover:!text-white"
                style={{ color: "#ffffff" }}
              >
                ☕ 台灣小額支持
              </a>
              <a
                href="https://ko-fi.com/ang2289"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold !text-white hover:bg-blue-700 hover:!text-white"
                style={{ color: "#ffffff" }}
              >
                🌍 Ko-fi 海外支持
              </a>
              <a
                href="mailto:rxv0227@gmail.com?subject=我想許願免費圖片風格"
                className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100"
              >
                Email 許願圖片風格
              </a>
              <span className="self-center text-sm font-bold text-amber-900">
                MAIL：rxv0227@gmail.com
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-blue-200 bg-white p-4">
            <h4 className="font-bold text-blue-900">🎨 貼圖創作者推薦工具</h4>
            <p className="mt-1 text-sm leading-relaxed text-blue-800">
              想自己做 LINE 貼圖，可以先用 PhotoRoom
              產生貼紙角色或整理商品圖，再使用去背工具保留透明背景，最後回到 RxV
              工具整理尺寸與打包 ZIP。
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="https://www.photoroom.com/zh-tw/tools/ai-image-generator"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold !text-white hover:bg-blue-700 hover:!text-white"
                style={{ color: "#ffffff" }}
              >
                PhotoRoom AI 貼圖生成
              </a>
              <a
                href="https://www.photoroom.com/zh-tw/tools/background-remover"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold !text-white hover:bg-purple-700 hover:!text-white"
                style={{ color: "#ffffff" }}
              >
                PhotoRoom AI 去背工具
              </a>
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-bold text-blue-900">覺得這頁有用，也可以分享給朋友：</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button type="button" onClick={() => openShareWindow(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(sharePageText)}`)} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold !text-white hover:bg-emerald-600">LINE</button>
                <button type="button" onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold !text-white hover:bg-blue-700">FB</button>
                <button type="button" onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(sharePageText)}`)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold !text-white hover:bg-black">X</button>
                <button type="button" onClick={copyShareLink} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">複製</button>
              </div>
            </div>
          </div>
        </div>

        {/* 免費試用與完整版使用說明 */}
        <div className="mt-12 rounded-lg border bg-white p-6 text-sm leading-relaxed text-gray-700">
          <h3 className="mb-3 text-base font-semibold">圖片素材使用說明</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>標示「免費下載」的圖片可直接下載試用；其餘圖片屬於 NT$399 完整素材庫。</li>
            <li>
              圖片可作為社群貼文、短影音封面、商品圖靈感、LINE
              貼圖測試、個人創作練習與一般商用設計使用。
            </li>
            <li className="font-semibold text-red-700">
              禁止將圖片原檔重新販售、打包成素材包販售、上傳素材平台轉售，或宣稱為自己的原創素材庫。
            </li>
            <li>
              若你需要特定風格圖片，例如可愛 Q
              版、療癒風、商品背景圖、節慶圖、品牌感插圖或情侶圖，歡迎來信許願。
            </li>
            <li>
              若圖片需要用於特殊商業授權、大量印刷、品牌大量上架或不確定使用範圍，建議先來信確認使用方式。
            </li>
            <li>
              風格許願與合作聯繫：
              <a
                href="mailto:rxv0227@gmail.com"
                className="text-blue-600 hover:underline ml-1"
              >
                rxv0227@gmail.com
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            RxV 會持續新增圖片；完整版素材庫以網站目前可販售內容為準。
          </p>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="圖片預覽"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/70 text-xl font-black !text-white shadow-lg"
              aria-label="關閉預覽"
            >
              ×
            </button>

            <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-2 sm:p-4">
              <img
                src={previewImage.previewUrl}
                alt={previewImage.title}
                className="mx-auto block max-h-[72vh] max-w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-900">{previewImage.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {previewImage.planType === "free"
                    ? "免費圖片，可直接下載"
                    : "完整版素材，可預覽；高畫質原圖包含於 NT$399 完整素材庫"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleButtonClick(previewImage);
                }}
                className={`inline-flex min-h-[46px] items-center justify-center rounded-xl px-5 py-3 text-sm font-black !text-white shadow-sm ${
                  previewImage.planType === "free"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {previewImage.planType === "free"
                  ? "免費下載"
                  : "取得 NT$399 完整素材庫"}
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadToastId > 0 && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2.5 text-sm font-black text-emerald-800 shadow-lg backdrop-blur"
          style={{ maxWidth: "calc(100vw - 32px)" }}
        >
          ✓ 圖片已開始下載
        </div>
      )}
    </div>
  );
}
