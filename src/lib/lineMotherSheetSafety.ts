/**
 * 純本機 LINE 母圖安全切割分析（不做 OCR、不呼叫外部服務）。
 * 在平均格線左右尋找真正的純白通道；沒有可用通道時不應硬切。
 */
export type MotherSheetSafetyGrid = "4x2" | "4x4" | "4x5";
export type MotherSheetCellWarning = { index: number; marginPercent: number; message: string };
export type MotherSheetSafetyReview = {
  grid: MotherSheetSafetyGrid;
  width: number;
  height: number;
  xCuts: number[];
  yCuts: number[];
  blocked: string[];
  warnings: MotherSheetCellWarning[];
};

function findSeparatorCuts(
  projection: Int32Array,
  length: number,
  orthogonalLength: number,
  sections: number,
  axisLabel: string,
): { cuts: number[]; blocked: string[] } {
  const cuts = [0];
  const blocked: string[] = [];
  const cell = length / sections;
  const bandRadius = Math.max(1, Math.round(cell * 0.008));
  const searchRadius = Math.max(3, Math.round(cell * 0.13));

  for (let boundary = 1; boundary < sections; boundary += 1) {
    const expected = Math.round((length * boundary) / sections);
    let bestPosition = expected;
    let bestScore = Number.POSITIVE_INFINITY;
    let bestInk = Number.POSITIVE_INFINITY;

    for (let shift = -searchRadius; shift <= searchRadius; shift += 1) {
      const position = expected + shift;
      if (position <= cuts[cuts.length - 1] + Math.round(cell * 0.6) || position >= length - Math.round(cell * 0.6)) continue;
      let ink = 0;
      for (let offset = -bandRadius; offset <= bandRadius; offset += 1) {
        ink += projection[Math.max(0, Math.min(length - 1, position + offset))];
      }
      const density = ink / ((bandRadius * 2 + 1) * orthogonalLength);
      const score = density + (0.012 * Math.abs(shift)) / searchRadius;
      if (score < bestScore) {
        bestPosition = position;
        bestScore = score;
        bestInk = ink;
      }
    }

    cuts.push(bestPosition);
    // 留白通道帶內仍有明顯物件時不能安全平均切割。
    const measuredDensity = bestInk / ((bandRadius * 2 + 1) * orthogonalLength);
    if (measuredDensity > 0.006) {
      blocked.push(`${axisLabel}第 ${boundary} 道分隔線附近有圖案（非白色占比 ${(measuredDensity * 100).toFixed(1)}%），請修正母圖或重新排版。`);
    }
  }
  cuts.push(length);
  return { cuts, blocked };
}

export function analyzeMotherSheetSafety(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  grid: MotherSheetSafetyGrid,
): MotherSheetSafetyReview {
  const [columns, rows] = grid.split("x").map(Number);
  const xInk = new Int32Array(width);
  const yInk = new Int32Array(height);
  const mask = new Uint8Array(width * height);
  const corners = [
    3,
    (width - 1) * 4 + 3,
    ((height - 1) * width) * 4 + 3,
    (width * height - 1) * 4 + 3,
  ];
  const transparentSource = corners.filter((offset) => rgba[offset] < 90).length >= 3;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const p = i * 4;
      if (rgba[p + 3] < 48) continue;
      if (!transparentSource && rgba[p] >= 240 && rgba[p + 1] >= 240 && rgba[p + 2] >= 240) continue;
      mask[i] = 1;
      xInk[x] += 1;
      yInk[y] += 1;
    }
  }

  const vertical = findSeparatorCuts(xInk, width, height, columns, "欄");
  const horizontal = findSeparatorCuts(yInk, height, width, rows, "列");

  // 把「第幾道分隔線」轉成一般客戶看得懂的「第幾張貼圖」。
  const affectedBySeparator = (axis: "欄" | "列", boundary: number): number[] => {
    const found = new Set<number>();
    const line = axis === "欄" ? vertical.cuts[boundary] : horizontal.cuts[boundary];
    const band = 2;
    if (axis === "欄") {
      for (let row = 0; row < rows; row += 1) {
        let inkCount = 0;
        for (let y = horizontal.cuts[row]; y < horizontal.cuts[row + 1]; y += 1) {
          for (let x = Math.max(0, line - band); x <= Math.min(width - 1, line + band); x += 1) {
            inkCount += mask[y * width + x];
          }
        }
        if (inkCount >= 3) {
          found.add(row * columns + boundary);
          found.add(row * columns + boundary + 1);
        }
      }
    } else {
      for (let column = 0; column < columns; column += 1) {
        let inkCount = 0;
        for (let y = Math.max(0, line - band); y <= Math.min(height - 1, line + band); y += 1) {
          for (let x = vertical.cuts[column]; x < vertical.cuts[column + 1]; x += 1) {
            inkCount += mask[y * width + x];
          }
        }
        if (inkCount >= 3) {
          found.add((boundary - 1) * columns + column + 1);
          found.add(boundary * columns + column + 1);
        }
      }
    }
    return [...found].sort((a, b) => a - b);
  };
  const describeSeparator = (message: string, axis: "欄" | "列") => {
    const boundary = Number(message.match(/第 (\\d+) 道/)?.[1] ?? 0);
    if (!boundary) return message;
    const cells = affectedBySeparator(axis, boundary);
    return cells.length ? `${message} 可能影響第 ${cells.join("、")} 張。` : message;
  };
  const blocked = [
    ...vertical.blocked.map((message) => describeSeparator(message, "欄")),
    ...horizontal.blocked.map((message) => describeSeparator(message, "列")),
  ];
  const warnings: MotherSheetCellWarning[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column + 1;
      const left = vertical.cuts[column];
      const right = vertical.cuts[column + 1];
      const top = horizontal.cuts[row];
      const bottom = horizontal.cuts[row + 1];
      let minX = width;
      let maxX = -1;
      let minY = height;
      let maxY = -1;
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          if (!mask[y * width + x]) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (maxX < 0) {
        blocked.push(`第 ${index} 格未偵測到任何圖案，請確認母圖格數。`);
        continue;
      }
      const margin = Math.min(
        (minX - left) / Math.max(1, right - left),
        (right - 1 - maxX) / Math.max(1, right - left),
        (minY - top) / Math.max(1, bottom - top),
        (bottom - 1 - maxY) / Math.max(1, bottom - top),
      );
      if (margin < 0.085) {
        warnings.push({
          index,
          marginPercent: Math.max(0, Math.round(margin * 1000) / 10),
          message: `第 ${index} 格原圖最小留白約 ${Math.max(0, margin * 100).toFixed(1)}%，切圖後會自動置中補留白，仍需確認文字／花瓣沒有連到隔壁格。`,
        });
      }
      if (margin < 0.004) {
        blocked.push(`第 ${index} 格圖案貼著切割邊界，可能已跨格；無法保證完整，請先修正母圖。`);
      }
    }
  }
  return {
    grid,
    width,
    height,
    xCuts: vertical.cuts,
    yCuts: horizontal.cuts,
    blocked,
    warnings,
  };
}
