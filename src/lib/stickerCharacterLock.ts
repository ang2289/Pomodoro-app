import type { MotherSheetPlanItem } from "./lineStickerFlow";

/** 整套作品只用一份識別設定；每張母圖都完整帶入，不依賴上一次對話。 */
export type StickerCharacterLock = {
  identity: string;
  face: string;
  hair: string;
  clothing: string;
  accessory: string;
  palette: string;
  proportions: string;
  drawing: string;
  shading: string;
};

export type StickerTextPosition = "top" | "bottom" | "mixed";

export function defaultCharacterLock(theme: string, role: string): StickerCharacterLock {
  const isNail = /美甲|nail/i.test(theme);
  return {
    identity: role,
    face: isNail
      ? "台灣成年女性，柔和鵝蛋臉、圓潤大眼、短鼻樑、微笑嘴型、自然暖膚色；五官比例固定"
      : "依上方角色形象統一臉型、眼形、鼻子、嘴形、膚色及五官比例；不得逐格更換人物",
    hair: isNail ? "深棕色齊肩微捲髮、空氣瀏海（所有格相同）" : "維持同一髮型、髮色、瀏海位置；不可隨貼圖更換",
    clothing: isNail ? "粉米色美甲工作服、奶茶色圍裙及固定蝴蝶結（每格相同）" : "固定同一套職業服裝、樣式、顏色與細節",
    accessory: isNail ? "固定粉色髮夾、簡單指甲裝飾；職業道具可配合動作替換" : "固定可辨識的隨身配件，工作道具可因動作不同",
    palette: isNail ? "裸粉、奶茶、奶油白為主色系" : "維持與本主題相同的主色、輔色與裝飾顏色",
    proportions: "Q 版 2.5～3 頭身，大頭小身體；同一套固定頭身與五官比例",
    drawing: "精緻甜美的原創 Q 版插畫，描邊為均勻中粗圓潤線條；固定筆觸、輪廓粗細及裝飾密度",
    shading: "柔和漸層上色、細緻高光與輕柔陰影，全部母圖一致",
  };
}

export function lockCharacterPrompt(
  details: StickerCharacterLock,
  style: string,
  typography: { font: string; size: string; color: string; position: string },
): string {
  return `【整套母圖共用：角色與畫風鎖定（每張完整重述，禁止重新設計）】
角色身分／職業／年齡：${details.identity}
臉部：${details.face}
髮型：${details.hair}
服裝：${details.clothing}
配件：${details.accessory}
主色與輔色：${details.palette}
頭身比例：${details.proportions}
插畫風格與描邊：${details.drawing}
上色、高光與陰影：${details.shading}
整體畫風：${style}
固定文字字型：${typography.font}
固定文字大小：${typography.size}
固定文字顏色、白邊、描邊及效果：${typography.color}
固定文字位置：${typography.position}
角色的臉型、眼睛、五官、髮型、髮色、瀏海、服裝細節、固定配件、比例、主色系、筆觸粗細、陰影、字型及文字配色，每一格、每張母圖都必須一致。
僅允許變化表情、手勢、姿勢、動作、合適的職業道具和指定繁體中文短句；不得自行重新設計角色。`;
}

export function stickerPlacement(position: StickerTextPosition, globalIndex: number): string {
  if (position === "top") return "文字只放正上方，人物與道具在下方";
  if (position === "bottom") return "文字只放正下方，人物與道具在上方";
  return globalIndex % 2 === 0
    ? "文字只放左側、人物在右側"
    : "文字只放右側、人物在左側";
}

export function stickerPlacementRule(position: StickerTextPosition): string {
  if (position === "top") return "所有格文字僅能置於正上方，人物在下方；禁止左右交錯、底部文字。";
  if (position === "bottom") return "所有格文字僅能置於正下方，人物在上方；禁止左右交錯、頂部文字。";
  return "整套貼圖依全域編號交錯：奇數張文字左、人物右；偶數張文字右、人物左。只可在指定側換行，禁止上方或下方標題。";
}

/** 與目前母圖分頁規格共用，不會在第二張重設奇偶序號。 */
export function stickerRowMap(
  sheet: Pick<MotherSheetPlanItem, "grid" | "startIndex" | "endIndex">,
  texts: string[],
  position: StickerTextPosition,
) {
  const columns = 4;
  const rows = sheet.grid === "4x2" ? 2 : sheet.grid === "4x4" ? 4 : 5;
  return Array.from({ length: rows }, (_, row) =>
    `第 ${row + 1} 列：` + Array.from({ length: columns }, (_, column) => {
      const globalIndex = sheet.startIndex + row * columns + column;
      return `第 ${column + 1} 格（整套第 ${globalIndex + 1} 張）「${texts[globalIndex] ?? ""}」〔${stickerPlacement(position, globalIndex)}〕`;
    }).join("、"),
  ).join("\n");
}
