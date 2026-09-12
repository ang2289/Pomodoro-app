import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";

type PortfolioCategory =
  | "全部"
  | "餐飲外送圖"
  | "甜點飲料圖"
  | "美業形象圖"
  | "花店禮盒圖"
  | "包裝品牌圖"
  | "社群促銷圖";

type PortfolioItem = {
  title: string;
  category: Exclude<PortfolioCategory, "全部">;
  businessType: string;
  usage: string;
  description: string;
  gradient: string;
  accent: string;
  imageUrl?: string;
  isUploaded?: boolean;
};

const categories: PortfolioCategory[] = [
  "全部",
  "餐飲外送圖",
  "甜點飲料圖",
  "美業形象圖",
  "花店禮盒圖",
  "包裝品牌圖",
  "社群促銷圖",
];

const portfolioItems: PortfolioItem[] = [
  {
    title: "熱炒店外送主圖升級示範",
    category: "餐飲外送圖",
    businessType: "熱炒店、海鮮店、小吃店",
    usage: "Uber Eats、Foodpanda、LINE 點餐",
    description: "適合把招牌菜、熱炒拼盤或外送主打餐點整理成更清楚、更有食慾感的平台主圖。",
    gradient: "from-orange-100 via-amber-50 to-red-100",
    accent: "招牌餐點",
  },
  {
    title: "便當店招牌餐盒宣傳圖",
    category: "餐飲外送圖",
    businessType: "便當店、早餐店、午餐外送",
    usage: "外送平台主圖、菜單分類圖、社群貼文",
    description: "用乾淨桌面、份量感與主菜特寫，讓餐盒看起來更有飽足感與購買感。",
    gradient: "from-lime-100 via-white to-emerald-100",
    accent: "人氣餐盒",
  },
  {
    title: "蛋塔店商品宣傳圖示範",
    category: "甜點飲料圖",
    businessType: "蛋塔店、甜點店、烘焙工作室",
    usage: "FB、IG、LINE 圖文、預購頁",
    description: "適合展示剛出爐甜點、禮盒包裝、節日預購與限時優惠活動。",
    gradient: "from-yellow-100 via-orange-50 to-rose-100",
    accent: "手作甜點",
  },
  {
    title: "飲料店新品上市視覺",
    category: "甜點飲料圖",
    businessType: "飲料店、咖啡店、手搖飲品牌",
    usage: "新品公告、社群貼文、限動主圖",
    description: "強調杯身、配料、清爽背景與留白，方便後續加上新品名稱與優惠文字。",
    gradient: "from-sky-100 via-cyan-50 to-teal-100",
    accent: "新品飲品",
  },
  {
    title: "美甲工作室品牌形象圖",
    category: "美業形象圖",
    businessType: "美甲師、美睫師、美容工作室",
    usage: "IG 貼文、LINE 官方帳號、服務介紹頁",
    description: "以乾淨柔和的工作室氛圍、精緻細節與溫柔色系，呈現專業感與信任感。",
    gradient: "from-pink-100 via-rose-50 to-fuchsia-100",
    accent: "美業形象",
  },
  {
    title: "花店節日禮盒主視覺",
    category: "花店禮盒圖",
    businessType: "花店、禮品店、手作品牌",
    usage: "節日活動、母親節、情人節、送禮推薦",
    description: "適合把花束、禮盒、卡片與節日氛圍整理成可分享的活動主視覺。",
    gradient: "from-rose-100 via-pink-50 to-violet-100",
    accent: "花束禮盒",
  },
  {
    title: "小店品牌整套視覺展示",
    category: "包裝品牌圖",
    businessType: "甜點店、咖啡店、手作品牌",
    usage: "品牌提案、作品集、包裝示範",
    description: "將商品圖、包裝袋、名片、社群貼文與品牌主視覺整理成一致風格，適合對外提案。",
    gradient: "from-violet-100 via-white to-indigo-100",
    accent: "整套品牌",
  },
  {
    title: "商品禮盒與包裝貼紙示範",
    category: "包裝品牌圖",
    businessType: "烘焙、禮盒、手作、伴手禮",
    usage: "包裝示意圖、商品頁、品牌介紹",
    description: "適合展示禮盒、紙袋、貼紙與品牌感包裝，讓小店商品看起來更完整。",
    gradient: "from-stone-100 via-amber-50 to-orange-100",
    accent: "包裝設計",
  },
  {
    title: "限時優惠社群促銷圖",
    category: "社群促銷圖",
    businessType: "各類小店、餐飲、美業、零售",
    usage: "FB 貼文、IG 貼文、LINE 圖文",
    description: "保留大字標題空間，適合放限時優惠、買一送一、預購開放與新品活動。",
    gradient: "from-red-100 via-orange-50 to-yellow-100",
    accent: "限時優惠",
  },
  {
    title: "店家服務項目介紹圖",
    category: "社群促銷圖",
    businessType: "接案服務、小店品牌、美業工作室",
    usage: "服務介紹、粉專置頂圖、詢問導流",
    description: "把服務項目、適合對象與詢問入口整理成清楚的社群圖片，降低客戶理解成本。",
    gradient: "from-emerald-100 via-white to-cyan-100",
    accent: "服務介紹",
  },
];

type PortfolioRow = {
  id?: string;
  title?: string | null;
  category?: string | null;
  business_type?: string | null;
  usage_type?: string | null;
  image_url?: string | null;
  description?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
};

function normalizePortfolioRow(row: PortfolioRow): PortfolioItem {
  const category = categories.includes(row.category as PortfolioCategory) && row.category !== "全部"
    ? (row.category as Exclude<PortfolioCategory, "全部">)
    : "社群促銷圖";

  return {
    title: row.title || "RxV 店家圖片升級作品",
    category,
    businessType: row.business_type || "小店品牌／商品服務",
    usage: row.usage_type || "FB／IG／LINE／外送平台",
    description: row.description || "RxV 店家圖片升級作品示範。",
    gradient: "from-orange-100 via-white to-rose-100",
    accent: row.title || "作品示範",
    imageUrl: row.image_url || "",
    isUploaded: true,
  };
}

export default function StoreBrandingPortfolio() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("全部");
  const [uploadedItems, setUploadedItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPortfolioAdmin, setIsPortfolioAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUploadedItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("portfolio_items")
          .select("id,title,category,business_type,usage_type,image_url,description,sort_order,created_at")
          .eq("is_public", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted && data) {
          setUploadedItems((data as PortfolioRow[]).map(normalizePortfolioRow));
        }
      } catch {
        if (mounted) setUploadedItems([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadUploadedItems();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const checkAdmin = () => {
      const token = String(localStorage.getItem("auth_token") || localStorage.getItem("token") || "").trim();
      if (!token) {
        if (active) setIsPortfolioAdmin(false);
        return;
      }
      void fetch("/api/main?action=get-design-portfolio-admin-status", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (active) setIsPortfolioAdmin(response.ok);
        })
        .catch(() => {
          if (active) setIsPortfolioAdmin(false);
        });
    };

    checkAdmin();
    window.addEventListener("auth-changed", checkAdmin);
    window.addEventListener("storage", checkAdmin);
    return () => {
      active = false;
      window.removeEventListener("auth-changed", checkAdmin);
      window.removeEventListener("storage", checkAdmin);
    };
  }, []);

  const allItems = useMemo(() => [...uploadedItems, ...portfolioItems], [uploadedItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "全部") return allItems;
    return allItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, allItems]);

  const mailHref =
    "mailto:rxv0227@gmail.com?subject=店家圖片升級服務詢問&body=您好，我想詢問店家圖片升級服務。%0D%0A店家類型：%0D%0A想製作的圖片用途：外送平台／FB／IG／LINE／包裝／其他%0D%0A目前是否有商品照片：%0D%0A想參考的作品風格：";

  return (
    <>
      <SEO
        title="店家圖片升級作品集｜RxV 商品圖、社群圖與品牌視覺示範"
        description="展示餐飲、甜點、飲料、美業、花店與手作品牌可製作的商品圖、社群圖、包裝圖與品牌視覺示範。"
        canonical="/portfolio/store-branding"
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-700 shadow-sm">
                RxV STORE BRANDING PORTFOLIO
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                店家圖片升級作品集
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
                展示餐飲、甜點、飲料、美業、花店與手作品牌可製作的商品圖、社群圖、包裝圖與品牌視覺示範。
                上傳到後台的作品會優先顯示在前面，下方仍保留示範卡片，方便店家快速理解可製作方向。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={mailHref}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700 hover:!text-white hover:shadow-lg"
                >
                  Email 詢問改圖服務
                </a>
                <Link
                  to="/tools/image-prompt"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-700 hover:!text-white hover:shadow-lg"
                >
                  回到提示詞工具
                </Link>
                {isPortfolioAdmin ? (
                  <Link
                    to="/admin/portfolio-upload"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-rose-700 hover:!text-white hover:shadow-lg"
                  >
                    上傳作品圖片
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
              <p className="text-sm font-extrabold text-slate-900">適合製作項目</p>
              <div className="mt-4 grid gap-3">
                {["外送平台餐點圖", "商品宣傳圖", "社群促銷圖", "包裝／禮盒示範", "小店品牌主視覺"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-slate-800"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`min-h-[42px] rounded-2xl px-4 py-2 text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-orange-600 !text-white shadow"
                    : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {isLoading && (
          <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">正在讀取已上傳作品...</p>
        )}

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              key={`${item.category}-${item.title}`}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${item.gradient} p-5`}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                  {item.category}
                </div>
                {!item.imageUrl && (
                  <div className="rounded-3xl border border-white/70 bg-white/70 px-6 py-5 text-center shadow-sm backdrop-blur">
                    <p className="text-xs font-bold text-orange-700">RxV 示範方向</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{item.accent}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-600">可替換為你的商品照</p>
                  </div>
                )}
                {item.imageUrl && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4">
                    <p className="text-xs font-bold text-white">{item.isUploaded ? "已上傳作品" : "RxV 示範方向"}</p>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-lg font-extrabold leading-7 text-slate-900">{item.title}</h2>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  <p>
                    <span className="font-bold text-slate-900">適合店家：</span>
                    {item.businessType}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900">使用場景：</span>
                    {item.usage}
                  </p>
                  <p>{item.description}</p>
                </div>

                <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-900">
                  此為 RxV 作品示範圖，僅供風格參考。正式製作會依店家提供之商品照片、Logo 與品牌素材客製化設計。
                </p>

                <a
                  href={`${mailHref}%0D%0A我想詢問的作品風格：${encodeURIComponent(item.title)}`}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-rose-700 hover:!text-white hover:shadow-lg"
                >
                  詢問這種風格
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold text-slate-900">
            想把你的商品照升級成店家專屬圖片？
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            可先提供 1～3 張商品照片，協助評估適合做成外送平台圖、社群宣傳圖、促銷圖、包裝示範或品牌主視覺。
            若你只是想自己產生靈感，也可以回到 AI 商業圖片提示詞工具先試做。
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={mailHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700 hover:!text-white hover:shadow-lg"
            >
              Email 詢問
            </a>
            <Link
              to="/tools/image-prompt"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700 hover:!text-white hover:shadow-lg"
            >
              回到 AI 商業圖片提示詞工具
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-900">商用素材提醒</h2>
          <p className="mt-2 text-sm leading-7 text-amber-950">
            本頁示範內容僅用於說明可製作方向。正式商用圖片請使用自己擁有權利的商品照片、Logo、品牌素材與授權字體。
            請勿冒用他人店名、商標、名人肖像、外送平台截圖或未取得授權的素材。
          </p>
        </section>
      </main>
    </>
  );
}
