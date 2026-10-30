/**
 * LINE 動態貼圖上架 ZIP 的最後防線。
 *
 * 只允許 NN.png（逐張 APNG）、main.png、tab.png。
 * 這是在 ZIP 寫入前驗證產物，而不是將匯入資料夾直接壓縮。
 * 圖像尺寸、APNG 動畫畫格及容量由既有的 verifyLineOutputPng 流程驗證。
 */
export type LineAnimatedZipEntry = { name: string; data: Uint8Array };

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;

export function assertLineAnimatedZipManifest(
  files: readonly LineAnimatedZipEntry[],
  expectedStickerCount: number,
): void {
  if (![8, 16, 24].includes(expectedStickerCount)) {
    throw new Error("LINE 動態上架 ZIP 張數不正確，請返回確認貼圖張數。");
  }

  const expectedNames = [
    ...Array.from({ length: expectedStickerCount }, (_, index) =>
      `${String(index + 1).padStart(2, "0")}.png`,
    ),
    "main.png",
    "tab.png",
  ];

  const names = new Set(expectedNames);
  if (files.length !== expectedNames.length) {
    throw new Error(
      `LINE 動態上架 ZIP 應有 ${expectedNames.length} 個 PNG 檔（${expectedStickerCount} 張貼圖＋主圖＋標籤圖）；實際有 ${files.length} 個，已停止匯出。`,
    );
  }

  const seen = new Set<string>();
  for (const file of files) {
    if (!names.has(file.name)) {
      throw new Error(`匯出清單含非 LINE 上架檔案：${file.name}，已停止匯出。`);
    }
    if (seen.has(file.name)) {
      throw new Error(`匯出清單含重複檔名：${file.name}，已停止匯出。`);
    }
    seen.add(file.name);
    if (
      !file.data ||
      file.data.byteLength < PNG_SIGNATURE.length ||
      !PNG_SIGNATURE.every((byte, index) => file.data[index] === byte)
    ) {
      throw new Error(`匯出檔案不是有效的 PNG 格式：${file.name}，已停止匯出。`);
    }
  }

  const missing = expectedNames.filter((name) => !seen.has(name));
  if (missing.length) {
    throw new Error(`LINE 動態上架 ZIP 缺少：${missing.join("、")}，已停止匯出。`);
  }
}
