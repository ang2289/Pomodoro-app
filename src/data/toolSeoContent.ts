import { guideArticlesExtended } from './guideArticlesExtended';

export type ToolCategoryKey = 'ai' | 'image' | 'productivity' | 'life';

export type SeoFaqItem = {
  q: string;
  a: string;
};

export type ToolLinkItem = {
  name: string;
  path: string;
  desc: string;
};

export type ToolCategoryContent = {
  key: ToolCategoryKey;
  path: string;
  h1: string;
  intro: string;
  purpose: string[];
  tools: ToolLinkItem[];
  faq: SeoFaqItem[];
};

export const toolCategoryPages: ToolCategoryContent[] = [
  {
    key: 'ai',
    path: '/tools/ai',
    h1: 'AI工具分類',
    intro: '彙整 AI 摘要、作業解題與 AI 內容生成工具，快速找到最適合的入口。',
    purpose: ['整理長文重點與影片資訊', '快速取得作業與學習輔助', '縮短內容產出與整理時間'],
    tools: [
      { name: 'AI摘要工具', path: '/summary', desc: '快速濃縮重點，適合閱讀與研究整理。' },
      { name: '作業解題助手', path: '/tools/homework-helper', desc: '輸入題目即可取得步驟化說明。' },
      { name: 'AI短影音工具', path: '/tools/shopee-video', desc: '快速建立短影音腳本與素材流程。' },
    ],
    faq: [
      { q: 'AI工具適合新手嗎？', a: '可以，這裡的工具入口都以「貼上內容即可開始」為主。' },
      { q: '要先註冊才能用嗎？', a: '部分功能可直接體驗，進階額度與管理功能建議登入後使用。' },
      { q: 'AI摘要與解題可以一起搭配嗎？', a: '可以，先用摘要整理資料，再用解題助手進一步拆解問題。' },
    ],
  },
  {
    key: 'image',
    path: '/tools/image',
    h1: '圖片工具分類',
    intro: '整理圖片尺寸調整、壓縮、QR Code 與貼圖整理工具，處理素材更快速。',
    purpose: ['圖片檔案優化與尺寸標準化', '社群與電商素材快速產出', '減少設計與上稿前置時間'],
    tools: [
      { name: '圖片尺寸轉換', path: '/tools/image-resize', desc: '一鍵調整社群與平台尺寸。' },
      { name: '線上圖片裁切', path: '/tools/image-crop', desc: '比例預覽與裁切，PNG／JPG 下載。' },
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '降低檔案大小，保留可用畫質。' },
      { name: '圖片格式轉換', path: '/tools/image-convert', desc: 'PNG、JPG、WebP 線上互轉。' },
      { name: 'LINE貼圖整理', path: '/tools/line-sticker', desc: '貼圖尺寸與打包流程快速完成。' },
      { name: 'QR Code 產生器', path: '/tools/qr-code', desc: '連結與資訊快速轉成可掃描碼。' },
    ],
    faq: [
      { q: '圖片工具會上傳檔案嗎？', a: '多數工具以瀏覽器端處理為主，降低檔案外流風險。' },
      { q: '先用尺寸還是先壓縮？', a: '通常先調整尺寸再壓縮，可獲得更穩定的輸出結果。' },
      { q: 'QR Code 算圖片工具嗎？', a: '是，因為常見輸出需求是 PNG/SVG 圖檔與分享素材。' },
    ],
  },
  {
    key: 'productivity',
    path: '/tools/productivity',
    h1: '效率工具分類',
    intro: '聚焦專注與任務管理，讓你把 AI 產出的內容轉成可執行的行動。',
    purpose: ['維持專注節奏與任務拆解', '降低拖延與切換成本', '建立每日可重複的流程'],
    tools: [
      { name: '番茄鐘 Pomodoro', path: '/pomodoro', desc: '用時間區塊提高專注與完成率。' },
      { name: '待辦清單 Todo', path: '/todo', desc: '快速拆解任務並追蹤進度。' },
      { name: 'AI摘要工具', path: '/summary', desc: '先整理資訊，再安排執行順序。' },
    ],
    faq: [
      { q: '番茄鐘與待辦怎麼搭配？', a: '先把任務拆成小步驟，再用番茄鐘逐段完成。' },
      { q: '效率工具適合學生嗎？', a: '適合，特別是準備考試與作業分段管理。' },
      { q: '需要每天固定使用嗎？', a: '建議固定使用，持續一到兩週就能看到節奏差異。' },
    ],
  },
  {
    key: 'life',
    path: '/tools/life',
    h1: '生活工具分類',
    intro: '整合生活決策與資訊判讀工具，幫助你快速避坑與理解政策重點。',
    purpose: ['降低詐騙與資訊誤判風險', '快速理解政策與制度重點', '用更少時間做出較好決策'],
    tools: [
      { name: '詐騙風險判斷', path: '/tools/scam-check', desc: '快速檢查訊息風險與警示重點。' },
      { name: '政策白話解釋', path: '/policy-explained', desc: '用易懂方式整理政策重點。' },
      { name: '補助懶人包', path: '/aids', desc: '快速查看常見補助資訊與入口。' },
    ],
    faq: [
      { q: '生活工具資料會更新嗎？', a: '會，內容會依常見政策與實務需求持續更新。' },
      { q: '可以只看重點嗎？', a: '可以，每個頁面都會提供快速閱讀與 FAQ 區塊。' },
      { q: '政策白話頁能取代官方資訊嗎？', a: '不能，建議用來快速理解後再回到官方來源確認。' },
    ],
  },
];

/** SEO 落地頁對應的主工具（路徑 /tools/{segment}/[slug]） */
export type ToolLandingToolKey =
  | 'image-resize'
  | 'image-compress'
  | 'image-convert'
  | 'image-crop'
  | 'qr-code'
  | 'ai-summary'
  | 'homework-helper'
  | 'productivity';

type LandingBase = {
  segment: string;
  toolLabel: string;
  ctaPath: string;
  ctaLabel: string;
  breadcrumbParentPath: string;
  breadcrumbParentName: string;
  relatedTools: ToolLinkItem[];
};

export const landingBaseByKey: Record<ToolLandingToolKey, LandingBase> = {
  'image-resize': {
    segment: 'image-resize',
    toolLabel: '圖片尺寸轉換',
    ctaPath: '/tools/image-resize',
    ctaLabel: '開啟圖片尺寸轉換',
    breadcrumbParentPath: '/tools/image-resize',
    breadcrumbParentName: '圖片尺寸轉換',
    relatedTools: [
      { name: '圖片格式轉換', path: '/tools/image-convert', desc: 'PNG／JPG／WebP 互轉。' },
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '縮小檔案、加速載入。' },
      { name: 'QR Code 產生器', path: '/tools/qr-code', desc: '素材與連結快速分享。' },
      { name: 'AI 摘要', path: '/summary', desc: '文案與說明文字整理。' },
      { name: '圖片工具分類', path: '/tools/image', desc: '更多影像工具入口。' },
    ],
  },
  'image-compress': {
    segment: 'image-compress',
    toolLabel: '圖片壓縮',
    ctaPath: '/tools/image-compress',
    ctaLabel: '開啟圖片壓縮',
    breadcrumbParentPath: '/tools/image-compress',
    breadcrumbParentName: '圖片壓縮',
    relatedTools: [
      { name: '圖片格式轉換', path: '/tools/image-convert', desc: 'PNG／JPG／WebP 互轉。' },
      { name: '圖片尺寸轉換', path: '/tools/image-resize', desc: '調整社群與平台尺寸。' },
      { name: 'QR Code 產生器', path: '/tools/qr-code', desc: '分享與導流。' },
      { name: 'AI 摘要', path: '/summary', desc: '內容整理。' },
      { name: '圖片工具分類', path: '/tools/image', desc: '更多影像工具。' },
    ],
  },
  'image-convert': {
    segment: 'image-convert',
    toolLabel: '圖片格式轉換',
    ctaPath: '/tools/image-convert',
    ctaLabel: '開啟圖片格式轉換',
    breadcrumbParentPath: '/tools/image-convert',
    breadcrumbParentName: '圖片格式轉換',
    relatedTools: [
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '縮小檔案、加速載入。' },
      { name: '圖片尺寸轉換', path: '/tools/image-resize', desc: '調整寬高與比例。' },
      { name: 'QR Code 產生器', path: '/tools/qr-code', desc: '素材與連結分享。' },
      { name: '圖片工具分類', path: '/tools/image', desc: '更多影像工具入口。' },
    ],
  },
  'image-crop': {
    segment: 'image-crop',
    toolLabel: '線上圖片裁切',
    ctaPath: '/tools/image-crop',
    ctaLabel: '開啟圖片裁切工具',
    breadcrumbParentPath: '/tools/image-crop',
    breadcrumbParentName: '圖片裁切',
    relatedTools: [
      { name: '圖片尺寸轉換', path: '/tools/image-resize', desc: '調整寬高與像素。' },
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '縮小檔案、加速載入。' },
      { name: '圖片格式轉換', path: '/tools/image-convert', desc: 'PNG／JPG／WebP 互轉。' },
      { name: '圖片工具分類', path: '/tools/image', desc: '更多影像工具入口。' },
    ],
  },
  'qr-code': {
    segment: 'qr-code',
    toolLabel: 'QR Code 產生器',
    ctaPath: '/tools/qr-code',
    ctaLabel: '開啟 QR Code 產生器',
    breadcrumbParentPath: '/tools/qr-code',
    breadcrumbParentName: 'QR Code 產生器',
    relatedTools: [
      { name: '圖片尺寸轉換', path: '/tools/image-resize', desc: '海報與貼紙印刷尺寸。' },
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '降低掃描圖檔大小。' },
      { name: 'AI 摘要', path: '/summary', desc: '整理說明文案。' },
      { name: '圖片工具分類', path: '/tools/image', desc: '更多影像工具。' },
    ],
  },
  'ai-summary': {
    segment: 'ai-summary',
    toolLabel: 'AI 摘要',
    ctaPath: '/summary',
    ctaLabel: '開啟 AI 摘要',
    breadcrumbParentPath: '/tools/ai',
    breadcrumbParentName: 'AI 工具',
    relatedTools: [
      { name: '作業解題助手', path: '/tools/homework-helper', desc: '步驟化解題。' },
      { name: '番茄鐘', path: '/pomodoro', desc: '專注完成閱讀與整理。' },
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '附件與截圖優化。' },
      { name: 'QR Code', path: '/tools/qr-code', desc: '分享摘要連結。' },
    ],
  },
  'homework-helper': {
    segment: 'homework-helper',
    toolLabel: '作業解題助手',
    ctaPath: '/tools/homework-helper',
    ctaLabel: '開啟作業解題助手',
    breadcrumbParentPath: '/tools/homework-helper',
    breadcrumbParentName: '作業解題助手',
    relatedTools: [
      { name: 'AI 摘要', path: '/summary', desc: '整理講義與閱讀重點。' },
      { name: '番茄鐘', path: '/pomodoro', desc: '分段寫作業。' },
      { name: '待辦清單', path: '/todo', desc: '作業與考試排程。' },
      { name: '圖片尺寸轉換', path: '/tools/image-resize', desc: '報告與海報圖。' },
    ],
  },
  productivity: {
    segment: 'productivity',
    toolLabel: '番茄鐘與專注',
    ctaPath: '/pomodoro',
    ctaLabel: '開啟線上番茄鐘',
    breadcrumbParentPath: '/tools/productivity',
    breadcrumbParentName: '效率工具',
    relatedTools: [
      { name: '待辦清單', path: '/todo', desc: '任務拆解與追蹤。' },
      { name: 'AI 摘要', path: '/summary', desc: '先整理資訊再專注執行。' },
      { name: '作業解題助手', path: '/tools/homework-helper', desc: '學習輔助。' },
      { name: '圖片壓縮', path: '/tools/image-compress', desc: '素材輕量化。' },
    ],
  },
};

export type ToolLandingPageContent = {
  id: string;
  toolKey: ToolLandingToolKey;
  toolLabel: string;
  slug: string;
  path: string;
  /** Programmatic SEO（seoPages.json）：以 i18n key 覆寫標題與描述 */
  seoI18n?: { titleKey: string; descKey: string };
  /** 麵包屑最後一層顯示名稱 */
  scenarioLabel: string;
  h1: string;
  seoTitle: string;
  metaDescription: string;
  intro: string;
  /** 使用方式步驟（選填，Use-case 模板頁用） */
  steps?: string[];
  situations: string[];
  faq: SeoFaqItem[];
  ctaPath: string;
  ctaLabel: string;
  relatedTools: ToolLinkItem[];
  breadcrumbParentPath: string;
  breadcrumbParentName: string;
};

type KeywordPageContentInput = Pick<
  ToolLandingPageContent,
  'h1' | 'seoTitle' | 'metaDescription' | 'intro' | 'situations' | 'faq'
> & { steps?: string[] };

function buildKeywordPage(
  toolKey: ToolLandingToolKey,
  slug: string,
  scenarioLabel: string,
  content: KeywordPageContentInput,
  ctaOverride?: Pick<ToolLandingPageContent, 'ctaPath' | 'ctaLabel'>
): ToolLandingPageContent {
  const base = landingBaseByKey[toolKey];
  return {
    id: `${toolKey}-${slug}`,
    toolKey,
    toolLabel: base.toolLabel,
    slug,
    path: `/tools/${base.segment}/${slug}`,
    scenarioLabel,
    ...content,
    ctaPath: ctaOverride?.ctaPath ?? base.ctaPath,
    ctaLabel: ctaOverride?.ctaLabel ?? base.ctaLabel,
    relatedTools: base.relatedTools,
    breadcrumbParentPath: base.breadcrumbParentPath,
    breadcrumbParentName: base.breadcrumbParentName,
  };
}

/** 依指定關鍵字 slug 建立的 SEO 落地頁 */
export const toolLandingPages: ToolLandingPageContent[] = [
  buildKeywordPage('image-resize', 'instagram-post-size', 'Instagram 貼文尺寸', {
    h1: 'Instagram 貼文圖片尺寸線上調整',
    seoTitle: 'Instagram 貼文尺寸｜線上圖片尺寸轉換｜RxV',
    metaDescription:
      '快速將圖片調成 IG 貼文常用比例與解析度，減少上稿被裁切或模糊。瀏覽器即可操作，完成後一鍵前往圖片尺寸轉換工具。',
    intro:
      'Instagram 貼文對長寬比與解析度有既定習慣，若尺寸不符容易在動態牆或預覽時被裁切。此頁說明如何搭配線上圖片尺寸轉換，把素材一次調到適合上稿的狀態，節省反覆匯出與重做的時間。',
    situations: [
      '自媒體、品牌小編每日發佈方形或直式貼文圖',
      '活動海報從設計稿匯出後要符合 IG 版位',
      '多張圖輪播前需統一長邊或比例',
    ],
    faq: [
      { q: 'IG 貼文一定要特定像素嗎？', a: '平台會依裝置縮放，但建議使用常見比例與足夠解析度，可避免邊緣被裁或模糊。' },
      { q: '直式與方形可以同一工具處理嗎？', a: '可以，先決定目標版位再在工具內設定對應寬高或比例即可。' },
      { q: '調整尺寸會讓檔案變很大嗎？', a: '若檔案偏大，可再使用圖片壓縮在畫質可接受範圍內縮小。' },
    ],
  }),
  buildKeywordPage('image-resize', 'instagram-reels-size', 'Instagram Reels 尺寸', {
    h1: 'Instagram Reels 封面與影片比例尺寸說明',
    seoTitle: 'Instagram Reels 尺寸｜線上圖片／比例調整｜RxV',
    metaDescription:
      '整理 Reels 常見 9:16 與封面顯示重點，並以線上工具協助裁切靜態封面或素材。完成後可立即開啟圖片尺寸轉換。',
    intro:
      'Reels 以直式全螢幕為主，封面與預覽縮圖若比例錯誤會影響點閱意願。透過圖片尺寸轉換先把靜態封面、疊字用的安全區對齊，再與影片檔一併上傳，整體呈現會更一致。',
    situations: ['短影音創作者製作 Reels 封面', '品牌活動需統一直式視覺', '從橫式素材改為直式 Reels 用圖'],
    faq: [
      { q: 'Reels 靜態封面與影片解析度要一致嗎？', a: '建議封面比例與影片一致（常見為直式），避免預覽與播放時跳版。' },
      { q: '可以把橫式照片改成直式嗎？', a: '可以透過裁切或加上邊框方式在工具內完成，注意重要內容留在安全區。' },
      { q: '只調封面、不調影片可以嗎？', a: '可以，此工具頁主要協助靜態圖尺寸；影片剪輯請使用影音編輯軟體。' },
    ],
  }),
  buildKeywordPage('image-resize', 'youtube-thumbnail-size', 'YouTube 縮圖尺寸', {
    h1: 'YouTube 縮圖尺寸與安全區建議',
    seoTitle: 'YouTube 縮圖尺寸｜線上圖片尺寸轉換｜RxV',
    metaDescription:
      '將影片縮圖調成 YouTube 建議的 16:9 與足夠解析度，避免手機與電視端模糊。線上調整尺寸後再上架更省事。',
    intro:
      '縮圖是點擊率的關鍵之一，比例與解析度不足時，在各種裝置上容易顯得模糊或字被裁掉。使用圖片尺寸轉換先把長寬與輸出像素對齊，再疊加標題與人臉等視覺重點，可有效提升辨識度。',
    situations: ['教學頻道每支影片上傳前製作縮圖', '直播重播與 Shorts 以外的長影片縮圖', 'A/B 測試多版縮圖前統一尺寸'],
    faq: [
      { q: '縮圖一定要 16:9 嗎？', a: 'YouTube 以橫式 16:9 為主，與播放器比例一致時顯示最穩定。' },
      { q: '手機上看起來字很小怎麼辦？', a: '除解析度外，應放大主標字級並保留邊緣安全區，避免被介面元件遮擋。' },
      { q: '同一張圖能給 Shorts 用嗎？', a: 'Shorts 以直式為主，橫式縮圖建議另做直式版本或重新裁切。' },
    ],
  }),
  buildKeywordPage('image-resize', 'youtube-shorts-size', 'YouTube Shorts 尺寸', {
    h1: 'YouTube Shorts 直式影片與封面尺寸',
    seoTitle: 'YouTube Shorts 尺寸｜直式圖片裁切｜RxV',
    metaDescription:
      'Shorts 以直式 9:16 為主，靜態預覽與封面亦建議同比例。使用線上尺寸轉換處理封面與疊圖素材。',
    intro:
      'Shorts 在 Shorts 櫥窗與搜尋結果多以直式呈現，若仍使用橫式縮圖，預覽會顯得過小或留黑邊。將素材改為直式並預留標題安全區，能讓滑動瀏覽時更容易被看見。',
    situations: ['Shorts 與直式直播剪輯後需要配套封面', '從 IG Story 素材轉到 Shorts', '直式產品展示影片'],
    faq: [
      { q: 'Shorts 封面可以和長影片共用嗎？', a: '比例不同時不建議共用；直式封面在 Shorts 流量版位較佔優勢。' },
      { q: '9:16 的圖可以裁成 1:1 嗎？', a: '可以裁切，但會失去直式滿版效果，需評估品牌版位策略。' },
      { q: '直式圖檔很大怎麼辦？', a: '完成尺寸後可用圖片壓縮降低上傳時間與緩衝。' },
    ],
  }),
  buildKeywordPage('image-resize', 'facebook-post-size', 'Facebook 貼文圖片尺寸', {
    h1: 'Facebook 貼文圖片尺寸與比例整理',
    seoTitle: 'Facebook 貼文尺寸｜線上圖片尺寸轉換｜RxV',
    metaDescription:
      '整理動態牆、連結預覽與多圖貼文常見比例，並以線上工具調整圖檔尺寸，降低被裁切或壓縮過度的機會。',
    intro:
      'Facebook 會依裝置與版位自動裁切預覽，若原圖比例與構圖未預留安全區，重要資訊容易被切掉。先決定貼文是單圖、多圖或連結預覽，再用圖片尺寸轉換對齊長寬，可讓同一素材在桌機與手機上都維持可讀性。',
    situations: ['粉絲專頁活動與促銷貼文主視覺', '社團公告與長文配圖', '廣告與自然貼文素材統一規格'],
    faq: [
      { q: '連結貼文的預覽圖可以自訂尺寸嗎？', a: '建議依官方建議比例輸出，並在工具內預覽近似裁切效果。' },
      { q: '多圖貼文每張都要同一尺寸嗎？', a: '不必相同，但相近比例較能維持滑動瀏覽時的整體感。' },
      { q: '上傳後變模糊？', a: '可能是原圖解析度不足或過度壓縮，可適度提高輸出像素並檢查壓縮設定。' },
    ],
  }),

  buildKeywordPage('image-compress', 'compress-image-online', '線上壓縮圖片', {
    h1: '線上壓縮圖片：縮小檔案、加快上傳',
    seoTitle: 'Compress image online｜線上圖片壓縮｜RxV',
    metaDescription:
      '在瀏覽器內壓縮 JPG／PNG 等常見圖檔，適合網站、表單與社群上傳。一鍵前往圖片壓縮工具，保留可接受畫質。',
    intro:
      '網頁與 App 常對上傳檔案大小設限，過大的圖片也會拖慢載入與消耗流量。線上圖片壓縮能在可接受畫質下降低 KB 數，適合部落格、電商與 Email 附檔等情境，且無須安裝桌面軟體。',
    situations: ['官網與部落格文章配圖瘦身', '報名表與證件照上傳前壓縮', 'Email 夾帶多張截圖'],
    faq: [
      { q: '壓縮後畫質會差很多嗎？', a: '可依需求選擇較溫和或較強的壓縮；建議先試壓一張再批次處理。' },
      { q: 'RAW 或 PSD 可以直接壓嗎？', a: '通常需先匯出為 JPG／PNG 等常見格式再壓縮。' },
      { q: '壓縮後要改尺寸怎麼辦？', a: '可先調整尺寸再壓縮，或先壓縮再調尺寸，兩者搭配可得到較小檔案。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-jpg-online', '線上壓縮 JPG', {
    h1: '線上壓縮 JPG：相片與截圖檔案瘦身',
    seoTitle: 'Compress JPG online｜JPG 線上壓縮｜RxV',
    metaDescription:
      '針對 JPG／JPEG 相片與截圖進行線上壓縮，適合相簿、商品圖與社群。減少檔案大小同時維持可讀細節。',
    intro:
      'JPG 是有損壓縮格式，適合照片類素材。透過線上工具調整壓縮強度，可在檔案大小與肉眼可見細節之間取得平衡，特別適合大量商品圖或活動照片批次處理前的第一步。',
    situations: ['電商商品圖批次瘦身', '手機相片上傳至表單或雲端', '簡報內嵌高解析照片'],
    faq: [
      { q: 'JPG 壓多次會更糊嗎？', a: '會，每次有損壓縮都可能累積雜訊，建議保留原檔，僅對副本壓縮。' },
      { q: 'JPG 跟 PNG 哪個比較小？', a: '照片類通常 JPG 較小；透明或銳利線條圖多用 PNG。' },
      { q: '需要透明背景怎麼辦？', a: 'JPG 不支援透明，需透明請改用 PNG 並視情況壓縮。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-png-online', '線上壓縮 PNG', {
    h1: '線上壓縮 PNG：透明背景與 UI 素材',
    seoTitle: 'Compress PNG online｜PNG 線上壓縮｜RxV',
    metaDescription:
      '縮小 PNG 圖檔體積，適合 Logo、去背圖與 UI 切圖。線上操作、快速下載，再與尺寸調整工具搭配使用。',
    intro:
      'PNG 支援透明背景，檔案往往比 JPG 大。對網站與簡報中的 Logo、圖示與截圖進行線上壓縮，可減少載入時間，同時盡量保留邊緣銳利度與透明通道。',
    situations: ['網站 Header／Footer Logo', '簡報與文宣去背人物', 'App 切圖與 2x／3x 資產'],
    faq: [
      { q: 'PNG 壓縮會不見透明嗎？', a: '正常壓縮流程會保留透明；若發現異常請檢查匯出設定。' },
      { q: '為什麼 PNG 還是很大？', a: '色階與解析度越高檔案越大，可同步考慮裁切不必要留白或適度縮小尺寸。' },
      { q: '可以轉成 JPG 再壓嗎？', a: '若不需要透明，轉 JPG 通常更小，但會失去透明與部分細節。' },
    ],
  }),
  buildKeywordPage('image-compress', 'reduce-image-file-size', '縮小圖片檔案大小', {
    h1: '縮小圖片檔案大小：上傳與載入更順',
    seoTitle: 'Reduce image file size｜縮小圖檔｜RxV',
    metaDescription:
      '從調整尺寸、選擇格式到壓縮強度，說明如何有效縮小圖檔。使用 RxV 線上圖片壓縮快速處理常見需求。',
    intro:
      '縮小檔案通常有兩條路：降低像素（尺寸）與提高壓縮率。多數情境可兩者並用：先裁到實際顯示所需解析度，再針對 JPG／PNG 做壓縮，能在不明顯影響觀感的前提下顯著降低 KB 數。',
    situations: ['網站 Core Web Vitals 與 SEO 優化', 'CRM／客服系統附件限制', '即時通傳送大量截圖'],
    faq: [
      { q: '只壓縮不縮尺寸可以嗎？', a: '可以，但若原圖遠大於顯示需求，先縮尺寸再壓縮效果更明顯。' },
      { q: '如何判斷壓太過頭？', a: '放大檢視文字邊緣與漸層，若出現明顯色塊或摩爾紋應降低壓縮強度。' },
      { q: '向量圖也要壓縮嗎？', a: 'SVG 另有最佳化方式；點陣圖才適用一般圖片壓縮流程。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-under-1mb', '壓縮圖片至 1MB 以下', {
    h1: '將圖片壓到 1MB 以下：表單與上傳限制',
    seoTitle: 'Compress image under 1MB｜圖片壓縮｜RxV',
    metaDescription:
      '許多報名、投件與內部系統限制單檔 1MB 內。透過線上壓縮與必要時縮小尺寸，讓圖檔符合限制又維持可讀。',
    intro:
      '遇到「檔案需小於 1MB」的提示時，建議先確認平台接受的格式與最小可讀解析度，再依序嘗試：適度縮小長邊像素、選擇合適格式（照片多用 JPG）、最後調整壓縮強度，通常即可達標。',
    situations: ['政府或學校線上報名附檔', '企業內部請假／請款系統', '投稿競賽作品檔案上限'],
    faq: [
      { q: '壓到 1MB 以下還是糊？', a: '可略為提高可接受的長邊像素下限，或改為較有效率的裁切構圖。' },
      { q: '多張圖每張都要 1MB 以下嗎？', a: '依各平台規定為準；若總量也有限制，需一併計算。' },
      { q: '證件照有最小解析度嗎？', a: '若平台有規定寬高或 DPI，請優先滿足再壓縮。' },
    ],
  }),

  buildKeywordPage('qr-code', 'free-qr-code-generator', '免費 QR Code 產生', {
    h1: '免費 QR Code 產生器：連結與文字快速成碼',
    seoTitle: 'Free QR code generator｜免費產生 QR Code｜RxV',
    metaDescription:
      '免費線上產生 QR Code，將網址、文字等內容轉成可掃描圖檔，適合活動報名、菜單與名片。立即開啟產生器。',
    intro:
      'QR Code 能把長網址與聯絡資訊濃縮成單一掃描入口，列印或顯示在螢幕上都很方便。使用線上產生器可快速輸出 PNG／SVG 等格式，再依需求搭配圖片壓縮或尺寸調整即可上架。',
    situations: ['實體活動報到與問卷連結', '餐飲菜單與桌邊點餐', '名片與傳單導流至官網或 LINE'],
    faq: [
      { q: '免費產生的碼會過期嗎？', a: '靜態內容通常不會因產生器而過期；若使用短網址服務，需留意短網址本身的有效期。' },
      { q: '可以改顏色或放 Logo 嗎？', a: '依工具支援度而定；需確保對比足夠以免難掃描。' },
      { q: '列印要多大才清楚？', a: '依掃描距離調整印刷尺寸，並避免過度壓縮或模糊。' },
    ],
  }),
  buildKeywordPage('qr-code', 'wifi-qr-code', 'WiFi QR Code', {
    h1: 'WiFi QR Code：訪客一掃即連線',
    seoTitle: 'WiFi QR code｜分享無線網路｜RxV',
    metaDescription:
      '將 WiFi 名稱與密碼轉成 QR Code，方便訪客與活動現場連線，減少口頭拼字錯誤。使用 RxV QR Code 工具建立。',
    intro:
      '店家、工作室或活動場域常需重複告知 WiFi 密碼，改以 QR Code 顯示於櫃台或桌卡，客人掃描即可連線。請依路由器與安全政策決定是否公開密碼，並定期更新密碼與對應 QR。',
    situations: ['咖啡廳與共享空間', '短期活動與展場', '民宿與會議室訪客'],
    faq: [
      { q: 'WiFi QR 會洩漏密碼嗎？', a: '掃碼等同取得密碼，僅建議在可信任場域使用，或設訪客專用 SSID。' },
      { q: '5G／2.4G 要分開嗎？', a: '可產生兩張或註明頻段，依現場設備相容性調整。' },
      { q: '密碼變了怎麼辦？', a: '需重新產生 QR 並替換現場展示的圖檔或印刷品。' },
    ],
  }),
  buildKeywordPage('qr-code', 'business-card-qr-code', '名片 QR Code', {
    h1: '名片 QR Code：一掃加入聯絡或官網',
    seoTitle: 'Business card QR code｜電子名片｜RxV',
    metaDescription:
      '在名片加入 QR Code，連結至官網、電子郵件或 vCard。線上產生可下載圖檔，搭配印刷尺寸建議一次完成。',
    intro:
      '紙本名片能承載的資訊有限，加上 QR Code 可導向完整作品集、行事曆預約或即時通帳號。產生前請確認連結為 HTTPS、行動版可讀，並在印刷前用多款手機實測掃描。',
    situations: ['業務拜訪與展覽換名片', '講者與創作者聯絡方式', '實體店面會員加入'],
    faq: [
      { q: 'QR 要印多大？', a: '建議依名片版面保留足夠留白，避免小於常見掃描辨識下限。' },
      { q: '可以放多個 QR 嗎？', a: '可以，但避免過於擁擠；也可改為單一連結再到落地頁分流。' },
      { q: '連結之後能改嗎？', a: '靜態 QR 內容固定；若需常改連結可考慮可管理的短網址方案。' },
    ],
  }),
  buildKeywordPage('qr-code', 'google-review-qr-code', 'Google 評論 QR Code', {
    h1: 'Google 評論 QR Code：引導顧客留評價',
    seoTitle: 'Google review QR code｜店家評價｜RxV',
    metaDescription:
      '產生連結至 Google 商家評論頁的 QR Code，放在櫃台或收據上提升評價數。線上建立、下載後即可印刷。',
    intro:
      '實體店家取得評價的關鍵在於「降低操作門檻」。將正確的 Google 商家評論連結做成 QR Code，顧客掃描後即可登入留評；請遵守平台規範，避免不當邀評或利誘。',
    situations: ['餐飲結帳櫃台立牌', '美業與診所服務完成後', '住宿退房提醒卡'],
    faq: [
      { q: '連結要怎麼取得？', a: '請至 Google 商家檔案取得評論連結或分享方式，再貼入產生器。' },
      { q: '顧客手機沒有 Google 帳號？', a: '留評通常需登入；可改提供其他回饋管道作補充。' },
      { q: '可以追蹤掃描次數嗎？', a: '靜態 QR 本身無統計；可改使用可追蹤的落地頁或 UTM 網址（若與工具相容）。' },
    ],
  }),

  buildKeywordPage('ai-summary', 'ai-text-summarizer', 'AI 文字摘要', {
    h1: 'AI 文字摘要：長文快速抓重點',
    seoTitle: 'AI text summarizer｜文字摘要｜RxV',
    metaDescription:
      '使用 AI 將長篇文字濃縮成重點與條列，適合文章、信件與筆記。前往 RxV AI 摘要工具貼上即可開始。',
    intro:
      '閱讀報告、合約或研究素材時，先取得摘要可加速理解與後續決策。AI 文字摘要適合處理結構較清楚的長文，建議仍人工核對關鍵數字、日期與法條引用等細節。',
    situations: ['研究與市場報告初讀', '長篇 Email 與公告整理', '會議前快速掌握背景'],
    faq: [
      { q: '摘要會取代原文閱讀嗎？', a: '不應完全取代，特別是合約與法遵相關內容需以原文為準。' },
      { q: '英文內容可以嗎？', a: '多數工具支援多語；實際效果依模型與內容而異。' },
      { q: '機密文件能上傳嗎？', a: '請依組織資安規範；敏感資料建議去識別或改用離線流程。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'article-summarizer', '文章摘要', {
    h1: '文章摘要：新聞與部落格快速閱讀',
    seoTitle: 'Article summarizer｜文章摘要工具｜RxV',
    metaDescription:
      '將線上文章與長篇報導整理成重點段落，節省滑手機與做功課的時間。使用 AI 摘要工具貼上內容即可。',
    intro:
      '資訊量大時，先產出「段落級」摘要再決定是否深讀全文，能顯著降低時間成本。適合追新聞、產業動態或競品部落格；若文章含付費牆，請先取得合法可複製之文字。',
    situations: ['每日新聞與產業週報', '學生論文背景調查', '內容策展與靈感收集'],
    faq: [
      { q: '可以貼網址自動抓嗎？', a: '依產品功能而定；若僅支援純文字，可先複製可合法使用之段落。' },
      { q: '摘要能直接引用嗎？', a: '建議改寫並註明出處，避免侵權與學術倫理問題。' },
      { q: '和逐字稿摘要差在哪？', a: '文章摘要偏書面結構；逐字稿需處理口語贅字與時間軸。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'pdf-summarizer', 'PDF 摘要', {
    h1: 'PDF 摘要：論文與報告閱讀加速',
    seoTitle: 'PDF summarizer｜PDF 文件摘要｜RxV',
    metaDescription:
      '將 PDF 內文字複製後交由 AI 摘要，快速掌握章節重點與結論。適合論文、白皮書與內部報告。',
    intro:
      '許多 PDF 可直接複製文字至摘要工具；若為掃描檔需先 OCR。建議分章節摘要後再合併，較能保留論證結構，並對數據表格特別人工核對。',
    situations: ['學術論文與文獻探討', '企業白皮書與標案', '法規與條文初探（仍須核對原文）'],
    faq: [
      { q: '掃描 PDF 怎麼辦？', a: '需先以 OCR 轉成可選取文字，或分段手動輸入重點。' },
      { q: '公式與圖表會不會錯？', a: 'AI 對公式與圖表理解有限，務必對照原文。' },
      { q: '可以摘要整本手冊嗎？', a: '建議分段處理並留意工具字數上限。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'youtube-video-summarizer', 'YouTube 影片摘要', {
    h1: 'YouTube 影片摘要：從逐字稿到重點',
    seoTitle: 'YouTube video summarizer｜影片摘要｜RxV',
    metaDescription:
      '將影片逐字稿或重點文字貼上 AI 摘要，快速整理教學、訪談與直播內容。再搭配番茄鐘分段觀看更有效率。',
    intro:
      '影片資訊密度高，先看摘要再決定是否全程觀看，可節省大量時間。若取得合法逐字稿或自行摘錄重點句，即可用 AI 整理成條列式筆記；請尊重版權與平台使用條款。',
    situations: ['線上課程複習', '長訪談與 Podcast 逐字稿', '產品發表與技術直播'],
    faq: [
      { q: '沒有逐字稿怎麼辦？', a: '可手動記下時間戳與重點句再摘要，或使用平台提供的字幕（若允許）。' },
      { q: '能摘要其他平台影片嗎？', a: '流程類似，重點在取得可合法使用之文字來源。' },
      { q: '摘要可以當作報告內容嗎？', a: '需改寫並引用來源，避免抄襲。' },
    ],
  }),

  buildKeywordPage('homework-helper', 'ai-homework-solver', 'AI 作業解題', {
    h1: 'AI 作業解題：步驟化理解題目',
    seoTitle: 'AI homework solver｜作業解題助手｜RxV',
    metaDescription:
      '輸入題目條件，取得步驟化解題思路與觀念提醒，輔助理解。請搭配課堂規範使用 RxV 作業解題助手。',
    intro:
      '作業的目的在於理解觀念與演練。建議將題目、已知與疑問寫清楚，請工具以「步驟說明」為主，再自行動手算一次；若課程禁止 AI 輔助，請以教師規定為準。',
    situations: ['段考前的觀念複習', '證明題卡住時找思路', '驗算與檢查自己的解法'],
    faq: [
      { q: '可以直接交 AI 答案嗎？', a: '不建議，可能違反學術誠信；請用於理解與自我檢核。' },
      { q: '理科與文科都適用嗎？', a: '可依題型嘗試；文科申論仍需自行組織論證與引用。' },
      { q: '題目要怎麼描述？', a: '越完整越好，包含單位、條件與已嘗試的方法。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'math-homework-solver', '數學作業解題', {
    h1: '數學作業解題：代數、函數與應用題',
    seoTitle: 'Math homework solver｜數學解題｜RxV',
    metaDescription:
      '針對代數、方程式與應用題取得解題步驟提示。使用作業解題助手輔助思考，並自行驗算與練習類題。',
    intro:
      '數學學習重在推導與驗證。將題目與已知數據輸入後，請優先檢視每一步的依據是否合理，再獨立重算一遍；考前仍應以課本與考古題為主建立肌肉記憶。',
    situations: ['高中職數學與微積分作業', '統計與機率題檢查觀念', '應用題建模卡住時'],
    faq: [
      { q: '圖形題也能問嗎？', a: '可描述圖形條件或搭配文字敘述；精確幾何仍建議手繪輔助。' },
      { q: '答案與課本不同？', a: '可能有多解或題目解讀差異，請與教師或同儕討論。' },
      { q: '計算機步驟可以嗎？', a: '可以請求分步驟，但考試能否使用工具依科系規定。' },
    ],
  }),

  buildKeywordPage('productivity', 'pomodoro-timer-online', '線上番茄鐘', {
    h1: '線上番茄鐘：25 分鐘專注工作法',
    seoTitle: 'Pomodoro timer online｜線上番茄鐘｜RxV',
    metaDescription:
      '使用瀏覽器即可啟動番茄鐘，25 分鐘專注＋短休息，提升讀書與工作效率。立即開啟 RxV 番茄鐘。',
    intro:
      '番茄工作法以固定時間區塊對抗分心與拖延。線上番茄鐘不需安裝 App，適合在辦公電腦或平板快速進入狀態；可依任務調整專注與休息長度，並與待辦清單搭配使用。',
    situations: ['遠距工作與撰寫長文件', '準備考試與論文寫作', '家務與專案分段完成'],
    faq: [
      { q: '一定要 25 分鐘嗎？', a: '不必，可依專注曲線微調，但建議固定一組設定至少一週再評估。' },
      { q: '休息時可以做什麼？', a: '離開螢幕、伸展或喝水，避免滑手機造成注意力發散。' },
      { q: '被打斷怎麼辦？', a: '可暫停或重新開始一輪，並記錄干擾來源以利之後改善環境。' },
    ],
  }),
  buildKeywordPage('productivity', 'focus-timer-online', '線上專注計時器', {
    h1: '線上專注計時器：自訂專注與休息節奏',
    seoTitle: 'Focus timer online｜專注計時｜RxV',
    metaDescription:
      '自訂專注時長與休息間隔，適合深度工作與冥想式單任務。使用 RxV 線上計時器，搭配待辦與摘要工具更有效率。',
    intro:
      '若你不使用固定 25 分鐘，而是依任務深度調整「專注區塊」，專注計時器能幫你維持節奏與儀式感。建議同一類任務採同一組時間設定，較容易建立可重複的工作流。',
    situations: ['程式開發與除錯', '創意發想與草稿撰寫', '家長陪讀與親子時間盒'],
    faq: [
      { q: '和番茄鐘差在哪？', a: '番茄鐘是常見的一組時間參數；專注計時器偏重自訂長度。' },
      { q: '可以全螢幕嗎？', a: '依瀏覽器與裝置而定，亦可將分頁獨立視窗置前提醒。' },
      { q: '長時間專注會倦怠？', a: '建議穿插短休息與身體活動，維持可持續的專注品質。' },
    ],
  }),

  buildKeywordPage('image-resize', 'linkedin-post-image-size', 'LinkedIn 動態圖片尺寸', {
    h1: 'LinkedIn 貼文與廣告圖片尺寸整理',
    seoTitle: 'LinkedIn 圖片尺寸｜動態牆與廣告版位｜RxV',
    metaDescription:
      '整理 LinkedIn 動態圖、連結預覽與常見圖文比例，並以線上尺寸工具裁切上稿，降低桌面與手機端裁切錯誤。',
    intro:
      'LinkedIn 在動態牆上會依裝置縮放圖片；若比例與解析度未對齊，重要資訊可能落在裁切區外。先決定貼文是單圖、輪播或廣告，再一次性輸出合適長寬，可減少重複上傳與重設。',
    situations: ['B2B 品牌每週發布貼文主視覺', '徵才與活動廣告用橫式圖', '文章分享連結的自訂預覽圖'],
    faq: [
      { q: '一定要特定像素嗎？', a: '平台會依裝置縮放，但建議使用常見比例與足夠解析度，可避免模糊與裁切。' },
      { q: '橫式與直式可以混用嗎？', a: '可以，但版面會以版位為準，建議先預覽桌機與手機。' },
      { q: '檔案太大無法上傳？', a: '可適度縮小解析度或搭配圖片壓縮。' },
    ],
  }),
  buildKeywordPage('image-resize', 'tiktok-vertical-cover-size', 'TikTok 直式封面尺寸', {
    h1: 'TikTok 直式影片與封面尺寸建議',
    seoTitle: 'TikTok 封面尺寸｜直式影片與裁切｜RxV',
    metaDescription:
      '說明 TikTok 直式影片常見 9:16 與封面顯示重點，並以線上尺寸工具裁切素材，與其他短影音平台素材分流管理。',
    intro:
      'TikTok 以直式全螢幕為主；若仍用橫式素材，預覽會顯得小或出現黑邊。封面與首幀決定滑動停留時間，建議與影片同為直式並預留標題安全區。',
    situations: ['短影音創作者製作直式封面', '從橫式素材改為直式發佈', '品牌活動需統一直式視覺'],
    faq: [
      { q: '可以和 IG Reels 共用尺寸嗎？', a: '比例接近時可共用，仍建議依各平台安全區微調。' },
      { q: '封面一定要跟影片第一幀一樣嗎？', a: '不必，但風格應一致，避免點進去落差太大。' },
      { q: '直式圖檔很大怎麼辦？', a: '完成尺寸後可用圖片壓縮降低上傳時間。' },
    ],
  }),
  buildKeywordPage('image-resize', 'x-twitter-image-size', 'X / Twitter 貼文圖片尺寸', {
    h1: 'X（Twitter）貼文圖片尺寸與比例',
    seoTitle: 'X Twitter 圖片尺寸｜貼文與預覽顯示｜RxV',
    metaDescription:
      '整理 X 貼文單圖、多圖與縮圖顯示習慣，並以線上尺寸工具調整長寬，減少時間軸裁切與模糊。',
    intro:
      'X 會依裝置與版位自動裁切預覽；若原圖比例與構圖未預留安全區，重要文字可能落在裁切區外。先決定單圖或多圖，再對齊長寬，可讓同一素材在桌機與手機上都維持可讀性。',
    situations: ['新聞稿與公告配圖', '產品截圖與梗圖發佈', '社群小編每日排程貼文'],
    faq: [
      { q: '多圖貼文每張都要同一尺寸嗎？', a: '不必相同，但相近比例較能維持滑動瀏覽時的整體感。' },
      { q: '長圖會被裁切嗎？', a: '依版位與裝置顯示而異，建議實機預覽一次。' },
      { q: '上傳後變模糊？', a: '可能是原圖解析度不足或過度壓縮，可適度提高輸出像素。' },
    ],
  }),

  buildKeywordPage('image-compress', 'compress-webp-online', '線上壓縮 WebP', {
    h1: '線上壓縮 WebP：更小檔案與網頁圖片',
    seoTitle: 'Compress WebP online｜WebP 線上壓縮｜RxV',
    metaDescription:
      '在瀏覽器內壓縮 WebP 圖檔，適合網站、部落格與 App 切圖。可選輸出格式並快速下載，降低載入與流量負擔。',
    intro:
      'WebP 在相同畫質下常比 JPG 更小，適合需要兼顧體積與透明度的網頁素材。若來源為 PNG 或 JPG，可先轉為 WebP 再壓縮，或直接在工具內選擇輸出格式。',
    situations: ['官網與部落格配圖瘦身', '前端切圖與 2x／3x 資產', '行動版頁面加速優化'],
    faq: [
      { q: '所有瀏覽器都支援 WebP 嗎？', a: '現代瀏覽器多已支援；若需支援舊版可保留 JPG／PNG 備援。' },
      { q: 'WebP 可以透明嗎？', a: '可以，但壓縮與格式選項需依工具支援度而定。' },
      { q: '壓縮後要改尺寸怎麼辦？', a: '可先調整尺寸再壓縮，或先壓縮再調尺寸，兩者搭配可得到較小檔案。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-screenshot-online', '截圖壓縮', {
    h1: '截圖壓縮：上傳與分享更輕量',
    seoTitle: '截圖壓縮｜線上縮小截圖檔案｜RxV',
    metaDescription:
      '針對螢幕截圖與視窗擷圖進行線上壓縮，適合表單、即時通與客服附檔。降低 KB 數同時保留可讀文字。',
    intro:
      '截圖常含 UI 與細字，檔案卻可能偏大。透過線上壓縮在可接受畫質下縮小體積，適合報名、請假與內部系統上傳；若平台有解析度下限，請先確認再壓縮。',
    situations: ['報名與證件截圖上傳', '客服對話與錯誤畫面回報', 'Email 夾帶多張說明圖'],
    faq: [
      { q: '壓縮後字會糊嗎？', a: '過度壓縮會，建議逐步調整並放大檢查細字。' },
      { q: 'PNG 截圖比較大？', a: '截圖多用 PNG；若不需透明可評估轉 JPG 或 WebP。' },
      { q: '有機敏資訊怎麼辦？', a: '可先遮罩或裁切敏感區再壓縮。' },
    ],
  }),

  buildKeywordPage('qr-code', 'line-official-qr-code', 'LINE 官方帳號 QR Code', {
    h1: 'LINE 官方帳號 QR Code：加好友與導流',
    seoTitle: 'LINE 官方帳號 QR｜加好友連結｜RxV',
    metaDescription:
      '將 LINE 官方帳號或加好友連結轉成 QR Code，方便文宣、名片與櫃台展示。線上產生器可下載 PNG／SVG。',
    intro:
      '實體通路與活動現場常需引導使用者加入 LINE 官方帳號。產生前請確認連結為官方提供之 HTTPS 加好友網址，並在印刷前用多款手機實測掃描。',
    situations: ['門市櫃台與結帳立牌', '傳單與名片背面', '展覽攤位與講者簡報尾頁'],
    faq: [
      { q: '連結要放哪一種？', a: '請使用官方後台提供的加好友或導流連結，並確認未過期。' },
      { q: '可以改顏色嗎？', a: '依工具支援度而定；需維持對比以利掃描。' },
      { q: '列印要多大？', a: '依觀看距離調整，並避免過小模糊。' },
    ],
  }),
  buildKeywordPage('qr-code', 'event-signup-qr-code', '活動報名 QR Code', {
    h1: '活動報名 QR Code：一掃填寫表單',
    seoTitle: '活動報名 QR Code｜表單與問卷｜RxV',
    metaDescription:
      '將活動報名、問卷或 Google 表單連結製成 QR Code，放置於海報與簡報，降低手動輸入網址錯誤。',
    intro:
      '實體活動最常流失名單的原因是「網址太長不好打」。把報名頁或問卷連結做成 QR，參加者掃描即可開啟；請確認表單為 HTTPS、行動版可讀，並在活動前實測一次。',
    situations: ['講座與課程報到', '社團與校園活動', '店內問卷與滿意度調查'],
    faq: [
      { q: '可以用短網址嗎？', a: '可以，但需確認短網址服務穩定，避免活動當天失效。' },
      { q: '掃了開錯頁？', a: '請檢查是否貼錯連結或舊版 QR 未更新。' },
      { q: '需要放 Logo 嗎？', a: '可選，但勿遮擋對掃描關鍵區域。' },
    ],
  }),

  buildKeywordPage('ai-summary', 'research-paper-summary', '論文與研究摘要', {
    h1: '論文／研究摘要：長文快速抓重點',
    seoTitle: 'Research paper summary｜論文摘要與筆記｜RxV',
    metaDescription:
      '將論文段落、摘要或引言貼上 AI 摘要工具，快速整理研究問題與方法；仍請人工核對數據與引用。',
    intro:
      '文獻探討與報告撰寫時，先讀摘要與結論再逐段深入，可節省時間。建議將長文分段貼上 AI 摘要，再合併成筆記架構；圖表、公式與專有名詞務必人工複核。',
    situations: ['研究所文獻回顧', '產業白皮書初讀', '比較多篇論文的論點'],
    faq: [
      { q: '摘要能直接寫進報告嗎？', a: '需改寫並註明引用，避免抄襲。' },
      { q: '公式與圖表會不會錯？', a: 'AI 對公式與圖表理解有限，務必對照原文。' },
      { q: '英文論文可以嗎？', a: '可以，專業術語建議人工複核。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'news-article-summary', '新聞摘要', {
    h1: '新聞摘要：長篇報導快速閱讀',
    seoTitle: 'News article summary｜新聞長稿整理｜RxV',
    metaDescription:
      '將新聞長稿或付費牆外可合法複製之段落貼上，取得段落重點與時間線；請遵守著作權與使用條款。',
    intro:
      '資訊量大時，先看標題與結論段落，再用 AI 產出條列重點，可決定是否深讀全文。請只貼上你有權使用之文字，並對人名、日期與數字再核對一次。',
    situations: ['每日新聞與產業週報', '公關稿與聲明稿整理', '內容策展與靈感收集'],
    faq: [
      { q: '可以貼整篇新聞嗎？', a: '請依著作權與平台條款；若不可全文複製，請以摘要自己讀過的段落。' },
      { q: '摘要能直接引用嗎？', a: '建議改寫並註明出處。' },
      { q: '即時新聞會不會過時？', a: '注意發布時間與後續更新稿。' },
    ],
  }),

  buildKeywordPage('homework-helper', 'chemistry-homework-helper', '化學作業解題', {
    h1: '化學作業解題：方程式與觀念提示',
    seoTitle: 'Chemistry homework help｜化學解題｜RxV',
    metaDescription:
      '針對化學平衡、反應式與計量題取得步驟提示。使用作業解題助手輔助思考，並自行驗算與練習類題。',
    intro:
      '化學題常需配平、單位換算與概念連結。輸入題目時請寫明已知、條件與疑問，請工具以「步驟與觀念」為主，再自行動手算一次；實驗安全與報告格式仍依學校規定。',
    situations: ['高中普通化學與選修', '化學計量與滴定題', '段考前觀念複習'],
    faq: [
      { q: '實驗題也能問嗎？', a: '可描述步驟與觀察，但安全操作以實驗課規範為準。' },
      { q: '答案與參考書不同？', a: '可能有多解或題目解讀差異，請與教師討論。' },
      { q: '可以只問觀念嗎？', a: '可以，建議先說明自己卡在哪一步。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'english-essay-helper', '英文作文與題意解讀', {
    h1: '英文作文題解讀與段落架構提示',
    seoTitle: 'English essay helper｜題意與架構｜RxV',
    metaDescription:
      '協助理解英文作文題意、拆解段落架構與論點方向；請自行撰寫完整文章並遵守學術誠信與課程規範。',
    intro:
      '英文寫作重在論證與結構。輸入題目後，請工具協助「題意拆解」與「段落大綱」，再由你獨立完成全文；若課程禁止 AI 輔助，請以教師規定為準。',
    situations: ['高中職英文作文', '大學英文寫作課', '多益／雅思寫作練習'],
    faq: [
      { q: '能直接交 AI 寫好的作文嗎？', a: '不建議，可能違反學術誠信；請用於理解題意與架構。' },
      { q: '可以請求範例句嗎？', a: '可請求思路，但正式文章需自己撰寫。' },
      { q: '字數與格式要求？', a: '請在題目中說明字數、格式與評分標準。' },
    ],
  }),

  buildKeywordPage('productivity', 'pomodoro-50-10', '50 分鐘專注工作法', {
    h1: '50／10 專注節奏：長區塊與短休息',
    seoTitle: '50 min focus timer｜長專注區塊｜RxV',
    metaDescription:
      '以 50 分鐘專注搭配 10 分鐘休息的節奏，適合深度工作與長篇閱讀。使用 RxV 線上番茄鐘自訂時間。',
    intro:
      '若 25 分鐘對你太短，可嘗試 50 分鐘連續專注再休息 10 分鐘。關鍵是固定同一組參數至少一週，並在休息時離開螢幕，避免滑手機打斷恢復。',
    situations: ['程式開發與重構', '論文寫作與長文閱讀', '設計與剪輯需要連續進入狀態時'],
    faq: [
      { q: '一定要 50 分鐘嗎？', a: '不必，可依任務調整；建議固定一組再評估。' },
      { q: '休息時可以做什麼？', a: '伸展、喝水、短走，避免回到社群。' },
      { q: '和 25 分鐘哪個好？', a: '依專注曲線與任務類型，兩者都可嘗試。' },
    ],
  }),

  buildKeywordPage('image-resize', 'instagram-story-size', 'Instagram Story 尺寸', {
    h1: 'Instagram Story 限時動態圖片尺寸說明',
    seoTitle: 'Instagram Story 尺寸｜9:16 限時動態｜RxV',
    metaDescription:
      '整理 IG Story 常見 9:16 直式比例、安全區與貼紙區，並以線上尺寸工具裁切素材，減少上稿被裁切或模糊。',
    intro:
      '限時動態以全螢幕直式為主，若仍用方形或橫式素材，預覽會留白或被強制裁切。建議先對齊 9:16 再疊字與貼圖，並預留頂底 UI 安全區。',
    situations: ['品牌每日 Story 與促銷倒數', '活動現場即時發文', '導流至連結或問卷的滑動素材'],
    faq: [
      { q: 'Story 跟 Reels 尺寸一樣嗎？', a: '多為直式 9:16，但版位與互動元件不同，建議分開預覽。' },
      { q: '可以放連結嗎？', a: '依帳號資格與平台規範；版面設計仍建議預留安全區。' },
      { q: '檔案太大上傳失敗？', a: '可適度縮小解析度或搭配圖片壓縮。' },
    ],
  }),
  buildKeywordPage('image-resize', 'youtube-banner-size', 'YouTube 頻道橫幅尺寸', {
    h1: 'YouTube 頻道橫幅（Channel Art）尺寸與安全區',
    seoTitle: 'YouTube banner 尺寸｜頻道橫幅與裁切｜RxV',
    metaDescription:
      '說明 YouTube 頻道橫幅在不同裝置的可視區與裁切差異，並以線上尺寸工具輸出素材，避免重要文字被切掉。',
    intro:
      '頻道橫幅會依電視、桌機與手機顯示不同可視範圍；若只依單一裝置設計，其他裝置可能看不到標語。建議先查官方建議尺寸，再把主視覺與文字放在跨裝置安全區內。',
    situations: ['新頻道開張與品牌改版', '課程與直播主更新橫幅', '活動檔期更換 CTA 文案'],
    faq: [
      { q: '橫幅一定要特定像素嗎？', a: '請依官方建議輸出，並用預覽確認各裝置裁切。' },
      { q: '可以放社群連結嗎？', a: '橫幅為靜態視覺，連結多在頻道其他區塊設定。' },
      { q: '和影片縮圖同一張？', a: '用途不同，建議分開設計。' },
    ],
  }),
  buildKeywordPage('image-resize', 'facebook-cover-size', 'Facebook 封面照片尺寸', {
    h1: 'Facebook 粉絲專頁封面照片尺寸',
    seoTitle: 'Facebook cover 尺寸｜粉絲專頁封面｜RxV',
    metaDescription:
      '整理粉專封面在不同裝置的顯示與裁切，並以線上尺寸工具調整長寬，讓主標與活動資訊留在安全區。',
    intro:
      '粉絲專頁封面會依桌機與手機裁切不同區域；若主視覺置中過滿，手機上可能只剩局部。建議使用官方建議比例輸出，並在實機預覽一次再正式上傳。',
    situations: ['品牌換季與活動檔期', '課程招生與講座宣傳', '社團與非營利專頁改版'],
    faq: [
      { q: '封面跟大頭貼會重疊嗎？', a: '會，請避免在左下角放關鍵資訊。' },
      { q: '可以用直式圖嗎？', a: '封面多為橫式版位，直式需評估裁切結果。' },
      { q: '上傳後變糊？', a: '請提高輸出解析度並避免過度壓縮。' },
    ],
  }),
  buildKeywordPage('image-resize', 'twitter-header-size', 'Twitter／X 頁首橫幅尺寸', {
    h1: 'X（Twitter）個人資料頁首橫幅尺寸',
    seoTitle: 'Twitter header 尺寸｜X 頁首橫幅｜RxV',
    metaDescription:
      '說明 X 個人資料頁首橫幅的建議比例與解析度，並以線上尺寸工具裁切，避免大頭貼遮擋主視覺。',
    intro:
      '頁首橫幅會與大頭貼、簡介並列顯示；若重要文字落在左下角，可能被頭像遮擋。建議依平台建議尺寸輸出，並在深色／淺色模式下各預覽一次。',
    situations: ['創作者與顧問更新個人品牌', '講者與課程宣傳', '求職與作品集導流'],
    faq: [
      { q: '跟貼文圖尺寸一樣嗎？', a: '不同，頁首橫幅為寬幅版型，請勿混用。' },
      { q: '手機會裁多少？', a: '依裝置而異，建議實機預覽。' },
      { q: '檔案格式限制？', a: '依平台公告為準，常見為 JPG／PNG。' },
    ],
  }),

  buildKeywordPage('image-resize', 'resize-image-for-instagram-profile', 'IG 大頭貼尺寸', {
    h1: 'Instagram 大頭貼圖片尺寸與裁切建議',
    seoTitle: 'IG 大頭貼尺寸｜個人檔案照片線上裁切｜RxV',
    metaDescription:
      '說明 Instagram 個人檔案大頭貼常見解析度與圓形裁切預覽，並以 RxV 圖片尺寸轉換輸出合適方形素材，避免上傳後模糊。',
    intro:
      '大頭貼雖以圓形顯示，上傳仍多為方形圖；若原始檔太小，放大後會糊。建議依官方建議邊長輸出，並把臉部或 Logo 留在中央安全區，再開啟圖片尺寸轉換一次到位。',
    situations: ['創作者與品牌統一各平台頭像', '新開帳號或改版時重製 Logo', '活動期間暫時換上主視覺頭貼'],
    faq: [
      { q: '為什麼看起來是圓的卻要傳方形？', a: '平台會套圓形遮罩，四角會被裁掉，故設計時應以中央為視覺重心。' },
      { q: '可以用透明背景 PNG 嗎？', a: '依平台規範；若不確定可先匯出實心底色版本測試。' },
      { q: '和限動尺寸一樣嗎？', a: '不同，限動多為直式全螢幕；頭貼為小尺寸方形。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-instagram-highlight', 'IG 精選動態封面', {
    h1: 'Instagram 精選動態（Highlight）封面尺寸',
    seoTitle: 'IG 精選動態封面尺寸｜限動精選縮圖｜RxV',
    metaDescription:
      '整理精選動態封面在小圓圈上的顯示邏輯與建議輸出尺寸，並用線上工具裁切圖示與標題可讀性，完成後前往圖片尺寸轉換。',
    intro:
      '精選封面會以圓形縮圖呈現，文字與圖示過細時在手機上難辨識。建議使用高對比、簡潔圖形，並在輸出前用工具對齊建議像素，避免上傳後被壓縮得過糊。',
    situations: ['品牌將產品線分類成多個精選', '餐飲店區分菜單、活動與評價', '創作者整理教學系列與合作案'],
    faq: [
      { q: '封面一定要用限動截圖嗎？', a: '不必，可另做靜態圖再上傳為封面。' },
      { q: '可以事後更換嗎？', a: '可以，隨時可替換精選封面圖檔。' },
      { q: '和一般貼文縮圖規則相同嗎？', a: '版位不同，精選以圓形小圖為主，構圖應更集中。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-instagram-carousel', 'IG 輪播貼文尺寸', {
    h1: 'Instagram 輪播（多圖）貼文圖片尺寸',
    seoTitle: 'IG 輪播貼文尺寸｜多張圖統一長寬｜RxV',
    metaDescription:
      '說明輪播貼文多張圖需比例一致的重要性，並以線上尺寸工具批次對齊寬高，減少滑動時跳版或留白，再開啟圖片尺寸轉換。',
    intro:
      '輪播時若各張比例不一，使用者滑動會感到突兀。建議先決定主比例（如 4:5 或 1:1），每張在相同畫布內排版，再用圖片尺寸轉換統一輸出，整體觀感會更專業。',
    situations: ['電商一則貼文展示多角度商品', '懶人包步驟圖分頁說明', '活動花絮多張橫圖改為統一直式'],
    faq: [
      { q: '第一張跟後面可以不同比例嗎？', a: '技術上可能允許，但體驗差；強烈建議全系列一致。' },
      { q: '最多幾張？', a: '依 Instagram 當前上限為準，請查官方說明。' },
      { q: '直式與方形混用？', a: '不建議；選一種主比例較利於閱讀。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-youtube-channel-art', 'YouTube 頻道圖稿尺寸', {
    h1: 'YouTube 頻道圖稿（Channel Art）與多裝置安全區',
    seoTitle: 'YouTube Channel Art 尺寸｜頻道橫幅安全區｜RxV',
    metaDescription:
      '對齊 YouTube 頻道橫幅建議解析度與電視／桌機／手機可視區差異，用 RxV 線上調整尺寸，避免標語在裁切線外。',
    intro:
      '頻道圖稿橫幅極寬，但手機可視區僅中央一段。請將品牌名、活動資訊放在跨裝置安全區，再用圖片尺寸轉換依官方建議像素輸出，電視端與手機端才不會各說各話。',
    situations: ['新頻道上架前製作橫幅', '季節活動更換頻道主視覺', '企業子頻道統一母品牌規範'],
    faq: [
      { q: '和影片縮圖同一尺寸嗎？', a: '不同；橫幅為寬幅，縮圖多為 16:9 但用途與版位不同。' },
      { q: '檔案過大無法上傳？', a: '可略降解析度或搭配圖片壓縮，仍須留意文字清晰度。' },
      { q: '如何確認安全區？', a: '建議參考官方範本或說明，並於上傳預覽中檢查。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-youtube-community-post', 'YouTube 社群貼文圖', {
    h1: 'YouTube 社群（Community）貼文配圖尺寸',
    seoTitle: 'YouTube 社群貼文圖片尺寸｜動態配圖裁切｜RxV',
    metaDescription:
      '整理社群動態常見橫式配圖與預覽裁切，協助頻道主用線上工具調整長寬與解析度，讓公告與投票附圖更清楚。',
    intro:
      '社群貼文會出現在訂閱者動態與頻道頁，配圖若比例怪異容易被裁掉關鍵訊息。建議以橫式 16:9 或平台當前建議為主，文字置於中央偏上，完成後用圖片尺寸轉換輸出。',
    situations: ['直播預告與開播倒數', '周更節目表與投票互動', '周邊與會員公告附圖'],
    faq: [
      { q: '社群圖跟 Shorts 封面一樣嗎？', a: '通常不同；Shorts 偏直式，社群橫圖多為橫式。' },
      { q: '沒開社群功能怎麼辦？', a: '依頻道資格與地區規範；可先備好尺寸一致的素材待用。' },
      { q: '可以傳直式嗎？', a: '依介面顯示可能留白或被裁切，建議先預覽再定稿。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-facebook-event-cover', 'Facebook 活動封面', {
    h1: 'Facebook 活動封面照片尺寸與資訊排版',
    seoTitle: 'Facebook 活動封面尺寸｜活動頁橫幅｜RxV',
    metaDescription:
      '說明活動封面在動態與活動頁的顯示比例，並以 RxV 圖片尺寸轉換調整橫幅，讓日期、地點與主題字在手機上仍清楚。',
    intro:
      '活動封面是點進詳情前的第一印象，橫幅過窄或字體過小會讓手機用戶滑過。建議使用官方建議寬幅輸出，主標置於視覺中心，次要資訊交給活動欄位文字補充。',
    situations: ['線下講座與讀書會', '直播與線上研討會報名頁', '市集與快閃店檔期宣傳'],
    faq: [
      { q: '跟粉絲專頁封面一樣嗎？', a: '版位與裁切可能不同，請勿直接套用同一張而不預覽。' },
      { q: '可以放 QR Code 嗎？', a: '可以，但需確保在手機縮圖上仍可掃描，避免過小。' },
      { q: '活動結束後圖片會怎樣？', a: '活動頁仍可能留存；建議沿用品牌視覺以便辨識。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-facebook-ad-image', 'Facebook 廣告圖尺寸', {
    h1: 'Facebook／Meta 廣告常用圖片比例與尺寸',
    seoTitle: 'Facebook 廣告圖尺寸｜動態版位配圖｜RxV',
    metaDescription:
      '整理動態消息常見 1:1、4:5 等廣告比例與解析度建議，並用線上工具裁切素材，降低投遞時被裁切或壓縮模糊。',
    intro:
      '同一素材在不同版位可能自動裁切；若未預留安全區，商品或價格字樣可能被切掉。建議依主要投放版位各輸出一版尺寸，或選最保守的中央構圖，再用圖片尺寸轉換批次處理。',
    situations: ['電商目錄廣告與單品促銷', 'App 下載與註冊轉換素材', '在地店家推廣限時優惠'],
    faq: [
      { q: '一張圖能通吃所有版位嗎？', a: '勉強可行但風險高；重要活動建議分版位輸出。' },
      { q: '文字佔比限制還存在嗎？', a: '政策會更新，請以 Meta 最新廣告規範為準。' },
      { q: '檔案太大被拒？', a: '可壓縮或略縮解析度，仍須維持邊緣銳利。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-twitter-card-image', 'Twitter／X 卡片預覽圖', {
    h1: 'X（Twitter）連結預覽卡（Summary Card）圖片尺寸',
    seoTitle: 'Twitter Card 圖片尺寸｜連結預覽縮圖｜RxV',
    metaDescription:
      '說明分享連結時預覽大圖常見比例與最小邊長，並以 RxV 調整配圖尺寸，讓貼文被轉推時縮圖仍清楚。',
    intro:
      '連結卡片的縮圖由網站 meta 與平台抓取規則決定；若原始圖比例不符，預覽可能上下裁切。建議先準備專用 2:1 或官方建議圖，用圖片尺寸轉換固定輸出，再更新到 CMS 或 meta 圖欄位。',
    situations: ['部落格新文上架前準備 og:image', '產品頁促銷期更換預覽圖', '活動報名頁分享至 X 的素材'],
    faq: [
      { q: '跟貼文內直接上傳的圖一樣嗎？', a: '不同；卡片圖多半來自連結後設定的預覽圖。' },
      { q: '更新後多久會變？', a: '平台快取可能延遲，可使用官方提供的除錯／預覽工具。' },
      { q: '一定要橫式嗎？', a: '多數卡片為橫式為主，請依文件與實測為準。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-twitter-ad-size', 'Twitter／X 廣告圖尺寸', {
    h1: 'X（Twitter）廣告素材常用尺寸與安全區',
    seoTitle: 'X 廣告圖片尺寸｜Promoted 版位裁切｜RxV',
    metaDescription:
      '整理 X 廣告常見單圖、影片縮圖與 App 安裝版位的建議長寬，並用線上工具對齊輸出，減少付費曝光卻被裁切的浪費。',
    intro:
      '付費版位與自然貼文的顯示區域不盡相同，字級與 CTA 若貼邊容易在深色模式或窄螢幕被切掉。建議依廣告後台建議尺寸製作，並預留四邊內縮安全距離。',
    situations: ['新產品上市第一波聲量', '網路研討會報名倒數', '行動 App 下載活動'],
    faq: [
      { q: '可以用自然貼文同一張圖嗎？', a: '可嘗試，但若裁切不佳建議另做廣告專用版。' },
      { q: '影片廣告要另準備靜態圖嗎？', a: '依版位可能需要封面圖，請以後台規格為準。' },
      { q: '深色模式文字看不見？', a: '避免純白底細字，或加上描邊與對比測試。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-linkedin-post', 'LinkedIn 動態配圖尺寸', {
    h1: 'LinkedIn 動態貼文配圖尺寸與裁切',
    seoTitle: 'LinkedIn 貼文圖片尺寸｜動態消息配圖｜RxV',
    metaDescription:
      '說明 LinkedIn 動態中橫式、方形與直式配圖的顯示差異，並以 RxV 圖片尺寸轉換統一輸出，適合 B2B 與求職品牌經營。',
    intro:
      'LinkedIn 使用者多在桌機與手機間切換，同一張圖在動態流裡可能被裁成不同可視區。建議以主要受眾裝置測試一次，並將關鍵訊息放在中央，再用工具固定像素輸出。',
    situations: ['求職者分享專案成果截圖', '公司專頁發布徵才與產品消息', '顧問與講者發布長文配圖'],
    faq: [
      { q: '直式圖會顯示完整嗎？', a: '在動態中可能需點開才看全，構圖應假設首屏只顯示局部。' },
      { q: '可以多張一起發嗎？', a: '依平台相簿功能；多張時仍建議比例一致。' },
      { q: '跟公司橫幅同一張？', a: '用途不同，公司橫幅為頁首寬幅，動態配圖規格不同。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-linkedin-company-banner', 'LinkedIn 公司頁橫幅', {
    h1: 'LinkedIn 公司專頁橫幅（Banner）尺寸',
    seoTitle: 'LinkedIn 公司橫幅尺寸｜企業頁首圖｜RxV',
    metaDescription:
      '整理公司頁橫幅建議解析度與桌機／手機可視區，並用線上尺寸工具輸出，讓標語與產品圖在招募與品牌訪客前留下好印象。',
    intro:
      '公司頁橫幅是訪客進入後第一眼品牌區；若只依桌機設計，手機上可能只剩模糊局部。建議依官方建議寬度輸出，並將核心訊息放在中央安全區，Logo 與文字避免貼底邊。',
    situations: ['新創完成品牌識別後上架', '企業併購或更名同步更新', '徵才季與展覽檔期換版'],
    faq: [
      { q: '跟個人檔案背景圖一樣嗎？', a: '規格可能不同，請分別查官方建議尺寸。' },
      { q: '可以放聯絡方式嗎？', a: '可以，但字級需在手機縮小後仍可讀。' },
      { q: '多久可更換一次？', a: '通常無硬性限制，但頻繁更換可能讓追蹤者混淆。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-pinterest-pin', 'Pinterest Pin 尺寸', {
    h1: 'Pinterest Pin（圖釘）建議比例與長圖尺寸',
    seoTitle: 'Pinterest Pin 尺寸｜長版釘圖裁切｜RxV',
    metaDescription:
      '說明 Pinterest 偏好直式長圖與常見 2:3 比例，並以 RxV 調整食譜、室內設計與教學懶人包素材，提升瀑布流上的可讀性。',
    intro:
      '瀑布流以直式長圖較佔版面，過扁的橫圖容易被略過。建議採 2:3 或平台當前建議比例，標題字置於上方三分之一，細節圖放中段，底部可放品牌或網址。',
    situations: ['美食部落客匯出食譜步驟圖', '電商將商品照做成長版情境圖', '設計靈感與裝潢 Before/After'],
    faq: [
      { q: '可以用正方形嗎？', a: '可以上傳，但在瀑布流中較不醒目。' },
      { q: '過長會被裁切嗎？', a: '依客戶端顯示可能折疊，請避免關鍵資訊放最底。' },
      { q: '要跟 IG 同一張嗎？', a: '可共用元素但建議依 Pinterest 比例另輸出一版。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-tiktok-thumbnail', 'TikTok 影片縮圖', {
    h1: 'TikTok 影片縮圖／封面圖尺寸',
    seoTitle: 'TikTok 縮圖尺寸｜影片封面裁切｜RxV',
    metaDescription:
      '整理 TikTok 直式影片封面在個人頁與搜尋結果的顯示重點，並用線上工具裁切 9:16 靜態圖，讓標題字與人臉不被裁掉。',
    intro:
      '縮圖決定滑動停留與否；若從橫式影片硬轉直式，上下黑邊會浪費版面。建議以 9:16 滿版構圖，臉部與主標放在中央偏上，並避免底部被介面按鈕遮擋。',
    situations: ['知識型創作者系列影片統一風格', '電商短影音展示單品', '樂團與活動宣傳 Teaser'],
    faq: [
      { q: '跟 TikTok 頭貼尺寸一樣嗎？', a: '不同，縮圖為直式全螢幕比例，頭貼為小圓形顯示。' },
      { q: '可以用影片截圖當封面嗎？', a: '可以，但建議微調對比與加字以提高辨識度。' },
      { q: '封面會影響演算法嗎？', a: '平台規則會變，但清晰封面通常有助點擊率。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-tiktok-profile', 'TikTok 個人檔案頭貼', {
    h1: 'TikTok 個人檔案頭貼圖片尺寸',
    seoTitle: 'TikTok 頭貼尺寸｜個人檔案照片｜RxV',
    metaDescription:
      '說明 TikTok 頭貼在小圓圈與個人頁上的顯示方式，並以 RxV 輸出足夠解析度的方形圖，避免與影片縮圖風格脫節。',
    intro:
      '頭貼尺寸過小會在關注列表與留言區顯得模糊。建議使用清晰臉部或簡化 Logo，並與帳號整體色調一致；輸出前用圖片尺寸轉換對齊建議邊長即可。',
    situations: ['創作者從其他平台搬遷同步頭像', '品牌帳號與子公司帳矩陣', '活動聯名期間換上聯名 Logo'],
    faq: [
      { q: '一定要用真人照片嗎？', a: '不必，但需符合社群規範與品牌識別。' },
      { q: '和 IG 頭貼能共用嗎？', a: '可以，但兩邊顯示大小不同，建議以較嚴格的一邊為準檢視。' },
      { q: '多久換一次合適？', a: '重大改版或檔期可換，過於頻繁可能降低辨識度。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-whatsapp-status', 'WhatsApp 狀態圖', {
    h1: 'WhatsApp 狀態（Status）圖片與比例',
    seoTitle: 'WhatsApp 狀態圖片尺寸｜限時動態式配圖｜RxV',
    metaDescription:
      '說明 WhatsApp 狀態以全螢幕直式顯示的習慣，並用線上工具將促銷圖、公告裁成合適比例，方便小型商家與社團快速發布。',
    intro:
      '狀態圖會在聯絡人列表以直立預覽呈現，橫式照片上下常有大片留白。建議改為 9:16 或裝置常見比例，文字放大並置於安全區，24 小時內有效訊息才看得清。',
    situations: ['社區店家每日限時優惠', '社團幹部轉發活動報名倒數', '自由工作者展示作品集片段'],
    faq: [
      { q: '跟 IG Story 可以同一張嗎？', a: '比例接近時可共用，仍建議各平台實機看一眼。' },
      { q: '影片狀態呢？', a: '此頁主要說明靜態圖；影片請用剪輯軟體對齊直式。' },
      { q: '隱私誰看得到？', a: '依帳號隱私設定與聯絡人分組；與尺寸無關。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-discord-banner', 'Discord 伺服器橫幅', {
    h1: 'Discord 伺服器橫幅與邀請預覽尺寸',
    seoTitle: 'Discord 橫幅尺寸｜伺服器封面圖｜RxV',
    metaDescription:
      '整理 Discord 伺服器邀請與介面中橫幅圖的建議寬高，並以 RxV 裁切遊戲公會、讀書會與開源專題社群的視覺，避免模糊與拉伸。',
    intro:
      '伺服器橫幅是新人加入前的第一印象，解析度不足時在桌機寬螢幕上會糊成一片。建議依官方建議像素製作向量或高解析點陣圖，再用圖片尺寸轉換輸出正確長寬。',
    situations: ['遊戲戰隊與公會招募季', '課程與讀書會社群換屆', '開源專案 Discord 與文件站連動'],
    faq: [
      { q: '免費伺服器也能設橫幅嗎？', a: '依 Discord 當前方案與權限為準，請查官方說明。' },
      { q: '可以用動圖嗎？', a: '依版位與方案而異；靜態圖最通用。' },
      { q: '跟個人檔案橫幅一樣嗎？', a: '規格不同，請分開製作。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-shopify-product', 'Shopify 商品圖尺寸', {
    h1: 'Shopify 商品主圖與圖庫建議尺寸',
    seoTitle: 'Shopify 商品圖尺寸｜電商主圖裁切｜RxV',
    metaDescription:
      '說明 Shopify 主題常見正方形或固定長寬商品圖習慣，並用線上工具統一白底圖與情境圖輸出，提升集合頁與搜尋結果整齊度。',
    intro:
      '商品圖長寬不一時，集合頁網格會高低不平，影響信任感。建議訂定店內規範（如 2048px 正方形或 4:5），主圖去背或一致底色，細節圖再補不同角度，全部經圖片尺寸轉換對齊。',
    situations: ['獨立站新上架百款 SKU', '季節系列換統一風格情境照', '從市集平台搬圖到自有站'],
    faq: [
      { q: '一定要正方形嗎？', a: '視主題而定，但一致比例通常較美觀。' },
      { q: '檔案太大影響速度？', a: '可壓縮並依實際顯示寬度輸出，不必盲目上傳原檔。' },
      { q: '要跟 Amazon 同圖？', a: '可共用，但各平台主圖規範不同，請分別檢查。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-amazon-product', 'Amazon 商品圖尺寸', {
    h1: 'Amazon 商品主圖與輔圖尺寸建議',
    seoTitle: 'Amazon 商品圖尺寸｜主圖白邊與邊長｜RxV',
    metaDescription:
      '整理電商主圖常見邊長與佔比要求的方向性說明，並以 RxV 調整長寬與構圖，協助賣家減少審核退件與縮圖模糊。',
    intro:
      '主圖若邊長不足或商品佔比不符，可能被拒或影響搜尋縮圖清晰度。建議先閱讀當前類目規範，預留必要留白，輔圖可放尺寸表與情境，再經工具統一輸出像素。',
    situations: ['新賣家首批 SKU 上架', '品牌註冊後更新 A+ 前的主圖優化', '多國站點同步素材'],
    faq: [
      { q: '主圖一定要純白底嗎？', a: '多數類目有要求，請以 Seller Central 最新規範為準。' },
      { q: '可以放文字在主圖嗎？', a: '通常主圖限制較嚴，促銷字建議放輔圖。' },
      { q: '跟 Shopify 同尺寸？', a: '不必相同；各平台縮圖與規範不同。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-blog-featured-image', '部落格精選圖尺寸', {
    h1: '部落格精選圖（Featured Image）與 OG 預覽',
    seoTitle: '部落格精選圖尺寸｜文章首圖與分享預覽｜RxV',
    metaDescription:
      '說明文章列表與社群分享預覽對橫式精選圖的常見比例，並用 RxV 對齊主題版型與 og:image，減少分享時被裁得面目全非。',
    intro:
      '主題列表多為固定寬高比縮圖，若精選圖比例不合，會被硬裁或上下補色。建議對齊主題建議尺寸，並另準備一張符合 Open Graph 習慣的橫圖供 Facebook、LinkedIn 等抓取。',
    situations: ['技術部落格每週發文', '內容行銷與 SEO 長文', '電子報摘要連回網站時的預覽圖'],
    faq: [
      { q: '精選圖跟內文插圖要一樣嗎？', a: '不必，但風格一致較佳；精選圖可更簡潔。' },
      { q: '直式照片怎麼當精選？', a: '可裁成橫式焦點區或加邊框，再輸出符合主題比例。' },
      { q: '更新舊文需要重設尺寸嗎？', a: '若換主題或分享預覽不佳，值得批次調整。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-email-banner', '電子報橫幅圖尺寸', {
    h1: 'Email 電子報橫幅（Banner）寬度與 Retina',
    seoTitle: 'Email 橫幅圖尺寸｜EDM 配圖寬度｜RxV',
    metaDescription:
      '說明常見 600px 左右內容寬與 Retina 倍率下的輸出建議，並以 RxV 調整促銷橫幅與報名倒數圖，降低信箱客戶端變形與載入過慢。',
    intro:
      '多數電子報版型以 600px 內容寬為主，過寬會被縮放或出現橫向捲軸。若需 Retina 清晰，可輸出 1200px 寬再於 HTML 指定顯示寬度；檔案過大則影響開信速度，可搭配壓縮。',
    situations: ['電商週報與檔期促銷', 'SaaS 產品更新與教學信', '活動主辦方寄送報名提醒'],
    faq: [
      { q: '一定要 600px 嗎？', a: '常見如此，但請依你使用的 EDM 範本實測。' },
      { q: '背景圖跟橫幅圖差別？', a: '橫幅多為內嵌圖片；全背景在部分客戶端支援度較差。' },
      { q: 'GIF 動畫可以嗎？', a: '部分客戶端不播放或僅首幀；重要訊息勿只放在動畫裡。' },
    ],
  }),

  buildKeywordPage('image-compress', 'compress-png-500kb', 'PNG 壓縮至 500KB', {
    h1: '將 PNG 壓到約 500KB：表單與上傳限制',
    seoTitle: 'PNG 壓縮 500KB｜線上縮檔｜RxV',
    metaDescription:
      '說明如何將 PNG 在可讀範圍內壓到約 500KB，適合表單、投件與內部系統。使用 RxV 線上圖片壓縮搭配必要時縮小尺寸。',
    intro:
      '許多系統限制單檔 500KB 或相近門檻。PNG 若含透明或細線條，建議先確認最小可接受解析度，再調整壓縮強度；必要時略縮長邊比硬壓更有效。',
    situations: ['政府與學校線上報名附檔', '競賽與投件系統', '客服上傳截圖佐證'],
    faq: [
      { q: '壓不到 500KB 怎麼辦？', a: '可略為縮小長邊像素或改評估是否需透明。' },
      { q: '透明會不見嗎？', a: '正常流程會保留；若異常請檢查輸出格式。' },
      { q: '比 500KB 稍大可以嗎？', a: '依平台規定；若硬性上限請再微調品質。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-website', '網站用圖片壓縮', {
    h1: '網站用圖片壓縮：載入速度與畫質平衡',
    seoTitle: '網站圖片壓縮｜Web 效能與 SEO｜RxV',
    metaDescription:
      '從響應式尺寸、格式選擇到壓縮強度，說明如何縮小網站配圖又不明顯影響觀感。線上壓縮 JPG／PNG／WebP。',
    intro:
      '圖檔過大會拖慢 LCP 與消耗流量。建議依實際顯示寬度輸出，再選 JPG／WebP／PNG，最後調壓縮；部落格與電商首圖特別值得批次處理。',
    situations: ['部落格與官網改版', '電商列表與內容頁配圖', 'Landing Page 首屏大圖'],
    faq: [
      { q: '要先改尺寸還是先壓縮？', a: '多數情境先對齊顯示尺寸再壓縮較有效率。' },
      { q: 'WebP 一定比較好嗎？', a: '通常更小，但仍需考量瀏覽器支援與後台流程。' },
      { q: 'Retina 螢幕要 2x 嗎？', a: '可依設計稿與斷點決定，避免輸出過大原始檔。' },
    ],
  }),
  buildKeywordPage('image-compress', 'reduce-image-quality-safe', '安全降低畫質以縮檔', {
    h1: '安全降低畫質：肉眼可接受與檔案下降',
    seoTitle: '圖片壓縮畫質｜安全降品質｜RxV',
    metaDescription:
      '說明如何逐步調整壓縮強度、放大檢視邊緣與文字，在不明顯損害觀感下縮小檔案。適合批次與表單上傳前檢查。',
    intro:
      '「安全」代表先保留原檔，只對副本動手；並以肉眼在 100% 與縮小預覽比對。建議從溫和壓縮開始，出現色塊或摩爾紋再回退一級。',
    situations: ['相簿與活動照片批次瘦身', '簡報內嵌照片', '即時通傳送大量圖片'],
    faq: [
      { q: '壓多次會更糊嗎？', a: '會，每次有損壓縮可能累積雜訊，請保留原檔。' },
      { q: '文字截圖要注意什麼？', a: '請放大檢視筆畫是否斷裂或鋸齒。' },
      { q: '和解析度有關嗎？', a: '有，像素過高時先縮尺寸再壓縮往往更有效。' },
    ],
  }),

  buildKeywordPage('image-compress', 'compress-png-under-200kb', 'PNG 壓至 200KB 以下', {
    h1: 'PNG 壓到 200KB 以下：透明圖與介面素材',
    seoTitle: 'PNG 壓縮 200KB｜透明圖線上縮檔｜RxV',
    metaDescription:
      '針對表單、作品集與設計稿常見的 200KB 上限，說明如何保留透明與銳利邊緣的同時縮檔。使用 RxV 線上圖片壓縮並視情況略縮長邊。',
    intro:
      '200KB 比 500KB 更嚴格，UI 截圖與 Logo 若邊長過大，只靠壓縮可能仍超標。建議先評估實際顯示寬度，必要時將長邊降到合理像素，再分階調整壓縮強度並放大檢視透明邊緣是否出現雜邊。',
    situations: ['設計師投遞作品集單檔限制', '政府或校內系統證件掃描上傳', 'App Store 截圖前製素材瘦身'],
    faq: [
      { q: '透明底變髒或出現白邊？', a: '可能壓過頭，請略降壓縮強度或減少不必要的高解析度。' },
      { q: '向量匯出 PNG 很大怎麼辦？', a: '匯出時先對齊實際使用尺寸，再壓縮較有效。' },
      { q: '改 JPG 會比較小嗎？', a: '通常會，但會失去透明；若必須透明請維持 PNG。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-png-under-100kb', 'PNG 壓至 100KB 以下', {
    h1: 'PNG 壓到 100KB 以下：極限門檻與取捨',
    seoTitle: 'PNG 壓縮 100KB｜超小檔上傳｜RxV',
    metaDescription:
      '面對 100KB 等極小上限時，如何取捨解析度、色彩與透明，並用 RxV 線上壓縮逐步逼近目標，避免文字與線條糊成一片。',
    intro:
      '100KB 通常代表系統刻意限制流量或儲存；此時「完整保留原畫質」往往不切實際。請先確認最小可讀尺寸，優先保留對比與文字區域，背景與漸層可適度犧牲，並避免對同一檔案反覆有損壓縮。',
    situations: ['老舊報名系統單檔極小', '簡訊或內部系統附件', '大量使用者同時上傳的尖峰時段'],
    faq: [
      { q: '壓不到 100KB 是否違規？', a: '若為硬性上限只能再縮像素或簡化內容。' },
      { q: '彩色圖比單色難壓？', a: '是，色階與漸層會佔用較多位元。' },
      { q: '要先裁切再壓嗎？', a: '裁掉無用留白常比硬壓更有效。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-blog', '部落格配圖壓縮', {
    h1: '部落格文章配圖壓縮：閱讀體驗與流量',
    seoTitle: '部落格圖片壓縮｜文章配圖載入｜RxV',
    metaDescription:
      '從內文寬度、精選圖到插圖，說明如何壓縮部落格圖檔又不讓文字截圖與圖表失真。線上完成後再嵌入 CMS。',
    intro:
      '讀者在行動網路開文，首屏若被大圖拖慢容易跳出。建議依主題內容寬輸出，長文多圖可採一致品質參數；程式碼截圖與圖表需特別放大檢查細線是否斷裂，再使用圖片壓縮處理副本。',
    situations: ['技術部落格每篇多張截圖', '旅遊與美食部落格高清相機原檔', '新聞型網站轉載配圖'],
    faq: [
      { q: '精選圖與內文圖要同一參數嗎？', a: '不必，但建議訂出上限與命名規則方便維運。' },
      { q: 'Lazy load 還要壓縮嗎？', a: '要，延遲載入只解決順序問題，檔案仍影響總流量。' },
      { q: 'CDN 會自動壓縮還要做嗎？', a: '若上傳源檔過大，仍浪費儲存與第一次處理成本。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-shopify', 'Shopify 商品圖壓縮', {
    h1: 'Shopify 商品圖壓縮：列表網格與 zoom',
    seoTitle: 'Shopify 圖片壓縮｜商品照縮檔｜RxV',
    metaDescription:
      '說明商品主圖、情境照與細節圖在縮圖與放大檢視下的壓縮策略，並以 RxV 線上壓縮維持邊緣銳利與檔案合理。',
    intro:
      '電商顧客會快速滑過集合頁，亦會點開 zoom 看材質。過度壓縮會在放大時露餡；完全不壓又拖慢行動版。建議主圖對齊主題建議長邊後再壓縮，維持批次一致參數，必要時為 zoom 保留略高品質的一組輸出。',
    situations: ['上新百款 SKU 前批次處理', '從供應商取得 10MB+ 原圖', '季節活動替換橫幅與促銷條'],
    faq: [
      { q: '主圖與輔圖要同檔案大小嗎？', a: '不必相同，但建議訂上限避免單張異常巨大。' },
      { q: 'WebP 在 Shopify 可行嗎？', a: '依主題與流程而定；請依官方與主題文件設定。' },
      { q: '壓縮後顏色跑掉？', a: '檢查色彩描述檔與匯出設定，避免多次轉檔。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-wordpress', 'WordPress 圖片壓縮', {
    h1: 'WordPress 媒體庫圖片壓縮與尺寸衍生',
    seoTitle: 'WordPress 圖片壓縮｜媒體庫瘦身｜RxV',
    metaDescription:
      '說明上傳前壓縮與 WP 自動裁切尺寸的關係，協助站長用 RxV 先縮檔再匯入，減少主機空間與備份負擔。',
    intro:
      'WordPress 會依主題產生多種縮圖尺寸；若上傳 8000px 原檔，系統仍可能存多份衍生檔。建議上傳前對齊實際展示所需長邊並壓縮，可顯著降低媒體庫體積；外掛壓縮與線上壓縮可並用，但源頭控制最省時間。',
    situations: ['多作者網站規範供稿', '搬家主機前清媒體庫', 'WooCommerce 商品與分類圖'],
    faq: [
      { q: 'Full Size 還要留很大嗎？', a: '若無列印或下載需求，可不必保留過大原圖。' },
      { q: '外掛壓縮會損畫質嗎？', a: '多為有損壓縮，請備份並抽查放大畫面。' },
      { q: 'SVG 也要壓？', a: 'SVG 為向量，流程不同；此工具以點陣圖為主。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-seo', 'SEO 用圖片壓縮', {
    h1: 'SEO 導向的圖片壓縮：Core Web Vitals 與爬行預算',
    seoTitle: 'SEO 圖片壓縮｜網頁效能與排名｜RxV',
    metaDescription:
      '從 LCP、檔案體積與行動優先索引角度，說明壓縮如何輔助 SEO。使用 RxV 線上壓縮搭配適當 alt 與尺寸輸出。',
    intro:
      '搜尋引擎重視使用者體驗，過大圖檔拉長 LCP 可能間接影響評價。壓縮不是萬靈丹，但與正確寬高、現代格式、延遲載入搭配時，能讓同樣內容載入更快；請保留語意化檔名與替代文字，與壓縮並行。',
    situations: ['內容站整站效能健檢後修圖', '新文章上線前標準化配圖', '修復 Search Console 速度回饋'],
    faq: [
      { q: '壓縮會讓圖片搜尋排名變差嗎？', a: '重點在相關性與技術可索引性；適度壓縮不影響主題辨識。' },
      { q: '結構化資料與壓縮有關嗎？', a: '無直接關係，但頁面整體速度影響使用者停留。' },
      { q: '要先優化首圖嗎？', a: '通常首屏與 LCP 候選圖優先處理效益最大。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-website-speed', '網站速度用圖片壓縮', {
    h1: '為網站速度壓縮圖片：首屏與整體傳輸量',
    seoTitle: '網站加速圖片壓縮｜載入與流量｜RxV',
    metaDescription:
      '聚焦「變快」而非泛泛的網站用圖：如何挑大檔元兇、設定合理預算，並用 RxV 壓縮降低 KB 數與請求體感。',
    intro:
      '速度優化常從瀑布圖找最大資產開始。圖片往往是第一名。請列出首屏與滾動兩屏內的圖，逐張對齊顯示寬度並壓縮；全站可訂「單張上限 KB」規範，避免編輯隨手上傳相機原檔。',
    situations: ['Landing 首屏大圖瘦身', '行動版 PageSpeed 分數改善', '開發者交接前資產盤點'],
    faq: [
      { q: '和 SEO 頁的差異？', a: '本頁偏重體感與傳輸量；SEO 頁多談搜尋訊號與索引面向。' },
      { q: '壓完仍慢可能是？', a: '可能是伺服器、腳本、字型或其他資源，請綜合檢測。' },
      { q: '要全部轉 WebP 嗎？', a: '視受眾瀏覽器與維運成本，漸進導入較穩。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-photo-for-upload', '上傳用照片壓縮', {
    h1: '各種「上傳失敗」前的照片壓縮',
    seoTitle: '上傳照片壓縮｜表單與平台限制｜RxV',
    metaDescription:
      '針對單檔大小、邊長與格式不符導致無法上傳的情境，說明如何用 RxV 線上壓縮與必要時縮小尺寸，一次通過驗證。',
    intro:
      '手機照片單張常達數 MB，表單與求職系統卻限制 1～5MB。與其反覆試錯，不如先複製副本、依限制目標調整長邊，再壓縮到通過為止；人像皮膚與髮絲請放大檢視，避免摩爾紋過重。',
    situations: ['求職履歷大頭照與證件', '活動報名生活照', '客服工單附圖多張'],
    faq: [
      { q: '顯示「檔案過大」但已壓過？', a: '可能仍需縮小像素或改格式符合平台。' },
      { q: 'HEIC 要先轉嗎？', a: '多數網頁表單不接受 HEIC，請先轉 JPG／PNG 再壓縮。' },
      { q: '可批次嗎？', a: '依工具支援；重點是每張都符合上限。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-instagram', 'Instagram 用圖壓縮', {
    h1: 'Instagram 貼文與限動前的圖片壓縮',
    seoTitle: 'IG 圖片壓縮｜貼文與限動檔案｜RxV',
    metaDescription:
      '說明 IG 會再處理上傳檔的前提下，為何仍建議先壓縮與對齊尺寸，減少上傳失敗與細節被演算法壓糊。使用 RxV 線上圖片壓縮。',
    intro:
      '平台會重壓縮，但來源檔過大可能在上傳階段就卡住，或讓細節在多次處理後更差。建議先依貼文／限動目標尺寸輸出，再溫和壓縮到合理 KB，保留足夠細節給平台第二階段處理。',
    situations: ['創作者每日多則貼文', '品牌檔期大量素材排程', '相機 RAW 轉出後先瘦身再上傳'],
    faq: [
      { q: 'IG 會壓縮還要先壓？', a: '先控制檔案與尺寸有助穩定上傳與預覽品質。' },
      { q: '限動與貼文參數相同嗎？', a: '版位不同，建議分開輸出與檢查。' },
      { q: '檔案越小越好？', a: '過小可能細節不足；請在通過上傳與觀感間取平衡。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-facebook', 'Facebook 用圖壓縮', {
    h1: 'Facebook 貼文與廣告素材的圖片壓縮',
    seoTitle: 'Facebook 圖片壓縮｜動態與廣告｜RxV',
    metaDescription:
      '針對動態消息、活動與廣告版位，說明如何避免超大檔拖慢預覽與編輯器卡頓。RxV 線上壓縮協助批次處理素材。',
    intro:
      '小編常一次上傳多組圖做 A/B 測試，原檔過大會讓後台預覽與排程變慢。建議在設計匯出後即訂定長邊與 KB 上限，廣告與自然貼文可採不同品質策略；文字疊在圖上者務必檢查壓縮後字緣是否發毛。',
    situations: ['粉專每日貼文與限時', '社團活動多圖公告', 'Meta 廣告後台大量素材'],
    faq: [
      { q: '廣告與貼文壓縮要一樣嗎？', a: '廣告常需更清晰字樣，可略鬆品質或較嚴格控尺寸。' },
      { q: '上傳後變糊是誰的問題？', a: '可能為平台再壓縮；來源仍建議不過度破壞細節。' },
      { q: '可以多張批次？', a: '建議每張符合版位與檔案習慣，避免單張異常。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-twitter', 'X／Twitter 用圖壓縮', {
    h1: 'X（Twitter）貼文附圖壓縮與預覽清晰度',
    seoTitle: 'Twitter 圖片壓縮｜X 貼文附圖｜RxV',
    metaDescription:
      '說明時間軸縮圖與點開大圖的差異，以及如何壓縮附圖讓梗圖、圖表在時間軸上仍辨識。使用 RxV 線上圖片壓縮。',
    intro:
      '時間軸上圖片顯示面積有限，但使用者點開後仍希望清晰。建議輸出時保留中央構圖重點，壓縮時留意細字與線條；若為長截圖，可先裁切關鍵區或分段上傳策略（依平台規範）。',
    situations: ['技術推文附長截圖', '新聞圖表與數據視覺化', '活動直播截圖即時發文'],
    faq: [
      { q: '長截圖壓縮後字變小？', a: '時間軸縮圖本就不利長圖，可考慮裁切重點區。' },
      { q: '動圖與靜圖策略？', a: '動圖檔案型態不同，此頁以靜態點陣圖為主。' },
      { q: '多次上傳同一張？', a: '避免對同一有損檔反覆壓縮，保留原檔再輸出。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-linkedin', 'LinkedIn 用圖壓縮', {
    h1: 'LinkedIn 動態與文章配圖壓縮',
    seoTitle: 'LinkedIn 圖片壓縮｜專業動態配圖｜RxV',
    metaDescription:
      'B2B 與求職場景下，配圖需兼顧專業感與載入速度。說明如何用 RxV 壓縮簡報截圖、數據圖與活動照片。',
    intro:
      'LinkedIn 讀者常在通勤途中滑動，圖檔過大徒增等待。簡報匯出圖常含大面積漸層與細字，壓縮時請放大檢查座標軸標籤；活動合照則注意臉部細節與西裝紋理是否可接受。',
    situations: ['顧問分享案例截圖', '公司專頁產品更新圖', '徵才與展覽花絮'],
    faq: [
      { q: '簡報匯出 PNG 很大？', a: '可先改匯出長邊或改 JPG 視背景需求。' },
      { q: '要多正式的文件品質？', a: '螢幕閱讀不需印刷 DPI，對齊螢幕寬即可。' },
      { q: '與個人檔案橫幅有關嗎？', a: '橫幅屬另一版位；此頁以動態配圖為主。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-discord', 'Discord 用圖壓縮', {
    h1: 'Discord 聊天與伺服器貼圖的圖片壓縮',
    seoTitle: 'Discord 圖片壓縮｜上傳與表情｜RxV',
    metaDescription:
      '說明頻道內嵌圖、梗圖與貼圖在檔案限制下的壓縮技巧，並以 RxV 線上壓縮避免上傳失敗或載入拖慢他人客戶端。',
    intro:
      '社群頻道訊息量大，單則若塞入數 MB 梗圖會拖慢行動版與低網速成員。建議在分享前習慣性壓縮，迷因與截圖可接受較強壓縮；若需細節（如遊戲地圖標註）則保留較溫和設定並提醒點開原圖。',
    situations: ['遊戲公會戰報長截圖', '開源專案頻道錯誤截圖', '讀書會分享頁面摘圖'],
    faq: [
      { q: 'Nitro 與一般上傳差異？', a: '依帳號與平台當前限制為準，壓縮仍有助他人體驗。' },
      { q: '動圖貼圖？', a: 'GIF 流程不同；此工具以 JPG／PNG／WebP 等為主。' },
      { q: '壓太糊被抱怨？', a: '可改傳連結或使用較溫和壓縮後重傳。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-email', '電子郵件內嵌圖壓縮', {
    h1: 'Email 內嵌圖片壓縮：開信速度與配額',
    seoTitle: 'Email 圖片壓縮｜內嵌與附件｜RxV',
    metaDescription:
      '說明 HTML 信內嵌圖與附件在檔案大小上的差異，並用 RxV 壓縮降低整封信體積，避免進垃圾匣與客戶端卡頓。',
    intro:
      '整封信過大可能影響投遞與開信體驗。內嵌圖建議對齊實際顯示寬度並壓縮；若圖僅供下載檢視，可改附件並在內文放較小預覽圖。請在主流信箱各測一次載入與清晰度。',
    situations: ['電子報促銷大橫幅', '內部通告含多張截圖', '客服回信附步驟圖'],
    faq: [
      { q: '內嵌與附件哪個好？', a: '內嵌利於排版預覽；附件利於保留高品質原檔。' },
      { q: 'Retina 螢幕要 2x 內嵌嗎？', a: '可適度，但整信體積須監控。' },
      { q: '壓縮會觸發垃圾信？', a: '體積只是因素之一，內容與寄件信譽亦重要。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-upload', '上傳前圖片壓縮', {
    h1: '上傳前壓縮圖片：截圖、設計稿與雲端附件',
    seoTitle: '圖片上傳前壓縮｜表單與雲端附件｜RxV',
    metaDescription:
      '針對報名表、內部系統、雲端硬碟與協作平台的上傳限制，說明如何先用 RxV 壓縮圖檔、必要時縮小長邊，避免逾時與驗證失敗。',
    intro:
      '各種非相機來源的圖檔——螢幕截圖、UI 匯出、掃描轉圖——常混在同一個上傳流程裡。與著重手機照片的頁面相比，本頁整理通用步驟：先確認平台單檔與總量上限，再決定是否裁切、壓縮或改格式，最後以實際上傳結果驗收。',
    steps: [
      '讀取目標平台的上傳規則（單檔 MB、邊長、允許格式）。',
      '在 RxV 開啟圖檔；若邊長遠大於顯示需求，可先縮小長邊再壓縮。',
      '下載後以檔案總管確認大小，必要時重複微調強度。',
      '於表單或雲端介面試傳；失敗時記錄錯誤訊息並對照是否為格式或總量限制。',
    ],
    situations: ['政府或學校線上報名附圖', '企業內部工單與簽核附件', '設計師交付客戶可下載的預覽圖包'],
    faq: [
      { q: '與「上傳用照片壓縮」差在哪？', a: '該頁以手機照片為主；本頁涵蓋截圖、稿與掃描等較廣義圖檔。' },
      { q: '總量上限怎麼辦？', a: '需分檔或改傳連結；單張壓縮無法突破總量。' },
      { q: '透明 PNG 壓完變大？', a: '少數內容改 WebP／PNG 策略；可試略縮尺寸。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-for-thumbnail', '縮圖與封面壓縮', {
    h1: '縮圖、封面與清單小圖的壓縮策略',
    seoTitle: '縮圖壓縮｜清單與封面檔案｜RxV',
    metaDescription:
      '小圖不需要印刷級解析度；說明如何依顯示像素訂上限並壓縮，讓列表頁一次載入大量縮圖仍流暢。RxV 線上圖片壓縮。',
    intro:
      '縮圖若在資料庫裡仍是 4000px 寬，只浪費頻寬。請先依 UI 設計稿輸出對應長邊（例如 400px），再壓縮；批次網站與影片列表可節省可觀流量。放大預覽僅需勉強可辨識即可。',
    situations: ['影片列表格縮圖', '電商分類頁網格', '後台媒體庫預覽圖'],
    faq: [
      { q: '縮圖可以壓很狠嗎？', a: '若無點開大圖需求，通常可以；若有 lightbox 請保留另一張較大版本。' },
      { q: '同一張大圖派生縮圖？', a: '建議程式或工具產生專用尺寸，而非只靠 CSS 縮小大圖。' },
      { q: 'WebP 縮圖？', a: '在支援環境下通常體積更佳。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-large-image-file', '超大圖檔壓縮', {
    h1: '超大圖檔壓縮：相機原圖與掃描檔',
    seoTitle: '大圖檔壓縮｜相機與掃描瘦身｜RxV',
    metaDescription:
      '面對單檔十數 MB 的相機輸出或掃描 TIFF／PNG，說明先縮尺寸再壓縮的順序與注意事項。使用 RxV 線上圖片壓縮處理副本。',
    intro:
      '檔案「超大」多半來自像素過多而非壓縮不足。若最終僅在螢幕展示，先把長邊降到合理範圍再壓縮，往往比對原圖硬壓省時間且畫質更好。印刷用途請另備高解析版本，勿覆蓋唯一原檔。',
    situations: ['活動攝影一次上千張備份前', '建築與產品大圖給客戶預覽', '掃描合約存雲端'],
    faq: [
      { q: '先壓縮再縮小可以嗎？', a: '可以，但通常先縮像素再壓縮效率較佳。' },
      { q: '線上工具吃得下超大檔？', a: '依瀏覽器與裝置記憶體而定，過大請分批或改用桌面軟體。' },
      { q: '會不會傷原始拍攝資料？', a: '有損壓縮會；請保留 RAW 或原圖備份。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-photo-for-website', '網站用照片壓縮', {
    h1: '網站用照片壓縮：與「網站用圖」差異在情境',
    seoTitle: '網站照片壓縮｜人像與生活照｜RxV',
    metaDescription:
      '聚焦攝影感照片（人像、活動、旅遊）上站時的壓縮，說明膚色、雜訊與銳化在壓縮後的變化。RxV 線上壓縮搭配適當長邊。',
    intro:
      '與 UI 截圖或扁平插畫不同，照片有大面積漸層與雜訊，壓過頭易出現色塊。建議略保守的壓縮強度，必要時先微縮長邊；批次時抽幾張人像與夜景檢查，再套用相似參數。',
    situations: ['婚禮與活動攝影師交付網頁版', '品牌官網 About 團隊照', '旅遊部落格高清相簿'],
    faq: [
      { q: '和一般「網站用圖」壓縮說明有重疊嗎？', a: '該頁涵蓋較廣；本頁強調人像與生活照的質感與雜訊。' },
      { q: '要先修圖再壓嗎？', a: '重大曝光修正建議在先，壓縮為最後一步之一。' },
      { q: '印刷還要再給一組檔？', a: '是，印刷應使用高解析未過度壓縮檔。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-without-quality-loss', '盡量不損畫質的壓縮', {
    h1: '盡量維持畫質的圖片壓縮：期待與現實',
    seoTitle: '圖片壓縮不失真？｜可逆與取捨｜RxV',
    metaDescription:
      '釐清「無損」與「肉眼無感」差異，說明 PNG／WebP 無損與有損並用情境。RxV 協助在可接受範圍內縮小檔案。',
    intro:
      '嚴格無損代表檔案未必明顯變小；要大幅降體積通常需有損壓縮。實務上多以「放大看仍可接受」為標準，並保留原始檔。若必須長期歸檔，可採無損或低壓縮副本另存。',
    situations: ['設計交付需保留可編輯餘地', '法遵與證據鏈截圖', '品牌主視覺多版本 AB'],
    faq: [
      { q: '真的完全不失真嗎？', a: '有損壓縮本質上會；無損格式降幅有限。' },
      { q: '為何檔案變化很小？', a: '可能已接近無損極限或來源已高度壓縮。' },
      { q: '和「安全降畫質」那類做法差在哪？', a: '該類著重操作步驟與安全邊界；本頁先釐清無損與有損的期待。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-image-fast-online', '快速線上壓縮圖片', {
    h1: '快速線上壓縮：少步驟、立刻下載',
    seoTitle: '快速線上壓縮圖片｜免安裝｜RxV',
    metaDescription:
      '適合臨時寄信、投稿截止與客服回覆前幾分鐘的急件情境：瀏覽器內壓縮、快速預覽結果。使用 RxV 圖片壓縮工具主頁流程。',
    intro:
      '急用時不要重新學一套桌面軟體。將檔案拖入、選擇可接受的品質或目標大小、下載即可。建議仍保留原檔於本機；若結果不符預期，可退回一級品質或改縮長邊再試一次。',
    situations: ['會議前壓縮插圖塞進簡報', '投稿截止前五分鐘', '外包窗口臨時要求縮檔'],
    faq: [
      { q: '快是否代表畫質差？', a: '不一定，取決於你的目標檔案大小與來源解析度。' },
      { q: '需要註冊嗎？', a: '依產品設計；重點是流程短、可預覽。' },
      { q: '可以連續處理多張嗎？', a: '依工具支援；批次時注意總時間與裝置效能。' },
    ],
  }),
  buildKeywordPage('image-compress', 'compress-multiple-images-online', '線上批次壓縮多張圖', {
    h1: '線上一次壓縮多張圖片：一致參數與檢查',
    seoTitle: '批次壓縮圖片線上｜多檔案｜RxV',
    metaDescription:
      '說明多張圖片壓縮時如何訂定統一品質或上限、抽查邊緣案例，並用 RxV 線上工具減少逐張手動重複。',
    intro:
      '批次不是「同一參數適用所有內容」，而是「先訂規則再抽查」。建議分類：照片、截圖、扁平插畫，各給一組參數；每類隨機抽三張放大檢視。若單張異常過大，單獨處理以免拖累整批設定。',
    situations: ['電商上新一次數十張', '簡報匯出整包圖片', '網站搬家前媒體庫整理'],
    faq: [
      { q: '一組參數壓全部可以嗎？', a: '可當起點，但截圖與照片常需不同強度。' },
      { q: '批次會不會當機？', a: '總像素與記憶體有限，建議分批處理超大專案。' },
      { q: '如何命名輸出？', a: '建議加後綴或資料夾區分，避免覆蓋原檔。' },
    ],
  }),

  buildKeywordPage('qr-code', 'wifi-qr-code-cafe', '咖啡廳 WiFi QR Code', {
    h1: '咖啡廳／餐飲店 WiFi QR Code 製作',
    seoTitle: '咖啡廳 WiFi QR｜店內連線｜RxV',
    metaDescription:
      '將店內 WiFi 名稱與密碼製成 QR Code，放置於桌卡與櫃台，減少口頭拼字錯誤。並提醒訪客網路與內網資安分界。',
    intro:
      '顧客常重複詢問 WiFi 密碼；改以 QR 顯示於桌邊或立牌可加速連線。請使用訪客或店內專用 SSID，並在密碼變更時同步更新 QR 圖檔。',
    situations: ['咖啡廳與輕食店', '共享辦公與工作室', '民宿公共區域'],
    faq: [
      { q: '公開密碼安全嗎？', a: '掃碼等同取得密碼，建議使用訪客網路並定期更換。' },
      { q: '雙頻路由器怎麼標示？', a: '可產生兩張或註明 2.4G／5G 供客人選擇。' },
      { q: '密碼改了怎麼辦？', a: '需重新產生 QR 並替換現場展示。' },
    ],
  }),
  buildKeywordPage('qr-code', 'instagram-profile-qr', 'Instagram 個人檔案 QR', {
    h1: 'Instagram 個人檔案 QR Code：一掃追蹤',
    seoTitle: 'Instagram profile QR｜加追蹤｜RxV',
    metaDescription:
      '將 IG 個人檔案或精選連結製成 QR Code，用於名片、海報與活動背板，方便離線導流至社群。',
    intro:
      '實體活動與名片能放的文字有限，加上 QR 可導向完整 IG 檔案。產生前請確認網址為官方分享連結（HTTPS），印刷前用多款手機實測掃描。',
    situations: ['創作者與攝影師名片', '市集攤位與音樂活動', '店面櫃台與會員招募'],
    faq: [
      { q: '要用哪個網址？', a: '請使用 IG 個人檔案可公開存取之分享連結。' },
      { q: '可以放 Logo 嗎？', a: '依工具支援度，需保留對比與可掃描性。' },
      { q: '改名稱後連結會變嗎？', a: '若使用帳號網址，改名可能影響，請重新確認。' },
    ],
  }),
  buildKeywordPage('qr-code', 'event-checkin-qr', '活動報到 QR Code', {
    h1: '活動報到與簽到 QR Code',
    seoTitle: '活動報到 QR｜簽到與核銷｜RxV',
    metaDescription:
      '將報到頁、簽到表或票券驗證連結製成 QR Code，放置於入口與工作人員手持牌，加速入場。',
    intro:
      '中大型活動若以紙本簽名易排隊；改以 QR 導向線上簽到或票券頁，可縮短等待。請確認連結在活動當日可用，並備援紙本流程。',
    situations: ['研討會與年會報到', '課程與工作坊簽到', '展覽與音樂會入場'],
    faq: [
      { q: '離線場地訊號不好？', a: '可備離線名單或暫存流程，並事先壓力測試連結。' },
      { q: '可以一碼多人嗎？', a: '依主辦系統設計；通常一人一碼較易核銷。' },
      { q: '連結會過期嗎？', a: '依票務或表單設定，請在活動前確認。' },
    ],
  }),
  buildKeywordPage('qr-code', 'payment-link-qr', '收款連結 QR Code', {
    h1: '收款／付款連結 QR Code',
    seoTitle: 'Payment link QR｜收款連結｜RxV',
    metaDescription:
      '將金流或收款頁連結製成 QR Code，用於市集攤位、服務櫃台與個人接案，減少手動輸入網址錯誤。',
    intro:
      '小額交易與現場收款常需快速展示付款方式。請使用官方或可信金流提供的 HTTPS 連結，並在展示前自行掃描測試；避免使用來路不明的短網址。',
    situations: ['市集與文創攤位', '家教與接案服務', '社團與活動現場收款'],
    faq: [
      { q: '可以連到 LINE Pay 嗎？', a: '依平台是否提供可分享之收款連結，再貼入產生器。' },
      { q: '短網址安全嗎？', a: '請使用可信服務，並確認最終導向正確。' },
      { q: '需要列印多大？', a: '依顧客掃描距離調整，並保持邊緣留白。' },
    ],
  }),

  buildKeywordPage('qr-code', 'website-url-qr-code', '網站網址 QR Code', {
    h1: '網站首頁與活動頁網址 QR Code',
    seoTitle: '網址 QR Code｜官網與活動頁｜RxV',
    metaDescription:
      '將官網、一頁式活動或報名頁網址製成 QR Code，印在傳單、簡報末頁與店內立牌；掃描即開瀏覽器，免手打網址。使用 RxV QR Code 產生器。',
    intro:
      '實體場景最惱人的是長網址念給對方聽還打錯。把「最終希望對方到達的那一頁」貼進產生器即可，必要時先用官方短網址或 UTM 追蹤，但請確認短網址服務可信且連結不會突然失效。',
    situations: ['講座投影片最後一頁放報名連結', '實體店面貼「線上型錄」', '展覽攤位讓訪客帶走網址'],
    faq: [
      { q: '要用 http 還是 https？', a: '請優先使用 https，較不易被瀏覽器阻擋。' },
      { q: '列印要多少解析度？', a: '依尺寸與掃描距離，建議向量輸出或足夠像素，邊緣留白。' },
      { q: '換網址怎麼辦？', a: '需重新產生 QR；若用自有網域轉址較易維護。' },
    ],
  }),
  buildKeywordPage('qr-code', 'pdf-download-qr-code', 'PDF 下載 QR Code', {
    h1: 'PDF 說明書／講義下載 QR Code',
    seoTitle: 'PDF QR Code｜文件下載連結｜RxV',
    metaDescription:
      '將雲端或官網上的 PDF 直接連結製成 QR Code，適合課程講義、產品說明與菜單；掃描後開啟或下載。使用 RxV 線上產生器。',
    intro:
      '紙本空間有限時，用 QR 銜接完整 PDF 很實用。請確認連結權限為「知道連結者可讀」或適當分享設定，並在行動裝置實測一次；若檔案會更新，建議固定檔名與網址策略以免舊 QR 失效。',
    situations: ['工作坊發紙本大綱、詳細步驟放 PDF', '家電外包裝連到安裝手冊', '餐廳紙本菜單連到過敏原表'],
    faq: [
      { q: '連到 Google Drive 可以嗎？', a: '可以，但須設為可分享且權限符合需求。' },
      { q: '手機會直接下載嗎？', a: '依瀏覽器與檔案類型可能先預覽；請自行測試。' },
      { q: '可以放 Logo 在 QR 中間嗎？', a: '若工具支援，請保留足夠對比與錯誤修正等級。' },
    ],
  }),
  buildKeywordPage('qr-code', 'youtube-channel-qr-code', 'YouTube 頻道 QR Code', {
    h1: 'YouTube 頻道訂閱連結 QR Code',
    seoTitle: 'YouTube 頻道 QR｜訂閱導流｜RxV',
    metaDescription:
      '將頻道首頁或訂閱用網址做成 QR Code，用於名片背面、影片片尾卡與活動背板，方便觀眾開啟 YouTube。RxV 免費產生。',
    intro:
      '口頭請人「搜尋頻道名」常因拼字或同名頻道失敗。請複製瀏覽器網址列上完整的頻道連結（含 https），產生後用自己的手機在戶外光線下試掃一次；若頻道網址日後變更需重製。',
    situations: ['實體課程學員帶走複習頻道', '音樂與表演者在 merch 桌展示', '企業內訓錄影後導向公開頻道'],
    faq: [
      { q: '要放自訂網址頻道嗎？', a: '若已設定，請使用該官方導向之連結。' },
      { q: '能直接開啟最新影片嗎？', a: '請改貼單支影片連結另做一碼。' },
      { q: '列印在深色紙上？', a: '請確保模組與背景對比足夠，必要時加白底框。' },
    ],
  }),
  buildKeywordPage('qr-code', 'youtube-video-qr-code', 'YouTube 單片 QR Code', {
    h1: 'YouTube 單支影片連結 QR Code',
    seoTitle: 'YouTube 影片 QR｜單片分享｜RxV',
    metaDescription:
      '將特定教學、直播重播或宣傳影片網址製成 QR Code，印在講義、海報或簡報；掃描直達該片。使用 RxV QR Code 產生器。',
    intro:
      '與頻道首頁不同，單片 QR 適合「這次活動只看這一支」的情境。請使用分享選單複製的標準 watch 連結，避免帶入過多追蹤參數導致網址過長難以檢查錯誤。',
    situations: ['課堂指定觀看作業影片', '產品發表會連到介紹片', '醫衛衛教單張連動畫說明'],
    faq: [
      { q: '未公開影片可以嗎？', a: '掃碼者需具備相同觀看權限，否則會看到限制訊息。' },
      { q: 'Shorts 連結一樣嗎？', a: '可以，貼上該 Short 的分享網址即可。' },
      { q: '下載 PNG 給印刷店？', a: '建議索取向量或高解析點陣，並說明實際印製尺寸。' },
    ],
  }),
  buildKeywordPage('qr-code', 'spotify-qr-code', 'Spotify 歌單 QR Code', {
    h1: 'Spotify 歌單、專輯與節目連結 QR Code',
    seoTitle: 'Spotify QR｜歌單與專輯｜RxV',
    metaDescription:
      '將 Spotify 公開歌單、專輯或 Podcast 連結製成 QR Code，用於婚禮桌卡、咖啡店播放清單與活動暖場；掃描開啟 App 或網頁。RxV 產生器。',
    intro:
      '音樂連結很長又含地區參數，手打幾乎不可行。請從 Spotify 分享複製連結，產生 QR 後用有安裝 App 與未安裝的手機各測一次；若活動在國外，請留意版權與可用性為平台決定，與 QR 無關。',
    situations: ['婚禮進場曲清單給賓客', '咖啡廳本週主題歌單', '讀書會搭配節目單集'],
    faq: [
      { q: '沒裝 Spotify 掃了會怎樣？', a: '多數會導向網頁或商店下載頁，依平台而定。' },
      { q: '私人歌單？', a: '掃碼者需能存取該清單，否則請改公開或調權限。' },
      { q: '能放專輯封面在碼中？', a: '若工具支援嵌入圖示，請勿遮擋關鍵定位點。' },
    ],
  }),
  buildKeywordPage('qr-code', 'facebook-page-qr-code', 'Facebook 粉絲專頁 QR Code', {
    h1: 'Facebook 粉絲專頁／社團連結 QR Code',
    seoTitle: 'Facebook 粉專 QR｜按讚導流｜RxV',
    metaDescription:
      '將粉絲專頁或公開社團網址做成 QR Code，放在收據、包裝與店面；顧客掃描後開啟 Facebook。使用 RxV 線上產生器。',
    intro:
      '小商家常希望客人「回去給個評論或追蹤動態」。請使用電腦版複製的完整粉專網址，避免用到需登入才看得見的後台連結；若同時經營 IG，可並列兩張 QR 讓客人選。',
    situations: ['外帶杯套印追蹤粉專', '社區活動招募成員', '診所衛教後追蹤健康資訊'],
    faq: [
      { q: '未登入 Facebook 掃了會怎樣？', a: '可能看到登入頁或公開預覽，依頁面設定。' },
      { q: '社團要審核？', a: 'QR 只負責開連結，審核仍由社團設定決定。' },
      { q: '貼在玻璃櫥窗反光？', a: '可改用霧面貼紙或內貼反掃，並加大尺寸。' },
    ],
  }),
  buildKeywordPage('qr-code', 'twitter-profile-qr-code', 'X／Twitter 個人檔案 QR Code', {
    h1: 'X（Twitter）個人檔案或貼文 QR Code',
    seoTitle: 'Twitter／X 個人檔案 QR｜RxV',
    metaDescription:
      '將 X 個人檔案或置頂貼文連結製成 QR Code，用於演講投影片、Podcast show notes 與技術簡報，方便聽眾當場追蹤。RxV 免費產生。',
    intro:
      '技術圈與新聞圈仍常用 X 交換觀點。若希望對方追蹤你本人，貼個人檔案網址；若希望擴散某一則聲明，改貼該則貼文連結。產生後注意 X 偶爾調整網域與介面，舊書籤若失效請更新連結後重製 QR。',
    situations: ['研討會講者放聯絡方式', '記者會後聲明連結', '開源專案維護者社交帳號'],
    faq: [
      { q: '帳號改名網址會變嗎？', a: '可能影響，請以當下可開啟的網址為準並定期檢查。' },
      { q: '要導向特定 hashtag？', a: '可貼搜尋結果或即時頁連結，但連結穩定性請自行評估。' },
      { q: '黑白列印可掃嗎？', a: '可以，關鍵是對比與模組清晰，避免過細。' },
    ],
  }),
  buildKeywordPage('qr-code', 'linkedin-profile-qr-code', 'LinkedIn 個人檔案 QR Code', {
    h1: 'LinkedIn 個人檔案或公司頁 QR Code',
    seoTitle: 'LinkedIn 個人檔案 QR｜職涯｜RxV',
    metaDescription:
      '將 LinkedIn 公開檔案或公司頁網址製成 QR Code，用於求職博覽會、名片與講者介紹，掃描即開專業履歷頁。使用 RxV QR Code 產生器。',
    intro:
      '實體徵才與商務場合，紙本履歷來不及更新時，QR 可補上最新職歷與作品連結。請確認檔案為「公開」或對方登入後可見之範圍；若你只想分享精簡版，可改連到個人網站再從網站連到 LinkedIn。',
    situations: ['校園徵才攤位', '顧問與自由工作者換名片', '研討會講者 extended bio'],
    faq: [
      { q: '對方沒有 LinkedIn？', a: '可能看到註冊或登入頁；可另備個人網站 QR。' },
      { q: '英文版網址可以嗎？', a: '可以，只要貼上後掃描可正確開啟即可。' },
      { q: '能放頭像在 QR 中？', a: '需評估工具與可掃描性，避免破壞定位。' },
    ],
  }),
  buildKeywordPage('qr-code', 'discord-server-qr-code', 'Discord 伺服器邀請 QR Code', {
    h1: 'Discord 伺服器邀請連結 QR Code',
    seoTitle: 'Discord 伺服器 QR｜邀請連結｜RxV',
    metaDescription:
      '將永不過期或限時邀請連結製成 QR Code，用於遊戲公會、讀書會與開源社群 onboarding；掃描開啟 Discord。RxV 線上產生。',
    intro:
      '邀請連結若設次數或時限，過期後 QR 即失效，請在文案旁註明有效期限。建議由管理員從伺服器設定產生官方邀請，勿使用來路不明的第三方「一鍵邀請」服務，以免導向釣魚頁。',
    situations: ['實體聚會拉人進語音', '課程學員專屬討論區', '開源專案 issue 以外的即時協作'],
    faq: [
      { q: '邀請撤銷後？', a: '舊 QR 會失效，需用新邀請重製。' },
      { q: '手機沒裝 Discord？', a: '通常會導向下載或網頁版，依平台。' },
      { q: '列印在 T 恤上？', a: '布料彎曲會影響掃描，建議大尺寸與高對比。' },
    ],
  }),
  buildKeywordPage('qr-code', 'telegram-channel-qr-code', 'Telegram 頻道／群組 QR Code', {
    h1: 'Telegram 頻道、群組與機器人連結 QR Code',
    seoTitle: 'Telegram 頻道 QR｜訂閱導流｜RxV',
    metaDescription:
      '將 t.me 公開頻道、群組或 Bot 連結製成 QR Code，用於新聞推播、社群公告與客服入口；掃描開啟 Telegram。使用 RxV 產生器。',
    intro:
      'Telegram 連結格式固定且短，很適合做 QR。請確認連結對「未加入成員」仍可開啟預覽；若頻道改為私密，舊 QR 可能變成無效，需重新發布邀請策略。',
    situations: ['新聞媒體即時推播訂閱', '加密社群公告', '活動現場加入通知群'],
    faq: [
      { q: '地區封鎖問題？', a: '屬網路與法規層面，QR 僅傳遞連結。' },
      { q: '可以放頻道頭貼在碼內？', a: '依工具與錯誤修正等級，務必實測掃描。' },
      { q: '與 WhatsApp 群組連結差異？', a: '連結格式與 App 不同，請分開產生。' },
    ],
  }),
  buildKeywordPage('qr-code', 'google-map-location-qr-code', 'Google 地圖店家 QR Code', {
    h1: 'Google 地圖地點／導航 QR Code',
    seoTitle: 'Google Maps QR｜店家導航｜RxV',
    metaDescription:
      '將 Google 地圖上特定地點或路線分享連結製成 QR Code，貼在邀請函、官網聯絡頁與活動指引牌，掃描直接開啟地圖。RxV 免費產生。',
    intro:
      '請從 Google 地圖使用「分享」取得官方連結，確認座標與店名正確；若店面搬家，務必更新地圖資訊並重製 QR，否則客人會被導到舊址。室內活動可另在文案寫棟別與樓層補強。',
    situations: ['婚禮喜帖導航', '新開幕店面路引', '偏遠活動場地集合點'],
    faq: [
      { q: 'Apple 地圖使用者？', a: '多數仍會開啟 Google 地圖或詢問是否切換，依裝置而定。' },
      { q: '短連結與長連結？', a: '兩者皆可，重點是最終導向正確座標。' },
      { q: '戶外日曬貼紙褪色？', a: '選用耐候材質或定期更換，避免模組斷線。' },
    ],
  }),
  buildKeywordPage('qr-code', 'google-form-qr-code', 'Google 表單 QR Code', {
    h1: 'Google 表單問卷／報名 QR Code',
    seoTitle: 'Google Form QR｜問卷與報名｜RxV',
    metaDescription:
      '將已發布的 Google 表單網址製成 QR Code，印在講義、海報與簡訊後補連結；掃描填寫。使用 RxV QR Code 產生器，並注意回覆上限與權限。',
    intro:
      '表單請設為「知道連結的使用者」可填（或符合你需求的權限），並在活動前用手機匿名視窗測一次。若表單會收集個資，請在表單首段寫清楚用途與保存期間，與 QR 並列於同張印刷品上。',
    situations: ['課後滿意度調查', '實體活動現場報名補單', '店內客訴與建議收集'],
    faq: [
      { q: '回覆額滿會怎樣？', a: '依 Google 方案與設定，可能無法再填；請監控後台。' },
      { q: '需要登入 Google 嗎？', a: '依表單設定而定，請在測試時確認。' },
      { q: '可以縮短網址嗎？', a: '可以，但請使用可信短網址並自行掃描驗證。' },
    ],
  }),
  buildKeywordPage('qr-code', 'google-drive-file-qr-code', 'Google 雲端硬碟檔案 QR Code', {
    h1: 'Google 雲端硬碟檔案或資料夾分享 QR Code',
    seoTitle: 'Google Drive QR｜檔案分享｜RxV',
    metaDescription:
      '將雲端硬碟中檔案或資料夾的「取得連結」網址製成 QR Code，適合講義、大型檔案與協作用資料夾；務必檢查權限。RxV 產生器。',
    intro:
      '最常見錯誤是連結仍為「僅限擁有者」或忘了開給知道連結的人。產生 QR 前請用無痕視窗開啟連結測試；若檔案含敏感資料，建議改為有期限權限並在活動後撤銷，而非長期公開。',
    situations: ['工作坊大型素材包', '社團共享參考資料', '客戶交付暫存區'],
    faq: [
      { q: '連結被盜掃怎麼辦？', a: '公開連結等同任何人可存取，敏感檔請勿長期公開。' },
      { q: '影片檔很大？', a: 'QR 只帶網址，流量由雲端與觀看端承擔。' },
      { q: '想改為僅限機構？', a: '請改用 Google Workspace 分享規則，並更新 QR。' },
    ],
  }),
  buildKeywordPage('qr-code', 'dropbox-file-qr-code', 'Dropbox 檔案 QR Code', {
    h1: 'Dropbox 分享連結 QR Code',
    seoTitle: 'Dropbox QR｜檔案下載｜RxV',
    metaDescription:
      '將 Dropbox 檔案或資料夾分享連結製成 QR Code，方便活動現場索取簡報、音檔與設計稿；掃描開啟 Dropbox 預覽或下載。使用 RxV 產生器。',
    intro:
      '與其他雲端相同，權限優先於 QR 本身。請確認連結未過期、密碼保護設定符合場景；若你希望「只能看不能下載」，需依 Dropbox 功能設定，並理解不同客戶端行為可能不同。',
    situations: ['攝影工作交件給客戶', '音樂營隊發放伴奏檔', '設計競賽繳件範本'],
    faq: [
      { q: '分享連結可以關閉嗎？', a: '可以，關閉後 QR 即失效。' },
      { q: '需要 Dropbox 帳號？', a: '依分享設定與檔案類型而定，請實測。' },
      { q: '列印在名片背面？', a: '注意尺寸勿過小，並保留安靜區。' },
    ],
  }),
  buildKeywordPage('qr-code', 'app-download-qr-code', 'App 下載 QR Code', {
    h1: 'App Store／Google Play 下載 QR Code',
    seoTitle: 'App 下載 QR｜iOS Android｜RxV',
    metaDescription:
      '將官方商店連結或開發者提供的下載頁製成 QR Code，用於海報、簡報與客服指引；掃描導向正確商店頁。使用 RxV QR Code 產生器。',
    intro:
      '若同時支援 iOS 與 Android，可考慮兩張 QR 或一個智慧轉址頁（需自行維護）。請勿使用非官方重新打包連結；產生後用 iPhone 與 Android 各掃一次確認未被商店區域限制擋下。',
    situations: ['實體活動推廣自家 App', '餐廳點餐 App 桌貼', 'IoT 裝置配對說明卡'],
    faq: [
      { q: '一個 QR 兩平台？', a: '需中介頁偵測裝置，單一商店連結只適用該平台。' },
      { q: '測試版 TestFlight？', a: '連結與權限不同，請用測試人員可開之網址。' },
      { q: 'Logo 用 App 圖示？', a: '可，但中間嵌入須測試多機掃描。' },
    ],
  }),
  buildKeywordPage('qr-code', 'website-login-qr-code', '網站登入頁 QR Code', {
    h1: '網站登入／註冊頁 QR Code（資安提醒）',
    seoTitle: '登入頁 QR Code｜帳號安全｜RxV',
    metaDescription:
      '將官方登入或註冊頁網址製成 QR Code，用於店內會員開通或活動現場開帳號；請務必確認網域正確、避免釣魚。RxV 僅協助產生圖碼。',
    intro:
      '登入頁 QR 適合「縮短到達正確網域的距離」，但若張貼場所公開，惡意人士可能覆蓋假 QR。請搭配店員引導、HTTPS 與官方網域檢查；切勿把帳密編進 QR——QR 只應帶公開網址。',
    situations: ['實體門市引導註冊會員', '展場試用 SaaS 開帳', '圖書館數位資源登入說明'],
    faq: [
      { q: '掃到假網站怎麼辦？', a: '請比對網域與憑證，活動主辦應固定展示官方印製 QR。' },
      { q: '可以帶 token 登入嗎？', a: '不建議把敏感憑證放進可被拍攝的靜態 QR。' },
      { q: '多久換一次展示？', a: '若曾外洩或活動結束，建議撤下公開張貼。' },
    ],
  }),
  buildKeywordPage('qr-code', 'event-ticket-qr-code', '活動電子票券 QR Code', {
    h1: '活動電子票／通行證連結 QR Code',
    seoTitle: '電子票 QR Code｜活動驗票｜RxV',
    metaDescription:
      '將票務平台提供的票券、訂單或錢包頁連結製成 QR Code，用於工作人員引導或自助報到（依主辦流程）；列印前請確認連結仍有效。RxV 產生器。',
    intro:
      '此頁指「把票務網址做成 QR」方便出示，與主辦方系統產生的動態驗票碼不同——若主辦規定必須使用 App 內動態碼，請遵守主辦規則。靜態連結 QR 適合導向「取票說明」或「訂單頁」類用途。',
    situations: ['小型活動以表單＋付款後導向票頁', '社團收費活動人工驗證', '展覽工作人員快速開後台'],
    faq: [
      { q: '可以截圖分享給朋友嗎？', a: '依票務規定，多數禁止轉讓或共用。' },
      { q: '離線驗票？', a: '需主辦端離線方案；單純網址 QR 仍仰賴連線。' },
      { q: '列印黑白可以嗎？', a: '通常可以，但請依驗票設備要求。' },
    ],
  }),
  buildKeywordPage('qr-code', 'restaurant-table-qr-code', '餐廳桌邊 QR Code', {
    h1: '餐廳桌邊點餐、菜單與評論 QR Code',
    seoTitle: '餐廳桌邊 QR｜點餐與菜單｜RxV',
    metaDescription:
      '將線上菜單、點餐頁或 Google 評論連結製成 QR Code，貼在桌面立牌與帳單夾；客人掃描免觸碰紙本菜單。使用 RxV 產生器。',
    intro:
      '桌邊 QR 常同時承載「點餐」「加會員」「寫評論」等多個目的，建議分碼分功能，避免一個連結讓客人迷路。油漬與消毒水會磨損貼紙，選耐刮材質並定期檢查是否仍可掃描。',
    situations: ['簡餐店自助點餐', '咖啡廳季節限定菜單', '連鎖店統一加盟物料'],
    faq: [
      { q: '老人家不會掃？', a: '保留紙本菜單與店員協助，QR 為輔助。' },
      { q: '一店多張桌同碼？', a: '若需辨識桌號，請用帶桌號參數的不同連結。' },
      { q: '要打品牌 Logo？', a: '可以，務必實測各角度與光線。' },
    ],
  }),
  buildKeywordPage('qr-code', 'contact-vcard-qr-code', '聯絡人 vCard QR Code', {
    h1: 'vCard（.vcf）聯絡人資訊 QR Code',
    seoTitle: 'vCard QR Code｜通訊錄一掃加入｜RxV',
    metaDescription:
      '將內含姓名、電話、Email 的 vCard 資料或託管頁連結製成 QR Code，用在會議名牌與展覽胸牌；掃描加入手機聯絡人。依 RxV 工具支援格式使用產生器。',
    intro:
      '部分產生器支援直接編碼 vCard 文字，部分則需你先將 .vcf 上傳雲端再貼連結。請注意個資法與工作場合規範，公開張貼前確認你愿意揭露的欄位；國際活動可考慮加上國碼與時區備註。',
    situations: ['展覽攤位快速交換聯絡方式', '房仲與保險名片補強', '講者後台聯絡窗口'],
    faq: [
      { q: 'iPhone 與 Android 都支援？', a: '行為略有差異，請用兩系統實測。' },
      { q: '可以放照片嗎？', a: 'vCard 規格支援度不一，請測試檔案大小與相容性。' },
      { q: '連結版與純資料版？', a: '連結版易更新；純編碼版離線可掃但改動需重製 QR。' },
    ],
  }),
  buildKeywordPage('qr-code', 'digital-business-card-qr-code', '數位名片 QR Code', {
    h1: '數位名片（連結樹／作品集）QR Code',
    seoTitle: '數位名片 QR｜連結匯聚｜RxV',
    metaDescription:
      '將個人連結樹、Notion、作品集或官網「關於我」頁製成 QR Code，一支碼匯聚社群、行事曆與聯絡表單；適合不想印滿多個碼的接案者。使用 RxV QR Code 產生器。',
    intro:
      '與傳統紙本名片 QR 不同，數位名片強調「一頁聚合」：點進去後再分流到 Calendly、Behance、GitHub 等。請選穩定託管與 HTTPS，並在行動版檢查按鈕夠大、載入夠快，否則掃了也流失。',
    situations: ['設計接案者在咖啡店聊案', 'Podcast 來賓集中連結', '開發者在 meetup 交換專案'],
    faq: [
      { q: '和紙本名片 QR 重複嗎？', a: '紙本名片頁另有情境；本頁強調多連結匯聚頁。' },
      { q: '連結樹服務倒站？', a: '建議自有網域轉址或備份頁，降低依賴單一平台。' },
      { q: '下載 SVG 還是 PNG？', a: '印刷大量用向量較佳；社群貼圖用 PNG 即可。' },
    ],
  }),

  buildKeywordPage('ai-summary', 'blog-summary', '部落格文章摘要', {
    h1: '部落格長文摘要：快速掌握段落重點',
    seoTitle: 'Blog summary｜部落格摘要｜RxV',
    metaDescription:
      '將部落格長文貼上 AI 摘要工具，產出段落重點與關鍵句；請只使用你有權重製之內容，並遵守引用規範。',
    intro:
      '閱讀技術與心得長文時，先看摘要再決定是否深讀全文，可節省時間。建議分段貼上並自行合併大綱；若文章有付費牆，請勿規避取得全文。',
    situations: ['技術部落格與教學文', '產業趨勢週報', '內容策展與靈感收集'],
    faq: [
      { q: '可以貼全文嗎？', a: '請尊重著作權與網站條款；建議只摘自己擁有或已獲授權之文字。' },
      { q: '摘要能貼回自己的文章？', a: '需大幅改寫並註明參考來源。' },
      { q: '英文部落格可以嗎？', a: '可以，專有名詞建議人工複核。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'meeting-notes-summary', '會議記錄摘要', {
    h1: '會議記錄與紀要摘要',
    seoTitle: 'Meeting notes summary｜會議摘要｜RxV',
    metaDescription:
      '將會議逐字稿或筆記貼上 AI 摘要，整理決議、待辦與負責人；機密內容請遵守公司資安規範。',
    intro:
      '會議結束後盡快產出紀要有助執行。可先貼上重點段落再請 AI 條列決議與 action items；涉及個資或商業機密請去識別或改用內部核准之工具。',
    situations: ['專案週會與跨部門同步', '讀書會與課程討論', '客戶訪談後內部整理'],
    faq: [
      { q: '可以上傳錄音檔嗎？', a: '本工具以貼上文字為主；請先轉成可複製之文字並合規處理。' },
      { q: '紀要能當正式公文嗎？', a: '請依公司流程簽核；AI 輸出僅作草稿輔助。' },
      { q: '英文會議可以嗎？', a: '可以，專有名詞與數字請人工核對。' },
    ],
  }),

  buildKeywordPage('ai-summary', 'summarize-news-article', '新聞稿摘要', {
    h1: '新聞稿與即時新聞摘要：重點與來源意識',
    seoTitle: '新聞摘要 AI｜快訊與報導重點｜RxV',
    metaDescription:
      '將新聞內文貼上 AI 摘要，快速整理事件、時間地點、當事人說法與後續影響；請交叉比對來源，勿將摘要當唯一依據。使用 RxV AI 摘要。',
    intro:
      '新聞寫作常有倒金字塔與引述，摘要時應區分「事實陳述」與「評論／推測」。建議註明原文出處與時間，並對數字、人名、機關名稱人工複核；轉傳前避免斷章取義。',
    situations: ['晨會前消化隔夜國際新聞', '社群編輯整理多家媒體說法', '投資與產業追蹤快報'],
    faq: [
      { q: '可以摘要付費新聞全文嗎？', a: '請遵守著作權與訂閱條款，僅處理你有權使用之文字。' },
      { q: '摘要能直接當新聞稿發布嗎？', a: '不建議；須改寫並註明來源，避免侵權與誤導。' },
      { q: '英文外電可以嗎？', a: '可以，專有名詞與引述請再查證。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-blog-post', '部落格貼文摘要', {
    h1: '部落格貼文摘要：小標、步驟與金句',
    seoTitle: '部落格貼文摘要｜文章重點｜RxV',
    metaDescription:
      '針對含小標、清單與程式碼區塊的部落格貼文，整理閱讀路徑與可執行重點；請尊重作者授權。開啟 RxV AI 摘要處理長文。',
    intro:
      '與一般「文章摘要」頁不同，此頁假設內容有明確段落結構與教學步驟。可先請工具條列各小節一句話，再挑出你要實作的段落深讀；程式與指令請以原文為準，摘要僅輔助定位。',
    situations: ['技術教學文太長先抓安裝步驟', '食譜與旅遊文抽出時間軸', '書摘型貼文對照自己筆記'],
    faq: [
      { q: '和「部落格文章摘要」既有頁差在哪？', a: '該頁偏通用閱讀情境；本頁強調小標結構與步驟型內容。' },
      { q: '程式碼會被摘要壞嗎？', a: '摘要可能省略細節，實作請以原文區塊為準。' },
      { q: '可以摘付費會員文嗎？', a: '請遵守網站條款，勿規避付費牆複製全文。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-essay', '論說文／申論摘要', {
    h1: '論說文與申論稿摘要：論點、論據與結論',
    seoTitle: '申論與論說文摘要｜論點整理｜RxV',
    metaDescription:
      '協助梳理申論與評論文中的主張、理由與反駁，方便口試、辯論與寫作修改；正式考試與作業請遵守課程對 AI 的規範。RxV AI 摘要。',
    intro:
      '論說文重邏輯鏈：主張為何成立、用了哪些例證、如何回應反方。請工具條列論點地圖後，自行檢查是否遺漏前提或跳躍推理；若為他人文章，僅作理解輔助，寫作仍需自己的語句。',
    situations: ['口試前整理指定閱讀立場', '校刊社論互評', '公職申論參考範文拆解'],
    faq: [
      { q: '考試當天能用嗎？', a: '國家與學校考試通常禁止，請以規則為準。' },
      { q: '能幫我寫申論答案嗎？', a: '本工具定位在摘要與結構理解，交卷內容須自行撰寫。' },
      { q: '文言文論說文？', a: '可嘗試，但典故與語感務必人工核對。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-book-chapter', '書籍章節摘要', {
    h1: '書籍章節摘要：人物、論證與伏筆',
    seoTitle: '章節摘要｜讀書筆記｜RxV',
    metaDescription:
      '將單章小說情節或專書論證段落貼上，整理時間線、名詞表與章末懸念；僅摘要你有權重製之內容。使用 RxV AI 摘要。',
    intro:
      '章節閱讀可採「讀完一段、摘要一句」再交給 AI 合併層級；小說注意 spoiler 標註，論述書注意作者核心命題與本章扮演的角色。長章可分段貼上，避免一次超過工具上限。',
    situations: ['讀書會前一晚補進度', '教科書每章複習大綱', '長篇小說隔週接續閱讀'],
    faq: [
      { q: '可以貼整本電子書嗎？', a: '請遵守版權，通常僅能處理你合法取得之片段。' },
      { q: '摘要會暴雷嗎？', a: '可能，討論小說時請自行標註範圍或只用於私人筆記。' },
      { q: '專有名詞太多？', a: '可請工具另列詞彙表，再對照原書。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-academic-paper', '學術論文精讀摘要', {
    h1: '學術論文摘要：研究問題、方法與貢獻',
    seoTitle: '學術論文摘要 AI｜研究方法｜RxV',
    metaDescription:
      '協助從摘要、緒論與結論中抽出研究問題、資料與主要發現，方便文獻回顧；不取代逐段精讀與引用格式。RxV AI 摘要輔助閱讀。',
    intro:
      '與「論文與研究摘要」既有頁互補：此頁強調 IMRaD 式閱讀節奏。請先確認你是否具備存取該論文之權利；引用時依期刊規定手動整理，勿直接複製 AI 句子進正式稿件。',
    situations: ['文獻回顧前快速篩選上百篇', '跨領域讀不懂方法章節先抓定義', '組會前五分鐘報告一篇新文'],
    faq: [
      { q: '能代替讀全文嗎？', a: '不能，尤其結果與限制條件須回原文核對。' },
      { q: '數學式與圖表？', a: '摘要文字難完整呈現，請以原文圖表為準。' },
      { q: '可以貼尚未正式發表的手稿嗎？', a: '涉及機密與倫理，請依機構規範並取得同意。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-report', '商務與工作報告摘要', {
    h1: '工作報告與營運簡報摘要',
    seoTitle: '報告摘要 AI｜營運與專案｜RxV',
    metaDescription:
      '將週報、月報與專案結案報告貼上，整理 KPI 變化、風險與建議行動；機密與個資請去識別。使用 RxV AI 摘要。',
    intro:
      '內部報告常混敘事與數據表格貼上的文字。建議先標出「本期結論」「下週待辦」區塊再貼上，或分次摘要後自行對照簡報頁次；對外窗口使用前請經主管審閱。',
    situations: ['主管出差前讀十份週報', '跨部門同步專案風險清單', '顧問案中期檢討濃縮'],
    faq: [
      { q: '可以上傳客戶機密嗎？', a: '請依 NDA 與公司資安政策；敏感欄位請先刪除。' },
      { q: '表格數字會算錯嗎？', a: 'AI 可能誤讀，數字務必回報表原文核對。' },
      { q: '英文董事會報告？', a: '可以，專有名詞建議與公司用語表對齊。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-case-study', '個案研究摘要', {
    h1: '個案研究（Case Study）摘要：背景、介入與成效',
    seoTitle: '個案研究摘要｜案例整理｜RxV',
    metaDescription:
      '整理個案中的產業背景、痛點、解法與量化成效，方便教學討論與提案參考；請遵守案例公開範圍與保密約定。RxV AI 摘要。',
    intro:
      '個案常按「情境—行動—結果」敘事。請工具條列利害關係人、限制條件與成功指標，並標出可複製與不可複製因素；若為課堂指定閱讀，討論時仍應回到原文細節攻防。',
    situations: ['MBA 個案課前預習', '業務提案找同業標竿敘事', '內訓教材改寫成簡報'],
    faq: [
      { q: '可以摘要未公開客戶案嗎？', a: '請取得授權並移除識別資訊。' },
      { q: '數字成效一定要信嗎？', a: '請對照案例附註與計算口徑，可能有行銷修飾。' },
      { q: '和一般報告摘要差異？', a: '個案重故事與決策轉折，報告重週期性指標。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-meeting-transcript', '會議逐字稿摘要', {
    h1: '會議逐字稿摘要：發言重點與時間軸',
    seoTitle: '逐字稿摘要｜會議紀錄｜RxV',
    metaDescription:
      '將語音轉出之逐字稿貼上，整理各發言人重點、爭議點與結論；口語贅字與重複可請工具精簡。機密請遵守內規。RxV AI 摘要。',
    intro:
      '逐字稿比筆記冗長，但保留誰說過什麼的線索。可先請工具刪除寒暄與重複句，再條列決議與待辦並標註發言者代稱；若轉錄有誤，請對照錄音關鍵片段修正專有名詞。',
    situations: ['法遵與專案會議留存完整軌跡', '訪談研究整理引句', '遠距會議自動轉錄後出紀要'],
    faq: [
      { q: '和「會議記錄摘要」頁不同？', a: '該頁偏筆記與紀要；本頁假設輸入為口語逐字稿。' },
      { q: '轉錄錯字怎麼辦？', a: '請人工修正專有名詞後再摘要，否則錯誤會被放大。' },
      { q: '可以辨識說話者嗎？', a: '依轉錄檔格式而定；摘要時可請工具依標記分段。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-email-thread', 'Email 信串摘要', {
    h1: 'Email 往返信串摘要：共識、待辦與截止日',
    seoTitle: 'Email 信串摘要｜長回信整理｜RxV',
    metaDescription:
      '將多封轉寄、回覆堆疊的信件文字貼上，整理最後共識、誰承諾什麼與截止日期；請刪除簽名檔與個資欄。RxV AI 摘要。',
    intro:
      '長信串最難找「最新定案」。建議從最底一封往上摘，或先手動刪除重複引用區塊再貼上；對外轉述前請確認是否包含律師、人資等敏感內容，必要時分段處理不同收件對象版本。',
    situations: ['專案跨國時區來回十幾封', '採購與法務條款拉鋸', '客服升級案件交接'],
    faq: [
      { q: '可以貼含附件內容的信嗎？', a: '附件需自行轉成文字或摘要重點後再貼，工具通常只吃文字。' },
      { q: '會不會外洩客戶信箱？', a: '請先遮罩 Email 與電話，並遵守公司資安規範。' },
      { q: '英文信混中文？', a: '可以，但請標註語言或分段請求摘要。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-document-online', '線上文件摘要', {
    h1: '線上文件內文摘要：從複製到重點',
    seoTitle: '線上文件摘要｜網頁與檔案文字｜RxV',
    metaDescription:
      '將從 Google 文件、Notion 或網頁複製之文字貼上，快速產出大綱與重點句；請確認你有權複製該內容。使用 RxV AI 摘要。',
    intro:
      '多數「線上文件」最後仍要變成可貼上之純文字。建議先清掉目錄、頁首頁尾與重複頁碼，再依章節分段摘要後自行合併；若文件會持續改版，摘要請註明版本日期以免誤用。',
    situations: ['協作文件版本太多先看 delta 重點', '法務條款初稿快速抓義務條款', '內部 wiki 長條目濃縮給新人'],
    faq: [
      { q: '不能直接貼網址嗎？', a: '若工具不支援抓取，請自行複製可見文字。' },
      { q: '表格與圖說？', a: '可貼成文字描述，結構複雜時請分段。' },
      { q: '機密文件？', a: '請用內部核准之流程與工具等級處理。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-long-text-online', '超長文字線上摘要', {
    h1: '超長文字摘要：分段、合併與一致性',
    seoTitle: '長文線上摘要｜分段策略｜RxV',
    metaDescription:
      '說明當單次字數超過上限時，如何切章、摘要各段再合併總覽，並檢查術語是否前後一致。RxV AI 摘要適合長文工作流。',
    intro:
      '長小說、年度報告全文、合約附錄等常無法一次餵滿。可行流程是：先訂章節切點，每段產「微摘要」，最後再請工具把微摘要合成「全書五句話」；人名與數字請在最後一輪人工統一檢查。',
    situations: ['合約附錄多份合併閱讀', '長篇白皮書一夜抓結論', '連載譯稿對齊前後設定'],
    faq: [
      { q: '分段會不會漏掉跨段論證？', a: '可能，重要論證請在合併階段再指定「補上某某關係」。' },
      { q: '要同一提示詞每段嗎？', a: '建議固定格式較易合併，但可視章節性質微調。' },
      { q: '比 PDF 摘要頁更適合？', a: '該頁偏檔案情境；本頁強調任意長純文字策略。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'shorten-article-ai', '文章縮寫與精簡', {
    h1: '文章縮短：保留論旨的精簡版',
    seoTitle: '文章縮寫 AI｜精簡字數｜RxV',
    metaDescription:
      '在不大改原意的前提下縮短字數，適合簡報附錄、社群貼文改寫與簡訊版公告；請自行比對是否扭曲原意並註明改寫。RxV AI 摘要。',
    intro:
      '「縮短」比「條列重點」更要求保留語氣與因果。可指定目標字數或閱讀時間，並請工具標出刪除了哪些類型的內容（舉例、形容詞）；對外發布前請再讀一遍是否過度簡化導致誤解。',
    situations: ['內部公告改一行版標題說明', '簡報講者備註太長', '新聞稿給不同版面字數'],
    faq: [
      { q: '縮短等於摘要嗎？', a: '摘要偏重點提取；縮短偏保留敘事但刪冗餘。' },
      { q: '會不會改到像另一個觀點？', a: '有可能，請交叉比對原文敏感句。' },
      { q: '英文要更口語？', a: '可於提示中指定語域，但仍需人工潤飾。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'ai-paragraph-summary', '段落級摘要', {
    h1: '段落摘要：一段一結論',
    seoTitle: '段落摘要 AI｜精讀筆記｜RxV',
    metaDescription:
      '針對單段或數段文字各產一句總結，適合邊讀邊筆記、語言學習與逐段改寫前理解；請控制每段長度以利模型聚焦。RxV AI 摘要。',
    intro:
      '當全文太長但某幾段是核心論證時，段落級摘要比一次總結更準。可請工具輸出「段落編號＋一句話」，再自行串成論證鏈；文學性文本注意隱喻可能被過度字面化。',
    situations: ['論文討論段逐段抓反駁', '法條釋義逐項理解', '英文閱讀測驗長篇'],
    faq: [
      { q: '一段可以超長嗎？', a: '過長建議先切成兩段再摘要，較不易遺漏。' },
      { q: '詩詞或歌詞類文本？', a: '可嘗試，但意象與聲韻難完整保留。' },
      { q: '輸出要表格還是列表？', a: '可依你後續用途指定格式。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'ai-document-summary', '文件全文摘要', {
    h1: '正式文件摘要：主旨、範圍與效力段落',
    seoTitle: '文件摘要 AI｜契約與辦法｜RxV',
    metaDescription:
      '針對辦法、辦法細則、對外說明稿等正式文件，整理適用對象、生效日與義務條款提示；法律解釋仍以專業人員為準。RxV AI 摘要。',
    intro:
      '正式文件常有「第一條目的、第二章定義」等結構。請工具先列定義與適用範圍，再摘義務與罰則相關句，並標註「僅為閱讀輔助」；簽署或爭議請諮詢律師或主管機關，勿以 AI 摘要作為唯一依據。',
    situations: ['員工手冊改版前快速比對差異', '補助辦法申請資格初判', '合作備忘錄給非法律背景同事'],
    faq: [
      { q: '摘要有法律效力嗎？', a: '沒有，僅供理解輔助。' },
      { q: '條號會搞錯嗎？', a: '可能，請對照原文條次與附件。' },
      { q: '多語言版本不一致？', a: '請以指定準據語言文本為準，摘要無法取代對照。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'ai-content-summary', '內容摘要（行銷與企劃）', {
    h1: '行銷與企劃內容摘要：訊息、受眾與 CTA',
    seoTitle: '內容摘要 AI｜企劃與文案｜RxV',
    metaDescription:
      '整理活動企劃書、簡報逐字稿與社群文案草稿中的核心訊息、受眾與呼籲行動，方便跨團隊對齊；請勿外洩未發布素材。RxV AI 摘要。',
    intro:
      '企劃內容常混口語、視覺說明與預算表文字。可請工具抽出「一句話價值主張」「三個受眾痛點」「主要 CTA」，再用於對齊會議；實際投放文案仍須符合品牌語調與法遵，摘要不能代替法務審稿。',
    situations: ['比稿前內部對齊賣點', 'KOL 合作簡報濃縮給主管', '年度行銷計畫章節過長'],
    faq: [
      { q: '可以摘要競品未公開資料嗎？', a: '請遵守公平競爭與取得來源合法性。' },
      { q: '會不會洩露活動代號？', a: '貼上前請自行遮罩內部代號與價格。' },
      { q: '和「文件摘要」差異？', a: '本頁偏對外訊息與行銷漏斗語言；文件頁偏規範與義務。' },
    ],
  }),

  buildKeywordPage('homework-helper', 'math-word-problem-ai', '數學應用題解題', {
    h1: '數學應用題：題意拆解與列式提示',
    seoTitle: 'Math word problem solver｜應用題｜RxV',
    metaDescription:
      '針對數學應用題協助理解題意、單位與列式方向；請自行驗算並遵守學術誠信，考試情境勿使用未授權工具。',
    intro:
      '應用題重在把文字轉成數學關係。輸入時請寫明已知、未知與圖示條件，請工具以步驟提示為主；得到思路後請獨立完成計算與驗算。',
    situations: ['國小到高中數學應用題', '單位換算與比例題', '段考前的題型演練'],
    faq: [
      { q: '可以直接抄答案嗎？', a: '不建議；應用於理解題意與檢查自己的列式。' },
      { q: '圖形題怎麼描述？', a: '請用文字重述圖中條件或搭配已知數據。' },
      { q: '答案跟老師講的不同？', a: '可能題意解讀不同，請帶著草稿請教老師。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'essay-helper-ai', '作文與申論輔助', {
    h1: '作文與申論：題意、大綱與論點提示',
    seoTitle: 'Essay helper AI｜申論與作文｜RxV',
    metaDescription:
      '協助理解作文與申論題意、建立段落大綱與論點方向；請自行完成全文並遵守學術誠信與考試規則。',
    intro:
      '寫作重在自己組織語言與論證。可請工具協助拆題、列大綱與檢查是否偏題；完稿請務必改寫成自己的句子，不可整段複製 AI 輸出交卷。',
    situations: ['國寫與指考作文練習', '大學通識申論', '公職考試申論題型'],
    faq: [
      { q: '考試當天能用嗎？', a: '國家與學校考試通常禁止，請以監試規則為準。' },
      { q: '能幫忙找例子嗎？', a: '可請求方向，但例子需自己查證與改寫。' },
      { q: '字數很長怎麼辦？', a: '分段請求大綱再自行串接，避免一次超過工具上限。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'grammar-corrector-ai', '英文文法檢查輔助', {
    h1: '英文文法與句型檢查提示',
    seoTitle: 'Grammar corrector AI｜英文句型｜RxV',
    metaDescription:
      '輸入英文句子請工具指出可能文法問題與改寫建議；正式作業與考試請自行判斷並遵守課程對 AI 的規範。',
    intro:
      '文法學習重在理解規則而非一次改到完美。建議先寫出自己的句子，再請工具標出可疑處並說明原因；請將修改內化後再重寫一遍。',
    situations: ['英文作文與報告草稿', 'Email 與履歷英文', '口說稿與簡報逐字稿'],
    faq: [
      { q: '能保證全對嗎？', a: '不能，AI 可能誤判，請對照文法書或問老師。' },
      { q: '可以整篇貼上嗎？', a: '請留意字數上限；長文建議分段。' },
      { q: '能代替家教嗎？', a: '僅作輔助，系統性學習仍需要練習與回饋。' },
    ],
  }),

  buildKeywordPage('homework-helper', 'ai-math-solver', '數學解題輔助', {
    h1: '數學解題輔助：思路、式子與驗算方向',
    seoTitle: '數學 AI 解題輔助｜步驟與驗算｜RxV',
    metaDescription:
      '協助釐清題意、列出可能解法與驗算方向，適合平時練習與訂正；考試與未授權情境請勿使用。請至 RxV 作業解題助手並遵守學術誠信。',
    intro:
      '數學學習重在「為什麼這樣列式」。建議先寫出自己卡住的步驟，再請工具提示定理或代換方向；得到提示後請親自算完並用另一種方法或代入檢查，避免直接複製答案交作業。',
    situations: ['段考後錯題訂正想懂卡點', '證明題不知從哪個引理下手', '應用題單位與量綱檢查'],
    faq: [
      { q: '可以給我完整解答嗎？', a: '本工具定位在輔助理解；完整解答請以教師規範與自己的演算為準。' },
      { q: '考試能用嗎？', a: '國家與學校考試通常禁止未授權電子工具，請以考場規則為準。' },
      { q: '和「數學作業解題」既有頁差別？', a: '該頁偏作業情境總覽；本頁強調一般數學解題流程與驗算。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-physics-solver', '物理觀念與題型輔助', {
    h1: '物理題輔助：受力圖、單位與定律套用',
    seoTitle: '物理 AI 解題輔助｜觀念與題型｜RxV',
    metaDescription:
      '協助整理已知量、建議受力分析與適用定律，並提醒單位與方向；實驗安全與操作仍以課堂為準。使用 RxV 作業解題助手輔助平時練習。',
    intro:
      '物理常卡在「畫對圖」與「選對定律」。可先描述情境與已標示的變量，再請工具提示分析路徑；計算請自行完成並注意有效數字與向量方向。涉及實驗操作請務必遵守學校安全規範。',
    situations: ['力學與運動學題目畫受力圖', '電路題判斷串並聯與等效', '熱學理想氣體公式選用'],
    faq: [
      { q: '會代替我做實驗報告嗎？', a: '不會也不應；數據與觀察須來自你的實驗過程。' },
      { q: '題目沒給圖怎麼辦？', a: '請用文字描述幾何關係，或自行手繪後描述給工具。' },
      { q: '答案與課本不同？', a: '可能題目版本或近似假設不同，請帶草稿問老師。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-chemistry-solver', '化學反應與計量輔助', {
    h1: '化學作業輔助：反應式、計量與觀念釐清',
    seoTitle: '化學 AI 解題輔助｜反應與計量｜RxV',
    metaDescription:
      '協助平衡反應式、莫耳與濃度計算的方向提示，並釐清酸鹼、氧化還原等觀念；實驗步驟與安全請以課堂為準。RxV 作業解題助手。',
    intro:
      '化學計量題重在「物質關係是否對齊」。建議先寫出已知與未知，再請工具提示配平方程式或限制試劑判斷；實驗題請分清楚觀察現象與理論解釋，勿讓 AI 代替你記錄數據。',
    situations: ['滴定與濃度換算', '氧化數與半反應配平', '有機命名與官能基辨識釐清'],
    faq: [
      { q: '和「化學作業解題」既有頁重複嗎？', a: '主題相近但 slug 不同；本頁更強調反應式與計量路徑。' },
      { q: '可以處理危險物質操作嗎？', a: '工具僅能討論紙上題目，實驗請依學校規範與教師指導。' },
      { q: '結構式畫錯怎麼辦？', a: '有機結構建議搭配課本圖例與模型，AI 描述僅供參考。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-biology-helper', '生物觀念釐清與圖表輔助', {
    h1: '生物課輔助：名詞、路徑與圖表判讀',
    seoTitle: '生物 AI 學習輔助｜觀念與圖表｜RxV',
    metaDescription:
      '協助整理生理路徑、遺傳題邏輯與實驗設計問答的切入方向；圖表判讀仍須對照課本與實際數據。使用 RxV 作業解題助手作課後輔助。',
    intro:
      '生物常需記憶與因果並重。建議先說明章節主題（如光合作用、中心法則），再請工具用你自己的話重述機制；遺傳題請畫譜系或棋盤格後再請求檢查邏輯，避免直接要答案。',
    situations: ['生理回饋調節流程背不起來', '遺傳題機率與顯隱性判斷', '實驗對照組設計題'],
    faq: [
      { q: '可以幫我背名詞嗎？', a: '可提供記憶架構與自測問題，背誦仍須自己重複練習。' },
      { q: '醫療診斷能問嗎？', a: '工具不具醫療資格，僅限課本層級概念；身體不適請就醫。' },
      { q: '圖表數字會不會錯？', a: '請以題目附圖與原始數據為準，AI 可能誤讀座標。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-essay-writer', '作文草稿與架構輔助', {
    h1: '作文草稿輔助：題意、段旨與過渡（非代寫）',
    seoTitle: '作文 AI 輔助｜架構與草稿｜RxV',
    metaDescription:
      '協助拆題、列段旨與過渡句方向，減少空白頁焦慮；完稿須自行撰寫與改寫，並遵守課程對 AI 與學術誠信的規範。RxV 作業解題助手。',
    intro:
      '寫作輔助與「代寫」的界線在於：你是否仍用自己的語言與經驗完成文章。建議請工具產出「大綱與每段一句提示」，再關掉提示自己寫段落；交稿前請檢查是否與 AI 句式過度雷同。',
    situations: ['命題作文不知從哪個例子切入', '論說文正反論點排列', '讀書心得首尾呼應卡住'],
    faq: [
      { q: '能整篇代寫嗎？', a: '不建議也不符合學習目標；多數課程禁止未聲明使用 AI 生成全文。' },
      { q: '和「作文與申論輔助」既有頁差別？', a: '該頁重申論與考試倫理；本頁強調草稿與架構起手的寫作流程。' },
      { q: '英文作文適用嗎？', a: '可，但仍建議搭配文法與用語人工潤飾。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-paragraph-writer', '段落寫作與銜接輔助', {
    h1: '單段寫作輔助：主題句、例證與收束',
    seoTitle: '段落寫作 AI 輔助｜銜接句｜RxV',
    metaDescription:
      '針對單一段落協助收斂主題句、補例證方向與收尾句，適合長篇報告分段完成；請自行撰寫內容並避免整段複製。RxV 作業解題助手。',
    intro:
      '長篇報告可「一段一任務」。先寫出該段要證明的命題，再請工具建議可舉的例證類型或過渡到上一段的銜接句；每段完成後請朗讀一次檢查是否離題。',
    situations: ['社會科報告中某一爭點段落', '讀書報告心得段與摘要段分工', '科展報告方法段描述'],
    faq: [
      { q: '和整篇作文輔助有何不同？', a: '本頁只處理段落層級，較適合已有大綱的人。' },
      { q: '可以直接貼上當作業嗎？', a: '請改寫並註明哪些為自己實驗與觀察。' },
      { q: '引用資料怎麼辦？', a: '請依學校引用格式手動註明來源，AI 無法取代查證。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-research-helper', '小論文與專題研究輔助', {
    h1: '研究作業輔助：問題意識、關鍵字與大綱',
    seoTitle: '研究作業 AI 輔助｜專題與小論文｜RxV',
    metaDescription:
      '協助收斂研究問題、建議關鍵字與章節大綱，並提醒文獻比對與引用；不代替實驗、訪談或抄寫資料。使用 RxV 作業解題助手。',
    intro:
      '研究型作業最怕題目過大或找不到資料。可先描述領域與限制（學年、時間、地區），再請工具建議可操作的子問題；文獻請自行透過圖書館資料庫檢索，並用筆記區分「他人觀點」與「你的發現」。',
    situations: ['高一小論文題目發想', '大學專題期中進度卡關', '社會科議題分析框架'],
    faq: [
      { q: '能幫我找論文嗎？', a: '可提供檢索關鍵字方向，實際下載與閱讀須符合授權。' },
      { q: '訪談逐字稿能代寫嗎？', a: '不能；訪談內容須真實發生並經同意。' },
      { q: '結論可以給現成句子嗎？', a: '結論應呼應你自己的資料與分析，請避免套用空泛模板。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-homework-answer-generator', '作答思路與檢查方向', {
    h1: '作業「答案」輔助：先思路、後自行演算',
    seoTitle: '作業作答輔助｜思路與檢查｜RxV',
    metaDescription:
      '強調以提示與檢查點代替直接抄答案：協助你判斷題型、列出檢核步驟與常見錯因；請依教師規定使用並自行完成演算。RxV 作業解題助手。',
    intro:
      '若工具直接產出可交卷的完整答案，短期省事但長期削弱能力。建議設定為「只給下一步提示」或「只指出哪一步可能錯」；訂正題請先貼自己的錯誤步驟，再請工具對症建議。',
    situations: ['計算題反覆得到怪答案想定位錯步', '選擇題想理解錯誤選項陷阱', '證明題想確認邏輯跳躍處'],
    faq: [
      { q: '和「AI 作業解題」既有頁差別？', a: '該頁為總覽；本頁特別討論「要不要直接生成答案」的學習界線。' },
      { q: '老師禁止 AI 怎麼辦？', a: '請以課程規範為準，未允許前勿使用。' },
      { q: '能保證分數嗎？', a: '不能；評分標準在教師與題目設計。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-study-helper', '讀書計畫與複習節奏輔助', {
    h1: '讀書方法輔助：排程、主動回想與錯題策略',
    seoTitle: '讀書計畫 AI 輔助｜複習節奏｜RxV',
    metaDescription:
      '依你的科目、考程與弱點，協助規劃複習區塊、自測題型與休息節奏；執行仍靠自律與實際練習。搭配 RxV 番茄鐘與待辦更佳。',
    intro:
      '學習輔助不是幫你讀書，而是幫你把「大目標」拆成「本週可完成的小任務」。可列出目前段考範圍與已掌握章節，再請工具建議優先順序；每天結束後用幾句話回顧今日實際完成量並調整明日計畫。',
    situations: ['段考兩週前科目太多不知從哪科開始', '英文單字與數學錯題要輪流排', '線上課程進度落後想追進度'],
    faq: [
      { q: '會幫我自動排時程嗎？', a: '僅能建議框架，實際時間仍須配合你的生活節奏。' },
      { q: '可以取代補習嗎？', a: '不能；補習與學校教學仍提供系統化講解。' },
      { q: '與番茄鐘關係？', a: '計畫需搭配執行工具，本站番茄鐘可另開使用。' },
    ],
  }),
  buildKeywordPage('homework-helper', 'ai-school-assistant', '校園課業與科目協調輔助', {
    h1: '校園課業助理：多科並行與作業優先順序',
    seoTitle: '校園課業 AI 輔助｜多科協調｜RxV',
    metaDescription:
      '協助在多科作業、社團與專題並行時整理優先順序、截止日與求助對象；無法代替導師與家長的實際支援。RxV 作業解題助手。',
    intro:
      '此頁適合「事情很多但不知先做哪一件」的情境。請列出各科截止日、預估耗時與難度，再請工具建議排序；若涉及升學、選組或心理壓力，請優先找學校輔導與信任大人討論，AI 僅能整理資訊不能給醫療或法律建議。',
    situations: ['段考與社團成發撞期', '分組報告誰負責哪一段需拆工作', '轉學或選修課程表取捨'],
    faq: [
      { q: '能幫我請假或跟老師溝通嗎？', a: '可提供草稿語氣，但正式溝通請你自己送出並負責。' },
      { q: '同學衝突怎麼辦？', a: '請優先尋求師長協調，勿只靠工具判斷對錯。' },
      { q: '和「讀書計畫輔助」差別？', a: '本頁偏校園多任務與人際時程；讀書頁偏複習方法與節奏。' },
    ],
  }),

  buildKeywordPage('productivity', 'study-break-timer', '讀書休息計時', {
    h1: '讀書休息計時：專注與恢復節奏',
    seoTitle: 'Study break timer｜讀書休息｜RxV',
    metaDescription:
      '使用線上計時器安排讀書專注段與短休息，避免久坐與用眼過度。RxV 番茄鐘可自訂長度並搭配待辦清單。',
    intro:
      '長時間盯螢幕讀書容易效率遞減。建議採「專注—短休—專注」循環，休息時離開座位與螢幕；時間長度可依科目與專注曲線微調。',
    situations: ['考前衝刺與總複習', '論文與報告分段撰寫', '線上課程與自習'],
    faq: [
      { q: '休息一定要離開座位嗎？', a: '建議至少離開螢幕，對眼睛與專注恢復較有幫助。' },
      { q: '可以自訂時間嗎？', a: '可以，番茄鐘支援自訂專注與休息長度。' },
      { q: '被打斷怎麼辦？', a: '可暫停或重新開始一輪，並記錄干擾原因。' },
    ],
  }),
  buildKeywordPage('productivity', 'focus-productivity-timer', '專注力計時器', {
    h1: '專注力計時器：單一任務深度工作',
    seoTitle: 'Focus productivity timer｜深度工作｜RxV',
    metaDescription:
      '以單一計時區塊鎖定一件任務，減少多工切換。使用 RxV 線上番茄鐘與待辦搭配，建立可重複的專注儀式。',
    intro:
      '多工切換會提高錯誤率與疲勞。每次只開一個主要任務，計時器響起前避免滑社群與回郵件；完成後再批次處理雜務。',
    situations: ['程式開發與寫作', '準備簡報與改稿', '深度閱讀論文'],
    faq: [
      { q: '和一般鬧鐘差在哪？', a: '專注計時強調「這一段只做一件事」的儀式感。' },
      { q: '專注中能否回訊息？', a: '建議關通知或用手機勿擾，降低切換成本。' },
      { q: '時間到還沒做完？', a: '可延長一輪或把任務拆小，避免硬撐過度疲勞。' },
    ],
  }),
  buildKeywordPage('productivity', 'minimalist-todo-list', '極簡待辦與專注節奏', {
    h1: '極簡待辦：少項目、高完成率',
    seoTitle: 'Minimalist todo｜極簡待辦｜RxV',
    metaDescription:
      '以少數關鍵任務搭配番茄鐘完成，避免待辦清單無限膨脹。完成後可至 RxV 待辦與番茄鐘頁面實作。',
    intro:
      '待辦過長會造成決策疲勞。建議每日只列 3～5 件最重要任務，其餘移入待排程；每完成一項再補下一項，比一次列三十項更有成就感。',
    situations: ['自由工作者每日排程', '學生考前週計畫', '專案衝刺期'],
    faq: [
      { q: '待辦要寫多細？', a: '細到「下一步可做」即可，避免模糊大項。' },
      { q: '和番茄鐘怎麼搭配？', a: '每個番茄對應一個子任務或子步驟。' },
      { q: '工具在哪？', a: '請使用本站待辦清單與番茄鐘；本頁 CTA 開啟計時後可再開待辦。' },
    ],
  }),

  buildKeywordPage('productivity', 'pomodoro-timer-for-work', '上班用番茄鐘', {
    h1: '上班專用番茄鐘：會議空檔與深度工作塊',
    seoTitle: '上班番茄鐘｜工作專注計時｜RxV',
    metaDescription:
      '為上班族設計的專注節奏：在會議、回信與製作之間切出不可打斷的工作塊。使用 RxV 線上番茄鐘自訂專注與休息，並可搭配待辦清單鎖定當下任務。',
    intro:
      '知識工作最耗神的是「被打斷後重新進入狀態」。建議把回信與行政集中在某幾個時段，其餘時間用番茄鐘保護深度工作；休息時離開座位，避免順手滑社群變成半小時。',
    situations: ['Remote 工作者劃出 deep work 時段', '準備提案與改稿需要連續思考', '主管臨時插單後重新校準優先順序'],
    faq: [
      { q: '25 分鐘太短？', a: '可拉長專注段，但建議仍保留規律短休。' },
      { q: '同事一直找怎麼辦？', a: '可與團隊約定專注時段或在行事曆標示。' },
      { q: '要搭配待辦嗎？', a: '建議先寫下「這一顆番茄只做哪一件事」。' },
    ],
  }),
  buildKeywordPage('productivity', 'pomodoro-timer-for-students', '學生讀書番茄鐘', {
    h1: '學生讀書番茄鐘：科目輪替與考前節奏',
    seoTitle: '學生番茄鐘｜讀書計時｜RxV',
    metaDescription:
      '用番茄鐘把課業拆成可完成的小段：寫作業、背單字與複習考古題交替進行。RxV 線上番茄鐘免安裝，休息時起來動一動保護眼睛。',
    intro:
      '讀書容易「坐很久但進度很少」，多半是缺少明確截止點。每顆番茄結束後勾選完成項目或記錄卡關題號，下一顆再換科目或繼續攻關；睡前回顧今日完成幾顆，比坐幾小時更有感。',
    situations: ['段考週多科輪流複習', '寫長篇報告分段起草', '線上課程搭配筆記與練習'],
    faq: [
      { q: '一顆番茄可以背整章嗎？', a: '目標宜具體，例如「這 25 分鐘只背完某單元單字」。' },
      { q: '休息會不會玩掉？', a: '可設定離開手機或只做伸展喝水。' },
      { q: '和待辦怎麼連動？', a: '待辦列科目與子任務，番茄鐘負責執行當下那一項。' },
    ],
  }),
  buildKeywordPage('productivity', 'pomodoro-focus-timer', '番茄專注計時', {
    h1: '番茄專注計時：標準節奏與自訂比例',
    seoTitle: '番茄專注計時器｜Pomodoro｜RxV',
    metaDescription:
      '經典番茄工作法：專注與短休循環，可自訂分鐘數。適合需要儀式感啟動專注的人。開啟 RxV 線上番茄鐘立即開始。',
    intro:
      '若你常說「再五分鐘就開始」，不如讓計時器替你按下開始鍵。標準 25/5 只是起點，可依任務調整；重點是「響鈴前只做一件事」，響鈴後真的停下手邊，讓大腦有邊界感。',
    situations: ['自由工作者啟動拖延已久的任務', '整理收件匣與歸檔', '家務與副業分段完成'],
    faq: [
      { q: '一定要 25 分鐘嗎？', a: '不必，可依專注曲線調整，但建議固定一組至少一週再評估。' },
      { q: '長會議中能用嗎？', a: '可改為個人筆記或跟進時段，勿干擾他人發言。' },
      { q: '手機版方便嗎？', a: '瀏覽器開啟即可，專注時建議勿擾模式。' },
    ],
  }),
  buildKeywordPage('productivity', 'deep-work-timer', '深度工作計時', {
    h1: '深度工作計時：長區塊與低打斷',
    seoTitle: '深度工作計時器｜Deep work｜RxV',
    metaDescription:
      '深度工作需要比短番茄更長的連續時間；可用較長專注段搭配極短休息，減少上下文切換。RxV 番茄鐘支援自訂，協助你保護思考流。',
    intro:
      '寫程式架構、論文推導與策略規劃常需 45～90 分鐘才進入狀態。可把「深度工作」與「淺層行政」分開排程：深度時段關通知、不開信箱；若必須中斷，請記下斷點方便回來接續。',
    situations: ['論文與技術設計長考', '年度計畫與架構圖繪製', '創作初稿不打斷靈感'],
    faq: [
      { q: '深度工作可以不要休息嗎？', a: '仍建議定時起身，避免肩頸與眼睛過勞。' },
      { q: '和一般番茄差別？', a: '本頁強調較長連續專注與降低打斷，參數可設得更長。' },
      { q: '被打斷如何恢復？', a: '寫下「下一步具體動作」再處理插單。' },
    ],
  }),

  buildKeywordPage('productivity', 'study-session-timer', '讀書時段計時', {
    h1: '讀書時段計時：一節一節完成進度',
    seoTitle: '讀書時段計時｜自習節奏｜RxV',
    metaDescription:
      '把自習切成多個「時段」，每段結束檢查進度與調整下一科。RxV 線上番茄鐘可當讀書節拍器，搭配短休避免疲勞累積。',
    intro:
      '自習室一坐三小時，有效專注可能不到一半。建議每段結束用一分鐘問自己：這段完成了什麼？下一段要換科還是繼續？把「時段」當成迷你截止日，比空想「今天要讀完」更容易執行。',
    situations: ['圖書館晚間自習', '線上共讀與讀書會前預習', '證照考長期備考'],
    faq: [
      { q: '時段長度怎麼訂？', a: '可從 25～50 分鐘試起，依科目疲勞度調整。' },
      { q: '讀不完會焦慮？', a: '把目標改成「完成幾個時段」而非一次讀完。' },
      { q: '需要待辦嗎？', a: '建議列科目與頁碼範圍，執行時開番茄鐘。' },
    ],
  }),
  buildKeywordPage('productivity', 'work-break-timer', '工作休息計時', {
    h1: '工作休息計時：強迫離席與眼睛休息',
    seoTitle: '工作休息計時｜專注與恢復｜RxV',
    metaDescription:
      '專注段與休息段分開計時，提醒自己在休息時真的停手。RxV 番茄鐘可自訂休息長度，減少「假休息」滑手機過頭。',
    intro:
      '許多人休息時仍盯螢幕，導致整天沒真正放鬆。可設定「休息鈴響必須離開座位」之類的自我規則；短休做伸展、長休吃東西或散步，再回到下一顆專注番茄。',
    situations: ['居家上班久坐', '設計與剪輯長時盯螢幕', '客服與文書輪班調節'],
    faq: [
      { q: '休息可以回訊息嗎？', a: '若訊息會拉長時間，建議集中處理。' },
      { q: '午休算在循環裡嗎？', a: '可獨立較長休息，不必硬塞進短休。' },
      { q: '眼睛痠？', a: '遵 20-20-20 或定時望遠，休息段離開螢幕。' },
    ],
  }),
  buildKeywordPage('productivity', 'minimalist-focus-timer', '極簡專注計時', {
    h1: '極簡專注計時：少設定、快開始',
    seoTitle: '極簡專注計時｜免複雜設定｜RxV',
    metaDescription:
      '不想研究複雜功能？用最少步驟開始倒數專注。RxV 番茄鐘介面簡潔，適合只想「按下就專心」的人。',
    intro:
      '工具越複雜越容易變成整理工具本身。極簡流程是：寫下一行當前任務、按開始、響鈴就停；進階功能有需要再慢慢加。目標是降低啟動摩擦，讓專注成為習慣而非專案。',
    situations: ['早晨第一件事先專注 25 分鐘', '通勤前快速處理一件小事', '抗拒開始時先騙自己「只專心一顆」'],
    faq: [
      { q: '需要註冊嗎？', a: '依產品設計；重點是流程短、干擾少。' },
      { q: '極簡會不會功能不夠？', a: '可先養成習慣，再搭配待辦或日曆。' },
      { q: '可以自訂鈴聲嗎？', a: '依工具支援；柔和鈴聲較不驚嚇。' },
    ],
  }),
  buildKeywordPage('productivity', 'work-productivity-timer', '工作生產力計時', {
    h1: '工作生產力計時：產出導向的時間塊',
    seoTitle: '工作生產力計時｜產出與追蹤｜RxV',
    metaDescription:
      '用計時塊對齊可交付成果：每一塊結束應有具體產出或決策。RxV 番茄鐘協助切割工作日，並可與待辦勾選連動心理回饋。',
    intro:
      '「忙」不等於有產出。每顆番茄前寫下可驗收的結果（例如「寄出週報草稿」而非「處理郵件」）；結束後勾選或記錄未完成原因，週五回顧哪類任務最耗番茄數，下週再調整排程。',
    situations: ['週報與月報集中撰寫', '產品迭代前整理 issue', '客戶專案里程碑前衝刺'],
    faq: [
      { q: '行政雜務怎麼算產出？', a: '可定義為「清空收件匣前 20 封」等具體量。' },
      { q: '和深度工作計時差別？', a: '本頁強調可交付成果；深度頁強調長思考不斷線。' },
      { q: '要記錄幾顆番茄嗎？', a: '簡單勾選或計數就有幫助，不必過度儀表板化。' },
    ],
  }),
  buildKeywordPage('productivity', 'distraction-free-timer', '無干擾專注計時', {
    h1: '無干擾專注計時：搭配環境與通知管理',
    seoTitle: '無干擾計時｜專注模式｜RxV',
    metaDescription:
      '計時只是其中一環：關通知、全螢幕或單一視窗，與 RxV 番茄鐘並用，降低分心來源。休息時再批次處理訊息。',
    intro:
      '分心多半是環境設計問題。專注前可先關閉非必要分頁、手機翻面、耳機播放白噪音或無歌詞音樂；告訴同事這 25 分鐘只處理急件。計時器負責「心理契約」，環境負責「物理隔離」。',
    situations: ['開放辦公室寫稿', '家裡有小孩與寵物干擾', '考前禁社群期間讀書'],
    faq: [
      { q: '還是會想滑手機？', a: '可試用實體隔離（另一房間）或專注 App 鎖機。' },
      { q: '音樂會干擾嗎？', a: '依個人；純節拍或白噪音對部分人較佳。' },
      { q: '緊急電話怎麼辦？', a: '保留白名單或震動，其餘延後。' },
    ],
  }),
  buildKeywordPage('productivity', 'simple-focus-tool', '簡單專注工具', {
    h1: '簡單專注工具：計時＋一則當前任務',
    seoTitle: '簡單專注工具｜線上計時｜RxV',
    metaDescription:
      '專注不必一整套系統：一個計時器加上眼前唯一任務即可。RxV 提供線上番茄鐘，並可另開待辦寫下下一步。',
    intro:
      '若 GTD、看板學不完，就從「現在做這一件」開始。便利貼或待辦寫一句，計時器按下；完成後撕掉或打勾，再寫下一件。複雜度與你的執行力要匹配，不然工具會變成拖延藉口。',
    situations: ['自由接案者每日開工儀式', '家務與整理分段', '學生寫作業前先寫「第一小題」'],
    faq: [
      { q: '需要很多外掛嗎？', a: '不必，先固定一個計時習慣再說。' },
      { q: '任務太大怎麼辦？', a: '拆成「下一步 5～25 分鐘可做」。' },
      { q: '和極簡專注計時重複嗎？', a: '極簡頁重啟動摩擦；本頁重「一任務＋計時」最小組合。' },
    ],
  }),

  buildKeywordPage(
    'productivity',
    'daily-task-list',
    '每日任務清單',
    {
      h1: '每日任務清單：今天只做關鍵幾件',
      seoTitle: '每日任務清單｜線上待辦｜RxV',
      metaDescription:
        '從長清單挑出今日 3～7 件，依優先與能量排序。使用 RxV 待辦清單頁面建立可勾選列表，再視需要用番茄鐘執行每一段。',
      intro:
        '無限待辦只會讓人覺得永遠做不完。每日清單是「承諾今日會碰觸的範圍」：早上選定、晚上檢視；沒做完的移到明日並問是否仍重要。與番茄鐘搭配時，一項任務可對應多顆番茄。',
      situations: ['上班族晨會前列今日重點', '自由工作者區分「計費／行政」', '家長協調家務與孩子行程'],
      faq: [
        { q: '每天要列幾件？', a: '宜少不宜多，寧可完成有成就感。' },
        { q: '和專案看板差別？', a: '日清單是當日執行層，看板偏階段與協作。' },
        { q: '可以手機編輯嗎？', a: '依待辦頁面支援；重點是隨時可更新。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage(
    'productivity',
    'simple-task-manager',
    '簡易任務管理',
    {
      h1: '簡易任務管理：不打仗的待辦哲學',
      seoTitle: '簡易任務管理｜線上待辦｜RxV',
      metaDescription:
        '不需要 Enterprise 功能也能管理生活：新增、完成、延後三動作就夠。RxV 待辦清單適合個人與小團隊輕量使用，複雜排程再交給日曆。',
      intro:
        '任務管理失敗常來自欄位太多。簡易流程：收件匣先丟想法，每天挑幾件進「今日」；其餘標延期或刪除。每週一次清空收件匣，避免清單變垃圾堆。',
      situations: ['個人副業與興趣專案', '學生社團幹部分工', '小型工作室客戶待辦'],
      faq: [
        { q: '需要標籤與專案嗎？', a: '有幫助但非必須，先能穩定完成再進階。' },
        { q: '重複性任務？', a: '可複製昨日項目或寫成週期習慣。' },
        { q: '和番茄鐘？', a: '待辦定「做什麼」，番茄鐘定「現在這一段」。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage(
    'productivity',
    'online-task-planner',
    '線上任務規劃',
    {
      h1: '線上任務規劃：估時、排序與緩衝',
      seoTitle: '線上任務規劃｜排程與估時｜RxV',
      metaDescription:
        '在待辦中為任務粗估所需時間與截止日，排出本週可行負荷。RxV 待辦搭配番茄鐘驗證估時是否樂觀，逐步校準。',
      intro:
        '規劃不是一次畫完美甘特圖，而是「估錯了再改」。先為任務寫下樂觀、悲觀與最可能時間，排進本週空檔並留 20% 緩衝；執行時用番茄記錄實際耗時，下次估時會越準。',
      situations: ['接案者排本週可交付件', '學生排報告與考試週', '活動籌備多線並行'],
      faq: [
        { q: '估時總是不准？', a: '記錄實際番茄數或時數，累積個人歷史資料。' },
        { q: '插單怎麼辦？', a: '重新排序並砍掉低優先，而非硬塞。' },
        { q: '需要日曆嗎？', a: '有會議與硬截止時，日曆＋待辦並用較穩。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage(
    'productivity',
    'study-planner-online',
    '線上讀書計畫',
    {
      h1: '線上讀書計畫：科目、章節與複習輪次',
      seoTitle: '線上讀書計畫｜考前排程｜RxV',
      metaDescription:
        '把考程與章節拆成待辦項目，標註複習輪次與弱科加強日。使用 RxV 待辦清單建立讀書計畫，執行時開番茄鐘專注每一小段。',
      intro:
        '讀書計畫最怕「只有一天要考試」這種大塊。請反向從考試日拆出每章可讀頁數與練習量，塞進每日清單；弱科安排精力較好的時段。計畫會變，每週調整一次比一次畫死更實用。',
      situations: ['多科段考倒數', '證照考長期備考', '研究所入學考複習'],
      faq: [
        { q: '計畫落後怎麼辦？', a: '砍掉非核心章節或延長週末時段，並記錄原因。' },
        { q: '要排休息嗎？', a: '要，避免燃盡；休息也是計畫的一部分。' },
        { q: '和學生番茄鐘頁差別？', a: '該頁重計時節奏；本頁重科目章節排程與待辦結構。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage(
    'productivity',
    'workflow-productivity-tool',
    '工作流程與生產力',
    {
      h1: '工作流程整理：從收件匣到完成閉環',
      seoTitle: '工作流程待辦｜生產力｜RxV',
      metaDescription:
        '用待辦串起「收集—釐清—排程—執行—檢視」簡化版流程，減少任務在腦中打轉。RxV 待辦清單作為線上中樞，番茄鐘負責執行段。',
      intro:
        '生產力工具說到底是在降低認知負荷。固定幾個狀態（例如：收件、本週、進行中、完成）即可，不必追求完美看板；每日結束把「進行中」清空或移回排程，避免卡死的殭屍任務。',
      situations: ['知識工作者週五檢視閉環', '小型團隊共用簡單清單', '個人 side project 從想法到上線'],
      faq: [
        { q: '需要多人協作嗎？', a: '視需求；先個人跑通流程再擴展。' },
        { q: '和專案管理軟體？', a: '輕量任務用待辦即可，重協作再換工具。' },
        { q: '如何防待辦膨脹？', a: '定期刪或歸檔「永遠不會做」的項目。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),

  buildKeywordPage('image-resize', 'resize-image-for-instagram-story', 'IG Story 尺寸', {
    h1: 'Instagram Story 圖片尺寸：9:16 與安全區線上調整',
    seoTitle: 'IG Story 圖片尺寸調整｜限時動態裁切｜RxV',
    metaDescription:
      '依限時動態直式版位調整圖片長寬與安全區，避免貼紙與按鈕遮字。瀏覽器使用 RxV 圖片尺寸轉換，完成後上傳 IG。',
    intro:
      'Story 以全螢幕直式為主，若用橫圖或比例不對，系統會裁切或留白。建議先對齊 9:16，再把標語放在中央偏上，預留頂底 UI 與互動區。',
    steps: [
      '準備原始素材並在編輯軟體或 RxV 開啟「圖片尺寸轉換」。',
      '設定目標為直式 Story 常用比例（多為 9:16），必要時裁切並檢查主體是否在安全區。',
      '匯出前檢查文字與連結按鈕預留空間，避免與頭像、輸入框重疊。',
      '上傳至 Instagram 限時動態預覽，若需微調再回到工具調整長邊或位置。',
    ],
    situations: ['品牌每日限時促銷與倒數', '活動現場即時發 Story', '導流至表單或私訊的短文案圖'],
    faq: [
      { q: '與 Reels 封面相同嗎？', a: '多為直式但版位與互動不同，建議分開預覽。' },
      { q: '可以放連結？', a: '依帳號資格；版面仍建議保留安全區。' },
      { q: '檔案太大？', a: '可略降解析度或再經圖片壓縮。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-youtube-thumbnail', 'YouTube 縮圖尺寸', {
    h1: 'YouTube 影片縮圖線上調整：16:9 與可讀標題',
    seoTitle: 'YouTube 縮圖尺寸調整｜16:9 封面｜RxV',
    metaDescription:
      '將封面圖調成 16:9 與足夠解析度，預留四角與時間戳安全區。使用 RxV 圖片尺寸轉換後再上傳 YouTube。',
    intro:
      '縮圖在搜尋與推薦流中以極小版面呈現，字級過小或主體偏邊會被忽視。建議先定 16:9 畫布，再放大關鍵字與人臉或產品。',
    steps: [
      '開啟圖片尺寸轉換，將長邊或比例設為 YouTube 建議的 16:9 橫式。',
      '檢查縮圖在小尺寸預覽是否仍辨識標題與主體，必要時裁切或加邊。',
      '匯出適當解析度以避免模糊，檔案過大時可再搭配圖片壓縮。',
      '到 YouTube 工作室上傳縮圖並檢查手機與電視端預覽。',
    ],
    situations: ['教學頻道每支影片上傳前', '直播結束後重播縮圖', 'A/B 測試多版縮圖前統一尺寸'],
    faq: [
      { q: '與 Shorts 直式相同嗎？', a: 'Shorts 多為直式；長影片縮圖以 16:9 為主。' },
      { q: '可以放太多字嗎？', a: '建議少字高對比，避免手機端讀不到。' },
      { q: '需要透明底？', a: '縮圖多為不透明 JPG／PNG，依平台規範。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-facebook-cover', 'Facebook 封面尺寸', {
    h1: 'Facebook 粉絲專頁封面照片線上裁切',
    seoTitle: 'Facebook 封面尺寸調整｜粉專橫幅｜RxV',
    metaDescription:
      '對齊粉專封面橫幅建議比例與可視區，避免手機與桌機裁切後標語消失。使用 RxV 圖片尺寸轉換輸出後再上傳。',
    intro:
      '封面會依裝置裁切不同區域，若只依桌機設計，手機上可能只剩局部。請以官方建議寬幅輸出，並在實機預覽一次。',
    steps: [
      '查詢目前 Meta 建議的封面長寬比與最小像素。',
      '在尺寸轉換工具中設定對應寬高或裁切框，將主標與活動資訊放在跨裝置安全區。',
      '匯出後於粉專預覽檢查與大頭貼重疊區是否留白。',
      '若檔案過大，可再壓縮但不犧牲必要清晰度。',
    ],
    situations: ['檔期活動與換季主視覺', '新創品牌首次上架粉專', '課程招生與講座橫幅'],
    faq: [
      { q: '與個人檔案封面一樣嗎？', a: '版位可能不同，請分別預覽。' },
      { q: '可以放 QR？', a: '可，但手機縮圖要確認仍可掃描。' },
      { q: '多久更新？', a: '依檔期；無硬性規定，但建議維持辨識度。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-twitter-header', 'X／Twitter 頁首橫幅', {
    h1: 'X（Twitter）頁首橫幅圖片線上調整',
    seoTitle: 'Twitter 頁首橫幅尺寸｜X 封面裁切｜RxV',
    metaDescription:
      '將個人資料頁首橫幅調成建議寬幅比，避開大頭貼遮擋區。使用 RxV 圖片尺寸轉換後再套用到 X。',
    intro:
      '頁首橫幅與大頭貼並列，左下角常被頭像覆蓋。請將關鍵標語置中或偏右，並以官方建議尺寸輸出。',
    steps: [
      '確認 X 目前建議的頁首圖像素與比例。',
      '在工具中裁切或縮放至目標寬高，避免重要文字落在左下與邊緣。',
      '深色／淺色模式各預覽一次，確認對比足夠。',
      '上傳後用手機與桌機檢視，必要時微調再匯出。',
    ],
    situations: ['創作者更新個人品牌', '講者與顧問放課程連結', '求職季展示作品集入口'],
    faq: [
      { q: '與貼文圖相同嗎？', a: '不同，頁首為寬幅橫圖。' },
      { q: '可以動態橫幅？', a: '依平台當前版本與帳號類型而定。' },
      { q: '檔案格式？', a: '常見為 JPG／PNG，依上傳介面為準。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-tiktok-video-cover', 'TikTok 影片封面尺寸', {
    h1: 'TikTok 影片封面（直式）線上裁切',
    seoTitle: 'TikTok 影片封面尺寸｜直式縮圖｜RxV',
    metaDescription:
      '將封面調為 TikTok 直式 9:16，強化標題字與主體在動態牆上的辨識度。RxV 圖片尺寸轉換後再上傳封面。',
    intro:
      '封面與影片同為直式時，預覽最一致。若從橫式素材轉來，請裁切中央主體並放大文字對比，避免底部被介面遮擋。',
    steps: [
      '在尺寸工具選擇 9:16 或等效直式輸出。',
      '將標題字放在中央偏上，預留底部互動列與個人資訊區。',
      '匯出並檢查小圖是否仍讀得到標題。',
      '於 TikTok 上傳或替換封面，實機滑動確認。',
    ],
    situations: ['短影音系列統一封面風格', '電商展示單品開箱', '課程宣傳與直播預告'],
    faq: [
      { q: '與 IG Reels 能共用？', a: '比例常接近，但安全區不同，建議各預覽。' },
      { q: '封面與頭貼？', a: '用途不同；頭貼為小圓形，封面為全螢幕直式。' },
      { q: '可以後製改封面？', a: '可依平台功能更新；舊連結快取可能延遲。' },
    ],
  }),
  buildKeywordPage('image-resize', 'resize-image-for-shopify-product-image', 'Shopify 商品圖尺寸', {
    h1: 'Shopify 商品主圖尺寸：正方形與一致邊長',
    seoTitle: 'Shopify 商品圖尺寸調整｜電商主圖｜RxV',
    metaDescription:
      '將商品照統一為店內慣用長邊或 1:1，避免集合頁網格高低不一。使用 RxV 圖片尺寸轉換批次對齊後再上傳 Shopify。',
    intro:
      '主圖邊長不一會讓集合頁看起來不專業。建議訂定最小長邊與背景規範（白底或情境），再批量調整輸出。',
    steps: [
      '決定店內規範：例如 2048px 正方形或 4:5 直式。',
      '在工具中逐批或單張調整至目標寬高，保留商品主體置中。',
      '檢查邊緣是否留白一致，必要時加邊或裁切。',
      '上傳 Shopify 媒體庫並在佈景主題預覽列表與內頁。',
    ],
    situations: ['新站一次上架大量 SKU', '供應商圖尺寸不一需統一', '季節主題換情境照'],
    faq: [
      { q: '與 Amazon 主圖相同？', a: '規範不同，請分開檢查各平台。' },
      { q: '要先去背嗎？', a: '視品牌規範；尺寸工具可搭配裁切。' },
      { q: '可以只調主圖？', a: '可以，細節圖可另設規則。' },
    ],
  }),

  buildKeywordPage('qr-code', 'qr-code-for-restaurant-menu', '餐廳菜單 QR', {
    h1: '餐廳菜單 QR Code：線上點餐與更新價格',
    seoTitle: '餐廳菜單 QR Code｜桌邊掃描｜RxV',
    metaDescription:
      '將菜單或點餐頁連結製成 QR，印於桌貼與立牌；價格異動時若用動態短網址可少重印。使用 RxV QR Code 產生器。',
    intro:
      '紙本菜單改版成本高，QR 指向線上菜單可隨時更新。請使用 HTTPS 連結，並在弱光餐廳加大印刷尺寸與對比。',
    steps: [
      '準備好可公開開啟的菜單或點餐頁（手機實測一次）。',
      '複製連結至 RxV QR Code 產生器，產生 PNG／SVG。',
      '列印於桌貼或立牌，保留邊距並於店內試掃。',
      '價格或品項變更時更新網頁；若為靜態碼需重新列印。',
    ],
    situations: ['內用與外帶分流', '多語菜單切換', '夜市攤位有限空間'],
    faq: [
      { q: '要動態 QR 嗎？', a: '若常改價且可接受短網址服務，可評估。' },
      { q: '老人家不會掃？', a: '保留紙本或人工協助點餐。' },
      { q: '可以一店多張？', a: '可分區或分桌號帶參數。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-google-review', 'Google 評論 QR', {
    h1: 'Google 評論 QR Code：到店後一掃留評',
    seoTitle: 'Google 評論 QR Code｜店家評價｜RxV',
    metaDescription:
      '將 Google 商家評論或搜尋連結做成 QR，放在櫃台與帳單。請勿強制留評，並遵守平台規範。RxV 免費產生 QR。',
    intro:
      '評論影響搜尋與信任，但體驗仍是核心。QR 只是降低「找評論頁」的摩擦，請在服務結束後禮貌邀請。',
    steps: [
      '於 Google 商家後台取得可分享之評論連結（以官方最新流程為準）。',
      '貼入 QR 產生器，下載高解析圖檔供印刷。',
      '放在結帳與桌面立牌，並培訓店員一句話邀請時機。',
      '定期檢查連結是否仍正確（分店或帳號整合時易變）。',
    ],
    situations: ['咖啡廳與餐酒館累積評論', '診所與沙龍預約後邀請', '民宿退房感謝卡'],
    faq: [
      { q: '可以送贈品換評論嗎？', a: '請遵守 Google 與公平交易相關規範。' },
      { q: '連結打不開？', a: '確認地區與帳號狀態，並用不同手機測試。' },
      { q: '要放 Logo？', a: '若工具支援，需保留對比與可掃描性。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-instagram', 'Instagram QR', {
    h1: 'Instagram 個人檔案／貼文 QR Code',
    seoTitle: 'Instagram QR Code｜追蹤與導流｜RxV',
    metaDescription:
      '將 IG 個人檔案、精選或活動貼文連結製成 QR，用於名片、海報與店面。使用 RxV QR Code 產生器並實測掃描。',
    intro:
      '實體活動難以口述帳號名稱，QR 可一掃到達。請使用官方分享連結（https），印刷前用多款手機試掃。',
    steps: [
      '在 IG 複製要導流的公開連結（個人檔案或精選）。',
      '貼入產生器，選擇錯誤修正等級與足夠印刷尺寸。',
      '下載後置入名片或展場背板，保留邊緣留白。',
      '活動後若換活動 landing，記得更新連結與 QR。',
    ],
    situations: ['市集攤位與音樂活動', '攝影師名片背面', '店面櫃台追蹤活動'],
    faq: [
      { q: '私人帳號？', a: '掃碼者需具備存取權限，否則看不到內容。' },
      { q: '改名會影響嗎？', a: '若使用帳號網址，改名可能影響，請重新確認。' },
      { q: '與 Facebook 分開？', a: '連結不同，請分開產生。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-facebook-page', 'Facebook 粉專 QR', {
    h1: 'Facebook 粉絲專頁 QR Code',
    seoTitle: 'Facebook 粉專 QR Code｜按讚導流｜RxV',
    metaDescription:
      '將粉絲專頁或活動網址製成 QR，印在文宣與包裝。掃描後開啟 Facebook。RxV QR Code 產生器免費製作。',
    intro:
      '小商家希望客人離店後仍追蹤動態，QR 可降低搜尋成本。請確認連結為公開可讀之粉專首頁或指定貼文。',
    steps: [
      '於電腦版複製粉專網址，避免手機版多餘參數干擾。',
      '貼入產生器並下載向量或高解析點陣供印刷。',
      '在店內與外帶包裝測試掃描距離與光線。',
      '搭配短文案說明掃描後可得到什麼（優惠、菜單、客服）。',
    ],
    situations: ['外帶杯套與外帶袋', '社區講座報名', '社團與非營利招募'],
    faq: [
      { q: '未登入會怎樣？', a: '可能看到登入頁或公開預覽，依設定。' },
      { q: '與 IG 同一張？', a: '網址不同，建議分開印。' },
      { q: '可以追蹤？', a: '靜態 QR 本身無統計，需靠短網址或 UTM。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-youtube-channel', 'YouTube 頻道 QR', {
    h1: 'YouTube 頻道訂閱連結 QR Code',
    seoTitle: 'YouTube 頻道 QR Code｜訂閱導流｜RxV',
    metaDescription:
      '將頻道首頁或訂閱用網址做成 QR，印在講義、海報與周邊。RxV QR Code 產生器快速製作，手機實測後再印。',
    intro:
      '口頭請觀眾「搜尋頻道名」容易拼錯；官方頻道連結一掃即到。活動後若改自訂網址，請同步更新 QR。',
    steps: [
      '從瀏覽器複製完整頻道網址（含 https）。',
      '貼入產生器，依印刷尺寸選擇輸出解析度。',
      '在講義末頁與易拉展放 QR，並寫一句訂閱理由。',
      '多機試掃後再大量印刷。',
    ],
    situations: ['實體課程與演講', '音樂表演周邊商品', '企業內訓錄影公開頻道'],
    faq: [
      { q: '要放單支影片？', a: '改貼該影片 watch 連結另做一碼。' },
      { q: '短網址？', a: '可用，但請信任短網址服務穩定性。' },
      { q: '與影片內嵌碼？', a: '不同，QR 只負責開網址。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-event-check-in', '活動報到 QR', {
    h1: '活動報到與簽到 QR Code',
    seoTitle: '活動報到 QR Code｜簽到連結｜RxV',
    metaDescription:
      '將報到頁、電子票或 Google 表單連結製成 QR，放在入口與工作人員胸牌。RxV QR Code 產生器；活動前務必壓力測試連結。',
    intro:
      '現場排隊手打網址易出錯，QR 可加速入場。若使用動態驗證碼請依主辦系統規範；此頁情境以「導向固定報到頁」為例。',
    steps: [
      '確認報到頁在活動當日可公開開啟，並用 4G／5G 實測。',
      '複製 HTTPS 連結至產生器，選適合立牌尺寸的輸出。',
      '印製並在彩排時請工作人員試掃。',
      '活動後若連結下架，請撤下現場 QR 以免誤導。',
    ],
    situations: ['研討會與年會', '讀書會與社團收費活動', '展覽與音樂會入場'],
    faq: [
      { q: '離線怎麼辦？', a: '需主辦備援流程；QR 本身仍仰賴連線開頁。' },
      { q: '一人一碼？', a: '依票務設計；團體報名可能共用同一報到頁。' },
      { q: '可以追蹤人次？', a: '依報到頁後台或短網址統計。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-payment-link', '收款連結 QR', {
    h1: '收款／付款連結 QR Code',
    seoTitle: '收款連結 QR Code｜現場付款｜RxV',
    metaDescription:
      '將官方金流或收款頁 HTTPS 連結製成 QR，用於市集、家教與活動現場。RxV 產生器；請勿使用來路不明短網址。',
    intro:
      '小額收款與分帳場景適合「掃碼即開付款頁」。請自行掃描測試金額欄位與備註是否正確，並保存交易紀錄以利對帳。',
    steps: [
      '向金流平台取得可分享之收款或帳單連結。',
      '貼入 QR 產生器，印刷於立牌或桌卡。',
      '在正式營業前用不同支付 App 試付小額。',
      '連結或帳號變更時重新產生並替換現場物料。',
    ],
    situations: ['文創市集攤位', '家教與鐘點服務', '社團活動現場報名費'],
    faq: [
      { q: '可以貼 LINE Pay？', a: '若平台提供可分享連結即可編碼。' },
      { q: '手續費誰負擔？', a: '依平台與你與客戶約定。' },
      { q: '短網址安全嗎？', a: '請用可信服務並確認最終網域。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-business-card', '名片 QR', {
    h1: '名片與 DM 上的 QR Code',
    seoTitle: '名片 QR Code｜聯絡與作品集｜RxV',
    metaDescription:
      '將官網、作品集或 vCard 頁製成 QR 印在名片背面，減少打字錯誤。RxV QR Code 產生器，印刷前多機試掃。',
    intro:
      '紙本能放的資訊有限，QR 可延伸到手機可操作的完整連結。建議連結短而穩定，並在名片加一句話說明掃描後得到什麼。',
    steps: [
      '決定要導向官網、Calendly 或聯絡表單等單一最佳入口。',
      '產生 QR 並下載向量檔交給印刷廠。',
      '確認印刷尺寸與紙材對比足夠，避免細碼掃不到。',
      '職稱或電話變更時檢查連結是否仍有效。',
    ],
    situations: ['接案設計師與顧問', '房仲與保險業務', '學術研討交換聯絡方式'],
    faq: [
      { q: '要放 Logo？', a: '若工具支援，需保留錯誤修正與對比。' },
      { q: '與 NFC 名片？', a: '可並存；QR 相容性較廣。' },
      { q: '連結很長？', a: '建議先縮短再編碼，降低模組密度。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-website-link', '官網連結 QR', {
    h1: '官網與活動頁 QR Code',
    seoTitle: '官網連結 QR Code｜一頁式活動｜RxV',
    metaDescription:
      '將官網首頁、報名頁或一頁式活動網址製成 QR，用於簡報、傳單與展場。RxV QR Code 產生器，請確認為 HTTPS。',
    intro:
      '任何需要「從線下到線上」的轉換都可使用。請避免使用會過期的活動參數作長期印刷，或預留活動結束後轉址。',
    steps: [
      '在瀏覽器開啟目標頁並複製網址列完整 URL。',
      '貼入產生器，檢查是否含正確 UTM 或語系參數。',
      '輸出適合投影與印刷的解析度兩種檔案。',
      '上線前後各測一次，避免 DNS 或 SSL 未就緒。',
    ],
    situations: ['演講簡報末頁', '實體 DM 與報紙廣告', '店面櫃台導流至會員註冊'],
    faq: [
      { q: '可以導向 App？', a: '多數情況先落地頁再導向下載。' },
      { q: '活動結束連結失效？', a: '可改 301 或換動態短網址策略。' },
      { q: '需要追蹤？', a: '在網址加 UTM 或使用短網址後台。' },
    ],
  }),
  buildKeywordPage('qr-code', 'qr-code-for-wifi-login', 'WiFi 連線 QR', {
    h1: '店內 WiFi 連線 QR Code',
    seoTitle: 'WiFi QR Code｜店內連線｜RxV',
    metaDescription:
      '將 WiFi SSID 與密碼編成 QR，顧客掃描即可連線（依裝置支援）。RxV 若支援 WiFi 格式可直接產生；否則可改放訪客入口頁。',
    intro:
      '反覆拼字密碼易出錯，桌邊 QR 可加速連線。請使用訪客網路並定期更換密碼，避免與內網混用。',
    steps: [
      '向路由器管理介面確認訪客 SSID 與密碼或 WPA 設定。',
      '依產生器支援輸入 WiFi 字串或改放訪客登入說明頁連結。',
      '列印於桌卡並在店內不同位置試掃。',
      '密碼變更後重新列印並撤下舊卡。',
    ],
    situations: ['咖啡廳與共享空間', '民宿公共區', '診所候診室'],
    faq: [
      { q: 'iPhone 與 Android 都支援？', a: '依系統版本；不支援時改文字註明密碼。' },
      { q: '公開密碼安全嗎？', a: '訪客網路與定期更換可降低風險。' },
      { q: '與既有 wifi-qr-code 頁？', a: '主題相近；本頁強調店內登入情境與步驟。' },
    ],
  }),

  buildKeywordPage('ai-summary', 'summarize-research-paper', '研究論文摘要', {
    h1: '研究論文摘要：問題、方法與貢獻',
    seoTitle: '研究論文摘要模板｜文獻閱讀｜RxV',
    metaDescription:
      '依 IMRaD 節奏整理研究問題、方法、結果與限制；請確認你有權使用該論文文字。使用 RxV AI 摘要輔助閱讀，引用請手動核對。',
    intro:
      '與「論文與研究摘要」既有頁互補：此 slug 強調論文體裁的摘要流程。AI 輸出僅作草稿，投稿與學位審查請依期刊與學校規範。',
    steps: [
      '先複製摘要與結論段落，再視需要貼上方法與限制原文。',
      '在 AI 摘要中請求條列：研究問題、資料、主要發現、限制。',
      '對照原文圖表與數字，修正誤讀處。',
      '將重點改寫成自己的筆記並註明出處與 DOI。',
    ],
    situations: ['文獻回顧前快速篩選', '組會前五分鐘講解一篇新文', '跨領域讀不懂方法名詞時抓定義'],
    faq: [
      { q: '與 research-paper-summary 頁重複嗎？', a: '網址不同；內容可搭配使用，仍以原論文為準。' },
      { q: '可以貼付費期刊全文？', a: '請遵守授權與學校政策。' },
      { q: '數學證明？', a: '摘要難完整呈現，請讀原文。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-meeting-notes', '會議筆記摘要', {
    h1: '會議筆記摘要：決議、待辦與負責人',
    seoTitle: '會議筆記摘要｜紀要草稿｜RxV',
    metaDescription:
      '將手打或語音轉寫的會議筆記貼上，整理決議、待辦與負責人；機密請去識別。與「會議記錄摘要」既有頁可並存，依網址選擇。',
    intro:
      '此頁對應 slug summarize-meeting-notes，適合已整理成條列筆記再濃縮。若輸入為口語逐字稿，請參考會議逐字稿摘要頁。',
    steps: [
      '將筆記依議題分段貼上，刪除寒暄與重複句。',
      '請 AI 輸出：決議、待辦、負責人、截止日（若有）。',
      '與會者核對專有名詞與數字。',
      '依公司範本改寫後發布紀要。',
    ],
    situations: ['專案週會與跨部門同步', '讀書會討論整理', '客戶訪談後內部分享'],
    faq: [
      { q: '與 meeting-notes-summary 差別？', a: '該頁為較早建立之落地頁；主題相近。' },
      { q: '可以當正式紀要嗎？', a: '需簽核；AI 僅輔助草稿。' },
      { q: '英文會議？', a: '可以，專有名詞請人工複核。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-long-text', '長文摘要', {
    h1: '長文摘要：分段貼上與合併大綱',
    seoTitle: '長文線上摘要｜分段策略｜RxV',
    metaDescription:
      '當單次字數超過上限時，依章節切分摘要再合併總覽；適用白皮書與合約附錄。RxV AI 摘要；請遵守版權。',
    intro:
      '與 summarize-long-text-online 不同 slug，重點在「如何切長文」。每段先產微摘要，再請 AI 合成全篇五句話，並統一人名與術語。',
    steps: [
      '依標題或小節將長文切成多段，每段單獨摘要。',
      '將各段一句話摘要再貼成清單請求合併總覽。',
      '檢查跨段論證是否遺漏，必要時補貼關鍵段落。',
      '輸出後註明版本日期以利追蹤改版。',
    ],
    situations: ['合約附錄多份合併閱讀', '政府白皮書一夜抓結論', '譯稿連載對齊設定'],
    faq: [
      { q: '與 long-text-online 頁？', a: '主題相近；可依網址 SEO 需求擇一或並存。' },
      { q: '會不會漏重點？', a: '長文建議人工複核跨段邏輯。' },
      { q: '可以上傳 PDF？', a: '請先複製可選取之文字。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-academic-article', '學術文章摘要', {
    h1: '學術文章摘要：期刊體例與引用意識',
    seoTitle: '學術文章摘要｜期刊閱讀｜RxV',
    metaDescription:
      '針對期刊論文與學會文章整理背景、方法與貢獻；請勿直接複製 AI 句子至投稿稿件。RxV AI 摘要作閱讀輔助。',
    intro:
      '與 summarize-academic-paper 並存：此頁強調「文章」体裁與引用責任。讀完摘要後請回到原文核對所有數據與因果。',
    steps: [
      '貼上摘要、引言與討論中的關鍵段。',
      '請 AI 條列：研究缺口、方法、主要結果、實務意涵。',
      '標出你不確定的術語並回原文查證。',
      '將結果改寫成你的文獻筆記卡片。',
    ],
    situations: ['研究所每週論文報告', '投稿前相關文獻盤點', '科普寫作前理解原論文'],
    faq: [
      { q: '與 academic-paper 頁？', a: '不同 slug；可擇需瀏覽。' },
      { q: '能產期刊格式英文摘要？', a: '請自行依期刊指南改寫與潤飾。' },
      { q: '評論文章也算嗎？', a: '算，但重點在論點整理而非實驗。' },
    ],
  }),
  buildKeywordPage('ai-summary', 'summarize-document', '文件摘要', {
    h1: '文件摘要：從全文到可執行重點',
    seoTitle: '文件線上摘要｜PDF 與 Word｜RxV',
    metaDescription:
      '將從文件複製的文字貼上，整理大綱與義務條款提示；法律解釋請諮詢專業。與 summarize-document-online 並存。RxV AI 摘要。',
    intro:
      '此 slug 較短，適合「文件」關鍵字搜尋。表格與附件請改描述或分段貼上；機密文件請依公司資安流程。',
    steps: [
      '清除頁首頁尾與重複頁碼後分段貼上。',
      '請 AI 先產章節大綱，再對重點段深入一句話摘要。',
      '對照目錄檢查是否漏章節。',
      '輸出標註「僅供閱讀輔助」並保存原檔。',
    ],
    situations: ['員工手冊改版比對', '補助辦法申請資格初判', '合作備忘錄給非法律背景同事'],
    faq: [
      { q: '與 document-online 頁？', a: '不同網址；內容可互補。' },
      { q: '有法律效力嗎？', a: '沒有，以原文為準。' },
      { q: '掃描 PDF？', a: '請先 OCR 成可複製文字。' },
    ],
  }),

  buildKeywordPage('productivity', 'pomodoro-timer-for-studying', '讀書用番茄鐘', {
    h1: '讀書專用番茄鐘：科目輪替與休息',
    seoTitle: '讀書番茄鐘｜考前專注｜RxV',
    metaDescription:
      '用番茄鐘切分讀書段落，搭配短休保護眼睛；與「學生讀書番茄鐘」頁可並存，依網址選擇。開啟 RxV 線上番茄鐘。',
    intro:
      '此頁對應 slug pomodoro-timer-for-studying，強調「讀書」場景的啟動儀式。每顆番茄結束勾選進度，比坐三小時更有感。',
    steps: [
      '在待辦寫下本科目今天要完成的具體任務。',
      '設定專注與休息長度，按下開始並關閉通知。',
      '休息時離開螢幕喝水或伸展。',
      '一天結束回顧完成幾顆番茄並調整明日清單。',
    ],
    situations: ['段考多科輪流複習', '背單字與考古題交替', '線上課程搭配筆記'],
    faq: [
      { q: '與 pomodoro-timer-for-students？', a: '主題接近；不同 slug 供 SEO 收斂。' },
      { q: '一定要 25 分鐘？', a: '可自訂；維持固定一組至少一週再評估。' },
      { q: '能搭配待辦嗎？', a: '建議每顆對應清單上一項。' },
    ],
  }),
  buildKeywordPage('productivity', 'focus-timer-for-deep-work', '深度工作計時', {
    h1: '深度工作專用計時：長區塊與低打斷',
    seoTitle: '深度工作計時｜專注區塊｜RxV',
    metaDescription:
      '以較長專注段保護程式、寫作與策略思考；與 deep-work-timer 既有頁並存。使用 RxV 番茄鐘自訂分鐘數。',
    intro:
      '此 slug 強調「深度工作」關鍵字。與一般番茄差在時間塊較長、休息仍不可省略；插單請記錄斷點以利恢復。',
    steps: [
      '關閉非必要通訊軟體與分頁。',
      '設定 45～90 分鐘專注與短休，依任務微調。',
      '中斷時寫下「下一步」再處理插單。',
      '結束後簡短記錄產出與耗時。',
    ],
    situations: ['論文與程式架構長考', '年度企畫與簡報策略', '創作初稿不中斷'],
    faq: [
      { q: '與 deep-work-timer 頁？', a: '可擇一瀏覽；本頁為另一組 SEO 文案。' },
      { q: '心流中要不要停？', a: '若身體需要仍建議短休。' },
      { q: '能開會議中？', a: '會議中請以現場為準，勿因個人計時干擾他人。' },
    ],
  }),
  buildKeywordPage('productivity', 'focus-timer-for-students', '學生專注計時', {
    h1: '學生專注計時：課業與分心管理',
    seoTitle: '學生專注計時器｜讀書與作業｜RxV',
    metaDescription:
      '以計時建立「現在只唸這一科」的儀式，搭配手機勿擾；與其他學生向頁並存。RxV 線上番茄鐘免安裝。',
    intro:
      '學生常同時被社群與訊息打斷。專注計時不是萬靈丹，但能提供重新開始的錨點；失敗了再開下一顆即可。',
    steps: [
      '寫下這 25～40 分鐘唯一任務（例：數學第三章習題）。',
      '手機勿擾或交給他人保管。',
      '鈴響後記錄完成度與卡關題號。',
      '短休後決定延長同一科或換科。',
    ],
    situations: ['考前衝刺自習', '寒暑假作業分段', '線上考試模擬'],
    faq: [
      { q: '與 focus-productivity-timer？', a: '不同 slug；可依搜尋習慣選讀。' },
      { q: '讀不下怎麼辦？', a: '先把任務切更小或先站起來走動。' },
      { q: '能用手機番茄？', a: '可以，但易分心，桌面版較佳。' },
    ],
  }),
  buildKeywordPage(
    'productivity',
    'simple-task-list-online',
    '線上簡易待辦',
    {
      h1: '線上簡易待辦：少項目、快完成',
      seoTitle: '線上簡易待辦清單｜極簡任務｜RxV',
      metaDescription:
        '每日只列少數可完成項目，避免清單無限膨脹；與 minimalist-todo-list 等頁互補。開啟 RxV 待辦清單。',
      intro:
        '簡易待辦的精神是「寫得下就做得到」。複雜專案請再拆子任務；完成後再打勾獲得回饋。',
      steps: [
        '早上列出 3～5 件今日最重要任務。',
        '每件寫到「下一步可做」的粒度。',
        '完成即勾選，未完成移到明日並反思原因。',
        '週末清空收件匣或歸檔長期不做項目。',
      ],
      situations: ['自由工作者每日開工', '學生每晚檢視隔日課業', '家務與採買'],
      faq: [
        { q: '與極簡待辦頁？', a: '主題相近；不同網址收斂關鍵字。' },
        { q: '需要標籤嗎？', a: '可有可無，先能完成再說。' },
        { q: '和番茄鐘？', a: '待辦定內容，番茄定當下執行。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage(
    'productivity',
    'task-planner-for-work',
    '工作任務規劃',
    {
      h1: '工作任務規劃：本週可交付與緩衝',
      seoTitle: '工作任務規劃｜待辦與估時｜RxV',
      metaDescription:
        '以估時與優先順序排出本週工時內可交付成果；與 online-task-planner 等頁互補。使用 RxV 待辦與番茄鐘。',
      intro:
        '工作場景重「可交付」與「被插單」。規劃時預留會議與行政時間，避免樂觀估滿整週工時。',
      steps: [
        '列出本週硬截止與會議時段。',
        '將大任務拆成可驗收子項並粗估時間。',
        '塞進待辦並留 20% 緩衝。',
        '每日結束調整延後原因與下週容量。',
      ],
      situations: ['敏捷迭代週內交付', '客戶專案里程碑', '遠距工作自我追蹤'],
      faq: [
        { q: '與線上任務規劃頁？', a: '不同 slug；內容可互相參考。' },
        { q: '插單怎麼辦？', a: '砍掉低優先或協商截止日。' },
        { q: '需要 Gantt？', a: '視公司文化；待辦＋日曆常已足夠。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage(
    'productivity',
    'daily-task-manager',
    '每日任務管理',
    {
      h1: '每日任務管理：從收件匣到今日三件事',
      seoTitle: '每日任務管理｜待辦節奏｜RxV',
      metaDescription:
        '把收件匣雜事過濾成「今日可做」清單，與 daily-task-list 等頁並存。RxV 待辦清單協助執行。',
      intro:
        '管理每日任務重在篩選而非收集。沒寫進「今日」的其實是「之後再說」，要勇於延期或刪除。',
      steps: [
        '晨間快速掃收件匣，只挑進今日三件事。',
        '其餘標下週或等待他人回覆。',
        '下班前勾選完成並記錄未完成原因。',
        '週五回顧本週完成率與常見拖延類型。',
      ],
      situations: ['主管與個人貢獻者通用', '兼職與斜槓多線任務', '家長協調家庭與工作'],
      faq: [
        { q: '與每日任務清單頁？', a: '不同 slug；SEO 關鍵字略異。' },
        { q: '三件事做不完？', a: '代表估時過樂觀，明天砍範圍。' },
        { q: '能共享給同事？', a: '依你使用的待辦工具而定。' },
      ],
    },
    { ctaPath: '/todo', ctaLabel: '開啟待辦清單' }
  ),
  buildKeywordPage('productivity', 'distraction-free-study-timer', '無干擾讀書計時', {
    h1: '無干擾讀書計時：環境與通知一起管理',
    seoTitle: '無干擾讀書計時｜專注唸書｜RxV',
    metaDescription:
      '計時之外，同步關通知、單一視窗與手機勿擾；與 distraction-free-timer 既有頁並存。RxV 番茄鐘搭配待辦。',
    intro:
      '此 slug 強調「讀書」與無干擾組合。若仍分心，縮短專注段並獎勵完成，比硬撐三小時有效。',
    steps: [
      '整理桌面與書桌只留本科目材料。',
      '手機翻面或交給他人，開啟勿擾。',
      '啟動番茄鐘並寫下若分心時的復原咒語（例如深呼吸三次）。',
      '每四顆番茄安排較長休息離開座位。',
    ],
    situations: ['考前图书馆自習', '在家遠距考試準備', '禁社群期間唸書'],
    faq: [
      { q: '與無干擾專注計時頁？', a: '不同網址；讀書情境文案較多。' },
      { q: '還是會滑手機？', a: '可試實體鎖盒或專注 App。' },
      { q: '能戴耳機？', a: '白噪音或無歌詞音樂因人而異。' },
    ],
  }),
];

/** 與 internalLinks 主鍵對齊，供 Guide 頁 Related* 使用（避免動態 import） */
export type GuideInternalLinkKey =
  | 'image-resize'
  | 'image-compress'
  | 'qr-code'
  | 'ai-summary'
  | 'homework-helper'
  | 'line-sticker'
  | 'pomodoro'
  | 'todo'
  | 'scam-check'
  | 'policy-explain';

export type GuideArticle = {
  slug: string;
  path: string;
  title: string;
  intro: string;
  paragraphs: string[];
  steps: string[];
  faq: SeoFaqItem[];
  cta: ToolLinkItem;
  /** 擴充篇專用；未設時可由 cta.path 推斷內鏈主鍵 */
  seoTitle?: string;
  metaDescription?: string;
  internalLinkKey?: GuideInternalLinkKey;
};

const guideSeedData = [
  { slug: 'ig-image-size', title: 'IG圖片尺寸完整指南', cta: '/tools/image-resize' },
  { slug: 'qr-code-business-usage', title: 'QR Code 商業用途與導流做法', cta: '/tools/qr-code' },
  { slug: 'how-to-compress-images', title: '圖片壓縮方法與畫質平衡', cta: '/tools/image-compress' },
  { slug: 'ai-summary-best-practices', title: 'AI摘要怎麼用才有效', cta: '/summary' },
  { slug: 'student-homework-ai-tools', title: '學生作業 AI 工具使用建議', cta: '/tools/homework-helper' },
  { slug: 'pdf-summary-method', title: 'PDF 摘要方法快速上手', cta: '/summary' },
  { slug: 'tiktok-cover-size-guide', title: 'TikTok 封面尺寸與排版技巧', cta: '/tools/image-resize' },
  { slug: 'facebook-post-image-size', title: 'Facebook 貼文圖片尺寸整理', cta: '/tools/image-resize' },
  { slug: 'linkedin-post-image-guide', title: 'LinkedIn 圖文尺寸與發布建議', cta: '/tools/image-resize' },
  { slug: 'x-twitter-image-guide', title: 'X / Twitter 貼文圖片優化技巧', cta: '/tools/image-resize' },
  { slug: 'youtube-shorts-cover-guide', title: 'YouTube Shorts 封面製作指南', cta: '/tools/image-resize' },
  { slug: 'pinterest-pin-size-guide', title: 'Pinterest Pin 尺寸與素材流程', cta: '/tools/image-resize' },
  { slug: 'line-qa-quick-share-with-qr', title: 'LINE 社群搭配 QR Code 快速分享', cta: '/tools/qr-code' },
  { slug: 'website-image-speed-optimization', title: '網站圖片加速與壓縮策略', cta: '/tools/image-compress' },
  { slug: 'ecommerce-image-prep-guide', title: '電商商品圖前置整理流程', cta: '/tools/image-resize' },
  { slug: 'homework-solution-step-by-step', title: '作業解題步驟化提問模板', cta: '/tools/homework-helper' },
  { slug: 'meeting-notes-to-action-summary', title: '會議筆記到行動摘要流程', cta: '/summary' },
  { slug: 'content-repurpose-with-ai-summary', title: '用 AI 摘要做內容再利用', cta: '/summary' },
] as const;

const ctaNameMap: Record<string, string> = {
  '/tools/image-resize': '圖片尺寸轉換',
  '/tools/line-sticker': 'LINE貼圖整理',
  '/tools/qr-code': 'QR Code 產生器',
  '/tools/image-compress': '圖片壓縮',
  '/summary': 'AI摘要工具',
  '/tools/homework-helper': '作業解題助手',
};

function guideArticleFromSeed(item: (typeof guideSeedData)[number]): GuideArticle {
  const intro = `這篇教學會用最短路徑帶你掌握「${item.title}」的實作方式，降低試錯時間。`;
  return {
    slug: item.slug,
    path: `/guide/${item.slug}`,
    title: item.title,
    intro,
    paragraphs: [
      '先明確目標平台與輸出格式，能大幅降低重工與反覆修改。',
      '把工具流程拆成固定步驟後，團隊協作與交付品質會更穩定。',
      '建議每次完成後做一次實機或跨平台檢查，確保最終呈現一致。',
    ],
    steps: [
      '確認輸出目標與素材來源',
      '依需求套用工具設定並產出結果',
      '完成檢查後儲存可重用的操作模板',
    ],
    faq: [
      { q: '這篇教學適合新手嗎？', a: '適合，內容以可直接操作的步驟為主。' },
      { q: '需要安裝額外軟體嗎？', a: '多數情境可直接用線上工具完成，不需安裝。' },
      { q: '如何避免重複修改？', a: '先確定目標規格，再一次完成尺寸、格式與文案檢查。' },
    ],
    seoTitle: `${item.title}｜RxV 教學`,
    metaDescription: `關於「${item.title}」：實作方向、重點提醒與常見問題，並可搭配 RxV 線上工具完成。`,
    cta: {
      name: ctaNameMap[item.cta] || '查看工具',
      path: item.cta,
      desc: '前往工具立即實作',
    },
  };
}

function guideArticleFromExtended(
  item: (typeof guideArticlesExtended)[number]
): GuideArticle {
  return {
    slug: item.slug,
    path: `/guide/${item.slug}`,
    title: item.title,
    intro: item.intro,
    paragraphs: item.paragraphs,
    steps: item.steps,
    faq: item.faq,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    internalLinkKey: item.internalLinkKey,
    cta: {
      name: ctaNameMap[item.cta] || '查看工具',
      path: item.cta,
      desc: '前往工具立即實作',
    },
  };
}

export const guideArticles: GuideArticle[] = [
  ...guideSeedData.map(guideArticleFromSeed),
  ...guideArticlesExtended.map(guideArticleFromExtended),
];

export const toolCategoryRoutePaths = toolCategoryPages.map((item) => item.path);
export const toolLandingRoutePaths = toolLandingPages.map((item) => item.path);
export const guideRoutePaths = ['/guide', ...guideArticles.map((item) => item.path)];
