import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO, { getBaseUrl } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import {
  isLocalDevelopment,
  isVideoToolPublicPath,
} from "@/lib/isLocalDevelopment";

interface ToolCard {
  titleKey?: string;
  descKey?: string;
  title?: string;
  desc?: string;
  icon: string;
  to: string;
  badges: string[];
  /** 卡片底部 PS 說明（i18n key，例如 home_tool_video_ps） */
  psKey?: string;
}

const CARD_CLASS =
  "flex flex-col min-h-[170px] p-6 rounded-2xl border bg-white shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1";

const BADGE_KEYS: Record<string, string> = {
  free: "tools_badge_free",
  ai: "tools_badge_ai",
  hot: "tools_badge_hot",
  life: "tools_badge_life",
};

const DIRECT_BADGE_LABELS: Record<string, string> = {
  price399: "NT$399",
  partialFree: "部分免費",
};

function getBadgeLabel(badge: string, t: (key: string) => string) {
  return DIRECT_BADGE_LABELS[badge] || t(BADGE_KEYS[badge] || badge);
}

export default function ToolsPage() {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith("en") ? "en-US" : "zh-TW";
  const [search, setSearch] = useState("");

  const freeTools: ToolCard[] = [
    {
      title: "高畫質圖片素材庫",
      desc: "1,583+ 張高畫質圖片完整版 NT$399，涵蓋食物、商業、花卉、社群、桌布等分類；另提供部分圖片免費試用。",
      icon: "🖼️",
      to: "/images",
      badges: ["price399", "partialFree", "hot"],
    },
    {
      title: "免費資源中心",
      desc: "LINE 貼圖咒語、AI 生圖提示詞、文案模板與免費圖片資源下載。",
      icon: "🎁",
      to: "/free",
      badges: ["free", "hot"],
    },
    {
      title: "LINE 貼圖提示詞產生器",
      desc: "選情侶、品牌、遊戲、寵物等分類，一鍵產生可複製的貼圖咒語。",
      icon: "✨",
      to: "/tools/sticker-prompt",
      badges: ["free", "hot"],
    },
    {
      title: "情緒價值系 LINE 貼圖提示詞",
      desc: "療癒陪伴、哄人安慰、晚安陪聊、上班回訊息等主題，一鍵產生 4x4 LINE 貼圖提示詞。",
      icon: "💗",
      to: "/tools/emotional-value-sticker-prompt",
      badges: ["free", "hot"],
    },
    {
      title: "LINE 動態貼圖提示詞產生器",
      desc: "產生 8／16／24 張動態 LINE 貼圖企劃、動畫分鏡、幀數秒數建議與提示詞。",
      icon: "🎞️",
      to: "/tools/animated-sticker-prompt",
      badges: ["free", "hot"],
    },
    {
      title: "動態 LINE 貼圖 APNG 打包工具",
      desc: "上傳多張 PNG 禎圖，檢查 LINE 動態貼圖規格，預覽動畫並匯出 APNG、GIF、MP4 或逐禎 ZIP。",
      icon: "✨",
      to: "/tools/animated-line-sticker",
      badges: ["free", "hot"],
    },
    {
      title: "LINE 貼圖分割工具",
      desc: "上傳 LINE 貼圖大圖，可進行 4x4／5x4 分割、微調分割線，並整理成 ZIP 打包下載。",
      icon: "🧩",
      to: "/tools/sticker-splitter",
      badges: ["free"],
    },
    {
      titleKey: "home_tool_line_sticker_title",
      descKey: "home_tool_line_sticker_desc",
      icon: "📦",
      to: "/tools/line-sticker",
      badges: ["free", "hot"],
    },
    {
      title: "AI 生圖提示詞產生器",
      desc: "快速產生商品宣傳圖、社群圖、LINE 貼圖、角色圖與封面圖提示詞。",
      icon: "🖼️",
      to: "/tools/image-prompt",
      badges: ["free", "ai", "hot"],
    },
    {
      title: "寵物 AI 提示詞產生器",
      desc: "快速產生毛孩 LINE 貼圖、寵物寫實美圖、寵物店宣傳圖提示詞。",
      icon: "🐾",
      to: "/tools/pet-prompt",
      badges: ["free", "ai", "hot"],
    },
    {
      title: "圖片壓縮工具",
      desc: "快速壓縮 JPG、PNG、WebP，縮小檔案大小。",
      icon: "🗜️",
      to: "/tools/image-compress",
      badges: ["free", "hot"],
    },
    {
      titleKey: "home_tool_image_resize_title",
      descKey: "home_tool_image_resize_desc",
      icon: "📐",
      to: "/tools/image-resize",
      badges: ["free", "hot"],
    },
    {
      titleKey: "home_tool_image_convert_title",
      descKey: "home_tool_image_convert_desc",
      icon: "🔄",
      to: "/tools/image-convert",
      badges: ["free", "hot"],
    },
    {
      titleKey: "home_tool_image_crop_title",
      descKey: "home_tool_image_crop_desc",
      icon: "✂️",
      to: "/tools/image-crop",
      badges: ["free", "hot"],
    },
    {
      titleKey: "scam_check_title",
      descKey: "home_tool_scam_check_desc",
      icon: "🛡️",
      to: "/tools/scam-check",
      badges: ["free"],
    },
    {
      titleKey: "tool_qr_code_title",
      descKey: "tool_qr_code_desc",
      icon: "📱",
      to: "/tools/qr-code",
      badges: ["free"],
    },
  ];

  const businessTools: ToolCard[] = [
    {
      title: "人工名片設計＋代印",
      desc: "先選喜歡風格、填寫名片資料並上傳 Logo／圖片，由工作室協助人工排版，可加 QR Code，確認預覽後再匯款送印。",
      icon: "🪪",
      to: "/tools/business-card-order",
      badges: ["hot"],
    },
    {
      title: "隨手拍商品圖生成器",
      desc: "上傳手機拍的商品照，使用點數生成白底商品圖、高級質感圖、社群宣傳圖、外送平台主圖與促銷圖。",
      icon: "📷",
      to: "/tools/product-image-generator",
      badges: ["ai", "hot"],
    },
    {
      title: "商品圖升級服務",
      desc: "使用 AI 商品圖工具，把隨手拍商品照做成更適合社群、商品展示與行銷使用的視覺圖。",
      icon: "🛍️",
      to: "/tools/product-image-generator",
      badges: ["ai", "hot"],
    },
    {
      title: "購買點數送店家商品展示頁",
      desc: "購買指定商品圖點數包，加贈可自行管理的商品展示頁、公開網址與 QR Code，方便放在名片、小卡、菜單與社群貼文。",
      icon: "🎁",
      to: "/pricing",
      badges: ["hot"],
    },
  ];

  const aiTools: ToolCard[] = [
    {
      titleKey: "tool_ai_summary",
      descKey: "home_tool_ai_summary_desc",
      icon: "🤖",
      to: "/summary",
      badges: ["ai", "hot"],
    },
    {
      titleKey: "homework_helper",
      descKey: "home_tool_homework_desc",
      icon: "📘",
      to: "/tools/homework-helper",
      badges: ["ai"],
    },
    {
      titleKey: "home_tool_image_to_video_title",
      descKey: "home_tool_image_to_video_desc",
      icon: "🎞️",
      to: "/tools/image-to-video",
      badges: ["ai"],
      psKey: "home_tool_video_ps",
    },
    {
      titleKey: "home_tool_video_title",
      descKey: "home_tool_video_desc",
      icon: "🎬",
      to: "/tools/shopee-video",
      badges: ["ai"],
    },
  ];

  const lifeTools: ToolCard[] = [
    {
      title: "吃不胖星球",
      desc: "點美食、餵角色、累積快樂值，解鎖可愛食物圖鑑的療癒小遊戲。",
      icon: "🍰",
      to: "/tools/eat-no-fat-game",
      badges: ["life", "hot"],
    },
    {
      title: "車禍現場與筆錄前自保清單",
      desc: "路口車禍、機車擦撞、追撞時可用，整理現場 SOP、拍照清單、筆錄前重點與後續待辦。",
      icon: "🚗",
      to: "/tools/traffic-accident",
      badges: ["life", "hot"],
    },
    {
      titleKey: "home_tool_pomodoro_title",
      descKey: "home_tool_pomodoro_desc",
      icon: "🍅",
      to: "/pomodoro",
      badges: ["life", "hot"],
    },
    {
      titleKey: "todo",
      descKey: "home_tool_todo_desc",
      icon: "✅",
      to: "/todo",
      badges: ["life"],
    },
    {
      titleKey: "home_tool_chant_title",
      descKey: "home_tool_chant_desc",
      icon: "🔔",
      to: "/chant",
      badges: ["life"],
    },
  ];

  const allTools = [
    { sectionKey: "熱門工具與素材", items: freeTools },
    { sectionKey: "商業工具與印刷服務", items: businessTools },
    { sectionKey: "tools_section_ai_title" as const, items: aiTools },
    { sectionKey: "tools_section_life_title" as const, items: lifeTools },
  ];

  const q = search.trim().toLowerCase();
  const filteredSections = q
    ? allTools.map(({ sectionKey, items }) => ({
        sectionKey,
        items: items.filter((card) => {
          const title = (
            card.title ?? (card.titleKey ? t(card.titleKey) : "")
          ).toLowerCase();
          const desc = (
            card.desc ?? (card.descKey ? t(card.descKey) : "")
          ).toLowerCase();
          return title.includes(q) || desc.includes(q);
        }),
      }))
    : allTools.map((s) => ({ sectionKey: s.sectionKey, items: s.items }));

  const hasAnyResults = filteredSections.some((s) => s.items.length > 0);

  const renderCard = (card: ToolCard) => {
    const cardTitle = card.title ?? (card.titleKey ? t(card.titleKey) : "");
    const cardDesc = card.desc ?? (card.descKey ? t(card.descKey) : "");
    const cardKey = `${card.to}:${card.title ?? card.titleKey ?? card.icon}`;
    const videoLocked = !isLocalDevelopment() && isVideoToolPublicPath(card.to);
    if (videoLocked) {
      return (
        <div
          key={cardKey}
          className={`${CARD_CLASS} relative cursor-not-allowed opacity-80 pointer-events-none`}
          aria-disabled
        >
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            {t("toolsHub.badgeDev")}
          </span>
          <div className="flex flex-wrap gap-1.5 mb-2 pr-16">
            {card.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {getBadgeLabel(badge, t)}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">
            {card.icon} {cardTitle}
          </h3>
          <p className="text-gray-600 text-sm flex-1">{cardDesc}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">
            {t("toolsHub.badgeLocked")}
          </p>
        </div>
      );
    }

    return (
      <a key={cardKey} href={card.to} className={CARD_CLASS}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {card.badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {getBadgeLabel(badge, t)}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-lg text-slate-900 mb-2">
          {card.icon} {cardTitle}
        </h3>
        <p className="text-gray-600 text-sm flex-1">{cardDesc}</p>
        {card.psKey ? (
          <p className="mt-2 text-xs text-gray-500">{t(card.psKey)}</p>
        ) : null}
      </a>
    );
  };

  const sectionEmoji: Record<string, string> = {
    "熱門工具與素材": "🔥",
    "商業工具與印刷服務": "💼",
    tools_section_ai_title: "🤖",
    tools_section_life_title: "⚡",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("tools_faq_q1"),
        acceptedAnswer: { "@type": "Answer", text: t("tools_faq_a1") },
      },
      {
        "@type": "Question",
        name: t("tools_faq_q2"),
        acceptedAnswer: { "@type": "Answer", text: t("tools_faq_a2") },
      },
      {
        "@type": "Question",
        name: t("tools_faq_q3"),
        acceptedAnswer: { "@type": "Answer", text: t("tools_faq_a3") },
      },
      {
        "@type": "Question",
        name: t("tools_faq_q4"),
        acceptedAnswer: { "@type": "Answer", text: t("tools_faq_a4") },
      },
    ],
  };
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("nav.breadcrumb.toolsHub"),
    description: t("tools_seo_desc"),
    url: `${baseUrl}/tools`,
    inLanguage: inLang,
  };

  return (
    <>
      <SEO
        title={t("tools_seo_title")}
        description={t("tools_seo_desc")}
        keywords={t("categoryTools.seoKeywords")}
        path="/tools"
      />
      <Helmet>
        <title>{t("tools_seo_title")}</title>
        <meta name="description" content={t("tools_seo_desc")} />
        <link rel="canonical" href="/tools" />
        <script type="application/ld+json">
          {JSON.stringify(webPageSchema)}
        </script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t("categoryTools.h1")}
        </h1>
        <p className="text-slate-600 mb-6">{t("categoryTools.lead")}</p>

        {/* 搜尋欄 */}
        <div className="mb-8">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("tools_search_placeholder")}
            className="w-full max-w-xl px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={t("tools_search_placeholder")}
          />
        </div>

        {!hasAnyResults ? (
          <p className="text-slate-600 py-8">{t("tools_empty_search")}</p>
        ) : (
          <>
            {filteredSections.map(({ sectionKey, items }) =>
              items.length > 0 ? (
                <section
                  key={sectionKey}
                  className={
                    sectionKey === "tools_section_ai_title" ? "mb-10" : "mb-10"
                  }
                  id={
                    sectionKey === "tools_section_ai_title" ? "ai" : undefined
                  }
                >
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    {sectionEmoji[sectionKey]}{" "}
                    {sectionKey === "商業工具與印刷服務" || sectionKey === "熱門工具與素材"
                      ? sectionKey
                      : t(sectionKey)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(renderCard)}
                  </div>
                </section>
              ) : null,
            )}
          </>
        )}

        {/* 熱門工具介紹 */}
        <section className="mt-16 mb-10 pt-10 border-t border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            📌 {t("tools_intro_title")}
          </h2>
          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {t("categoryTools.introH3Line")}
              </h3>
              <p>{t("tools_intro_line_sticker")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {t("categoryTools.introH3Resize")}
              </h3>
              <p>{t("tools_intro_image_resize")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {t("categoryTools.introH3Ai")}
              </h3>
              <p>{t("tools_intro_ai_summary")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {t("categoryTools.introH3Pomodoro")}
              </h3>
              <p>{t("tools_intro_pomodoro")}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10 pt-10 border-t border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            ❓ {t("tools_faq_title")}
          </h2>
          <dl className="space-y-6">
            <div>
              <dt className="font-semibold text-slate-900 mb-1">
                {t("tools_faq_q1")}
              </dt>
              <dd className="text-slate-700 text-sm leading-relaxed">
                {t("tools_faq_a1")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 mb-1">
                {t("tools_faq_q2")}
              </dt>
              <dd className="text-slate-700 text-sm leading-relaxed">
                {t("tools_faq_a2")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 mb-1">
                {t("tools_faq_q3")}
              </dt>
              <dd className="text-slate-700 text-sm leading-relaxed">
                {t("tools_faq_a3")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 mb-1">
                {t("tools_faq_q4")}
              </dt>
              <dd className="text-slate-700 text-sm leading-relaxed">
                {t("tools_faq_a4")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("categoryTools.whatTitle")}
          </h2>
          <p className="mt-3 text-slate-700 leading-relaxed">
            {t("categoryTools.whatP")}
          </p>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">
            {t("categoryTools.whyTitle")}
          </h2>
          <ul className="list-disc pl-5 mt-3 text-slate-700 space-y-1">
            <li>{t("categoryTools.whyLi1")}</li>
            <li>{t("categoryTools.whyLi2")}</li>
            <li>{t("categoryTools.whyLi3")}</li>
          </ul>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">
            {t("categoryTools.moreTitle")}
          </h2>
          <ul className="list-disc pl-5 mt-3 text-slate-700 space-y-1">
            <li>
              <a href="/tools" className="text-blue-600 hover:underline">
                {t("categoryTools.moreLinkTools")}
              </a>
            </li>
            <li>
              <a href="/summary" className="text-blue-600 hover:underline">
                {t("categoryTools.moreLinkSummary")}
              </a>
            </li>
            <li>
              <a
                href="/tools/homework-helper"
                className="text-blue-600 hover:underline"
              >
                {t("categoryTools.moreLinkHomework")}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-slate-700 leading-relaxed">
            {t("categoryTools.longP")}
          </p>
          <div className="mt-8">
            <a
              href="/tools"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
            >
              {t("categoryTools.ctaMore")}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
