import { ProductItem } from "./csv-loader";

export type ScriptStyle =
  | "lazy"        // 懶人型
  | "life"        // 生活情境
  | "unbox"       // 開箱亮點
  | "saving";     // 省錢理由

function intro(style: ScriptStyle, item: ProductItem) {
  switch (style) {
    case "lazy":
      return `這個你一定要看！我最近找到一個超方便的「${item.title}」。`;

    case "life":
      return `你是不是也有這種困擾？我後來竟然用「${item.title}」解決了。`;

    case "unbox":
      return `今天開箱「${item.title}」，真的比我想像的還要猛。`;

    case "saving":
      return `最近真的很會挑！「${item.title}」這價錢，我直接下單。`;

    default:
      return "";
  }
}

function highlights(item: ProductItem) {
  const list = [
    `✔ 價格：$${item.price}`,
    `✔ 佣金：${item.commission}%`,
    `✔ 熱門程度：${(item as any).sold ?? "N/A"}`,
    `✔ 特色：${(item as any).feature1 ?? "亮點不在話下"}`,
  ];

  return list.filter(Boolean).slice(0, 3).join("\n");
}

function cta(item: ProductItem) {
  return `👉 想看更多詳情，我把連結放在下方（分論連結）。`;
}

export function generateScript(
  item: ProductItem,
  style: ScriptStyle = "lazy"
) {
  return {
    title: `${item.title}｜${style}腳本`,
    lines: [
      intro(style, item),
      "",
      highlights(item),
      "",
      cta(item),
    ].join("\n")
  };
}

export function generateScriptsBatch(
  items: ProductItem[],
  style?: ScriptStyle
) {
  return items.map((item) =>
    generateScript(item, style ?? randomStyle())
  );
}

function randomStyle(): ScriptStyle {
  const pool: ScriptStyle[] = ["lazy", "life", "unbox", "saving"];
  return pool[Math.floor(Math.random() * pool.length)];
}

