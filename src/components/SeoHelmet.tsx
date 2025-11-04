import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SeoHelmetProps {
  title: string;
  description: string;
  lang?: "zh" | "en";
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export default function SeoHelmet({
  title,
  description,
  lang,
  keywords,
  ogTitle,
  ogDescription,
}: SeoHelmetProps) {
  const { i18n } = useTranslation();
  const currentLang = lang || (i18n.language.startsWith("zh") ? "zh" : "en");

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      <html lang={currentLang === "zh" ? "zh-TW" : "en"} />
    </Helmet>
  );
}

