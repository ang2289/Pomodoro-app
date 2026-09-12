import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

type StorefrontProfileType = "business" | "supplier" | "group_host";

type PublicStorefront = {
  slug: string;
  profile_type?: StorefrontProfileType | string | null;
  display_name: string;
  contact_name?: string | null;
  job_title?: string | null;
  bio?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  tagline?: string | null;
  line_id?: string | null;
  address_text?: string | null;
  map_url?: string | null;
  business_hours_text?: string | null;
  service_area_text?: string | null;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  phone?: string | null;
  line_url?: string | null;
  email?: string | null;
  website_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  shopee_url?: string | null;
  delivery_url?: string | null;
};

type PublicItem = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  price_text?: string | null;
  button_label?: string | null;
  button_url?: string | null;
};

type TextItem = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sort_order?: number | null;
};

type SupplierProfile = {
  supply_types: string[];
  product_categories: string[];
  supplier_intro?: string | null;
  minimum_order_text?: string | null;
  shipping_origin?: string | null;
  delivery_regions: string[];
  lead_time_text?: string | null;
  cooperation_terms?: string | null;
  cooperation_button_label?: string | null;
  cooperation_button_url?: string | null;
  is_accepting_collaboration: boolean;
};

type ContactLink = { label: string; href: string; primary?: boolean };
type ContactDetail = { label: string; value: string; href?: string };

const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold !text-white no-underline shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200";
const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-extrabold !text-emerald-800 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50 hover:!text-emerald-900 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100";
const primaryButtonStyle = { color: "#ffffff" } as const;
const secondaryButtonStyle = { color: "#065f46" } as const;

function safeHref(url?: string | null) {
  const value = String(url || "").trim();
  if (!value) return "";
  return /^(https?:|line:|tel:|mailto:)/i.test(value)
    ? value
    : `https://${value}`;
}

function isExternal(href: string) {
  return /^https?:/i.test(href);
}

function openOriginalImage(imageUrl?: string | null) {
  const href = safeHref(imageUrl);
  if (!href || typeof window === "undefined") return;
  window.open(href, "_blank", "noopener,noreferrer");
}

function normalizeProfileType(value?: string | null): StorefrontProfileType {
  return value === "supplier" || value === "group_host" ? value : "business";
}

function createQrUrl(url: string, size = 320) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

function uniqueStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.map((item) => String(item || "").trim()).filter(Boolean),
        ),
      ]
    : [];
}

function isPlaceholderService(
  title?: string | null,
  description?: string | null,
) {
  const normalizedTitle = String(title || "").replace(/\s+/g, "");
  const normalizedDescription = String(description || "").replace(/\s+/g, "");
  return (
    /^項目[一二三四五六七八九十\d]+$/.test(normalizedTitle) &&
    /^(項目[一二三四五六七八九十\d]+說明|請填寫.*說明)$/.test(
      normalizedDescription,
    )
  );
}

function pageLabel(type: StorefrontProfileType) {
  if (type === "supplier") return "供應合作資訊";
  if (type === "group_host") return "團購資訊";
  return "品牌／服務介紹";
}

function headingForServices(type: StorefrontProfileType) {
  if (type === "supplier") return "供應能力與合作特色";
  if (type === "group_host") return "開團服務與團務特色";
  return "服務項目與主打特色";
}

function getActionLabel(label?: string | null, url?: string | null) {
  const input = String(label || "").trim();
  const href = String(url || "")
    .trim()
    .toLowerCase();
  if (input) return input;
  if (href.includes("lin.ee") || href.includes("line.me")) return "LINE 詢問";
  if (href.startsWith("tel:")) return "撥打電話";
  if (href.startsWith("mailto:")) return "Email 聯絡";
  if (href.includes("shopee")) return "前往蝦皮";
  return "立即詢問";
}

function MetaTag({
  label,
  values,
  tone = "emerald",
}: {
  label: string;
  values: string[];
  tone?: "emerald" | "sky";
}) {
  if (!values.length) return null;
  const color =
    tone === "sky"
      ? "bg-sky-100 text-sky-900 ring-sky-200"
      : "bg-emerald-100 text-emerald-900 ring-emerald-200";
  return (
    <div className="mt-5">
      <p className="text-sm font-black text-slate-800">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${color}`}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function updateHeadMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  if (typeof document === "undefined") return;
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function updateShareMeta(
  storefront: PublicStorefront,
  publicUrl: string,
  portfolio: TextItem[],
  products: PublicItem[],
) {
  if (typeof document === "undefined") return;
  const type = normalizeProfileType(storefront.profile_type);
  const suffix =
    type === "supplier"
      ? "供應商介紹與合作資訊"
      : type === "group_host"
        ? "團購主介紹頁"
        : "品牌介紹";
  const title = `${storefront.display_name}｜${suffix}`;
  const description = String(
    storefront.tagline ||
      storefront.bio ||
      (type === "supplier"
        ? `查看 ${storefront.display_name} 的供應商品、合作條件與聯絡方式。`
        : type === "group_host"
          ? `查看 ${storefront.display_name} 的開團資訊、服務內容與聯絡方式。`
          : `查看 ${storefront.display_name} 的品牌介紹、服務內容與聯絡方式。`),
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  const image = String(
    storefront.cover_image_url ||
      storefront.logo_url ||
      portfolio[0]?.image_url ||
      products[0]?.image_url ||
      `${window.location.origin}/icon.png`,
  );
  document.title = title;
  updateHeadMeta("name", "description", description);
  updateHeadMeta("property", "og:title", title);
  updateHeadMeta("property", "og:description", description);
  updateHeadMeta("property", "og:image", image);
  updateHeadMeta("property", "og:url", publicUrl);
  updateHeadMeta("property", "og:type", "website");
  updateHeadMeta("property", "og:site_name", storefront.display_name);
  updateHeadMeta("name", "twitter:card", "summary_large_image");
  updateHeadMeta("name", "twitter:title", title);
  updateHeadMeta("name", "twitter:description", description);
  updateHeadMeta("name", "twitter:image", image);
}

export default function PublicStorefrontPage() {
  const { slug = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storefront, setStorefront] = useState<PublicStorefront | null>(null);
  const [services, setServices] = useState<TextItem[]>([]);
  const [highlights, setHighlights] = useState<TextItem[]>([]);
  const [portfolio, setPortfolio] = useState<TextItem[]>([]);
  const [processSteps, setProcessSteps] = useState<TextItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [products, setProducts] = useState<PublicItem[]>([]);
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);

  const publicUrl = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/shop/${slug}`,
    [slug],
  );
  const qrUrl = useMemo(
    () => (publicUrl ? createQrUrl(publicUrl) : ""),
    [publicUrl],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/main?action=get-public-storefront&slug=${encodeURIComponent(slug)}`,
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.storefront)
          throw new Error(data?.error || "找不到此公開頁，或頁面尚未公開。");
        const loadedStorefront = data.storefront as PublicStorefront;
        const type = normalizeProfileType(loadedStorefront.profile_type);
        const loadedServices = (
          Array.isArray(data.serviceItems) ? data.serviceItems : []
        ).filter(
          (item: TextItem) =>
            item.title?.trim() &&
            !isPlaceholderService(item.title, item.description),
        );
        const loadedHighlights = (
          Array.isArray(data.highlights) ? data.highlights : []
        ).filter((item: TextItem) => item.title?.trim());
        const loadedPortfolio = (
          Array.isArray(data.portfolioItems) ? data.portfolioItems : []
        ).filter((item: TextItem) => item.image_url?.trim());
        const loadedProcess = (
          Array.isArray(data.processSteps) ? data.processSteps : []
        ).filter((item: TextItem) => item.title?.trim());
        const loadedFaqs = (
          Array.isArray(data.faqItems) ? data.faqItems : []
        ).filter(
          (item: FaqItem) => item.question?.trim() && item.answer?.trim(),
        );
        setStorefront(loadedStorefront);
        setServices(loadedServices);
        setHighlights(loadedHighlights);
        setPortfolio(loadedPortfolio);
        setProcessSteps(loadedProcess);
        setFaqs(loadedFaqs);
        setProducts(Array.isArray(data.items) ? data.items : []);
        setSupplier(
          type === "supplier" && data.supplierProfile
            ? {
                supply_types: uniqueStrings(data.supplierProfile.supply_types),
                product_categories: uniqueStrings(
                  data.supplierProfile.product_categories,
                ),
                supplier_intro: data.supplierProfile.supplier_intro || null,
                minimum_order_text:
                  data.supplierProfile.minimum_order_text || null,
                shipping_origin: data.supplierProfile.shipping_origin || null,
                delivery_regions: uniqueStrings(
                  data.supplierProfile.delivery_regions,
                ),
                lead_time_text: data.supplierProfile.lead_time_text || null,
                cooperation_terms:
                  data.supplierProfile.cooperation_terms || null,
                cooperation_button_label:
                  data.supplierProfile.cooperation_button_label ||
                  "申請團購合作",
                cooperation_button_url:
                  data.supplierProfile.cooperation_button_url || null,
                is_accepting_collaboration:
                  data.supplierProfile.is_accepting_collaboration !== false,
              }
            : null,
        );
        updateShareMeta(
          loadedStorefront,
          publicUrl,
          loadedPortfolio,
          Array.isArray(data.items) ? data.items : [],
        );
      } catch (err: any) {
        setError(err?.message || "讀取公開頁失敗。");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug, publicUrl]);

  if (loading)
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center text-slate-600">
        正在載入公開頁…
      </div>
    );
  if (!storefront)
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">
            此公開頁目前無法查看
          </h1>
          <p className="mt-3 text-slate-600">
            {error || "可能尚未公開或已到期。"}
          </p>
          <Link
            to="/"
            className={`${primaryButtonClass} mt-6`}
            style={primaryButtonStyle}
          >
            回首頁
          </Link>
        </div>
      </div>
    );

  const profileType = normalizeProfileType(storefront.profile_type);
  const isSupplier = profileType === "supplier";
  const contactMeta = [storefront.contact_name, storefront.job_title]
    .filter(Boolean)
    .join("｜");
  const primaryCtaLabel = storefront.primary_cta_label?.trim() || "";
  const primaryCtaHref = storefront.primary_cta_url
    ? safeHref(storefront.primary_cta_url)
    : "";
  const isSupplierOnlyCta = /團購.*合作|申請.*團購/.test(primaryCtaLabel);
  const visiblePrimaryCta =
    primaryCtaHref && primaryCtaLabel && (isSupplier || !isSupplierOnlyCta);
  const supplierCtaHref = supplier?.cooperation_button_url
    ? safeHref(supplier.cooperation_button_url)
    : "";
  const showSupplierCta =
    isSupplier &&
    Boolean(supplier?.is_accepting_collaboration && supplierCtaHref);
  const contactLinks: ContactLink[] = [
    storefront.line_url
      ? {
          label: "LINE 詢問",
          href: safeHref(storefront.line_url),
          primary: true,
        }
      : null,
    storefront.phone
      ? { label: "撥打電話", href: `tel:${storefront.phone}` }
      : null,
    storefront.email
      ? { label: "Email 聯絡", href: `mailto:${storefront.email}` }
      : null,
    storefront.facebook_url
      ? { label: "Facebook", href: safeHref(storefront.facebook_url) }
      : null,
    storefront.instagram_url
      ? { label: "Instagram", href: safeHref(storefront.instagram_url) }
      : null,
    storefront.shopee_url
      ? { label: "前往蝦皮", href: safeHref(storefront.shopee_url) }
      : null,
    storefront.delivery_url
      ? { label: "外送／訂餐", href: safeHref(storefront.delivery_url) }
      : null,
    storefront.website_url
      ? { label: "官方網站", href: safeHref(storefront.website_url) }
      : null,
  ].filter(Boolean) as ContactLink[];
  const contactDetails: ContactDetail[] = [
    storefront.line_id
      ? {
          label: "LINE",
          value: storefront.line_id,
          href: storefront.line_url ? safeHref(storefront.line_url) : undefined,
        }
      : null,
    storefront.phone
      ? {
          label: "電話",
          value: storefront.phone,
          href: `tel:${storefront.phone}`,
        }
      : null,
    storefront.email
      ? {
          label: "Email",
          value: storefront.email,
          href: `mailto:${storefront.email}`,
        }
      : null,
    storefront.address_text
      ? {
          label: "地址／據點",
          value: storefront.address_text,
          href: storefront.map_url ? safeHref(storefront.map_url) : undefined,
        }
      : null,
    storefront.business_hours_text
      ? { label: "營業／回覆時間", value: storefront.business_hours_text }
      : null,
    storefront.service_area_text
      ? { label: "服務／配送範圍", value: storefront.service_area_text }
      : null,
  ].filter(Boolean) as ContactDetail[];
  const hasProducts = products.length > 0;
  // 所有頁面都使用同一套通用區塊；內容完全由各店家自行填寫。
  const navItems = [
    storefront.bio ? { id: "about", label: "品牌介紹" } : null,
    highlights.length ? { id: "highlights", label: "品牌特色" } : null,
    services.length ? { id: "services", label: "服務項目" } : null,
    portfolio.length ? { id: "portfolio", label: "作品案例" } : null,
    processSteps.length ? { id: "process", label: "合作流程" } : null,
    faqs.length ? { id: "faq", label: "常見問題" } : null,
    isSupplier ? { id: "supplier", label: "供應合作" } : null,
    hasProducts ? { id: "products", label: "展示項目" } : null,
    contactDetails.length ? { id: "contact", label: "聯絡資訊" } : null,
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${publicUrl}?share=${Date.now()}`);
      window.alert("分享網址已複製。");
    } catch {
      window.alert("無法自動複製，請手動複製網址。");
    }
  };

  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({
          title: storefront.display_name,
          text: storefront.tagline || storefront.bio || "",
          url: `${publicUrl}?share=${Date.now()}`,
        });
      else await copyUrl();
    } catch {
      /* 使用者取消分享不顯示錯誤。 */
    }
  };

  const downloadQr = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${storefront.slug}-公開頁-QRCode.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(qrUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-14">
      <section className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-9">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="h-52 bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500 sm:h-72">
            {storefront.cover_image_url ? (
              <img
                src={storefront.cover_image_url}
                alt={`${storefront.display_name} 封面`}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="border-t border-slate-200 bg-white px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-slate-200 bg-emerald-100 text-3xl font-black text-emerald-700 shadow-sm sm:h-24 sm:w-24">
                  {storefront.logo_url ? (
                    <img
                      src={storefront.logo_url}
                      alt={`${storefront.display_name} Logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    storefront.display_name.slice(0, 1)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-emerald-700">
                    {pageLabel(profileType)}
                  </p>
                  <h1 className="mt-1 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {storefront.display_name}
                  </h1>
                  {storefront.tagline ? (
                    <p className="mt-2 max-w-3xl text-base font-black leading-relaxed text-slate-800 sm:text-lg">
                      {storefront.tagline}
                    </p>
                  ) : null}
                  {contactMeta ? (
                    <p className="mt-3 text-sm font-bold text-slate-600">
                      {contactMeta}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {visiblePrimaryCta ? (
                  <a
                    href={primaryCtaHref}
                    target={isExternal(primaryCtaHref) ? "_blank" : undefined}
                    rel="noreferrer"
                    className={primaryButtonClass}
                    style={primaryButtonStyle}
                  >
                    {primaryCtaLabel}
                  </a>
                ) : null}
                {showSupplierCta && supplierCtaHref !== primaryCtaHref ? (
                  <a
                    href={supplierCtaHref}
                    target={isExternal(supplierCtaHref) ? "_blank" : undefined}
                    rel="noreferrer"
                    className={primaryButtonClass}
                    style={primaryButtonStyle}
                  >
                    {supplier?.cooperation_button_label || "申請團購合作"}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => void share()}
                  className={secondaryButtonClass}
                  style={secondaryButtonStyle}
                >
                  分享此頁
                </button>
              </div>
            </div>
            {storefront.bio ? (
              <p className="mt-7 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                {storefront.bio}
              </p>
            ) : null}
            {contactLinks.length ? (
              <div className="mt-6 grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={isExternal(link.href) ? "_blank" : undefined}
                    rel="noreferrer"
                    className={`${link.primary ? primaryButtonClass : secondaryButtonClass} w-full`}
                    style={
                      link.primary ? primaryButtonStyle : secondaryButtonStyle
                    }
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        {navItems.length ? (
          <nav
            aria-label="頁面導覽"
            className="sticky top-2 z-20 mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex shrink-0 items-center rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        {storefront.bio ? (
          <section
            id="about"
            className="scroll-mt-24 mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-sm font-black text-emerald-700">品牌介紹</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              認識 {storefront.display_name}
            </h2>
            <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
              {storefront.bio}
            </p>
          </section>
        ) : null}

        {highlights.length ? (
          <section id="highlights" className="scroll-mt-24 mt-8">
            <div className="mb-5">
              <p className="text-sm font-black text-emerald-700">品牌特色</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                為什麼選擇我們
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {services.length ? (
          <section id="services" className="scroll-mt-24 mt-8">
            <div className="mb-5">
              <p className="text-sm font-black text-emerald-700">
                {headingForServices(profileType)}
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                {profileType === "supplier"
                  ? "我們可以提供什麼"
                  : "我們可以幫您什麼"}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}


        {portfolio.length ? (
          <section id="portfolio" className="scroll-mt-24 mt-8">
            <div className="mb-5">
              <p className="text-sm font-black text-emerald-700">
                作品／案例展示
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                看見我們的成果
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                點擊圖片可查看完整作品。
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    aria-label={`查看 ${item.title || "作品圖片"} 大圖`}
                    className="group relative block w-full overflow-hidden bg-slate-50 text-left"
                    onClick={() => openOriginalImage(item.image_url)}
                    title="查看作品圖片"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title || "作品案例"}
                      className="aspect-[4/3] w-full object-contain transition duration-300 group-hover:scale-[1.015]"
                    />
                    <span className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-950/80 px-3 py-2 text-center text-xs font-black text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                      查看作品圖片
                    </span>
                  </button>
                  {item.title || item.description ? (
                    <div className="p-5">
                      {item.title ? (
                        <h3 className="text-lg font-black text-slate-950">
                          {item.title}
                        </h3>
                      ) : null}
                      {item.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}


        {processSteps.length ? (
          <section
            id="process"
            className="scroll-mt-24 mt-8 rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8"
          >
            <p className="text-sm font-black text-sky-800">合作／服務流程</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              簡單清楚的合作方式
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm"
                >
                  <p className="text-xs font-black text-emerald-700">
                    STEP {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}


        {faqs.length ? (
          <section
            id="faq"
            className="scroll-mt-24 mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-sm font-black text-emerald-700">常見問題</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              您可能想知道
            </h2>
            <div className="mt-6 divide-y divide-slate-100">
              {faqs.map((item, index) => (
                <article key={item.id} className="py-5 first:pt-0 last:pb-0">
                  <p className="text-base font-black leading-relaxed text-slate-900">
                    Q{index + 1}. {item.question}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {isSupplier && supplier ? (
          <section
            id="supplier"
            className="scroll-mt-24 mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <article className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black text-emerald-700">供應商介紹</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                生產／批發與合作資訊
              </h2>
              {supplier.supplier_intro ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                  {supplier.supplier_intro}
                </p>
              ) : null}
              <MetaTag label="供應類型" values={supplier.supply_types} />
              <MetaTag
                label="可供應商品分類"
                values={supplier.product_categories}
                tone="sky"
              />
            </article>
            <article className="rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-sky-800">
                    團購合作條件
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    合作前先看這裡
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${supplier.is_accepting_collaboration ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                >
                  {supplier.is_accepting_collaboration
                    ? "目前接受合作申請"
                    : "目前暫停接受合作"}
                </span>
              </div>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {supplier.minimum_order_text ? (
                  <div className="rounded-2xl bg-white p-4">
                    <dt className="text-xs font-black text-slate-500">
                      最低訂購量
                    </dt>
                    <dd className="mt-1 text-sm font-black text-slate-900">
                      {supplier.minimum_order_text}
                    </dd>
                  </div>
                ) : null}
                {supplier.shipping_origin ? (
                  <div className="rounded-2xl bg-white p-4">
                    <dt className="text-xs font-black text-slate-500">
                      出貨地
                    </dt>
                    <dd className="mt-1 text-sm font-black text-slate-900">
                      {supplier.shipping_origin}
                    </dd>
                  </div>
                ) : null}
                {supplier.delivery_regions.length ? (
                  <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                    <dt className="text-xs font-black text-slate-500">
                      可配送地區
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {supplier.delivery_regions.map((region) => (
                        <span
                          key={region}
                          className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-900"
                        >
                          {region}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {supplier.lead_time_text ? (
                  <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                    <dt className="text-xs font-black text-slate-500">
                      備貨／交期
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm font-bold leading-relaxed text-slate-800">
                      {supplier.lead_time_text}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {supplier.cooperation_terms ? (
                <div className="mt-4 rounded-2xl border border-sky-100 bg-white/90 p-4">
                  <p className="text-sm font-black text-slate-900">合作說明</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {supplier.cooperation_terms}
                  </p>
                </div>
              ) : null}
              {showSupplierCta ? (
                <a
                  href={supplierCtaHref}
                  target={isExternal(supplierCtaHref) ? "_blank" : undefined}
                  rel="noreferrer"
                  className={`${primaryButtonClass} mt-5 w-full`}
                  style={primaryButtonStyle}
                >
                  {supplier.cooperation_button_label || "申請團購合作"}
                </a>
              ) : null}
            </article>
          </section>
        ) : null}

        {hasProducts ? (
          <section id="products" className="scroll-mt-24 mt-8">
            <div className="mb-5">
              <p className="text-sm font-black text-emerald-700">
                {isSupplier ? "可供應商品／服務" : "商品／服務展示"}
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                {isSupplier ? "可供應商品與服務" : "商品與服務介紹"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                歡迎查看各項商品與服務內容。
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {products.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                >
                  {item.image_url ? (
                    <button
                      type="button"
                      onClick={() => openOriginalImage(item.image_url)}
                      title="查看作品圖片"
                      className="block w-full bg-slate-50 text-left"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title || "展示項目"}
                        className="h-72 w-full object-contain"
                      />
                    </button>
                  ) : null}
                  <div className="p-5">
                    {item.title ? (
                      <h3 className="text-xl font-black text-slate-950">
                        {item.title}
                      </h3>
                    ) : null}
                    {item.price_text ? (
                      <p className="mt-2 font-black text-emerald-700">
                        {item.price_text}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    ) : null}
                    {item.button_url ? (
                      <a
                        href={safeHref(item.button_url)}
                        target="_blank"
                        rel="noreferrer"
                        className={`${primaryButtonClass} mt-5`}
                        style={primaryButtonStyle}
                      >
                        {getActionLabel(item.button_label, item.button_url)}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {contactDetails.length ? (
          <section
            id="contact"
            className="scroll-mt-24 mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black text-emerald-700">
                  聯絡與營業資訊
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  直接聯絡我們
                </h2>
              </div>
              {visiblePrimaryCta ? (
                <a
                  href={primaryCtaHref}
                  target={isExternal(primaryCtaHref) ? "_blank" : undefined}
                  rel="noreferrer"
                  className={primaryButtonClass}
                  style={primaryButtonStyle}
                >
                  {primaryCtaLabel}
                </a>
              ) : null}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-black text-slate-500">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      target={isExternal(detail.href) ? "_blank" : undefined}
                      rel="noreferrer"
                      className="mt-2 block break-words text-sm font-black leading-relaxed text-emerald-800 underline decoration-emerald-300 underline-offset-4"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm font-black leading-relaxed text-slate-800">
                      {detail.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-8 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_230px] lg:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">分享與聯絡</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                掃描 QR Code，快速查看完整介紹
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                可將此網址與 QR Code 分享給客戶、朋友或合作夥伴，快速查看品牌介紹、服務內容與聯絡方式。
              </p>
              <div className="mt-5 grid w-full max-w-[440px] grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void copyUrl()}
                  className={`${secondaryButtonClass} w-full`}
                  style={secondaryButtonStyle}
                >
                  複製分享網址
                </button>
                <button
                  type="button"
                  onClick={() => void downloadQr()}
                  className={`${primaryButtonClass} w-full`}
                  style={primaryButtonStyle}
                >
                  下載 QR Code
                </button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[220px] rounded-[1.5rem] border border-white bg-white p-4 text-center shadow-sm">
              <img
                src={qrUrl}
                alt="公開頁 QR Code"
                className="mx-auto h-44 w-44 rounded-xl"
              />
              <p className="mt-3 text-xs font-bold text-slate-600">
                掃碼查看完整介紹
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
