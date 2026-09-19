import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import SEO from "@/components/SEO";

type ServiceType = "layout" | "print";
type PrintSide = "single" | "double";
type Quantity = 200 | 300 | 500 | 1000 | 2000 | 3000 | 5000;
type Finish = "gloss" | "matte";

type StyleCard = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  accent: string;
  image: string;
  code: string;
};

type OrderForm = {
  service: ServiceType;
  side: PrintSide;
  quantity: Quantity;
  finish: Finish;
  styleId: string;
  needQr: boolean;
  qrLink: string;
  brandName: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  lineId: string;
  email: string;
  website: string;
  services: string;
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  note: string;
  digitalCardOptIn: boolean;
  agree: boolean;
};

const DRAFT_KEY = "rxv_manual_business_card_order_draft_v1";
const BUSINESS_CARD_MAX_FILE_BYTES = 3 * 1024 * 1024;
const BUSINESS_CARD_MAX_FILES = 6;
const BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT = 349;
const BUSINESS_CARD_BRAND_WEBSITE_GIFT_MONTHS = 3;

/**
 * 首波體驗活動。
 * 活動結束時，前後端都要把 enabled 改為 false 後一起部署，避免客戶頁面與實際匯款金額不一致。
 * 不使用資料庫新欄位：訂單仍只儲存活動後的名片費與運費，付款頁會直接讀到正確總額。
 */
const BUSINESS_CARD_FIRST_WAVE_PROMO = {
  enabled: true,
  service: "layout" as ServiceType,
  side: "double" as PrintSide,
  finish: "gloss" as Finish,
  quantity: 200 as Quantity,
  itemDiscountNtd: 50,
  shippingFeeNtd: 50,
  title: "首波體驗價",
};

function isFirstWavePromotionSelection(
  service: ServiceType,
  side: PrintSide,
  finish: Finish,
  quantity: Quantity,
) {
  return BUSINESS_CARD_FIRST_WAVE_PROMO.enabled
    && service === BUSINESS_CARD_FIRST_WAVE_PROMO.service
    && side === BUSINESS_CARD_FIRST_WAVE_PROMO.side
    && finish === BUSINESS_CARD_FIRST_WAVE_PROMO.finish
    && quantity === BUSINESS_CARD_FIRST_WAVE_PROMO.quantity;
}

const TEMPLATE_META: Record<string, Omit<StyleCard, "image" | "code">> = {
  "template-01-fitness-black-yellow.png": { id: "fitness-black-yellow", title: "健身教練黑黃風", subtitle: "健身・運動教練・個人品牌", category: "健身", accent: "#f6c744" },
  "template-02-minimal-gray-white.jpg": { id: "minimal-gray-white", title: "極簡灰白商務", subtitle: "企業・顧問・專業服務", category: "商務", accent: "#1e65bc" },
  "template-03-cream-bakery.jpg": { id: "cream-bakery", title: "奶油甜點風", subtitle: "甜點・咖啡・烘焙・餐飲", category: "餐飲", accent: "#a96a3c" },
  "template-04-organic-natural.jpg": { id: "organic-natural", title: "自然留白選物", subtitle: "花藝・選物・生活品牌", category: "生活", accent: "#ad805c" },
  "template-05-luxury-black-gold.jpg": { id: "luxury-black-gold", title: "精品黑金燙金", subtitle: "高端品牌・美業・顧問", category: "精品", accent: "#b18c49" },
  "template-06-rxv-black-gold.png": { id: "rxv-black-gold", title: "質感黑金品牌", subtitle: "設計工作室・品牌服務", category: "精品", accent: "#b18c49" },
  "template-07-rxv-blue-corporate.png": { id: "rxv-blue-corporate", title: "藍白企業商務", subtitle: "公司行號・業務・科技", category: "商務", accent: "#1e65bc" },
  "template-08-warm-personal-service.png": { id: "warm-personal-service", title: "暖色個人服務", subtitle: "教練・講師・自由工作者", category: "服務", accent: "#28846b" },
  "template-09-colorful-gradient.png": { id: "colorful-gradient", title: "夢幻漸層科技", subtitle: "數位服務・創意・社群", category: "創意", accent: "#7c3aed" },
  "template-10-floral-pink.png": { id: "floral-pink", title: "粉嫩花藝美業", subtitle: "花藝・美睫・美甲・婚禮", category: "美業", accent: "#c77b98" },
  "template-11-dark-tech.png": { id: "dark-tech", title: "深色科技感", subtitle: "資訊・工程・AI・新創", category: "科技", accent: "#1f61d4" },
  "template-12-simple-black-white.png": { id: "simple-black-white", title: "經典黑白極簡", subtitle: "律師・會計・專業人士", category: "極簡", accent: "#747474" },
  "template-13-pink-gold-beauty.png": { id: "pink-gold-beauty", title: "玫瑰金精品美業", subtitle: "美睫・美甲・美容", category: "美業", accent: "#c77b98" },
  "template-14-green-fresh.png": { id: "green-fresh", title: "清新植感風", subtitle: "健康・保險・居家服務", category: "服務", accent: "#28846b" },
  "template-15-blue-enterprise.png": { id: "blue-enterprise", title: "企業幾何藍", subtitle: "公司行號・工程・業務", category: "商務", accent: "#1e65bc" },
  "template-16-soft-beauty.png": { id: "soft-beauty", title: "柔霧美業風", subtitle: "美業・個人工作室", category: "美業", accent: "#c77b98" },
  "template-17-brown-coffee.png": { id: "brown-coffee", title: "文青咖啡風", subtitle: "咖啡店・甜點・小店", category: "餐飲", accent: "#a96a3c" },
  "template-18-luxury-architecture.png": { id: "luxury-architecture", title: "建築質感商務", subtitle: "建築・室內・工程", category: "精品", accent: "#b18c49" },
  "template-19-orange-creative.png": { id: "orange-creative", title: "創意橘色潮流", subtitle: "設計・行銷・創作者", category: "創意", accent: "#7c3aed" },
  "template-20-japanese-minimal.png": { id: "japanese-minimal", title: "日系留白文創", subtitle: "文創・選物・攝影", category: "極簡", accent: "#747474" },
  "template-21-lawyer-navy-gold.png": { id: "lawyer-navy-gold", title: "律師事務所深藍", subtitle: "法律・金融・顧問", category: "商務", accent: "#1e65bc" },
  "template-22-clinic-blue.png": { id: "clinic-blue", title: "診所清透藍白", subtitle: "診所・牙科・藥局・健康", category: "服務", accent: "#28846b" },
  "template-23-kids-green.png": { id: "kids-green", title: "親子童趣插畫", subtitle: "親子・教育・兒童服務", category: "親子", accent: "#54a95b" },
  "template-24-bakery-brown.png": { id: "bakery-brown", title: "法式甜點烘焙", subtitle: "甜點・蛋糕・餐飲", category: "餐飲", accent: "#a96a3c" },
  "template-25-red-delivery.png": { id: "red-delivery", title: "電商直播活力紅", subtitle: "直播・代購・電商", category: "創意", accent: "#7c3aed" },
  "template-26-wedding-black-white.png": { id: "wedding-black-white", title: "婚攝攝影質感黑", subtitle: "婚攝・攝影・影像工作室", category: "精品", accent: "#b18c49" },
  "template-27-coffee-botanical.png": { id: "27-coffee-botanical", title: "咖啡植感文青", subtitle: "咖啡店・輕食・文青品牌", category: "餐飲", accent: "#798c4b" },
  "template-28-leather-craft-luxury.png": { id: "28-leather-craft-luxury", title: "手工皮件質感", subtitle: "皮件・手作・精品品牌", category: "精品", accent: "#7b553e" },
  "template-29-forest-camping-outdoor.png": { id: "29-forest-camping-outdoor", title: "森林露營戶外", subtitle: "露營・戶外用品・旅遊", category: "戶外", accent: "#516d42" },
  "template-30-aquarium-fresh-blue.png": { id: "30-aquarium-fresh-blue", title: "水族清透藍綠", subtitle: "水族・寵物・居家服務", category: "生活", accent: "#438b9c" },
  "template-31-engineering-professional.png": { id: "31-engineering-professional", title: "工程專業藍橘", subtitle: "工程・修繕・公司行號", category: "商務", accent: "#1e65bc" },
  "template-32-kids-coding-education.png": { id: "32-kids-coding-education", title: "兒童程式教育", subtitle: "教育・才藝・親子服務", category: "親子", accent: "#69a7cb" },
  "template-33-music-studio-neon.png": { id: "33-music-studio-neon", title: "音樂工作室霓虹", subtitle: "音樂・錄音・影像創作", category: "創意", accent: "#7c3aed" },
  "template-34-solar-energy-tech.png": { id: "34-solar-energy-tech", title: "太陽能綠能科技", subtitle: "綠能・工程・科技公司", category: "科技", accent: "#2e8f81" },
  "template-35-tea-house-traditional.png": { id: "35-tea-house-traditional", title: "古韻茶館質感", subtitle: "茶飲・餐飲・在地品牌", category: "餐飲", accent: "#8c694b" },
  "template-36-seafood-aquatic-blue.png": { id: "36-seafood-aquatic-blue", title: "海鮮水產清爽藍", subtitle: "海鮮・水產・餐飲店家", category: "餐飲", accent: "#2386af" },
  "template-37-watch-luxury-black.png": { id: "37-watch-luxury-black", title: "鐘錶精品黑金", subtitle: "鐘錶・精品・高端服務", category: "精品", accent: "#b18c49" },
  "template-38-maternity-warm-peach.png": { id: "38-maternity-warm-peach", title: "月子照護暖橘", subtitle: "月子・產後・女性服務", category: "服務", accent: "#d38768" },
  "template-39-fitness-red-black.png": { id: "39-fitness-red-black", title: "健身運動紅黑", subtitle: "健身・運動・教練", category: "健身", accent: "#c73737" },
  "template-40-legal-navy-gold.png": { id: "40-legal-navy-gold", title: "專業顧問深藍金", subtitle: "法律・顧問・金融服務", category: "商務", accent: "#315283" },
  "template-41-cake-pink-bakery.png": { id: "41-cake-pink-bakery", title: "粉嫩蛋糕甜點", subtitle: "蛋糕・甜點・烘焙", category: "餐飲", accent: "#d982a4" },
  "template-42-tattoo-dark-art.png": { id: "42-tattoo-dark-art", title: "刺青人體藝術黑", subtitle: "刺青・人體藝術・個人工作室", category: "創意", accent: "#4b4243" },
  "template-43-clinic-clean-blue.png": { id: "43-clinic-clean-blue", title: "診所清潔藍白", subtitle: "診所・牙科・健康服務", category: "服務", accent: "#4689bb" },
  "template-44-pet-salon-cream.png": { id: "44-pet-salon-cream", title: "寵物美容暖棕", subtitle: "寵物・美容・照護服務", category: "寵物", accent: "#ad805c" },
  "template-45-therapy-health-green.png": { id: "45-therapy-health-green", title: "物理治療清新綠", subtitle: "治療・復健・健康服務", category: "服務", accent: "#4b9b86" },
  "template-46-ceramic-tea-minimal.png": { id: "46-ceramic-tea-minimal", title: "日系陶藝留白", subtitle: "陶藝・茶器・文創選物", category: "生活", accent: "#a89276" },
  "template-47-wedding-beauty-soft.png": { id: "47-wedding-beauty-soft", title: "婚禮美業柔粉", subtitle: "婚禮・美業・攝影", category: "美業", accent: "#d79aa0" },
  "template-48-travel-outdoor-vivid.png": { id: "48-travel-outdoor-vivid", title: "旅遊戶外活力藍", subtitle: "旅遊・露營・戶外活動", category: "戶外", accent: "#267db2" },
  "template-49-farm-food-green.png": { id: "49-farm-food-green", title: "生鮮蔬果自然綠", subtitle: "農產・生鮮・食品店家", category: "餐飲", accent: "#599b46" },
  "template-50-natural-spa-green.png": { id: "50-natural-spa-green", title: "植感美業清新綠", subtitle: "美業・美容・生活品牌", category: "美業", accent: "#7aa27d" },
  "template-51-consulting-navy-orange.png": { id: "51-consulting-navy-orange", title: "商務顧問藍橘", subtitle: "顧問・業務・企業服務", category: "商務", accent: "#1e65bc" },
  "template-52-black-gold-premium.png": { id: "52-black-gold-premium", title: "奢華黑金質感", subtitle: "精品・高端服務・品牌工作室", category: "精品", accent: "#b18c49" },
  "template-53-marine-cool-blue.png": { id: "53-marine-cool-blue", title: "海洋科技冰藍", subtitle: "水產・工程・科技服務", category: "科技", accent: "#3885ad" },
  "template-54-kids-craft-yellow.png": { id: "54-kids-craft-yellow", title: "兒童才藝活力黃", subtitle: "親子・教育・才藝課程", category: "親子", accent: "#e6a83f" },
  "template-55-herbal-wellness-green.png": { id: "55-herbal-wellness-green", title: "草本養生植感", subtitle: "養生・保健・自然品牌", category: "生活", accent: "#7a9160" },

  "template-56-aroma-yoga-healing.webp": { id: "aroma-yoga-healing", title: "芳香瑜珈療癒", subtitle: "瑜珈・芳療・身心平衡服務", category: "服務", accent: "#8c7894" },
  "template-57-rainy-story-house.webp": { id: "rainy-story-house", title: "雨讀故事館", subtitle: "親子閱讀・故事活動・手作課程", category: "親子", accent: "#69a7cb" },
  "template-58-leather-restoration.webp": { id: "leather-restoration", title: "皮革修復職人", subtitle: "皮件修復・手作工藝・職人品牌", category: "生活", accent: "#7b553e" },
  "template-59-urban-birdhouse-design.webp": { id: "urban-birdhouse-design", title: "城市鳥屋設計", subtitle: "品牌設計・空間規劃・企業服務", category: "商務", accent: "#315283" },
  "template-60-tea-studio-natural.webp": { id: "tea-studio-natural", title: "日系茶品職人", subtitle: "茶飲・茶葉・在地品牌", category: "餐飲", accent: "#8c694b" },
  "template-61-soundwave-music-studio.webp": { id: "soundwave-music-studio", title: "聲波音樂工作室", subtitle: "音樂・錄音・影像創作", category: "創意", accent: "#7c3aed" },
  "template-62-fitness-neon-coach.webp": { id: "fitness-neon-coach", title: "運動教練黑綠", subtitle: "健身・運動・私人教練", category: "健身", accent: "#c73737" },
  "template-63-woodcraft-workshop.webp": { id: "woodcraft-workshop", title: "木作職人工坊", subtitle: "木工・修繕・手作品牌", category: "生活", accent: "#7b553e" },
  "template-64-warm-childcare-center.webp": { id: "warm-childcare-center", title: "溫暖親子托育", subtitle: "親子・托育・兒童服務", category: "親子", accent: "#e6a83f" },
  "template-65-floral-soft-pink.webp": { id: "floral-soft-pink", title: "花藝柔粉美學", subtitle: "花藝・婚禮・美業工作室", category: "美業", accent: "#d79aa0" },
  "template-66-kids-woodcraft-lab.webp": { id: "kids-woodcraft-lab", title: "兒童木工創客", subtitle: "親子・教育・才藝課程", category: "親子", accent: "#69a7cb" },
  "template-67-ink-photo-studio.webp": { id: "ink-photo-studio", title: "墨韻攝影工作室", subtitle: "攝影・影像・婚禮紀錄", category: "創意", accent: "#4b4243" },
  "template-68-coffee-roastery.webp": { id: "coffee-roastery", title: "咖啡烘焙職人", subtitle: "咖啡店・甜點・小店品牌", category: "餐飲", accent: "#a96a3c" },
  "template-69-city-walk-planning.webp": { id: "city-walk-planning", title: "城市漫步導覽", subtitle: "旅遊企劃・地方創生・導覽服務", category: "戶外", accent: "#438b9c" },
  "template-70-sustainable-packaging.webp": { id: "sustainable-packaging", title: "永續包裝設計", subtitle: "包裝設計・品牌顧問・綠色服務", category: "商務", accent: "#7a9160" },
  "template-71-boardgame-design.webp": { id: "boardgame-design", title: "桌遊設計工作室", subtitle: "桌遊・設計・文創品牌", category: "創意", accent: "#7c3aed" },
  "template-72-game-streaming-dark.webp": { id: "game-streaming-dark", title: "復古遊戲直播", subtitle: "直播・電商・數位創作者", category: "創意", accent: "#7c3aed" },
  "template-73-marine-ecology.webp": { id: "marine-ecology", title: "海洋生態研究", subtitle: "海洋教育・環境服務・研究單位", category: "科技", accent: "#2386af" },
  "template-74-kids-learning-fun.webp": { id: "kids-learning-fun", title: "童趣才藝教育", subtitle: "親子・教育・才藝課程", category: "親子", accent: "#e6a83f" },
  "template-75-senior-home-care.webp": { id: "senior-home-care", title: "銀齡居家照護", subtitle: "長照・居家服務・健康照護", category: "服務", accent: "#4689bb" },
  "template-76-kids-ocean-lab.webp": { id: "kids-ocean-lab", title: "兒童海洋實驗教室", subtitle: "親子・教育・才藝課程", category: "親子", accent: "#2386af" },
  "template-77-handmade-art-studio.webp": { id: "handmade-art-studio", title: "手作藝術工坊", subtitle: "手作・藝術・個人品牌", category: "生活", accent: "#7b553e" },
  "template-78-moss-plant-design.webp": { id: "moss-plant-design", title: "苔球植感設計", subtitle: "植栽・花藝・生活品牌", category: "生活", accent: "#7aa27d" },
  "template-79-sports-massage.webp": { id: "sports-massage", title: "運動按摩復健", subtitle: "運動按摩・體能訓練・健康服務", category: "健身", accent: "#8a9a4e" },
  "template-80-pet-nutrition-care.webp": { id: "pet-nutrition-care", title: "寵物照護暖棕", subtitle: "寵物・美容・照護服務", category: "寵物", accent: "#ad805c" },
  "template-81-blue-orbit-business.webp": { id: "blue-orbit-business", title: "藍白科技商務", subtitle: "科技・業務・專業服務", category: "商務", accent: "#1e65bc" },
  "template-82-codevista-tech.webp": { id: "codevista-tech", title: "程式科技工作室", subtitle: "AI・軟體・數位服務", category: "科技", accent: "#1f61d4" },
  "template-83-home-repair-service.webp": { id: "home-repair-service", title: "安心居家修繕", subtitle: "水電・修繕・居家服務", category: "服務", accent: "#28846b" },
  "template-84-kids-science-lab.webp": { id: "kids-science-lab", title: "兒童科學教育", subtitle: "教育・才藝・親子服務", category: "親子", accent: "#69a7cb" },
  "template-85-fruit-tea-drink.webp": { id: "fruit-tea-drink", title: "鮮果手搖飲品牌", subtitle: "飲料・手搖飲・餐飲店家", category: "餐飲", accent: "#a96a3c" },
};

const TEMPLATE_IMAGE_MODULES = import.meta.glob(
  "../../assets/business-card-order-templates/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" },
) as Record<string, string>;

function fileNameFromPath(path: string) {
  return path.split("/").pop() || path;
}

function sortTemplateFileName(a: string, b: string) {
  const getOrder = (name: string) => Number(name.match(/template-(\d+)/i)?.[1] || 9999);
  return getOrder(a) - getOrder(b) || a.localeCompare(b, "zh-Hant");
}

function templateOrderFromFileName(fileName: string) {
  const order = Number(fileName.match(/template-(\d+)/i)?.[1] || 0);
  return Number.isInteger(order) && order > 0 ? order : null;
}

function formatTemplateCode(order: number) {
  return `T${String(order).padStart(2, "0")}`;
}

function inferredTitle(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/^template-\d+-?/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "新名片模板";
}

function inferredCategory(fileName: string) {
  const value = fileName.toLowerCase();
  if (/(coffee|bakery|cake|food|餐|咖啡|甜點)/.test(value)) return "餐飲";
  if (/(beauty|floral|nail|花藝|美業|美容)/.test(value)) return "美業";
  if (/(fitness|coach|健身|教練)/.test(value)) return "健身";
  if (/(tech|ai|digital|科技|工程)/.test(value)) return "科技";
  if (/(law|finance|business|企業|商務)/.test(value)) return "商務";
  return "新模板";
}

const TEMPLATE_ITEMS = Object.entries(TEMPLATE_IMAGE_MODULES)
  .map(([path, image]) => {
    const fileName = fileNameFromPath(path);
    const meta = TEMPLATE_META[fileName];
    return {
      ...(meta ?? {
        id: fileName.replace(/\.[^.]+$/, ""),
        title: inferredTitle(fileName),
        subtitle: "新加入模板・點擊放大查看完整設計",
        category: inferredCategory(fileName),
        accent: "#0891b2",
      }),
      image,
      _fileName: fileName,
      _templateOrder: templateOrderFromFileName(fileName),
    };
  })
  .sort((a, b) => sortTemplateFileName(a._fileName, b._fileName));

// 舊模板保留檔名中的固定編號；新上傳但檔名未含 template-數字 的圖片，
// 依排序自動接續最大編號，避免畫面出現 T--。
let nextGeneratedTemplateOrder = TEMPLATE_ITEMS.reduce(
  (max, item) => Math.max(max, item._templateOrder || 0),
  0,
) + 1;

const STYLES: StyleCard[] = TEMPLATE_ITEMS.map(({ _fileName, _templateOrder, ...style }) => ({
  ...style,
  code: formatTemplateCode(_templateOrder ?? nextGeneratedTemplateOrder++),
}));


const QUANTITIES: Quantity[] = [200, 300, 500, 1000, 2000, 3000, 5000];

const PRICE_TABLE: Record<ServiceType, Record<PrintSide, Record<Quantity, number>>> = {
  print: {
    single: { 200: 179, 300: 229, 500: 279, 1000: 399, 2000: 599, 3000: 799, 5000: 1099 },
    double: { 200: 199, 300: 249, 500: 299, 1000: 449, 2000: 699, 3000: 899, 5000: 1299 },
  },
  layout: {
    single: { 200: 349, 300: 399, 500: 449, 1000: 599, 2000: 799, 3000: 999, 5000: 1299 },
    double: { 200: 399, 300: 449, 500: 499, 1000: 649, 2000: 849, 3000: 1049, 5000: 1349 },
  },
};

/** 雙面霧膜為質感升級；水晶亮膜維持目前基本價格。 */
const MATTE_UPGRADE: Record<Quantity, number> = {
  200: 50,
  300: 50,
  500: 80,
  1000: 100,
  2000: 150,
  3000: 200,
  5000: 300,
};

function finishUpgradeAmount(finish: Finish, quantity: Quantity) {
  return finish === "matte" ? MATTE_UPGRADE[quantity] : 0;
}

function getItemPrice(service: ServiceType, side: PrintSide, finish: Finish, quantity: Quantity) {
  return PRICE_TABLE[service][side][quantity] + finishUpgradeAmount(finish, quantity);
}

const defaultForm: OrderForm = {
  service: "layout",
  side: "double",
  quantity: 200,
  finish: "gloss",
  styleId: "rxv-blue-corporate",
  needQr: true,
  qrLink: "",
  brandName: "",
  fullName: "",
  jobTitle: "",
  phone: "",
  lineId: "",
  email: "",
  website: "",
  services: "",
  contactName: "",
  contactPhone: "",
  shippingAddress: "",
  note: "",
  digitalCardOptIn: false,
  agree: false,
};

function readDraft(): OrderForm {
  try {
    const saved = window.sessionStorage.getItem(DRAFT_KEY);
    return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
  } catch {
    return defaultForm;
  }
}

function boxCount(quantity: Quantity) {
  return quantity / 100;
}

function quantityLabel(quantity: Quantity) {
  return `${boxCount(quantity)} 盒（${quantity} 張）`;
}

function finishLabel(finish: Finish) {
  return finish === "gloss" ? "水晶亮膜" : "雙面霧膜";
}

function serviceLabel(service: ServiceType) {
  return service === "layout" ? "人工排版＋代印" : "自備完稿代印";
}

function sideLabel(side: PrintSide) {
  return side === "single" ? "單面名片" : "雙面名片";
}


function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`無法讀取檔案：${file.name}`));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function getStoredAuthToken() {
  return String(localStorage.getItem("auth_token") || localStorage.getItem("token") || "").trim();
}

function getApiErrorMessage(payload: any, fallback: string) {
  return typeof payload?.error === "string" && payload.error.trim()
    ? payload.error.trim()
    : fallback;
}

function StylePreview({ style }: { style: StyleCard }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <img
        src={style.image}
        alt={`${style.title} 完整名片設計模板`}
        className="block h-auto w-full"
        loading="lazy"
      />
    </div>
  );
}


function ChoiceButton({
  active,
  title,
  subtitle,
  badge,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${active ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50"}`}
    >
      {badge ? <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-base font-black text-emerald-800">{badge}</span> : null}
      <p className={`font-black ${active ? "text-cyan-800" : "text-slate-900"}`}>{title}</p>
      {subtitle ? <p className="mt-1 text-base leading-relaxed text-slate-500">{subtitle}</p> : null}
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const className = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-black text-slate-800">{label}{required ? <span className="ml-1 text-rose-500">*</span> : null}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className={`${className} resize-y`} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />
      )}
    </label>
  );
}

export default function ManualBusinessCardOrderPage() {
  const [form, setForm] = useState<OrderForm>(readDraft);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderCode, setSubmittedOrderCode] = useState("");
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("全部");
  const [previewStyle, setPreviewStyle] = useState<StyleCard | null>(null);

  const fileNames = selectedFiles.map((file) => file.name);

  const templateCategories = useMemo(
    () => ["全部", ...Array.from(new Set(STYLES.map((style) => style.category)))],
    [],
  );
  const filteredStyles = useMemo(() => {
    const keyword = templateSearch.trim().toLocaleLowerCase();
    return STYLES.filter((style) => {
      const matchesCategory = templateCategory === "全部" || style.category === templateCategory;
      const haystack = `${style.code} ${style.title} ${style.subtitle} ${style.category}`.toLocaleLowerCase();
      return matchesCategory && (!keyword || haystack.includes(keyword));
    });
  }, [templateCategory, templateSearch]);
  const visibleStyles = showAllStyles ? filteredStyles : filteredStyles.slice(0, 18);
  const selectedStyle = useMemo(() => STYLES.find((item) => item.id === form.styleId) ?? STYLES[0], [form.styleId]);
  const regularItemPrice = getItemPrice(form.service, form.side, form.finish, form.quantity);
  const firstWavePromotionEligible = isFirstWavePromotionSelection(
    form.service,
    form.side,
    form.finish,
    form.quantity,
  );
  const itemDiscount = firstWavePromotionEligible ? BUSINESS_CARD_FIRST_WAVE_PROMO.itemDiscountNtd : 0;
  const itemPrice = regularItemPrice - itemDiscount;
  const regularShipping = regularItemPrice >= 1000 ? 0 : 100;
  const shipping = firstWavePromotionEligible
    ? BUSINESS_CARD_FIRST_WAVE_PROMO.shippingFeeNtd
    : (itemPrice >= 1000 ? 0 : 100);
  const shippingDiscount = Math.max(0, regularShipping - shipping);
  const total = itemPrice + shipping;
  const regularTotal = regularItemPrice + regularShipping;
  const totalDiscount = regularTotal - total;
  const amountUntilFreeShipping = Math.max(0, 1000 - itemPrice);
  const hasFreeShipping = shipping === 0;
  const brandWebsiteGiftEligible =
    form.service === "layout" && itemPrice >= BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT;

  const setField = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const chooseFirstWavePackage = () => {
    setForm((current) => ({
      ...current,
      service: BUSINESS_CARD_FIRST_WAVE_PROMO.service,
      side: BUSINESS_CARD_FIRST_WAVE_PROMO.side,
      finish: BUSINESS_CARD_FIRST_WAVE_PROMO.finish,
      quantity: BUSINESS_CARD_FIRST_WAVE_PROMO.quantity,
    }));
    window.setTimeout(() => {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const saveDraft = () => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      setNotice("資料已暫存於此瀏覽器，可回到此頁繼續填寫。");
    } catch {
      setNotice("瀏覽器暫存失敗，請先複製需求內容備份。");
    }
  };

  const buildSummary = () => {
    const lines = [
      "【RXV 名片人工接單需求】",
      `服務：${serviceLabel(form.service)}`,
      `印刷：${sideLabel(form.side)}／${finishLabel(form.finish)}／${quantityLabel(form.quantity)}`,
      `紙材：${finishLabel(form.finish)}`,
      firstWavePromotionEligible ? `首波體驗活動：原價 NT$${regularTotal}，活動優惠 NT$${totalDiscount}，活動合計 NT$${total}` : "",
      `名片費：NT$${itemPrice}${firstWavePromotionEligible ? `（原價 NT$${regularItemPrice}，首波優惠 -NT$${itemDiscount}）` : ""}`,
      `運費：${firstWavePromotionEligible ? `NT$${shipping}（原價 NT$${regularShipping}，首波優惠 -NT$${shippingDiscount}）` : (shipping === 0 ? "免運（名片費滿 NT$1,000）" : "NT$100（名片費未滿 NT$1,000）")}`,
      `預估合計：NT$${total}`,
      form.service === "layout" ? `選擇模板：${selectedStyle.code}｜${selectedStyle.title}` : "自備完稿：是",
      `需要 QR Code：${form.needQr ? "需要" : "不需要"}`,
      form.needQr ? `QR Code 連結：${form.qrLink || "尚未填寫"}` : "",
      `品牌／公司：${form.brandName || "未填"}`,
      `姓名：${form.fullName || "未填"}`,
      `職稱：${form.jobTitle || "未填"}`,
      `電話：${form.phone || "未填"}`,
      `LINE：${form.lineId || "未填"}`,
      `Email：${form.email || "未填"}`,
      `網站／社群：${form.website || "未填"}`,
      `服務內容：${form.services || "未填"}`,
      `收件人：${form.contactName || "未填"}`,
      `收件電話：${form.contactPhone || "未填"}`,
      `收件地址：${form.shippingAddress || "未填"}`,
      `上傳檔案：${fileNames.length ? fileNames.join("、") : "未選擇"}`,
      `備註：${form.note || "無"}`,
      `一頁式品牌網站：${brandWebsiteGiftEligible ? `符合人工排版滿 NT$${BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT} 贈送資格，付款確認後開通 ${BUSINESS_CARD_BRAND_WEBSITE_GIFT_MONTHS} 個月` : "本次方案未含贈送資格"}`,
      "提醒：建立訂單後請先完成全額匯款並回填資料；工作室核對入帳後才開始排版，提供預覽確認後再送印。",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const copySummary = async () => {
    const summary = buildSummary();
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setNotice("需求內容已複製，可自行留存；正式送出後，附件會直接儲存到名片訂單。");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setNotice("複製失敗，請改用瀏覽器選取後複製。");
    }
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    const validFiles = files.filter((file) => file.size > 0 && file.size <= BUSINESS_CARD_MAX_FILE_BYTES);

    if (files.length > BUSINESS_CARD_MAX_FILES) {
      setNotice(`一次最多上傳 ${BUSINESS_CARD_MAX_FILES} 個附件，請分批整理後再送出。`);
      event.target.value = "";
      return;
    }
    if (validFiles.length !== files.length) {
      setNotice("附件不可為空，且單一檔案請控制在 3MB 以下。");
      event.target.value = "";
      return;
    }

    setSelectedFiles(validFiles);
  };

  const redirectToLogin = () => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      window.sessionStorage.setItem("rxv_auth_return_to", `${window.location.pathname}${window.location.search}`);
    } catch {
      // 即使暫存失敗仍導向既有登入頁；客戶可回到頁面重新填寫。
    }
    window.location.assign(`/login?returnTo=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || submittedOrderCode) return;

    if (!form.agree) {
      setNotice("請先勾選確認價格與送印流程。");
      return;
    }
    if (!form.contactName.trim() || !form.contactPhone.trim() || !form.shippingAddress.trim()) {
      setNotice("請填寫收件人、收件電話與宅配地址。");
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      setNotice("送出名片需求前請先登入；已填內容會暫存於此瀏覽器。");
      window.setTimeout(redirectToLogin, 250);
      return;
    }

    setIsSubmitting(true);
    setNotice("正在建立名片訂單…");

    try {
      const createResponse = await fetch("/api/main?action=create-business-card-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: form.service,
          printSide: form.side,
          finishType: form.finish,
          quantityCards: form.quantity,
          templateId: form.service === "layout" ? selectedStyle.id : null,
          templateTitle: form.service === "layout" ? `${selectedStyle.code}｜${selectedStyle.title}` : null,
          needQr: form.needQr,
          qrLink: form.needQr ? form.qrLink : null,
          brandName: form.brandName,
          fullName: form.fullName,
          jobTitle: form.jobTitle,
          phone: form.phone,
          lineId: form.lineId,
          email: form.email,
          website: form.website,
          services: form.services,
          recipientName: form.contactName,
          recipientPhone: form.contactPhone,
          shippingAddress: form.shippingAddress,
          note: form.note,
          digitalCardOptIn: brandWebsiteGiftEligible || form.digitalCardOptIn,
        }),
      });

      const createPayload = await createResponse.json().catch(() => ({}));
      if (createResponse.status === 401) {
        setNotice("登入已失效，請重新登入後再送出。已填內容會暫存。");
        window.setTimeout(redirectToLogin, 600);
        return;
      }
      if (!createResponse.ok || !createPayload?.order?.id) {
        throw new Error(getApiErrorMessage(createPayload, "建立名片訂單失敗，請稍後再試。"));
      }

      const orderId = String(createPayload.order.id);
      const orderCode = String(createPayload.order.orderCode || "");

      for (const file of selectedFiles) {
        const base64 = await readFileAsDataUrl(file);
        const uploadResponse = await fetch("/api/main?action=upload-business-card-order-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId,
            fileName: file.name,
            contentType: file.type,
            base64,
            fileRole: form.service === "print" ? "print_artwork" : "reference_image",
          }),
        });

        const uploadPayload = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok) {
          throw new Error(`${file.name} 上傳失敗：${getApiErrorMessage(uploadPayload, "請稍後再試。")}`);
        }
      }

      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // 不影響已建立的訂單。
      }

      setSelectedFiles([]);
      setSubmittedOrderCode(orderCode);
      setNotice(
        `名片訂單已建立，訂單編號：${orderCode || "已建立"}。正在前往名片專用匯款頁…`,
      );
      window.setTimeout(() => {
        window.location.assign(`/business-card/payment?orderId=${encodeURIComponent(orderId)}&created=1`);
      }, 250);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "送出失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <SEO
        title="人工名片設計＋代印｜RXV 夢想創作工作室"
        description="名片人工排版、QR Code、Logo 圖片與代印服務。固定價格，先全額匯款，核對入帳後才開始排版。"
      />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-100 px-5 py-8 text-slate-900 shadow-xl sm:px-8 sm:py-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-base font-black tracking-[.14em] text-rose-800">首波名片體驗活動</span>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">不會排版，也能有一張專業名片</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-700">第一次做名片不知道從哪開始？選模板、填資料、上傳 Logo 或照片即可。工作室核對匯款後人工排版，確認預覽無誤再送印。</p>
              <div className="mt-5 rounded-2xl border border-rose-200 bg-white/90 p-4 shadow-sm">
                <p className="text-base font-black text-rose-800">首波體驗限定｜人工排版＋雙面亮膜名片 200 張</p>
                <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="text-base font-bold text-slate-500 line-through">原價 NT$499</span>
                  <strong className="text-3xl font-black text-rose-600">NT$399 含宅配</strong>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-sm font-black text-rose-800">現省 NT$100</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">含 QR Code、基本人工排版、一次文字修改；再送一頁式品牌網站基本版 3 個月。</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={chooseFirstWavePackage} className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-base font-black text-white shadow-sm transition hover:bg-rose-700">選擇首波體驗價</button>
                  <a href="#order-form" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">查看其他規格價格</a>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-base font-bold">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-800">自備完稿 200 張 NT$179 起</span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">一般價：人工排版 200 張 NT$349 起（運費另計）</span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-violet-800">🎁 人工排版滿 NT$349 送品牌網站 3 個月</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">水晶亮膜、雙面霧膜可選｜滿 NT$1,000 免運</span>
              </div>
            </div>
            <div className="rounded-3xl border border-cyan-100 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-base font-black text-cyan-800">服務流程</p>
              <ol className="mt-3 space-y-3 text-base leading-relaxed text-slate-700">
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-cyan-500 font-black text-white">1</span>先看固定價格與選擇樣式</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-cyan-500 font-black text-white">2</span>填寫資料、附上 Logo／照片／名片檔案</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-cyan-500 font-black text-white">3</span>送出訂單後先完成銀行匯款與回填資料</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-cyan-500 font-black text-white">4</span>核對入帳後排版、確認一次修改，再由合作印刷廠直接宅配</li>
              </ol>
            </div>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-5 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1.5 text-sm font-black text-violet-800">名片活動加值</span>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">人工排版名片滿 NT$349，免費贈一頁式品牌網站基本版 3 個月</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">名片不只印出聯絡方式，也能同步建立可分享的線上品牌頁。付款確認後會先建立草稿，客戶可自行補齊內容並決定是否公開。</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["品牌／服務介紹", "聯絡方式", "公開網址", "專屬 QR Code", "3 個月使用期"].map((item) => (
                  <span key={item} className="rounded-full border border-violet-200 bg-white px-3 py-2 text-sm font-black text-violet-800 shadow-sm">{item}</span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#order-form" className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-sm transition hover:bg-violet-700" style={{ color: "#ffffff" }}>選擇人工排版方案</a>
                <a href="/shop/rxv-studio" target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-violet-300 bg-white px-5 py-3 text-sm font-black text-violet-800 shadow-sm transition hover:bg-violet-50">查看網站範例</a>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">贈送為一頁式品牌網站基本版；不含商品展示、購物車與站內付款功能，之後可在同一網址加購升級。</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-xl">
              <img src="/promo/business-card-gift-website-banner.png" alt="人工排版名片滿額贈一頁式品牌網站活動圖" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4"><p className="font-black text-cyan-900">固定價格，先看再填</p><p className="mt-1 text-base leading-relaxed text-cyan-800">不用先私訊等報價；選好面數與張數，頁面立即算出合計。</p></div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4"><p className="font-black text-violet-900">QR Code、Logo、圖片可放入</p><p className="mt-1 text-base leading-relaxed text-violet-800">一般名片使用需求可直接協助處理，不另外增加複雜選項。</p></div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><p className="font-black text-amber-900">先付款才開始人工排版</p><p className="mt-1 text-base leading-relaxed text-amber-800">完成全額匯款並由工作室核對入帳後，才會開始排版；預覽完成可提出一次文字修改。</p></div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4"><p className="font-black text-sky-900">預計製作與配送</p><p className="mt-1 text-base leading-relaxed text-sky-800">核對入帳後約 2～3 個工作天提供預覽；確認後印刷與宅配約 4～7 個工作天，整體約 7～10 個工作天送達。</p></div>
        </div>

        <form id="order-form" onSubmit={handleSubmit} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-6 xl:contents">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-1">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-base font-black tracking-[.16em] text-cyan-700">STEP 1</p><h2 className="mt-1 text-2xl font-black text-slate-950">選擇服務與價格</h2></div><span className="rounded-full bg-rose-100 px-3 py-1.5 text-base font-black text-rose-800">首波體驗價 NT$399 含宅配</span></div>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base leading-relaxed text-emerald-900">
                <span className="font-black">大量訂購可享免運：</span>訂單名片費滿 NT$1,000 即自動免宅配運費。可選 2、3、5、10、20、30、50 盒；標示「滿千免運」的數量已符合免運門檻。
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <ChoiceButton active={form.service === "layout"} title="人工排版＋代印" subtitle="提供資料與喜歡風格，由工作室協助排版；含一次文字修改。" badge="送網站 3 個月" onClick={() => setField("service", "layout")} />
                <ChoiceButton active={form.service === "print"} title="已有檔案，直接代印" subtitle="適合已有 PDF、AI、PNG、JPG 完稿，只做基本檔案檢查。" onClick={() => setField("service", "print")} />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base leading-relaxed text-rose-950">
                <div><p className="font-black">首波體驗規格：人工排版＋雙面水晶亮膜＋200 張</p><p className="mt-1 text-rose-900">原價 NT$499，現在 NT$399 含宅配；選其他面數、紙材或張數即依一般固定價格計算。</p></div>
                <button type="button" onClick={chooseFirstWavePackage} className="rounded-xl bg-rose-600 px-4 py-2.5 text-base font-black text-white shadow-sm transition hover:bg-rose-700">套用體驗方案</button>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div><p className="mb-2 text-base font-black text-slate-800">印刷面數</p><div className="grid grid-cols-2 gap-3"><ChoiceButton active={form.side === "single"} title="單面名片" subtitle="簡潔聯絡資訊、QR Code、預約卡" onClick={() => setField("side", "single")} /><ChoiceButton active={form.side === "double"} title="雙面名片" subtitle="可放服務介紹、社群與更多資訊" onClick={() => setField("side", "double")} /></div></div>
                <div><p className="mb-2 text-base font-black text-slate-800">紙材</p><div className="grid grid-cols-2 gap-3"><ChoiceButton active={form.finish === "gloss"} title="水晶亮膜" subtitle="明亮清楚，適合多數商家" onClick={() => setField("finish", "gloss")} /><ChoiceButton active={form.finish === "matte"} title="雙面霧膜" subtitle="低反光、耐看、有質感" onClick={() => setField("finish", "matte")} /></div></div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-black text-slate-800">印刷數量</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-base font-black text-emerald-800">名片費滿 NT$1,000 免運</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {QUANTITIES.map((quantity) => {
                    const regularPrice = getItemPrice(form.service, form.side, form.finish, quantity);
                    const promoEligible = isFirstWavePromotionSelection(form.service, form.side, form.finish, quantity);
                    const price = regularPrice - (promoEligible ? BUSINESS_CARD_FIRST_WAVE_PROMO.itemDiscountNtd : 0);
                    const freeShipping = !promoEligible && price >= 1000;
                    return <ChoiceButton key={quantity} active={form.quantity === quantity} title={quantityLabel(quantity)} subtitle={promoEligible ? `原價 NT$${regularPrice}｜首波 NT$${price}` : `NT$${price}${freeShipping ? "｜免運" : ""}`} badge={promoEligible ? "首波價" : (freeShipping ? "滿千免運" : undefined)} onClick={() => setField("quantity", quantity)} />;
                  })}
                </div>
                <p className="mt-3 text-base leading-relaxed text-slate-500">1 盒約 100 張。50 盒以上或同時需要多款不同稿件，請在備註說明，確認後再安排。</p>
              </div>
            </section>

            {form.service === "layout" ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2 xl:row-start-2">
                <p className="text-base font-black tracking-[.16em] text-cyan-700">STEP 2</p>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">選擇喜歡的名片風格</h2>
                    <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
                      每張模板都有固定編號，方便你與工作室確認選擇。可先用分類或關鍵字找風格；選擇後會依你的資料、Logo、圖片與 QR Code 重新人工排版，不會直接把範例文字印上去。
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-2 text-base font-black text-cyan-800">已選：{selectedStyle.code}｜{selectedStyle.title}</span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <label className="block w-full lg:max-w-2xl">
                      <span className="mb-2 block text-base font-black text-slate-800">搜尋名片模板</span>
                      <input
                        type="search"
                        value={templateSearch}
                        onChange={(event) => {
                          setTemplateSearch(event.target.value);
                          setShowAllStyles(false);
                        }}
                        placeholder="例如：黑金、咖啡、美業、科技、健身、T01…"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      />
                    </label>
                    <p className="text-base font-bold text-slate-600">找到 {filteredStyles.length} 款模板</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2" aria-label="名片模板分類">
                    {templateCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setTemplateCategory(category);
                          setShowAllStyles(false);
                        }}
                        className={`inline-flex !w-auto shrink-0 items-center justify-center rounded-full border px-3 py-1.5 text-base font-black transition ${
                          templateCategory === category
                            ? "border-cyan-600 bg-cyan-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                        }`}
                        aria-pressed={templateCategory === category}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleStyles.length ? (
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`rounded-2xl border p-3 transition ${
                          form.styleId === style.id
                            ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100"
                            : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md"
                        }`}
                      >
                        <button type="button" onClick={() => setField("styleId", style.id)} className="block w-full text-left">
                          <StylePreview style={style} />
                          <div className="mt-3 flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-cyan-700 px-2.5 py-1 text-base font-black text-white">{style.code}</span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-base font-black text-slate-600">{style.category}</span>
                                {form.styleId === style.id ? <span className="rounded-full bg-cyan-600 px-2 py-1 text-base font-black text-white">已選</span> : null}
                              </div>
                              <p className="mt-2 font-black text-slate-900">{style.title}</p>
                              <p className="mt-1 text-base leading-relaxed text-slate-500">{style.subtitle}</p>
                            </div>
                          </div>
                        </button>
                        <button type="button" onClick={() => setPreviewStyle(style)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base font-black text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">
                          放大查看完整模板
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="font-black text-slate-800">找不到符合的模板</p>
                    <p className="mt-2 text-base text-slate-600">可換一個關鍵字，或改選「全部」查看所有模板。</p>
                    <button type="button" onClick={() => { setTemplateSearch(""); setTemplateCategory("全部"); }} className="mt-4 rounded-xl border border-cyan-300 bg-white px-4 py-2.5 text-base font-black text-cyan-800 hover:bg-cyan-50">清除搜尋條件</button>
                  </div>
                )}

                {filteredStyles.length > 18 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllStyles((current) => !current)}
                    className="mt-5 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-base font-black text-cyan-800 transition hover:bg-cyan-100"
                  >
                    {showAllStyles ? "收起部分模板" : `查看其餘 ${filteredStyles.length - 18} 款模板`}
                  </button>
                ) : null}

                <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:p-5">
                  <p className="text-base font-black text-violet-950">先寫清楚你的客製偏好，可避免第一次預覽後大改名片</p>
                  <p className="mt-2 text-base leading-relaxed text-violet-900">請把喜歡的文字顏色、氛圍、一定要放大的內容、不想出現的資料或參考圖片的排版感覺先寫在這裡。人工排版方案含一次文字修改，不包含整體換風格或大幅重做。</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-base font-black text-violet-900">
                    <span className="rounded-full bg-white px-3 py-1.5">文字顏色：金色／白色／粉色…</span>
                    <span className="rounded-full bg-white px-3 py-1.5">氛圍：高級／可愛／科技／沉穩…</span>
                    <span className="rounded-full bg-white px-3 py-1.5">重點：電話放大／不要 Email／保留 Logo…</span>
                  </div>
                  <div className="mt-4">
                    <InputField
                      label="客製文字、顏色與風格偏好"
                      value={form.note}
                      onChange={(value) => setField("note", value)}
                      placeholder="例如：想要沉穩黑金感，姓名與電話請放大；不要 Email；背面保留 QR Code，參考圖片的字體感覺即可。"
                      textarea
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-base leading-relaxed text-amber-900">
                  沒有喜歡的模板，也可在上方寫下想要的感覺或上傳參考圖片；工作室會先評估能否以現有版型調整後製作。
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-3"><p className="text-base font-black tracking-[.16em] text-cyan-700">STEP {form.service === "layout" ? "3" : "2"}</p><h2 className="mt-1 text-2xl font-black text-slate-950">填寫名片與聯絡資料</h2><p className="mt-2 text-base leading-relaxed text-slate-500">{form.service === "layout" ? "Logo、照片、商品圖與 QR Code 都可協助放入。" : "自備完稿只檢查尺寸、文字安全距離與明顯圖片模糊，不重新設計內容。"}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2"><InputField label="品牌／公司名稱" value={form.brandName} onChange={(value) => setField("brandName", value)} placeholder="例如：RXV 夢想創作工作室" /><InputField label="姓名" value={form.fullName} onChange={(value) => setField("fullName", value)} placeholder="例如：王小明" /><InputField label="職稱" value={form.jobTitle} onChange={(value) => setField("jobTitle", value)} placeholder="例如：店長／業務經理" /><InputField label="電話" value={form.phone} onChange={(value) => setField("phone", value)} placeholder="例如：0912-345-678" /><InputField label="LINE ID" value={form.lineId} onChange={(value) => setField("lineId", value)} placeholder="例如：@brand" /><InputField label="Email" value={form.email} onChange={(value) => setField("email", value)} placeholder="例如：hello@example.com" /><div className="md:col-span-2"><InputField label="網站／Facebook／Instagram／預約連結" value={form.website} onChange={(value) => setField("website", value)} placeholder="可放一個主要連結" /></div><div className="md:col-span-2"><InputField label="服務內容／名片上想放的文字" value={form.services} onChange={(value) => setField("services", value)} placeholder="例如：美睫・美甲・預約制／網站設計・商品圖製作" textarea /></div></div>

              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black text-violet-900">需要 QR Code 嗎？</p><p className="mt-1 text-base text-violet-800">可連到 LINE、社群、網站、預約頁或公開介紹頁。</p></div><div className="flex rounded-xl bg-white p-1 shadow-sm"><button type="button" onClick={() => setField("needQr", true)} className={`rounded-lg px-4 py-2 text-base font-black ${form.needQr ? "bg-violet-600 text-white" : "text-slate-600"}`}>需要</button><button type="button" onClick={() => setField("needQr", false)} className={`rounded-lg px-4 py-2 text-base font-black ${!form.needQr ? "bg-violet-600 text-white" : "text-slate-600"}`}>不需要</button></div></div>{form.needQr ? <div className="mt-4"><InputField label="QR Code 連結" value={form.qrLink} onChange={(value) => setField("qrLink", value)} placeholder="https://line.me/... 或 https://www.instagram.com/..." /></div> : null}</div>

              {brandWebsiteGiftEligible ? (
                <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-base leading-relaxed text-violet-950">
                  <p className="font-black">🎁 本次已符合免費贈送資格</p>
                  <p className="mt-1">人工排版名片費滿 NT${BUSINESS_CARD_BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT}，付款確認後會建立「一頁式品牌網站基本版」草稿，可使用 {BUSINESS_CARD_BRAND_WEBSITE_GIFT_MONTHS} 個月。</p>
                  <p className="mt-2 text-sm text-violet-800">包含品牌／服務介紹、聯絡方式、公開網址與專屬 QR Code；之後可自行補齊內容並決定是否公開。</p>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed text-slate-700">
                  本次為自備完稿代印，未包含一頁式品牌網站贈送方案。
                </div>
              )}

              <div className="mt-5">
                <span className="mb-2 block text-base font-black text-slate-800">{form.service === "layout" ? "上傳 Logo／照片／參考圖" : "上傳自備名片完稿"}</span>
                <input id="business-card-order-files" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={handleFiles} disabled={isSubmitting || Boolean(submittedOrderCode)} className="sr-only" />
                <label htmlFor="business-card-order-files" className={`inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-base font-black text-white shadow-sm transition hover:bg-cyan-700 ${isSubmitting || Boolean(submittedOrderCode) ? "pointer-events-none opacity-60" : ""}`}>
                  ＋ 選擇並上傳檔案
                </label>
                <p className="mt-3 text-base leading-relaxed text-slate-600">可上傳 Logo、照片、商品圖或參考圖。PDF、PNG、JPG、WebP 都可；一次最多 {BUSINESS_CARD_MAX_FILES} 個檔案，單一檔案請控制在 3MB 以下。</p>
                {fileNames.length ? <div className="mt-3 flex flex-wrap gap-2">{fileNames.map((name) => <span key={name} className="rounded-full bg-cyan-50 px-3 py-1.5 text-base font-bold text-cyan-800">已選：{name}</span>)}</div> : <p className="mt-2 text-base font-bold text-slate-500">尚未選擇檔案</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-4"><p className="text-base font-black tracking-[.16em] text-cyan-700">STEP {form.service === "layout" ? "4" : "3"}</p><h2 className="mt-1 text-2xl font-black text-slate-950">宅配資料與備註</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><InputField label="收件人" value={form.contactName} onChange={(value) => setField("contactName", value)} required placeholder="請填寫真實姓名" /><InputField label="收件電話" value={form.contactPhone} onChange={(value) => setField("contactPhone", value)} required placeholder="宅配聯絡電話" /><div className="md:col-span-2"><InputField label="宅配地址" value={form.shippingAddress} onChange={(value) => setField("shippingAddress", value)} required placeholder="郵遞區號＋縣市＋完整地址" /></div>{form.service === "print" ? (
                <div className="md:col-span-2"><InputField label="其他備註／印刷需求" value={form.note} onChange={(value) => setField("note", value)} placeholder="例如：請確認檔案尺寸、不要放 Email、出貨前請先聯絡…" textarea /></div>
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-base leading-relaxed text-violet-900">名片的文字顏色、風格偏好與特殊需求，請在上方「選擇喜歡的名片風格」區塊填寫，方便工作室直接依需求排版。</div>
              )}</div><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5"><input type="checkbox" checked={form.agree} onChange={(event) => setField("agree", event.target.checked)} className="mt-1 h-5 w-5 accent-amber-500" /><span className="text-base leading-relaxed text-amber-900">我已確認頁面顯示的價格。建立訂單後，請先完成銀行匯款與回填資料；工作室核對入帳後才開始人工排版，預覽確認後安排送印。人工排版服務提供一次文字修改；符合活動資格的人工排版訂單，付款確認後會免費建立一頁式品牌網站基本版草稿。</span></label></section>
          </div>

          <aside className="xl:sticky xl:top-5 xl:col-start-2 xl:row-start-1 xl:h-fit">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><p className="text-base font-black tracking-[.16em] text-cyan-700">訂單試算</p><h2 className="mt-1 text-2xl font-black text-slate-950">目前選擇</h2><div className="mt-5 space-y-3 border-y border-slate-100 py-4 text-base"><div className="flex justify-between gap-3"><span className="text-slate-500">服務</span><strong className="text-right text-slate-900">{serviceLabel(form.service)}</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">印刷</span><strong className="text-right text-slate-900">{sideLabel(form.side)}／{finishLabel(form.finish)}</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">數量</span><strong className="text-slate-900">{quantityLabel(form.quantity)}</strong></div>{form.service === "layout" ? <div className="flex justify-between gap-3"><span className="text-slate-500">風格</span><strong className="text-right text-slate-900">{selectedStyle.code}｜{selectedStyle.title}</strong></div> : null}<div className="flex justify-between gap-3"><span className="text-slate-500">QR Code</span><strong className="text-slate-900">{form.needQr ? "需要" : "不需要"}</strong></div></div>
              <div className="space-y-3 pt-4 text-base">
                <div className="flex justify-between"><span className="text-slate-600">紙材</span><strong>{finishLabel(form.finish)}</strong></div>
                {firstWavePromotionEligible ? (
                  <>
                    <div className="flex justify-between"><span className="text-slate-600">名片費原價</span><strong className="text-slate-500 line-through">NT${regularItemPrice}</strong></div>
                    <div className="flex justify-between"><span className="text-rose-700">首波名片優惠</span><strong className="text-rose-700">-NT${itemDiscount}</strong></div>
                    <div className="flex justify-between"><span className="font-black text-slate-700">活動名片費</span><strong>NT${itemPrice}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-600">宅配運費</span><strong><span className="mr-2 text-slate-500 line-through">NT${regularShipping}</span>NT${shipping}</strong></div>
                    <div className="rounded-xl bg-rose-50 px-3 py-2 text-base font-bold text-rose-900">首波體驗活動共省 NT${totalDiscount}；此規格為人工排版＋雙面亮膜＋200 張。</div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between"><span className="font-black text-slate-700">名片費</span><strong>NT${itemPrice}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-600">宅配運費</span><strong className={shipping === 0 ? "text-emerald-600" : ""}>{shipping === 0 ? "免運" : "NT$100"}</strong></div>
                    <div className={`rounded-xl px-3 py-2 text-base font-bold ${hasFreeShipping ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                      {hasFreeShipping ? "本次已符合滿 NT$1,000 免運資格。" : `名片費再滿 NT$${amountUntilFreeShipping} 即可享免運。`}
                    </div>
                  </>
                )}
                {brandWebsiteGiftEligible ? (
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-violet-950">
                    <p className="font-black">🎁 免費贈送：一頁式品牌網站基本版</p>
                    <p className="mt-1 text-sm leading-relaxed">付款確認後開通，使用 {BUSINESS_CARD_BRAND_WEBSITE_GIFT_MONTHS} 個月，包含公開網址與 QR Code。</p>
                  </div>
                ) : null}
                <div className={`rounded-2xl px-4 py-4 text-white ${firstWavePromotionEligible ? "bg-gradient-to-r from-rose-600 to-orange-500" : "bg-gradient-to-r from-cyan-600 to-blue-600"}`}><div className="flex items-end justify-between gap-3"><span className="font-bold text-white/90">{firstWavePromotionEligible ? "首波體驗合計" : "預估合計"}</span><strong className="text-3xl font-black">NT${total}</strong></div><p className="mt-1 text-base text-white/90">{firstWavePromotionEligible ? "已含活動宅配優惠；付款頁會顯示相同金額。" : "訂單名片費滿 NT$1,000 免宅配運費"}</p></div>
              </div>
              <button type="submit" disabled={isSubmitting || Boolean(submittedOrderCode)} className="mt-5 w-full rounded-2xl bg-cyan-600 px-4 py-3.5 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">{submittedOrderCode ? `訂單 ${submittedOrderCode} 已送出` : isSubmitting ? "送出中，請稍候…" : "建立訂單，前往名片匯款"}</button>
              <button type="button" onClick={copySummary} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">{copied ? "需求內容已複製" : "先複製需求內容"}</button>
              <button type="button" onClick={saveDraft} className="mt-2 w-full rounded-2xl px-4 py-2.5 text-base font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800">暫存草稿，稍後再填</button>
              {notice ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-3 text-base leading-relaxed text-emerald-800">{notice}</p> : null}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed text-slate-600"><p className="font-black text-slate-800">付款、製作與配送</p><p className="mt-1">目前僅提供銀行匯款；一般訂單名片費未滿 NT$1,000 宅配運費 NT$100，滿 NT$1,000 自動免運。首波體驗規格已含宅配優惠，合計 NT$399。核對入帳後約 2～3 個工作天提供預覽，確認後印刷與宅配約 4～7 個工作天，整體約 7～10 個工作天送達。假日、客戶修改確認或物流延誤將順延。</p></div>
            </div>
          </aside>
        </form>
      </section>
      {previewStyle ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="名片模板完整預覽" onClick={() => setPreviewStyle(null)}>
          <div className="flex h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[1600px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-[calc(100vh-2rem)] sm:w-[calc(100vw-2rem)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div><p className="text-base font-black tracking-[.16em] text-cyan-700">完整模板預覽</p><h3 className="mt-1 text-xl font-black text-slate-950">{previewStyle.code}｜{previewStyle.title}</h3><p className="mt-1 text-base text-slate-500">{previewStyle.subtitle}</p></div>
              <button type="button" onClick={() => setPreviewStyle(null)} className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-base font-black text-slate-700 hover:bg-slate-50">關閉</button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-2 sm:p-4">
              <p className="mb-2 text-center text-base font-bold text-slate-600">可直接上下捲動查看完整模板細節。</p>
              <div className="mx-auto w-full rounded-2xl bg-white shadow-sm">
                <img
                  src={previewStyle.image}
                  alt={`${previewStyle.title} 完整名片設計模板`}
                  className="block h-auto w-full rounded-2xl"
                />
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={() => { setField("styleId", previewStyle.id); setPreviewStyle(null); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-base font-black text-white hover:bg-cyan-700">選擇此模板（{previewStyle.code}）</button></div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
