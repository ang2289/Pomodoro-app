import fs from "fs";
import path from "path";

const BASE_URL =
  process.env.VITE_SITE_URL || "https://pomodoro-app-eight-rouge.vercel.app";

type ImageEntry = {
  pagePath: string;
  imagePath: string;
  title: string;
};

const imageEntries: ImageEntry[] = [
  { pagePath: "/", imagePath: "/public/icons/icon-512.png", title: "RxV AI 工具中心" },
  { pagePath: "/tools/image-resize", imagePath: "/public/icons/icon-192.png", title: "圖片尺寸轉換工具" },
  { pagePath: "/tools/image-compress", imagePath: "/public/icons/icon-192.png", title: "圖片壓縮工具" },
  { pagePath: "/tools/qr-code", imagePath: "/public/icons/icon-192.png", title: "QR Code 產生器" },
  { pagePath: "/tools/line-sticker", imagePath: "/public/icons/icon-192.png", title: "LINE 貼圖整理工具" },
];

const toPublicImageUrl = (imagePath: string) => {
  const normalized = imagePath.replace(/^\/public/, "");
  return `${BASE_URL}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
};

function generateImageSitemap() {
  const urls = imageEntries
    .map(
      (entry) => `
  <url>
    <loc>${BASE_URL}${entry.pagePath}</loc>
    <image:image>
      <image:loc>${toPublicImageUrl(entry.imagePath)}</image:loc>
      <image:title>${entry.title}</image:title>
    </image:image>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urls}
</urlset>`;

  const outputPath = path.join(process.cwd(), "public", "sitemap-images.xml");
  fs.writeFileSync(outputPath, xml.trim());
  console.log("✅ Image Sitemap 生成完成");
}

generateImageSitemap();
