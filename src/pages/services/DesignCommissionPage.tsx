import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Eye,
  Gift,
  Image,
  Mail,
  Maximize2,
  MessageCircle,
  Palette,
  PenTool,
  Printer,
  Send,
  ShieldCheck,
  Sparkles,
  Sticker,
  UploadCloud,
  X,
  ZoomIn,
} from "lucide-react";
import SEO from "@/components/SEO";

type Service = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  price: string;
  accent: string;
  icon: typeof Image;
  deliverables: string[];
  suitableFor: string;
};

type PortfolioItem = {
  id?: string;
  category: string;
  title: string;
  description: string;
  image: string;
  fit?: "cover" | "contain";
  businessType?: string;
  usageType?: string;
  badge?: string;
};

type PortfolioApiRow = {
  id?: string;
  title?: string | null;
  category?: string | null;
  business_type?: string | null;
  usage_type?: string | null;
  image_url?: string | null;
  description?: string | null;
};

const LINE_ID = "angelchen2289";
const LINE_URL = `https://line.me/ti/p/~${LINE_ID}`;

const PORTFOLIO_FILTERS = ["精選作品", "商品模特兒展示", "商品圖設計", "LINE 貼圖", "名片／品牌設計"] as const;
type PortfolioFilter = (typeof PORTFOLIO_FILTERS)[number];

function getPortfolioKey(item: PortfolioItem) {
  return String(item.id || item.image || `${item.category}-${item.title}`);
}

function isModelPortfolio(item: PortfolioItem) {
  return item.category.includes("模特") || item.title.includes("模特") || item.usageType?.includes("模特");
}

function isLineStickerPortfolio(item: PortfolioItem) {
  return item.category.toUpperCase().includes("LINE") || item.category.includes("貼圖");
}

function isBusinessCardPortfolio(item: PortfolioItem) {
  return item.category.includes("名片");
}

function isAiIndustryDemo(item: PortfolioItem) {
  return String(item.id || "").startsWith("ai-demo-");
}

function matchesPortfolioFilter(item: PortfolioItem, filter: PortfolioFilter) {
  if (filter === "精選作品") return true;
  if (filter === "商品模特兒展示") return isModelPortfolio(item);
  if (filter === "商品圖設計") return item.category.includes("商品圖") && !isModelPortfolio(item);
  if (filter === "LINE 貼圖") return isLineStickerPortfolio(item);
  return ["名片", "品牌", "包裝", "禮盒"].some((keyword) => item.category.includes(keyword));
}

function getPortfolioPriority(item: PortfolioItem) {
  if (isModelPortfolio(item)) return 0;
  if (isAiIndustryDemo(item)) return 1;
  if (item.category.includes("商品圖")) return 2;
  if (isLineStickerPortfolio(item)) return 3;
  if (["名片", "品牌", "包裝", "禮盒"].some((keyword) => item.category.includes(keyword))) return 4;
  return 5;
}

function getPortfolioAspect(item: PortfolioItem) {
  if (isModelPortfolio(item) || isAiIndustryDemo(item)) return "aspect-[4/5]";
  if (isLineStickerPortfolio(item)) return "aspect-square";
  return "aspect-[4/3]";
}

function getPortfolioObjectFit(item: PortfolioItem) {
  if (isModelPortfolio(item)) return "object-contain";
  return item.fit === "contain" ? "object-contain" : "object-cover";
}

function getPortfolioUsage(item: PortfolioItem) {
  if (item.usageType) return item.usageType;
  if (isModelPortfolio(item)) return "適合商品頁、社群貼文與廣告素材";
  if (item.category.includes("商品圖")) return "適合貼文、菜單與商品頁";
  if (isLineStickerPortfolio(item)) return "適合店家回覆與個人品牌經營";
  return "適合品牌介紹與實體宣傳素材";
}

const services: Service[] = [
  {
    id: "product-image",
    eyebrow: "蝦皮・官網・社群",
    title: "商品圖優化",
    summary: "將現有商品照片整理成更清楚、更有質感、適合電商與社群使用的商品圖片，不必重新安排攝影。",
    price: "單張體驗 NT$399",
    accent: "from-amber-500 to-orange-500",
    icon: Image,
    deliverables: ["背景、光線與構圖優化", "依用途製作合適尺寸", "高畫質 JPG／PNG", "含一次小幅修改"],
    suitableFor: "食品、甜點、保養品、生活用品、手作商品、團購與個人賣家",
  },
  {
    id: "model-product",
    eyebrow: "手持・穿戴・使用情境",
    title: "商品模特兒展示圖",
    summary: "使用清楚商品照片，製作模特兒手持、穿戴或使用商品的商業展示圖，讓顧客更容易理解尺寸與使用效果。",
    price: "3 張方案 NT$1,699",
    accent: "from-rose-500 to-pink-500",
    icon: Sparkles,
    deliverables: [
      "1 款商品＋1 位原創虛擬模特兒",
      "3 張不同構圖或使用情境",
      "依照片盡量保留商品外觀、顏色與比例",
      "高畫質 JPG／PNG 與一次小幅修改",
    ],
    suitableFor: "口罩、包包、服飾、飾品、保養品、杯具、生活用品與食品品牌",
  },
  {
    id: "line-sticker",
    eyebrow: "其他可委託服務",
    title: "LINE 貼圖客製",
    summary: "把店家常用回覆、職業情境或人物角色做成日常可使用的 LINE 貼圖。",
    price: "8 張限量價 NT$1,299",
    accent: "from-sky-500 to-cyan-500",
    icon: Sticker,
    deliverables: ["文字與情境規劃", "角色風格設計", "透明 PNG、主圖、標籤圖", "LINE 規格 ZIP 與上架教學"],
    suitableFor: "飲料店、甜點店、社區管理、美業、工作室與個人角色",
  },
  {
    id: "business-card",
    eyebrow: "其他可委託服務",
    title: "名片設計＋代印",
    summary: "從版型挑選、資料排版到印刷宅配一次處理。",
    price: "首波方案 NT$399 含宅配",
    accent: "from-emerald-500 to-teal-500",
    icon: Printer,
    deliverables: ["雙面名片排版", "Logo、照片與 QR Code 配置", "印前預覽與一次文字修改", "200 張雙面亮膜名片宅配"],
    suitableFor: "新開店、接案者、業務、美業、講師與小型工作室",
  },
  {
    id: "brand-design",
    eyebrow: "其他可委託服務",
    title: "個人品牌與包裝圖稿",
    summary: "把品牌的顏色、字體與常用素材整理成一致風格。",
    price: "依項目報價",
    accent: "from-violet-500 to-fuchsia-500",
    icon: Palette,
    deliverables: ["文字標／既有 Logo 整理", "品牌色與字體方向", "社群頭像、封面或貼文模板", "貼紙、吊牌、感謝卡、腰封或禮盒平面視覺"],
    suitableFor: "個人品牌、甜點禮盒、手作品牌、小店與初創工作室",
  },
];

const primaryServices = services.slice(0, 2);

const plans = [
  {
    title: "首張體驗",
    price: "NT$399",
    suffix: "／1張",
    description: "先從最需要改善的一張商品照片開始。",
    items: ["商品背景、光線與構圖優化", "高畫質 JPG／PNG", "含一次小幅修改"],
    href: "#product-image",
  },
  {
    title: "商品圖組合",
    price: "NT$999",
    suffix: "／3張",
    description: "同一款商品製作三張不同版面或使用情境。",
    items: ["適合蝦皮、官網與社群", "可規劃主圖、情境圖與細節圖", "含一次小幅修改"],
    href: "#product-image",
    featured: true,
  },
  {
    title: "模特兒展示",
    price: "NT$1,699",
    suffix: "／3張",
    description: "同一款商品搭配一位原創模特兒，製作三張展示圖。",
    items: ["手持、穿戴或使用情境", "成人或兒童模特兒可選", "下單前先評估商品保真難度"],
    href: "#model-product",
  },
];

const salesFaq = [
  ["會不會把商品畫得不像？", "正式製作前會先看商品正面、側面、細節與尺寸。可保留程度會先說明；Logo、透明材質、特殊花紋與精密結構需個別評估。"],
  ["圖片可以用在哪裡？", "可用於蝦皮、官網、Facebook、Instagram、LINE 圖文與一般數位宣傳；如需印刷或大型廣告，請先告知尺寸。"],
  ["可以免費試做嗎？", "不提供完整免費成品，但可以先免費判斷商品適合做商品主圖、生活情境或模特兒展示，確認方向後再下單。"],
  ["需要準備什麼？", "提供清楚原始商品照片、實際尺寸、希望使用的平台、喜歡的風格，以及不可更動的商品細節。"],
];

const portfolio: PortfolioItem[] = [
  {
    id: "model-serum-demo",
    category: "商品模特兒展示圖",
    title: "保養精華液手持展示",
    description: "以原創女模特兒自然手持精華液，呈現適合保養品牌商品頁與社群廣告的使用情境。",
    image: "/portfolio/design-commission/model/model-serum.webp",
    businessType: "保養品、美容品牌、個人賣家",
    usageType: "商品頁、社群貼文、廣告素材",
  },
  {
    id: "model-bag-demo",
    category: "商品模特兒展示圖",
    title: "精品包包穿搭展示",
    description: "將包包放入自然穿搭情境，清楚呈現背帶、包身比例與整體搭配效果。",
    image: "/portfolio/design-commission/model/model-bag.webp",
    businessType: "包包、服飾配件、選品店",
    usageType: "商品頁、社群貼文、品牌形象素材",
  },
  {
    id: "model-fragrance-demo",
    category: "商品模特兒展示圖",
    title: "香水噴霧使用情境展示",
    description: "以商品特寫搭配原創女模特兒自然使用香水噴霧，呈現柔和光影與高級生活氛圍，適合香氛品牌商品頁與社群廣告。",
    image: "/portfolio/design-commission/model/model-fragrance.webp",
    businessType: "香水、香氛噴霧、美妝與生活選品",
    usageType: "商品頁、品牌形象圖、社群貼文、廣告素材",
  },
  {
    id: "model-mask-male-navy-demo",
    category: "商品模特兒展示圖",
    title: "深藍立體口罩男模展示",
    description: "以俐落男模呈現立體口罩的輪廓、配戴比例與整體質感，適合成人口罩與生活用品宣傳。",
    image: "/portfolio/design-commission/model/model-mask-male-navy.webp",
    businessType: "成人口罩、防護用品、生活用品",
    usageType: "商品頁、型錄、社群廣告素材",
  },
  {
    id: "model-mask-child-dinosaur-demo",
    category: "商品模特兒展示圖",
    title: "原創恐龍圖案兒童口罩",
    description: "使用自行設計的幾何恐龍、葉片與星星圖案，不參考既有角色或品牌，呈現兒童口罩配戴效果。",
    image: "/portfolio/design-commission/model/model-mask-child-dinosaur.webp.webp",
    businessType: "兒童口罩、親子用品、童裝品牌",
    usageType: "商品頁、社群貼文、親子品牌素材",
  },
  {
    id: "model-mask-child-ocean-demo",
    category: "商品模特兒展示圖",
    title: "原創海洋圖案兒童口罩",
    description: "使用自行設計的海豚、貝殼、海龜與花朵圖案，呈現柔和清新的兒童商品情境。",
    image: "/portfolio/design-commission/model/model-mask-child-ocean.webp",
    businessType: "兒童口罩、親子用品、生活選品",
    usageType: "商品頁、社群貼文、品牌形象素材",
  },
  {
    id: "model-mask-toddler-duo-demo",
    category: "商品模特兒展示圖",
    title: "原創動物圖案幼兒雙人展示",
    description: "兩位幼兒配戴自行設計的長頸鹿、恐龍、象與植物圖案口罩，適合親子商品系列展示。",
    image: "/portfolio/design-commission/model/model-mask-toddler-duo.webp",
    businessType: "幼兒用品、親子品牌、兒童口罩",
    usageType: "系列商品頁、社群貼文、形象素材",
  },
  {
    id: "model-mask-pattern-collection-demo",
    category: "商品模特兒展示圖",
    title: "原創圖案口罩系列展示",
    description: "以原創花卉、海浪、童趣動物與恐龍圖案，示範成人與兒童口罩的不同風格方向。",
    image: "/portfolio/design-commission/model/model-mask-original-pattern-collection.webp",
    businessType: "口罩品牌、生活用品、親子選品",
    usageType: "系列型錄、品牌提案、社群廣告素材",
  },
  {
    id: "model-mask-female-demo",
    category: "商品模特兒展示圖",
    title: "成人口罩女模配戴展示",
    description: "以原創女模特兒呈現粉色口罩的自然配戴效果，適合女性客群與生活風格宣傳。",
    image: "/portfolio/design-commission/model/model-mask-female.webp",
    businessType: "口罩、防護用品、女性生活品牌",
    usageType: "商品頁、社群貼文、廣告素材",
  },
  {
    id: "model-headphones-demo",
    category: "商品模特兒展示圖",
    title: "耳罩式耳機佩戴展示",
    description: "以自然人物情境呈現耳機佩戴效果與尺寸比例，適合3C配件與生活風格品牌。",
    image: "/portfolio/design-commission/model/model-headphones.webp",
    businessType: "耳機、3C配件、生活風格品牌",
    usageType: "商品頁、社群貼文、品牌形象素材",
  },
  {
    id: "ai-demo-skincare-serum",
    category: "商品圖設計｜AI 概念示範",
    title: "保養美容｜精華液品牌形象圖",
    description: "以保養精華液為主角，示範高級光影、產品特寫與品牌視覺一致的商品情境圖做法。",
    image: "/portfolio/design-commission/ai-demo/serum-amber.png",
    fit: "contain",
    businessType: "保養品、美容品牌、個人賣家",
    usageType: "商品主圖、品牌形象圖、社群廣告素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-dessert-swiss-roll",
    category: "商品圖設計｜AI 概念示範",
    title: "食品甜點｜瑞士捲午後茶情境",
    description: "以完整甜點主體搭配餐桌氛圍，示範食品與甜點商品如何以溫暖生活感吸引下單。",
    image: "/portfolio/design-commission/ai-demo/dessert-swiss-roll.png",
    fit: "contain",
    businessType: "甜點店、蛋糕工作室、伴手禮品牌",
    usageType: "商品頁、預購貼文、社群宣傳素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-bag-fashion",
    category: "商品圖設計｜AI 概念示範",
    title: "包包配件｜精品手袋生活寫真",
    description: "以包包為核心結合咖啡日常與穿搭情境，示範配件商品如何呈現質感與使用畫面。",
    image: "/portfolio/design-commission/ai-demo/bag-lifestyle.png",
    fit: "contain",
    businessType: "包包、配件品牌、選品店",
    usageType: "商品頁、社群貼文、品牌形象素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-fragrance-lifestyle",
    category: "商品圖設計｜AI 概念示範",
    title: "香氛選物｜淡雅香氛情境廣告",
    description: "以香氛瓶主體搭配日光人物情境，示範香氛商品如何兼顧單品質感與生活氛圍呈現。",
    image: "/portfolio/design-commission/ai-demo/fragrance-lifestyle.png",
    fit: "contain",
    businessType: "香氛噴霧、室內香氛、選物品牌",
    usageType: "商品頁、社群貼文、品牌廣告素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-candle-home",
    category: "商品圖設計｜AI 概念示範",
    title: "香氛居家｜燭光氛圍示範",
    description: "以香氛蠟燭與居家情境示範放鬆氛圍，適合香氛與居家選物商品做品牌形象延伸。",
    image: "/portfolio/design-commission/ai-demo/candle-home.png",
    fit: "contain",
    businessType: "香氛品牌、居家選物、禮品品牌",
    usageType: "品牌形象圖、節慶宣傳、社群素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-kids-mask",
    category: "商品圖設計｜AI 概念示範",
    title: "親子兒童｜原創圖案口罩情境",
    description: "以原創圖案與親子風格畫面示範兒童用品展示方式，強調可愛、安全感與商品辨識度。",
    image: "/portfolio/design-commission/ai-demo/kids-mask.png",
    fit: "contain",
    businessType: "兒童用品、親子品牌、童裝選品",
    usageType: "商品頁、社群貼文、親子品牌素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-sunglasses-fashion",
    category: "商品圖設計｜AI 概念示範",
    title: "服飾配件｜太陽眼鏡雙景廣告",
    description: "以單品特寫加上生活情境，示範眼鏡與穿搭配件如何兼顧造型感與商品辨識度。",
    image: "/portfolio/design-commission/ai-demo/sunglasses-fashion.png",
    fit: "contain",
    businessType: "眼鏡、服飾配件、時尚選品",
    usageType: "商品頁、廣告橫幅、社群形象素材",
    badge: "AI 概念示範",
  },
  {
    id: "ai-demo-lipstick-beauty",
    category: "商品圖設計｜AI 概念示範",
    title: "彩妝美妝｜唇膏情境廣告圖",
    description: "示範彩妝商品如何透過主色調、產品近景與情境畫面，呈現更完整的美妝品牌感。",
    image: "/portfolio/design-commission/ai-demo/lipstick-beauty.png",
    fit: "contain",
    businessType: "彩妝品牌、美妝賣家、選品店",
    usageType: "商品主圖、活動貼文、社群廣告素材",
    badge: "AI 概念示範",
  },
  {
    category: "商品圖設計",
    title: "水果塔商品照前後優化",
    description: "改善光線、背景與擺盤，讓水果色澤更鮮明，適合用在貼文、菜單與商品頁。",
    image: "/portfolio/design-commission/selected/product-fruit-tart.webp",
  },
  {
    category: "商品圖設計",
    title: "芒果商品照情境優化",
    description: "保留原商品特色，重新安排光線與場景，讓畫面更乾淨、更有購買吸引力。",
    image: "/portfolio/design-commission/selected/product-mango.webp",
  },
  {
    category: "商品圖設計",
    title: "草莓蛋糕商品照優化",
    description: "用明亮背景與適當留白凸顯主體，可延伸成節慶預購或新品宣傳圖。",
    image: "/portfolio/design-commission/selected/product-cake.webp",
  },
  {
    id: "line-bento-shop",
    category: "LINE 貼圖",
    title: "便當店營業回覆貼圖",
    description: "接單、備餐、取餐、外送及完售通知，適合便當店、早餐店與餐飲外送使用。",
    image: "/portfolio/design-commission/line-sticker/line-bento-shop.webp",
    fit: "contain",
    businessType: "便當店、早餐店、餐飲外送",
    usageType: "接單、備餐、取餐、外送與完售通知",
  },
  {
    id: "line-live-commerce",
    category: "LINE 貼圖",
    title: "直播電商接單貼圖",
    description: "從直播預告、留言回覆、下單成功到補貨通知，協助賣家快速回覆客戶。",
    image: "/portfolio/design-commission/line-sticker/line-live-commerce.webp",
    fit: "contain",
    businessType: "直播主、電商賣家、社群團購",
    usageType: "直播預告、分享、下單、補貨與賣場導購",
  },
  {
    id: "line-small-farmer",
    category: "LINE 貼圖",
    title: "小農預購出貨貼圖",
    description: "包含採收、預購、匯款、裝箱、出貨及到貨通知，適合農產品與團購品牌。",
    image: "/portfolio/design-commission/line-sticker/line-small-farmer.webp",
    fit: "contain",
    businessType: "小農、農產品品牌、團購賣家",
    usageType: "預購、採收、匯款、裝箱、出貨與到貨通知",
  },
  {
    id: "line-beauty-care",
    category: "LINE 貼圖",
    title: "美容保養預約貼圖",
    description: "預約確認、保養提醒、服務進行及回訪關懷，適合美容、美甲與個人工作室。",
    image: "/portfolio/design-commission/line-sticker/line-beauty-care.webp",
    fit: "contain",
    businessType: "美容、美甲、美睫與個人工作室",
    usageType: "預約確認、保養提醒、服務進度與回訪關懷",
  },
  {
    id: "line-customer-service",
    category: "LINE 貼圖",
    title: "客服行政工作貼圖",
    description: "已收到、處理中、安排完成與通知相關人員，適合公司客服、行政及接案工作者。",
    image: "/portfolio/design-commission/line-sticker/line-customer-service.webp",
    fit: "contain",
    businessType: "公司客服、行政人員、接案工作者",
    usageType: "收到需求、處理進度、安排完成與工作通知",
  },
  {
    id: "line-teacher",
    category: "LINE 貼圖",
    title: "老師班級通知貼圖",
    description: "作業、聯絡簿、午餐、午休與放學提醒，適合老師、補教及班級群組。",
    image: "/portfolio/design-commission/line-sticker/line-teacher.webp",
    fit: "contain",
    businessType: "老師、補教老師、安親班與班級群組",
    usageType: "作業、聯絡簿、午餐、午休與放學提醒",
  },
  {
    id: "line-fitness-coach",
    category: "LINE 貼圖",
    title: "健身教練互動貼圖",
    description: "課程預約、訓練提醒、動作調整、補充水分及鼓勵學員，適合教練個人品牌。",
    image: "/portfolio/design-commission/line-sticker/line-fitness-coach.webp",
    fit: "contain",
    businessType: "健身教練、運動教室、個人品牌",
    usageType: "課程預約、訓練提醒、動作調整與學員鼓勵",
  },
  {
    id: "line-water-drop",
    category: "LINE 貼圖",
    title: "原創水滴日常貼圖",
    description: "可愛原創角色搭配日常問候、收到、鼓勵與關懷用語，適合個人及品牌角色經營。",
    image: "/portfolio/design-commission/line-sticker/line-water-drop.webp",
    fit: "contain",
    businessType: "個人角色、品牌吉祥物、社群經營",
    usageType: "日常問候、收到、鼓勵、關懷與熟客互動",
  },
  {
    id: "card-creative-gradient",
    category: "名片設計",
    title: "創意工作室漸層名片",
    description: "以紫藍漸層、清楚資訊層級與 QR Code 呈現現代數位品牌感，適合設計、科技與個人工作室。",
    image: "/portfolio/design-commission/business-card/card-creative-gradient.webp",
    fit: "contain",
    businessType: "設計工作室、科技服務、自由工作者",
    usageType: "品牌介紹、聯絡資訊、社群與作品集導流",
  },
  {
    id: "card-floral-studio",
    category: "名片設計",
    title: "花藝工作室柔美名片",
    description: "粉色花卉搭配柔和留白，完整配置服務資訊、社群帳號與 QR Code，適合花店與婚禮相關品牌。",
    image: "/portfolio/design-commission/business-card/card-floral-studio.webp",
    fit: "contain",
    businessType: "花店、花藝師、婚禮佈置與手作品牌",
    usageType: "門市介紹、預約聯絡、社群導流與隨貨小卡",
  },
  {
    id: "card-architecture",
    category: "名片設計",
    title: "建築房產質感名片",
    description: "黑金配色結合建築照片與俐落線條，營造穩重專業的高級形象。",
    image: "/portfolio/design-commission/business-card/card-architecture.webp",
    fit: "contain",
    businessType: "建築師、室內設計、房仲與工程顧問",
    usageType: "商務拜訪、客戶提案、專案聯絡與品牌形象",
  },
  {
    id: "card-seafood",
    category: "名片設計",
    title: "海鮮團購品牌名片",
    description: "以海洋藍、商品照片與服務圖示強化新鮮直送特色，適合水產、團購與冷凍食品品牌。",
    image: "/portfolio/design-commission/business-card/card-seafood.webp",
    fit: "contain",
    businessType: "海鮮水產、冷凍食品、團購與宅配店家",
    usageType: "商品介紹、訂購聯絡、冷鏈服務與社群導流",
  },
  {
    id: "card-bakery",
    category: "名片設計",
    title: "甜點烘焙品牌名片",
    description: "粉嫩甜點視覺搭配品項與服務圖示，適合預購甜點、蛋糕工作室與伴手禮品牌。",
    image: "/portfolio/design-commission/business-card/card-bakery.webp",
    fit: "contain",
    businessType: "甜點店、烘焙工作室、蛋糕與伴手禮品牌",
    usageType: "預購資訊、取貨方式、社群導流與品牌介紹",
  },
  {
    id: "card-cleaning",
    category: "名片設計",
    title: "清潔服務專業名片",
    description: "清爽藍白配色與服務項目圖示，讓居家、辦公室與冷氣清潔內容一目了然。",
    image: "/portfolio/design-commission/business-card/card-cleaning.webp",
    fit: "contain",
    businessType: "居家清潔、辦公室清潔、冷氣與消毒服務",
    usageType: "服務項目、預約聯絡、區域說明與 QR Code 導流",
  },
  {
    id: "card-pet-salon",
    category: "名片設計",
    title: "寵物美容工作室名片",
    description: "奶油色系搭配寵物照片與服務圖示，呈現溫暖、安心又容易親近的品牌感。",
    image: "/portfolio/design-commission/business-card/card-pet-salon.webp",
    fit: "contain",
    businessType: "寵物美容、寵物攝影、寄宿與用品店",
    usageType: "預約服務、項目介紹、聯絡資訊與熟客經營",
  },
  {
    id: "card-natural-spa",
    category: "名片設計",
    title: "自然療癒芳療名片",
    description: "以植栽、精油與自然綠色調營造放鬆質感，適合芳療、按摩與身心療癒服務。",
    image: "/portfolio/design-commission/business-card/card-natural-spa.webp",
    fit: "contain",
    businessType: "芳療師、按摩工作室、美容保養與身心療癒",
    usageType: "預約聯絡、療程介紹、品牌形象與社群導流",
  },
];

const brandScope = [
  { icon: PenTool, title: "基礎品牌視覺", text: "文字標、既有 Logo 整理、品牌色、字體與簡易使用方向。" },
  { icon: BriefcaseBusiness, title: "社群識別", text: "Facebook／IG 頭像、封面、貼文模板與活動主視覺。" },
  { icon: Gift, title: "隨貨與禮盒素材", text: "貼紙、吊牌、感謝卡、腰封、封套與禮盒外觀平面圖稿。" },
  { icon: Box, title: "印刷檔案協作", text: "依印刷廠提供的尺寸或刀模配置視覺；特殊加工與打樣另行確認。" },
];

const workflow = [
  ["01", "傳商品照片免費評估", "提供商品正面、側面、細節與尺寸，我會先判斷適合做商品圖、生活情境或模特兒展示。"],
  ["02", "確認方案與製作範圍", "確認用途、張數、需保留的商品細節、修改次數、費用與交期，支付 50% 訂金後開始。"],
  ["03", "提供浮水印預覽", "先確認整體方向，再依約定範圍完成一次小幅修改；若需重做不同方向會先另行報價。"],
  ["04", "付尾款並交付", "確認成品並付清尾款後，交付無浮水印高畫質 JPG／PNG 檔案。"],
];

function getStoredAuthToken() {
  if (typeof window === "undefined") return "";
  return String(localStorage.getItem("auth_token") || localStorage.getItem("token") || "").trim();
}

export default function DesignCommissionPage() {
  const [uploadedPortfolio, setUploadedPortfolio] = useState<PortfolioItem[]>([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [isPortfolioAdmin, setIsPortfolioAdmin] = useState(false);
  const [inquiry, setInquiry] = useState({
    name: "",
    contact: "",
    service: "首張商品圖體驗 NT$399",
    brand: "",
    usage: "",
    quantity: "",
    deadline: "",
    budget: "",
    details: "",
  });
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [lineMessage, setLineMessage] = useState("");
  const [selectedPortfolioFilter, setSelectedPortfolioFilter] = useState<PortfolioFilter>("精選作品");
  const [visiblePortfolioCount, setVisiblePortfolioCount] = useState(8);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isPortfolioImageFullscreen, setIsPortfolioImageFullscreen] = useState(false);

  useEffect(() => {
    let active = true;

    void fetch("/api/main?action=get-public-design-portfolio")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!active || !response.ok || !Array.isArray(data?.items)) return;
        const items = (data.items as PortfolioApiRow[])
          .filter((item) => Boolean(item.image_url))
          .map((item) => {
            const category = String(item.category || "設計作品");
            const shouldContain = category.toUpperCase().includes("LINE") || category.includes("貼圖") || category.includes("名片");
            return {
              id: String(item.id || item.image_url),
              category,
              title: String(item.title || "設計作品"),
              description: String(item.description || "依需求完成的視覺設計作品。"),
              image: String(item.image_url),
              fit: shouldContain ? ("contain" as const) : ("cover" as const),
              businessType: String(item.business_type || ""),
              usageType: String(item.usage_type || ""),
            };
          });
        setUploadedPortfolio(items);
      })
      .finally(() => {
        if (active) setIsPortfolioLoading(false);
      });

    const checkAdmin = () => {
      const token = getStoredAuthToken();
      if (!token) {
        if (active) setIsPortfolioAdmin(false);
        return;
      }
      void fetch("/api/main?action=get-design-portfolio-admin-status", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (active) setIsPortfolioAdmin(response.ok);
        })
        .catch(() => {
          if (active) setIsPortfolioAdmin(false);
        });
    };

    checkAdmin();
    window.addEventListener("auth-changed", checkAdmin);
    window.addEventListener("storage", checkAdmin);

    return () => {
      active = false;
      window.removeEventListener("auth-changed", checkAdmin);
      window.removeEventListener("storage", checkAdmin);
    };
  }, []);

  const portfolioItems = useMemo(() => {
    return [...uploadedPortfolio, ...portfolio]
      .map((item, index) => ({ item, index }))
      .sort((a, b) => getPortfolioPriority(a.item) - getPortfolioPriority(b.item) || a.index - b.index)
      .map(({ item }) => item);
  }, [uploadedPortfolio]);

  const featuredModelPortfolio = useMemo(
    () => portfolioItems.filter(isModelPortfolio).slice(0, 6),
    [portfolioItems],
  );

  const featuredAiIndustryPortfolio = useMemo(
    () => portfolioItems.filter(isAiIndustryDemo).slice(0, 8),
    [portfolioItems],
  );

  const featuredPortfolioKeys = useMemo(
    () => new Set(featuredModelPortfolio.map(getPortfolioKey)),
    [featuredModelPortfolio],
  );

  const filteredPortfolioItems = useMemo(() => {
    const matched = portfolioItems.filter((item) => matchesPortfolioFilter(item, selectedPortfolioFilter));
    if (selectedPortfolioFilter !== "精選作品" || featuredModelPortfolio.length === 0) return matched;
    return matched.filter((item) => !featuredPortfolioKeys.has(getPortfolioKey(item)));
  }, [featuredModelPortfolio.length, featuredPortfolioKeys, portfolioItems, selectedPortfolioFilter]);

  const visiblePortfolioItems = useMemo(
    () => filteredPortfolioItems.slice(0, visiblePortfolioCount),
    [filteredPortfolioItems, visiblePortfolioCount],
  );

  const changePortfolioFilter = (filter: PortfolioFilter) => {
    setSelectedPortfolioFilter(filter);
    setVisiblePortfolioCount(8);
  };

  const movePortfolioLightbox = (direction: -1 | 1) => {
    if (!selectedPortfolioItem || portfolioItems.length < 2) return;
    const currentIndex = portfolioItems.findIndex((item) => getPortfolioKey(item) === getPortfolioKey(selectedPortfolioItem));
    const nextIndex = (currentIndex + direction + portfolioItems.length) % portfolioItems.length;
    setSelectedPortfolioItem(portfolioItems[nextIndex]);
  };

  useEffect(() => {
    if (!selectedPortfolioItem) {
      setIsPortfolioImageFullscreen(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isPortfolioImageFullscreen) {
          setIsPortfolioImageFullscreen(false);
        } else {
          setSelectedPortfolioItem(null);
        }
      }
      if (event.key === "ArrowLeft") movePortfolioLightbox(-1);
      if (event.key === "ArrowRight") movePortfolioLightbox(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPortfolioImageFullscreen, selectedPortfolioItem, portfolioItems]);

  const inquiryText = useMemo(
    () =>
      [
        "您好，我想詢問商品圖製作。",
        "",
        `姓名／稱呼：${inquiry.name || "未填寫"}`,
        `聯絡方式：${inquiry.contact || "未填寫"}`,
        `想詢問的服務：${inquiry.service}`,
        `品牌／店家類型：${inquiry.brand || "未填寫"}`,
        `預計用途：${inquiry.usage || "未填寫"}`,
        `數量、尺寸或張數：${inquiry.quantity || "未填寫"}`,
        `希望完成時間：${inquiry.deadline || "未填寫"}`,
        `可接受預算：${inquiry.budget || "未填寫"}`,
        `其他需求：${inquiry.details || "無"}`,
      ].join("\n"),
    [inquiry],
  );

  const updateInquiry = (field: keyof typeof inquiry, value: string) => {
    setInquiry((current) => ({ ...current, [field]: value }));
    setInquiryMessage("");
  };

  const openGmailInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inquiry.name.trim() || !inquiry.contact.trim()) {
      setInquiryMessage("請先填寫稱呼與聯絡方式，方便後續回覆你。");
      return;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("rxv0227@gmail.com")}&su=${encodeURIComponent(`設計接案詢問｜${inquiry.service}｜${inquiry.name}`)}&body=${encodeURIComponent(inquiryText)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    setInquiryMessage("已開啟 Gmail，請確認內容後按下寄送。");
  };

  const copyInquiry = async () => {
    try {
      await navigator.clipboard.writeText(inquiryText);
      setInquiryMessage("需求內容已複製，可以直接貼到 LINE 或 Facebook 私訊。");
    } catch {
      setInquiryMessage("無法自動複製，請選取表單內容後再傳送。");
    }
  };

  const copyLineId = async () => {
    try {
      await navigator.clipboard.writeText(LINE_ID);
      setLineMessage(`LINE ID 已複製：${LINE_ID}`);
    } catch {
      setLineMessage(`請手動複製 LINE ID：${LINE_ID}`);
    }
  };

  return (
    <>
      <SEO
        title="商品圖優化與商品模特兒展示圖接案｜RxV 夢想創作工作室"
        description="使用現有商品照片製作蝦皮、官網與社群可用的商品圖及模特兒展示圖。公開方案 NT$399 起，可先傳商品照片免費評估製作方向。"
        canonical="/services/design-commission"
      />

      <main className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#fffaf2] pb-28 text-slate-900 md:pb-0">
        <section className="relative isolate w-full min-w-0 max-w-full overflow-hidden border-b border-orange-100 bg-gradient-to-br from-[#fffdf8] via-[#fff7e8] to-[#eefaff]">
          <div className="absolute inset-0 -z-10 opacity-80 [background:radial-gradient(circle_at_12%_15%,rgba(251,191,36,.16),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(56,189,248,.14),transparent_30%),radial-gradient(circle_at_70%_88%,rgba(244,114,182,.1),transparent_32%)]" />
          <div className="mx-auto grid w-full min-w-0 max-w-5xl gap-10 px-4 py-12 sm:px-8 sm:py-18 lg:px-10 lg:py-20">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold text-sky-800 shadow-sm">
                  <Sparkles className="h-4 w-4" /> 電商商品圖與模特兒展示接案
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-sm font-bold text-orange-800 shadow-sm">
                  <BadgeCheck className="h-4 w-4" /> 先傳商品照片，免費評估方向
                </span>
              </div>
              <h1 className="mt-6 max-w-4xl break-words text-[clamp(2.15rem,10vw,3rem)] font-black leading-[1.12] tracking-tight sm:text-6xl">
                商品有特色，照片卻不夠吸引人？
                <span className="block bg-gradient-to-r from-sky-600 via-teal-600 to-orange-500 bg-clip-text text-transparent">
                  用現有照片做成能上架的商品展示圖。
                </span>
              </h1>
              <p className="mt-6 max-w-3xl break-words text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                不必重新安排攝影棚或真人模特兒。提供清楚商品照片，即可製作適合蝦皮、官網、Facebook、Instagram 與 LINE 宣傳使用的商品圖。
              </p>
              <div className="mt-8 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#inquiry"
                  className="inline-flex min-h-[52px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl bg-orange-500 px-5 py-3 text-center font-black !text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-orange-400 sm:w-auto"
                >
                  <Mail className="h-5 w-5" /> 傳商品照片，免費評估
                </a>
                <a
                  href={LINE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[52px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl bg-[#06c755] px-5 py-3 text-center font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#05b84e] sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" /> 加 LINE 詢問
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex min-h-[52px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl border border-sky-200 bg-white px-5 py-3 text-center font-black !text-sky-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 sm:w-auto"
                >
                  先看作品 <ArrowRight className="h-5 w-5" />
                </a>
              </div>
              <div className="mt-4 flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-emerald-200 bg-white/90 p-4 text-sm shadow-sm sm:max-w-xl sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-words font-bold text-slate-700">
                  LINE ID：<span className="font-black text-emerald-700">{LINE_ID}</span>
                </p>
                <button
                  type="button"
                  onClick={copyLineId}
                  className="inline-flex min-h-[42px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 font-black text-emerald-800 transition hover:bg-emerald-100 sm:w-auto"
                >
                  <Copy className="h-4 w-4" /> 複製 LINE ID
                </button>
              </div>
              {lineMessage ? <p className="mt-2 text-sm font-bold text-emerald-800">{lineMessage}</p> : null}
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
              {plans.map((plan) => (
                <a
                  key={plan.title}
                  href={plan.href}
                  className={`group w-full min-w-0 rounded-3xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    plan.featured ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <p className={`text-sm font-black ${plan.featured ? "text-sky-800" : "text-orange-700"}`}>{plan.title}</p>
                  <p className="mt-3 text-3xl font-black text-slate-900">
                    {plan.price}<span className="ml-1 text-sm font-bold text-slate-500">{plan.suffix}</span>
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
                  <ChevronRight className="mt-4 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-600" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm font-black text-orange-700">目前主推服務</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">先把商品圖做好，再增加曝光。</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              先從一張最需要改善的商品照開始；確認成品方向適合，再擴充成商品頁組合或模特兒展示圖。
            </p>
          </div>

          <div className="mt-10 grid gap-5">
            {primaryServices.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  id={service.id}
                  key={service.id}
                  className="scroll-mt-24 w-full min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className={`h-2 bg-gradient-to-r ${service.accent}`} />
                  <div className="p-6 sm:p-8">
                    <div className="flex min-w-0 items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="break-words text-xs font-black tracking-[.16em] text-slate-500">{service.eyebrow}</p>
                        <h3 className="mt-2 text-2xl font-black">{service.title}</h3>
                      </div>
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${service.accent}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <p className="mt-4 leading-7 text-slate-600">{service.summary}</p>
                    <p className="mt-5 text-2xl font-black text-slate-950">{service.price}</p>
                    <ul className="mt-5 grid gap-2">
                      {service.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
                      <b className="text-slate-800">適合：</b>
                      {service.suitableFor}
                    </p>
                    {service.id === "model-product" ? (
                      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-7 text-rose-950">
                        <p className="font-black">下單前請提供商品正面、側面、細節照片與實際尺寸。</p>
                        <p className="mt-1">
                          包裝文字、Logo、透明材質、特殊花紋、精密結構或複雜穿戴方式，會先看照片確認製作方式；高難度商品將於開始前另外報價。
                        </p>
                        <p className="mt-2 font-bold">同款商品 3 張不同構圖或情境：NT$1,699。</p>
                        <p className="mt-2">需要圖案商品時，可使用客戶自有素材，或另行設計不參考既有角色、品牌與授權圖樣的原創圖案。</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-emerald-100 bg-emerald-50/70">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["先看照片再接案", "商品保真難度會先說明，不適合製作的商品不會勉強接單。"],
                ["價格與修改先說清楚", "確認張數、交付尺寸與一次小幅修改範圍後才開始製作。"],
                ["付尾款才交無浮水印檔", "先以浮水印預覽確認，成品確認後再交付高畫質檔案。"],
              ].map(([title, description]) => (
                <article key={title} className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
                  <ShieldCheck className="h-7 w-7 text-emerald-600" />
                  <h2 className="mt-4 text-lg font-black text-slate-900">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden border-y border-slate-200 bg-white">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <p className="text-sm font-black text-sky-700">精選接案作品</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">先看完成效果，再選擇適合的服務</h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  商品模特兒展示、商品圖設計、LINE 貼圖與品牌素材都集中在這裡。點擊任一作品，即可查看完整大圖與使用說明。
                </p>
              </div>
              {isPortfolioAdmin ? (
                <Link
                  to="/admin/portfolio-upload"
                  className="inline-flex min-h-[48px] w-fit max-w-full items-center justify-center gap-2 self-start rounded-2xl bg-orange-500 px-5 py-3 font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  <UploadCloud className="h-5 w-5" /> 新增作品
                </Link>
              ) : null}
            </div>

            {featuredModelPortfolio.length > 0 ? (
              <div className="mt-10 min-w-0">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-rose-700">主打服務</p>
                    <h3 className="mt-1 text-2xl font-black sm:text-3xl">商品模特兒展示圖</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">讓商品自然出現在手持、穿戴與生活使用情境中。</p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700">NT$799／張</span>
                </div>

                <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                  {featuredModelPortfolio.map((item) => (
                    <button
                      key={`featured-${getPortfolioKey(item)}`}
                      type="button"
                      onClick={() => setSelectedPortfolioItem(item)}
                      className="group w-full min-w-0 overflow-hidden rounded-[2rem] border border-rose-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
                    >
                      <div className="relative w-full min-w-0 overflow-hidden bg-[#f6f3ee] p-2 aspect-[4/5] sm:p-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="block h-full w-full max-w-full object-contain transition duration-500 group-hover:scale-[1.015]"
                        />
                        <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition group-hover:scale-105">
                          <ZoomIn className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="border-t border-rose-100 p-4 sm:p-5">
                        <p className="text-xs font-black tracking-[.1em] text-rose-700">商品模特兒展示</p>
                        <h4 className="mt-1 text-base font-black leading-6 text-slate-900 sm:text-lg">{item.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{getPortfolioUsage(item)}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex w-full min-w-0 flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-black text-emerald-950">想製作類似的商品展示圖？</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-800">傳商品正面、側面、細節照片與實際尺寸，即可先確認製作方式。</p>
                  </div>
                  <a
                    href={LINE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl bg-[#06c755] px-5 py-3 text-center font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#05b84e] sm:w-auto sm:shrink-0"
                  >
                    <MessageCircle className="h-5 w-5" /> LINE 傳商品照片
                  </a>
                </div>
              </div>
            ) : null}

            <div className="mt-12">
              <div className="-mx-1 flex max-w-full flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="作品分類">
                {PORTFOLIO_FILTERS.map((filter) => {
                  const active = selectedPortfolioFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={active}
                      onClick={() => changePortfolioFilter(filter)}
                      className={`!w-auto flex-none whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-black transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {selectedPortfolioFilter === "商品圖設計" ? (
                <div className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-amber-700">AI 商品情境圖｜各行業示範</p>
                      <h3 className="mt-1 break-words text-xl font-black leading-tight text-amber-950 sm:text-2xl">先看 8 類商品情境方向，再決定你想要的畫面風格</h3>
                      <p className="mt-2 break-words text-sm leading-6 text-amber-900">
                        這一區放的是 AI 概念示範作品，幫助客戶快速理解各行業商品圖能做成什麼樣子；正式製作仍會依你的商品照片、尺寸、色彩與用途重新設計。
                      </p>
                    </div>
                    <div className="inline-flex !w-auto max-w-max justify-self-start whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-black text-amber-700 shadow-sm sm:justify-self-end">精選 8 類</div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">
                    <b className="text-slate-900">展示說明：</b>
                    以上為 AI 概念示範作品，非實際客戶委託案例。特殊文字、Logo、透明材質與精密結構會先依照片評估，再確認是否需要另外報價。
                  </div>
                  {featuredAiIndustryPortfolio.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {featuredAiIndustryPortfolio.map((item) => (
                        <span key={`ai-chip-${getPortfolioKey(item)}`} className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-black text-amber-700">
                          {item.title.replace("｜", "・")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedPortfolioFilter === "LINE 貼圖" ? (
                <div className="mt-7 grid grid-cols-1 gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0" style={{ writingMode: "horizontal-tb" }}>
                    <p className="whitespace-normal text-sm font-black text-emerald-700">LINE 貼圖精選作品</p>
                    <h3 className="mt-1 whitespace-normal break-words text-xl font-black leading-tight text-emerald-950 sm:text-2xl">從日常角色到各行各業營業回覆</h3>
                    <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-emerald-800">依品牌、職業與常用情境規劃專屬貼圖；點擊作品可查看完整 16 格大圖。</p>
                  </div>
                  <div className="inline-flex !w-auto max-w-max justify-self-start whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm sm:justify-self-end">精選 8 組</div>
                </div>
              ) : null}

              {selectedPortfolioFilter === "名片／品牌設計" ? (
                <div className="mt-7 grid grid-cols-1 gap-4 rounded-3xl border border-violet-200 bg-violet-50 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0" style={{ writingMode: "horizontal-tb" }}>
                    <p className="whitespace-normal text-sm font-black text-violet-700">名片設計精選作品</p>
                    <h3 className="mt-1 whitespace-normal break-words text-xl font-black leading-tight text-violet-950 sm:text-2xl">從店家名片到專業服務品牌</h3>
                    <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-violet-800">依產業特色、品牌色與實際聯絡資料安排正反面版型；點擊作品可查看完整設計。</p>
                  </div>
                  <div className="inline-flex !w-auto max-w-max justify-self-start whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-black text-violet-700 shadow-sm sm:justify-self-end">精選 8 款</div>
                </div>
              ) : null}

              {visiblePortfolioItems.length > 0 ? (
                <div className={`mt-7 grid w-full min-w-0 grid-cols-1 gap-5 ${selectedPortfolioFilter === "LINE 貼圖" || selectedPortfolioFilter === "名片／品牌設計" || selectedPortfolioFilter === "商品圖設計" ? "sm:grid-cols-2 lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {visiblePortfolioItems.map((item) => (
                    <button
                      key={getPortfolioKey(item)}
                      type="button"
                      onClick={() => setSelectedPortfolioItem(item)}
                      className="group w-full min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-[#fffaf2] text-left shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
                    >
                      <div className={`relative w-full min-w-0 overflow-hidden bg-[#f8f5ef] ${getPortfolioAspect(item)} ${isLineStickerPortfolio(item) || isBusinessCardPortfolio(item) || isAiIndustryDemo(item) ? "p-2 sm:p-3" : ""}`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="block h-full w-full max-w-full transition duration-500 group-hover:scale-[1.015]"
                          style={{
                            objectFit: isModelPortfolio(item) || isAiIndustryDemo(item) || item.fit === "contain" ? "contain" : "cover",
                            objectPosition: "center",
                          }}
                        />
                        <div className="absolute inset-0 grid place-items-center bg-slate-950/0 transition group-hover:bg-slate-950/35">
                          <span className="inline-flex translate-y-2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-black text-slate-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
                            <Eye className="h-4 w-4" /> 查看大圖
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        {item.badge ? (
                          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-700">{item.badge}</span>
                        ) : null}
                        <p className={`text-xs font-black tracking-[.12em] text-orange-700 ${item.badge ? "mt-3" : ""}`}>{item.category}</p>
                        <h3 className="mt-2 text-lg font-black">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{getPortfolioUsage(item)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <Image className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-4 font-black text-slate-700">這個分類目前尚無其他作品</p>
                  <p className="mt-2 text-sm text-slate-500">可先加 LINE 說明需求，我會提供適合的作品方向。</p>
                </div>
              )}

              {visiblePortfolioCount < filteredPortfolioItems.length ? (
                <div className="mt-7 text-center">
                  <button
                    type="button"
                    onClick={() => setVisiblePortfolioCount((count) => count + 6)}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-50"
                  >
                    顯示更多作品 <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>

            {isPortfolioLoading ? (
              <p className="mt-5 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
                正在載入更多作品…
              </p>
            ) : null}

            <div className="mt-10 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={LINE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl bg-[#06c755] px-5 py-3 text-center font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#05b84e] sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" /> 傳商品照片詢問模特兒圖
              </a>
              <a
                href="https://store.line.me/stickershop/author/5530587/zh-Hant"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl border border-[#06c755] bg-white px-5 py-3 text-center font-black !text-[#049743] transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto"
              >
                查看 LINE STORE 作品 <ArrowRight className="h-5 w-5" />
              </a>
              <Link
                to="/tools/business-card-order"
                className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-2xl border border-slate-300 bg-white px-5 py-3 text-center font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-500 sm:w-auto"
              >
                查看名片版型 <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm font-black text-violet-700">其他可委託項目</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">需要時再延伸到貼圖、名片與品牌素材</h2>
            <p className="mt-4 leading-8 text-slate-600">
              從品牌色、字體與文字標開始，再延伸到社群圖片、貼紙、感謝卡與禮盒外觀，讓不同素材看起來像同一個品牌。
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {brandScope.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="w-full min-w-0 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-emerald-950">
                <ShieldCheck className="h-5 w-5" /> 常見設計項目
              </h3>
              <p className="mt-3 text-sm leading-7 text-emerald-900">
                禮盒封面、腰封、貼紙、吊牌、感謝卡、產品小卡，以及印刷廠已提供尺寸或刀模的平面視覺配置。
              </p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-amber-950">
                <CircleDollarSign className="h-5 w-5" /> 進階需求
              </h3>
              <p className="mt-3 text-sm leading-7 text-amber-900">
                如果需要全新盒型結構、刀模工程、品牌命名、商標註冊或特殊印刷，可先說明需求，再確認是否能承接與提供報價。
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-sky-700">下單前常見問題</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">先把你最擔心的事情說清楚</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {salesFaq.map(([question, answer]) => (
              <article key={question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-black text-slate-900">{question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-orange-100 bg-[#fff4df]">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="min-w-0 max-w-3xl">
              <p className="text-sm font-black text-orange-700">商品圖公開方案</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">選擇適合你的方案</h2>
              <p className="mt-4 leading-8 text-slate-600">先選最接近的方案；傳商品照片後會確認保真難度、交付尺寸與完整費用，不會在製作後才臨時加價。</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {plans.map((plan) => (
                <a
                  key={plan.title}
                  href={plan.href}
                  className={`w-full min-w-0 rounded-3xl border p-6 transition hover:-translate-y-1 ${
                    plan.featured
                      ? "border-sky-300 bg-sky-50 text-slate-900 shadow-md"
                      : "border-orange-100 bg-white text-slate-900 shadow-sm hover:border-orange-300"
                  }`}
                >
                  <p className={`text-sm font-black ${plan.featured ? "text-sky-800" : "text-orange-700"}`}>{plan.title}</p>
                  <p className="mt-4 text-3xl font-black">
                    {plan.price}
                    {plan.suffix ? <span className="ml-1 text-sm font-bold opacity-70">{plan.suffix}</span> : null}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {plan.description}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm font-bold">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-orange-200 bg-white px-5 py-4 text-sm leading-7 text-slate-600">
              <b className="text-slate-900">付款方式：</b>
              可先免費評估製作方向，但不提供完整免費試做。確認需求與報價後支付 50% 訂金；預覽確認並付清尾款後，交付無浮水印高畫質檔案。
            </div>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-10">
            <div>
              <p className="text-sm font-black text-emerald-700">合作方式</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">合作流程</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {workflow.map(([number, title, text]) => (
                  <article key={number} className="w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-black text-orange-600">{number}</p>
                    <h3 className="mt-2 text-lg font-black">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-rose-50 to-violet-50 p-7 text-slate-900 shadow-sm sm:p-8">
              <Clock3 className="h-9 w-9 text-orange-600" />
              <h2 className="mt-5 text-3xl font-black">詢價前準備這些，會更快得到報價</h2>
              <ul className="mt-6 grid gap-3 text-sm font-bold leading-6 sm:grid-cols-2">
                {["想做哪一項服務", "品牌／店家類型", "預計使用在哪裡", "數量、尺寸或張數", "希望完成時間", "參考風格與可接受預算"].map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 text-slate-700 shadow-sm">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" /> {item}
                  </li>
                ))}
              </ul>
              <a
                href="#inquiry"
                className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                <Mail className="h-5 w-5" /> 填寫接案詢問
              </a>
              <a
                href={LINE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#06c755] px-5 py-3 font-black !text-white transition hover:bg-[#05b84e]"
              >
                <MessageCircle className="h-5 w-5" /> LINE 詢問：{LINE_ID}
              </a>
              <button
                type="button"
                onClick={copyLineId}
                className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 font-black text-emerald-800 transition hover:bg-emerald-50"
              >
                <Copy className="h-4 w-4" /> 複製 LINE ID
              </button>
              <a
                href="https://www.facebook.com/profile.php?id=61588964893446"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white px-5 py-3 font-black !text-sky-800 transition hover:bg-sky-50"
              >
                <MessageCircle className="h-5 w-5" /> 到 Facebook 私訊
              </a>
            </aside>
          </div>
        </section>

        <section id="inquiry" className="scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden bg-orange-50">
          <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-14 sm:px-8 lg:py-20">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-orange-700 shadow-sm">
                <Sparkles className="h-4 w-4" /> 先傳商品照片，不必先下單
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">傳一張商品照片，先免費評估適合的呈現方式。</h2>
              <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-600">
                我會先判斷適合做商品主圖、生活情境或模特兒展示，並說明需要補哪些照片與可能的保真限制。
              </p>
            </div>

            <form
              onSubmit={openGmailInquiry}
              className="mx-auto mt-10 w-full min-w-0 max-w-4xl rounded-[2rem] border border-orange-200 bg-white p-5 text-left shadow-sm sm:p-8"
            >
              <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">姓名或稱呼 *</span>
                  <input
                    required
                    value={inquiry.name}
                    onChange={(event) => updateInquiry("name", event.target.value)}
                    placeholder="例如：林小姐"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">方便聯絡你的方式 *</span>
                  <input
                    required
                    value={inquiry.contact}
                    onChange={(event) => updateInquiry("contact", event.target.value)}
                    placeholder="Email、LINE ID 或 Facebook 名稱"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">想詢問的服務</span>
                  <select
                    value={inquiry.service}
                    onChange={(event) => updateInquiry("service", event.target.value)}
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    <option>首張商品圖體驗 NT$399</option>
                    <option>3 張商品圖組合 NT$999</option>
                    <option>3 張模特兒展示 NT$1,699</option>
                    <option>還不確定，想先評估</option>
                    <option>其他設計服務</option>
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">品牌／店家類型</span>
                  <input
                    value={inquiry.brand}
                    onChange={(event) => updateInquiry("brand", event.target.value)}
                    placeholder="例如：童裝賣家、甜點工作室、保養品牌"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">預計使用在哪裡</span>
                  <input
                    value={inquiry.usage}
                    onChange={(event) => updateInquiry("usage", event.target.value)}
                    placeholder="例如：蝦皮主圖、商品頁、FB／IG 貼文"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">數量、尺寸或張數</span>
                  <input
                    value={inquiry.quantity}
                    onChange={(event) => updateInquiry("quantity", event.target.value)}
                    placeholder="例如：商品圖 3 張、模特兒展示 3 張"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">希望完成時間</span>
                  <input
                    value={inquiry.deadline}
                    onChange={(event) => updateInquiry("deadline", event.target.value)}
                    placeholder="例如：8 月底前"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block font-bold text-slate-800">可接受預算</span>
                  <input
                    value={inquiry.budget}
                    onChange={(event) => updateInquiry("budget", event.target.value)}
                    placeholder="例如：NT$1,000～2,000"
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>

              <label className="mt-5 block min-w-0">
                <span className="mb-2 block font-bold text-slate-800">其他需求或參考風格</span>
                <textarea
                  rows={5}
                  value={inquiry.details}
                  onChange={(event) => updateInquiry("details", event.target.value)}
                  placeholder="請說明商品名稱、目前圖片的問題、不可更動的細節，以及喜歡的風格；也可以貼上商品頁網址。"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              {inquiryMessage ? (
                <p role="status" className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                  {inquiryMessage}
                </p>
              ) : null}

              <div className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="submit"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  <Send className="h-5 w-5" /> 開啟 Gmail 寄出
                </button>
                <button
                  type="button"
                  onClick={copyInquiry}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 transition hover:border-slate-500 hover:bg-slate-50"
                >
                  <Copy className="h-5 w-5" /> 複製需求內容
                </button>
                <a
                  href={LINE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#06c755] px-5 py-3 font-black !text-white transition hover:bg-[#05b84e]"
                >
                  <MessageCircle className="h-5 w-5" /> 開啟 LINE
                </a>
              </div>
              <p className="mt-4 text-center text-sm leading-6 text-slate-500">
                LINE ID：{LINE_ID}。可先複製需求內容，再貼到 LINE 或 Facebook 私訊；Gmail 也會自動帶入收件人與需求。
              </p>
              <a
                href="https://www.facebook.com/profile.php?id=61588964893446"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 font-black !text-sky-800 transition hover:bg-sky-100"
              >
                <MessageCircle className="h-5 w-5" /> 複製內容後到 Facebook 私訊
              </a>
            </form>
          </div>
        </section>
      </main>

      {selectedPortfolioItem ? (
        isPortfolioImageFullscreen ? (
          <div
            className="fixed inset-0 z-[110] flex w-full min-w-0 items-center justify-center overflow-hidden bg-slate-950/95 p-2 backdrop-blur-sm sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPortfolioItem.title}全螢幕預覽`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsPortfolioImageFullscreen(false);
            }}
          >
            <button
              type="button"
              aria-label="返回作品說明"
              onClick={() => setIsPortfolioImageFullscreen(false)}
              className="absolute right-3 top-3 z-30 grid h-12 w-12 place-items-center rounded-full bg-white/95 text-slate-900 shadow-xl transition hover:scale-105 sm:right-6 sm:top-6"
            >
              <X className="h-6 w-6" />
            </button>

            <img
              src={selectedPortfolioItem.image}
              alt={selectedPortfolioItem.title}
              className="block h-auto max-h-[calc(100dvh-1rem)] w-auto max-w-[calc(100vw-1rem)] object-contain"
            />

            {portfolioItems.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="上一張作品"
                  onClick={() => movePortfolioLightbox(-1)}
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-xl transition hover:scale-105 sm:left-6"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  aria-label="下一張作品"
                  onClick={() => movePortfolioLightbox(1)}
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-xl transition hover:scale-105 sm:right-6"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            ) : null}

            <div className="pointer-events-none absolute bottom-3 left-1/2 max-w-[82vw] -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-center text-sm font-bold text-white backdrop-blur-sm sm:bottom-5">
              {selectedPortfolioItem.title}｜按 Esc 返回作品說明
            </div>
          </div>
        ) : (
          <div
            className="fixed inset-0 z-[100] flex w-full min-w-0 items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-950/85 p-2 backdrop-blur-sm sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPortfolioItem.title}大圖預覽`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedPortfolioItem(null);
            }}
          >
            <div
              key={getPortfolioKey(selectedPortfolioItem)}
              className="relative my-auto max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] min-w-0 max-w-[1400px] overflow-y-auto overflow-x-hidden rounded-[1.5rem] bg-white shadow-2xl sm:max-h-[96vh] sm:w-[96vw] sm:rounded-[2rem]"
            >
              <button
                type="button"
                aria-label="關閉大圖"
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:scale-105 hover:bg-white sm:right-5 sm:top-5"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative flex min-h-[42vh] w-full min-w-0 items-center justify-center overflow-hidden bg-[#eef2f6] p-2 sm:min-h-[72vh] sm:p-4">
                <button
                  type="button"
                  onClick={() => setIsPortfolioImageFullscreen(true)}
                  className="group flex h-full w-full min-w-0 items-center justify-center"
                  aria-label="全螢幕查看作品"
                >
                  <img
                    src={selectedPortfolioItem.image}
                    alt={selectedPortfolioItem.title}
                    className="block h-auto max-h-[68dvh] w-auto max-w-full object-contain transition duration-300 group-hover:scale-[1.01] sm:max-h-[80vh]"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPortfolioImageFullscreen(true)}
                  className="absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/75 px-4 py-2.5 text-sm font-black text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-950 sm:bottom-5"
                >
                  <Maximize2 className="h-4 w-4" /> 全螢幕查看
                </button>

                {portfolioItems.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="上一張作品"
                      onClick={() => movePortfolioLightbox(-1)}
                      className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105 sm:left-5"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      aria-label="下一張作品"
                      onClick={() => movePortfolioLightbox(1)}
                      className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105 sm:right-5"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="border-t border-slate-200 p-5 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    {selectedPortfolioItem.badge ? (
                      <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">{selectedPortfolioItem.badge}</span>
                    ) : null}
                    <p className={`text-xs font-black tracking-[.14em] text-orange-700 ${selectedPortfolioItem.badge ? "mt-3" : ""}`}>{selectedPortfolioItem.category}</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{selectedPortfolioItem.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{selectedPortfolioItem.description}</p>
                  </div>
                  <a
                    href={LINE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[50px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#06c755] px-5 py-3 font-black !text-white transition hover:bg-[#05b84e] lg:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" /> 加 LINE 詢問
                  </a>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <b className="block text-slate-900">適合</b>
                    <span>{selectedPortfolioItem.businessType || "品牌、店家與個人賣家"}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <b className="block text-slate-900">用途</b>
                    <span>{selectedPortfolioItem.usageType || getPortfolioUsage(selectedPortfolioItem)}</span>
                  </div>
                </div>

                {isModelPortfolio(selectedPortfolioItem) ? (
                  <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
                    概念示範作品。正式製作會依客戶提供的商品照片、外觀、顏色與實際尺寸進行；圖案素材使用客戶自有內容或原創設計，不仿製既有角色與品牌圖樣。
                  </p>
                ) : null}

                {isAiIndustryDemo(selectedPortfolioItem) ? (
                  <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    以上為 AI 概念示範作品，主要用來展示各行業商品圖能呈現的方向。正式製作會依客戶提供的商品照片、尺寸、色彩與使用需求重新設計；特殊文字、Logo、透明材質與精密結構需先評估。
                  </p>
                ) : null}

                {isLineStickerPortfolio(selectedPortfolioItem) ? (
                  <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                    概念示範作品。正式製作會依客戶的角色設定、品牌色、職業特色與指定文字重新設計，不直接套用示範角色。
                  </p>
                ) : null}

                {isBusinessCardPortfolio(selectedPortfolioItem) ? (
                  <p className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-900">
                    版型示範作品。正式製作會依店名、Logo、品牌色、服務項目、聯絡資訊與 QR Code 重新排版；示範資料不會直接套用。
                  </p>
                ) : null}

                <p className="mt-4 text-center text-xs font-bold text-slate-500 sm:text-left">LINE ID：{LINE_ID}</p>
              </div>
            </div>
          </div>
        )
      ) : null}
    </>
  );
}
