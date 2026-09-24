export type LineStickerSeoGuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LineStickerPromptExample = {
  label: string;
  prompt: string;
};

export type LineStickerSeoGuide = {
  slug: string;
  path: string;
  h1: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string;
  sections: LineStickerSeoGuideSection[];
  steps?: string[];
  promptExamples?: LineStickerPromptExample[];
  faq: Array<{ q: string; a: string }>;
  ctas: Array<{ label: string; path: string; primary?: boolean }>;
  sourceNote?: {
    label: string;
    url: string;
  };
};

export const lineStickerSeoGuides: LineStickerSeoGuide[] = [
  {
    slug: 'line-sticker-size',
    path: '/guides/line-sticker-size',
    h1: 'LINE 貼圖尺寸與規格 2026：圖片大小、格式與透明背景',
    seoTitle: 'LINE 貼圖尺寸與規格 2026｜圖片大小、格式一次看懂',
    metaDescription:
      '整理 2026 LINE 靜態貼圖尺寸與規格：主圖 240×240、貼圖最大 370×320、聊天室標籤 96×74、PNG、透明背景與常見錯誤，並可直接使用 RxV 分割工具。',
    keywords: 'LINE貼圖尺寸,LINE貼圖規格,LINE貼圖圖片大小,LINE貼圖格式',
    intro:
      '準備 LINE 靜態貼圖時，先把尺寸、PNG 格式、透明背景與張數規則整理好，可以減少上傳後才發現尺寸不符而重做的情況。',
    sections: [
      {
        heading: 'LINE 靜態貼圖基本尺寸',
        paragraphs: [
          '一般靜態貼圖需要準備主要圖片、貼圖圖片與聊天室標籤圖片。貼圖圖片可以選擇 8、16、24、32 或 40 張。',
        ],
        bullets: [
          '主要圖片：240 × 240 px，1 張。',
          '貼圖圖片：最大 370 × 320 px，每張 1 MB 以下。',
          '聊天室標籤圖片：96 × 74 px，1 張。',
        ],
      },
      {
        heading: '圖片格式、透明背景與色彩模式',
        paragraphs: [
          '靜態貼圖圖檔使用 PNG。貼圖圖片需完成去背透明處理，並建議使用 RGB 色彩模式與 72 dpi 以上解析度。',
          '貼圖圖片會由平台自動縮小，因此寬與高建議維持偶數像素，避免在縮放時出現不必要的尺寸問題。',
        ],
      },
      {
        heading: '常見尺寸錯誤',
        paragraphs: [
          '最常見的問題不是「圖片不夠大」，而是畫布尺寸、透明背景、檔案格式或留白處理不一致。先固定製作流程，比最後才逐張修改更省時間。',
        ],
        bullets: [
          '把 370 × 320 誤當成每張一定要完全填滿的固定尺寸；它是貼圖圖片的上限。',
          '輸出成 JPG，導致透明背景消失。',
          '寬或高使用奇數像素，增加平台自動縮圖後的尺寸誤差。',
          '文字或角色太靠近邊緣，縮小後容易顯得擁擠。',
          '多張貼圖放在一張大圖後，沒有先正確切割成獨立 PNG。',
        ],
      },
      {
        heading: '如何使用 RxV LINE 貼圖圖片分割工具',
        paragraphs: [
          '如果 AI 生圖先產出 4×4、5×4 等貼圖總圖，可以先使用 RxV 分割工具切成獨立圖片，再逐張檢查透明背景與尺寸。',
        ],
        bullets: [
          '上傳貼圖總圖。',
          '選擇適合的分割方式並微調切割線。',
          '預覽每一格是否完整。',
          '輸出獨立圖片後，再進行透明背景與最終尺寸檢查。',
        ],
      },
    ],
    faq: [
      {
        q: 'LINE 貼圖一定要 370 × 320 px 嗎？',
        a: '不是。一般靜態貼圖的 370 × 320 px 是最大尺寸；實際圖片可在上限內製作，但寬與高建議使用偶數像素。',
      },
      {
        q: 'LINE 貼圖可以用 JPG 嗎？',
        a: '一般靜態貼圖提交使用 PNG，且貼圖圖片需要透明背景。',
      },
      {
        q: 'LINE 貼圖可以做幾張？',
        a: '一般靜態貼圖可選 8、16、24、32 或 40 張，送審前可在管理頁調整張數。',
      },
      {
        q: 'AI 產生一張貼圖總圖後可以直接上傳嗎？',
        a: '不建議。先把總圖切成獨立貼圖、檢查透明背景、尺寸與文字安全範圍，再進行上架準備。',
      },
    ],
    ctas: [
      { label: '免費使用 LINE 貼圖圖片分割工具', path: '/tools/sticker-splitter', primary: true },
      { label: '前往 LINE 貼圖工具', path: '/tools/line-sticker' },
    ],
    sourceNote: {
      label: 'LINE Creators Market 靜態貼圖製作準則',
      url: 'https://creator.line.me/zh-hant/guideline/sticker/',
    },
  },
  {
    slug: 'line-sticker-prompt-examples',
    path: '/guides/line-sticker-prompt-examples',
    h1: 'LINE 貼圖提示詞範例：AI 貼圖 Prompt 免費複製',
    seoTitle: 'LINE 貼圖提示詞範例｜AI 貼圖 Prompt 免費複製',
    metaDescription:
      '整理可愛人物、貓咪、狗狗、上班族、情侶、長輩與日常問候 LINE 貼圖提示詞，可直接複製，也可使用 RxV LINE 貼圖提示詞產生器快速改成自己的角色。',
    keywords: 'LINE貼圖提示詞,LINE 貼圖提示 詞,AI貼圖Prompt,貼圖提示詞',
    intro:
      '好的貼圖提示詞要同時交代角色、表情、動作、文字、構圖與背景。先建立一致角色設定，再替每張貼圖替換情緒與日常用語，會比每張重新描述更穩定。',
    sections: [
      {
        heading: 'LINE 貼圖提示詞怎麼寫',
        paragraphs: [
          '建議把提示詞拆成「角色設定 → 畫風 → 表情與動作 → 貼圖文字 → 構圖 → 透明背景」六個部分。角色設定固定，只有情境與文字變化，整組貼圖會更一致。',
        ],
        bullets: [
          '角色：年齡感、髮型、服裝、動物品種或外觀特徵。',
          '畫風：Q 版、可愛插畫、粗線條、柔和色塊等。',
          '表情與動作：開心、驚訝、道歉、加油、晚安。',
          '文字：短、清楚、手機縮圖後仍容易閱讀。',
          '構圖：角色置中、留安全邊界、避免細節過多。',
          '背景：純透明背景，方便後續去背與切圖。',
        ],
      },
      {
        heading: '讓整組貼圖更一致的做法',
        paragraphs: [
          '先完成一份「角色母提示詞」，後續只替換動作、表情和文字。若使用同一個 AI 生圖工具，也盡量維持相同的畫風描述、服裝、配色與鏡頭距離。',
        ],
      },
    ],
    promptExamples: [
      {
        label: '可愛人物',
        prompt:
          'Q版可愛人物貼圖，一致角色設定，圓潤大頭比例，乾淨粗線條，柔和明亮配色，角色置中，表情誇張但自然。製作日常 LINE 貼圖情境：開心揮手，文字「嗨～」，文字清楚醒目，四周保留安全邊界，純透明背景，無多餘物件。',
      },
      {
        label: '貓咪',
        prompt:
          '可愛橘白貓 Q版貼圖，圓臉、大眼睛、短手短腳、柔軟毛感但細節簡潔。情境：雙手合十拜託，文字「拜託啦」，表情討喜，貼圖構圖置中，粗線條，文字與角色不重疊，純透明背景。',
      },
      {
        label: '狗狗',
        prompt:
          '可愛柴犬 Q版 LINE 貼圖，固定同一隻角色與配色，圓潤比例，表情清楚。情境：開心跳起來，文字「太好了！」，高辨識度粗線條，簡潔構圖，四周留白，純透明背景。',
      },
      {
        label: '上班族',
        prompt:
          'Q版上班族角色貼圖，固定襯衫與識別色，簡潔商務可愛風。情境：趴在桌上很累，文字「我需要咖啡」，誇張疲憊表情，手機縮圖仍清楚，角色置中，純透明背景。',
      },
      {
        label: '情侶',
        prompt:
          'Q版情侶雙人貼圖，兩位角色外觀固定且容易區分，溫暖可愛插畫風。情境：兩人比愛心，文字「想你了」，表情甜蜜自然，文字清晰，構圖簡潔，純透明背景。',
      },
      {
        label: '長輩',
        prompt:
          '親切可愛的 Q版長輩角色貼圖，溫暖笑容，簡單服裝，字體大且清楚。情境：雙手比讚，文字「平安順心」，高對比文字，畫面乾淨，角色置中，純透明背景。',
      },
      {
        label: '日常問候',
        prompt:
          '可愛 Q版原創角色 LINE 貼圖系列，角色設定與畫風一致。製作日常問候情境：早安、午安、晚安、謝謝、收到、辛苦了、加油、沒問題。每張只保留一個主要動作與一句短文字，粗線條、清楚表情、純透明背景。',
      },
    ],
    faq: [
      {
        q: 'LINE 貼圖提示詞越長越好嗎？',
        a: '不一定。重點是角色設定、畫風、動作、文字與背景要求清楚且不互相衝突。過度堆疊形容詞反而可能讓生成結果不穩定。',
      },
      {
        q: '怎麼讓 16 張或 40 張貼圖角色長得一樣？',
        a: '固定角色母提示詞、服裝、配色、畫風與鏡頭距離，只變更表情、動作和文字；若工具支援角色參考圖，也可搭配使用。',
      },
      {
        q: '提示詞要不要寫透明背景？',
        a: '建議寫入，並在產圖後再次確認去背品質。即使模型回覆透明背景，也應檢查是否仍有白底或半透明殘影。',
      },
      {
        q: '產生大圖後下一步做什麼？',
        a: '可使用 RxV LINE 貼圖圖片分割工具，把 4×4、5×4 等總圖切成獨立圖片，再進行尺寸與透明背景檢查。',
      },
    ],
    ctas: [
      { label: '免費使用 LINE 貼圖提示詞產生器', path: '/tools/sticker-prompt', primary: true },
      { label: '使用 LINE 貼圖圖片分割工具', path: '/tools/sticker-splitter' },
      { label: '前往 LINE 貼圖工具', path: '/tools/line-sticker' },
    ],
  },
  {
    slug: 'how-to-make-line-stickers',
    path: '/guides/how-to-make-line-stickers',
    h1: 'LINE 貼圖怎麼做？AI 製作 LINE 貼圖完整教學',
    seoTitle: 'LINE 貼圖怎麼做？AI 製作 LINE 貼圖完整教學',
    metaDescription:
      '從提示詞、AI 產圖、圖片分割、透明背景、尺寸檢查到上架準備，整理自己做 LINE 貼圖的完整流程，並串接 RxV 提示詞與分割工具。',
    keywords: 'LINE貼圖製作,自己做LINE貼圖,AI LINE貼圖,LINE貼圖怎麼做',
    intro:
      '如果你想自己做 LINE 貼圖，可以把流程拆成六步：先決定角色與常用文字，再用提示詞產圖、切割、去背、檢查尺寸，最後才進入上架準備。',
    steps: [
      '提示詞：先固定角色設定、畫風、配色與貼圖文字。',
      'AI 產圖：一次產出單張，或先做 4×4、5×4 等貼圖總圖。',
      '圖片分割：總圖切成每張獨立圖片，逐張檢查角色與文字。',
      '透明背景：移除白底與殘影，確認角色邊緣乾淨。',
      '尺寸檢查：確認 PNG、偶數像素、檔案大小與貼圖最大尺寸。',
      '上架準備：整理張數、主圖、聊天室標籤圖片與貼圖說明後再送審。',
    ],
    sections: [
      {
        heading: '第一步：先規劃角色與貼圖文字',
        paragraphs: [
          '先列出最常用的對話情境，例如「早安、謝謝、收到、辛苦了、晚安、加油、沒問題」。先有完整文字清單，再設計角色動作，比邊做邊想更容易維持整組一致。',
        ],
      },
      {
        heading: '第二步：用提示詞建立一致角色',
        paragraphs: [
          '角色外觀、服裝、配色與畫風固定，只替換表情、動作和文字。可以先用 RxV LINE 貼圖提示詞產生器建立母提示詞，再複製修改每一張。',
        ],
      },
      {
        heading: '第三步：AI 產圖後先檢查文字',
        paragraphs: [
          'AI 產出的中文字有時會變形或出現錯字。若文字不穩定，可以先產生無字版本，再於圖片編輯階段補上文字，避免整張圖因一個錯字重做。',
        ],
      },
      {
        heading: '第四步：分割與透明背景',
        paragraphs: [
          '如果先生成一張貼圖總圖，可以使用 RxV 分割工具切成獨立圖片。完成分割後，再逐張檢查是否有白底、邊緣殘影或角色被切到。',
        ],
      },
      {
        heading: '第五步：尺寸與檔案檢查',
        paragraphs: [
          '一般靜態貼圖的貼圖圖片最大為 370 × 320 px，主圖為 240 × 240 px，聊天室標籤圖片為 96 × 74 px；提交使用 PNG，貼圖圖片需透明背景。',
        ],
      },
      {
        heading: '第六步：整理上架資料',
        paragraphs: [
          '確認貼圖張數、排序、主圖、聊天室標籤圖片、貼圖名稱與說明都一致，再進入 Creators Market 的送審流程。正式送審前，建議再以官方最新製作準則做一次核對。',
        ],
      },
    ],
    faq: [
      {
        q: '不會畫圖也能自己做 LINE 貼圖嗎？',
        a: '可以。可以先用 AI 產圖建立角色，再透過分割、去背與文字整理完成素材；仍需要逐張檢查生成品質與上架規格。',
      },
      {
        q: '先做單張還是一次做貼圖總圖比較好？',
        a: '角色一致性高時，總圖速度較快；如果文字與動作差異很大，單張製作通常更容易控制。兩種方式都可再用分割與尺寸工具整理。',
      },
      {
        q: 'AI 產圖後可以直接送審嗎？',
        a: '不建議。至少要檢查文字、角色一致性、透明背景、尺寸、檔案格式與是否有不需要的元素。',
      },
      {
        q: '做完提示詞後可以在哪裡切圖？',
        a: '可直接使用 RxV LINE 貼圖圖片分割工具，把貼圖總圖切成獨立圖片。',
      },
    ],
    ctas: [
      { label: 'LINE 貼圖提示詞產生器', path: '/tools/sticker-prompt', primary: true },
      { label: 'LINE 貼圖圖片分割工具', path: '/tools/sticker-splitter' },
      { label: '前往 LINE 貼圖工具', path: '/tools/line-sticker' },
    ],
    sourceNote: {
      label: 'LINE Creators Market 靜態貼圖製作準則',
      url: 'https://creator.line.me/zh-hant/guideline/sticker/',
    },
  },
];

export const lineStickerSeoGuideRoutePaths = [
  '/guides',
  ...lineStickerSeoGuides.map((guide) => guide.path),
];
