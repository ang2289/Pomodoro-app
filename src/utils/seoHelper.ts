export function generateSEO({ title, description, keywords, url }: {
  title: string;
  description: string;
  keywords?: string;
  url: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "url": url,
    "description": description,
    "inLanguage": "zh-TW",
    "publisher": {
      "@type": "Organization",
      "name": "RxV 夢想創作工作室",
      "url": "https://rxv-dreamstudio.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rxv-dreamstudio.vercel.app/logo.png"
      }
    }
  };

  return {
    title,
    description,
    keywords: keywords || "",
    jsonLd: JSON.stringify(jsonLd),
  };
}

