/**
 * 將 image-convert 的 20 筆 SEO 附加至 src/data/seoPages.json
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src", "data");
const JSON_PATH = path.join(ROOT, "seoPages.json");

const SLUGS = [
  {
    slug: "convert-png-to-jpg",
    title: "PNG 轉 JPG 線上工具｜透明背景轉白底",
    description:
      "將 PNG 轉成 JPG 以符合僅收 JPEG 的上傳或信箱限制。RxV 在瀏覽器以 canvas 輸出，透明區域會以白底填滿；若需保留透明請維持 PNG 或改 WebP。",
    keywords: "PNG轉JPG,JPEG,線上轉檔,透明背景,圖片格式",
  },
  {
    slug: "convert-jpg-to-png",
    title: "JPG 轉 PNG 線上｜去背前備援格式",
    description:
      "需要無損編輯或後續去背時，可先將 JPG 轉為 PNG 再進後製。本工具在瀏覽器內解碼與輸出，不經伺服器；檔案可能變大，建議完成後再視需求壓縮。",
    keywords: "JPG轉PNG,線上轉檔,無損,截圖,圖片格式",
  },
  {
    slug: "convert-png-to-webp",
    title: "PNG 轉 WebP｜網站圖檔縮體積",
    description:
      "WebP 常能在保留可接受畫質下縮小體積。若 PNG 含透明，轉 WebP 可保留 Alpha；完成後可再接圖片壓縮或尺寸調整以符合版位。",
    keywords: "PNG轉WebP,透明,網站圖片,線上轉檔",
  },
  {
    slug: "convert-webp-to-png",
    title: "WebP 轉 PNG｜相容性與編輯需求",
    description:
      "部分軟體或表單仍偏好 PNG。將 WebP 轉成 PNG 可在瀏覽器完成，適合需要貼到只支援 PNG 的流程；若原檔有透明，輸出會盡量保留。",
    keywords: "WebP轉PNG,相容,線上轉檔,去背",
  },
  {
    slug: "convert-jpg-to-webp",
    title: "JPG 轉 WebP｜加速網頁載入",
    description:
      "部落格與官網常希望圖檔更小。將 JPG 轉 WebP 可再降低體積；請在轉檔後於實機檢查畫質，並確認目標瀏覽器支援 WebP。",
    keywords: "JPG轉WebP,網站效能,線上轉檔,LCP",
  },
  {
    slug: "convert-webp-to-jpg",
    title: "WebP 轉 JPG｜通用分享與上傳",
    description:
      "需要寄 Email、上傳僅收 JPG 的表單時，可把 WebP 轉成 JPG。透明區域會以白底處理；若需保留透明請改輸出 PNG。",
    keywords: "WebP轉JPG,附件,表單上傳,線上轉檔",
  },
  {
    slug: "png-to-jpg-online",
    title: "PNG 轉 JPG 線上｜免安裝",
    description:
      "免下載軟體即可在瀏覽器將 PNG 轉 JPG。適合臨時交件、公共電腦或不想安裝編輯器的情境；處理完請直接下載並關閉分頁以釋放記憶體。",
    keywords: "PNG to JPG online,線上,免安裝,轉檔",
  },
  {
    slug: "jpg-to-png-online",
    title: "JPG 轉 PNG 線上｜快速產出可編輯圖檔",
    description:
      "線上將 JPG 轉 PNG，方便後續合成或去背流程。注意 PNG 通常比同尺寸的 JPG 大，建議只在真的需要無損或透明時轉檔。",
    keywords: "JPG to PNG online,線上轉檔,去背,設計",
  },
  {
    slug: "png-to-webp-online",
    title: "PNG 轉 WebP 線上｜網站與部落格",
    description:
      "把大型 PNG 轉成 WebP 可改善載入速度。若素材含細線文字，轉檔後請放大檢查邊緣；重要版面可再手動調品質參數。",
    keywords: "PNG to WebP,部落格,網站圖,線上",
  },
  {
    slug: "webp-to-png-online",
    title: "WebP 轉 PNG 線上｜簡報與文書嵌入",
    description:
      "簡報或文書軟體若不吃 WebP，可先轉 PNG 再插入。轉檔在裝置本機瀏覽器完成，檔案不離開你的裝置（依瀏覽器行為為準）。",
    keywords: "WebP to PNG,簡報,線上轉檔,相容",
  },
  {
    slug: "convert-image-to-webp",
    title: "圖片轉 WebP｜多格式輸入",
    description:
      "從 PNG、JPG 等常見格式轉成 WebP，方便統一網站素材。建議建立命名規則（例如同一主視覺多格式）避免混用舊檔。",
    keywords: "轉WebP,圖片格式,網站素材,批次",
  },
  {
    slug: "convert-image-to-png",
    title: "圖片轉 PNG｜保留細節與透明",
    description:
      "需要 PNG 作為中間格式時，可在瀏覽器將 JPG／WebP 等轉出。PNG 不適合追求極小體積，若目標是檔案大小請優先評估 WebP 或 JPG。",
    keywords: "轉PNG,透明,截圖,設計稿",
  },
  {
    slug: "convert-image-to-jpg",
    title: "圖片轉 JPG｜相容與檔案大小",
    description:
      "JPG 適合相片與不需要透明的素材。將其他格式轉 JPG 時請留意透明區域會變白底；若需保留透明請勿選 JPG。",
    keywords: "轉JPG,JPEG,相容,相片",
  },
  {
    slug: "webp-to-jpg-online",
    title: "WebP 轉 JPG 線上｜社群與舊系統",
    description:
      "部分社群舊版或內部系統仍只收 JPG。線上把 WebP 轉 JPG 可快速交件；若出現色偏，請確認螢幕與色彩描述（多為 sRGB）。",
    keywords: "WebP to JPG,線上,社群,上傳",
  },
  {
    slug: "jpg-to-webp-online",
    title: "JPG 轉 WebP 線上｜縮短載入時間",
    description:
      "在相同觀感下，WebP 常比 JPG 更小。轉檔後請在實際頁面環境檢視，並保留原 JPG 備份以便回溯。",
    keywords: "JPG to WebP,效能,線上,網站",
  },
  {
    slug: "png-to-jpg-without-quality-loss",
    title: "PNG 轉 JPG 與「畫質」說明",
    description:
      "JPG 為有損壓縮，嚴格上無法與 PNG 無損完全等價。實務上可透過較高品質係數減少視覺差異；若不能有任何損失請勿轉 JPG。",
    keywords: "PNG,JPG,畫質,有損,轉檔",
  },
  {
    slug: "convert-photo-to-webp",
    title: "相片轉 WebP｜相簿與網站展示",
    description:
      "手機相片多為 JPG／HEIC，若網站要統一成 WebP，可在瀏覽器轉出。注意高解析度相片轉檔較耗記憶體，建議分批處理。",
    keywords: "相片,WebP,相簿,網站,轉檔",
  },
  {
    slug: "convert-webp-for-website",
    title: "網站用 WebP 轉檔｜與備援圖搭配",
    description:
      "前端常需 WebP 搭配 JPG/PNG 備援。此頁說明格式轉換在素材準備的角色；實際 HTML picture 語法請依專案架構設定。",
    keywords: "WebP,網站,picture,效能,轉檔",
  },
  {
    slug: "convert-image-format-online",
    title: "線上圖片格式轉換｜PNG／JPG／WebP",
    description:
      "在瀏覽器完成常見點陣格式互轉，無需安裝軟體。建議先確認目標平台接受的格式與單檔上限，再選擇輸出與後續壓縮流程。",
    keywords: "線上轉檔,圖片格式,PNG,JPG,WebP",
  },
  {
    slug: "image-format-converter",
    title: "圖片格式轉換器｜瀏覽器即轉即下載",
    description:
      "使用 canvas 將像素資料寫成指定 MIME 類型並下載。適合一次性轉檔與小批量；大量檔案建議分批避免分頁卡頓。",
    keywords: "格式轉換,線上工具,canvas,下載",
  },
];

function faqFor(slug, _title) {
  const q2 =
    slug.includes("webp") && slug.includes("png")
      ? {
          q: "WebP 與 PNG 檔案大小差很多嗎？",
          a: "視內容而定：相片類 WebP 常較小；若需要無損或透明且相容性優先，PNG 仍常見。",
        }
      : slug.includes("jpg") || slug.includes("jpeg")
        ? {
            q: "JPG 轉其他格式會變清楚嗎？",
            a: "轉檔無法憑空補回已遺失的細節；若來源已高度壓縮，輸出只改容器格式，畫質不會魔術變好。",
          }
        : {
            q: "為什麼 PNG 轉 JPG 後透明變成白色？",
            a: "JPG 不支援透明通道，轉檔時一般會以白底填滿；若需透明請使用 PNG 或 WebP。",
          };
  return [
    {
      q: "圖片會上傳到伺服器嗎？",
      a: "轉檔在瀏覽器內完成，檔案不會因本工具而刻意上傳至伺服器；仍請避免在公共裝置處理敏感圖片。",
    },
    q2,
    {
      q: "轉完的檔案可以商用嗎？",
      a: "工具僅協助格式轉換，素材版權與授權仍依你擁有的原始檔與使用情境為準。",
    },
  ];
}

function useCasesFor(title) {
  return [
    `${title.split("｜")[0]}：需快速交件、臨時轉檔者。`,
    "與圖片壓縮、尺寸調整搭配：先定格式與版位，再優化體積。",
    "網站與電商：統一輸出 WebP 或 JPG 以利維運。",
  ];
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const existing = new Set(data.map((e) => e.slug));
let added = 0;
for (const s of SLUGS) {
  if (existing.has(s.slug)) continue;
  data.push({
    slug: s.slug,
    tool: "image-convert",
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    faq: faqFor(s.slug, s.title),
    useCases: useCasesFor(s.title),
  });
  added++;
}
fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), "utf8");
console.log("seoPages.json total:", data.length, "added:", added);
