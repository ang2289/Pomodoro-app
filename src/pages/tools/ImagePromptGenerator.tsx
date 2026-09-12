import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";

const LINE_STICKER_STORE_URL = "https://store.line.me/stickershop/product/33968282/zh-Hant";
const SUPPORT_TW_URL = "https://p.ecpay.com.tw/FD7CD6D";
const SUPPORT_KOFI_URL = "https://ko-fi.com/ang2289";

type PresetKey =
  | "businessDessertProduct"
  | "businessDrinkNewProduct"
  | "businessFoodDelivery"
  | "businessBeautyBrand"
  | "businessFlowerGift"
  | "businessPromoPoster"
  | "businessBeforeAfter"
  | "businessBrandSet"
  | "social"
  | "product"
  | "brand"
  | "food"
  | "wallpaper"
  | "cover"
  | "festival"
  | "mascot"
  | "gufengBlueDessert"
  | "gufengPinkTea"
  | "gufengCakeStudio"
  | "gufengWhiteFox"
  | "gufengOfficeDolls"
  | "gufengEggTartShop"
  | "gufengCreatorDesk"
  | "gufengPetFlower"
  | "viralAncientMini"
  | "viralFantasyGoddess"
  | "viralTarotCard"
  | "viralPetSticker"
  | "viralPetMorning"
  | "viralCareerAvatar"
  | "viralQStickerSheet"
  | "viralShopPoster"
  | "viralProductBeforeAfter"
  | "viralMiniWorld"
  | "viralCouplePortrait"
  | "viralCyberpunk"
  | "viralGameCharacter"
  | "viralBookCover"
  | "viralPhoneFrame"
  | "viralVideoOpening"
  | "viralLifestyleReel"
  | "taiwanesePhrasePoster"
  | "festivalDragonBoatGreeting"
  | "festivalMidAutumnGreeting"
  | "festivalLunarNewYearGreeting"
  | "festivalChristmasGreeting"
  | "festivalValentineGreeting"
  | "festivalMothersDayGreeting"
  | "festivalFathersDayGreeting"
  | "festivalHalloweenGreeting";

type Preset = {
  label: string;
  purpose: string;
  subject: string;
  style: string;
  mood: string;
  composition: string;
  ratio: string;
  enhancements: string[];
  avoids: string[];
  description: string;
};

const PURPOSE_OPTIONS = [
  "社群貼文圖",
  "外送平台主圖",
  "作品集示範圖",
  "商品宣傳圖",
  "品牌形象圖",
  "美食甜點圖",
  "夢幻桌布圖",
  "封面／縮圖",
  "節日賀圖",
  "角色／吉祥物圖",
  "爆款互動圖",
  "AI 角色卡",
  "短影音起始圖",
  "故事感場景圖",
  "情緒牌卡圖",
  "寵物貼圖圖",
];

const STYLE_OPTIONS = [
  "高級質感風",
  "韓系清新風",
  "日系療癒風",
  "夢幻唯美風",
  "文青柔和風",
  "商業廣告風",
  "明亮商品攝影風",
  "電影感風格",
  "柔和手繪風",
  "Q版可愛風",
  "極簡品牌風",
  "高對比吸睛風",
  "古風仙氣風",
  "迷你分身故事風",
  "塔羅牌卡風",
  "奇幻遊戲角色風",
  "賽博龐克風",
  "寵物療癒貼圖風",
  "社團爆款互動風",
  "短影音開場風",
];

const MOOD_OPTIONS = [
  "溫暖柔和",
  "明亮乾淨",
  "浪漫甜美",
  "高級精緻",
  "可愛療癒",
  "安靜治癒",
  "清新自然",
  "喜氣溫馨",
  "吸睛強烈",
  "親切舒服",
  "神秘夢幻",
  "食慾感十足",
  "仙氣夢幻",
  "命運神秘",
  "故事張力強",
  "可愛到想留言",
  "華麗震撼",
  "高互動感",
  "短影音感",
];

const COMPOSITION_OPTIONS = [
  "主體置中",
  "特寫近景",
  "半身構圖",
  "全身構圖",
  "左側主體＋右側留白",
  "上方留白方便加字",
  "商品置中展示",
  "桌面情境構圖",
  "橫幅構圖",
  "沉浸式寬景構圖",
  "賀卡式構圖",
  "單一主角清楚展示",
  "主角＋迷你分身圍繞",
  "多張小圖拼貼預覽",
  "牌卡式資訊構圖",
  "手機畫面框中框",
  "商品升級展示構圖",
  "人物置中＋背景故事場景",
  "短影音第一秒停留構圖",
];

const RATIO_OPTIONS = ["1:1", "4:5", "9:16", "16:9", "4:3"];

const ENHANCEMENT_OPTIONS = [
  "更吸睛",
  "更高級",
  "更夢幻",
  "更療癒",
  "更適合社群分享",
  "更適合商品宣傳",
  "更有故事感",
  "更有品牌感",
  "留白方便加字",
  "畫面乾淨",
  "主題清楚",
  "高畫質細節",
  "留言感強",
  "適合做短影音開場",
  "適合做提示詞案例展示",
  "主角有記憶點",
  "可延伸成系列作品",
  "外送平台更吸睛",
  "購買感更強",
  "適合開發店家",
  "整套品牌展示",
];

const AVOID_OPTIONS = [
  "不要浮水印",
  "不要 Logo",
  "不要文字",
  "不要模糊",
  "不要雜亂背景",
  "不要多餘人物",
  "不要比例失衡",
  "不要過度曝光",
  "不要色彩髒亂",
  "不要怪異手部或肢體",
  "不要侵犯真人肖像",
  "不要抄襲特定作品風格",
  "不要使用名人或品牌元素",
  "不要低解析截圖感",
  "不要真實店名",
  "不要平台截圖",
  "不要誤導成實際商品",
];

const PRESETS: Record<PresetKey, Preset> = {

  taiwanesePhrasePoster: {
    label: "台語／台灣人口頭禪貼圖宣傳圖",
    purpose: "節日賀圖",
    subject: "台灣在地口頭禪 LINE 貼圖宣傳主視覺，畫面包含可愛原創角色、台灣街口小店、工地或師傅元素、對話泡泡、手寫感口頭禪，例如真的假的、有影無、甘安捏、拍謝啦、賀啦、水啦，保留明顯留白方便加上活動文字或工具宣傳文字",
    style: "Q版可愛風",
    mood: "親切舒服",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更適合社群分享", "留言感強", "留白方便加字", "主題清楚", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要雜亂背景", "不要低解析截圖感"],
    description: "LINE 活動與社群主題：適合台語感、台灣人口頭禪、工地師傅、小店家與在地職業貼圖宣傳。",
  },
  festivalDragonBoatGreeting: {
    label: "端午節賀圖／貼圖宣傳圖",
    purpose: "節日賀圖",
    subject: "端午節主視覺，畫面包含可愛粽子、龍舟、艾草、香包與清爽夏日節慶氛圍，可保留明顯留白讓後續加上端午安康或店家活動文字",
    style: "Q版可愛風",
    mood: "喜氣溫馨",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更適合社群分享", "留白方便加字", "主題清楚", "可延伸成系列作品", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要雜亂背景", "不要低解析截圖感"],
    description: "節慶主題：適合端午節貼文、LINE 貼圖宣傳、店家節慶活動與作品集示範。",
  },
  festivalMidAutumnGreeting: {
    label: "中秋節賀圖／活動圖",
    purpose: "節日賀圖",
    subject: "中秋節主視覺，畫面包含滿月、月兔、月餅、柚子、燈籠與溫暖團圓氛圍，可保留留白加上中秋祝福或店家預購活動文字",
    style: "日系療癒風",
    mood: "溫暖柔和",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更療癒", "更適合社群分享", "留白方便加字", "主題清楚", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要雜亂背景", "不要低解析截圖感"],
    description: "節慶主題：適合中秋賀圖、月餅禮盒宣傳、店家預購活動與貼圖推廣。",
  },
  festivalLunarNewYearGreeting: {
    label: "新年／過年賀圖",
    purpose: "節日賀圖",
    subject: "新年過年主視覺，畫面包含紅包、春聯、燈籠、金元寶、煙火與喜氣紅金配色，可保留留白加上新年快樂、恭喜發財或開工大吉文字",
    style: "高級質感風",
    mood: "喜氣溫馨",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更吸睛", "更有品牌感", "留白方便加字", "主題清楚", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要色彩髒亂", "不要低解析截圖感"],
    description: "節慶主題：適合新年祝福圖、開工大吉圖、店家春節活動與社群貼文。",
  },
  festivalChristmasGreeting: {
    label: "聖誕節賀圖／活動圖",
    purpose: "節日賀圖",
    subject: "聖誕節主視覺，畫面包含聖誕樹、禮物盒、雪花、鈴鐺、暖色燈光與紅綠金節慶氛圍，可保留留白加上聖誕祝福或交換禮物活動文字",
    style: "夢幻唯美風",
    mood: "浪漫甜美",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更夢幻", "更適合社群分享", "留白方便加字", "主題清楚", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要雜亂背景", "不要低解析截圖感"],
    description: "節慶主題：適合聖誕賀圖、店家交換禮物活動、品牌貼文與貼圖推廣。",
  },
  festivalValentineGreeting: {
    label: "情人節賀圖／告白圖",
    purpose: "節日賀圖",
    subject: "情人節主視覺，畫面包含愛心、花束、巧克力、粉紅泡泡與浪漫柔和氛圍，可保留留白加上告白文字、活動文字或店家送禮宣傳文字",
    style: "韓系清新風",
    mood: "浪漫甜美",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更吸睛", "更適合社群分享", "留白方便加字", "可延伸成系列作品", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要侵犯真人肖像", "不要低解析截圖感"],
    description: "節慶主題：適合情人節告白圖、花店甜點店活動圖、貼圖宣傳與社群互動。",
  },
  festivalMothersDayGreeting: {
    label: "母親節賀圖／送禮圖",
    purpose: "節日賀圖",
    subject: "母親節主視覺，畫面包含康乃馨、花束、蛋糕、祝福卡片、柔和光線與溫暖感謝氛圍，可保留留白加上母親節快樂或送禮活動文字",
    style: "高級質感風",
    mood: "溫暖柔和",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更高級", "更有品牌感", "留白方便加字", "主題清楚", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要侵犯真人肖像", "不要低解析截圖感"],
    description: "節慶主題：適合母親節祝福圖、花店甜點禮盒宣傳、店家送禮活動與貼圖推廣。",
  },
  festivalFathersDayGreeting: {
    label: "父親節賀圖／送禮圖",
    purpose: "節日賀圖",
    subject: "父親節主視覺，畫面包含領帶、卡片、蛋糕、禮盒、溫暖光線與穩重感謝氛圍，可保留留白加上父親節快樂或送禮活動文字",
    style: "高級質感風",
    mood: "親切舒服",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更有品牌感", "更適合社群分享", "留白方便加字", "主題清楚", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要侵犯真人肖像", "不要低解析截圖感"],
    description: "節慶主題：適合父親節祝福圖、禮盒活動、店家送禮宣傳與貼圖推廣。",
  },
  festivalHalloweenGreeting: {
    label: "萬聖節賀圖／活動圖",
    purpose: "節日賀圖",
    subject: "萬聖節主視覺，畫面包含可愛南瓜燈、小幽靈、糖果、蝙蝠、魔法帽與紫橘節慶氛圍，風格可愛不恐怖，可保留留白加上活動文字",
    style: "Q版可愛風",
    mood: "吸睛強烈",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["更吸睛", "更適合社群分享", "留白方便加字", "主題清楚", "可延伸成系列作品"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要過度恐怖", "不要低解析截圖感"],
    description: "節慶主題：適合萬聖節活動圖、糖果店甜點店宣傳、貼圖推廣與社群互動。",
  },
  businessDessertProduct: {
    label: "甜點店商品宣傳圖",
    purpose: "商品宣傳圖",
    subject: "一盒剛出爐的金黃色蛋塔或甜點商品，搭配禮盒、品牌貼紙、紙袋與柔和自然光，呈現小店高質感商品宣傳圖，適合甜點店、蛋塔店、烘焙店使用",
    style: "明亮商品攝影風",
    mood: "食慾感十足",
    composition: "商品置中展示",
    ratio: "4:5",
    enhancements: ["更適合商品宣傳", "更有品牌感", "購買感更強", "高畫質細節", "留白方便加字"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要誤導成實際商品", "不要雜亂背景"],
    description: "商業用主題：適合甜點店、蛋塔店、烘焙店做商品宣傳圖、社群貼文與作品集示範。",
  },
  businessDrinkNewProduct: {
    label: "飲料店新品宣傳圖",
    purpose: "商品宣傳圖",
    subject: "一杯新品飲料放在乾淨桌面上，杯身清楚、配料豐富，背景有清新店面氛圍與可加文字的留白，適合飲料店、咖啡店與手搖飲品牌宣傳",
    style: "韓系清新風",
    mood: "明亮乾淨",
    composition: "左側主體＋右側留白",
    ratio: "4:5",
    enhancements: ["更吸睛", "更適合商品宣傳", "購買感更強", "畫面乾淨", "留白方便加字"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要色彩髒亂", "不要雜亂背景"],
    description: "商業用主題：適合飲料店、咖啡店與手搖飲品牌做新品圖、活動圖與社群貼文。",
  },
  businessFoodDelivery: {
    label: "熱炒／便當外送主圖",
    purpose: "外送平台主圖",
    subject: "一份熱騰騰的熱炒、便當或招牌餐點，餐點色澤鮮明、份量感清楚，背景乾淨，讓人第一眼覺得好吃、想點餐，適合 Uber Eats、Foodpanda、LINE 點餐或店家社群使用",
    style: "商業廣告風",
    mood: "食慾感十足",
    composition: "特寫近景",
    ratio: "4:5",
    enhancements: ["外送平台更吸睛", "更適合商品宣傳", "購買感更強", "主題清楚", "高畫質細節"],
    avoids: ["不要浮水印", "不要 Logo", "不要平台截圖", "不要真實店名", "不要色彩髒亂"],
    description: "商業用主題：適合熱炒店、便當店、小吃店與早餐店做外送平台主圖與招牌菜宣傳。",
  },
  businessBeautyBrand: {
    label: "美甲／美睫形象圖",
    purpose: "品牌形象圖",
    subject: "明亮乾淨的美甲或美睫工作室形象照，畫面有精緻手部、工具、花朵與柔和光線，呈現專業又溫柔的美業品牌感，可用於社群、作品集與預約頁",
    style: "高級質感風",
    mood: "高級精緻",
    composition: "桌面情境構圖",
    ratio: "4:5",
    enhancements: ["更有品牌感", "畫面乾淨", "高畫質細節", "適合開發店家", "留白方便加字"],
    avoids: ["不要浮水印", "不要 Logo", "不要侵犯真人肖像", "不要怪異手部或肢體", "不要真實店名"],
    description: "商業用主題：適合美甲師、美睫師、美容工作室做品牌形象、課程宣傳與作品集示範。",
  },
  businessFlowerGift: {
    label: "花店／禮盒主視覺",
    purpose: "品牌形象圖",
    subject: "一束精緻花束搭配禮盒、卡片與柔和自然光，整體乾淨高級，適合節日送禮、花店品牌宣傳、禮品店與手作品牌主視覺",
    style: "高級質感風",
    mood: "浪漫甜美",
    composition: "商品置中展示",
    ratio: "4:5",
    enhancements: ["更高級", "更有品牌感", "更適合社群分享", "高畫質細節", "留白方便加字"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要雜亂背景", "不要過度曝光"],
    description: "商業用主題：適合花店、禮品店與手作品牌做節日送禮主視覺與社群宣傳圖。",
  },
  businessPromoPoster: {
    label: "小店促銷活動圖",
    purpose: "社群貼文圖",
    subject: "小店促銷活動主視覺，商品清楚、畫面有右側或上方留白，適合後續加上限時優惠、買一送一、預購開放、新品上市等文字，整體明亮有購買感",
    style: "商業廣告風",
    mood: "吸睛強烈",
    composition: "上方留白方便加字",
    ratio: "4:5",
    enhancements: ["更吸睛", "更適合商品宣傳", "購買感更強", "留白方便加字", "適合開發店家"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要亂字", "不要雜亂背景"],
    description: "商業用主題：適合各類小店、餐飲、甜點、飲料與美業做促銷活動圖。",
  },
  businessBeforeAfter: {
    label: "商品圖升級前後示範",
    purpose: "作品集示範圖",
    subject: "普通商品照升級成高質感商業商品圖的前後比較感，呈現圖片變清楚、背景更乾淨、商品更吸引人、更適合放在社群或外送平台的效果，畫面適合做作品集展示",
    style: "明亮商品攝影風",
    mood: "高級精緻",
    composition: "商品升級展示構圖",
    ratio: "16:9",
    enhancements: ["適合做提示詞案例展示", "適合開發店家", "主題清楚", "整套品牌展示", "高畫質細節"],
    avoids: ["不要浮水印", "不要 Logo", "不要平台截圖", "不要真實店名", "不要誤導成實際商品"],
    description: "商業用主題：適合做作品集、前後比較圖、接案展示與 Mail 開發店家的示範素材。",
  },
  businessBrandSet: {
    label: "小店品牌整套示範圖",
    purpose: "品牌形象圖",
    subject: "同一個小店品牌的整套視覺展示，包含商品圖、包裝袋、禮盒、名片、社群貼文與品牌主視覺，整體色系一致、乾淨專業，讓客戶一眼看懂可以做整套品牌視覺服務",
    style: "極簡品牌風",
    mood: "高級精緻",
    composition: "多張小圖拼貼預覽",
    ratio: "16:9",
    enhancements: ["更有品牌感", "整套品牌展示", "適合開發店家", "可延伸成系列作品", "畫面乾淨"],
    avoids: ["不要浮水印", "不要 Logo", "不要真實店名", "不要使用名人或品牌元素", "不要雜亂背景"],
    description: "商業用主題：適合展示商品圖、包裝、名片、社群圖與品牌視覺一整套服務。",
  },
  social: {
    label: "社群吸睛圖",
    purpose: "社群貼文圖",
    subject: "柔和粉白花束放在晨光灑落的窗邊，整體有舒服的生活感",
    style: "韓系清新風",
    mood: "溫暖柔和",
    composition: "主體置中",
    ratio: "4:5",
    enhancements: ["更吸睛", "更適合社群分享", "有故事感", "畫面乾淨"],
    avoids: ["不要浮水印", "不要模糊", "不要雜亂背景"],
    description: "適合 FB、IG、Threads 的吸睛分享圖。",
  },
  product: {
    label: "商品宣傳圖",
    purpose: "商品宣傳圖",
    subject: "一盒剛出爐的金黃色蛋塔，主體清楚突出，帶有商業廣告感",
    style: "明亮商品攝影風",
    mood: "高級精緻",
    composition: "商品置中展示",
    ratio: "4:5",
    enhancements: ["更適合商品宣傳", "主題清楚", "高畫質細節", "畫面乾淨"],
    avoids: ["不要浮水印", "不要模糊", "不要雜亂背景"],
    description: "適合商品頁、蝦皮、FB／IG 宣傳用圖。",
  },
  brand: {
    label: "品牌形象圖",
    purpose: "品牌形象圖",
    subject: "溫暖手作甜點品牌的主視覺，整體呈現品牌感與生活美學",
    style: "極簡品牌風",
    mood: "親切舒服",
    composition: "左側主體＋右側留白",
    ratio: "16:9",
    enhancements: ["更有品牌感", "留白方便加字", "畫面乾淨", "高畫質細節"],
    avoids: ["不要浮水印", "不要雜亂背景", "不要多餘人物"],
    description: "適合品牌首頁、粉專視覺、活動主視覺。",
  },
  food: {
    label: "美食甜點圖",
    purpose: "美食甜點圖",
    subject: "剛出爐的金黃色蛋塔特寫，酥皮層次明顯，內餡光澤誘人",
    style: "商業廣告風",
    mood: "食慾感十足",
    composition: "特寫近景",
    ratio: "4:5",
    enhancements: ["主題清楚", "高畫質細節", "更適合商品宣傳", "畫面乾淨"],
    avoids: ["不要浮水印", "不要模糊", "不要色彩髒亂"],
    description: "適合餐飲、甜點、飲料店商品宣傳與社群貼文。",
  },
  wallpaper: {
    label: "夢幻美圖／桌布圖",
    purpose: "夢幻桌布圖",
    subject: "月光照亮的雪地森林與靜謐湖面，氛圍空靈安靜、唯美療癒",
    style: "夢幻唯美風",
    mood: "安靜治癒",
    composition: "沉浸式寬景構圖",
    ratio: "9:16",
    enhancements: ["更夢幻", "更療癒", "高畫質細節", "畫面乾淨"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印"],
    description: "適合桌布、療癒圖、免費圖片分享頁與社群下載。",
  },
  cover: {
    label: "封面圖／短影音縮圖",
    purpose: "封面／縮圖",
    subject: "AI 圖片工具教學主題封面，主體清楚，保留明顯留白可後續加大字標題",
    style: "高對比吸睛風",
    mood: "吸睛強烈",
    composition: "左側主體＋右側留白",
    ratio: "16:9",
    enhancements: ["更吸睛", "留白方便加字", "主題清楚", "高畫質細節"],
    avoids: ["不要浮水印", "不要過度曝光", "不要雜亂背景"],
    description: "適合 YouTube、Reels、教學封面與文章首圖。",
  },
  festival: {
    label: "節日賀圖",
    purpose: "節日賀圖",
    subject: "溫暖喜氣的新年祝福主視覺，帶有節慶裝飾與適合加上祝福文字的留白",
    style: "高級質感風",
    mood: "喜氣溫馨",
    composition: "賀卡式構圖",
    ratio: "4:5",
    enhancements: ["留白方便加字", "更有品牌感", "畫面乾淨", "高畫質細節"],
    avoids: ["不要浮水印", "不要雜亂背景"],
    description: "適合品牌節慶貼文、祝福圖與活動賀圖。",
  },
  mascot: {
    label: "角色／吉祥物圖",
    purpose: "角色／吉祥物圖",
    subject: "一個可愛、有記憶點的品牌吉祥物角色，親切活潑，適合後續延伸使用",
    style: "Q版可愛風",
    mood: "可愛療癒",
    composition: "單一主角清楚展示",
    ratio: "1:1",
    enhancements: ["更有品牌感", "主題清楚", "畫面乾淨", "高畫質細節"],
    avoids: ["不要浮水印", "不要複雜背景", "不要多餘人物"],
    description: "適合品牌角色、社群人物、貼圖前置角色設定。",
  },

  gufengBlueDessert: {
    label: "古風女神｜湖水藍下午茶＋迷你分身",
    purpose: "爆款互動圖",
    subject: "一位原創古風女神坐在湖水藍與銀白光的法式下午茶庭園中，正在沖咖啡與整理甜點，身邊有多個迷你分身，有的端茶、有的寫字、有的整理小甜點，畫面像創作者的夢幻工作世界",
    style: "古風仙氣風",
    mood: "仙氣夢幻",
    composition: "主角＋迷你分身圍繞構圖",
    ratio: "9:16",
    enhancements: ["電影級柔光", "景深", "高畫質細節", "真實陰影", "主角有記憶點"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要侵犯真人肖像", "不要畫面雜亂"],
    description: "適合社團發文、短影音封面與古風女神系列展示。",
  },
  gufengPinkTea: {
    label: "古風女神｜粉色櫻花茶會＋白貓",
    purpose: "社群貼文圖",
    subject: "一位原創古風女神坐在粉色櫻花盛開的下午茶庭園中，手持精緻茶杯，周圍有白貓、甜點、玫瑰與金色茶具，畫面浪漫華麗但乾淨",
    style: "古風仙氣風",
    mood: "浪漫甜美",
    composition: "主角置中＋場景細節圍繞",
    ratio: "9:16",
    enhancements: ["粉色柔光", "華麗細節", "高級甜點感", "社群吸睛", "主體清楚"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要過度網紅臉", "不要背景凌亂"],
    description: "適合粉色系古風女神、甜點店、花藝、美業示範。",
  },
  gufengCakeStudio: {
    label: "古風女神｜甜點店老闆娘＋迷你精靈",
    purpose: "商品宣傳圖",
    subject: "一位原創古風甜點店老闆娘在櫻花庭園的木桌前裝飾蛋糕，旁邊有迷你精靈分身協助端蛋糕、放草莓、整理馬卡龍，畫面有手作甜點的溫度與故事感",
    style: "古風仙氣風",
    mood: "溫暖柔和",
    composition: "人物半身＋桌面商品展示",
    ratio: "9:16",
    enhancements: ["自然陽光", "甜點細節清楚", "療癒故事感", "可愛迷你分身", "商品主體明確"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要商品變形", "不要臉部崩壞"],
    description: "適合甜點、蛋塔、烘焙、下午茶店家發文示範。",
  },
  gufengWhiteFox: {
    label: "古風女神｜白狐花房＋商品展示",
    purpose: "品牌形象圖",
    subject: "一位原創古風女神站在陽光灑落的花房裡，手上端著精緻甜點盤，周圍有多隻白狐坐在茶杯、花架與木桌旁，整體像仙氣花房品牌形象照",
    style: "古風仙氣風",
    mood: "仙氣夢幻",
    composition: "主角＋寵物圍繞構圖",
    ratio: "9:16",
    enhancements: ["柔霧逆光", "白色花房", "白狐療癒感", "品牌形象感", "細節豐富但不雜亂"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要動物變形", "不要恐怖感"],
    description: "適合寵物、花藝、甜點、療癒系品牌。",
  },
  gufengOfficeDolls: {
    label: "商業形象｜辦公女神＋多款迷你公仔",
    purpose: "品牌形象圖",
    subject: "一位原創商業風女性創作者坐在明亮辦公室桌前，穿著粉色西裝，桌上排列多個不同造型的迷你公仔分身，像展示多種模板、角色設計與品牌企劃成果",
    style: "韓系清新風",
    mood: "高級精緻",
    composition: "主角半身＋迷你角色展示",
    ratio: "16:9",
    enhancements: ["乾淨辦公室", "商業簡報感", "角色一致", "適合接案展示", "畫面明亮"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要真人肖像", "不要臉部不一致"],
    description: "適合接案服務、AI 模板、角色設計與粉專封面。",
  },
  gufengEggTartShop: {
    label: "店家宣傳｜蛋塔店老闆娘＋迷你店員",
    purpose: "商品宣傳圖",
    subject: "一位甜美蛋塔店老闆娘站在溫暖烘焙店裡，手拿剛出爐蛋塔烤盤，周圍有多個迷你店員分身，有的包裝、有的寫訂單、有的裝飾蛋糕，畫面像忙碌又可愛的店家宣傳照",
    style: "明亮商品攝影風",
    mood: "溫暖柔和",
    composition: "店家老闆娘＋商品＋迷你分身",
    ratio: "4:5",
    enhancements: ["剛出爐氛圍", "商品誘人", "店家故事感", "暖色光", "社群吸睛"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要商品變形", "不要過度雜亂"],
    description: "適合蛋塔、甜點、早餐店、烘焙小店促銷圖。",
  },
  gufengCreatorDesk: {
    label: "爆款｜古風創作者書桌＋迷你分身",
    purpose: "爆款互動圖",
    subject: "一位原創古風女神坐在櫻花庭園的書桌前創作，身邊圍繞多個迷你分身，有的寫字、有的畫圖、有的拿小道具，畫面像創作者的靈感世界",
    style: "古風仙氣風",
    mood: "仙氣夢幻",
    composition: "主角＋迷你分身圍繞構圖",
    ratio: "4:5",
    enhancements: ["故事感強", "留言感強", "短影音開場感", "高畫質細節", "畫面乾淨"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要侵犯真人肖像", "不要過度雜亂"],
    description: "適合社團互動圖，讓使用者想留言索取提示詞。",
  },
  gufengPetFlower: {
    label: "寵物療癒｜古風女神＋白貓花房",
    purpose: "寵物貼圖圖",
    subject: "一位原創古風女神在夢幻花房中與多隻白貓互動，白貓坐在花籃、茶杯與甜點盤旁，畫面溫柔療癒，適合寵物主題與可愛社群互動",
    style: "寵物療癒貼圖風",
    mood: "療癒可愛",
    composition: "主角＋多隻寵物圍繞",
    ratio: "4:5",
    enhancements: ["白貓可愛", "花房光影", "高級療癒感", "適合寵物主題", "乾淨構圖"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要寵物變形", "不要恐怖感"],
    description: "適合寵物、花藝、療癒互動圖。",
  },

  viralAncientMini: {
    label: "爆款｜古風女神＋迷你分身",
    purpose: "爆款互動圖",
    subject: "一位原創古風女神坐在櫻花庭園的書桌前創作，身邊圍繞多個迷你分身，有的寫字、有的畫圖、有的拿小道具，畫面像創作者的靈感世界",
    style: "古風仙氣風",
    mood: "仙氣夢幻",
    composition: "主角＋迷你分身圍繞",
    ratio: "4:5",
    enhancements: ["更有故事感", "留言感強", "主角有記憶點", "適合做短影音開場", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要侵犯真人肖像"],
    description: "適合用來吸引留言問提示詞的古風夢幻圖。",
  },
  viralFantasyGoddess: {
    label: "爆款｜奇幻女神角色圖",
    purpose: "AI 角色卡",
    subject: "一位原創奇幻女神站在月光與星河交會的場景中，長髮飄動、服裝華麗但不暴露，背景有魔法光暈、花瓣與發光粒子，人物氣質神秘高級",
    style: "奇幻遊戲角色風",
    mood: "神秘夢幻",
    composition: "人物置中＋背景故事場景",
    ratio: "4:5",
    enhancements: ["更夢幻", "華麗震撼", "主角有記憶點", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要使用名人或品牌元素"],
    description: "適合社團吸睛、角色設定、短影音封面。",
  },
  viralTarotCard: {
    label: "爆款｜命運塔羅牌卡",
    purpose: "情緒牌卡圖",
    subject: "一張原創命運塔羅牌卡設計，中央是溫柔神秘的女性角色，周圍有星光、月亮、花朵、金色邊框與夢幻符號，整體像可收藏的療癒牌卡",
    style: "塔羅牌卡風",
    mood: "命運神秘",
    composition: "牌卡式資訊構圖",
    ratio: "4:5",
    enhancements: ["更有故事感", "更適合社群分享", "留言感強", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要使用名人或品牌元素"],
    description: "適合做『你的命定能量』類互動圖。",
  },
  viralPetSticker: {
    label: "爆款｜寵物可愛貼圖",
    purpose: "寵物貼圖圖",
    subject: "一隻超可愛的棕色小狗做成多張表情貼圖，包含早安、開心、撒嬌、委屈、抱抱、加油的情緒表情，背景乾淨可愛，像社群留言會想收藏的寵物圖",
    style: "寵物療癒貼圖風",
    mood: "可愛到想留言",
    composition: "多張小圖拼貼預覽",
    ratio: "1:1",
    enhancements: ["更療癒", "留言感強", "可延伸成系列作品", "畫面乾淨"],
    avoids: ["不要浮水印", "不要 Logo", "不要低解析截圖感", "不要雜亂背景"],
    description: "適合吸寵物族群，後續可導到貼圖工具。",
  },
  viralPetMorning: {
    label: "爆款｜早安寵物貼圖組",
    purpose: "寵物貼圖圖",
    subject: "一組可愛小狗早安貼圖總表，粉色與奶油色背景，小狗戴圍巾或蝴蝶結，表情溫暖可愛，每一格都有不同早安互動動作，適合社群分享",
    style: "寵物療癒貼圖風",
    mood: "喜氣溫馨",
    composition: "多張小圖拼貼預覽",
    ratio: "1:1",
    enhancements: ["更適合社群分享", "留言感強", "可延伸成系列作品", "畫面乾淨"],
    avoids: ["不要浮水印", "不要 Logo", "不要模糊", "不要色彩髒亂"],
    description: "適合早安圖、長輩群組、寵物貼圖案例。",
  },
  viralCareerAvatar: {
    label: "爆款｜職業頭像名片卡",
    purpose: "AI 角色卡",
    subject: "一位原創職業女性角色的精緻頭像卡，背景有柔和花朵、星光與資訊卡片留白，適合放名字、職業、特色介紹，整體像高質感個人品牌卡",
    style: "韓系清新風",
    mood: "高級精緻",
    composition: "牌卡式資訊構圖",
    ratio: "4:5",
    enhancements: ["更有品牌感", "留白方便加字", "主角有記憶點", "高畫質細節"],
    avoids: ["不要侵犯真人肖像", "不要使用名人或品牌元素", "不要浮水印"],
    description: "適合測試『你的職業專屬 AI 形象卡』。",
  },
  viralQStickerSheet: {
    label: "爆款｜Q版貼圖成果展示",
    purpose: "角色／吉祥物圖",
    subject: "同一位原創 Q 版女生角色做成 4x4 貼圖總表，每格表情動作不同，包含打招呼、開心、加油、謝謝、抱歉、想你、晚安等日常互動，文字清楚可愛，方便展示提示詞成果",
    style: "Q版可愛風",
    mood: "可愛療癒",
    composition: "多張小圖拼貼預覽",
    ratio: "1:1",
    enhancements: ["主題清楚", "留言感強", "適合做提示詞案例展示", "畫面乾淨"],
    avoids: ["不要簡體中文", "不要亂字", "不要浮水印", "不要 Logo"],
    description: "適合展示 LINE 貼圖提示詞工具產出的成果。",
  },
  viralShopPoster: {
    label: "爆款｜店家促銷海報",
    purpose: "商品宣傳圖",
    subject: "甜點店或早餐店的原創可愛店長角色站在粉色店面前，旁邊有商品展示區、優惠留白與可愛裝飾，整體像社群會停下來看的店家宣傳圖",
    style: "商業廣告風",
    mood: "明亮乾淨",
    composition: "左側主體＋右側留白",
    ratio: "4:5",
    enhancements: ["更適合商品宣傳", "留白方便加字", "更有品牌感", "高畫質細節"],
    avoids: ["不要 Logo", "不要浮水印", "不要雜亂背景", "不要使用名人或品牌元素"],
    description: "適合推店家素材、促銷圖、接案案例。",
  },
  viralProductBeforeAfter: {
    label: "商品圖升級｜隨手拍變高質感",
    purpose: "商品宣傳圖",
    subject: "一份原本普通的甜點商品被整理成高級商業攝影感，金黃色甜點放在精緻盤子上，搭配大理石桌面、柔和自然光、淺景深與食慾感細節",
    style: "明亮商品攝影風",
    mood: "食慾感十足",
    composition: "商品升級展示構圖",
    ratio: "4:5",
    enhancements: ["更適合商品宣傳", "高畫質細節", "主題清楚", "留言感強"],
    avoids: ["不要模糊", "不要色彩髒亂", "不要雜亂背景", "不要浮水印"],
    description: "適合做隨手拍商品照升級、店家商品宣傳與接案案例展示。",
  },
  viralMiniWorld: {
    label: "爆款｜迷你世界創作圖",
    purpose: "故事感場景圖",
    subject: "一個原創角色坐在巨大書本、花朵與桌面道具之間，周圍有多個迷你小人一起工作、畫畫、搬素材，畫面像縮小版創作工作室，細節豐富但不雜亂",
    style: "迷你分身故事風",
    mood: "神秘夢幻",
    composition: "主角＋迷你分身圍繞",
    ratio: "4:5",
    enhancements: ["更有故事感", "可延伸成系列作品", "留言感強", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要多餘人物"],
    description: "適合做系列圖與短影音故事開頭。",
  },
  viralCouplePortrait: {
    label: "爆款｜浪漫人物寫真",
    purpose: "社群貼文圖",
    subject: "一位原創甜美女孩在花園光影中回眸，穿著柔色系服裝，背景有花朵、陽光與淺景深，整體浪漫乾淨，適合社群頭像與情緒貼文",
    style: "韓系清新風",
    mood: "浪漫甜美",
    composition: "半身構圖",
    ratio: "4:5",
    enhancements: ["更吸睛", "主角有記憶點", "更適合社群分享", "高畫質細節"],
    avoids: ["不要侵犯真人肖像", "不要使用名人或品牌元素", "不要浮水印", "不要怪異手部或肢體"],
    description: "適合吸引想做個人形象圖、頭像的人。",
  },
  viralCyberpunk: {
    label: "爆款｜賽博龐克角色",
    purpose: "AI 角色卡",
    subject: "一位原創未來感角色站在霓虹城市中，背景有紫藍光、電子螢幕、科技裝置與雨夜反光，人物姿態自信，適合遊戲角色與短影音封面",
    style: "賽博龐克風",
    mood: "華麗震撼",
    composition: "人物置中＋背景故事場景",
    ratio: "4:5",
    enhancements: ["更吸睛", "華麗震撼", "適合做短影音開場", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要使用名人或品牌元素"],
    description: "適合喜歡遊戲、科幻、酷炫風格的人。",
  },
  viralGameCharacter: {
    label: "爆款｜武俠／遊戲角色卡",
    purpose: "AI 角色卡",
    subject: "一位原創武俠角色站在山谷與火光之間，服裝有東方奇幻細節，氣勢強烈，背景有刀光、煙霧與電影級光影，像遊戲角色宣傳卡",
    style: "奇幻遊戲角色風",
    mood: "故事張力強",
    composition: "人物置中＋背景故事場景",
    ratio: "4:5",
    enhancements: ["更吸睛", "華麗震撼", "更有故事感", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要抄襲特定作品風格"],
    description: "適合做高張力角色示範圖。",
  },
  viralBookCover: {
    label: "爆款｜小說封面感",
    purpose: "封面／縮圖",
    subject: "一張原創浪漫小說封面感圖片，主角站在花海與光影中，背景有柔焦星光與情緒氛圍，畫面保留可加標題的空間，適合作為故事封面或社群封面",
    style: "夢幻唯美風",
    mood: "浪漫甜美",
    composition: "上方留白方便加字",
    ratio: "4:5",
    enhancements: ["留白方便加字", "更有故事感", "更適合社群分享", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要侵犯真人肖像"],
    description: "適合故事創作者、封面圖與短影音首圖。",
  },
  viralPhoneFrame: {
    label: "爆款｜手機框互動圖",
    purpose: "社群貼文圖",
    subject: "一位原創可愛角色從手機畫面裡伸出手，像突破螢幕與觀眾互動，背景乾淨明亮，手機畫面與角色有立體層次，適合社群吸睛貼文",
    style: "社團爆款互動風",
    mood: "高互動感",
    composition: "手機畫面框中框",
    ratio: "4:5",
    enhancements: ["更吸睛", "留言感強", "主角有記憶點", "高畫質細節"],
    avoids: ["不要 Logo", "不要浮水印", "不要文字", "不要怪異手部或肢體"],
    description: "適合做『人物跑出手機』的互動型圖片。",
  },
  viralVideoOpening: {
    label: "爆款｜短影音開場圖",
    purpose: "短影音起始圖",
    subject: "一張適合 3 秒停留的短影音開場圖，主角站在光影強烈的場景中央，前景有發光粒子，背景有明確故事場景，畫面保留上方或下方空間可加標題",
    style: "短影音開場風",
    mood: "短影音感",
    composition: "短影音第一秒停留構圖",
    ratio: "9:16",
    enhancements: ["更吸睛", "適合做短影音開場", "留白方便加字", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要雜亂背景"],
    description: "適合先做靜態圖，再接短影音提示詞。",
  },
  viralLifestyleReel: {
    label: "爆款｜生活感短影音圖",
    purpose: "短影音起始圖",
    subject: "一位原創人物在森林或窗邊的自然光中行走，陽光穿過樹葉，裙襬與髮絲被風吹動，畫面有生活感、治癒感與短影音截圖感",
    style: "電影感風格",
    mood: "清新自然",
    composition: "短影音第一秒停留構圖",
    ratio: "9:16",
    enhancements: ["更療癒", "適合做短影音開場", "更有故事感", "高畫質細節"],
    avoids: ["不要文字", "不要 Logo", "不要浮水印", "不要低解析截圖感"],
    description: "適合發自然光、療癒、Vlog 感的短影音開頭。",
  },
};

function CreatorSupportSection({ toolName = "這個免費工具" }: { toolName?: string }) {
  return (
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white">
              免費工具
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
              支持創作
            </span>
          </div>
          <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
            喜歡 {toolName} 嗎？
          </h2>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-700 sm:text-base">
            本站工具目前免費使用。如果這個工具有幫助到你，歡迎到 LINE STORE
            購買我的原創貼圖支持創作，或贊助一杯咖啡，讓我可以繼續更新更多免費工具與貼圖模板。
          </p>
          <p className="mt-2 text-xs font-bold leading-6 text-slate-500">
            不贊助也可以繼續免費使用，有幫助再支持就好。
          </p>
        </div>
        <div className="grid gap-3">
          <a
            href={LINE_STICKER_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow-lg"
            style={{ color: "#ffffff" }}
          >
            購買 LINE 貼圖支持
          </a>
          <a
            href={SUPPORT_TW_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-center text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-amber-600 hover:!text-white hover:shadow-lg"
            style={{ color: "#ffffff" }}
          >
            ☕ 贊助一杯咖啡
          </a>
          <a
            href={SUPPORT_KOFI_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:!text-white hover:shadow-lg"
            style={{ color: "#ffffff" }}
          >
            🌎 Ko-fi 海外支持
          </a>
        </div>
      </div>
    </section>
  );
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] rounded-xl border px-3 py-2 text-sm font-bold leading-5 transition-all ${
        active
          ? "border-violet-500 bg-violet-600 !text-white shadow shadow-violet-100"
          : "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow"
      }`}
    >
      {label}
    </button>
  );
}

export default function ImagePromptGenerator() {
  const [presetKey, setPresetKey] = useState<PresetKey>("businessDessertProduct");
  const [purpose, setPurpose] = useState(PRESETS.businessDessertProduct.purpose);
  const [subject, setSubject] = useState(PRESETS.businessDessertProduct.subject);
  const [style, setStyle] = useState(PRESETS.businessDessertProduct.style);
  const [mood, setMood] = useState(PRESETS.businessDessertProduct.mood);
  const [composition, setComposition] = useState(PRESETS.businessDessertProduct.composition);
  const [ratio, setRatio] = useState(PRESETS.businessDessertProduct.ratio);
  const [enhancements, setEnhancements] = useState<string[]>(
    PRESETS.businessDessertProduct.enhancements,
  );
  const [avoids, setAvoids] = useState<string[]>(PRESETS.businessDessertProduct.avoids);
  const [copied, setCopied] = useState(false);

  const applyPreset = (key: PresetKey) => {
    const preset = PRESETS[key];
    setPresetKey(key);
    setPurpose(preset.purpose);
    setSubject(preset.subject);
    setStyle(preset.style);
    setMood(preset.mood);
    setComposition(preset.composition);
    setRatio(preset.ratio);
    setEnhancements(preset.enhancements);
    setAvoids(preset.avoids);
  };

  const toggleValue = (
    value: string,
    current: string[],
    setter: (next: string[]) => void,
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }
    setter([...current, value]);
  };

  const resultPrompt = useMemo(() => {
    const presetLabel = PRESETS[presetKey].label;
    const enhancementText = enhancements.length
      ? `畫面需${enhancements.join("、")}。`
      : "";
    const avoidText = avoids.length ? `避免：${avoids.join("、")}。` : "";

    const isBusinessPreset = presetKey.startsWith("business");
    const businessNote = isBusinessPreset
      ? "\n\n商業用途重點：畫面要能用於小店商品宣傳、作品集示範、社群貼文或開發店家提案。請讓商品／服務主體一眼清楚，保留可後續加字的乾淨空間，避免看起來像未授權平台截圖。"
      : "";

    return `請生成一張${purpose}，主題分類為「${presetLabel}」，主要內容是「${subject}」。

整體風格為${style}，畫面氛圍${mood}，採用${composition}構圖，主體清楚、畫面乾淨，適合用於${purpose}。${enhancementText}

請輸出高畫質、細節清楚、整體美觀的圖片，比例為${ratio}。${avoidText}${businessNote}

商用安全提醒：不要出現真實品牌 Logo、不要使用名人肖像、不要浮水印、不要亂字、不要侵權元素。若為作品集示範，請不要放真實店名，避免誤導成實際合作案例。`;
  }, [
    presetKey,
    purpose,
    subject,
    style,
    mood,
    composition,
    ratio,
    enhancements,
    avoids,
  ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/tools/image-prompt"
      : "https://pomodoro-app-eight-rouge.vercel.app/tools/image-prompt";
  const shareTitle = "RxV AI 生圖提示詞產生器｜商業圖與社群美圖";
  const shareText =
    "不會寫生圖提示詞？用下拉選單快速產生商業商品圖、社群吸睛圖、爆款角色圖、短影音開場圖與桌布圖 Prompt。";
  const fullShareText = `${shareTitle}｜${shareText} ${pageUrl}`;

  const openShare = (type: "line" | "facebook" | "x") => {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedText = encodeURIComponent(`${shareTitle}｜${shareText}`);
    const shareUrl =
      type === "line"
        ? `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
        : type === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
          : `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`;

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <SEO
        title="AI 生圖提示詞產生器｜商業圖片、社群美圖、貼圖與短影音靈感"
        description="免費產生商品宣傳圖、品牌形象圖、社群吸睛圖、爆款互動圖、LINE 貼圖成果圖與短影音開場圖提示詞。"
        canonical="/tools/image-prompt"
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                立即開始操作
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                AI 生圖提示詞產生器
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                先選主題／職業類型，再調整用途、比例、風格與加強效果，右側會立即產生可複製的提示詞。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#prompt-workspace"
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-700 hover:!text-white"
              >
                開始選主題
              </a>
              <a
                href="#guide"
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-violet-200 bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
              >
                看說明與示範
              </a>
            </div>
          </div>
        </section>

        <section id="prompt-workspace" className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-900">選擇設定</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                先選主題再微調
              </span>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                先選主題／職業
              </span>
              <p className="mb-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
                先從這裡選想做的圖片類型。店家商品圖、外送平台圖、品牌包裝、作品集示範、社團吸睛圖、古風女神、寵物貼圖或短影音開場圖都可以直接選。
              </p>
              <select
                value={presetKey}
                onChange={(e) => applyPreset(e.target.value as PresetKey)}
                className="w-full min-h-[54px] rounded-2xl border border-violet-200 bg-white px-4 py-3.5 text-[15px] font-bold text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
              >
                <optgroup label="商業用｜店家商品圖與品牌圖">
                  {([
                    "businessDessertProduct",
                    "businessDrinkNewProduct",
                    "businessFoodDelivery",
                    "businessBeautyBrand",
                    "businessFlowerGift",
                    "businessPromoPoster",
                    "businessBeforeAfter",
                    "businessBrandSet",
                  ] as PresetKey[]).map((key) => (
                    <option key={key} value={key}>
                      {PRESETS[key].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="社團熱門｜古風女神多效果">
                  {([
                    "gufengBlueDessert",
                    "gufengPinkTea",
                    "gufengCakeStudio",
                    "gufengWhiteFox",
                    "gufengOfficeDolls",
                    "gufengEggTartShop",
                    "gufengCreatorDesk",
                    "gufengPetFlower",
                  ] as PresetKey[]).map((key) => (
                    <option key={key} value={key}>
                      {PRESETS[key].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🔥 多人留言爆款主題">
                  {([
                    "viralAncientMini",
                    "viralFantasyGoddess",
                    "viralTarotCard",
                    "viralPetSticker",
                    "viralPetMorning",
                    "viralCareerAvatar",
                    "viralQStickerSheet",
                    "viralShopPoster",
                    "viralProductBeforeAfter",
                    "viralMiniWorld",
                    "viralCouplePortrait",
                    "viralCyberpunk",
                    "viralGameCharacter",
                    "viralBookCover",
                    "viralPhoneFrame",
                    "viralVideoOpening",
                    "viralLifestyleReel",
                  ] as PresetKey[]).map((key) => (
                    <option key={key} value={key}>
                      {PRESETS[key].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="節慶活動｜賀圖與貼圖宣傳">
                  {([
                    "taiwanesePhrasePoster",
                    "festivalDragonBoatGreeting",
                    "festivalMidAutumnGreeting",
                    "festivalLunarNewYearGreeting",
                    "festivalChristmasGreeting",
                    "festivalValentineGreeting",
                    "festivalMothersDayGreeting",
                    "festivalFathersDayGreeting",
                    "festivalHalloweenGreeting",
                  ] as PresetKey[]).map((key) => (
                    <option key={key} value={key}>
                      {PRESETS[key].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="一般生圖主題">
                  {([
                    "social",
                    "product",
                    "brand",
                    "food",
                    "wallpaper",
                    "cover",
                    "festival",
                    "mascot",
                  ] as PresetKey[]).map((key) => (
                    <option key={key} value={key}>
                      {PRESETS[key].label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="mt-2 rounded-2xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-800">
                {PRESETS[presetKey].description}
              </p>
            </label>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  用途
                </span>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
                >
                  {PURPOSE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  比例
                </span>
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
                >
                  {RATIO_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                主體描述
              </span>
              <textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                rows={4}
                className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
                placeholder="例如：一杯珍珠奶茶放在木桌上，窗邊灑下晨光，畫面乾淨舒服。"
              />
            </label>

            <div className="mt-5 grid gap-5 lg:grid-cols-1 2xl:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  風格
                </span>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
                >
                  {STYLE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  氛圍
                </span>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
                >
                  {MOOD_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  構圖
                </span>
                <select
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-400"
                >
                  {COMPOSITION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-slate-800">
                加強效果（可多選）
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-2">
                {ENHANCEMENT_OPTIONS.map((item) => (
                  <ToggleChip
                    key={item}
                    label={item}
                    active={enhancements.includes(item)}
                    onClick={() =>
                      toggleValue(item, enhancements, setEnhancements)
                    }
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-slate-800">
                不要出現（可多選）
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-2">
                {AVOID_OPTIONS.map((item) => (
                  <ToggleChip
                    key={item}
                    label={item}
                    active={avoids.includes(item)}
                    onClick={() => toggleValue(item, avoids, setAvoids)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">產生結果</h2>
                <p className="mt-1 text-sm text-slate-500">
                  可直接複製到 AI 生圖工具使用
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-700 hover:!text-white hover:shadow-lg"
              >
                {copied ? "已複製提示詞" : "一鍵複製提示詞"}
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                  {PRESETS[presetKey].label}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  右側文字框已放大，方便直接閱讀與複製
                </span>
              </div>
              <textarea
                readOnly
                value={resultPrompt}
                rows={26}
                className="min-h-[580px] w-full resize-y min-h-[54px] rounded-2xl border border-slate-200 bg-white px-5 py-5 text-base leading-8 text-slate-900 outline-none"
              />
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="text-sm font-bold text-emerald-800">
                  這頁適合誰？
                </h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-emerald-900">
                  <li>• 一開始沒概念，不知道怎麼寫一般生圖提示詞的人</li>
                  <li>• 想做社群吸睛圖、商品圖、品牌圖、桌布圖的人</li>
                  <li>• 想先快速組提示詞，再拿去外部 AI 工具生圖的人</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <h3 className="text-sm font-bold text-sky-800">建議流程</h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-sky-900">
                  <li>① 先選主題分類</li>
                  <li>② 再微調主體、風格、氛圍、比例</li>
                  <li>③ 一鍵複製後貼到 ChatGPT、Gemini 或其他生圖工具</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4">
                <h3 className="text-sm font-bold text-fuchsia-800">
                  生圖不滿意怎麼辦？
                </h3>
                <p className="mt-2 text-sm leading-7 text-fuchsia-950">
                  如果第一次生成的圖片不夠理想，可以再提供一張你喜歡的參考圖給 AI
                  參考，並重新生成一次。這樣通常會更接近你想要的風格、角色、構圖或畫面氛圍。
                </p>
                <p className="mt-2 text-sm leading-7 text-fuchsia-950">
                  小技巧：保留原本提示詞，再搭配參考圖，並補充想加強的重點，例如色系、服裝、姿勢、背景或整體質感，生成效果通常會更穩定。
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-800">範例靈感</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  "社群吸睛圖：花朵／日常生活感",
                  "商業商品圖：甜點／飲料／熱炒／便當",
                  "外送平台圖：招牌菜／促銷主圖／菜單分類",
                  "封面縮圖：教學封面／工具封面",
                  "夢幻桌布圖：極光／雪景／星空",
                  "爆款互動圖：古風女神＋迷你分身",
                  "寵物貼圖圖：早安小狗／貓咪表情包",
                  "短影音開場圖：人物跑出手機／故事感光影",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-amber-100 bg-white p-3 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="guide" className="mt-10">
          <div className="mb-4">
            <p className="text-sm font-bold text-violet-700">說明與示範</p>
            <h2 className="text-2xl font-extrabold text-slate-900">下方是工具說明、服務介紹與使用建議</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              使用者進頁面可以先在上方操作；需要了解用途、模板包或商品圖升級服務時，再往下看。
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-sky-50 p-6 shadow-sm ring-1 ring-violet-100 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                AI IMAGE PROMPT TOOLS
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                AI 生圖提示詞產生器｜商業圖片、社群美圖、貼圖與短影音靈感
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                不只 LINE
                貼圖，這頁是一般圖片用的提示詞工具。你可以用下拉選單選擇用途、風格、氛圍、構圖與比例，快速組出可直接拿去外部
                AI 生圖工具使用的提示詞。這版已加入爆款互動圖、古風女神、迷你分身、寵物貼圖、角色卡、店家促銷與短影音開場圖主題。
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/tools/sticker-prompt"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold !text-white shadow transition hover:bg-blue-700 hover:!text-white"
                >
                  前往 LINE 貼圖提示詞
                </Link>
                <Link
                  to="/tools"
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow"
                >
                  回工具專區
                </Link>
                <Link
                  to="/portfolio/store-branding"
                  className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700 hover:!text-white hover:shadow"
                >
                  看商業作品集
                </Link>
                <a
                  href="https://ko-fi.com/ang2289"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-fuchsia-600 px-5 py-2.5 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-fuchsia-700 hover:!text-white hover:shadow"
                >
                  購買模板包
                </a>
              </div>
            </div>
            <div className="w-full rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
              <div className="grid gap-3">
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-xs font-bold text-violet-700">適合用途</p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">
                    商業商品圖、外送平台圖、品牌形象圖、社群吸睛圖、爆款互動圖、封面縮圖、短影音開場圖與桌布美圖。
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-700">使用方式</p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">
                    選擇主題與條件後，一鍵複製提示詞，再貼到 AI 生圖工具使用。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LineStickerAuthorCard compact />

        <CreatorSupportSection toolName="AI 生圖提示詞工具" />

        <section className="mt-8 overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-5 shadow-sm sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                商品圖升級服務
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                隨手拍商品照，也能升級成高質感商品圖
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                如果你不想自己慢慢試提示詞，也可以直接委託製作。適合甜點、早餐、飲料、花店、美甲、手作商品與小店社群宣傳，把普通商品照整理成更有品牌感、食慾感與購買感的圖片。
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  "商品主圖升級",
                  "社群宣傳圖",
                  "多平台尺寸輸出",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-orange-100 bg-white p-4 text-sm font-bold text-slate-800 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/services/product-image-upgrade"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700 hover:!text-white hover:shadow-lg"
                >
                  看商品圖升級方案
                </Link>
                <a
                  href="mailto:rxv0227@gmail.com?subject=商品圖升級服務詢問&body=您好，我想詢問商品圖升級服務。%0D%0A商品類型：%0D%0A用途：FB／IG／蝦皮／限動／其他%0D%0A想放的文字：%0D%0A預算範圍："
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-rose-700 hover:!text-white hover:shadow-lg"
                >
                  先用 Email 詢問
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold text-slate-900">適合這些情境</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <p className="rounded-2xl bg-orange-50 p-3">手機拍的商品照背景太亂，想整理成乾淨商品主圖。</p>
                <p className="rounded-2xl bg-rose-50 p-3">要發 FB／IG／Threads，但缺一張有質感的促銷圖。</p>
                <p className="rounded-2xl bg-amber-50 p-3">想把同一張商品圖輸出成蝦皮、IG、限動與網站尺寸。</p>
              </div>
            </div>
          </div>
        </section>


        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900">想看更多店家圖片升級示範？</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
              作品集可展示餐飲、甜點、飲料、美業、花店與手作品牌的商品圖、社群圖、包裝圖與品牌視覺示範。示範圖僅供風格參考，正式商用圖片請使用店家提供且有權利使用的素材。
            </p>
            <Link
              to="/portfolio/store-branding"
              className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700 hover:!text-white hover:shadow-lg"
            >
              前往作品集示範
            </Link>
          </div>

          <div className="rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900">想一次取得更多主題？</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
              完整模板包可整理更多店家類型、圖片用途、文案角度與商業提示詞，適合自己大量產生作品集、接案提案或社群宣傳素材。
            </p>
            <a
              href="https://ko-fi.com/ang2289"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-fuchsia-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-fuchsia-700 hover:!text-white hover:shadow-lg"
            >
              購買完整模板包
            </a>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold text-slate-900">商用與示範圖提醒</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
            本頁提示詞與示範圖可作為風格參考。正式商用圖片請使用自己擁有權利的商品照片、Logo 與品牌素材。請勿冒用他人店名、商標、名人肖像或平台截圖；作品集示範也應標明「非實際合作案例，僅供風格參考」。
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                AI CREATOR TOOLS
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
                PhotoRoom 圖片素材推薦工具
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
                產生提示詞後，可以先用 PhotoRoom
                製作貼紙角色、商品圖或品牌素材，再回到 RxV
                工具整理尺寸、壓縮圖片或做 LINE 貼圖打包。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a
                href="https://www.photoroom.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700 hover:!text-white hover:shadow-lg"
              >
                PhotoRoom 素材工具
              </a>
              <a
                href="https://www.photoroom.com/background-remover"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-center text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-700 hover:!text-white hover:shadow-lg"
              >
                PhotoRoom 去背工具
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            分享這個生圖提示詞工具
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
            覺得這個工具實用？可以分享給正在做社群圖片、商品圖、品牌圖或 AI
            生圖的朋友。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => openShare("line")}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow-lg"
            >
              LINE 分享
            </button>
            <button
              type="button"
              onClick={() => openShare("facebook")}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700 hover:!text-white hover:shadow-lg"
            >
              FB 分享
            </button>
            <button
              type="button"
              onClick={() => openShare("x")}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:!text-white hover:shadow-lg"
            >
              X 分享
            </button>
            <button
              type="button"
              onClick={copyShareText}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-teal-700 hover:!text-white hover:shadow-lg"
            >
              複製分享文
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
