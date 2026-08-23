import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import SEO from "@/components/SEO";

type Category =
  | "全部"
  | "企業商務"
  | "極簡專業"
  | "精品質感"
  | "品牌店家"
  | "個人服務"
  | "科技創意"
  | "職業專用";
type Paper = "crystal" | "matte";
type Quantity = 200 | 500;
type Side = "front" | "back";
type ImageMode = "logo" | "portrait" | "product";
type TextAlign = "left" | "center" | "right";
type TemplateStyle =
  | "wave"
  | "ribbon"
  | "rail"
  | "frame"
  | "editorial"
  | "goldCenter"
  | "ivorySeal"
  | "shopLabel"
  | "floral"
  | "portraitLeft"
  | "portraitRight"
  | "clinic"
  | "blueprint"
  | "techPanel"
  | "creativePaper"
  | "beauty"
  | "restaurant"
  | "academy";

type Template = {
  id: string;
  name: string;
  category: Exclude<Category, "全部">;
  description: string;
  suitableFor: string;
  style: TemplateStyle;
  background: string;
  accent: string;
  ink: string;
  muted: string;
  soft: string;
  secondary?: string;
};

type FormState = {
  templateId: string;
  brandName: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  lineId: string;
  email: string;
  website: string;
  introduction: string;
  services: string;
  imageDataUrl: string;
  paper: Paper;
  quantity: Quantity;
};

type FieldId =
  | "brandName"
  | "fullName"
  | "jobTitle"
  | "phone"
  | "lineId"
  | "email"
  | "introduction"
  | "services";

type FontFamily = "Noto Sans TC" | "Noto Serif TC" | "Microsoft JhengHei" | "Arial" | "Georgia";

type TextLayer = {
  x: number;
  y: number;
  fontSize: number;
  align: TextAlign;
  visible: boolean;
  color: string;
  fontFamily: FontFamily;
  width: number;
};

type CustomTextLayer = TextLayer & {
  id: string;
  side: Side;
  text: string;
};

type SideLayers = Record<FieldId, TextLayer>;
type ImageLayer = {
  mode: ImageMode;
  /** 圖片在固定框內的裁切焦點（舊草稿相容） */
  x: number;
  y: number;
  /** 圖片內容縮放 */
  scale: number;
  /** 圖片框在名片畫布上的位移百分比 */
  offsetX?: number;
  offsetY?: number;
  /** 圖片框本身大小；100 代表模板預設尺寸 */
  frameScale?: number;
  visible: boolean;
};
type QrCodeLayer = {
  id: string;
  side: Side;
  x: number;
  y: number;
  size: number;
  visible: boolean;
  value: string;
};
type EditorState = {
  front: SideLayers;
  back: SideLayers;
  image: ImageLayer;
  customTexts: CustomTextLayer[];
  qrCodes: QrCodeLayer[];
};
type ActiveLayer = FieldId | "image" | `custom:${string}` | `qr:${string}`;

const STORAGE_KEY = "rxv_business_card_editor_v2";
const EDITOR_KEY = "rxv_business_card_editor_layers_v2";

const TEMPLATES: Template[] = [
  {
    id: "corporate-wave",
    name: "藍白企業波浪",
    category: "企業商務",
    description: "大型留白＋弧線識別",
    suitableFor: "公司行號、業務、貿易",
    style: "wave",
    background: "#ffffff",
    accent: "#1F63B5",
    ink: "#16385F",
    muted: "#55718D",
    soft: "#EAF4FF",
    secondary: "#80B8EF",
  },
  {
    id: "corporate-ribbon",
    name: "紅藍企業緞帶",
    category: "企業商務",
    description: "正式雙色緞帶資訊區",
    suitableFor: "管理職、傳產、B2B",
    style: "ribbon",
    background: "#ffffff",
    accent: "#C92B43",
    ink: "#1E3557",
    muted: "#60738A",
    soft: "#F7E7EB",
    secondary: "#1E4D8E",
  },
  {
    id: "corporate-rail",
    name: "深藍商務側欄",
    category: "企業商務",
    description: "一側識別、一側完整聯絡",
    suitableFor: "顧問、業務、企業窗口",
    style: "rail",
    background: "#F8FAFD",
    accent: "#173D75",
    ink: "#17304F",
    muted: "#62748A",
    soft: "#EAF0F8",
    secondary: "#315B9B",
  },
  {
    id: "corporate-emerald",
    name: "永續綠企業",
    category: "企業商務",
    description: "留白主體＋綠色品牌區",
    suitableFor: "健康、環保、企業服務",
    style: "wave",
    background: "#FCFFFD",
    accent: "#1F8B72",
    ink: "#1C4D43",
    muted: "#648078",
    soft: "#E4F5EF",
    secondary: "#9CD5C5",
  },

  {
    id: "minimal-line",
    name: "黑白細框",
    category: "極簡專業",
    description: "字體與留白為主角",
    suitableFor: "法務、會計、金融、建築",
    style: "frame",
    background: "#FDFDFC",
    accent: "#2C2C2C",
    ink: "#202020",
    muted: "#6C6C6C",
    soft: "#F0F0EE",
  },
  {
    id: "minimal-editorial",
    name: "編輯留白",
    category: "極簡專業",
    description: "雜誌式文字層級排版",
    suitableFor: "顧問、設計師、專業人士",
    style: "editorial",
    background: "#FCFCFA",
    accent: "#3E526A",
    ink: "#233143",
    muted: "#718093",
    soft: "#EDF1F5",
    secondary: "#A9BBCB",
  },
  {
    id: "minimal-gray",
    name: "灰階建築",
    category: "極簡專業",
    description: "幾何邊界與細緻格線",
    suitableFor: "建築、室內、工程管理",
    style: "frame",
    background: "#FAFAF8",
    accent: "#707B83",
    ink: "#2E3940",
    muted: "#738087",
    soft: "#E9EDEC",
    secondary: "#B5BEC2",
  },

  {
    id: "luxury-black",
    name: "黑金金線",
    category: "精品質感",
    description: "中心品牌識別與金色細節",
    suitableFor: "高端顧問、律師、精品服務",
    style: "goldCenter",
    background: "#171716",
    accent: "#C9A85D",
    ink: "#FFF8E9",
    muted: "#E8D6A7",
    soft: "#2B2A27",
  },
  {
    id: "luxury-ivory",
    name: "象牙印記",
    category: "精品質感",
    description: "柔白紙感、中央印章識別",
    suitableFor: "婚禮、花藝、攝影、珠寶",
    style: "ivorySeal",
    background: "#FFFCF5",
    accent: "#B79A61",
    ink: "#5B4A32",
    muted: "#8B7A61",
    soft: "#F5EDDC",
    secondary: "#D8C49B",
  },
  {
    id: "luxury-green",
    name: "墨綠會所",
    category: "精品質感",
    description: "深綠底與簡潔金線",
    suitableFor: "私人會所、房產、品牌顧問",
    style: "goldCenter",
    background: "#173E36",
    accent: "#D5B96C",
    ink: "#FFF9EA",
    muted: "#E2D5AE",
    soft: "#245149",
  },

  {
    id: "shop-cafe",
    name: "咖啡標籤",
    category: "品牌店家",
    description: "商品店章＋菜單導流",
    suitableFor: "咖啡、甜點、手作店家",
    style: "shopLabel",
    background: "#F8F0E6",
    accent: "#93613F",
    ink: "#432D20",
    muted: "#806354",
    soft: "#EEE0D1",
    secondary: "#D7B79B",
  },
  {
    id: "shop-flower",
    name: "花藝留白",
    category: "品牌店家",
    description: "原創植物線條與柔色紙感",
    suitableFor: "花藝、香氛、選物、婚禮",
    style: "floral",
    background: "#FFF9FC",
    accent: "#B46B86",
    ink: "#613C4C",
    muted: "#8F6A78",
    soft: "#F8E1E9",
    secondary: "#DDA6B8",
  },
  {
    id: "shop-tea",
    name: "茶飲導購",
    category: "品牌店家",
    description: "品牌名稱與 QR 導購優先",
    suitableFor: "飲料、伴手禮、零售品牌",
    style: "shopLabel",
    background: "#F4FBF5",
    accent: "#427B50",
    ink: "#23452B",
    muted: "#66806A",
    soft: "#DDEEE0",
    secondary: "#A5CDA8",
  },
  {
    id: "shop-restaurant",
    name: "餐館墨紅",
    category: "品牌店家",
    description: "菜單式資訊與訂位入口",
    suitableFor: "餐廳、小吃、私廚、活動餐飲",
    style: "restaurant",
    background: "#FCF7F2",
    accent: "#9C2F35",
    ink: "#4D2023",
    muted: "#83595A",
    soft: "#F2DEDA",
    secondary: "#D89A8E",
  },

  {
    id: "person-realty",
    name: "房仲信任藍",
    category: "個人服務",
    description: "人像、姓名、電話清楚分區",
    suitableFor: "房仲、代書、地產顧問",
    style: "portraitRight",
    background: "#F7FBFF",
    accent: "#2875C2",
    ink: "#173A5E",
    muted: "#5B7693",
    soft: "#DFEEFC",
    secondary: "#9EC8EC",
  },
  {
    id: "person-beauty",
    name: "柔粉美業",
    category: "個人服務",
    description: "肖像卡與溫柔服務資訊",
    suitableFor: "美睫、美甲、霧眉、沙龍",
    style: "beauty",
    background: "#FFF6F8",
    accent: "#C96D8C",
    ink: "#613747",
    muted: "#8B6673",
    soft: "#F9E0E7",
    secondary: "#E8A7B9",
  },
  {
    id: "person-coach",
    name: "講師暖杏",
    category: "個人服務",
    description: "人物介紹與專長文字層級",
    suitableFor: "講師、教練、自由工作者",
    style: "portraitLeft",
    background: "#FFF9F3",
    accent: "#B67549",
    ink: "#5C3B25",
    muted: "#846858",
    soft: "#F6E5D7",
    secondary: "#D8AB88",
  },

  {
    id: "tech-grid",
    name: "科技網格",
    category: "科技創意",
    description: "深色網格＋資訊面板",
    suitableFor: "軟體、AI、新創、工程顧問",
    style: "techPanel",
    background: "#0D2948",
    accent: "#28B5E6",
    ink: "#FFFFFF",
    muted: "#BEEBFA",
    soft: "#173C61",
    secondary: "#8ADAF4",
  },
  {
    id: "tech-paper",
    name: "數位紙張",
    category: "科技創意",
    description: "扁平色塊與清楚的安全資訊區",
    suitableFor: "設計工作室、內容創作、行銷",
    style: "creativePaper",
    background: "#F8F7FF",
    accent: "#6147C4",
    ink: "#2D245B",
    muted: "#746B9F",
    soft: "#E6E1FF",
    secondary: "#A898F2",
  },
  {
    id: "tech-mint",
    name: "薄荷介面",
    category: "科技創意",
    description: "淡色 UI 面板與導流 QR",
    suitableFor: "APP、UIUX、數位產品",
    style: "techPanel",
    background: "#F1FFFB",
    accent: "#149C8A",
    ink: "#164B48",
    muted: "#5F7F7A",
    soft: "#D7F7EF",
    secondary: "#7ED7C7",
  },

  {
    id: "job-clinic",
    name: "診所清新",
    category: "職業專用",
    description: "醫療留白與可信任的資訊排版",
    suitableFor: "診所、牙科、藥局、健康服務",
    style: "clinic",
    background: "#F7FCFF",
    accent: "#39A9D8",
    ink: "#1E4B64",
    muted: "#668294",
    soft: "#DDF3FC",
    secondary: "#94D6EF",
  },
  {
    id: "job-blueprint",
    name: "工程藍圖",
    category: "職業專用",
    description: "工程格線與安全色聯絡區",
    suitableFor: "水電、裝修、工班、設備工程",
    style: "blueprint",
    background: "#F4F8FD",
    accent: "#275EA7",
    ink: "#183B69",
    muted: "#5C7598",
    soft: "#DDE9F7",
    secondary: "#EF913B",
  },
  {
    id: "job-academy",
    name: "書頁講師",
    category: "職業專用",
    description: "書頁邊界與課程導流資訊",
    suitableFor: "補教、家教、教育顧問、課程",
    style: "academy",
    background: "#FFFDF6",
    accent: "#8B764B",
    ink: "#4E4430",
    muted: "#80745A",
    soft: "#F0E9D5",
    secondary: "#C6B17A",
  },
];

const DEFAULT_FORM: FormState = {
  templateId: "corporate-wave",
  brandName: "",
  fullName: "",
  jobTitle: "",
  phone: "",
  lineId: "",
  email: "",
  website: "",
  introduction: "",
  services: "",
  imageDataUrl: "",
  paper: "crystal",
  quantity: 200,
};

const PRICES: Record<Paper, Record<Quantity, number>> = {
  crystal: { 200: 399, 500: 549 },
  matte: { 200: 469, 500: 649 },
};

const FIELD_LABELS: Record<FieldId, string> = {
  brandName: "品牌／公司名稱",
  fullName: "姓名",
  jobTitle: "職稱",
  phone: "電話",
  lineId: "LINE ID",
  email: "Email",
  introduction: "介紹文字",
  services: "服務項目",
};

const SIDE_FIELDS: Record<Side, FieldId[]> = {
  front: ["brandName", "fullName", "jobTitle", "phone", "lineId", "email"],
  back: ["brandName", "introduction", "services", "phone", "lineId"],
};

const FONT_OPTIONS: FontFamily[] = ["Noto Sans TC", "Noto Serif TC", "Microsoft JhengHei", "Arial", "Georgia"];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function safeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "https://pomodoro-app-eight-rouge.vercel.app";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function servicesFromText(value: string): string[] {
  const list = value
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  return list.length ? list : ["服務介紹", "快速聯絡", "預約洽詢"];
}

function getTextValue(form: FormState, field: FieldId, useSample = false): string {
  const samples: Record<FieldId, string> = {
    brandName: "澄禾品牌設計",
    fullName: "王小明",
    jobTitle: "品牌顧問",
    phone: "0912-345-678",
    lineId: "@chenghe",
    email: "hello@brand.tw",
    introduction: "提供服務內容、案例與預約聯絡方式。",
    services: "品牌設計、快速聯絡、預約洽詢",
  };
  return form[field].trim() || (useSample ? samples[field] : samples[field]);
}

function textValueForSide(form: FormState, field: FieldId) {
  if (field === "services") return servicesFromText(getTextValue(form, field)).join(" · ");
  return getTextValue(form, field);
}

function isPortraitTemplate(style: TemplateStyle) {
  return style === "portraitLeft" || style === "portraitRight" || style === "beauty";
}

function createTextLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  return {
    x: 14,
    y: 16,
    fontSize: 4,
    align: "left",
    visible: true,
    color: "#243447",
    fontFamily: "Noto Sans TC",
    width: 42,
    ...overrides,
  };
}

function cloneSideLayers(source: SideLayers): SideLayers {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, { ...value }]),
  ) as SideLayers;
}

function makeLayers(template: Template): EditorState {
  const base: SideLayers = {
    brandName: createTextLayer({ x: 14, y: 16, fontSize: 4.2, width: 50 }),
    fullName: createTextLayer({ x: 14, y: 37, fontSize: 7.2, width: 36 }),
    jobTitle: createTextLayer({ x: 14, y: 53, fontSize: 3.4, color: template.muted, width: 34 }),
    phone: createTextLayer({ x: 14, y: 74, fontSize: 3.1, color: template.muted, width: 36 }),
    lineId: createTextLayer({ x: 14, y: 82, fontSize: 2.9, color: template.muted, width: 36 }),
    email: createTextLayer({ x: 14, y: 89, fontSize: 2.6, color: template.muted, width: 42 }),
    introduction: createTextLayer({ x: 14, y: 29, fontSize: 3.3, color: template.muted, width: 48 }),
    services: createTextLayer({ x: 14, y: 62, fontSize: 2.8, color: template.muted, width: 48 }),
  };
  const front = cloneSideLayers(base);
  const back = cloneSideLayers(base);
  back.brandName = { ...back.brandName, x: 14, y: 16, fontSize: 4.3 };
  back.introduction = { ...back.introduction, x: 14, y: 34, fontSize: 3.4 };
  back.services = { ...back.services, x: 14, y: 61, fontSize: 2.9 };
  back.phone = { ...back.phone, x: 14, y: 79, fontSize: 2.9 };
  back.lineId = { ...back.lineId, x: 14, y: 87, fontSize: 2.8 };

  if (template.style === "wave") {
    Object.assign(front.brandName, { x: 43, y: 18 });
    Object.assign(front.fullName, { x: 43, y: 40 });
    Object.assign(front.jobTitle, { x: 43, y: 55 });
    Object.assign(front.phone, { x: 43, y: 75 });
    Object.assign(front.lineId, { x: 43, y: 83 });
    Object.assign(front.email, { x: 43, y: 90 });
    Object.assign(back.brandName, { x: 42, y: 18 });
    Object.assign(back.introduction, { x: 42, y: 37 });
    Object.assign(back.services, { x: 42, y: 62 });
    Object.assign(back.phone, { x: 42, y: 79 });
    Object.assign(back.lineId, { x: 42, y: 87 });
  }
  if (template.style === "ribbon") {
    Object.assign(front.brandName, { x: 24, y: 22 });
    Object.assign(front.fullName, { x: 24, y: 43 });
    Object.assign(front.jobTitle, { x: 24, y: 56 });
    Object.assign(front.phone, { x: 24, y: 74 });
    Object.assign(front.lineId, { x: 24, y: 82 });
    Object.assign(front.email, { x: 24, y: 89 });
    Object.assign(back.brandName, { x: 17, y: 25 });
    Object.assign(back.introduction, { x: 17, y: 43 });
    Object.assign(back.services, { x: 17, y: 65 });
  }
  if (template.style === "rail") {
    Object.assign(front.brandName, { x: 42, y: 16 });
    Object.assign(front.fullName, { x: 42, y: 38 });
    Object.assign(front.jobTitle, { x: 42, y: 52 });
    Object.assign(front.phone, { x: 42, y: 74 });
    Object.assign(front.lineId, { x: 42, y: 82 });
    Object.assign(front.email, { x: 42, y: 89 });
    Object.assign(back.brandName, { x: 40, y: 18 });
    Object.assign(back.introduction, { x: 40, y: 38 });
    Object.assign(back.services, { x: 40, y: 64 });
  }
  if (template.style === "goldCenter" || template.style === "ivorySeal") {
    for (const field of ["brandName", "fullName", "jobTitle", "phone", "lineId", "email"] as FieldId[]) {
      front[field] = { ...front[field], x: 50, align: "center" };
    }
    Object.assign(front.brandName, { y: 29 });
    Object.assign(front.fullName, { y: 45 });
    Object.assign(front.jobTitle, { y: 58 });
    Object.assign(front.phone, { y: 76 });
    Object.assign(front.lineId, { y: 83 });
    Object.assign(front.email, { y: 90 });
    Object.assign(back.brandName, { x: 50, y: 24, align: "center" });
    Object.assign(back.introduction, { x: 50, y: 43, align: "center" });
    Object.assign(back.services, { x: 50, y: 65, align: "center" });
  }
  if (template.style === "portraitRight") {
    Object.assign(front.brandName, { x: 10, y: 18 });
    Object.assign(front.fullName, { x: 10, y: 39 });
    Object.assign(front.jobTitle, { x: 10, y: 54 });
    Object.assign(front.phone, { x: 10, y: 75 });
    Object.assign(front.lineId, { x: 10, y: 83 });
    Object.assign(front.email, { x: 10, y: 90 });
  }
  if (template.style === "portraitLeft" || template.style === "beauty") {
    Object.assign(front.brandName, { x: 46, y: 18 });
    Object.assign(front.fullName, { x: 46, y: 39 });
    Object.assign(front.jobTitle, { x: 46, y: 54 });
    Object.assign(front.phone, { x: 46, y: 75 });
    Object.assign(front.lineId, { x: 46, y: 83 });
    Object.assign(front.email, { x: 46, y: 90 });
    Object.assign(back.brandName, { x: 43, y: 18 });
    Object.assign(back.introduction, { x: 43, y: 37 });
    Object.assign(back.services, { x: 43, y: 62 });
  }
  if (template.style === "techPanel") {
    Object.assign(front.brandName, { x: 17, y: 18 });
    Object.assign(front.fullName, { x: 17, y: 38 });
    Object.assign(front.jobTitle, { x: 17, y: 53 });
    Object.assign(front.phone, { x: 17, y: 75 });
    Object.assign(front.lineId, { x: 17, y: 83 });
    Object.assign(front.email, { x: 17, y: 90 });
  }
  if (template.style === "academy") {
    Object.assign(front.brandName, { x: 23, y: 20 });
    Object.assign(front.fullName, { x: 23, y: 41 });
    Object.assign(front.jobTitle, { x: 23, y: 55 });
    Object.assign(front.phone, { x: 23, y: 76 });
    Object.assign(front.lineId, { x: 23, y: 84 });
    Object.assign(front.email, { x: 23, y: 91 });
    Object.assign(back.brandName, { x: 23, y: 20 });
    Object.assign(back.introduction, { x: 23, y: 39 });
  }
  if (template.style === "blueprint") {
    Object.assign(front.brandName, { x: 10, y: 24 });
    Object.assign(front.fullName, { x: 10, y: 43 });
    Object.assign(front.jobTitle, { x: 10, y: 57 });
    Object.assign(front.phone, { x: 10, y: 80 });
    Object.assign(front.lineId, { x: 53, y: 80 });
    Object.assign(front.email, { x: 10, y: 90 });
  }
  return {
    front,
    back,
    image: {
      mode: isPortraitTemplate(template.style) ? "portrait" : "logo",
      x: 50,
      y: 50,
      scale: 100,
      offsetX: 0,
      offsetY: 0,
      frameScale: 100,
      visible: true,
    },
    customTexts: [],
    qrCodes: [{ id: "qr-default", side: "back", x: template.style === "wave" || template.style === "rail" || template.style === "portraitLeft" || template.style === "beauty" ? 77 : 76, y: 39, size: 14, visible: true, value: "" }],
  };
}

function templateSample(template: Template): FormState {
  const general: FormState = {
    ...DEFAULT_FORM,
    templateId: template.id,
    brandName: "北辰企業服務",
    fullName: "陳明達",
    jobTitle: "業務經理",
    phone: "02-2788-6028",
    lineId: "@beichen",
    email: "service@beichen.tw",
    website: "https://example.com",
    introduction: "提供專業服務說明、案例與預約聯絡方式。",
    services: "服務介紹、立即聯絡、預約洽詢",
  };
  const byStyle: Partial<Record<TemplateStyle, Partial<FormState>>> = {
    goldCenter: { brandName: "典藏品牌顧問", fullName: "郭明哲", jobTitle: "品牌總監", phone: "02-2718-5808", lineId: "@collectionpro", email: "private@collection.tw", introduction: "專屬服務內容與預約聯絡入口。", services: "專屬服務、會員預約、快速聯絡" },
    ivorySeal: { brandName: "森語花藝工作室", fullName: "林書妍", jobTitle: "花藝主理人", phone: "0918-642-356", lineId: "@forestbloom", email: "hello@forestbloom.tw", introduction: "花禮設計、婚禮佈置與預約諮詢。", services: "花禮設計、婚禮佈置、預約洽詢" },
    shopLabel: { brandName: template.id === "shop-tea" ? "春山茶飲" : "暖日咖啡", fullName: "菜單與訂位", jobTitle: "咖啡・甜點・外帶", phone: "02-2557-8306", lineId: "@warmsun.cafe", email: "hello@warmsun.tw", introduction: "掃碼查看今日菜單、優惠與訂位資訊。", services: "今日菜單、訂位服務、LINE 聯絡" },
    floral: { brandName: "花嶼小店", fullName: "日常花禮與選物", jobTitle: "花藝・生活・購物", phone: "0910-624-188", lineId: "@flowerisland", email: "hello@flowerisland.tw", introduction: "花禮訂製、香氛選物與活動佈置。", services: "花禮訂製、香氛選物、預約諮詢" },
    restaurant: { brandName: "墨香私廚", fullName: "訂位與包場服務", jobTitle: "中式私廚・季節料理", phone: "02-2765-1488", lineId: "@moxiangtable", email: "booking@moxiang.tw", introduction: "掃碼查看菜單、私廚訂位與包場資訊。", services: "線上訂位、私廚包場、菜單查看" },
    portraitRight: { brandName: "安心家不動產", fullName: "張宇揚", jobTitle: "地產顧問", phone: "0912-681-520", lineId: "@homecare", email: "yang@homecare.tw", introduction: "買賣屋、租賃與資產規劃服務。", services: "買賣屋、租賃服務、快速聯絡" },
    portraitLeft: { brandName: "樂行教練工作室", fullName: "蔡思妤", jobTitle: "生涯教練", phone: "0915-775-214", lineId: "@moveforward", email: "hi@moveforward.tw", introduction: "職涯探索、目標規劃與一對一諮詢。", services: "一對一諮詢、課程資訊、預約洽詢" },
    beauty: { brandName: "柔光美學", fullName: "陳安庭", jobTitle: "美睫・美甲師", phone: "0917-339-420", lineId: "@softglow", email: "booking@softglow.tw", introduction: "美睫、美甲與個人造型預約服務。", services: "線上預約、作品查看、LINE 聯絡" },
    techPanel: { brandName: "星曜數位科技", fullName: "謝承恩", jobTitle: "產品經理", phone: "02-2768-3650", lineId: "@stardigital", email: "service@stardigital.tw", introduction: "數位產品、網站服務與專案合作入口。", services: "產品設計、網站服務、專案合作" },
    blueprint: { brandName: "澄禾工程行", fullName: "張家豪", jobTitle: "工程服務", phone: "0916-551-300", lineId: "@chenghebuild", email: "service@chenghe.tw", introduction: "水電、裝修、設備工程與到府估價。", services: "水電工程、裝修服務、快速估價" },
    academy: { brandName: "知行學習工作室", fullName: "許若晴", jobTitle: "課程顧問", phone: "0911-602-401", lineId: "@learnwell", email: "hello@learnwell.tw", introduction: "課程規劃、一對一諮詢與預約入口。", services: "課程諮詢、一對一服務、預約洽詢" },
  };
  return { ...general, ...(byStyle[template.style] ?? {}) };
}


function TemplateDecoration({ template, side }: { template: Template; side: Side }) {
  const secondary = template.secondary ?? template.soft;
  const dark = ["goldCenter", "techPanel"].includes(template.style);
  const solid = (color: string) => ({ backgroundColor: color });
  const line = (color: string) => ({ borderColor: color });

  return (
    <>
      {template.style === "wave" && (
        <>
          <div className="absolute -left-[18%] -top-[38%] h-[150%] w-[45%] rounded-full" style={solid(template.accent)} />
          <div className="absolute -left-[6%] bottom-[-45%] h-[92%] w-[32%] rounded-full border-[8px] border-white/75" />
          <div className="absolute right-[8%] top-[10%] h-[80%] w-[74%] opacity-35" style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent 0 7px, ${template.accent}1b 7px 11px)` }} />
        </>
      )}
      {template.style === "ribbon" && (
        <>
          <div className="absolute inset-x-0 top-0 h-[20%]" style={solid(template.accent)} />
          <div className="absolute inset-x-0 bottom-0 h-[22%]" style={solid(template.accent)} />
          <div className="absolute left-0 top-[20%] h-[60%] w-[18%]" style={solid(secondary)} />
          <div className="absolute right-0 top-[20%] h-[60%] w-[12%]" style={solid(secondary)} />
        </>
      )}
      {template.style === "rail" && (
        <>
          <div className="absolute inset-y-0 left-0 w-[31%]" style={solid(template.accent)} />
          <div className="absolute inset-y-[10%] left-[31%] w-px bg-slate-200" />
        </>
      )}
      {template.style === "frame" && (
        <>
          <div className="absolute inset-[7%] border" style={line(template.accent)} />
          <div className="absolute left-[11%] top-[17%] h-px w-[25%]" style={solid(template.accent)} />
        </>
      )}
      {template.style === "editorial" && (
        <>
          <div className="absolute left-[8%] top-0 h-full w-[4px]" style={solid(template.accent)} />
          <div className="absolute right-[8%] top-[12%] h-[76%] w-px" style={solid(`${template.accent}66`)} />
        </>
      )}
      {template.style === "goldCenter" && (
        <>
          <div className="absolute inset-[6%] border" style={line(`${template.accent}CC`)} />
          <div className="absolute left-[10%] top-[13%] h-px w-[20%]" style={solid(template.accent)} />
          <div className="absolute bottom-[13%] right-[10%] h-px w-[20%]" style={solid(template.accent)} />
        </>
      )}
      {template.style === "ivorySeal" && (
        <>
          <div className="absolute inset-[7%] rounded-[12px] border" style={line(`${template.accent}AA`)} />
          <div className="absolute left-1/2 top-1/2 h-[38%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] opacity-25" style={line(template.accent)} />
        </>
      )}
      {template.style === "shopLabel" && (
        <>
          <div className="absolute bottom-0 left-0 h-[24%] w-full" style={solid(template.accent)} />
          <div className="absolute right-[8%] top-[12%] h-[34%] w-[20%] rotate-3 rounded-lg border-2 bg-white/80" style={line(`${template.accent}88`)} />
        </>
      )}
      {template.style === "floral" && (
        <>
          <div className="absolute -left-[4%] bottom-[-12%] h-[52%] w-[30%] rounded-full border-[10px] opacity-40" style={line(template.accent)} />
          <div className="absolute left-[8%] bottom-[15%] h-[42%] w-px rotate-[-20deg]" style={solid(`${template.accent}88`)} />
          <div className="absolute right-[7%] top-[8%] h-[18%] w-[18%] rounded-full border-[5px] opacity-35" style={line(secondary)} />
        </>
      )}
      {template.style === "restaurant" && (
        <>
          <div className="absolute inset-x-0 top-0 h-[16%]" style={solid(template.accent)} />
          <div className="absolute inset-x-[9%] top-[16%] h-px" style={solid(`${template.accent}77`)} />
          <div className="absolute bottom-[10%] left-[9%] h-[6%] w-[30%]" style={solid(secondary)} />
        </>
      )}
      {(template.style === "portraitLeft" || template.style === "beauty") && (
        <>
          <div className="absolute inset-y-0 left-0 w-[37%]" style={solid(template.style === "beauty" ? template.soft : template.accent)} />
          {template.style === "beauty" ? <div className="absolute left-[9%] top-[12%] h-[20%] w-[19%] rounded-full border-[4px] opacity-45" style={line(template.accent)} /> : null}
        </>
      )}
      {template.style === "portraitRight" && <div className="absolute inset-y-0 right-0 w-[34%]" style={solid(template.accent)} />}
      {template.style === "clinic" && (
        <>
          <div className="absolute right-[8%] top-[11%] grid h-[26%] w-[16%] place-items-center rounded-2xl" style={solid(template.soft)}><span className="text-3xl font-black" style={{ color: template.accent }}>＋</span></div>
          <div className="absolute bottom-0 left-0 h-[18%] w-full" style={solid(template.soft)} />
        </>
      )}
      {template.style === "blueprint" && (
        <>
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: `linear-gradient(${template.accent}18 1px, transparent 1px), linear-gradient(90deg, ${template.accent}18 1px, transparent 1px)`, backgroundSize: "12px 12px" }} />
          <div className="absolute bottom-0 left-0 h-[20%] w-full" style={solid(template.accent)} />
          <div className="absolute right-[8%] top-[10%] h-[8%] w-[18%]" style={solid(secondary)} />
        </>
      )}
      {template.style === "techPanel" && (
        <>
          <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
          <div className="absolute inset-y-[10%] left-[8%] right-[8%] rounded-2xl border bg-white/95" style={line(`${template.accent}99`)} />
        </>
      )}
      {template.style === "creativePaper" && (
        <>
          <div className="absolute -left-[8%] top-[8%] h-[36%] w-[42%] rotate-[-10deg] rounded-[2rem]" style={solid(template.accent)} />
          <div className="absolute right-[7%] top-[12%] h-[20%] w-[17%] rounded-full" style={solid(secondary)} />
          <div className="absolute bottom-0 right-0 h-[26%] w-[46%] rounded-tl-[2rem]" style={solid(template.soft)} />
        </>
      )}
      {template.style === "academy" && (
        <>
          <div className="absolute inset-y-0 left-0 w-[13%]" style={solid(template.accent)} />
          <div className="absolute inset-y-[9%] right-[8%] w-px" style={solid(`${template.accent}55`)} />
          <div className="absolute left-[13%] top-[17%] h-px w-[15%]" style={solid(secondary)} />
        </>
      )}
      {side === "back" && !dark && <div className="absolute inset-0 bg-white/10" />}
    </>
  );
}

function getCanvasInk(template: Template) {
  return template.style === "techPanel" ? "#173A52" : template.ink;
}

function getCanvasMuted(template: Template) {
  return template.style === "techPanel" ? "#4E6879" : template.muted;
}

function ImageSlot({
  template,
  form,
  image,
  editable,
  active,
  onSelect,
  onDragStart,
}: {
  template: Template;
  form: FormState;
  image: ImageLayer;
  editable: boolean;
  active: boolean;
  onSelect: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  if (!image.visible) return null;

  const portrait = image.mode === "portrait" || isPortraitTemplate(template.style);
  const useRight = template.style === "portraitRight";
  const useLeft = template.style === "portraitLeft" || template.style === "beauty";

  // 改成統一 left/top 定位，才能讓使用者拖曳整個圖片框，而不是只能改物件裁切焦點。
  const baseSlot = portrait
    ? useRight
      ? { left: 69, top: 12, width: 24, height: 70 }
      : useLeft
        ? { left: 7, top: 12, width: 25, height: 72 }
        : { left: 66, top: 18, width: 24, height: 56 }
    : {
        left: template.style === "wave" || template.style === "rail" ? 13 : 10,
        top: 12,
        width: 15,
        height: 25,
      };

  const offsetX = image.offsetX ?? 0;
  const offsetY = image.offsetY ?? 0;
  const frameScale = image.frameScale ?? 100;
  const source = form.imageDataUrl;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={(event) => {
        if (editable) onDragStart?.(event);
      }}
      className={`absolute z-20 overflow-hidden bg-white/85 shadow-sm transition ${portrait ? "rounded-xl" : "rounded-lg"} ${editable ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${editable && active ? "ring-2 ring-cyan-400 ring-offset-2" : ""}`}
      style={{
        left: `calc(${baseSlot.left}% + ${offsetX}%)`,
        top: `calc(${baseSlot.top}% + ${offsetY}%)`,
        width: `${baseSlot.width}%`,
        height: `${baseSlot.height}%`,
        transform: `scale(${frameScale / 100})`,
        transformOrigin: "center",
      }}
      aria-label="選取並拖曳圖片"
      title={editable ? "拖曳圖片可移動位置；右側可調整大小" : undefined}
    >
      {source ? (
        <img
          src={source}
          alt="上傳圖片"
          className="h-full w-full"
          draggable={false}
          style={{
            objectFit: image.mode === "logo" ? "contain" : "cover",
            objectPosition: `${image.x}% ${image.y}%`,
            transform: `scale(${image.scale / 100})`,
            transformOrigin: "center",
          }}
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-center text-[clamp(9px,1.1vw,14px)] font-black"
          style={{ color: template.accent }}
        >
          {portrait ? "上傳人像" : "上傳 Logo"}
        </span>
      )}
    </button>
  );
}
function QrLayer({
  template,
  form,
  layer,
  editable,
  active,
  onSelect,
  onDragStart,
  onResizeStart,
}: {
  template: Template;
  form: FormState;
  layer: QrCodeLayer;
  editable: boolean;
  active: boolean;
  onSelect: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  if (!layer.visible) return null;
  const target = safeUrl(layer.value || form.website);
  return (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerDown={(event) => editable && onDragStart?.(event)}
      className={`absolute z-20 grid place-items-center rounded-xl bg-white p-1.5 shadow-md ${editable ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${editable && active ? "ring-2 ring-cyan-400 ring-offset-2" : ""}`}
      style={{ left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.size}%`, height: `${layer.size * 1.66}%` }}
      aria-label="QR Code"
    >
      <QRCodeSVG value={target} className="h-full w-full" includeMargin={false} level="M" />
      {editable && active ? <button type="button" onPointerDown={(event) => { event.stopPropagation(); onResizeStart?.(event); }} className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-cyan-500 shadow" aria-label="調整 QR Code 大小" /> : null}
    </button>
  );
}

function EditableText({
  field,
  side,
  form,
  layer,
  template,
  editable,
  active,
  onSelect,
  onDragStart,
  onResizeStart,
}: {
  field: FieldId;
  side: Side;
  form: FormState;
  layer: TextLayer;
  template: Template;
  editable: boolean;
  active: boolean;
  onSelect: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>, field: FieldId) => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>, field: FieldId) => void;
}) {
  if (!layer.visible) return null;
  const text = textValueForSide(form, field);
  const isBrand = field === "brandName";
  const isName = field === "fullName";
  const isBody = field === "introduction" || field === "services";
  const color = getCanvasInk(template);
  const muted = getCanvasMuted(template);
  const bottomWhite = template.style === "blueprint" && (field === "phone" || field === "lineId");
  return (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerDown={(event) => editable && onDragStart(event, field)}
      className={`absolute z-30 block max-w-[84%] select-none whitespace-nowrap rounded px-1 ${editable ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-default"} ${active && editable ? "ring-2 ring-cyan-400 ring-offset-2" : ""}`}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        width: `${layer.width}%`,
        color: bottomWhite ? "#ffffff" : layer.color || (isName ? color : isBrand ? color : muted),
        fontSize: `${Math.round(layer.fontSize * 4)}px`,
        fontWeight: isName || isBrand ? 800 : field === "jobTitle" ? 700 : 600,
        fontFamily: layer.fontFamily,
        letterSpacing: isBrand ? ".04em" : 0,
        lineHeight: 1.25,
        transform: layer.align === "center" ? "translateX(-50%)" : layer.align === "right" ? "translateX(-100%)" : undefined,
        textAlign: layer.align,
        textShadow: template.style === "goldCenter" && field !== "email" ? "0 1px 0 rgba(0,0,0,.2)" : undefined,
      }}
      title={editable ? `拖曳或選取「${FIELD_LABELS[field]}」` : undefined}
    >
      <span className={isBody ? "line-clamp-3 whitespace-normal" : "block truncate"}>{text}</span>
      {editable && active ? <button type="button" onPointerDown={(event) => { event.stopPropagation(); onResizeStart?.(event, field); }} className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-cyan-500 shadow" aria-label="調整文字框大小" /> : null}
    </button>
  );
}

function CustomText({
  layer,
  editable,
  active,
  onSelect,
  onDragStart,
  onResizeStart,
}: {
  layer: CustomTextLayer;
  editable: boolean;
  active: boolean;
  onSelect: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  if (!layer.visible) return null;
  return (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerDown={(event) => editable && onDragStart(event)}
      className={`absolute z-30 block max-w-[84%] select-none whitespace-nowrap rounded px-1 ${editable ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-default"} ${active && editable ? "ring-2 ring-cyan-400 ring-offset-2" : ""}`}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        width: `${layer.width}%`,
        color: layer.color,
        fontSize: `${Math.round(layer.fontSize * 4)}px`,
        fontWeight: 600,
        fontFamily: layer.fontFamily,
        lineHeight: 1.25,
        transform: layer.align === "center" ? "translateX(-50%)" : layer.align === "right" ? "translateX(-100%)" : undefined,
        textAlign: layer.align,
      }}
    >
      <span className="line-clamp-3 whitespace-normal">{layer.text || "自訂文字"}</span>
      {editable && active ? <button type="button" onPointerDown={(event) => { event.stopPropagation(); onResizeStart?.(event); }} className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-cyan-500 shadow" aria-label="調整文字框大小" /> : null}
    </button>
  );
}

function CardCanvas({
  template,
  form,
  editor,
  side,
  editable = false,
  activeLayer,
  onSelectLayer,
  onStartDrag,
  onStartTextResize,
  onStartImageDrag,
  onStartCustomTextDrag,
  onStartCustomTextResize,
  onStartQrDrag,
  onStartQrResize,
  showSafeArea = false,
}: {
  template: Template;
  form: FormState;
  editor: EditorState;
  side: Side;
  editable?: boolean;
  activeLayer?: ActiveLayer;
  onSelectLayer?: (layer: ActiveLayer) => void;
  onStartDrag?: (event: ReactPointerEvent<HTMLButtonElement>, field: FieldId) => void;
  onStartTextResize?: (event: ReactPointerEvent<HTMLButtonElement>, field: FieldId) => void;
  onStartImageDrag?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onStartCustomTextDrag?: (event: ReactPointerEvent<HTMLButtonElement>, id: string) => void;
  onStartCustomTextResize?: (event: ReactPointerEvent<HTMLButtonElement>, id: string) => void;
  onStartQrDrag?: (event: ReactPointerEvent<HTMLButtonElement>, id: string) => void;
  onStartQrResize?: (event: ReactPointerEvent<HTMLButtonElement>, id: string) => void;
  showSafeArea?: boolean;
}) {
  const fields = SIDE_FIELDS[side];
  return (
    <div
      data-card-canvas
      className="relative isolate overflow-hidden rounded-[10px] border bg-white shadow-sm"
      style={{
        aspectRatio: "90 / 54",
        containerType: "inline-size",
        borderColor: `${template.accent}70`,
        backgroundColor: template.background,
      }}
    >
      <TemplateDecoration template={template} side={side} />
      <ImageSlot
        template={template}
        form={form}
        image={editor.image}
        editable={editable}
        active={activeLayer === "image"}
        onSelect={() => onSelectLayer?.("image")}
        onDragStart={onStartImageDrag}
      />
      {fields.map((field) => (
        <EditableText
          key={field}
          field={field}
          side={side}
          form={form}
          layer={editor[side][field]}
          template={template}
          editable={editable}
          active={activeLayer === field}
          onSelect={() => onSelectLayer?.(field)}
          onDragStart={(event, selectedField) => onStartDrag?.(event, selectedField)}
          onResizeStart={(event, selectedField) => onStartTextResize?.(event, selectedField)}
        />
      ))}
      {editor.customTexts.filter((item) => item.side === side).map((item) => (
        <CustomText
          key={item.id}
          layer={item}
          editable={editable}
          active={activeLayer === `custom:${item.id}`}
          onSelect={() => onSelectLayer?.(`custom:${item.id}`)}
          onDragStart={(event) => onStartCustomTextDrag?.(event, item.id)}
          onResizeStart={(event) => onStartCustomTextResize?.(event, item.id)}
        />
      ))}
      {editor.qrCodes.filter((item) => item.side === side).map((item) => (
        <QrLayer
          key={item.id}
          template={template}
          form={form}
          layer={item}
          editable={editable}
          active={activeLayer === `qr:${item.id}`}
          onSelect={() => onSelectLayer?.(`qr:${item.id}`)}
          onDragStart={(event) => onStartQrDrag?.(event, item.id)}
          onResizeStart={(event) => onStartQrResize?.(event, item.id)}
        />
      ))}
      {showSafeArea ? <div className="pointer-events-none absolute inset-[5%] z-40 border border-dashed border-cyan-400/80" /> : null}
    </div>
  );
}

function TemplatePreviewCard({
  template,
  onPreview,
  onEdit,
}: {
  template: Template;
  onPreview: () => void;
  onEdit: () => void;
}) {
  const sample = templateSample(template);
  const layers = makeLayers(template);
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg">
      <div className="rounded-xl bg-slate-100 p-3">
        <CardCanvas template={template} form={sample} editor={layers} side="front" />
      </div>
      <div className="px-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-black text-slate-950">{template.name}</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-600">{template.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{template.category}</span>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500">適合：{template.suitableFor}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onPreview} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">看正反面</button>
          <button type="button" onClick={onEdit} className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-black text-white hover:bg-cyan-700">編輯此模板</button>
        </div>
      </div>
    </article>
  );
}

function PreviewModal({ template, onClose, onEdit }: { template: Template; onClose: () => void; onEdit: () => void }) {
  const sample = templateSample(template);
  const layers = makeLayers(template);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-cyan-700">名片成品預覽</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-500">這裡看到的是實際正反面平面設計；桌面、紙材陰影等只會在網站成品示意使用，不會印進名片。</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-2xl text-slate-500 hover:bg-slate-50">×</button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div><p className="mb-2 text-sm font-black text-slate-700">正面送印稿</p><CardCanvas template={template} form={sample} editor={layers} side="front" /></div>
          <div><p className="mb-2 text-sm font-black text-slate-700">背面送印稿</p><CardCanvas template={template} form={sample} editor={layers} side="back" /></div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">繼續看其他模板</button>
          <button type="button" onClick={onEdit} className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-700">使用並開始編輯</button>
        </div>
      </div>
    </div>
  );
}

function Catalog({
  form,
  filter,
  onFilter,
  onPreview,
  onEdit,
}: {
  form: FormState;
  filter: Category;
  onFilter: (value: Category) => void;
  onPreview: (template: Template) => void;
  onEdit: (template: Template) => void;
}) {
  const categories: Category[] = ["全部", "企業商務", "極簡專業", "精品質感", "品牌店家", "個人服務", "科技創意", "職業專用"];
  const templates = filter === "全部" ? TEMPLATES : TEMPLATES.filter((item) => item.category === filter);
  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <SEO title="AI 名片設計＋印刷代辦｜RXV 商業工具" description="選擇名片版型，進入編輯器調整文字、圖片、正反面與印刷方案。" />
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-700 to-indigo-700 px-6 py-7 text-white shadow-lg sm:px-8">
          <p className="text-sm font-black tracking-[.18em] text-cyan-100">RXV 商業工具</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><h1 className="text-3xl font-black sm:text-4xl">AI 名片設計＋印刷代辦</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-cyan-50 sm:text-base">先選擇看得懂的名片成品，再進入編輯器調整文字、圖片與正反面。畫布使用 90 × 54 mm 比例，送印前仍由工作室確認安全邊界與 QR Code。</p></div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-cyan-50">已選：{TEMPLATES.find((item) => item.id === form.templateId)?.name ?? "尚未選擇"}</div>
          </div>
        </div>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black text-slate-950">選擇名片成品</h2><p className="mt-1 text-sm text-slate-500">模板縮圖就是正面送印稿，點進去再編輯文字、圖片與位置。</p></div><span className="w-fit rounded-full bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-800">共 {TEMPLATES.length} 款</span></div>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category === "全部" ? TEMPLATES.length : TEMPLATES.filter((item) => item.category === category).length;
              const active = filter === category;
              return <button key={category} type="button" onClick={() => onFilter(category)} className={`inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-black transition ${active ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-cyan-400 hover:bg-cyan-50"}`}><span>{category}</span><span className="ml-1.5 text-xs opacity-75">{count}</span></button>;
            })}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <TemplatePreviewCard key={template.id} template={template} onPreview={() => onPreview(template)} onEdit={() => onEdit(template)} />)}</div>
        </section>
      </section>
    </main>
  );
}

function InputField({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">{label}</span>{textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />}</label>;
}

function Editor({
  form,
  setForm,
  editor,
  setEditor,
  template,
  onBack,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editor: EditorState;
  setEditor: Dispatch<SetStateAction<EditorState>>;
  template: Template;
  onBack: () => void;
}) {
  const [side, setSide] = useState<Side>("front");
  const [panel, setPanel] = useState<"text" | "image" | "style">("text");
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>("brandName");
  const [notice, setNotice] = useState("");
  const price = PRICES[form.paper][form.quantity];

  const isCustomActive = activeLayer.startsWith("custom:");
  const isQrActive = activeLayer.startsWith("qr:");
  const activeCustomId = isCustomActive ? activeLayer.replace("custom:", "") : "";
  const activeQrId = isQrActive ? activeLayer.replace("qr:", "") : "";
  const activeCustomLayer = editor.customTexts.find((item) => item.id === activeCustomId);
  const activeQrLayer = editor.qrCodes.find((item) => item.id === activeQrId);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateLayer = (field: FieldId, patch: Partial<TextLayer>) => setEditor((current) => ({ ...current, [side]: { ...current[side], [field]: { ...current[side][field], ...patch } } }));
  const updateCustomText = (id: string, patch: Partial<CustomTextLayer>) => setEditor((current) => ({ ...current, customTexts: current.customTexts.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const updateQrCode = (id: string, patch: Partial<QrCodeLayer>) => setEditor((current) => ({ ...current, qrCodes: current.qrCodes.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const addCustomText = () => {
    const id = `t${Date.now()}`;
    setEditor((current) => ({ ...current, customTexts: [...current.customTexts, { id, side, text: "請輸入文字", ...createTextLayer({ x: 16, y: side === "front" ? 12 : 14, width: 36, fontSize: 3.6, color: template.ink }) }] }));
    setActiveLayer(`custom:${id}`);
    setPanel("text");
  };
  const addQrCode = () => {
    const id = `q${Date.now()}`;
    setEditor((current) => ({ ...current, qrCodes: [...current.qrCodes, { id, side, x: 72, y: 32, size: 14, visible: true, value: form.website || "" }] }));
    setActiveLayer(`qr:${id}`);
  };
  const updateImage = (patch: Partial<ImageLayer>) => setEditor((current) => ({ ...current, image: { ...current.image, ...patch } }));
  const currentLayer = activeLayer === "image" || isCustomActive || isQrActive ? null : editor[side][activeLayer as FieldId];

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setNotice("請選擇 JPG、PNG 或 WebP 圖片。"); return; }
    if (file.size > 2_500_000) { setNotice("圖片請控制在 2.5MB 以下，避免草稿儲存失敗。"); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") { setField("imageDataUrl", reader.result); setNotice("圖片已上傳。請點選畫布上的圖片，再拖曳移動；右側可調整圖片框大小與內容縮放。"); } };
    reader.readAsDataURL(file);
  };

  const moveLayer = (dx: number, dy: number) => {
    if (activeLayer === "image") {
      return updateImage({
        offsetX: clamp((editor.image.offsetX ?? 0) + dx * 2, -45, 45),
        offsetY: clamp((editor.image.offsetY ?? 0) + dy * 2, -45, 45),
      });
    }
    if (isCustomActive && activeCustomLayer) {
      return updateCustomText(activeCustomLayer.id, { x: clamp(activeCustomLayer.x + dx, 3, 97), y: clamp(activeCustomLayer.y + dy, 4, 94) });
    }
    if (isQrActive && activeQrLayer) {
      return updateQrCode(activeQrLayer.id, { x: clamp(activeQrLayer.x + dx, 3, 90), y: clamp(activeQrLayer.y + dy, 4, 88) });
    }
    updateLayer(activeLayer as FieldId, {
      x: clamp(currentLayer!.x + dx, 3, 97),
      y: clamp(currentLayer!.y + dy, 4, 94),
    });
  };

  const resetActive = () => {
    const defaults = makeLayers(template);
    if (activeLayer === "image") updateImage(defaults.image);
    else if (isCustomActive && activeCustomLayer) updateCustomText(activeCustomLayer.id, createTextLayer({ x: 16, y: 16, width: 36, fontSize: 3.6, color: template.ink, fontFamily: "Noto Sans TC" }));
    else if (isQrActive && activeQrLayer) updateQrCode(activeQrLayer.id, { x: 72, y: 32, size: 14, value: form.website || "", visible: true, side });
    else updateLayer(activeLayer as FieldId, defaults[side][activeLayer as FieldId]);
  };

  const startTextDrag = (event: ReactPointerEvent<HTMLButtonElement>, field: FieldId) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    setActiveLayer(field);
    const start = editor[side][field];
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (moveEvent: PointerEvent) => {
      const x = clamp(start.x + ((moveEvent.clientX - startX) / rect.width) * 100, 3, 97);
      const y = clamp(start.y + ((moveEvent.clientY - startY) / rect.height) * 100, 4, 94);
      setEditor((current) => ({ ...current, [side]: { ...current[side], [field]: { ...current[side][field], x, y } } }));
    };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const startTextResize = (event: ReactPointerEvent<HTMLButtonElement>, field: FieldId) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveLayer(field);
    const start = editor[side][field];
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      const width = clamp(start.width + dx, 14, 82);
      const fontSize = clamp(start.fontSize + (dx + dy) * 0.04, 1.5, 16);
      setEditor((current) => ({ ...current, [side]: { ...current[side], [field]: { ...current[side][field], width, fontSize } } }));
    };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const startCustomTextDrag = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    setActiveLayer(`custom:${id}`);
    const target = editor.customTexts.find((item) => item.id === id);
    if (!target) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (moveEvent: PointerEvent) => updateCustomText(id, { x: clamp(target.x + ((moveEvent.clientX - startX) / rect.width) * 100, 3, 97), y: clamp(target.y + ((moveEvent.clientY - startY) / rect.height) * 100, 4, 94) });
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const startCustomTextResize = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    const target = editor.customTexts.find((item) => item.id === id);
    if (!target) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      updateCustomText(id, { width: clamp(target.width + dx, 14, 82), fontSize: clamp(target.fontSize + (dx + dy) * 0.04, 1.5, 16) });
    };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const startQrDrag = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    setActiveLayer(`qr:${id}`);
    const target = editor.qrCodes.find((item) => item.id === id);
    if (!target) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (moveEvent: PointerEvent) => updateQrCode(id, { x: clamp(target.x + ((moveEvent.clientX - startX) / rect.width) * 100, 3, 90), y: clamp(target.y + ((moveEvent.clientY - startY) / rect.height) * 100, 4, 88) });
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const startQrResize = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    const target = editor.qrCodes.find((item) => item.id === id);
    if (!target) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (moveEvent: PointerEvent) => {
      const delta = (((moveEvent.clientX - startX) / rect.width) * 100 + ((moveEvent.clientY - startY) / rect.height) * 100) / 2;
      updateQrCode(id, { size: clamp(target.size + delta, 8, 30) });
    };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const startImageDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const canvas = event.currentTarget.closest("[data-card-canvas]");
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveLayer("image");
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startOffsetX = editor.image.offsetX ?? 0;
    const startOffsetY = editor.image.offsetY ?? 0;

    const move = (moveEvent: PointerEvent) => {
      const offsetX = clamp(startOffsetX + ((moveEvent.clientX - startX) / rect.width) * 100, -45, 45);
      const offsetY = clamp(startOffsetY + ((moveEvent.clientY - startY) / rect.height) * 100, -45, 45);
      setEditor((current) => ({
        ...current,
        image: { ...current.image, offsetX, offsetY },
      }));
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const saveDraft = () => {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form)); window.sessionStorage.setItem(EDITOR_KEY, JSON.stringify(editor)); setNotice("名片草稿已儲存到此瀏覽器。登入／資料表完成後，再改成雲端草稿。 "); }
    catch { setNotice("瀏覽器儲存空間不足，請縮小圖片後再試。 "); }
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-8">
      <SEO title="名片編輯器｜RXV 商業工具" description="調整名片正反面文字、圖片與印刷方案。" />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><button type="button" onClick={onBack} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">← 返回模板</button><div><p className="text-xs font-black tracking-[.15em] text-cyan-700">RXV 名片編輯器</p><p className="text-sm font-black text-slate-900">{template.name}｜90 × 54 mm</p></div></div>
          <div className="flex items-center gap-2"><button type="button" onClick={saveDraft} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">儲存草稿</button><button type="button" onClick={() => setNotice("目前已完成編輯與草稿流程；付款、訂單與送印檔輸出需在確認現有資料表與付款流程後再串接。 ")} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600">送印詢價 NT${price}</button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 xl:grid-cols-[300px_minmax(0,1fr)_320px] xl:p-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-[76px] xl:h-[calc(100vh-100px)] xl:overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-4"><button type="button" onClick={() => setPanel("text")} className={`rounded-xl px-2 py-2 text-sm font-black ${panel === "text" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>文字</button><button type="button" onClick={() => setPanel("image")} className={`rounded-xl px-2 py-2 text-sm font-black ${panel === "image" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>圖片</button><button type="button" onClick={() => setPanel("style")} className={`rounded-xl px-2 py-2 text-sm font-black ${panel === "style" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>版型</button></div>
          {panel === "text" ? <div className="mt-4 space-y-4"><p className="text-sm font-bold text-slate-500">可拖曳文字位置；文字框右下角圓點可直接拖拉放大縮小。也可新增自訂文字與 QR Code。</p><div className="grid grid-cols-2 gap-3"><button type="button" onClick={addCustomText} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-800">新增文字</button><button type="button" onClick={addQrCode} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">新增 QR Code</button></div><InputField label="公司或品牌名稱" value={form.brandName} onChange={(value) => setField("brandName", value)} /><div className="grid grid-cols-2 gap-3"><InputField label="姓名" value={form.fullName} onChange={(value) => setField("fullName", value)} /><InputField label="職稱" value={form.jobTitle} onChange={(value) => setField("jobTitle", value)} /></div><div className="grid grid-cols-2 gap-3"><InputField label="電話" value={form.phone} onChange={(value) => setField("phone", value)} /><InputField label="LINE ID" value={form.lineId} onChange={(value) => setField("lineId", value)} /></div><InputField label="Email" value={form.email} onChange={(value) => setField("email", value)} /><InputField label="網站／LINE 官方／預約連結" value={form.website} onChange={(value) => setField("website", value)} /><InputField label="一句自我介紹" value={form.introduction} onChange={(value) => setField("introduction", value)} textarea /><InputField label="服務項目（最多 3 項，以逗號或換行分隔）" value={form.services} onChange={(value) => setField("services", value)} textarea />{editor.customTexts.filter((item) => item.side === side).length ? <div className="rounded-xl border border-slate-200 p-3"><p className="mb-2 text-sm font-black text-slate-800">此面自訂文字</p><div className="space-y-2">{editor.customTexts.filter((item) => item.side === side).map((item, index) => <button key={item.id} type="button" onClick={() => setActiveLayer(`custom:${item.id}`)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${activeLayer === `custom:${item.id}` ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:bg-slate-50"}`}><span className="truncate">自訂文字 {index + 1}｜{item.text}</span><span className="text-xs text-slate-500">編輯</span></button>)}</div></div> : null}</div> : null}
          {panel === "image" ? <div className="mt-4 space-y-4"><p className="text-sm font-bold text-slate-500">Logo 會完整縮小放進框內；人像／商品圖會填滿圖片框。上傳後點選圖片，可直接拖曳位置與調整大小，不再提供裁切滑桿。</p><label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">圖片用途</span><select value={editor.image.mode} onChange={(e) => updateImage({ mode: e.target.value as ImageMode })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-cyan-500"><option value="logo">品牌 Logo（完整顯示）</option><option value="portrait">個人照片（填滿畫面）</option><option value="product">商品／作品照片（填滿畫面）</option></select></label><label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">上傳圖片</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm" /></label>{form.imageDataUrl ? <><button type="button" onClick={() => setField("imageDataUrl", "")} className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-black text-rose-700">移除圖片</button><button type="button" onClick={() => setActiveLayer("image")} className="w-full rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-800">選取圖片並調整</button></> : null}</div> : null}
          {panel === "style" ? <div className="mt-4 space-y-4"><p className="text-sm font-bold text-slate-500">版型資料與印刷方案；返回模板頁可更換其他名片。</p><div className="rounded-xl bg-slate-50 p-3"><p className="font-black text-slate-900">{template.name}</p><p className="mt-1 text-sm text-slate-600">{template.description}</p><p className="mt-2 text-xs font-bold text-slate-500">適合：{template.suitableFor}</p></div><div className="grid gap-3">{(["crystal", "matte"] as Paper[]).map((paper) => <button key={paper} type="button" onClick={() => setField("paper", paper)} className={`rounded-xl border p-3 text-left ${form.paper === paper ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`}><p className="font-black text-slate-900">{paper === "crystal" ? "標準水晶光" : "雙面霧膜"}</p><p className="mt-1 text-sm text-slate-500">{paper === "crystal" ? "明亮清楚，適合多數業務名片" : "耐髒質感，適合較高質感服務"}</p></button>)}</div><div className="grid grid-cols-2 gap-3">{([200, 500] as Quantity[]).map((quantity) => <button key={quantity} type="button" onClick={() => setField("quantity", quantity)} className={`rounded-xl border p-3 text-center font-black ${form.quantity === quantity ? "border-cyan-500 bg-cyan-600 text-white" : "border-slate-200 text-slate-700"}`}>{quantity} 張<br /><span className="text-sm">NT${PRICES[form.paper][quantity]}</span></button>)}</div></div> : null}
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-[#f1eadf] p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-xl bg-white p-1 shadow-sm"><button type="button" onClick={() => { setSide("front"); setActiveLayer("brandName"); }} className={`rounded-lg px-4 py-2 text-sm font-black ${side === "front" ? "bg-cyan-600 text-white" : "text-slate-600"}`}>正面</button><button type="button" onClick={() => { setSide("back"); setActiveLayer("introduction"); }} className={`rounded-lg px-4 py-2 text-sm font-black ${side === "back" ? "bg-cyan-600 text-white" : "text-slate-600"}`}>背面</button></div><span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">90 × 54 mm｜虛線為安全區</span></div>
          <div className="mx-auto max-w-5xl rounded-2xl bg-[linear-gradient(0deg,rgba(255,255,255,.42)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.42)_1px,transparent_1px)] p-4 shadow-inner sm:p-7" style={{ backgroundSize: "28px 28px" }}>
            <CardCanvas template={template} form={form} editor={editor} side={side} editable activeLayer={activeLayer} onSelectLayer={setActiveLayer} onStartDrag={startTextDrag} onStartTextResize={startTextResize} onStartImageDrag={startImageDrag} onStartCustomTextDrag={startCustomTextDrag} onStartCustomTextResize={startCustomTextResize} onStartQrDrag={startQrDrag} onStartQrResize={startQrResize} showSafeArea />
          </div>
          <div className="mt-4 rounded-xl bg-white/85 px-4 py-3 text-sm font-semibold text-slate-600">可直接拖曳文字與圖片；選取後在右側調整字體大小或圖片大小。安全區以內為建議文字範圍。</div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-[76px] xl:h-fit">
          <p className="text-xs font-black tracking-[.15em] text-cyan-700">圖層設定</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{activeLayer === "image" ? "圖片" : isCustomActive ? "自訂文字" : isQrActive ? "QR Code" : FIELD_LABELS[activeLayer as FieldId]}</h2>
          {activeLayer === "image" ? <div className="mt-4 space-y-4"><p className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-800">拖曳畫布上的圖片即可移動。下方可調整圖片框大小與圖片內容縮放。</p><label className="block"><span className="text-sm font-black text-slate-800">圖片框大小：{editor.image.frameScale ?? 100}%</span><input type="range" min="45" max="220" value={editor.image.frameScale ?? 100} onChange={(e) => updateImage({ frameScale: Number(e.target.value) })} className="mt-2 w-full" /></label><label className="block"><span className="text-sm font-black text-slate-800">圖片內容縮放：{editor.image.scale}%</span><input type="range" min="40" max="220" value={editor.image.scale} onChange={(e) => updateImage({ scale: Number(e.target.value) })} className="mt-2 w-full" /></label><div><p className="text-sm font-black text-slate-800">移動位置</p><div className="mt-2 grid grid-cols-3 gap-2"><span /><button type="button" onClick={() => moveLayer(0, -1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↑</button><span /><button type="button" onClick={() => moveLayer(-1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">←</button><button type="button" onClick={resetActive} className="rounded-lg border border-slate-200 py-2 text-xs font-black hover:bg-slate-50">重設</button><button type="button" onClick={() => moveLayer(1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">→</button><span /><button type="button" onClick={() => moveLayer(0, 1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↓</button><span /></div></div><button type="button" onClick={() => updateImage({ visible: !editor.image.visible })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700">{editor.image.visible ? "隱藏圖片" : "顯示圖片"}</button></div> : isQrActive && activeQrLayer ? <div className="mt-4 space-y-4"><InputField label="QR Code 連結" value={activeQrLayer.value} onChange={(value) => updateQrCode(activeQrLayer.id, { value })} /><label className="block"><span className="text-sm font-black text-slate-800">QR Code 大小：{activeQrLayer.size.toFixed(1)}%</span><input type="range" min="8" max="30" step="0.5" value={activeQrLayer.size} onChange={(e) => updateQrCode(activeQrLayer.id, { size: Number(e.target.value) })} className="mt-2 w-full" /></label><div><p className="text-sm font-black text-slate-800">移動位置</p><div className="mt-2 grid grid-cols-3 gap-2"><span /><button type="button" onClick={() => moveLayer(0, -1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↑</button><span /><button type="button" onClick={() => moveLayer(-1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">←</button><button type="button" onClick={resetActive} className="rounded-lg border border-slate-200 py-2 text-xs font-black hover:bg-slate-50">重設</button><button type="button" onClick={() => moveLayer(1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">→</button><span /><button type="button" onClick={() => moveLayer(0, 1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↓</button><span /></div></div><button type="button" onClick={() => updateQrCode(activeQrLayer.id, { visible: !activeQrLayer.visible })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700">{activeQrLayer.visible ? "隱藏 QR Code" : "顯示 QR Code"}</button></div> : isCustomActive && activeCustomLayer ? <div className="mt-4 space-y-4"><InputField label="自訂文字內容" value={activeCustomLayer.text} onChange={(value) => updateCustomText(activeCustomLayer.id, { text: value })} textarea /><label className="block"><span className="text-sm font-black text-slate-800">字體大小：{activeCustomLayer.fontSize.toFixed(1)}</span><input type="range" min="1.5" max="16" step="0.1" value={activeCustomLayer.fontSize} onChange={(e) => updateCustomText(activeCustomLayer.id, { fontSize: Number(e.target.value) })} className="mt-2 w-full" /></label><label className="block"><span className="text-sm font-black text-slate-800">文字框寬度：{activeCustomLayer.width.toFixed(0)}%</span><input type="range" min="14" max="82" step="1" value={activeCustomLayer.width} onChange={(e) => updateCustomText(activeCustomLayer.id, { width: Number(e.target.value) })} className="mt-2 w-full" /></label><div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">字體顏色</span><input type="color" value={activeCustomLayer.color} onChange={(e) => updateCustomText(activeCustomLayer.id, { color: e.target.value })} className="h-11 w-full rounded-lg border border-slate-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">字體</span><select value={activeCustomLayer.fontFamily} onChange={(e) => updateCustomText(activeCustomLayer.id, { fontFamily: e.target.value as FontFamily })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm">{FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}</select></label></div><div><p className="text-sm font-black text-slate-800">對齊方式</p><div className="mt-2 grid grid-cols-3 gap-2">{(["left", "center", "right"] as TextAlign[]).map((align) => <button key={align} type="button" onClick={() => updateCustomText(activeCustomLayer.id, { align })} className={`rounded-lg border px-2 py-2 text-sm font-black ${activeCustomLayer.align === align ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-600"}`}>{align === "left" ? "靠左" : align === "center" ? "置中" : "靠右"}</button>)}</div></div><div><p className="text-sm font-black text-slate-800">移動位置</p><div className="mt-2 grid grid-cols-3 gap-2"><span /><button type="button" onClick={() => moveLayer(0, -1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↑</button><span /><button type="button" onClick={() => moveLayer(-1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">←</button><button type="button" onClick={resetActive} className="rounded-lg border border-slate-200 py-2 text-xs font-black hover:bg-slate-50">重設</button><button type="button" onClick={() => moveLayer(1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">→</button><span /><button type="button" onClick={() => moveLayer(0, 1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↓</button><span /></div></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateCustomText(activeCustomLayer.id, { visible: !activeCustomLayer.visible })} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700">{activeCustomLayer.visible ? "隱藏文字" : "顯示文字"}</button><button type="button" onClick={() => setEditor((current) => ({ ...current, customTexts: current.customTexts.filter((item) => item.id !== activeCustomLayer.id) }))} className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-black text-rose-700">刪除此文字</button></div></div> : currentLayer ? <div className="mt-4 space-y-4"><label className="block"><span className="text-sm font-black text-slate-800">字體大小：{currentLayer.fontSize.toFixed(1)}</span><input type="range" min="1.5" max="16" step="0.1" value={currentLayer.fontSize} onChange={(e) => updateLayer(activeLayer as FieldId, { fontSize: Number(e.target.value) })} className="mt-2 w-full" /></label><label className="block"><span className="text-sm font-black text-slate-800">文字框寬度：{currentLayer.width.toFixed(0)}%</span><input type="range" min="14" max="82" step="1" value={currentLayer.width} onChange={(e) => updateLayer(activeLayer as FieldId, { width: Number(e.target.value) })} className="mt-2 w-full" /></label><div className="grid grid-cols-[44px_1fr_44px] gap-2"><button type="button" onClick={() => updateLayer(activeLayer as FieldId, { fontSize: clamp(currentLayer.fontSize - 0.5, 1.5, 16) })} className="rounded-lg border border-slate-200 py-2 text-lg font-black hover:bg-slate-50">－</button><input aria-label="字體大小數值" type="number" min="1.5" max="16" step="0.1" value={currentLayer.fontSize} onChange={(e) => updateLayer(activeLayer as FieldId, { fontSize: clamp(Number(e.target.value) || 1.5, 1.5, 16) })} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-center text-sm font-black outline-none focus:border-cyan-500" /><button type="button" onClick={() => updateLayer(activeLayer as FieldId, { fontSize: clamp(currentLayer.fontSize + 0.5, 1.5, 16) })} className="rounded-lg border border-slate-200 py-2 text-lg font-black hover:bg-slate-50">＋</button></div><div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">字體顏色</span><input type="color" value={currentLayer.color} onChange={(e) => updateLayer(activeLayer as FieldId, { color: e.target.value })} className="h-11 w-full rounded-lg border border-slate-200" /></label><label className="block"><span className="mb-1.5 block text-sm font-black text-slate-800">字體</span><select value={currentLayer.fontFamily} onChange={(e) => updateLayer(activeLayer as FieldId, { fontFamily: e.target.value as FontFamily })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm">{FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}</select></label></div><div><p className="text-sm font-black text-slate-800">對齊方式</p><div className="mt-2 grid grid-cols-3 gap-2">{(["left", "center", "right"] as TextAlign[]).map((align) => <button key={align} type="button" onClick={() => updateLayer(activeLayer as FieldId, { align })} className={`rounded-lg border px-2 py-2 text-sm font-black ${currentLayer.align === align ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-600"}`}>{align === "left" ? "靠左" : align === "center" ? "置中" : "靠右"}</button>)}</div></div><div><p className="text-sm font-black text-slate-800">移動位置</p><div className="mt-2 grid grid-cols-3 gap-2"><span /><button type="button" onClick={() => moveLayer(0, -1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↑</button><span /><button type="button" onClick={() => moveLayer(-1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">←</button><button type="button" onClick={resetActive} className="rounded-lg border border-slate-200 py-2 text-xs font-black hover:bg-slate-50">重設</button><button type="button" onClick={() => moveLayer(1, 0)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">→</button><span /><button type="button" onClick={() => moveLayer(0, 1)} className="rounded-lg border border-slate-200 py-2 font-black hover:bg-slate-50">↓</button><span /></div></div><button type="button" onClick={() => updateLayer(activeLayer as FieldId, { visible: !currentLayer.visible })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700">{currentLayer.visible ? "隱藏此文字" : "顯示此文字"}</button></div> : null}
          <div className="mt-6 border-t border-slate-200 pt-4"><p className="text-sm font-black text-slate-800">目前印刷方案</p><p className="mt-1 text-sm text-slate-600">{form.paper === "crystal" ? "標準水晶光" : "雙面霧膜"}｜{form.quantity} 張</p><p className="mt-2 text-2xl font-black text-slate-950">NT${price}</p></div>
          {notice ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{notice}</p> : null}
        </aside>
      </div>
    </main>
  );
}

export default function BusinessCardPage() {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_FORM, ...JSON.parse(saved) } : DEFAULT_FORM;
    } catch { return DEFAULT_FORM; }
  });
  const [editor, setEditor] = useState<EditorState>(() => {
    try {
      const saved = window.sessionStorage.getItem(EDITOR_KEY);
      return saved ? JSON.parse(saved) : makeLayers(TEMPLATES[0]);
    } catch { return makeLayers(TEMPLATES[0]); }
  });
  const [filter, setFilter] = useState<Category>("全部");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [mode, setMode] = useState<"catalog" | "editor">("catalog");
  const template = useMemo(() => TEMPLATES.find((item) => item.id === form.templateId) ?? TEMPLATES[0], [form.templateId]);

  useEffect(() => {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* no-op */ }
  }, [form]);
  useEffect(() => {
    try { window.sessionStorage.setItem(EDITOR_KEY, JSON.stringify(editor)); } catch { /* no-op */ }
  }, [editor]);

  const beginEditing = (nextTemplate: Template) => {
    setForm((current) => ({ ...current, templateId: nextTemplate.id }));
    setEditor(makeLayers(nextTemplate));
    setPreviewTemplate(null);
    setMode("editor");
  };

  if (mode === "editor") {
    return <Editor form={form} setForm={setForm} editor={editor} setEditor={setEditor} template={template} onBack={() => setMode("catalog")} />;
  }

  return <>
    <Catalog form={form} filter={filter} onFilter={setFilter} onPreview={setPreviewTemplate} onEdit={beginEditing} />
    {previewTemplate ? <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} onEdit={() => beginEditing(previewTemplate)} /> : null}
  </>;
}
