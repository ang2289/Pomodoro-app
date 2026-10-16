import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import ToolAdSlot from "@/components/ToolAdSlot";

type PromptEntry = { code: string; title: string; scene: string; group: string; category: string };
type PromptGroup = { key: string; label: string; summary: string; items: Array<[string, string, string]> };

// 代碼僅作為內部穩定識別及舊分享網址相容，對使用者全部顯示繁體中文風格名稱。
const GROUPS: PromptGroup[] = [
  { key: "micro", label: "迷你微型世界", summary: "巨物與小人國的奇趣反差", items: [
    ["miniworkers", "迷你工人", "一群微型工人在巨大的咖啡杯旁檢修蒸氣與金屬管線，精細模型世界"],
    ["minibakery", "迷你麵包師", "微型烘焙師在一塊巨大的可頌上刷奶油，麵粉粒像岩石"],
    ["minigarden", "迷你花園", "小園丁拿著水壺照顧巨大玫瑰與露珠，葉面如森林"],
    ["minicafe", "迷你咖啡館", "小小咖啡師在巨大咖啡豆與玻璃杯之間沖泡拿鐵"],
    ["minirepair", "微型修理隊", "迷你維修員正在修復巨型機械手錶齒輪與金屬彈簧"],
    ["minikitchen", "微型廚房", "微型廚師在一顆巨型草莓旁準備甜點，食材像建築物"],
    ["minilibrary", "迷你圖書館", "迷你讀者在巨大的翻開書頁上行走，紙張形成山谷"],
    ["minibeach", "迷你海岸", "小旅人坐在巨大的貝殼旁看海，沙粒呈現壯闊微觀質感"],
    ["ministudio", "微型設計師", "微型設計團隊在巨大色鉛筆、畫筆及調色盤間工作"],
    ["miniflorist", "微型花藝師", "微型花藝師站在巨大花束和緞帶間整理花朵"]
  ] },
  { key: "ads", label: "超現實商業廣告", summary: "有視覺衝擊的商品主視覺", items: [
    ["surrealad", "超現實廣告", "一件無商標的主角商品漂浮於雲海中，周圍有符合商品概念的巨大藝術裝置"],
    ["splashad", "水花衝擊廣告", "一瓶無標示的透明飲料瓶被清澈水花包圍，水珠凝結於高速快門瞬間"],
    ["luxuryad", "精品棚拍廣告", "精緻無品牌商品置於雕塑基座，柔和聚光與高級材質細節"],
    ["glowad", "發光商品廣告", "無品牌科技商品懸浮於柔光環和霧氣中，邊緣輪廓光突出"],
    ["naturead", "自然系產品廣告", "極簡護膚品置於天然石塊、綠葉與淺水池之間"],
    ["colorad", "撞色幾何廣告", "主角商品與大型幾何造型構成鮮明撞色構圖"],
    ["icead", "冰晶清涼廣告", "無品牌飲品被透亮冰晶和薄霧環繞，呈現清爽視覺"],
    ["floralad", "花藝香氛廣告", "無品牌香水玻璃瓶立於鮮花花瓣及絲綢之間"],
    ["desertad", "沙漠美學廣告", "極簡商品置於抽象沙丘與落日陰影的藝術場景"],
    ["spacead", "太空概念廣告", "原創科技產品漂浮在星球軌道與未來太空基地前方"]
  ] },
  { key: "portrait", label: "人像與 Q 版似顏繪", summary: "照片延伸、個人風格與原創角色", items: [
    ["chibi", "Q版可愛人物", "將主角設計為原創大頭小身體的 2.5 頭身 Q 版角色，親切微笑"],
    ["koreaportrait", "韓系清新人像", "主角身穿簡約休閒服站在明亮窗邊，柔光自然人像"],
    ["japanportrait", "日系生活寫真", "主角漫步於台灣街區的溫暖午後，清新膠片氛圍"],
    ["clayportrait", "黏土公仔", "主角化為精緻手作黏土公仔，柔軟觸感與桌上攝影"],
    ["plushportrait", "絨毛娃娃", "主角化為原創療癒絨毛玩偶，柔軟短絨和刺繡五官"],
    ["storybook", "繪本主角", "主角坐在溫馨書房讀書，溫暖柔和的原創童書插畫"],
    ["careerportrait", "職業形象照", "主角在現代工作室，呈現自然自信而專業的人像"],
    ["watercolorface", "水彩人像", "主角的半身藝術肖像，透明水彩疊色與細緻紙張紋理"],
    ["vintageportrait", "復古人像", "主角身穿原創復古服飾置身溫馨舊時光攝影棚"],
    ["fantasyportrait", "奇幻角色肖像", "主角成為原創奇幻旅人，穿著精緻旅行斗篷與光影飾品"]
  ] },
  { key: "fashion", label: "時尚與品牌形象", summary: "攝影棚、穿搭、美妝與精品質感", items: [
    ["editorial", "雜誌封面攝影", "無文字的時尚雜誌式人像構圖，設計師服裝與大面積留白"],
    ["streetfashion", "城市街拍", "模特兒穿著原創時尚服裝穿梭城市街角，自然動態抓拍"],
    ["bridal", "夢幻婚紗", "新人穿著原創婚紗與禮服於花園步道上，浪漫柔光"],
    ["beautycloseup", "美容特寫", "乾淨專業妝容的人像特寫，呈現自然膚質和柔光"],
    ["jewelry", "珠寶質感", "無品牌珠寶放置於絲絨上，以微距攝影凸顯切面光澤"],
    ["silk", "絲綢時尚", "原創絲綢服飾在風中飄動，細膩光澤與簡約高級背景"],
    ["minimalfashion", "極簡穿搭", "主角穿著原創極簡中性色服飾，在明亮建築空間"],
    ["runway", "伸展台氛圍", "原創時裝登上現代藝術伸展台，聚光與電影感"],
    ["sportfashion", "運動生活風", "主角穿著無商標運動服於戶外城市綠地，充滿活力"],
    ["vintagestyle", "復古時尚棚拍", "原創復古穿搭搭配木質家具與底片光影"]
  ] },
  { key: "fantasy", label: "夢幻奇幻世界", summary: "童話、宇宙、魔法與未來場景", items: [
    ["fairytale", "童話森林", "原創童話旅人走進螢光蘑菇和精靈燈火的奇幻森林"],
    ["mooncastle", "月光城堡", "夢幻城堡聳立在月色雲海，薄霧與柔亮星光"],
    ["crystal", "水晶秘境", "彩色水晶洞穴內倒映神秘光線，小溪穿越其中"],
    ["aurora", "極光雪國", "雪白小木屋位於壯麗極光下，雪面反映天空光彩"],
    ["skyisland", "天空浮島", "一群原創漂浮島嶼環繞瀑布與雲海，奇幻廣角景觀"],
    ["underwater", "海底宮殿", "珊瑚花園和古老原創海底宮殿，被清澈藍光照亮"],
    ["dragonland", "祥龍雲境", "原創東方祥龍穿梭彩雲山谷，宏大溫和的幻想畫面"],
    ["magiclibrary", "魔法書庫", "奇幻古典書庫漂浮著發光書本與星光粒子"],
    ["cybercity", "未來霓虹城市", "原創未來都市夜景，霓虹反光街道與空中交通"],
    ["dreamgarden", "夢幻花海", "巨大綻放花朵與透明蝴蝶圍繞晨霧花園"]
  ] },
  { key: "food", label: "美食與餐飲攝影", summary: "台灣生活感與食物商用主圖", items: [
    ["breakfast", "早餐店招牌", "台灣早餐店的蛋餅、吐司和奶茶，食材自然擺盤，明亮餐桌"],
    ["boba", "手搖飲特寫", "無品牌珍珠奶茶透明杯與凝結水珠，清新攝影棚背景"],
    ["dessert", "夢幻甜點", "精緻小蛋糕、鮮果與奶油擺在柔光甜點桌面"],
    ["coffee", "咖啡香氣", "熱拿鐵與咖啡豆位於木質桌面，蒸氣在窗光中上升"],
    ["streetfood", "台灣夜市小吃", "台灣夜市的原創小吃攤場景，炸物熱氣與溫暖燈光"],
    ["bento", "便當攝影", "台式便當包含主菜與多種配菜，整齊擺盤且食材真實"],
    ["bakery", "麵包烘焙", "新鮮可頌與歐式麵包陳列在木架，金黃烘焙紋理"],
    ["hotpot", "暖心火鍋", "火鍋食材及湯頭在木質餐桌上，溫暖蒸氣和家庭氛圍"],
    ["fruit", "水果鮮切", "多彩新鮮水果切面在乾淨石板上，水珠與微距細節"],
    ["tea", "茶席禪意", "台灣烏龍茶茶壺與茶杯置於原木茶席，竹影與晨光"]
  ] },
  { key: "pets", label: "寵物與療癒角色", summary: "原創萌寵、貼圖與童趣氛圍", items: [
    ["petsticker", "Q版寵物貼圖", "一隻原創 Q 版寵物微笑揮手，白底獨立角色，適合製作貼圖"],
    ["petportrait", "寵物寫真", "毛孩在窗邊舒服地坐著，毛髮細節自然且眼神靈動"],
    ["petcafe", "寵物咖啡館", "可愛狗狗和貓咪在溫馨寵物友善咖啡館休息"],
    ["petgarden", "毛孩花園", "毛孩坐在開滿鮮花的台灣庭院小徑上"],
    ["petbirthday", "寵物生日", "可愛寵物坐在簡潔無文字生日佈景前，氣球與小蛋糕"],
    ["petadventure", "寵物旅行", "毛孩背著小背包遊覽山間步道，明亮戶外場景"],
    ["petchibi", "動物 Q 公仔", "原創 3D Q版毛孩公仔，大眼睛與柔和圓潤比例"],
    ["petwatercolor", "毛孩水彩畫", "寵物半身肖像以淡雅水彩筆觸畫在細紋紙上"],
    ["petstorybook", "寵物繪本", "可愛寵物在月光床邊看書，原創溫柔繪本插畫"],
    ["petspa", "寵物美容", "毛孩在寵物美容工作室剛整理完毛髮，乾淨可愛形象"]
  ] },
  { key: "festival", label: "節慶問候與花卉", summary: "祝福氛圍、商用留白與桌布", items: [
    ["springblossom", "春日櫻花", "粉嫩櫻花在清晨陽光中綻放，乾淨夢幻背景"],
    ["rose", "玫瑰水珠", "盛開玫瑰花瓣帶有清透水珠，細緻微距攝影"],
    ["sunflower", "向日葵陽光", "向日葵花田在藍天下綻放，溫暖光影與輕風"],
    ["orchid", "精品蘭花", "高級質感的蘭花枝葉，在極簡柔光背景獨立展示"],
    ["lotus", "蓮花禪境", "粉色蓮花與水面倒影在薄霧晨曦中，寧靜療癒"],
    ["newyear", "農曆新年", "台灣年節的紅燈籠、梅花與祝福氣氛，不產生文字"],
    ["midautumn", "中秋月圓", "明亮滿月、桂花與賞月茶席，台灣溫馨夜景"],
    ["christmas", "聖誕暖屋", "原創聖誕樹和暖黃燈飾的居家空間，溫暖節日氛圍"],
    ["valentine", "情人節玫瑰", "粉紅玫瑰與心形光斑的浪漫靜物攝影"],
    ["birthday", "生日派對", "柔和色彩氣球、奶油蛋糕與彩紙，無文字溫暖派對"]
  ] },
  { key: "social", label: "社群封面與創作者", summary: "短影音、產品介紹與行銷視覺", items: [
    ["reelcover", "短影音吸睛封面", "單一原創人物位於前景，背景高對比但保留上方標題空間"],
    ["youtubeart", "影片縮圖", "原創人物表情鮮明、主題道具突出、乾淨易讀的構圖留白"],
    ["podcast", "Podcast 視覺", "原創主持人坐在麥克風前，柔和燈光與現代空間"],
    ["creatorstudio", "創作者工作室", "創作者在明亮工作室操作電腦、相機和畫板"],
    ["toolpromo", "免費工具宣傳", "手機與桌機展示抽象原創工具介面，畫面乾淨並留標題區"],
    ["coursecover", "課程封面", "原創講師在工作桌前示範操作，明亮背景與大面積留白"],
    ["appshowcase", "APP 展示圖", "無商標手機模型展示抽象美觀應用介面，立體產品攝影"],
    ["storyvertical", "限時動態", "精緻人物或商品置中，下方保留社群互動貼紙空間"],
    ["brandmood", "品牌情境提案", "中性色調工作桌與材料樣本，像專業品牌 moodboard"],
    ["infographicbg", "資訊圖背景", "抽象柔和幾何與視覺層次，大量無文字留白供後製排版"]
  ] },
  { key: "story", label: "故事場景與懷舊", summary: "台灣在地記憶、旅行與電影氛圍", items: [
    ["taiwancourtyard", "台灣三合院", "懷舊台灣三合院前院，老腳踏車與午後陽光"],
    ["oldstreet", "台灣老街", "溫暖的台灣傳統老街，騎樓、機車與日常市井生活"],
    ["rainscene", "雨後街道", "台灣城市雨後街道水面倒映路燈，電影感鏡頭"],
    ["traintrip", "火車旅行", "旅人在台灣海線火車窗邊看蔚藍海景"],
    ["mountainpath", "山間步道", "台灣山林步道穿過雲霧與陽光，安靜旅行感"],
    ["seaside", "海邊散步", "東亞旅人在台灣港邊散步，海風吹起衣角"],
    ["nightmarket", "夜市故事", "台灣夜市燈光與攤販人情味，溫暖電影劇照"],
    ["cozyroom", "溫馨小房間", "窗前暖燈、書本與盆栽的居家空間，雨天療癒氛圍"],
    ["starcamp", "星空露營", "台灣山區夜晚的露營帳篷與滿天星光，壯闊寧靜"],
    ["retrofilm", "懷舊底片", "台灣街頭舊時光日常，暖色底片顆粒與自然抓拍"]
  ] },
];
const CATALOG: PromptEntry[] = GROUPS.flatMap((g) => g.items.map(([code, title, scene]) => ({
  code, title, scene, group: g.key, category: g.label,
})));
const RATIOS = ["9:16 直式", "1:1 正方形", "4:5 貼文", "16:9 橫式"];
const CHATGPT_URL = "https://chatgpt.com/";

function makePrompt(entry: PromptEntry, ratio: string, subject: string, photo: boolean): string {
  const reference = photo
    ? "我會在 AI 生圖對話中另外上傳一張已取得使用權的參考照片。請參考該照片的主要主體、髮型、臉部特徵或商品外形，轉換成原創視覺效果；避免臆造不必要的辨識特徵。若無參考照片請以文字設定為準。"
    : "不使用參考照片，請創造完全原創的視覺內容。";
  return [
    "請直接生成一張完整圖片，不要先提供企劃、步驟或解說。",
    "主題風格：" + entry.title + "｜" + entry.category,
    "場景細節：" + entry.scene + "。",
    subject.trim() ? "我的指定主體：" + subject.trim() + "。" : "",
    "畫面比例：" + ratio + "，高清晰度，構圖完整，主角及重要道具不得被裁切。",
    "畫質與構圖：主次分明、光線自然、材質細節清晰、視覺吸引力強；主角、背景與道具風格一致。",
    reference,
    "商用安全：請勿加入文字、商標、品牌 Logo、浮水印、QR Code；不模仿知名角色或特定藝術家，不複製受保護的品牌形象。",
    "品質檢查：避免多手、多腳、多手指、五官異常、模糊失焦、重複角色、文字雜訊與不合理透視。",
    "一次只生成一張獨立完整圖片，不要拼貼或分格。"
  ].filter(Boolean).join("\n");
}

export default function ImagePromptCodeLibrary() {
  const initialCode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("code") : null;
  const [chosen, setChosen] = useState(() => CATALOG.find((item) => item.code === initialCode)?.code ?? "miniworkers");
  const [category, setCategory] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");
  const selected = CATALOG.find((item) => item.code === chosen) ?? CATALOG[0];
  const result = useMemo(() => makePrompt(selected, ratio, subject, Boolean(preview)), [selected, ratio, subject, preview]);
  const filtered = useMemo(() => CATALOG.filter((item) => {
    const q = keyword.trim().toLowerCase().split("/").join("");
    return (category === "all" || item.group === category) &&
      (!q || [item.title, item.scene, item.category].some((v) => v.toLowerCase().includes(q)));
  }), [keyword, category]);

  const copy = async (value: string, success: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        textarea.remove();
        if (!ok) throw new Error("copy failed");
      }
      setMessage(success);
    } catch {
      setMessage("複製失敗，請選取下方完整提示詞自行複製。");
    }
  };

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMessage("請選擇圖片檔案。"); return; }
    if (file.size > 12 * 1024 * 1024) { setMessage("圖片請小於 12MB。"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
        setPhotoName(file.name);
        setMessage("參考照片只在本機預覽；前往 ChatGPT 生圖時請另外上傳同一張照片。");
      }
    };
    reader.readAsDataURL(file);
  };

  const copyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("code", selected.code);
    copy(url.toString(), "已複製這組風格的分享連結。");
  };

  return (
    <>
      <SEO title="100 組 AI 生圖中文風格｜免費提示詞一鍵複製｜RXV" description="免費使用 RXV 精選 100 組中文 AI 生圖風格，包含迷你微型世界、創意商品廣告、Q版人像、商品攝影與台灣生活風格；選風格、調整比例並一鍵複製完整提示詞。" canonical="/tools/prompt-codes" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 shadow-sm sm:p-8">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">免費使用・不用註冊・無額外 AI API 費用</span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">100 組 AI 生圖中文風格</h1>
          <p className="mt-3 text-base leading-7 text-slate-700">全部使用中文名稱，不用背英文！選擇喜歡的圖片風格、輸入主題、一鍵複製提示詞，再到 ChatGPT 貼上生圖。</p>
          <p className="mt-2 text-sm text-slate-600">提示詞免費產生，不需要註冊；實際生成圖片仍依所選 AI 平台的方案及使用額度。</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#code-browser" className="rounded-xl bg-violet-700 px-5 py-3 font-bold !text-white hover:bg-violet-800">第 1 步｜挑選風格</a>
            <Link to="/tools/image-prompt" className="rounded-xl border border-violet-200 bg-white px-5 py-3 font-bold text-violet-700 hover:bg-violet-50">回原版生圖工具</Link>
          </div>
        </section>

        <section id="code-browser" className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold text-slate-900">第 1 步｜選擇喜歡的中文風格</h2>
          <p className="mt-2 text-sm text-slate-600">共 {CATALOG.length} 組精選圖片風格，可以用中文關鍵字搜尋，也可以直接點選分類與風格。</p>
          <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="prompt-code-search">搜尋風格</label>
          <input id="prompt-code-search" type="search" autoComplete="off" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例如：迷你工人、夢幻、花藝、商品、台灣…" className="mt-2 min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-violet-500" />
          <div className="mt-4 flex flex-wrap gap-2" aria-label="風格分類">
            <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`rounded-full border px-4 py-2 text-sm font-bold ${category === "all" ? "border-violet-700 bg-violet-700 text-white" : "border-slate-200 bg-white text-slate-700"}`}>全部 100 組</button>
            {GROUPS.map((group) => <button key={group.key} type="button" aria-pressed={category === group.key} onClick={() => setCategory(group.key)} className={`rounded-full border px-4 py-2 text-sm font-bold ${category === group.key ? "border-violet-700 bg-violet-700 text-white" : "border-slate-200 bg-white text-slate-700"}`}>{group.label}</button>)}
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600" aria-live="polite">符合條件：{filtered.length} 組</p>
          {filtered.length === 0 ? <div className="mt-4 rounded-xl bg-slate-50 p-5 text-slate-600">沒有找到相符風格，請換個中文關鍵字或切換「全部 100 組」。</div> : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <button key={item.code} type="button" onClick={() => { setChosen(item.code); setMessage("已選取「" + item.title + "」，可往下自訂並複製提示詞。"); document.getElementById("code-result")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-pressed={chosen === item.code} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${chosen === item.code ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-slate-200 bg-white hover:border-violet-200"}`}>
                <span className="text-xs font-bold text-violet-700">{item.category}</span>
                <div className="mt-1 text-lg font-extrabold text-slate-900">{item.title}</div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.scene}</p>
                <span className="mt-3 inline-block text-xs font-bold text-violet-700">{chosen === item.code ? "已選取" : "選擇這組 →"}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="code-result" className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900">第 2 步｜自訂圖片與參考照片</h2>
            <div className="mt-4 rounded-xl bg-violet-50 p-4">
              <div className="text-sm text-violet-800">目前選擇</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{selected.title}</div>
            </div>
            <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="prompt-subject">想畫的主題（選填）</label>
            <textarea id="prompt-subject" rows={3} maxLength={300} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="例如：台灣飲料店的珍珠奶茶、穿白襯衫的女性、我家的橘貓…" className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-violet-500" />
            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="prompt-ratio">圖片比例</label>
            <select id="prompt-ratio" value={ratio} onChange={(e) => setRatio(e.target.value)} className="mt-2 min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900">{RATIOS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="prompt-photo">上傳參考照片（選填）</label>
            <input id="prompt-photo" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-bold file:text-violet-700" />
            {preview && <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3"><img src={preview} alt="本機上傳的參考照片預覽" className="h-24 w-24 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="break-all text-sm text-slate-600">{photoName}</p><button type="button" onClick={() => {setPreview(null);setPhotoName("");}} className="mt-2 text-sm font-bold text-rose-700 underline">移除照片</button></div></div>}
            <p className="mt-3 text-sm leading-6 text-slate-600">隱私說明：照片只在目前瀏覽器本機預覽，不會上傳到 RXV 伺服器。複製提示詞不會連同照片複製，請自行在 ChatGPT 對話中再上傳該照片。</p>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900">第 3 步｜複製完整提示詞</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">以下文字會隨風格、圖片比例與主題更新。複製到 ChatGPT，即可要求產生圖片。</p>
            <textarea aria-label="完整 AI 生圖提示詞" readOnly value={result} rows={16} onFocus={(e) => e.target.select()} className="mt-4 w-full rounded-xl border border-violet-200 bg-white p-4 text-sm leading-7 text-slate-800" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => copy(result, "已複製完整提示詞！")} className="min-h-[48px] rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white hover:bg-violet-800">一鍵複製提示詞</button>
              <a href={CHATGPT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-violet-300 bg-white px-4 py-3 text-center text-sm font-bold text-violet-700 hover:bg-violet-50">開啟 ChatGPT 生圖 ↗</a>
              <button type="button" onClick={copyShareLink} className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:col-span-2">分享這組風格的連結</button>
            </div>
            {message && <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-white p-3 text-sm font-medium text-violet-900">{message}</p>}
          </div>
        </section>
        <ToolAdSlot />
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">常見問題</h2>
          <h3 className="mt-4 font-bold text-slate-800">選好中文風格後，會直接生成圖片嗎？</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">網站會自動組成完整圖片提示詞；按「一鍵複製提示詞」，再貼到 ChatGPT 或其他 AI 生圖工具就能要求生圖。</p>
          <h3 className="mt-4 font-bold text-slate-800">一定要上傳照片嗎？</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">不用。若想以自己的照片為參考，先選取本機照片，再到 ChatGPT 上傳同一張照片並貼上提示詞即可。</p>
          <h3 className="mt-4 font-bold text-slate-800">網站會直接產出圖片嗎？</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">這個工具負責產生提示詞，不使用付費圖片 API；實際生成圖片會在您選用的 AI 平台進行。</p>
        </section>
      </main>
    </>
  );
}
