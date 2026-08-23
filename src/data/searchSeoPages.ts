import type { PopularPageItem, RelatedGuideItem } from '@/data/internalLinks';
import {
  getGuideItemsForLanding,
  getPopularItemsForLanding,
  getRelatedToolsForLanding,
} from '@/data/internalLinks';
import type { SeoFaqItem } from '@/data/toolSeoContent';
import { guideArticles, toolLandingPages, type ToolLandingToolKey } from '@/data/toolSeoContent';
import {
  getLandingPreviewByPath,
  getSeoSearchPageBySlug,
  seoPagesSearchIndexablePaths,
  seoPagesSearchSlugSet,
} from '@/data/seoPages';

/** 可索引的站內搜尋主題頁（Programmatic SEO） */
export type SearchSeoPageData = {
  slug: string;
  /** Programmatic SEO（seoPages.json）：以 i18n key 覆寫標題與描述 */
  seoI18n?: { titleKey: string; descKey: string };
  /** 使用者可能輸入的關鍵字意圖（展示用） */
  keyword: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  relatedToolKey: ToolLandingToolKey;
  /** 完整路徑，對應 toolLandingPages */
  relatedLandingPaths: readonly string[];
  /** guideArticles slug */
  relatedGuideSlugs: readonly string[];
  /** 熱門落地頁 path 提示（優先顯示） */
  popularPagePaths: readonly string[];
  faqs: readonly SeoFaqItem[];
  ctaPath: string;
  ctaLabel: string;
};

const P = {
  irIgPost: '/tools/image-resize/instagram-post-size',
  irIgStory: '/tools/image-resize/resize-image-for-instagram-story',
  irYtThumb: '/tools/image-resize/youtube-thumbnail-size',
  irYtThumb2: '/tools/image-resize/resize-image-for-youtube-thumbnail',
  irFb: '/tools/image-resize/facebook-post-size',
  icOnline: '/tools/image-compress/compress-image-online',
  icEmail: '/tools/image-compress/compress-image-for-email',
  icWeb: '/tools/image-compress/compress-image-for-website',
  icReduce: '/tools/image-compress/reduce-image-file-size',
  qrFree: '/tools/qr-code/free-qr-code-generator',
  qrWifi: '/tools/qr-code/wifi-qr-code',
  qrReview: '/tools/qr-code/google-review-qr-code',
  qrReview2: '/tools/qr-code/qr-code-for-google-review',
  qrBc: '/tools/qr-code/business-card-qr-code',
  qrIg: '/tools/qr-code/qr-code-for-instagram',
  qrMenu: '/tools/qr-code/qr-code-for-restaurant-menu',
  aiText: '/tools/ai-summary/ai-text-summarizer',
  aiPdf: '/tools/ai-summary/pdf-summarizer',
  aiYt: '/tools/ai-summary/youtube-video-summarizer',
  aiLong: '/tools/ai-summary/summarize-long-text-online',
  pom: '/tools/productivity/pomodoro-timer-online',
  foc: '/tools/productivity/focus-timer-online',
  studyTimer: '/tools/productivity/distraction-free-study-timer',
  todo: '/tools/productivity/simple-task-list-online',
  hwAi: '/tools/homework-helper/ai-homework-solver',
  hwMath: '/tools/homework-helper/math-homework-solver',
  hwEssay: '/tools/homework-helper/essay-helper-ai',
  hwAns: '/tools/homework-helper/ai-homework-answer-generator',
  docOnline: '/tools/ai-summary/summarize-document-online',
  artSum: '/tools/ai-summary/article-summarizer',
} as const;

function pathsExist(paths: readonly string[]): readonly string[] {
  const set = new Set(toolLandingPages.map((p) => p.path));
  return paths.filter((x) => set.has(x));
}

/** 白名單：僅此列表可索引並進 sitemap */
export const searchSeoWhitelistPages: SearchSeoPageData[] = [
  {
    slug: 'resize-image-for-instagram',
    keyword: 'resize image for instagram',
    seoTitle: '搜尋：Instagram 圖片尺寸與裁切｜RxV',
    metaDescription:
      '整理 IG 貼文、限動與多圖輪播常見尺寸需求，並連到 RxV 圖片尺寸轉換與相關 SEO 落地頁，瀏覽器即可調整寬高。',
    h1: 'Instagram 圖片尺寸：從搜尋找到對應工具',
    intro:
      '搜尋「resize image for instagram」的使用者多半準備上稿或統一素材比例。建議先確認貼文／限動／輪播目標版位，再決定裁切或加邊框；完成後可接圖片壓縮降低上傳時間。',
    relatedToolKey: 'image-resize',
    relatedLandingPaths: pathsExist([P.irIgPost, P.irIgStory, '/tools/image-resize/instagram-reels-size']),
    relatedGuideSlugs: ['instagram-post-size', 'ig-image-size', 'tiktok-cover-size-guide'],
    popularPagePaths: pathsExist([P.irIgPost, P.icOnline, P.qrFree]),
    faqs: [
      { q: '貼文與限動尺寸可以同一張圖嗎？', a: '版位不同，建議分開輸出；直式限動與方形貼文裁切差異大。' },
      { q: '要先壓縮還是先調尺寸？', a: '先裁到目標像素再壓縮，通常較易控制檔案與清晰度。' },
      { q: '多語系帳號要分開素材嗎？', a: '文案可換，尺寸規則通常相同；注意文字安全區。' },
    ],
    ctaPath: '/tools/image-resize',
    ctaLabel: '開啟圖片尺寸轉換',
  },
  {
    slug: 'resize-image-for-youtube',
    keyword: 'resize image for youtube',
    seoTitle: '搜尋：YouTube 縮圖與封面尺寸｜RxV',
    metaDescription:
      '將 YouTube 縮圖、Shorts 封面等搜尋意圖對應到 RxV 尺寸轉換與主題落地頁，減少 16:9 與解析度不符造成的模糊。',
    h1: 'YouTube 圖片尺寸：縮圖與直式封面',
    intro:
      '與 IG 類搜尋不同，YouTube 縮圖以橫式 16:9 為主，重點在字級與安全區；Shorts 則需直式素材。請先決定影片類型再調整輸出像素，避免同一張圖硬套兩種版位。',
    relatedToolKey: 'image-resize',
    relatedLandingPaths: pathsExist([P.irYtThumb, P.irYtThumb2, '/tools/image-resize/youtube-shorts-size']),
    relatedGuideSlugs: ['youtube-thumbnail-size', 'youtube-shorts-size', 'youtube-shorts-cover-guide'],
    popularPagePaths: pathsExist([P.irYtThumb, P.pom, P.aiText]),
    faqs: [
      { q: '縮圖與 Shorts 封面可以共用嗎？', a: '比例不同，不建議；建議分別輸出。' },
      { q: '字太小怎麼辦？', a: '提高主標字級並預留四邊安全區，避免被播放器 UI 遮擋。' },
      { q: '要先去背嗎？', a: '視品牌視覺而定；去背後仍須符合長寬比。' },
    ],
    ctaPath: '/tools/image-resize',
    ctaLabel: '開啟圖片尺寸轉換',
  },
  {
    slug: 'resize-image-for-facebook',
    keyword: 'resize image for facebook',
    seoTitle: '搜尋：Facebook 貼文與封面圖尺寸｜RxV',
    metaDescription:
      '對應 Facebook 貼文、連結預覽與封面等情境，整理 RxV 圖片尺寸轉換入口與相關教學，減少裁切與壓縮來回。',
    h1: 'Facebook 圖片尺寸：貼文與活動素材',
    intro:
      '粉專與社團貼文常見問題為長寬比與文字安全區；若同時投放廣告，後台預覽與自然貼文也可能不同。建議先以貼文主圖為核心輸出，再視需要衍生連結縮圖版本。',
    relatedToolKey: 'image-resize',
    relatedLandingPaths: pathsExist([P.irFb, '/tools/image-resize/facebook-cover-size', '/tools/image-resize/facebook-post-size']),
    relatedGuideSlugs: ['facebook-post-image-size', 'instagram-post-size', 'linkedin-post-image-guide'],
    popularPagePaths: pathsExist([P.irFb, P.icOnline, P.qrFree]),
    faqs: [
      { q: '連結貼文與單圖貼文差異？', a: '預覽區塊不同，建議分別截圖測試再定稿。' },
      { q: '活動封面與一般貼文？', a: '版位可能不同，請以建立活動時的預覽為準。' },
      { q: '檔案太大無法上傳？', a: '完成尺寸後可改以圖片壓縮工具降低 KB。' },
    ],
    ctaPath: '/tools/image-resize',
    ctaLabel: '開啟圖片尺寸轉換',
  },
  {
    slug: 'compress-image',
    keyword: 'compress image',
    seoTitle: '搜尋：線上壓縮圖片（通用）｜RxV',
    metaDescription:
      '將「compress image」搜尋意圖導向 RxV 圖片壓縮與常見格式說明，適合表單、網站與社群附檔快速瘦身。',
    h1: '壓縮圖片：線上縮小 JPG／PNG／WebP',
    intro:
      '此頁對應「壓縮圖片」的通用搜尋：先確認用途（網頁、社群或 Email），再選擇可接受的畫質與格式。RxV 在瀏覽器內處理常見點陣圖，適合快速試壓與單次上傳前檢查。',
    relatedToolKey: 'image-compress',
    relatedLandingPaths: pathsExist([P.icOnline, P.icEmail, P.icWeb]),
    relatedGuideSlugs: ['how-to-compress-images', 'jpg-vs-png-difference', 'compress-image-large-files'],
    popularPagePaths: pathsExist([P.icOnline, P.irIgPost, P.qrFree]),
    faqs: [
      { q: '壓縮與改尺寸哪個先？', a: '多數情境先對齊顯示所需長邊，再壓縮，效率較佳。' },
      { q: 'RAW 能直接壓嗎？', a: '通常需先匯出為 JPG／PNG 再壓縮。' },
      { q: '可以批次嗎？', a: '依裝置效能與工具支援而定；重點是每張都符合平台上限。' },
    ],
    ctaPath: '/tools/image-compress',
    ctaLabel: '開啟圖片壓縮',
  },
  {
    slug: 'compress-image-for-email',
    keyword: 'compress image for email',
    seoTitle: '搜尋：Email 附圖與內嵌圖壓縮｜RxV',
    metaDescription:
      '針對信件內嵌圖與附件的檔案大小，連結 RxV 壓縮流程與 Email 情境落地頁，降低整封信體積與開信卡頓。',
    h1: 'Email 用圖壓縮：內嵌與附件策略',
    intro:
      '與「一般壓縮圖片」相比，此頁強調「整封信體積」與收件匣載入：內嵌圖應對齊實際顯示寬度，必要時改附件並在內文放較小預覽。請在主流信箱各測一次載入與清晰度。',
    relatedToolKey: 'image-compress',
    relatedLandingPaths: pathsExist([P.icEmail, P.icOnline, '/tools/image-compress/compress-image-for-thumbnail']),
    relatedGuideSlugs: ['how-to-compress-images', 'website-image-speed-optimization', 'compress-image-large-files'],
    popularPagePaths: pathsExist([P.icEmail, P.aiText, P.pom]),
    faqs: [
      { q: '內嵌與附件哪個好？', a: '內嵌利於排版預覽；附件利於保留較高品質原檔。' },
      { q: 'Retina 螢幕要 2x 內嵌嗎？', a: '可適度，但需監控整信大小。' },
      { q: '會不會進垃圾信？', a: '體積只是因素之一，內容與寄件信譽亦重要。' },
    ],
    ctaPath: '/tools/image-compress',
    ctaLabel: '開啟圖片壓縮',
  },
  {
    slug: 'compress-image-for-website',
    keyword: 'compress image for website',
    seoTitle: '搜尋：網站用圖壓縮與載入速度｜RxV',
    metaDescription:
      '對應網站首屏、文章與電商列表圖的壓縮需求，連結 RxV 圖片壓縮與速度相關教學，協助降低 KB 與請求成本。',
    h1: '網站用圖壓縮：首屏與列表縮圖',
    intro:
      '此搜尋意圖偏「網站效能」：除了壓縮，還需對齊實際顯示像素，避免只縮檔但仍下載過大寬度。建議搭配瀑布圖找出最大資產，再為首屏與列表訂單張 KB 上限。',
    relatedToolKey: 'image-compress',
    relatedLandingPaths: pathsExist([P.icWeb, '/tools/image-compress/compress-image-for-website-speed', P.icOnline]),
    relatedGuideSlugs: ['website-image-speed-optimization', 'how-to-compress-images', 'ecommerce-image-prep-guide'],
    popularPagePaths: pathsExist([P.icWeb, P.irIgPost, P.qrFree]),
    faqs: [
      { q: 'WebP 一定要上嗎？', a: '視受眾瀏覽器與維運成本；漸進導入較穩。' },
      { q: 'CDN 與壓縮的順序？', a: '源頭壓縮仍重要；CDN 主要加速傳遞而非取代最佳化。' },
      { q: '和 Email 情境差異？', a: '網站常需響應式多組寬度；Email 以單一版型為主。' },
    ],
    ctaPath: '/tools/image-compress',
    ctaLabel: '開啟圖片壓縮',
  },
  {
    slug: 'reduce-image-file-size',
    keyword: 'reduce image file size',
    seoTitle: '搜尋：縮小圖檔 KB／MB（Reduce file size）｜RxV',
    metaDescription:
      '聚焦「降低檔案大小」與像素、格式的關係，連結 reduce-image-file-size 落地頁與 RxV 壓縮工具，適合表單與雲端上傳限制。',
    h1: '縮小圖檔大小：像素與壓縮的取捨',
    intro:
      '與「compress image」通用頁不同，此頁對應「reduce file size」：先釐清是否像素過剩（例如上傳寬 4000px 但版面只顯示 800px）。若尺寸已合理仍過大，再提高壓縮率或改格式。',
    relatedToolKey: 'image-compress',
    relatedLandingPaths: pathsExist([P.icReduce, P.icOnline, '/tools/image-compress/compress-image-under-1mb']),
    relatedGuideSlugs: ['compress-image-large-files', 'how-to-compress-images', 'jpg-vs-png-difference'],
    popularPagePaths: pathsExist([P.icReduce, P.irIgPost, P.aiText]),
    faqs: [
      { q: '只壓縮不縮尺寸可以嗎？', a: '可以，但若像素遠大於展示需求，先縮尺寸更有效。' },
      { q: '向量也要壓？', a: 'SVG 另有最佳化；點陣才用一般圖片壓縮。' },
      { q: '和「壓縮圖片」頁重複嗎？', a: '該頁偏操作入口；本頁強調檔案大小的成因與順序。' },
    ],
    ctaPath: '/tools/image-compress',
    ctaLabel: '開啟圖片壓縮',
  },
  {
    slug: 'image-resize-tool',
    keyword: 'image resize tool',
    seoTitle: '搜尋：圖片尺寸轉換工具｜RxV',
    metaDescription:
      '將 image resize tool 搜尋意圖導向 RxV 圖片尺寸轉換與社群常見版位落地頁，線上調整寬高、比例與匯出。',
    h1: '圖片尺寸工具：線上調整寬高與比例',
    intro:
      '此頁服務「找工具」型搜尋：先決定目標平台或版位，再在工具內設定對應寬高或比例。RxV 以瀏覽器完成，適合臨時上稿與批次前的單張試作。',
    relatedToolKey: 'image-resize',
    relatedLandingPaths: pathsExist([P.irIgPost, P.irYtThumb, P.irFb]),
    relatedGuideSlugs: ['instagram-post-size', 'youtube-thumbnail-size', 'facebook-post-image-size'],
    popularPagePaths: pathsExist([P.irIgPost, P.icOnline, P.qrFree]),
    faqs: [
      { q: '會破壞比例嗎？', a: '可選擇鎖定比例裁切或加邊框，依工具選項而定。' },
      { q: '要先旋轉再裁切嗎？', a: '建議先轉正再裁，構圖較準確。' },
      { q: '與壓縮工具差異？', a: '尺寸調整與檔案瘦身是兩件事，可接力使用。' },
    ],
    ctaPath: '/tools/image-resize',
    ctaLabel: '開啟圖片尺寸轉換',
  },
  {
    slug: 'image-compress-tool',
    keyword: 'image compress tool',
    seoTitle: '搜尋：圖片壓縮工具｜RxV',
    metaDescription:
      '對應尋找 image compress tool 的使用者，提供 RxV 線上壓縮與格式選擇說明，快速縮小 JPG／PNG／WebP。',
    h1: '圖片壓縮工具：線上縮小檔案',
    intro:
      '與尺寸工具不同，壓縮工具在像素不變下盡量降低 KB。若來源檔遠大於畫面需求，建議先評估是否需縮小長邊再壓縮，避免徒勞反覆試。',
    relatedToolKey: 'image-compress',
    relatedLandingPaths: pathsExist([P.icOnline, P.icReduce, '/tools/image-compress/compress-jpg-online']),
    relatedGuideSlugs: ['how-to-compress-images', 'compress-image-large-files', 'jpg-vs-png-difference'],
    popularPagePaths: pathsExist([P.icOnline, P.irIgPost, P.pom]),
    faqs: [
      { q: '壓縮會影響列印嗎？', a: '螢幕用與印刷用應分開檔案；印刷需較高解析。' },
      { q: '可以只壓一張試試嗎？', a: '建議先試壓再決定批次參數。' },
      { q: '與 resize 工具差異？', a: 'resize 改像素；compress 在既定像素下降低體積。' },
    ],
    ctaPath: '/tools/image-compress',
    ctaLabel: '開啟圖片壓縮',
  },
  {
    slug: 'line-sticker-size',
    keyword: 'line sticker size',
    seoTitle: '搜尋：LINE 貼圖尺寸與上架整理｜RxV',
    metaDescription:
      '連結 LINE 貼圖主圖、標籤與上架前整理流程，以及 RxV 貼圖工具與尺寸教學，降低審核與匯出錯誤。',
    h1: 'LINE 貼圖尺寸：主圖、標籤與打包',
    intro:
      '貼圖主圖與標籤圖像素不同，需分開匯出與檢查；上架前亦常需壓縮預覽圖。請以官方最新規格為準，並用工具頁批次檢查檔名與尺寸。',
    relatedToolKey: 'image-resize',
    relatedLandingPaths: pathsExist([P.irIgPost, P.icOnline, '/tools/image-resize/instagram-post-size']),
    relatedGuideSlugs: ['line-sticker-size', 'how-to-compress-images', 'ig-image-size'],
    popularPagePaths: pathsExist([P.icOnline, P.qrFree, P.irIgPost]),
    faqs: [
      { q: '主圖與標籤可以同一張嗎？', a: '不行，像素與用途不同，需分開輸出。' },
      { q: '動態貼圖？', a: '動態與靜態規格不同；請以官方指南為準。' },
      { q: '要先壓縮嗎？', a: '預覽與素材常需控制檔案大小，可適度壓縮。' },
    ],
    ctaPath: '/tools/line-sticker',
    ctaLabel: '開啟 LINE 貼圖整理',
  },

  {
    slug: 'qr-code-generator',
    keyword: 'qr code generator',
    seoTitle: '搜尋：QR Code 產生器｜RxV',
    metaDescription:
      '將 qr code generator 搜尋導向 RxV 免費產生器與 WiFi／名片等情境頁，快速輸出可掃描圖檔。',
    h1: 'QR Code 產生器：網址與文字成碼',
    intro:
      '此頁對應「找產生器」的通用搜尋：請先準備好 HTTPS 連結或要編碼的文字，再選擇錯誤修正與輸出尺寸。列印前務必用實機掃描確認。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrFree, P.qrWifi, P.qrReview]),
    relatedGuideSlugs: ['qr-code-business-usage', 'qr-code-with-logo', 'wifi-qr-code-how-to'],
    popularPagePaths: pathsExist([P.qrFree, P.irIgPost, P.icOnline]),
    faqs: [
      { q: '靜態與動態差異？', a: '靜態內容直接編碼於圖中；動態常搭配短網址可改後台指向。' },
      { q: '可以改顏色嗎？', a: '需保留對比與邊距，避免難掃描。' },
      { q: '下載格式？', a: '常見為 PNG／SVG；依印刷或網頁需求選擇。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'free-qr-code-generator',
    keyword: 'free qr code generator',
    seoTitle: '搜尋：免費 QR Code 產生｜RxV',
    metaDescription:
      '對應「免費」關鍵字的 QR 產生需求，連結 RxV 免費產生器落地頁與實務教學，快速下載圖檔。',
    h1: '免費 QR Code 產生：線上成碼與下載',
    intro:
      '與泛用「產生器」搜尋相比，此頁強調「免費、可立即下載」：仍請確認連結為官方網域、內容可長期維護，避免短網址失效導致 QR 失效。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrFree, P.qrWifi, P.qrBc]),
    relatedGuideSlugs: ['qr-code-with-logo', 'qr-code-business-usage', 'line-qa-quick-share-with-qr'],
    popularPagePaths: pathsExist([P.qrFree, P.qrWifi, P.aiText]),
    faqs: [
      { q: '免費會加浮水印嗎？', a: '依產品為準；RxV 以可讀性與下載便利為主。' },
      { q: '商用可以嗎？', a: '請依服務條款與內容權利自行確認。' },
      { q: '與付費差在哪？', a: '付費方案常含管理、追蹤或大量產製；單次導流免費工具通常足夠。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'qr-code-for-wifi',
    keyword: 'qr code for wifi',
    seoTitle: '搜尋：WiFi QR（店內連線）｜RxV',
    metaDescription:
      '說明店內、活動與民宿等場景的 WiFi QR：訪客掃描連線、減少口頭拼字，並連結 RxV WiFi 落地頁。',
    h1: 'WiFi QR Code：店內與活動現場連線',
    intro:
      '此頁對應「給客人連 WiFi」的情境：重點在 SSID／加密類型／密碼正確，以及現場展示位置與光線。若密碼變更，需同步更新 QR 圖檔。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrWifi, '/tools/qr-code/wifi-qr-code-cafe', P.qrFree]),
    relatedGuideSlugs: ['wifi-qr-code-how-to', 'qr-code-business-usage', 'qr-code-with-logo'],
    popularPagePaths: pathsExist([P.qrWifi, P.qrFree, P.irIgPost]),
    faqs: [
      { q: '會洩漏密碼嗎？', a: '掃碼等同取得密碼；僅建議可信任場域或訪客 SSID。' },
      { q: '5G／2.4G？', a: '可產兩張或註明頻段，依現場相容性。' },
      { q: '與「產生器」頁差異？', a: '本頁強調店內連線流程；產生器頁較偏通用成碼。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'qr-code-for-google-review',
    keyword: 'qr code for google review',
    seoTitle: '搜尋：Google 評論 QR（店內邀評）｜RxV',
    metaDescription:
      '將 Google 商家評論連結製成 QR，放在櫃台與收據；連結 RxV 評論情境落地頁與注意事項。',
    h1: 'Google 評論 QR：引導顧客留評',
    intro:
      '與「google review qr code」詞組略有不同，此頁對應「for google review」的意圖：請先取得正確評論連結，再產 QR；並遵守平台邀評規範，避免不當利誘。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrReview2, P.qrReview, P.qrFree]),
    relatedGuideSlugs: ['qr-code-business-usage', 'wifi-qr-code-how-to', 'line-qa-quick-share-with-qr'],
    popularPagePaths: pathsExist([P.qrReview2, P.qrMenu, P.icOnline]),
    faqs: [
      { q: '連結從哪來？', a: '請至 Google 商家後台取得可分享之評論連結（以官方流程為準）。' },
      { q: '未登入看得到嗎？', a: '留評通常需登入；請在店內提供網路協助。' },
      { q: '與另一個評論搜尋頁差異？', a: '語意接近；可依站內導覽擇一閱讀後進工具。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'qr-code-for-business-card',
    keyword: 'qr code for business card',
    seoTitle: '搜尋：名片 QR Code｜RxV',
    metaDescription:
      '名片與文宣上的 QR：連結官網、電子郵件或作品集，並參考 RxV 名片情境落地頁與印刷尺寸建議。',
    h1: '名片 QR Code：線上連結與印刷',
    intro:
      '名片版面有限，QR 應保留足夠留白與對比；連結請用 HTTPS 並在印刷前多機掃描測試。若需追蹤成效，可評估短網址與 UTM（與工具相容時）。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrBc, P.qrFree, P.qrIg]),
    relatedGuideSlugs: ['qr-code-with-logo', 'qr-code-business-usage', 'linkedin-post-image-guide'],
    popularPagePaths: pathsExist([P.qrBc, P.qrFree, P.aiText]),
    faqs: [
      { q: '要印多大？', a: '需依名片版面與掃描距離調整，避免過小。' },
      { q: '可以放 Logo 在碼中嗎？', a: '若工具支援，需確保可掃描性。' },
      { q: '多個 QR 會不會太擠？', a: '可改單一落地頁再分流。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'qr-code-for-instagram',
    keyword: 'qr code for instagram',
    seoTitle: '搜尋：Instagram 導流 QR｜RxV',
    metaDescription:
      '將 IG 個人檔案或貼文連結製成 QR，用於名片、海報與店面；連結 RxV IG 情境落地頁。',
    h1: 'Instagram QR：追蹤與活動導流',
    intro:
      '實體活動難以口述帳號名稱，QR 可一掃到達。請使用官方分享連結（https），並確認帳號為公開或活動目標可讀。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrIg, P.qrFree, '/tools/qr-code/qr-code-for-facebook-page']),
    relatedGuideSlugs: ['ig-image-size', 'instagram-post-size', 'qr-code-business-usage'],
    popularPagePaths: pathsExist([P.qrIg, P.irIgPost, P.icOnline]),
    faqs: [
      { q: '私人帳號？', a: '掃碼者需具備存取權限。' },
      { q: '改名影響？', a: '若使用帳號網址，改名可能影響，請重新確認。' },
      { q: '與 FB 分開？', a: '連結不同，請分開產生。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'qr-code-for-restaurant-menu',
    keyword: 'qr code for restaurant menu',
    seoTitle: '搜尋：餐廳菜單 QR｜RxV',
    metaDescription:
      '菜單與點餐頁 QR：桌邊掃描、價格更新與印刷建議，連結 RxV 餐廳情境落地頁與教學。',
    h1: '餐廳菜單 QR：桌邊掃描與更新',
    intro:
      '紙本菜單改版成本高，QR 指向線上菜單可隨時更新。請使用 HTTPS、在弱光環境加大印刷對比，並培訓店員協助長者操作。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrMenu, P.qrFree, P.qrWifi]),
    relatedGuideSlugs: ['qr-code-business-usage', 'wifi-qr-code-how-to', 'line-qa-quick-share-with-qr'],
    popularPagePaths: pathsExist([P.qrMenu, P.qrReview2, P.icOnline]),
    faqs: [
      { q: '要動態 QR 嗎？', a: '若常改價且可接受短網址，可評估。' },
      { q: '不會掃怎麼辦？', a: '保留紙本或人工點餐。' },
      { q: '多店多 QR？', a: '可分區或帶參數，依營運需求。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'qr-code-with-logo',
    keyword: 'qr code with logo',
    seoTitle: '搜尋：含 Logo 的 QR Code｜RxV',
    metaDescription:
      '品牌 QR 與 Logo 同時呈現的注意事項：對比、邊距與可掃描性，並連結教學與 RxV 產生器。',
    h1: '帶 Logo 的 QR Code：品牌與可讀性',
    intro:
      '與純連結 QR 相比，置入 Logo 需更保守的錯誤修正與留白；請避免細線條與低對比配色，並以多款手機實測掃描距離。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrFree, P.qrBc, P.qrReview]),
    relatedGuideSlugs: ['qr-code-with-logo', 'qr-code-business-usage', 'instagram-post-size'],
    popularPagePaths: pathsExist([P.qrFree, P.qrIg, P.icOnline]),
    faqs: [
      { q: 'Logo 可以放中間嗎？', a: '依工具支援與錯誤修正等級；務必實測掃描。' },
      { q: '與一般 QR 差異？', a: '本頁強調品牌呈現與對比風險。' },
      { q: '向量檔輸出？', a: '印刷建議使用足夠解析度或向量格式。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'wifi-qr-code-generator',
    keyword: 'wifi qr code generator',
    seoTitle: '搜尋：WiFi QR 產生器（設定 SSID）｜RxV',
    metaDescription:
      '對應「產生器」角度的 WiFi QR：輸入 SSID、加密與密碼產出圖檔，與店內展示情境分開說明。',
    h1: 'WiFi QR 產生器：SSID 與加密設定',
    intro:
      '與「qr code for wifi」相比，此頁偏「工具操作」：先向路由器管理介面確認 SSID／加密方式／密碼，再於產生器輸入並下載；列印後請在現場實測掃描。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrWifi, P.qrFree, '/tools/qr-code/wifi-qr-code-cafe']),
    relatedGuideSlugs: ['wifi-qr-code-how-to', 'qr-code-with-logo', 'qr-code-business-usage'],
    popularPagePaths: pathsExist([P.qrWifi, P.qrFree, P.qrBc]),
    faqs: [
      { q: 'WPA3 支援？', a: '依路由器與手機為準；產生器內選項請對齊實際設定。' },
      { q: '與店內 WiFi 頁差異？', a: '該頁偏場景；本頁偏產生步驟與參數。' },
      { q: '密碼變更？', a: '需重新產生並替換展示圖。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },
  {
    slug: 'google-review-qr-code',
    keyword: 'google review qr code',
    seoTitle: '搜尋：Google 評論 QR（關鍵字詞組）｜RxV',
    metaDescription:
      '以「google review qr code」詞組整理評論連結製碼、櫃台展示與法遵提醒，連結 RxV 落地頁。',
    h1: 'Google 評論 QR Code：評論連結製碼',
    intro:
      '與「qr code for google review」語序不同，搜尋意圖相近：此頁再強調「評論連結正確性」與多機測試，避免分店或帳號整合後連結失效。',
    relatedToolKey: 'qr-code',
    relatedLandingPaths: pathsExist([P.qrReview, P.qrReview2, P.qrFree]),
    relatedGuideSlugs: ['qr-code-business-usage', 'wifi-qr-code-how-to', 'summarize-long-article'],
    popularPagePaths: pathsExist([P.qrReview, P.qrMenu, P.aiText]),
    faqs: [
      { q: '與另一個評論搜尋頁差異？', a: '主題相同；本站提供不同語序的索引入口。' },
      { q: '可以追蹤掃描嗎？', a: '靜態 QR 無內建統計；可改用可追蹤短網址。' },
      { q: '需要審稿嗎？', a: '請遵守 Google 邀評與公平交易相關規範。' },
    ],
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
  },

  {
    slug: 'ai-summary-tool',
    keyword: 'ai summary tool',
    seoTitle: '搜尋：AI 摘要工具總覽｜RxV',
    metaDescription:
      '將 ai summary tool 搜尋導向 RxV AI 摘要與文字／PDF／影片等主題落地頁，快速開始貼上長文。',
    h1: 'AI 摘要工具：長文與筆記濃縮',
    intro:
      '此頁對應「找摘要工具」的泛搜：先確認資料是否可貼上（隱私合規），再分段落摘要；不同檔案類型（PDF、逐字稿）可改看對應專題頁。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiText, P.aiPdf, P.aiYt]),
    relatedGuideSlugs: ['ai-summary-best-practices', 'summarize-long-article', 'pdf-summary-how-to'],
    popularPagePaths: pathsExist([P.aiText, P.pom, P.icOnline]),
    faqs: [
      { q: '可以取代專業判斷嗎？', a: '摘要僅輔助，請人工核對關鍵數字與法條。' },
      { q: '與 PDF 專題頁差異？', a: '該頁偏文件；本頁為工具入口總覽。' },
      { q: '支援多語？', a: '依工具與模型為準；專有名詞請人工校正。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },
  {
    slug: 'ai-text-summarizer',
    keyword: 'ai text summarizer',
    seoTitle: '搜尋：AI 文字摘要｜RxV',
    metaDescription:
      '針對純文字長文與信件，連結 ai-text-summarizer 落地頁與最佳實踐教學，快速取得重點與待辦。',
    h1: 'AI 文字摘要：長文與信件',
    intro:
      '與「工具總覽」頁不同，此頁聚焦「純文字」：適合文章、說明文與信件串。建議先刪減隱私欄位，再分章節摘要並自行核對引用。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiText, P.artSum, P.aiLong]),
    relatedGuideSlugs: ['summarize-long-article', 'ai-summary-best-practices', 'pdf-summary-how-to'],
    popularPagePaths: pathsExist([P.aiText, P.aiPdf, P.pom]),
    faqs: [
      { q: '一次貼很長可以嗎？', a: '可依工具限制分段；長文建議先切段再摘要。' },
      { q: '和 PDF 摘要差異？', a: 'PDF 頁偏文件結構；本頁偏純文字輸入。' },
      { q: '要提供摘要格式嗎？', a: '可在提示中指定條列、三句話或一頁備忘。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },
  {
    slug: 'pdf-summary-tool',
    keyword: 'pdf summary tool',
    seoTitle: '搜尋：PDF 摘要工具｜RxV',
    metaDescription:
      '將 PDF 閱讀與摘要需求導向 RxV pdf summarizer 落地頁與 PDF 教學，整理重點與引用注意事項。',
    h1: 'PDF 摘要：文件與論文閱讀',
    intro:
      '與文字摘要、影片摘要不同，PDF 情境常含目錄、圖表與註腳：建議先說明閱讀目的（考試、審稿、法遵），再請摘要對應章節並保留引用線索。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiPdf, P.aiText, P.docOnline]),
    relatedGuideSlugs: ['pdf-summary-how-to', 'pdf-summary-method', 'ai-summary-best-practices'],
    popularPagePaths: pathsExist([P.aiPdf, P.aiYt, P.hwAi]),
    faqs: [
      { q: '可以取代論文閱讀嗎？', a: '不可；摘要僅輔助，實驗與方法仍需讀原文。' },
      { q: '掃描 PDF？', a: '辨識品質影響結果；若為圖片型需先 OCR。' },
      { q: '與 YouTube 摘要差異？', a: '該頁偏逐字稿／影片；本頁偏文件結構。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },
  {
    slug: 'youtube-summary-tool',
    keyword: 'youtube summary tool',
    seoTitle: '搜尋：YouTube 影片摘要｜RxV',
    metaDescription:
      '對應影片逐字稿與重點整理，連結 youtube-video-summarizer 落地頁與相關教學，節省觀影時間。',
    h1: 'YouTube 摘要：影片與逐字稿',
    intro:
      '與 PDF／純文字不同，影片摘要需處理口語、重複與時間軸：建議先取得可合法使用的文字稿或重點段落，再請摘要成筆記與待辦。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiYt, P.aiText, P.aiLong]),
    relatedGuideSlugs: ['ai-summary-best-practices', 'summarize-long-article', 'youtube-thumbnail-size'],
    popularPagePaths: pathsExist([P.aiYt, P.aiPdf, P.pom]),
    faqs: [
      { q: '可以摘要別人影片嗎？', a: '請尊重著作權與平台使用條款，僅在合法範圍內整理。' },
      { q: '沒有逐字稿？', a: '可先手動記錄時間點重點再摘要。' },
      { q: '與 PDF 摘要差異？', a: '本頁偏口語與時間序；PDF 頁偏章節結構。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },
  {
    slug: 'summarize-long-article',
    keyword: 'summarize long article',
    seoTitle: '搜尋：長篇文章摘要｜RxV',
    metaDescription:
      '長文與報導的分段摘要策略，連結 summarize-long-text 系列落地頁與長文教學，降低一次讀完的倦怠。',
    h1: '長篇文章摘要：分段與合併',
    intro:
      '超長文章建議「分段微摘要 → 合併成全局摘要」，並統一人名與術語。此流程與單次貼上全文不同，較能維持結構與降低遺漏。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiLong, P.aiText, '/tools/ai-summary/summarize-long-text']),
    relatedGuideSlugs: ['summarize-long-article', 'ai-summary-best-practices', 'pdf-summary-how-to'],
    popularPagePaths: pathsExist([P.aiLong, P.aiPdf, P.pom]),
    faqs: [
      { q: '為什麼要分段？', a: '一次貼全文可能超過限制或漏掉中段重點。' },
      { q: '新聞長稿適用？', a: '適用；請注意來源可信度與引用。' },
      { q: '與短摘要差異？', a: '本頁強調長文工作流，非單段摘要。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },
  {
    slug: 'summarize-pdf',
    keyword: 'summarize pdf',
    seoTitle: '搜尋：摘要 PDF 內容｜RxV',
    metaDescription:
      '以「summarize pdf」關鍵字連結 PDF 摘要與文件重點整理流程，搭配 RxV 工具與教學。',
    h1: '摘要 PDF：重點與引用',
    intro:
      '此頁對應英文關鍵字「summarize pdf」：操作上與中文「PDF 摘要工具」相近，但讀者可能更在意「引用／抄襲」與學術規範，請務必保留原始出處並人工核對。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiPdf, P.aiText, '/tools/ai-summary/summarize-document-online']),
    relatedGuideSlugs: ['pdf-summary-how-to', 'pdf-summary-method', 'summarize-long-article'],
    popularPagePaths: pathsExist([P.aiPdf, P.aiYt, P.hwAi]),
    faqs: [
      { q: '與 pdf-summary-tool 頁重複嗎？', a: '主題相近；本站提供不同語系/語序的索引入口。' },
      { q: '可以貼密件嗎？', a: '請勿貼上含個資或機密內容；遵守公司政策。' },
      { q: '數學公式？', a: '摘要可能簡化符號；請以原文為準。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },
  {
    slug: 'summarize-youtube-video',
    keyword: 'summarize youtube video',
    seoTitle: '搜尋：摘要 YouTube 影片｜RxV',
    metaDescription:
      '以「summarize youtube video」連結影片摘要落地頁與注意事項，協助整理教學與訪談重點。',
    h1: '摘要 YouTube 影片：重點與時間軸',
    intro:
      '與「youtube summary tool」工具導向不同，此頁偏英文搜尋語句：同樣提醒來源合法性，並建議以時間戳記組織重點，方便回頭找片段。',
    relatedToolKey: 'ai-summary',
    relatedLandingPaths: pathsExist([P.aiYt, P.aiText, P.aiLong]),
    relatedGuideSlugs: ['ai-summary-best-practices', 'summarize-long-article', 'youtube-thumbnail-size'],
    popularPagePaths: pathsExist([P.aiYt, P.aiPdf, P.foc]),
    faqs: [
      { q: '與 youtube summary tool 差異？', a: '資訊類似；可依習慣選擇入口。' },
      { q: '直播回放？', a: '逐字稿可能很長，建議分段摘要。' },
      { q: '可以轉貼摘要嗎？', a: '請尊重原創與引用規範。' },
    ],
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
  },

  {
    slug: 'pomodoro-timer-online',
    keyword: 'pomodoro timer online',
    seoTitle: '搜尋：線上番茄鐘｜RxV',
    metaDescription:
      '將 pomodoro timer online 導向 RxV 線上番茄鐘與工作節奏說明，25 分鐘專注＋短休息。',
    h1: '線上番茄鐘：工作與讀書節奏',
    intro:
      '此頁對應「番茄鐘」方法：預設 25 分鐘專注與 5 分鐘休息，可依專案調整。與「專注計時」相比，番茄鐘更強調固定輪次與休息儀式。',
    relatedToolKey: 'productivity',
    relatedLandingPaths: pathsExist([P.pom, '/tools/productivity/pomodoro-timer-for-work', '/tools/productivity/pomodoro-timer-for-studying']),
    relatedGuideSlugs: ['meeting-notes-to-action-summary', 'homework-solution-step-by-step', 'ai-summary-best-practices'],
    popularPagePaths: pathsExist([P.pom, P.foc, P.aiText]),
    faqs: [
      { q: '一定要 25 分鐘嗎？', a: '可依專注習慣微調，但避免過長導致疲勞。' },
      { q: '與專注計時差異？', a: '番茄鐘偏固定輪次；專注計時可單次長跑。' },
      { q: '可以開聲音提醒嗎？', a: '依瀏覽器與裝置通知權限而定。' },
    ],
    ctaPath: '/pomodoro',
    ctaLabel: '開啟番茄鐘',
  },
  {
    slug: 'focus-timer-online',
    keyword: 'focus timer online',
    seoTitle: '搜尋：線上專注計時（深度工作）｜RxV',
    metaDescription:
      '對應 focus timer online：較長單次專注與深度工作情境，連結 RxV 專注計時落地頁與效率主題。',
    h1: '線上專注計時：深度工作與長單元',
    intro:
      '與番茄鐘不同，專注計時常見於「一次 50～90 分鐘」的深度工作；請搭配關通知、單一任務與清楚結束條件，避免無限延長。',
    relatedToolKey: 'productivity',
    relatedLandingPaths: pathsExist([P.foc, '/tools/productivity/focus-timer-for-deep-work', P.pom]),
    relatedGuideSlugs: ['ai-summary-best-practices', 'meeting-notes-to-action-summary', 'summarize-long-article'],
    popularPagePaths: pathsExist([P.foc, P.pom, P.todo]),
    faqs: [
      { q: '與番茄鐘差異？', a: '番茄鐘強調輪次；本頁偏長單元深度工作。' },
      { q: '中途被打斷？', a: '可記錄中斷原因並下次改善環境。' },
      { q: '需要待辦清單嗎？', a: '建議搭配，避免專注時不知下一步。' },
    ],
    ctaPath: '/pomodoro',
    ctaLabel: '開啟專注計時',
  },
  {
    slug: 'simple-todo-list',
    keyword: 'simple todo list',
    seoTitle: '搜尋：簡易待辦清單（線上）｜RxV',
    metaDescription:
      '將 simple todo list 導向 RxV 待辦與任務拆解，搭配番茄鐘與摘要工具，快速列出今日三件事。',
    h1: '簡易待辦清單：線上勾選與拆解',
    intro:
      '與計時工具不同，此頁對應「清單」需求：先把任務寫成可勾選項目，再決定哪幾項用番茄鐘或專注計時完成；避免只計時卻沒有清單導向。',
    relatedToolKey: 'productivity',
    relatedLandingPaths: pathsExist([P.todo, '/tools/productivity/task-planner-for-work', '/tools/productivity/daily-task-manager']),
    relatedGuideSlugs: ['meeting-notes-to-action-summary', 'homework-solution-step-by-step', 'ai-summary-best-practices'],
    popularPagePaths: pathsExist([P.todo, P.pom, P.aiText]),
    faqs: [
      { q: '要分專案嗎？', a: '可先從今日三件事開始，再漸進分類。' },
      { q: '與番茄鐘差異？', a: '清單管任務；番茄鐘管時間區塊。' },
      { q: '可以匯出嗎？', a: '依工具功能為準。' },
    ],
    ctaPath: '/todo',
    ctaLabel: '開啟待辦清單',
  },
  {
    slug: 'ai-homework-helper',
    keyword: 'ai homework helper',
    seoTitle: '搜尋：AI 作業協助｜RxV',
    metaDescription:
      '將 ai homework helper 導向 RxV 作業解題助手與安全使用教學，協助步驟化與觀念釐清。',
    h1: 'AI 作業協助：步驟化解題',
    intro:
      '此頁對應英文搜尋：仍請以學習為目的，要求推理步驟與檢查方向，而非直接抄答案。可搭配摘要整理講義後再解題。',
    relatedToolKey: 'homework-helper',
    relatedLandingPaths: pathsExist([P.hwAi, P.hwAns, '/tools/homework-helper/ai-study-helper']),
    relatedGuideSlugs: ['student-homework-ai-tools', 'ai-homework-safety-guide', 'homework-solution-step-by-step'],
    popularPagePaths: pathsExist([P.hwAi, P.aiText, P.pom]),
    faqs: [
      { q: '可以上傳整份考卷嗎？', a: '請留意隱私與學校規範；建議遮罩個資。' },
      { q: '與數學專頁差異？', a: '數學頁更偏題型；本頁為英文泛搜入口。' },
      { q: '要開引用嗎？', a: '寫作與申論請依科任要求標註來源。' },
    ],
    ctaPath: '/tools/homework-helper',
    ctaLabel: '開啟作業解題助手',
  },
  {
    slug: 'math-homework-solver',
    keyword: 'math homework solver',
    seoTitle: '搜尋：數學作業解題｜RxV',
    metaDescription:
      '對應數學科搜尋，連結 math-homework-solver 落地頁與解題安全提醒，強調驗算與觀念。',
    h1: '數學作業解題：驗算與觀念',
    intro:
      '與泛用「作業協助」不同，此頁聚焦數學：請要求展示步驟、單位與定義域檢查，並用另一種方法驗算；避免只看答案。',
    relatedToolKey: 'homework-helper',
    relatedLandingPaths: pathsExist([P.hwMath, P.hwAi, P.hwAns]),
    relatedGuideSlugs: ['homework-solution-step-by-step', 'ai-homework-safety-guide', 'student-homework-ai-tools'],
    popularPagePaths: pathsExist([P.hwMath, P.aiText, P.pom]),
    faqs: [
      { q: '可以解題到考試嗎？', a: '工具僅輔助；考試仍需自己理解。' },
      { q: '圖形題？', a: '先描述已知條件與圖形假設，再分步推理。' },
      { q: '與 AI 作業協助頁差異？', a: '本頁偏數學科關鍵字。' },
    ],
    ctaPath: '/tools/homework-helper',
    ctaLabel: '開啟作業解題助手',
  },
  {
    slug: 'essay-helper-ai',
    keyword: 'essay helper ai',
    seoTitle: '搜尋：作文／申論 AI 輔助｜RxV',
    metaDescription:
      '將 essay helper ai 導向作文與申論落地頁，搭配大綱、引例與學術誠信提醒。',
    h1: '作文與申論 AI：大綱與引例',
    intro:
      '與數學不同，申論與作文需釐清題型、立場與證據來源：建議先產大綱與論點，再自行補例與改寫；避免直接交稿未經人工審閱。',
    relatedToolKey: 'homework-helper',
    relatedLandingPaths: pathsExist([P.hwEssay, '/tools/homework-helper/english-essay-helper', P.hwAi]),
    relatedGuideSlugs: ['ai-summary-best-practices', 'student-homework-ai-tools', 'summarize-long-article'],
    popularPagePaths: pathsExist([P.hwEssay, P.aiText, P.pom]),
    faqs: [
      { q: '可以直接交 AI 稿嗎？', a: '多數課程要求學術誠信；請依科任規定。' },
      { q: '與數學解題差異？', a: '本頁偏語文與申論。' },
      { q: '要附引用嗎？', a: '若使用外部資料需標註來源。' },
    ],
    ctaPath: '/tools/homework-helper',
    ctaLabel: '開啟作業解題助手',
  },
  {
    slug: 'study-timer-online',
    keyword: 'study timer online',
    seoTitle: '搜尋：讀書計時（線上）｜RxV',
    metaDescription:
      '對應讀書與考試準備的線上計時，連結無干擾讀書計時與番茄鐘，減少手機分心。',
    h1: '讀書計時：備考與無干擾模式',
    intro:
      '與「專注計時／番茄鐘」相比，此頁強調「讀書／備考」場景：建議先關閉通知、用清單列出章節，再以計時段落檢核進度；休息時再處理訊息。',
    relatedToolKey: 'productivity',
    relatedLandingPaths: pathsExist([P.studyTimer, '/tools/productivity/focus-timer-for-students', P.pom]),
    relatedGuideSlugs: ['student-homework-ai-tools', 'homework-solution-step-by-step', 'summarize-long-article'],
    popularPagePaths: pathsExist([P.studyTimer, P.pom, P.foc]),
    faqs: [
      { q: '讀書計時要開嗎？', a: '可依習慣；重點是段落與休息節奏。' },
      { q: '與番茄鐘差異？', a: '番茄鐘偏固定輪次；讀書頁可搭配章節目標。' },
      { q: '與專注計時差異？', a: '專注頁偏深度工作；本頁偏備考讀書。' },
    ],
    ctaPath: '/pomodoro',
    ctaLabel: '開啟讀書計時',
  },
];

export const searchSeoWhitelistSlugSet = new Set(searchSeoWhitelistPages.map((p) => p.slug));

export const searchSeoIndexablePaths: string[] = Array.from(
  new Set([
    ...searchSeoWhitelistPages.map((p) => `/search/${p.slug}`),
    ...seoPagesSearchIndexablePaths,
  ])
);

export function getSearchSeoPageBySlug(slug: string): SearchSeoPageData | undefined {
  const fromWhitelist = searchSeoWhitelistPages.find((p) => p.slug === slug);
  if (fromWhitelist) return fromWhitelist;
  return getSeoSearchPageBySlug(slug);
}

/** 非白名單：canonical 指向最接近白名單，否則 /search */
export function resolveSearchCanonicalPath(slug: string): string {
  if (searchSeoWhitelistSlugSet.has(slug) || seoPagesSearchSlugSet.has(slug)) return `/search/${slug}`;
  const sorted = [...searchSeoWhitelistPages].sort((a, b) => b.slug.length - a.slug.length);
  for (const p of sorted) {
    if (slug.includes(p.slug) || p.slug.includes(slug)) return `/search/${p.slug}`;
  }
  return '/search';
}

export function resolveSearchLandingLinks(paths: readonly string[]): {
  path: string;
  h1: string;
  label: string;
  titleKey?: string;
  descKey?: string;
}[] {
  return paths
    .map((path) => getLandingPreviewByPath(path))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      path: p.path,
      h1: p.h1,
      label: p.label,
      titleKey: p.titleKey,
      descKey: p.descKey,
    }));
}

export function resolveSearchGuideItems(slugs: readonly string[]): RelatedGuideItem[] {
  const seen = new Set<string>();
  const out: RelatedGuideItem[] = [];
  for (const slug of slugs) {
    const g = guideArticles.find((x) => x.slug === slug);
    if (!g || seen.has(g.path)) continue;
    seen.add(g.path);
    out.push({
      title: g.title,
      description: g.intro,
      href: g.path,
      tag: '教學',
    });
  }
  return out;
}

export function resolveSearchPopularItems(paths: readonly string[], excludePath: string): PopularPageItem[] {
  return paths
    .map((path) => getLandingPreviewByPath(path))
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p.path !== excludePath)
    .map((p) => ({
      title: p.h1,
      description: p.metaDescription,
      href: p.path,
      badge: 'SEO',
    }));
}

/** 合併：自訂教學 slug + 既有 toolKey 的 guides（去重） */
export function mergeSearchGuides(
  toolKey: ToolLandingToolKey,
  extraSlugs: readonly string[],
  limit = 12
): RelatedGuideItem[] {
  const fromSlugs = resolveSearchGuideItems(extraSlugs);
  const fromKey = getGuideItemsForLanding(toolKey);
  const seen = new Set<string>();
  const merged: RelatedGuideItem[] = [];
  for (const item of [...fromSlugs, ...fromKey]) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}

/** 合併：自訂熱門 path + 既有 popular（去重） */
export function mergeSearchPopular(
  toolKey: ToolLandingToolKey,
  hintPaths: readonly string[],
  excludePath: string,
  limit = 10
): PopularPageItem[] {
  const fromHints = resolveSearchPopularItems(hintPaths, excludePath);
  const fromKey = getPopularItemsForLanding(excludePath, toolKey);
  const seen = new Set<string>();
  const merged: PopularPageItem[] = [];
  for (const item of [...fromHints, ...fromKey]) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}
