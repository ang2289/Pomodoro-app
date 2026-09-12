// /src/pages/goods/airfryer-keshaui.tsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";

export default function AirfryerPage() {
  const { t } = useTranslation();

  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const queryVideoUrl = query.get("video") || "";
  const queryTitle = query.get("title") || "";
  const queryDesc = query.get("desc") || "";
  const queryLink = query.get("link") || "https://s.shopee.tw/4VVYsj4w4v";

  const localVideoSrc = !queryVideoUrl ? "/videos/airfryer-demo.mp4" : "";
  const youtubeVideoId = "";
  const cdnVideoUrl = queryVideoUrl || "";
  const videoType = youtubeVideoId ? "youtube" : cdnVideoUrl ? "cdn" : "local";
  const pageTitle = queryTitle || t("airfryer_h1");
  const pageDesc =
    queryDesc ||
    `${t("airfryer_intro_prefix")}${t("airfryer_intro_product")}${t("airfryer_intro_suffix")}`;

  return (
    <>
      <SEO
        title={t("airfryer_seo_title")}
        description={t("airfryer_seo_description")}
        keywords={t("airfryer_seo_keywords")}
        url="https://pomodoro-app-eight-rouge.vercel.app/goods/share"
        image="/assets/airfryer-keshaui-cover.png"
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>

        <img
          src="/assets/airfryer-keshaui-cover.png"
          alt={t("airfryer_alt_cover")}
          className="w-full rounded-lg mb-4"
        />

        {videoType === "youtube" && youtubeVideoId && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden border shadow-lg">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title={t("airfryer_video_title")}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {videoType === "cdn" && cdnVideoUrl && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden border shadow-lg">
            <video controls className="w-full h-full" preload="metadata">
              <source src={cdnVideoUrl} type="video/mp4" />
              {t("airfryer_video_unsupported")}
            </video>
          </div>
        )}

        {videoType === "local" && localVideoSrc && (
          <div className="aspect-video mb-6 rounded-lg overflow-hidden border shadow-lg">
            <video controls className="w-full h-full" preload="metadata">
              <source src={localVideoSrc} type="video/mp4" />
              {t("airfryer_video_unsupported")}
            </video>
          </div>
        )}

        <p className="mb-4">{pageDesc}</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          {t("airfryer_h2_baking")}
        </h2>
        <img
          src="/assets/airfryer-keshaui/feature-2.png"
          alt={t("airfryer_alt_baking")}
          className="w-full rounded-lg mb-4"
        />
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>{t("airfryer_li_baking_1")}</li>
          <li>{t("airfryer_li_baking_2")}</li>
          <li>
            <strong className="text-red-500">
              {t("airfryer_li_baking_3")}
            </strong>
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          {t("airfryer_h2_why")}
        </h2>
        <img
          src="/assets/airfryer-keshaui/feature-3.png"
          alt={t("airfryer_alt_feature")}
          className="w-full rounded-lg mb-4"
        />
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>{t("airfryer_li_why_1")}</li>
          <li>{t("airfryer_li_why_2")}</li>
          <li>{t("airfryer_li_why_3")}</li>
          <li>{t("airfryer_li_why_4")}</li>
          <li>{t("airfryer_li_why_5")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          {t("airfryer_h2_buy")}
        </h2>
        <a
          href={queryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-pink-600 text-white px-4 py-2 rounded-full font-bold hover:bg-pink-700"
        >
          {t("airfryer_btn_buy")}
        </a>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          {t("airfryer_h2_specs")}
        </h2>
        <ul className="list-disc ml-6 mb-4 text-gray-700 text-sm">
          <li>{t("airfryer_li_spec_1")}</li>
          <li>{t("airfryer_li_spec_2")}</li>
          <li>{t("airfryer_li_spec_3")}</li>
          <li>{t("airfryer_li_spec_4")}</li>
          <li>{t("airfryer_li_spec_5")}</li>
          <li>{t("airfryer_li_spec_6")}</li>
        </ul>

        <p className="text-xs text-gray-500 mt-6">{t("airfryer_disclaimer")}</p>
      </div>
    </>
  );
}
