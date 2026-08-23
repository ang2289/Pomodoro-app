#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createCanvas } from "canvas";

const cwd = process.cwd();
const inputCsv = process.argv[2] || "";
const limit = Number(process.argv[3] || 3) || 3;
const outputDir = path.join(cwd, "out_mp4");
const serverUrl = process.env.RXV_VIDEO_SERVER || "http://localhost:3006";

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells.map((value) => value.trim());
}

function parseCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cols[index] || "";
    });
    return row;
  });
}

function sanitizeFileName(input) {
  return (
    String(input || "shopee")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 64) || "shopee"
  );
}

function short(input, length) {
  const text = String(input || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const chars = Array.from(String(text || "").trim());
  const lines = [];
  let line = "";
  for (const ch of chars) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length >= maxLines) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && chars.join("").length > lines.join("").length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, -2)}...`;
  }
  return lines;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function writeCard({ row, scene, index, filename }) {
  const w = 1080;
  const h = 1920;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const title = row["商品名稱"] || "蝦皮精選好物";
  const price = row["商品價格"] || "";
  const sales = row["銷售量"] || "";
  const shop = row["商店名稱"] || "";
  const rate = row["分潤率"] || "";
  const commission = row["推廣分潤"] || "";

  const palettes = [
    ["#f8fafc", "#e0f2fe", "#0f172a", "#dc2626", "#0369a1"],
    ["#fff7ed", "#dcfce7", "#111827", "#16a34a", "#c2410c"],
    ["#fdf2f8", "#fef9c3", "#111827", "#db2777", "#854d0e"],
  ];
  const [bg, accent, ink, hot, secondary] = palettes[index % palettes.length];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, w, 420);
  ctx.fillStyle = "#ffffff";
  drawRoundRect(ctx, 72, 260, 936, 1240, 42);
  ctx.fill();

  ctx.fillStyle = secondary;
  ctx.font = "700 52px Microsoft JhengHei, Arial";
  ctx.fillText(scene, 92, 150);

  ctx.fillStyle = ink;
  ctx.font = "700 70px Microsoft JhengHei, Arial";
  const titleLines = wrapText(ctx, title, 850, 5);
  titleLines.forEach((line, i) => ctx.fillText(line, 112, 390 + i * 92));

  ctx.fillStyle = hot;
  ctx.font = "800 96px Microsoft JhengHei, Arial";
  ctx.fillText(price ? `NT$ ${price}` : "高 CP 值", 112, 930);

  ctx.fillStyle = "#334155";
  ctx.font = "600 46px Microsoft JhengHei, Arial";
  const bullets = [
    sales ? `熱銷 ${sales}` : "日用品補貨首選",
    rate ? `分潤率 ${rate}` : "適合短影音導購",
    commission ? `預估分潤 ${commission}` : "點連結看最新優惠",
    shop ? `店家：${short(shop, 18)}` : "",
  ].filter(Boolean);
  bullets.forEach((line, i) => {
    ctx.fillText(`• ${line}`, 122, 1060 + i * 78);
  });

  ctx.fillStyle = hot;
  drawRoundRect(ctx, 132, 1370, 816, 120, 28);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 48px Microsoft JhengHei, Arial";
  ctx.textAlign = "center";
  ctx.fillText("點推廣連結看優惠", 540, 1448);
  ctx.textAlign = "start";

  ctx.fillStyle = "#64748b";
  ctx.font = "500 34px Microsoft JhengHei, Arial";
  ctx.fillText("蝦皮分潤短影音素材", 92, 1760);
  ctx.fillText(new Date().toISOString().slice(0, 10), 92, 1812);

  await fsp.writeFile(filename, canvas.toBuffer("image/jpeg", { quality: 0.92 }));
}

async function renderItem(row, index) {
  const title = row["商品名稱"] || `蝦皮商品 ${index + 1}`;
  const idBase = `${String(index + 1).padStart(3, "0")}_${crypto.randomUUID().slice(0, 8)}`;
  const outputBase = `${String(index + 1).padStart(3, "0")}_${sanitizeFileName(title)}_${crypto.randomUUID().slice(0, 8)}`;
  const cardFiles = [
    path.join(outputDir, `${idBase}_card1.jpg`),
    path.join(outputDir, `${idBase}_card2.jpg`),
    path.join(outputDir, `${idBase}_card3.jpg`),
  ];
  const scenes = ["好物重點", "價格亮點", "立即看優惠"];
  for (let i = 0; i < 3; i += 1) {
    await writeCard({ row, scene: scenes[i], index: i, filename: cardFiles[i] });
  }

  const imageUrls = cardFiles.map((file) => `${serverUrl}/public-video/${encodeURIComponent(path.basename(file))}`);
  const expectedOutput = path.join(outputDir, `${outputBase}.mp4`);
  const response = await fetch(`${serverUrl}/render-from-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      item: {
        title,
        productUrl: row["商品連結"] || "",
        promoUrl: row["推廣連結"] || "",
        affiliateUrl: row["推廣連結"] || "",
        imageUrls,
        expectedOutput,
        useAi: false,
        skipUpload: true,
        skipPublicShare: true,
        skipDatabaseSave: true,
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || data.error || `render failed ${response.status}`);
  }
  return { ok: true, title, output: data.output || expectedOutput, publicVideoUrl: data.publicVideoUrl || "" };
}

async function main() {
  if (!inputCsv) throw new Error("CSV path required");
  await fsp.mkdir(outputDir, { recursive: true });
  const csvPath = path.isAbsolute(inputCsv) ? inputCsv : path.join(cwd, inputCsv);
  const rows = parseCsv(await fsp.readFile(csvPath, "utf8")).slice(0, limit);
  const results = [];
  for (let i = 0; i < rows.length; i += 1) {
    try {
      console.log(`[${i + 1}/${rows.length}] render ${rows[i]["商品名稱"] || ""}`);
      results.push(await renderItem(rows[i], i));
    } catch (error) {
      results.push({ ok: false, title: rows[i]["商品名稱"] || "", message: error.message });
      console.error(`[${i + 1}/${rows.length}] failed ${error.message}`);
    }
  }
  const resultPath = path.join(outputDir, `shopee_textcard_result_${Date.now()}.json`);
  await fsp.writeFile(resultPath, JSON.stringify({ results }, null, 2), "utf8");
  console.log(JSON.stringify({ resultPath, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
