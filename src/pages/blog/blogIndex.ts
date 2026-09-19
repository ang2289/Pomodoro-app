export type BlogPostItem = {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  category: "AI" | "QR" | "教學" | "理財";
  isSEO: boolean;
  date: string;
};

export const articles: Omit<BlogPostItem, "isSEO" | "date">[] = [
  { path: "/blog/pomodoro-focus", title: "🧘‍♀️ 如何用番茄鐘提升專注與靜心力", subtitle: "How to Use the Pomodoro Method to Enhance Focus and Mindfulness", description: "學習如何運用番茄鐘專注法來提升工作效能，並培養內心的平靜與覺察力。結合 25 分鐘的專注時段與短暫休息，讓效率與心靈平衡同時提升。", image: "🕒", category: "教學" },
  { path: "/blog/chant-focus", title: "📿 唸經與專注力訓練｜讓心更靜、念更定", subtitle: "Chanting and Focus Training – A Practice to Calm the Mind and Strengthen Concentration", description: "將專注力訓練法與唸經修行結合，幫助你在誦經時維持內心穩定。透過固定節奏的練習，訓練心的專注力，讓修行更有深度。", image: "🪷", category: "教學" },
  { path: "/blog/morning-meditation", title: "🌞 清晨靜坐法｜如何開啟充滿能量的一天", subtitle: "Morning Meditation: The Art of Starting a Mindful and Energized Day", description: "學習如何在早晨醒來後運用 10-15 分鐘靜坐，讓身心重啟並充滿能量。透過簡單的呼吸練習與專注訓練，開啟平靜有方向的一天。", image: "🌞", category: "教學" },
  { path: "/blog/evening-detox", title: "🌙 晚間放鬆法｜睡前五分鐘的心靈排毒", subtitle: "Evening Detox: 5-Minute Nighttime Mind Cleanse for Inner Peace", description: "學會五分鐘睡前排毒儀式，讓你從壓力中釋放出來、穩定情緒、安然入眠。這篇文章教你具體步驟與靜心語句，睡前告別煩惱與焦慮。", image: "🌙", category: "教學" },
  { path: "/blog/perfect-breakfast-time", title: "🥐 早餐不容錯過的天元時間", subtitle: "The Best Time for Breakfast You Shouldn't Miss", description: "認識早晨的「天元時間」——身心最敏銳、最渴望被滋養的黃金片刻。學習如何選擇最適合的早餐，讓營養成為調頻生活的鑰匙。", image: "🥐", category: "教學" },
  { path: "/blog/evening-meditation", title: "🌙 晚安冥想｜幫助你放下白天的焦慮與疲憊", subtitle: "Evening Meditation: Release the Stress of the Day", description: "白天的工作、學業、人際關係常讓我們神經緊繃，這時候，晚安冥想幫助你釋放壓力與焦慮，進入深層放鬆與睡眠。", image: "🌙", category: "教學" },
  { path: "/blog/afternoon-stretch", title: "🧘‍♂️ 午間伸展術｜轉換心情與提升專注", subtitle: "Afternoon Stretch: Refresh Your Mood and Boost Focus", description: "學會三步驟午間伸展術，幫助你釋放壓力、轉換心情、提升下午專注力與效率。", image: "🧘‍♂️", category: "教學" },
  { path: "/blog/healthy-lunch", title: "🥣 健康午餐習慣｜穩定能量與思緒", subtitle: "Healthy Lunch Habits: Steady Energy, Clear Mind", description: "學習打造穩定能量的午餐，避免昏沉與疲倦，讓下午保持清晰與專注。", image: "🥣", category: "教學" },
  { path: "/blog/hydration-meditation", title: "💧 補水冥想法｜用喝水喚醒覺察", subtitle: "Hydration Meditation: Awaken Awareness Through Water", description: "讓喝水變成一種冥想，透過覺察每一口水，讓身體與心靈都回到平衡與清明。", image: "💧", category: "教學" },
  { path: "/blog/morning-ritual", title: "🌸 早晨儀式｜為自己點亮一天的心能量", subtitle: "Morning Ritual: Ignite Your Inner Energy for the Day", description: "透過五分鐘早晨儀式，讓自己帶著平靜、感恩與清明開始新的一天。", image: "🌸", category: "教學" },
  { path: "/blog/night-reset", title: "🌙 夜間重啟法｜放下焦慮、迎接安眠", subtitle: "Night Reset Ritual: Let Go of Anxiety and Embrace Rest", description: "學會夜間重啟三步驟，幫助你釋放焦慮、穩定心神，迎接深層好眠。", image: "🌙", category: "教學" },
  { path: "/blog/self-dialogue-meditation", title: "🪞 自我對話冥想｜傾聽內在聲音的練習", subtitle: "Self-Dialogue Meditation: Listening to Your Inner Voice", description: "學會以溫柔的方式與自己對話，傾聽內在真實聲音，釋放焦慮與自我批評。", image: "🪞", category: "教學" },
  { path: "/blog/emotional-detox", title: "🌈 情緒淨化日｜用書寫重整內心能量", subtitle: "Emotional Detox Day: Rebalance Your Mind Through Writing", description: "透過書寫釋放內心壓力，讓情緒重新流動，找回內在的平靜與力量。", image: "🌈", category: "教學" },
  { path: "/blog/focus-reset", title: "🔥 專注力重啟術｜5 分鐘讓大腦回到最佳狀態", subtitle: "Focus Reset Technique: Recharge Your Brain in 5 Minutes", description: "學會五分鐘專注力重啟術，結合番茄鐘節奏，讓大腦重新充電、找回效率與平靜。", image: "🔥", category: "教學" },
  { path: "/blog/focus-and-emotion", title: "💭 專注與情緒的關聯｜當心散了，效率也會消失", subtitle: "Focus and Emotion Connection: When the Mind Wanders, Efficiency Fades", description: "探索情緒如何影響專注力與決策，學會運用焦慮與壓力，讓大腦重新進入高效狀態。", image: "💭", category: "教學" },
  { path: "/blog/focus-meditation", title: "🧘‍♀️ 專注冥想法｜每天三分鐘讓思緒歸零", subtitle: "Mindful Focus Meditation: Three Minutes to Mental Clarity", description: "每天三分鐘專注冥想，幫助你放下雜念、恢復清明，結合番茄鐘休息時段效果最佳。", image: "🧘‍♀️", category: "教學" },
  { path: "/blog/morning-breath", title: "🌺 身心重啟晨間呼吸法｜為一天注入正能量", subtitle: "Morning Breath Renewal: Energize Your Mind and Body for the Day", description: "每天三分鐘的晨間呼吸法，喚醒身體與心靈，為新的一天注入平靜與能量。", image: "🌺", category: "教學" },
  { path: "/blog/evening-breath", title: "🌬️ 夜間放鬆呼吸法｜用一口氣卸下白天壓力", subtitle: "Evening Relaxing Breath: Let Go of the Day with a Single Breath", description: "睡前三分鐘深呼吸，放下焦慮與疲憊，讓身體重啟放鬆與平靜。", image: "🌬️", category: "教學" },
  { path: "/blog/weekly-breath-challenge", title: "🌿 一週情緒排毒呼吸挑戰｜每天一種呼吸法重啟心能量", subtitle: "7-Day Emotional Detox Breath Challenge: A New Energy Each Day", description: "七天七種呼吸練習，幫你每天釋放壓力、重啟心靈能量，打造穩定又平靜的自己。", image: "🌿", category: "教學" },
  { path: "/blog/calm-breath", title: "🌸 10 秒平靜呼吸法｜任何時刻快速穩定心情", subtitle: "10-Second Calm Breath: Instantly Regain Inner Peace Anytime", description: "短短 10 秒，快速回復平靜與專注。隨時可練的呼吸技巧，適合忙碌生活中的你。", image: "🌸", category: "教學" },
  { path: "/blog/focus-breath", title: "🔥 專注力呼吸訓練｜用節奏引導進入心流狀態", subtitle: "Focused Flow Breathing: Entering the Zone with Rhythm and Breath", description: "三階段呼吸訓練，幫助你穩定專注、快速進入心流模式，搭配番茄鐘效果更佳。", image: "🔥", category: "教學" },
  { path: "/blog/breath-prayer", title: "🕯️ 呼吸與祈願｜讓每一口氣都成為祝福", subtitle: "Breath & Prayer: Let Every Breath Become a Blessing", description: "讓呼吸成為祈願的力量，在一吸一吐之間傳遞平靜與祝福。", image: "🕯️", category: "教學" },
  { path: "/blog/gratitude-breath-journal", title: "🌺 感恩呼吸日記｜用三口氣記錄今日的平靜", subtitle: "Gratitude Breath Journal: Three Breaths to Remember Today's Peace", description: "每天三口感恩呼吸，讓生活更柔軟、心更平靜。結合 App 日誌功能記錄幸福時刻。", image: "🌺", category: "教學" },
  { path: "/blog/chant-energy-breath", title: "💫 集氣呼吸法｜把願望變成能量傳遞", subtitle: "Energy Chant Breathing: Turning Wishes into Vibrations of Light", description: "結合呼吸與願望牆練習，用氣息傳遞祝福，讓願望化為光的能量。", image: "💫", category: "教學" },
  { path: "/blog/moonlight-meditation-breath", title: "🌕 月光冥想呼吸法｜睡前放下、迎接安眠", subtitle: "Moonlight Meditation Breath: Let Go and Rest Under the Night Sky", description: "睡前三口氣，讓月光與呼吸帶走白天的壓力。未來將推出睡眠音樂模組，讓放鬆更完整。", image: "🌕", category: "教學" },
  { path: "/blog/sleep-sound-therapy", title: "🎵 音樂放鬆入眠法｜聲音也能療癒你的夢", subtitle: "Sleep Sound Therapy｜Healing Through Sound and Calm", description: "聲音是最溫柔的療癒方式。教你如何用音樂陪伴夜晚，讓每個夢都更平靜。", image: "🎵", category: "教學" },
  { path: "/blog/evening-gratitude-journal", title: "🪞 晚間感恩筆記法｜一天的美好收心練習", subtitle: "Evening Gratitude Journal｜A Gentle Practice for Peaceful Nights", description: "睡前五分鐘的感恩練習，讓你收回一天的焦慮，帶著平靜入眠。", image: "🪞", category: "教學" },
  { path: "/blog/morning-affirmations", title: "🌸 清晨自我肯定語｜讓一天從自信開始", subtitle: "Morning Affirmations｜Begin Your Day with Confidence", description: "每天早晨三句肯定語，讓你以自信與平靜迎接新的一天。", image: "🌸", category: "教學" },
  { path: "/blog/power-of-silence", title: "🕯️ 安靜的力量｜如何用沉默恢復專注與能量", subtitle: "The Power of Silence｜How Stillness Restores Focus and Energy", description: "用三分鐘的安靜，讓思緒重整、能量回流，專注從沉默開始。", image: "🕯️", category: "教學" },
  { path: "/blog/three-minute-meditation", title: "🪷 靜心三分鐘｜快速轉換心情的冥想法", subtitle: "3-Minute Mind Reset｜Quick Meditation for Emotional Balance", description: "三分鐘冥想練習，讓你在繁忙生活中重新找到呼吸與平靜。", image: "🪷", category: "教學" },
  { path: "/blog/about-spiritual-growth", title: "🌿 心靈成長專欄｜在專注與放鬆之間，找回生活的平衡", subtitle: "Spiritual Growth Journal｜Finding Balance Between Focus and Calm", description: "從混亂到平靜，這個專欄陪你一起練習專注、呼吸與自我成長。", image: "🌿", category: "教學" },
];

export const seoPosts: Omit<BlogPostItem, "isSEO" | "date">[] = [
  {
    path: "/blog/free-ai-tools",
    title: "🤖 免費 AI 工具推薦",
    subtitle: "Free AI Tools Guide",
    description: "整理 AI摘要、作業解題、QR 與圖片處理工具，快速建立可執行的效率流程。",
    image: "🤖",
    category: "AI",
  },
  {
    path: "/blog/ai-summary-guide",
    title: "📝 AI 摘要教學",
    subtitle: "AI Summary Tutorial",
    description: "從提示語設計到輸出驗證，建立可重複使用的 AI摘要工作流。",
    image: "📝",
    category: "AI",
  },
  {
    path: "/blog/homework-helper-guide",
    title: "🎓 作業解題教學",
    subtitle: "Homework Helper Guide",
    description: "用步驟化方法提升理解力，讓 AI 工具成為學習輔助而非依賴。",
    image: "🎓",
    category: "AI",
  },
  {
    path: "/blog/qr-code-generator",
    title: "📱 QR Code 教學",
    subtitle: "QR Code Generator Guide",
    description: "掌握掃碼應用重點，提升分享效率與實際成效。",
    image: "📱",
    category: "QR",
  },
];

export const extraPosts: Omit<BlogPostItem, "isSEO" | "date">[] = [
  {
    title: "進口車關稅解析",
    path: "/blog/car-import-tariff-explained",
    category: "教學",
    subtitle: "政策解析",
    description: "整理進口車關稅重點、計算方式與常見誤解。",
    image: "📘",
  },
  {
    title: "房屋稅解析",
    path: "/blog/house-tax-explained",
    category: "教學",
    subtitle: "政策解析",
    description: "快速理解房屋稅制度與申報常見問題。",
    image: "🏠",
  },
  {
    title: "所得稅級距說明",
    path: "/blog/income-tax-brackets-explained",
    category: "教學",
    subtitle: "政策解析",
    description: "用白話整理所得稅級距與申報重點。",
    image: "📊",
  },
  {
    title: "最低工資解析",
    path: "/blog/minimum-wage-explained",
    category: "教學",
    subtitle: "政策解析",
    description: "彙整最低工資調整重點與影響層面。",
    image: "💼",
  },
  {
    title: "LINE照片刪除教學",
    path: "/blog/line-delete-photos-videos-safe",
    category: "教學",
    subtitle: "LINE 教學",
    description: "安全刪除 LINE 照片影片並保留重要資料。",
    image: "📷",
  },
  {
    title: "LINE貼圖外包指南",
    path: "/blog/line-sticker-outsourcing-guide",
    category: "教學",
    subtitle: "LINE 教學",
    description: "從需求到交付，完整掌握貼圖外包流程。",
    image: "📦",
  },
  {
    title: "2026 蝦皮垃圾袋推薦",
    path: "/blog/shopee-trash-bag-recommendation-2026",
    category: "教學",
    subtitle: "蝦皮分潤導購",
    description: "整理蝦皮高銷量垃圾袋、塑膠袋與清潔袋商品，包含價格、銷量、分潤率與推廣連結。",
    image: "🛒",
  },
  {
    title: "AI免費工具整理",
    path: "/blog/ai-free-tools-2026",
    category: "AI",
    subtitle: "AI 工具彙整",
    description: "彙整 2026 值得關注的 AI 免費工具與應用情境。",
    image: "🤖",
  },
  {
    title: "財務管理文章",
    path: "/blog/finance",
    category: "理財",
    subtitle: "理財專欄",
    description: "健康與理財主題內容導覽，建立長期財務穩定。",
    image: "💰",
  },
  {
    title: "退休規劃指南",
    path: "/blog/retirement",
    category: "理財",
    subtitle: "理財專欄",
    description: "退休金與長期規劃重點，協助建立退休安全感。",
    image: "🧾",
  },
];

const dedupByPath = (items: BlogPostItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
};

const POSTS_DATE = "2026-03-27";

export const allPosts: BlogPostItem[] = dedupByPath([
  ...articles.map((p) => ({ ...p, isSEO: false, date: POSTS_DATE })),
  ...seoPosts.map((p) => ({ ...p, isSEO: true, date: POSTS_DATE })),
  ...extraPosts.map((p) => ({ ...p, isSEO: false, date: POSTS_DATE })),
]);

// 兼容舊引用：若你之後想用「同一份含 meta 的文章清單」可繼續使用此命名
export const allPostsWithMeta: BlogPostItem[] = allPosts;

