/**
 * One-off: insert <ArticleCTA placement="middle" ... /> before 結語 h2 (wellness)
 * or at a policy-specific anchor. Idempotent if middle already exists.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "../src/pages/blog");

const policyFiles = new Set([
  "car-import-tariff-explained.tsx",
  "cheng-li-chun-policy-role-explained.tsx",
  "college-entrance-exam-explained.tsx",
  "dependent-deduction-explained.tsx",
  "government-announcement-impact-explained.tsx",
  "household-registration-explained.tsx",
  "hsr-booking-system-explained.tsx",
  "labor-insurance-pension-explained.tsx",
  "labor-pension-new-system-explained.tsx",
  "long-term-care-subsidy-explained.tsx",
  "minimum-wage-explained.tsx",
  "minimum-wage-impact-explained.tsx",
  "nhi-premium-explained.tsx",
  "policy-design-reality-explained.tsx",
  "subsidy-visibility-explained.tsx",
]);

function injectMiddle(t, focus) {
  const line = `        <ArticleCTA placement="middle" focus="${focus}" />\n\n`;
  if (t.includes('placement="middle"')) return t;

  // Wellness: line with 結語 in h2 (Chinese section before English / bottom CTA)
  const reKetsugo =
    /\n(        <h2 className="text-2xl font-semibold mt-8 mb-3">[^<]*結語[^<]*<\/h2>)/;
  if (reKetsugo.test(t)) {
    return t.replace(reKetsugo, `\n${line}$1`);
  }

  return null;
}

// Short wellness pages: insert before last Chinese h2 block before first "placement=\"bottom\""
const shortAnchors = [
  {
    file: "AfternoonStretch.tsx",
    before: `        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 心靈重啟的 3 分鐘</h2>`,
  },
  {
    file: "HealthyLunch.tsx",
    before: `        <h2 className="text-2xl font-semibold mt-8 mb-3">🍵 心靈補給的小儀式</h2>`,
  },
  {
    file: "PerfectBreakfastTime.tsx",
    before: `        <h2 className="text-2xl font-semibold mt-8 mb-3">💫 讓早餐成為調頻鑰匙</h2>`,
  },
  {
    file: "evening-meditation.tsx",
    before: `        <h2 className="text-2xl font-semibold mt-8 mb-3">🌸 每晚 10 分鐘的小禮物</h2>`,
  },
  {
    file: "HydrationMeditation.tsx",
    before: `        <h2 className="text-2xl font-semibold mt-8 mb-3">💧 每次喝水，都是一次重啟</h2>`,
  },
];

function main() {
  const missing = [];
  for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith(".tsx"))) {
    const t = fs.readFileSync(path.join(blogDir, f), "utf8");
    if (t.includes("ArticleCTA") && !t.includes('placement="middle"')) {
      missing.push(f);
    }
  }

  for (const f of missing) {
    const full = path.join(blogDir, f);
    let t = fs.readFileSync(full, "utf8");
    const focus = policyFiles.has(f) ? "summary" : "tools";

    const anchor = shortAnchors.find((a) => a.file === f);
    if (anchor) {
      const line = `        <ArticleCTA placement="middle" focus="${focus}" />\n\n`;
      if (!t.includes(anchor.before)) {
        console.error("Anchor not found:", f);
        continue;
      }
      t = t.replace(anchor.before, line + anchor.before);
      fs.writeFileSync(full, t);
      console.log("ok (anchor)", f);
      continue;
    }

    const next = injectMiddle(t, focus);
    if (next) {
      fs.writeFileSync(full, next);
      console.log("ok (結語)", f);
    } else {
      console.error("SKIP manual:", f);
    }
  }
}

main();
