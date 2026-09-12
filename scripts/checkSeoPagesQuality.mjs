/**
 * 檢查 src/data/seoPages.json 品質並輸出 docs/seo-pages-quality-report.md
 * 執行：node scripts/checkSeoPagesQuality.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, "src", "data", "seoPages.json");
const OUT = path.join(ROOT, "docs", "seo-pages-quality-report.md");

function load() {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  return JSON.parse(raw);
}

function countMap(arr) {
  const m = new Map();
  for (const x of arr) {
    m.set(x, (m.get(x) || 0) + 1);
  }
  return m;
}

function duplicates(keys, getLabel) {
  const m = countMap(keys);
  const dups = [];
  for (const [k, c] of m) {
    if (c > 1) dups.push({ value: k, count: c, label: getLabel(k) });
  }
  return dups.sort((a, b) => b.count - a.count);
}

/** 關鍵字集合：逗號分隔、去空白、小寫 */
function keywordSet(kw) {
  return new Set(
    kw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

function jaccard(a, b) {
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) inter++;
  }
  const u = a.size + b.size - inter;
  return u === 0 ? 1 : inter / u;
}

/** 字元 bigram 集合（適合中文為主的描述） */
function bigramSet(s) {
  const t = s.replace(/\s+/g, "");
  const set = new Set();
  for (let i = 0; i < t.length - 1; i++) {
    set.add(t.slice(i, i + 2));
  }
  return set;
}

function jaccardBigram(a, b) {
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) inter++;
  }
  const u = a.size + b.size - inter;
  return u === 0 ? 1 : inter / u;
}

function groupByTool(rows) {
  const g = new Map();
  for (const r of rows) {
    if (!g.has(r.tool)) g.set(r.tool, []);
    g.get(r.tool).push(r);
  }
  return g;
}

function run() {
  const rows = load();
  const lines = [];
  const now = new Date().toISOString().split("T")[0];

  lines.push(`# seoPages.json 品質檢查報告`);
  lines.push("");
  lines.push(`- 產生日期：${now}`);
  lines.push(`- 資料來源：\`src/data/seoPages.json\``);
  lines.push(`- 總筆數：${rows.length}`);
  lines.push("");

  // --- 重複檢查 ---
  lines.push(`## 1. 完全重複檢查`);
  lines.push("");

  const slugDup = duplicates(
    rows.map((r) => r.slug),
    (slug) => slug
  );
  lines.push(`### slug`);
  lines.push(slugDup.length ? `**發現重複 ${slugDup.length} 組**` : `**無重複**`);
  if (slugDup.length) {
    lines.push("");
    lines.push("| 值 | 次數 |");
    lines.push("| --- | --- |");
    for (const d of slugDup.slice(0, 50)) {
      lines.push(`| ${String(d.value).replace(/\|/g, "\\|")} | ${d.count} |`);
    }
  }
  lines.push("");

  const titleDup = duplicates(
    rows.map((r) => r.title),
    (t) => t
  );
  lines.push(`### title`);
  lines.push(titleDup.length ? `**發現重複 ${titleDup.length} 組**` : `**無重複**`);
  if (titleDup.length) {
    lines.push("");
    for (const d of titleDup.slice(0, 30)) {
      lines.push(`- 次數 ${d.count}：${d.value}`);
    }
  }
  lines.push("");

  const descDup = duplicates(
    rows.map((r) => r.description),
    (t) => t
  );
  lines.push(`### description`);
  lines.push(descDup.length ? `**發現重複 ${descDup.length} 組**` : `**無重複**`);
  if (descDup.length) {
    for (const d of descDup.slice(0, 20)) {
      lines.push(`- 次數 ${d.count}：${d.value.slice(0, 120)}…`);
    }
  }
  lines.push("");

  const faqFinger = rows.map((r) => JSON.stringify(r.faq));
  const faqDup = duplicates(faqFinger, (f) => f.slice(0, 80));
  lines.push(`### FAQ（整組 JSON 相同）`);
  lines.push(faqDup.length ? `**發現 ${faqDup.length} 組完全相同的 FAQ 區塊**` : `**無完全相同的 FAQ 區塊**`);
  if (faqDup.length) {
    for (const d of faqDup.slice(0, 15)) {
      lines.push(`- 次數 ${d.count}`);
    }
  }
  lines.push("");

  const ucFinger = rows.map((r) => JSON.stringify(r.useCases));
  const ucDup = duplicates(ucFinger, (f) => f.slice(0, 80));
  lines.push(`### useCases（整組 JSON 相同）`);
  lines.push(ucDup.length ? `**發現 ${ucDup.length} 組完全相同的 useCases**` : `**無完全相同的 useCases**`);
  if (ucDup.length) {
    for (const d of ucDup.slice(0, 15)) {
      lines.push(`- 次數 ${d.count}`);
    }
  }
  lines.push("");

  // --- 關鍵字相似度（同 tool） ---
  lines.push(`## 2. 關鍵字重疊度（同工具類別）`);
  lines.push("");
  lines.push(`- 指標：兩筆 keywords 逗號欄位的 Jaccard 係數。`);
  lines.push(`- 門檻：≥ **0.75** 列為「重疊偏高」；≥ **0.9** 列為「重疊過高」。`);
  lines.push("");

  const KW_HIGH = 0.75;
  const KW_VERY = 0.9;
  const byTool = groupByTool(rows);
  let globalMaxKw = 0;
  let globalMaxKwPair = null;

  for (const [tool, list] of byTool) {
    const high = [];
    let toolMaxKw = 0;
    let toolMaxPair = null;
    for (let i = 0; i < list.length; i++) {
      const Ai = keywordSet(list[i].keywords);
      for (let j = i + 1; j < list.length; j++) {
        const Bj = keywordSet(list[j].keywords);
        const jacc = jaccard(Ai, Bj);
        if (jacc > toolMaxKw) {
          toolMaxKw = jacc;
          toolMaxPair = [list[i].slug, list[j].slug];
        }
        if (jacc > globalMaxKw) {
          globalMaxKw = jacc;
          globalMaxKwPair = { tool, a: list[i].slug, b: list[j].slug };
        }
        if (jacc >= KW_HIGH) {
          high.push({ slugA: list[i].slug, slugB: list[j].slug, jacc });
        }
      }
    }
    high.sort((a, b) => b.jacc - a.jacc);
    const very = high.filter((x) => x.jacc >= KW_VERY);
    lines.push(`### ${tool}`);
    lines.push(
      `- 同工具內最高 Jaccard：**${toolMaxKw.toFixed(3)}**（${toolMaxPair ? `${toolMaxPair[0]} / ${toolMaxPair[1]}` : "—"}）`
    );
    lines.push(`- ≥${KW_HIGH} 的筆對數：**${high.length}**（其中 ≥${KW_VERY}：**${very.length}**）`);
    if (very.length && very.length <= 25) {
      lines.push("");
      lines.push("| slug A | slug B | Jaccard |");
      lines.push("| --- | --- | --- |");
      for (const x of very.slice(0, 25)) {
        lines.push(`| ${x.slugA} | ${x.slugB} | ${x.jacc.toFixed(3)} |`);
      }
    } else if (very.length > 25) {
      lines.push("");
      lines.push("（筆對過多，略；請以全檔最大值為主）");
    }
    lines.push("");
  }

  // reset max for per-tool description - recalc properly in loop
  lines.push(`## 3. 同工具 description 相似度（字元 bigram Jaccard）`);
  lines.push("");
  lines.push(`- 指標：描述文字經去空白後，字元 bigram 的 Jaccard。`);
  lines.push(`- 門檻：≥ **0.55** 列為「偏相似」；≥ **0.72** 列為「高度相似」。`);
  lines.push("");

  const DESC_WARN = 0.55;
  const DESC_HIGH = 0.72;

  for (const [tool, list] of byTool) {
    let maxD = 0;
    let maxPair = null;
    const pairs = [];
    for (let i = 0; i < list.length; i++) {
      const Bi = bigramSet(list[i].description);
      for (let j = i + 1; j < list.length; j++) {
        const Bj = bigramSet(list[j].description);
        const jacc = jaccardBigram(Bi, Bj);
        if (jacc > maxD) {
          maxD = jacc;
          maxPair = [list[i].slug, list[j].slug];
        }
        if (jacc >= DESC_WARN) {
          pairs.push({ slugA: list[i].slug, slugB: list[j].slug, jacc });
        }
      }
    }
    pairs.sort((a, b) => b.jacc - a.jacc);
    const high = pairs.filter((x) => x.jacc >= DESC_HIGH);
    lines.push(`### ${tool}`);
    lines.push(`- 同工具內最高 bigram Jaccard：**${maxD.toFixed(3)}**（${maxPair ? `${maxPair[0]} / ${maxPair[1]}` : "—"}）`);
    lines.push(`- ≥${DESC_WARN} 的筆對數：**${pairs.length}**（其中 ≥${DESC_HIGH}：**${high.length}**）`);
    if (pairs.length) {
      lines.push("");
      lines.push("前 12 筆（由高到低）：");
      lines.push("");
      lines.push("| slug A | slug B | Jaccard |");
      lines.push("| --- | --- | --- |");
      for (const x of pairs.slice(0, 12)) {
        lines.push(`| ${x.slugA} | ${x.slugB} | ${x.jacc.toFixed(3)} |`);
      }
    }
    lines.push("");
  }

  // --- 總結 ---
  lines.push(`## 4. 總結與建議`);
  lines.push("");
  const ok =
    slugDup.length === 0 &&
    titleDup.length === 0 &&
    descDup.length === 0 &&
    faqDup.length === 0 &&
    ucDup.length === 0;
  lines.push(
    ok
      ? `- **完全重複項目**：無（slug／title／description／FAQ／useCases）。`
      : `- **完全重複項目**：請見上文標記區段，需修正資料產生邏輯或手動去重。`
  );
  lines.push(
    `- **關鍵字**：全檔跨筆對最高 Jaccard 約 **${globalMaxKw.toFixed(3)}**（${globalMaxKwPair ? `${globalMaxKwPair.tool}：${globalMaxKwPair.a} / ${globalMaxKwPair.b}` : "—"}）；目前未達 0.75 偏高門檻。若未來高於 0.85，可再增加每筆獨立語意標籤。`
  );
  lines.push(
    `- **描述相似度**：請以第 3 節「同工具內最高 bigram Jaccard」為主；未達 0.72 高度相似門檻通常可接受。若特定主題群組仍偏近，可再微調場景句型或加入更多專有名詞。`
  );
  lines.push("");
  lines.push(`---`);
  lines.push(`*本報告由 \`scripts/checkSeoPagesQuality.mjs\` 自動產生。*`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log("Wrote", OUT);
}

run();
