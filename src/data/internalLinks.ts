import type { ToolCategoryKey } from './toolSeoContent';
import { guideArticles, toolLandingPages, type ToolLinkItem, type ToolLandingToolKey } from './toolSeoContent';
import { getLandingPreviewByPath } from './seoPages';

/** 內鏈主鍵（工具站 + 延伸頁） */
export type InternalLinkKey =
  | 'ai-summary'
  | 'image-resize'
  | 'image-compress'
  | 'image-convert'
  | 'image-crop'
  | 'qr-code'
  | 'pomodoro'
  | 'todo'
  | 'homework-helper'
  | 'scam-check'
  | 'policy-explain'
  | 'line-sticker'
  | 'shopee-video'
  | 'productivity';

export type RelatedToolItem = {
  title: string;
  description?: string;
  href: string;
  category?: string;
};

export type RelatedGuideItem = {
  title: string;
  description?: string;
  href: string;
  tag?: string;
};

export type PopularPageItem = {
  title: string;
  description?: string;
  href: string;
  badge?: string;
};

const R = {
  imageResize: (d?: string): RelatedToolItem => ({
    title: '圖片尺寸轉換',
    href: '/tools/image-resize',
    description: d ?? '依平台調整寬高與比例，減少裁切錯誤。',
    category: '影像',
  }),
  imageCompress: (d?: string): RelatedToolItem => ({
    title: '圖片壓縮',
    href: '/tools/image-compress',
    description: d ?? '縮小 JPG／PNG／WebP 檔案，加速上傳與載入。',
    category: '影像',
  }),
  imageConvert: (d?: string): RelatedToolItem => ({
    title: '圖片格式轉換',
    href: '/tools/image-convert',
    description: d ?? 'PNG、JPG、WebP 在瀏覽器互轉，免安裝。',
    category: '影像',
  }),
  imageCrop: (d?: string): RelatedToolItem => ({
    title: '線上圖片裁切',
    href: '/tools/image-crop',
    description: d ?? '比例裁切、預覽與下載，瀏覽器端處理。',
    category: '影像',
  }),
  qr: (d?: string): RelatedToolItem => ({
    title: 'QR Code 產生器',
    href: '/tools/qr-code',
    description: d ?? '網址與文字轉成可掃描圖檔。',
    category: '導流',
  }),
  aiSummary: (d?: string): RelatedToolItem => ({
    title: 'AI 摘要工具',
    href: '/summary',
    description: d ?? '長文與筆記濃縮成重點。',
    category: 'AI',
  }),
  homework: (d?: string): RelatedToolItem => ({
    title: '作業解題助手',
    href: '/tools/homework-helper',
    description: d ?? '題目步驟化說明與觀念整理。',
    category: '學習',
  }),
  lineSticker: (d?: string): RelatedToolItem => ({
    title: 'LINE 貼圖整理',
    href: '/tools/line-sticker',
    description: d ?? '貼圖尺寸與打包上架前整理。',
    category: '影像',
  }),
  scam: (d?: string): RelatedToolItem => ({
    title: '詐騙風險判斷',
    href: '/tools/scam-check',
    description: d ?? '貼上可疑文字，取得風險提示。',
    category: '安全',
  }),
  pomodoro: (d?: string): RelatedToolItem => ({
    title: '番茄鐘 Pomodoro',
    href: '/pomodoro',
    description: d ?? '時間區塊專注與休息節奏。',
    category: '效率',
  }),
  todo: (d?: string): RelatedToolItem => ({
    title: '待辦清單 Todo',
    href: '/todo',
    description: d ?? '任務拆解與優先順序。',
    category: '效率',
  }),
  policy: (d?: string): RelatedToolItem => ({
    title: '政策白話解釋',
    href: '/policy-explained',
    description: d ?? '用較易懂方式整理制度重點。',
    category: '生活',
  }),
  aids: (d?: string): RelatedToolItem => ({
    title: '補助懶人包',
    href: '/aids',
    description: d ?? '依情境快速瀏覽常見補助與申請入口。',
    category: '生活',
  }),
  toolsHub: (): RelatedToolItem => ({
    title: '工具中心總覽',
    href: '/tools',
    description: '瀏覽所有分類與工具入口。',
    category: '導覽',
  }),
  shopeeVideo: (d?: string): RelatedToolItem => ({
    title: '蝦皮短影音批次工具',
    href: '/tools/shopee-video',
    description: d ?? '批次腳本與素材流程。',
    category: '電商',
  }),
};

function excludeSelf(items: RelatedToolItem[], href: string): RelatedToolItem[] {
  return items.filter((i) => i.href !== href).slice(0, 8);
}

/** 各工具頁／主題頁的相關工具（完整列表，再由 excludeSelf 過濾） */
export const relatedToolsMap: Record<InternalLinkKey, RelatedToolItem[]> = {
  'image-resize': [
    R.imageConvert('裁切後若平台指定不同格式，可先轉檔再上稿。'),
    R.imageCompress('完成裁切後若檔案偏大，可再接壓縮維持載入速度。'),
    R.qr('海報、展架與菜單常需同步產生可掃描導流。'),
    R.aiSummary('貼文與商品句可先摘要再微調語氣。'),
    R.lineSticker('貼圖主圖與標籤需分開像素檢查。'),
    R.homework('報告插圖與圖表尺寸可一併對齊。'),
    R.shopeeVideo('電商主圖與直式影片封面常需統一比例。'),
    R.pomodoro('批次裁切與匯出適合分段專注處理。'),
    R.toolsHub(),
  ],
  'image-compress': [
    R.imageConvert('若平台只收特定格式，可先轉檔再壓縮。'),
    R.imageResize('壓縮前先裁到實際顯示尺寸，檔案下降更明顯。'),
    R.qr('壓縮後的 PNG／JPG 可再置入文宣與 QR 海報。'),
    R.aiSummary('長篇操作說明可先摘成重點再配圖。'),
    R.lineSticker('上架前打包多張貼圖時，檔案體積影響上傳速度。'),
    R.homework('作業附圖與截圖常遇大小限制，可先壓再交。'),
    R.scam('收到來路不明圖檔連結，可先辨識風險再下載。'),
    R.aids('申請補助附檔常有 KB／MB 上限，可先壓縮再送。'),
    R.toolsHub(),
  ],
  'image-convert': [
    R.imageResize('轉檔後若要符合平台長寬，可再接尺寸轉換。'),
    R.imageCompress('轉成 JPG／WebP 後若檔案仍大，可再壓縮。'),
    R.qr('文宣與包裝上常需同時有圖檔與可掃描 QR。'),
    R.aiSummary('商品與活動說明可先摘要再配圖。'),
    R.lineSticker('貼圖輸出格式依上架規範，可先轉檔再檢查。'),
    R.homework('報告附圖若指定格式，可先線上轉檔。'),
    R.shopeeVideo('電商素材常需 WebP／JPG 不同版本。'),
    R.toolsHub(),
  ],
  'image-crop': [
    R.imageResize('裁切後若要改成指定像素，可再接尺寸轉換。'),
    R.imageCompress('輸出 JPG／PNG 後若檔案偏大，可再壓縮。'),
    R.imageConvert('需透明或特定格式時，可轉 PNG／WebP。'),
    R.qr('海報與社群素材常與 QR 並列。'),
    R.lineSticker('貼圖主圖需符合上架比例與安全區。'),
    R.aiSummary('貼文文案可先摘要再配裁切後的圖。'),
    R.toolsHub(),
  ],
  'qr-code': [
    R.imageResize('印刷用 QR 需預留足夠白邊與解析度，可先調整輸出尺寸。'),
    R.imageCompress('下載的 QR 圖檔若用於網頁，可適度壓縮加速載入。'),
    R.imageConvert('海報上併排圖檔與 QR 時，可先統一圖檔格式。'),
    R.aiSummary('活動說明與條款可先摘要再印在文宣旁。'),
    R.homework('校園活動報名連結製成 QR 方便掃描填寫。'),
    R.lineSticker('貼圖與社群素材常與 QR 並列於同一張圖。'),
    R.scam('陌生 QR 先判斷風險再掃描，避免釣魚連結。'),
    R.policy('公開資訊與政策連結製碼前，建議先讀白話整理。'),
    R.toolsHub(),
  ],
  'ai-summary': [
    R.homework('摘要講義後可用解題助手檢查觀念是否銜接。'),
    R.pomodoro('長文分段摘要搭配番茄鐘，避免一次讀完倦怠。'),
    R.todo('把摘要行動項寫進待辦，避免讀完就忘。'),
    R.imageCompress('報告附檔與截圖可先壓縮再夾帶在郵件。'),
    R.qr('分享摘要筆記連結可製成 QR 給實體讀者。'),
    R.scam('網路長文與公告可先摘要看有無可疑要求匯款。'),
    R.lineSticker(),
    R.toolsHub(),
  ],
  'homework-helper': [
    R.aiSummary('先摘要課本文章再解題，脈絡較完整。'),
    R.pomodoro('寫作業與驗算可用番茄鐘分段，降低拖延。'),
    R.todo('依截止日把題目拆成待辦小步驟。'),
    R.imageResize('報告附圖與海報作業需符合指定像素。'),
    R.imageCompress('線上繳交截圖與照片常有檔案上限。'),
    R.qr('小組報告分工表可放 QR 連到共筆。'),
    R.scam('求職／打工詐騙題型可先對照風險提示。'),
    R.toolsHub(),
  ],
  'scam-check': [
    R.policy('釐清補助與稅務前可先讀政策白話，再比對可疑訊息。'),
    R.aiSummary('將長篇詐騙話術摘要後較易看出矛盾點。'),
    R.qr('陌生 QR 與簡訊連結可搭配風險意識檢查。'),
    R.homework('辨識假投資話術時可對照常見話術模板。'),
    R.imageCompress('回報詐騙截圖給客服前可先壓縮檔案。'),
    R.pomodoro('通報與蒐證流程可分段完成，避免慌亂。'),
    R.todo('凍結帳戶、報警與通報步驟可列成待辦。'),
    R.toolsHub(),
  ],
  'line-sticker': [
    R.imageResize('主圖與標籤圖像素不同，需分別輸出。'),
    R.imageCompress('上架打包前可壓縮預覽圖加速上傳。'),
    R.qr('宣傳貼圖與官方帳號可放 QR 導流。'),
    R.aiSummary('上架文案與商店說明可先摘成短句。'),
    R.homework('學生專題製作貼圖時可對照規格表逐項檢查。'),
    R.shopeeVideo(),
    R.pomodoro(),
    R.toolsHub(),
  ],
  'pomodoro': [
    R.todo('番茄鐘每輪對應待辦清單上的子任務。'),
    R.aiSummary('專注前先用摘要鎖定當日唯一重點。'),
    R.homework('讀書與寫作業排程可與休息節奏綁定。'),
    R.imageCompress('長時間螢幕截圖整理可先壓縮再存檔。'),
    R.qr('專注讀書計畫表可印 QR 連到線上計時頁。'),
    R.imageResize('簡報截圖納入筆記前可統一長邊。'),
    R.scam('專注時避免邊看社群邊點不明廣告連結。'),
    R.toolsHub(),
  ],
  'todo': [
    R.pomodoro('待辦項目與番茄鐘輪次一對一對齊。'),
    R.aiSummary('會議與信件整理成待辦前先摘出行動項。'),
    R.homework('考試與作業截止可設優先權與提醒。'),
    R.imageResize('設計與簡報類任務在待辦備註目標尺寸。'),
    R.imageCompress('需上傳附件的任務先檢查檔案大小。'),
    R.qr('團隊協作可在待辦描述附 QR 連到規格文件。'),
    R.aids(),
    R.toolsHub(),
  ],
  'policy-explain': [
    R.scam('補助與退稅詐騙常假冒官方，可先查關鍵字風險。'),
    R.aiSummary('法條與公告可先摘出與自身情境相關段落。'),
    R.homework('學校規定與申請流程可對照白話整理再問承辦。'),
    R.qr('政府與學校官網連結製碼前請確認網域正確。'),
    R.imageCompress('線上申請附檔可先壓縮以符合上傳限制。'),
    R.pomodoro('研讀政策文件適合分段專注閱讀。'),
    R.todo('補件與截止日可列待辦避免逾期。'),
    R.toolsHub(),
  ],
  'shopee-video': [
    R.aiSummary('腳本與競品文案可先摘要再改寫。'),
    R.imageResize('商品圖與直式封面需符合平台建議比例。'),
    R.imageCompress('大量商品圖批次壓縮再上傳。'),
    R.qr('賣場與線下立牌可放 QR 導到短影音。'),
    R.homework('學生專題製作電商行銷影片可搭配解題式腳本架構。'),
    R.pomodoro('剪輯與上架分段進行，避免一次熬夜。'),
    R.todo('拍攝、剪輯、上片拆成可勾選項目。'),
    R.toolsHub(),
  ],
  productivity: [
    R.todo('專注節奏與待辦清單是一組工作流。'),
    R.aiSummary('先摘錄本日重點再開計時，較不易分心。'),
    R.homework('讀書計畫可拆成多個專注區塊。'),
    R.imageCompress(),
    R.qr(),
    R.imageResize(),
    R.scam(),
    R.toolsHub(),
  ],
};

/** 各主題對應教學中心 slug（/guide/:slug） */
export const relatedGuidesMap: Record<InternalLinkKey, readonly string[]> = {
  'image-resize': [
    'instagram-post-size',
    'instagram-reels-size',
    'youtube-shorts-size',
    'youtube-thumbnail-size',
    'ig-image-size',
    'facebook-post-image-size',
    'youtube-shorts-cover-guide',
    'tiktok-cover-size-guide',
  ],
  'image-compress': [
    'compress-image-large-files',
    'jpg-vs-png-difference',
    'how-to-compress-images',
    'website-image-speed-optimization',
    'ecommerce-image-prep-guide',
    'tiktok-cover-size-guide',
    'line-sticker-size',
    'linkedin-post-image-guide',
  ],
  'image-convert': [
    'jpg-vs-png-difference',
    'how-to-compress-images',
    'compress-image-large-files',
    'website-image-speed-optimization',
    'ecommerce-image-prep-guide',
    'instagram-post-size',
    'ig-image-size',
    'line-sticker-size',
  ],
  'image-crop': [
    'instagram-post-size',
    'youtube-thumbnail-size',
    'tiktok-cover-size-guide',
    'ig-image-size',
    'facebook-post-image-size',
    'how-to-compress-images',
    'jpg-vs-png-difference',
    'ecommerce-image-prep-guide',
  ],
  'qr-code': [
    'qr-code-with-logo',
    'wifi-qr-code-how-to',
    'qr-code-business-usage',
    'line-qa-quick-share-with-qr',
    'line-sticker-size',
    'ig-image-size',
    'linkedin-post-image-guide',
    'x-twitter-image-guide',
  ],
  'ai-summary': [
    'pdf-summary-how-to',
    'summarize-long-article',
    'ai-summary-best-practices',
    'pdf-summary-method',
    'meeting-notes-to-action-summary',
    'content-repurpose-with-ai-summary',
    'homework-solution-step-by-step',
    'student-homework-ai-tools',
  ],
  'homework-helper': [
    'ai-homework-safety-guide',
    'student-homework-ai-tools',
    'homework-solution-step-by-step',
    'ai-summary-best-practices',
    'summarize-long-article',
    'pdf-summary-how-to',
    'meeting-notes-to-action-summary',
    'content-repurpose-with-ai-summary',
  ],
  'scam-check': [
    'ai-summary-best-practices',
    'qr-code-business-usage',
    'wifi-qr-code-how-to',
    'qr-code-with-logo',
    'student-homework-ai-tools',
    'how-to-compress-images',
    'homework-solution-step-by-step',
    'ai-homework-safety-guide',
  ],
  'line-sticker': [
    'line-sticker-size',
    'how-to-compress-images',
    'ig-image-size',
    'qr-code-business-usage',
    'line-qa-quick-share-with-qr',
    'ecommerce-image-prep-guide',
    'how-to-compress-images',
    'instagram-post-size',
  ],
  'pomodoro': [
    'meeting-notes-to-action-summary',
    'homework-solution-step-by-step',
    'ai-summary-best-practices',
    'student-homework-ai-tools',
    'summarize-long-article',
    'pdf-summary-how-to',
    'content-repurpose-with-ai-summary',
    'tiktok-cover-size-guide',
  ],
  'todo': [
    'meeting-notes-to-action-summary',
    'homework-solution-step-by-step',
    'ai-summary-best-practices',
    'student-homework-ai-tools',
    'summarize-long-article',
    'pdf-summary-how-to',
    'content-repurpose-with-ai-summary',
    'how-to-compress-images',
  ],
  'policy-explain': [
    'pdf-summary-method',
    'ai-summary-best-practices',
    'meeting-notes-to-action-summary',
    'summarize-long-article',
    'pdf-summary-how-to',
    'content-repurpose-with-ai-summary',
    'student-homework-ai-tools',
    'homework-solution-step-by-step',
  ],
  'shopee-video': [
    'ecommerce-image-prep-guide',
    'ai-summary-best-practices',
    'qr-code-business-usage',
    'tiktok-cover-size-guide',
    'ig-image-size',
    'facebook-post-image-size',
    'youtube-thumbnail-size',
    'compress-image-large-files',
  ],
  productivity: [
    'meeting-notes-to-action-summary',
    'homework-solution-step-by-step',
    'ai-summary-best-practices',
    'student-homework-ai-tools',
    'summarize-long-article',
    'content-repurpose-with-ai-summary',
    'pdf-summary-how-to',
    'how-to-compress-images',
  ],
};

const P_IMAGE_RESIZE = [
  '/tools/image-resize/instagram-post-size',
  '/tools/image-resize/instagram-reels-size',
  '/tools/image-resize/youtube-thumbnail-size',
  '/tools/image-resize/youtube-shorts-size',
  '/tools/image-resize/facebook-post-size',
  '/tools/image-compress/compress-image-online',
  '/tools/qr-code/wifi-qr-code',
  '/tools/ai-summary/ai-text-summarizer',
] as const;

const P_IMAGE_COMPRESS = [
  '/tools/image-compress/compress-image-online',
  '/tools/image-compress/compress-jpg-online',
  '/tools/image-compress/compress-png-online',
  '/tools/image-compress/reduce-image-file-size',
  '/tools/image-compress/compress-image-under-1mb',
  '/tools/image-resize/instagram-post-size',
  '/tools/image-resize/youtube-thumbnail-size',
  '/tools/qr-code/free-qr-code-generator',
] as const;

const P_IMAGE_CONVERT = [
  '/tools/image-convert/convert-png-to-jpg',
  '/tools/image-convert/convert-jpg-to-png',
  '/tools/image-convert/convert-png-to-webp',
  '/tools/image-convert/convert-webp-to-png',
  '/tools/image-convert/convert-jpg-to-webp',
  '/tools/image-convert/convert-webp-to-jpg',
  '/tools/image-convert/png-to-jpg-online',
  '/tools/image-convert/image-format-converter',
] as const;

const P_IMAGE_CROP = [
  '/tools/image-crop/crop-image-online',
  '/tools/image-crop/crop-photo-online',
  '/tools/image-resize/instagram-post-size',
  '/tools/image-resize/youtube-thumbnail-size',
  '/tools/image-compress/compress-image-online',
  '/tools/image-convert/convert-png-to-jpg',
  '/tools/qr-code/free-qr-code-generator',
] as const;

const P_QR = [
  '/tools/qr-code/free-qr-code-generator',
  '/tools/qr-code/wifi-qr-code',
  '/tools/qr-code/business-card-qr-code',
  '/tools/qr-code/google-review-qr-code',
  '/tools/image-resize/instagram-post-size',
  '/tools/image-compress/compress-image-online',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/homework-helper/ai-homework-solver',
] as const;

const P_AI_SUMMARY = [
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/ai-summary/article-summarizer',
  '/tools/ai-summary/pdf-summarizer',
  '/tools/ai-summary/youtube-video-summarizer',
  '/tools/homework-helper/ai-homework-solver',
  '/tools/productivity/pomodoro-timer-online',
  '/tools/image-compress/compress-image-online',
  '/tools/qr-code/free-qr-code-generator',
] as const;

const P_HOMEWORK = [
  '/tools/homework-helper/ai-homework-solver',
  '/tools/homework-helper/math-homework-solver',
  '/tools/ai-summary/pdf-summarizer',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/productivity/pomodoro-timer-online',
  '/tools/productivity/focus-timer-online',
  '/tools/image-resize/instagram-post-size',
  '/tools/image-compress/compress-image-online',
] as const;

const P_POMODORO_TODO = [
  '/tools/productivity/pomodoro-timer-online',
  '/tools/productivity/focus-timer-online',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/homework-helper/ai-homework-solver',
  '/tools/image-compress/compress-image-online',
  '/tools/qr-code/free-qr-code-generator',
  '/tools/image-resize/youtube-thumbnail-size',
  '/tools/ai-summary/article-summarizer',
] as const;

const P_SCAM = [
  '/tools/qr-code/wifi-qr-code',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/homework-helper/ai-homework-solver',
  '/tools/image-compress/compress-image-online',
  '/tools/qr-code/free-qr-code-generator',
  '/tools/productivity/pomodoro-timer-online',
  '/tools/image-resize/instagram-post-size',
  '/tools/ai-summary/pdf-summarizer',
] as const;

const P_POLICY = [
  '/tools/ai-summary/pdf-summarizer',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/ai-summary/article-summarizer',
  '/tools/productivity/pomodoro-timer-online',
  '/tools/homework-helper/ai-homework-solver',
  '/tools/image-compress/compress-image-online',
  '/tools/qr-code/business-card-qr-code',
  '/tools/image-resize/facebook-post-size',
] as const;

const P_LINE = [
  '/tools/image-resize/instagram-post-size',
  '/tools/image-compress/compress-png-online',
  '/tools/qr-code/free-qr-code-generator',
  '/tools/image-resize/youtube-thumbnail-size',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/homework-helper/ai-homework-solver',
  '/tools/productivity/pomodoro-timer-online',
  '/tools/image-compress/compress-image-online',
] as const;

const P_SHOPEE = [
  '/tools/image-resize/instagram-post-size',
  '/tools/image-compress/compress-image-online',
  '/tools/qr-code/free-qr-code-generator',
  '/tools/ai-summary/ai-text-summarizer',
  '/tools/homework-helper/ai-homework-solver',
  '/tools/productivity/pomodoro-timer-online',
  '/tools/image-resize/youtube-shorts-size',
  '/tools/qr-code/wifi-qr-code',
] as const;

const POPULAR_PATHS = P_IMAGE_RESIZE;

/** 熱門 SEO 落地頁路徑（依主題分眾） */
export const popularPagesMap: Record<InternalLinkKey, readonly string[]> = {
  'image-resize': P_IMAGE_RESIZE,
  'image-compress': P_IMAGE_COMPRESS,
  'image-convert': P_IMAGE_CONVERT,
  'image-crop': P_IMAGE_CROP,
  'qr-code': P_QR,
  'ai-summary': P_AI_SUMMARY,
  'homework-helper': P_HOMEWORK,
  'pomodoro': P_POMODORO_TODO,
  'todo': P_POMODORO_TODO,
  'scam-check': P_SCAM,
  'policy-explain': P_POLICY,
  'line-sticker': P_LINE,
  'shopee-video': P_SHOPEE,
  productivity: P_POMODORO_TODO,
};

/** Guide 教學頁 cta.path → 內鏈主鍵（無 internalLinkKey 時後援） */
export function inferInternalLinkKeyFromGuideCta(ctaPath: string): InternalLinkKey | undefined {
  const m: Record<string, InternalLinkKey> = {
    '/tools/image-resize': 'image-resize',
    '/tools/image-compress': 'image-compress',
    '/tools/image-convert': 'image-convert',
    '/tools/qr-code': 'qr-code',
    '/summary': 'ai-summary',
    '/tools/homework-helper': 'homework-helper',
    '/tools/line-sticker': 'line-sticker',
    '/tools/shopee-video': 'shopee-video',
    '/pomodoro': 'pomodoro',
    '/todo': 'todo',
  };
  return m[ctaPath];
}

const CATEGORY_LINK_KEYS: Record<ToolCategoryKey, InternalLinkKey[]> = {
  ai: ['ai-summary', 'homework-helper'],
  image: ['image-resize', 'image-compress', 'image-convert', 'image-crop', 'qr-code', 'line-sticker'],
  productivity: ['pomodoro', 'todo', 'productivity'],
  life: ['scam-check', 'policy-explain'],
};

export function getCategoryInternalLinkKeys(categoryKey: ToolCategoryKey): InternalLinkKey[] {
  return CATEGORY_LINK_KEYS[categoryKey];
}

function mergeByHref<T extends { href: string }>(rows: T[], limit: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.href)) continue;
    seen.add(row.href);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

/** 分類頁：合併多個主鍵的熱門落地頁（去重） */
export function getCategoryPopularMerged(keys: InternalLinkKey[], limit = 8): PopularPageItem[] {
  const merged: PopularPageItem[] = [];
  for (const k of keys) {
    merged.push(...getPopularPageItems(k));
  }
  return mergeByHref(merged, limit);
}

/** 分類頁：合併推薦教學 */
export function getCategoryRelatedGuidesMerged(keys: InternalLinkKey[], limit = 8): RelatedGuideItem[] {
  const merged: RelatedGuideItem[] = [];
  for (const k of keys) {
    merged.push(...getRelatedGuideItems(k));
  }
  return mergeByHref(merged, limit);
}

/** 分類頁：搭配工具推薦（去重） */
export function getCategoryRelatedToolsMerged(keys: InternalLinkKey[], limit = 8): RelatedToolItem[] {
  const merged: RelatedToolItem[] = [];
  for (const k of keys) {
    merged.push(...getRelatedToolsItems(k));
  }
  return mergeByHref(merged, limit);
}

/** 首頁：單一主題熱門落地頁（內鏈模組） */
export function getHomePopularBySegment(
  segment: 'image-resize' | 'image-compress' | 'qr-code' | 'ai-summary',
  limit = 6
): PopularPageItem[] {
  return getPopularPageItems(segment).slice(0, limit);
}

export function getRelatedToolsItems(key: InternalLinkKey): RelatedToolItem[] {
  const selfHref: Partial<Record<InternalLinkKey, string>> = {
    'image-resize': '/tools/image-resize',
    'image-compress': '/tools/image-compress',
    'image-convert': '/tools/image-convert',
    'image-crop': '/tools/image-crop',
    'qr-code': '/tools/qr-code',
    'ai-summary': '/summary',
    'homework-helper': '/tools/homework-helper',
    'scam-check': '/tools/scam-check',
    'line-sticker': '/tools/line-sticker',
    'pomodoro': '/pomodoro',
    'todo': '/todo',
    'policy-explain': '/policy-explained',
    'shopee-video': '/tools/shopee-video',
    productivity: '/pomodoro',
  };
  const base = relatedToolsMap[key];
  const href = selfHref[key];
  if (!href) return [...base].slice(0, 8);
  return excludeSelf(base, href);
}

function resolveGuideItems(slugs: readonly string[]): RelatedGuideItem[] {
  return slugs
    .map((slug) => guideArticles.find((g) => g.slug === slug))
    .filter((g): g is (typeof guideArticles)[number] => Boolean(g))
    .map((g) => ({
      title: g.title,
      description: g.intro,
      href: g.path,
      tag: '教學',
    }));
}

export function getRelatedGuideItems(key: InternalLinkKey): RelatedGuideItem[] {
  return resolveGuideItems(relatedGuidesMap[key] ?? []);
}

function resolvePopularItems(paths: readonly string[], excludeHref?: string): PopularPageItem[] {
  return paths
    .map((path) => {
      const legacy = toolLandingPages.find((p) => p.path === path);
      if (legacy) {
        return { path: legacy.path, h1: legacy.h1, metaDescription: legacy.metaDescription };
      }
      const seo = getLandingPreviewByPath(path);
      if (!seo) return undefined;
      return { path: seo.path, h1: seo.h1, metaDescription: seo.metaDescription };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p.path !== excludeHref)
    .map((p) => ({
      title: p.h1,
      description: p.metaDescription,
      href: p.path,
      badge: 'SEO',
    }));
}

export function getPopularPageItems(key: InternalLinkKey, excludeHref?: string): PopularPageItem[] {
  const paths = popularPagesMap[key] ?? POPULAR_PATHS;
  return resolvePopularItems(paths, excludeHref);
}

/** SEO 落地頁專用：與 toolSeoContent 的 toolKey 對齊 */
export function getRelatedToolsForLanding(toolKey: ToolLandingToolKey): RelatedToolItem[] {
  return getRelatedToolsItems(toolKey as InternalLinkKey);
}

export function getGuideItemsForLanding(toolKey: ToolLandingToolKey): RelatedGuideItem[] {
  const slugs =
    relatedGuidesMap[toolKey as InternalLinkKey] ?? relatedGuidesMap['image-resize'];
  return resolveGuideItems(slugs);
}

export function getPopularItemsForLanding(excludePath: string, toolKey: ToolLandingToolKey): PopularPageItem[] {
  return getPopularPageItems(toolKey as InternalLinkKey, excludePath);
}

/** 舊版 ToolLinkItem（供漸進遷移；新元件請用 RelatedToolItem） */
export type LegacyToolPageId =
  | 'image-resize'
  | 'image-compress'
  | 'qr-code'
  | 'ai-summary'
  | 'homework-helper'
  | 'scam-check'
  | 'line-sticker';

export function getRelatedToolLinksForPage(pageId: LegacyToolPageId): ToolLinkItem[] {
  return getRelatedToolsItems(pageId).map((i) => ({
    name: i.title,
    path: i.href,
    desc: i.description ?? '',
  }));
}

export function getGuideSlugsForToolPage(pageId: LegacyToolPageId): string[] {
  return [...(relatedGuidesMap[pageId] ?? [])];
}

export function getGuideSlugsForLanding(toolKey: ToolLandingToolKey): string[] {
  return [...(relatedGuidesMap[toolKey as InternalLinkKey] ?? [])];
}
