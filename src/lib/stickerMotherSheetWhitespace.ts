/**
 * 白邊規則獨立集中：AI 母圖先留出每格切割通道，才能安全去背、切圖、動畫。
 * 注意：這只是提示詞，無法替代切割頁的實際像素檢查。
 */
export type SafeMotherGrid = "4x2" | "4x4" | "4x5";
export type SafeMotherMode = "static" | "animated";

export const MOTHER_SHEET_SAFE_MARGIN_PERCENT = 15;

export function motherSheetGeometry(grid: SafeMotherGrid) {
  switch (grid) {
    case "4x2":
      return { columns: 4, rows: 2, ratio: "2:1 橫向" };
    case "4x4":
      return { columns: 4, rows: 4, ratio: "1:1 正方形" };
    case "4x5":
      return { columns: 4, rows: 5, ratio: "4:5 直向" };
  }
}

/**
 * 這段規則可放到第 1 張、第 2 張、Gemini 版及無文字版。
 * 每格的安全內框是「圖文合計」的大小，不是只對人物縮小，文字與裝飾也要縮小。
 */
export function buildMotherSheetWhitespaceRules(grid: SafeMotherGrid, mode: SafeMotherMode = "static") {
  const { columns, rows, ratio } = motherSheetGeometry(grid);
  return `【優先執行：防止切圖截斷的強制純白安全區】
1. 最終畫布固定 ${columns} 欄 × ${rows} 列、共 ${columns * rows} 格、${ratio}；每格等寬等高。先在心中畫出均分格子的虛擬切線，但輸出圖片「不要畫出格線」。
2. 每格「最上、最下、最左、最右」各預留整格尺寸 15% 的純白禁止繪製區；人物、頭髮、手腳、文字、粗黑描邊、愛心、星星、裝飾、陰影全部不得進入。整組「文字＋人物＋道具＋特效」限縮在中央 70% 寬 × 70% 高的安全內框，沒有任何部分可越界。
3. 每條相鄰兩格的切線兩側都必須看見連續、乾淨、沒有圖案的白色分隔通道：左格右緣 15% 加右格左緣 15%；上下列亦相同。白色通道必須由頭至尾貫通，不能在中間被頭髮、文字邊框、愛心、星星或陰影堵住。
4. 最外側畫布四邊亦各保留每格 15% 的純白安全帶；尤其第一列的「文字頂端」不能頂到畫布上緣，最後一列的「身體、手、衣服下緣」不能貼到底部。
5. 文字位置依使用者指定的上方、下方或左右配置，但文字也必須「放在中央 70% 安全內框內」；若文字位於上方，必須在安全內框的上半部，而不是貼在每格最上緣。長句請在安全內框內換行或縮小文字，不得犧牲安全留白。
6. 如果人物太大、臉部特寫過近或文字太寬，優先等比例縮小「整組圖文」再置中；不要放大人物塞滿格子，不要讓每一格互相緊貼，不要用彩色格線、色塊或透明圖案代替純白。
7. 交付前自行逐條檢查三條縱向和 ${rows - 1} 條橫向的虛擬切線，以及畫布外框：全部通道連續純白，每一格圖文完整。任一格不符時請先重新排版再輸出，不要交付會切掉文字、頭髮、手腳的母圖。
${mode === "animated" ? "8. 本次要製作動態貼圖：仍只輸出一張靜態母圖。人物日後會移動，額外避免把手指、頭髮、特效放在安全內框邊緣；不產生動畫影格或時間軸。" : "8. 本次為靜態貼圖；所有圖文要完整保留在中央安全內框，方便後續逐格切割。"}`;
}

/**
 * 使用者已產出有切線碰撞的母圖時，從第 3 步直接複製「重新生成」指令。
 * 必須將原始有問題的母圖附給 AI；不能只在整張圖四周加白邊。
 */
export function buildMotherSheetWhitespaceRetryPrompt(grid: SafeMotherGrid, mode: SafeMotherMode = "static") {
  const { columns, rows, ratio } = motherSheetGeometry(grid);
  return `請參考我在同一對話附上的「原本母圖」，重新生成 **一張新的完整母圖**（不是把舊圖等比例縮小後外圍加白邊，也不是沿舊格線硬裁切）。
保留原有 ${columns} 欄 × ${rows} 列、共 ${columns * rows} 格、${ratio}；每格原有的繁體中文短句、人物身份、真人寫實／Q版風格、服裝配色、表情與動作語意不變。不能加入其他文字，不能刪除任一格，也不要改變列數或欄數。
**要修正的是每一格內部的圖文佈局**，不是只加大整張畫布的外邊。將每格的「文字＋人物＋頭髮＋手腳＋道具＋愛心與裝飾」視為同一組，重新縮小並放回該格中央，創造完全不含任何畫面元素的純白分隔帶。請依下方規則重新排版：
${buildMotherSheetWhitespaceRules(grid, mode)}
這次請直接交付新版母圖，不需說明。若原圖為真人照片延伸多表情，請另外附上同一位人物的原始授權照片維持辨識度；若為第 2 張母圖，同時附上原始照片、第 1 張母圖和要重繪的這張母圖。`;
}
