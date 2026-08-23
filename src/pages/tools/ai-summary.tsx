import { useMemo } from "react";
import SEO from "../../components/SEO";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";

function FotorAffiliateBlock() {
  return (
    <section className="mt-10 mb-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
          AI Creator Tools
        </span>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          AI 創作者推薦工具
        </h3>
      </div>
      <p className="mb-5 text-sm text-slate-500 leading-relaxed">
        可搭配本頁工具使用：先用 AI
        產生圖片素材、去背整理，再壓縮、轉尺寸、做成貼圖、QR 圖卡或短影音。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://www.fotor.com/tw/features/ai-image-generator/?via=289886"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            AI
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
              Fotor AI 圖片生成
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
          href="https://www.fotor.com/tw/features/background-remover/?via=289886"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            BG
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
              Fotor AI 去背工具
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
    </section>
  );
}

export default function AISummaryGuide() {
  const { t, i18n } = useTranslation();
  const canonicalUrl =
    "https://pomodoro-app-eight-rouge.vercel.app/tools/summary";

  const webPageJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("aiSummaryGuide.jsonLd.webName"),
      description: t("aiSummaryGuide.jsonLd.webDesc"),
      url: canonicalUrl,
      inLanguage: i18n.language?.startsWith("zh") ? "zh-TW" : "en",
    }),
    [t, i18n.language],
  );

  const softwareJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: t("aiSummaryGuide.jsonLd.webName"),
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: t("aiSummaryGuide.jsonLd.appDesc"),
      url: canonicalUrl,
      }),
    [t],
  );

  const mkLi = (
    key:
      | "techLi1"
      | "techLi2"
      | "techLi3"
      | "techLi4"
      | "featLi1"
      | "featLi2"
      | "featLi3"
      | "featLi4",
  ) => (
    <li
      key={key}
      dangerouslySetInnerHTML={{ __html: t(`aiSummaryGuide.marketing.${key}`) }}
    />
  );

  return (
    <>
      <SEO
        title={t("aiSummaryGuide.seo.title")}
        description={t("aiSummaryGuide.seo.description")}
        keywords={t("aiSummaryGuide.seo.keywords")}
        path="/tools/summary"
        jsonLdList={[webPageJsonLd, softwareJsonLd]}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            {t("aiSummaryGuide.h1")}
          </h1>
          <p className="mt-3 text-gray-700 leading-relaxed">
            {t("aiSummaryGuide.intro")}
          </p>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-800">
              {t("aiSummaryGuide.audience_label")}
            </span>
            {t("aiSummaryGuide.audience")}
          </p>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-800">
              {t("aiSummaryGuide.pair_label")}
            </span>
            {t("aiSummaryGuide.pair")}
          </p>
        </section>

        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            {t("aiSummaryGuide.marketing.heroLine1")}
            <span className="block text-blue-600 mt-2">
              {t("aiSummaryGuide.marketing.heroLine2")}
            </span>
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            {t("aiSummaryGuide.marketing.heroIntro")}
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/summary"
              className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
              style={{ color: "#ffffff !important", fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty(
                  "color",
                  "#ffffff",
                  "important",
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty(
                  "color",
                  "#ffffff",
                  "important",
                );
              }}
            >
              <span style={{ color: "#ffffff" }}>
                {t("aiSummaryGuide.marketing.tryCta")}
              </span>
            </Link>
            <a
              href="https://ko-fi.com/s/b5b4180ff1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
              style={{ color: "#ffffff !important", fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty(
                  "color",
                  "#ffffff",
                  "important",
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty(
                  "color",
                  "#ffffff",
                  "important",
                );
              }}
            >
              <span style={{ color: "#ffffff" }}>
                {t("aiSummaryGuide.marketing.buyTemplate")}
              </span>
            </a>
          </div>
        </section>

        <section className="space-y-8 mb-16">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">
              {t("aiSummaryGuide.marketing.howWorksTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("aiSummaryGuide.marketing.howWorksBody")}
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">
              {t("aiSummaryGuide.marketing.techTitle")}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {mkLi("techLi1")}
              {mkLi("techLi2")}
              {mkLi("techLi3")}
              {mkLi("techLi4")}
            </ul>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">
              {t("aiSummaryGuide.marketing.featuresTitle")}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {mkLi("featLi1")}
              {mkLi("featLi2")}
              {mkLi("featLi3")}
              {mkLi("featLi4")}
            </ul>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">
              {t("aiSummaryGuide.marketing.devTitle")}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("aiSummaryGuide.marketing.devIntro")}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>{t("aiSummaryGuide.marketing.devLi1")}</li>
              <li>{t("aiSummaryGuide.marketing.devLi2")}</li>
              <li>{t("aiSummaryGuide.marketing.devLi3")}</li>
              <li>{t("aiSummaryGuide.marketing.devLi4")}</li>
            </ul>
            <a
              href="https://ko-fi.com/s/b5b4180ff1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
              style={{ color: "#ffffff !important", fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty(
                  "color",
                  "#ffffff",
                  "important",
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty(
                  "color",
                  "#ffffff",
                  "important",
                );
              }}
            >
              <span style={{ color: "#ffffff" }}>
                {t("aiSummaryGuide.marketing.buyDevTemplate")}
              </span>
            </a>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {t("aiSummaryGuide.how_title")}
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {t("aiSummaryGuide.how_p")}
          </p>

          <h3 className="font-semibold mt-4 mb-2">
            {t("aiSummaryGuide.steps_title")}
          </h3>
          <ol className="list-decimal ml-5 text-gray-600 space-y-1">
            <li>{t("aiSummaryGuide.step1")}</li>
            <li>{t("aiSummaryGuide.step2")}</li>
            <li>{t("aiSummaryGuide.step3")}</li>
          </ol>

          <h3 className="font-semibold mt-4 mb-2">
            {t("aiSummaryGuide.scenarios_title")}
          </h3>
          <ul className="list-disc ml-5 text-gray-600 space-y-1">
            <li>{t("aiSummaryGuide.sc1")}</li>
            <li>{t("aiSummaryGuide.sc2")}</li>
            <li>{t("aiSummaryGuide.sc3")}</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">
            {t("aiSummaryGuide.what_title")}
          </h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            {t("aiSummaryGuide.what_p")}
          </p>

          <h2 className="mt-6 text-2xl font-semibold text-slate-900">
            {t("aiSummaryGuide.why_title")}
          </h2>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-700">
            <li>{t("aiSummaryGuide.why_li1")}</li>
            <li>{t("aiSummaryGuide.why_li2")}</li>
            <li>{t("aiSummaryGuide.why_li3")}</li>
          </ul>

          <FotorAffiliateBlock />
          <RelatedTools
            items={getRelatedToolsItems("ai-summary")}
            title={t("related_tools_section_title")}
          />
          <RelatedGuides items={getRelatedGuideItems("ai-summary")} />
          <p className="mt-4 text-gray-700 leading-relaxed">
            {t("aiSummaryGuide.seo_para")}
          </p>
          <div className="mt-8">
            <Link
              to="/tools"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
            >
              {t("batch1_tools_hub_cta")}
            </Link>
          </div>
        </section>

        <section className="text-center py-8 border-t">
          <Link to="/" className="text-blue-600 hover:text-blue-700 underline">
            {t("aiSummaryGuide.marketing.backHub")}
          </Link>
        </section>
      </main>

      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://ko-fi.com/s/b5b4180ff1"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 text-sm font-semibold transition cursor-pointer"
          style={{ color: "#ffffff !important", fontWeight: 600 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.setProperty("color", "#ffffff", "important");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty("color", "#ffffff", "important");
          }}
        >
          <span style={{ color: "#ffffff" }}>
            {t("aiSummaryGuide.marketing.floatBuy")}
          </span>
        </a>
      </div>
    </>
  );
}
