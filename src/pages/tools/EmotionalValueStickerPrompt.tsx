import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

type ThemeKey =
  | "healing"
  | "boyfriend"
  | "comfort"
  | "goodnight"
  | "ceo"
  | "work"
  | "husband"
  | "flirty"
  | "friend"
  | "family"
  | "apology"
  | "encourage";

type PhotoMode = "original" | "realPersonQ" | "realPersonCuteQ" | "semiReal";
type CharacterMode = "male" | "female" | "neutral" | "couple";
type GridType = "4x4" | "5x4";
type TextSize = "large" | "medium";
type TextPosition = "top" | "bottom" | "mixed";
type ColorStyle = "colorfulWhite" | "softPink" | "blueWhite" | "candy" | "cleanBusiness";
type ArtStyle =
  | "commercialCute"
  | "koreanSoft"
  | "japaneseAnime"
  | "roundChibi"
  | "semiRealWatercolor"
  | "threeDClay"
  | "flatSticker"
  | "pixelGame"
  | "comicPop"
  | "warmHandDrawn"
  | "idolDrama"
  | "minimalClean";
type EmotionTone = "warm" | "healing" | "romantic" | "funny" | "dramatic" | "practical" | "apology" | "energetic";
type OutfitStyle = "auto" | "casual" | "suit" | "hoodie" | "apron" | "office" | "pajamas" | "seasonal";
type SceneStyle = "pureWhite" | "softRoom" | "officeDesk" | "cafe" | "nightWindow" | "outdoor" | "simpleProps";
type DecorationStyle = "none" | "heart" | "sparkle" | "flower" | "speechBubble" | "drinkFood" | "pet";

type Theme = {
  label: string;
  desc: string;
  role: string;
  phrases: string[];
};

const themes: Record<ThemeKey, Theme> = {
  healing: {
    label: "療癒陪伴系",
    desc: "陪伴、安慰、被照顧感，適合做情緒價值貼圖。",
    role: "溫柔乾淨、讓人有安心感的角色，表情自然，像會陪伴對方的人",
    phrases: ["別太累", "記得吃飯", "有我在", "抱一下", "先休息", "今天也加油", "辛苦了", "慢慢來", "我陪你", "不要硬撐", "喝點水", "先放鬆", "你已經很好了", "我在這裡", "交給我", "晚點聊"],
  },
  boyfriend: {
    label: "男友感心動系",
    desc: "女生想收到的關心、陪伴與心動感。",
    role: "乾淨有男友感的角色，眼神溫柔，動作自然不油膩，像把對方放在心上",
    phrases: ["想你了", "我等你", "下班接你", "到家說聲", "別淋雨", "吃飯了嗎", "我來處理", "晚安", "早點睡", "今天想你", "抱一下", "給你拍拍", "別怕", "我在", "慢慢說", "你最重要"],
  },
  comfort: {
    label: "哄人安慰系",
    desc: "男生可用來哄人、安慰，也適合情侶互動。",
    role: "會哄人的溫柔角色，表情誠懇，帶一點可愛求和感",
    phrases: ["別生氣", "我錯了", "抱一下", "先別難過", "我陪你", "聽你的", "我來改", "不要哭", "對不起嘛", "我馬上到", "先冷靜", "慢慢說", "我懂你", "我會注意", "給你靠", "好不好嘛"],
  },
  goodnight: {
    label: "晚安陪聊系",
    desc: "睡前陪伴、遠距離聊天、晚安關心。",
    role: "夜晚柔光中的溫柔角色，拿著手機或靠窗微笑，有睡前陪伴感",
    phrases: ["晚安", "早點睡", "做個好夢", "記得蓋被子", "我在", "今天辛苦了", "睡了嗎", "夢裡見", "別熬夜", "明天見", "手機放下", "閉眼休息", "我陪你一下", "今天很棒", "乖乖睡", "想你了"],
  },
  ceo: {
    label: "霸道總裁系",
    desc: "戲劇感、短影音感強，適合社團測反應。",
    role: "明亮乾淨的霸道總裁系角色，西裝造型，溫柔但有氣場",
    phrases: ["交給我", "聽我的", "我買單", "跟我走", "我等你", "不准熬夜", "下班接你", "別逞強", "我來處理", "站我旁邊", "想吃什麼", "今天我安排", "有我在", "先坐下", "不要怕", "我會到"],
  },
  work: {
    label: "上班回訊息系",
    desc: "男女都能用，偏工具型貼圖，日常回覆很實用。",
    role: "乾淨俐落的上班族角色，辦公室風格，表情清楚可愛",
    phrases: ["收到", "晚點回你", "先忙一下", "幫你處理", "開會中", "辛苦了", "下班聊", "我看看", "等我一下", "已處理", "馬上來", "先排程", "今天滿檔", "可以喔", "不行耶", "明天確認"],
  },
  husband: {
    label: "老公求生系",
    desc: "已婚、情侶、搞笑實用向，容易引起留言與分享。",
    role: "可愛誠懇的角色，帶一點緊張求生感，但整體乾淨討喜",
    phrases: ["我錯了", "老婆說得對", "馬上買", "不敢了", "我來洗碗", "先別生氣", "我改", "我去倒垃圾", "我馬上回", "都聽你的", "我有記得", "不是故意的", "我補償", "先抱一下", "我訂好了", "辛苦老婆"],
  },
  flirty: {
    label: "曖昧互動系",
    desc: "戀愛前期、曖昧聊天、甜甜互動適用。",
    role: "乾淨有心動感的角色，表情自然，微笑帶一點曖昧感",
    phrases: ["在幹嘛", "想見你", "晚點聊", "我等你", "睡了嗎", "想你", "有空嗎", "給我一分鐘", "今天好看", "偷想你", "陪我一下", "一起吃嗎", "我可以去嗎", "你先說", "我有空", "要不要見面"],
  },
  friend: {
    label: "朋友閨蜜系",
    desc: "朋友互相打氣、吐槽、陪伴與日常聊天。",
    role: "活潑親切的朋友型角色，表情豐富，有陪伴與一起聊天的感覺",
    phrases: ["我懂你", "抱一下", "別想太多", "我陪你", "太好笑", "真的假的", "走啦", "約嗎", "一起吃飯", "先冷靜", "你最棒", "我支持你", "晚點聊", "快回我", "買起來", "朋友萬歲"],
  },
  family: {
    label: "家人關心系",
    desc: "家人群組、長輩晚輩都能用的溫暖提醒。",
    role: "溫暖親切的家人型角色，像家人一樣提醒與照顧對方",
    phrases: ["吃飯了嗎", "路上小心", "到家說一聲", "記得喝水", "不要太累", "平安就好", "我到家了", "早點睡", "辛苦了", "有事跟我說", "慢慢來", "我來幫忙", "晚安囉", "愛你們", "一起加油", "家人最暖"],
  },
  apology: {
    label: "道歉求和系",
    desc: "求和、道歉、化解尷尬，男女都能用。",
    role: "誠懇又有點可愛慌張的角色，表情帶歉意但不油膩",
    phrases: ["對不起", "我錯了", "原諒我嘛", "不是故意的", "先別生氣", "我會改", "給我一次機會", "我馬上處理", "抱歉啦", "別不理我", "我請你喝飲料", "我補償", "我會注意", "真的拍謝", "和好好嗎", "先抱一下"],
  },
  encourage: {
    label: "加油鼓勵系",
    desc: "考試、工作、創作、生活低潮都能用。",
    role: "陽光溫暖的鼓勵型角色，動作有打氣、比讚、陪伴與遞飲料",
    phrases: ["你可以的", "今天也加油", "慢慢來", "不要放棄", "我相信你", "先休息一下", "已經很棒了", "再撐一下", "辛苦了", "給你打氣", "一切會好的", "別怕", "我陪你", "完成了耶", "超棒的", "明天更好"],
  },
};

const photoModeText: Record<PhotoMode, string> = {
  original: "原創角色，不使用真人照片；請設計可愛商業貼圖角色，避免像真人照片。",
  realPersonQ: "以使用者提供的真人照片作為參考，轉成似顏 Q 版貼圖；需保留臉型、髮型、氣質與主要特徵，但整體仍是可愛貼圖風。",
  realPersonCuteQ: "以使用者提供的真人照片作為參考，轉成更可愛化的純 Q 版角色；保留辨識度，但不要太寫實。",
  semiReal: "以使用者提供的真人照片作為參考，轉成半寫實插畫貼圖；五官更接近本人，但仍保持乾淨商業插畫感。",
};

const characterModeText: Record<CharacterMode, string> = {
  male: "主角以男生為主，乾淨討喜、有情緒價值，可做男友感、哄人、照顧系貼圖。",
  female: "主角以女生為主，溫柔可愛、有療癒感，可做陪伴、安慰、閨蜜或家人關心貼圖。",
  neutral: "主角可設定為中性可愛角色或吉祥物，不強調性別，適合大眾日常聊天使用。",
  couple: "主角可設定為一男一女或雙人互動角色，適合情侶、夫妻、曖昧與互相安慰情境。",
};

const colorStyleText: Record<ColorStyle, string> = {
  colorfulWhite: "彩色粗體字，外加厚白邊，活潑清楚，適合 LINE 貼圖。",
  softPink: "柔和粉色與奶油色文字，外加厚白邊，適合療癒、晚安、男友感主題。",
  blueWhite: "藍色系粗體字，外加厚白邊，乾淨清楚，適合上班回覆與實用貼圖。",
  candy: "糖果色泡泡字，外加厚白邊，甜美可愛，適合曖昧與陪伴主題。",
  cleanBusiness: "乾淨專業的粗體字，外加白邊，適合上班、客服、實用回覆類貼圖。",
};

const artStyleText: Record<ArtStyle, string> = {
  commercialCute: "可愛精緻、乾淨明亮的商業 LINE 貼圖風，人物比例討喜、邊線清楚、適合上架販售。",
  koreanSoft: "韓系柔霧療癒插畫風，色彩溫柔、光感乾淨、角色五官精緻但不寫實。",
  japaneseAnime: "日系清爽動漫貼圖風，表情明確、動作誇張可愛、線條乾淨。",
  roundChibi: "圓潤 Q 版娃娃風，頭大身小、表情可愛、整體更療癒親切。",
  semiRealWatercolor: "半寫實水彩插畫風，五官較細緻、質感柔和，但仍保持貼圖可愛感。",
  threeDClay: "3D 黏土公仔風，圓潤立體、像可愛小公仔，材質柔和不塑膠感。",
  flatSticker: "扁平向量貼紙風，外框清楚、色塊乾淨，適合大量切割與商品化。",
  pixelGame: "像素遊戲貼圖風，復古可愛，文字仍需清楚放大，不可模糊。",
  comicPop: "漫畫泡泡活潑風，表情張力大、適合搞笑與求和主題。",
  warmHandDrawn: "手繪溫暖插畫風，線條柔和、有陪伴感，適合療癒與家人關心。",
  idolDrama: "偶像劇男友感／女友感風格，角色清爽好看、有情緒價值，不要過度性感或油膩。",
  minimalClean: "極簡乾淨貼圖風，背景留白多、人物與文字非常清楚，最適合安全分割。",
};

const emotionToneText: Record<EmotionTone, string> = {
  warm: "溫暖關懷，像真心陪伴對方。",
  healing: "療癒安心，減少壓力、讓人被照顧。",
  romantic: "甜甜心動，但自然不油膩。",
  funny: "輕鬆搞笑，有反差萌與生活感。",
  dramatic: "短影音戲劇感，表情與動作更有張力。",
  practical: "實用回覆，適合每天聊天快速使用。",
  apology: "誠懇求和，帶一點可愛緊張感。",
  energetic: "明亮打氣，充滿鼓勵與正向能量。",
};

const outfitStyleText: Record<OutfitStyle, string> = {
  auto: "依主題自動搭配服裝，保持整組一致。",
  casual: "乾淨日常休閒服，親近自然。",
  suit: "明亮乾淨西裝或襯衫，適合霸道總裁、上班、男友感。",
  hoodie: "連帽衣、針織或柔軟居家風，適合療癒陪伴。",
  apron: "圍裙或店家工作服，適合飲料、甜點、生活照顧感。",
  office: "襯衫、背心或辦公室穿搭，適合工作回覆。",
  pajamas: "睡衣、居家服或毯子元素，適合晚安陪聊。",
  seasonal: "依季節加入外套、圍巾、夏日襯衫等，但不可遮住角色特徵。",
};

const sceneStyleText: Record<SceneStyle, string> = {
  pureWhite: "純白背景，最適合後續分割與上架。",
  softRoom: "白底中加入少量柔和房間小物，例如抱枕、沙發邊角，不能影響切割。",
  officeDesk: "白底中加入少量辦公桌、筆電或文件小物，不能跨格。",
  cafe: "白底中加入咖啡杯、甜點或小桌面元素，畫面仍保持清爽。",
  nightWindow: "白底中加入少量月亮、窗邊或夜晚小元素，適合晚安陪伴。",
  outdoor: "白底中加入少量天空、草地或街景小物，角色仍要完整置中。",
  simpleProps: "依每句文字加入小道具，例如手機、飲料、禮物、傘、鬧鐘，但不可貼邊。",
};

const decorationStyleText: Record<DecorationStyle, string> = {
  none: "不加多餘裝飾，畫面乾淨。",
  heart: "加入少量愛心與粉色小圖案，適合戀愛與陪伴。",
  sparkle: "加入少量星星、閃光與亮點，適合鼓勵與正向主題。",
  flower: "加入少量花朵與柔和裝飾，適合療癒、女性向與家人關心。",
  speechBubble: "加入少量對話泡泡或訊息框，適合聊天回覆。",
  drinkFood: "加入少量飲料、便當、甜點小物，適合照顧與生活感。",
  pet: "加入少量貓狗或可愛小寵物陪伴，但不可搶主角。",
};

function getPhrasesFromText(text: string, limit: number) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[.、．]\s*/, "").trim())
    .filter(Boolean);
  return lines.slice(0, limit);
}

function buildPrompt(args: {
  theme: Theme;
  gridType: GridType;
  photoMode: PhotoMode;
  characterMode: CharacterMode;
  textSize: TextSize;
  textPosition: TextPosition;
  colorStyle: ColorStyle;
  artStyle: ArtStyle;
  emotionTone: EmotionTone;
  outfitStyle: OutfitStyle;
  sceneStyle: SceneStyle;
  decorationStyle: DecorationStyle;
  phrases: string[];
}) {
  const gridCount = args.gridType === "4x4" ? 16 : 20;
  const textSizeText = args.textSize === "large" ? "文字要偏大、粗體、手機上清楚可讀" : "文字大小適中、粗體清楚，不要壓住人物臉部";
  const textPositionText =
    args.textPosition === "top"
      ? "每格文字優先放在上方，人物放下方或側邊，避免遮住臉。"
      : args.textPosition === "bottom"
        ? "每格文字優先放在下方，人物放上方或側邊，避免文字貼到邊界。"
        : "每格文字可依動作放在上方、下方或側邊，但整體要整齊且方便切割。";

  return `請生成一張「可安全分割上架用」${args.gridType} 排列的 LINE 貼圖總圖，共 ${gridCount} 格，白色背景，適合後續分割與打包上架。

重要切割規則：這不是展示海報，請務必做成可切割的貼圖總圖。每一格都要像獨立貼圖一樣分開排列，格與格之間保留大量白色安全留白；每格上下左右都要有明顯安全邊距，人物、文字、愛心、裝飾物都不可碰到格線、不可貼邊、不可跨格、不可重疊到其他格。角色與文字需完整置中在各自格子內，分割後每張 PNG 都要是完整貼圖，不會切到臉、手、文字或外框。不要使用黑色底圖、不要做成海報排版、不要把 16 格擠在一起。

主題：${args.theme.label}
主題定位：${args.theme.desc}
角色設定：${args.theme.role}
角色性別／用途：${characterModeText[args.characterMode]}
角色來源：${photoModeText[args.photoMode]}

畫風要求：${artStyleText[args.artStyle]}人物表情自然、有情緒價值，動作多變，不要過度性感，不要油膩，不要像真人照片。請保持同一個角色設定，讓整組貼圖看起來是同一系列。
情緒語氣：${emotionToneText[args.emotionTone]}
服裝設定：${outfitStyleText[args.outfitStyle]}
背景與場景：${sceneStyleText[args.sceneStyle]}整體仍需白色背景與大量安全留白。
裝飾元素：${decorationStyleText[args.decorationStyle]}裝飾只能放在各自格子內，不可貼邊、不可跨格、不可影響後續切割。

文字要求：每格加入一組繁體中文短句，${textSizeText}。字體設定：${colorStyleText[args.colorStyle]}。${textPositionText}不要使用簡體中文、英文、亂碼、浮水印。

${gridCount} 句文字請依序排列：
${args.phrases.map((p, i) => `${i + 1}. ${p}`).join("\n")}

請讓每格人物動作與文字情緒對應，例如安慰、比心、遞飲料、揮手、看手機、點頭、抱抱手勢、求和姿勢、晚安姿勢、加油打氣等。整體要像完整可販售的 LINE 貼圖示範圖。`;
}

export default function EmotionalValueStickerPrompt() {
  const [selected, setSelected] = useState<ThemeKey>("healing");
  const [gridType, setGridType] = useState<GridType>("4x4");
  const [photoMode, setPhotoMode] = useState<PhotoMode>("original");
  const [characterMode, setCharacterMode] = useState<CharacterMode>("male");
  const [textSize, setTextSize] = useState<TextSize>("large");
  const [textPosition, setTextPosition] = useState<TextPosition>("mixed");
  const [colorStyle, setColorStyle] = useState<ColorStyle>("colorfulWhite");
  const [artStyle, setArtStyle] = useState<ArtStyle>("commercialCute");
  const [emotionTone, setEmotionTone] = useState<EmotionTone>("warm");
  const [outfitStyle, setOutfitStyle] = useState<OutfitStyle>("auto");
  const [sceneStyle, setSceneStyle] = useState<SceneStyle>("pureWhite");
  const [decorationStyle, setDecorationStyle] = useState<DecorationStyle>("sparkle");
  const [phraseText, setPhraseText] = useState(themes.healing.phrases.join("\n"));
  const theme = themes[selected];
  const gridCount = gridType === "4x4" ? 16 : 20;

  useEffect(() => {
    const base = themes[selected].phrases;
    const finalPhrases = gridType === "5x4" ? [...base, "謝謝你", "我一直都在", "一起加油", "今天很棒"] : base;
    setPhraseText(finalPhrases.slice(0, gridCount).join("\n"));
  }, [selected, gridType, gridCount]);

  const phrases = useMemo(() => getPhrasesFromText(phraseText, gridCount), [phraseText, gridCount]);

  const prompt = useMemo(
    () =>
      buildPrompt({
        theme,
        gridType,
        photoMode,
        characterMode,
        textSize,
        textPosition,
        colorStyle,
        artStyle,
        emotionTone,
        outfitStyle,
        sceneStyle,
        decorationStyle,
        phrases,
      }),
    [theme, gridType, photoMode, characterMode, textSize, textPosition, colorStyle, artStyle, emotionTone, outfitStyle, sceneStyle, decorationStyle, phrases]
  );

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      alert("已複製提示詞，可以貼到 ChatGPT 或其他生圖工具使用。");
    } catch {
      alert("複製失敗，請手動選取提示詞複製。");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-sky-50 px-4 py-8">
      <SEO
        title="情緒價值系 LINE 貼圖提示詞｜療癒陪伴、男友感、哄人安慰"
        description="可快速產生情緒價值系 LINE 貼圖提示詞，支援主題、真人似顏 Q 版、原創角色、文字大小、文字位置與 4×4 / 5×4 設定。"
        path="/tools/emotional-value-sticker-prompt"
      />

      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm md:p-7">
          <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">💗 情緒價值貼圖提示詞</p>
          <h1 className="mt-4 text-2xl font-black text-slate-950 md:text-4xl">情緒價值系 LINE 貼圖提示詞</h1>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-700">
            可快速產生療癒陪伴、男友感、哄人安慰、老公求生、上班回覆等 LINE 貼圖提示詞，適合做 4×4 或 5×4 貼圖總圖。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/tools/line-sticker" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold !text-white shadow hover:bg-blue-700">貼圖分割打包工具</Link>
            <Link to="/tools/sticker-prompt" className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold !text-white shadow hover:bg-violet-700">職業／一般貼圖提示詞</Link>
            <Link to="/tools" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow hover:bg-slate-50">返回工具總覽</Link>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-black text-slate-900">選擇貼圖主題與角色</h2>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-sm font-black text-slate-800">主題</span>
                <select value={selected} onChange={(event) => setSelected(event.target.value as ThemeKey)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  {(Object.keys(themes) as ThemeKey[]).map((key) => (
                    <option key={key} value={key}>{themes[key].label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">角色類型</span>
                <select value={characterMode} onChange={(event) => setCharacterMode(event.target.value as CharacterMode)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="male">男生主角</option>
                  <option value="female">女生主角</option>
                  <option value="neutral">中性／吉祥物主角</option>
                  <option value="couple">雙人／情侶互動</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">角色來源</span>
                <select value={photoMode} onChange={(event) => setPhotoMode(event.target.value as PhotoMode)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="original">原創角色，不使用真人照片</option>
                  <option value="realPersonQ">真人照片轉似顏 Q 版</option>
                  <option value="realPersonCuteQ">真人照片轉純 Q 版</option>
                  <option value="semiReal">真人照片轉半寫實插畫</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">排列格式</span>
                <select value={gridType} onChange={(event) => setGridType(event.target.value as GridType)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="4x4">4×4，共 16 張</option>
                  <option value="5x4">5×4，共 20 張</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">文字大小</span>
                <select value={textSize} onChange={(event) => setTextSize(event.target.value as TextSize)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="large">大字版，手機清楚</option>
                  <option value="medium">適中字版，人物更完整</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">文字位置</span>
                <select value={textPosition} onChange={(event) => setTextPosition(event.target.value as TextPosition)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="mixed">自動混排，最自然</option>
                  <option value="top">文字優先在上方</option>
                  <option value="bottom">文字優先在下方</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">文字顏色風格</span>
                <select value={colorStyle} onChange={(event) => setColorStyle(event.target.value as ColorStyle)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="colorfulWhite">彩色粗體＋厚白邊</option>
                  <option value="softPink">柔和粉色＋厚白邊</option>
                  <option value="blueWhite">藍色乾淨＋厚白邊</option>
                  <option value="candy">糖果泡泡字＋厚白邊</option>
                  <option value="cleanBusiness">乾淨專業字＋厚白邊</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">畫風</span>
                <select value={artStyle} onChange={(event) => setArtStyle(event.target.value as ArtStyle)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="commercialCute">商業貼圖風</option>
                  <option value="koreanSoft">韓系柔霧療癒</option>
                  <option value="japaneseAnime">日系清爽動漫</option>
                  <option value="roundChibi">圓潤 Q 版娃娃</option>
                  <option value="semiRealWatercolor">半寫實水彩插畫</option>
                  <option value="threeDClay">3D 黏土公仔</option>
                  <option value="flatSticker">扁平向量貼紙</option>
                  <option value="pixelGame">像素遊戲風</option>
                  <option value="comicPop">漫畫泡泡活潑</option>
                  <option value="warmHandDrawn">手繪溫暖插畫</option>
                  <option value="idolDrama">偶像劇男友／女友感</option>
                  <option value="minimalClean">極簡乾淨留白</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">情緒語氣</span>
                <select value={emotionTone} onChange={(event) => setEmotionTone(event.target.value as EmotionTone)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="warm">溫暖關懷</option>
                  <option value="healing">療癒安心</option>
                  <option value="romantic">甜甜心動</option>
                  <option value="funny">輕鬆搞笑</option>
                  <option value="dramatic">短影音戲劇感</option>
                  <option value="practical">實用回覆</option>
                  <option value="apology">誠懇求和</option>
                  <option value="energetic">明亮打氣</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">服裝設定</span>
                <select value={outfitStyle} onChange={(event) => setOutfitStyle(event.target.value as OutfitStyle)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="auto">依主題自動搭配</option>
                  <option value="casual">日常休閒服</option>
                  <option value="suit">西裝／襯衫</option>
                  <option value="hoodie">連帽衣／居家風</option>
                  <option value="apron">圍裙／店家工作服</option>
                  <option value="office">辦公室穿搭</option>
                  <option value="pajamas">睡衣／晚安居家服</option>
                  <option value="seasonal">季節穿搭</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">背景場景</span>
                <select value={sceneStyle} onChange={(event) => setSceneStyle(event.target.value as SceneStyle)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="pureWhite">純白背景</option>
                  <option value="softRoom">柔和房間小物</option>
                  <option value="officeDesk">辦公桌小物</option>
                  <option value="cafe">咖啡／甜點小物</option>
                  <option value="nightWindow">夜晚窗邊元素</option>
                  <option value="outdoor">戶外清爽小物</option>
                  <option value="simpleProps">依文字加入小道具</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-800">裝飾元素</span>
                <select value={decorationStyle} onChange={(event) => setDecorationStyle(event.target.value as DecorationStyle)} className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-base font-bold text-slate-900 outline-none focus:border-rose-400">
                  <option value="none">不加多餘裝飾</option>
                  <option value="heart">愛心元素</option>
                  <option value="sparkle">星星閃光</option>
                  <option value="flower">花朵柔和裝飾</option>
                  <option value="speechBubble">對話泡泡</option>
                  <option value="drinkFood">飲料／食物小物</option>
                  <option value="pet">貓狗小寵物</option>
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-900">
              <b>目前主題：</b>{theme.label}｜{theme.desc}
            </div>

            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-900">
              <b>安全分割提醒：</b>提示詞已加入「格與格保留大量白色留白、人物與文字不可貼邊、不可跨格」規則，較適合後續用 LINE 貼圖分割工具切成 PNG。
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">可自訂貼圖文字</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">需要 {gridCount} 句</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">每行一句，可改成自己的聊天用語。</p>
            <textarea
              value={phraseText}
              onChange={(event) => setPhraseText(event.target.value)}
              className="mt-4 min-h-[620px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed text-slate-800 outline-none focus:border-rose-300"
            />
            <div className="mt-3 text-sm font-bold text-slate-600">目前有效句數：{phrases.length} / {gridCount}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">完整提示詞</h2>
              <button type="button" onClick={copyPrompt} className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold !text-white shadow hover:bg-rose-700">複製完整提示詞</button>
            </div>
            <textarea
              readOnly
              value={prompt}
              className="mt-4 min-h-[920px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed text-slate-800 outline-none focus:border-rose-300"
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-5 shadow-sm md:p-6">
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white">RxV 原創作品</span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">LINE STORE</span>
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-950">想看實際上架作品？</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
                這裡整理了 RxV 夢想創意工作室製作的原創 LINE 貼圖與表情貼，包含日常回覆、療癒角色與可愛聊天貼圖。可以先到 LINE STORE 看看已上架作品，再回來用本站工具產生自己的貼圖提示詞。
              </p>
            </div>
            <div className="grid gap-3">
              <a
                href="https://store.line.me/search/sticker/zh-Hant?q=RxV"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md hover:bg-emerald-700"
              >
                前往 LINE STORE 看貼圖
              </a>
              <Link
                to="/tools/line-sticker"
                className="rounded-2xl border border-emerald-300 bg-white px-5 py-3 text-center text-sm font-black text-emerald-700 shadow-sm hover:bg-emerald-50"
              >
                使用本站貼圖工具
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-black text-slate-900">💗 支持 RxV 持續提供免費工具</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            如果這個貼圖提示詞工具對你有幫助，歡迎小額支持，讓 RxV 持續提供更多免費圖片、貼圖與創作者工具。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="https://p.ecpay.com.tw/FD7CD6D"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-amber-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md hover:bg-amber-700"
            >
              ☕ 台灣小額支持
            </a>
            <a
              href="https://ko-fi.com/ang2289"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md hover:bg-blue-700"
            >
              🌍 Ko-fi 海外支持
            </a>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-600">功能建議／合作洽詢：rxv0227@gmail.com</p>
        </section>
      </div>
    </main>
  );
}
