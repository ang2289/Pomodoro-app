/**
 * 批次在 src/pages/blog/*.tsx 插入 ArticleCTA（政策文、身心文、其餘 fallback）
 * 執行：node scripts/inject-article-cta.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "..", "src", "pages", "blog");

const SKIP = new Set([
  "BlogHome.tsx",
  "index.tsx",
  "LazyHome.tsx",
  "ArticleTemplate.tsx",
  "policy-explained.tsx",
]);

function inferFocus(relPath) {
  const lower = relPath.replace(/\\/g, "/").toLowerCase();
  if (lower.includes("homework-helper")) return "homework";
  if (lower.includes("qr-code") || lower.includes("/[slug]")) return "qr";
  if (
    lower.includes("ai-summary") ||
    lower.includes("summary-guide") ||
    lower.includes("free-ai-tools")
  )
    return "summary";
  if (lower.includes("-explained")) return "summary";
  return "tools";
}

function addImport(src) {
  if (src.includes('from "@/components/ArticleCTA"')) return src;
  const lines = src.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) lastImport = i;
  }
  if (lastImport === -1) return src;
  lines.splice(
    lastImport + 1,
    0,
    `import ArticleCTA from "@/components/ArticleCTA";`
  );
  return lines.join("\n");
}

function policyInject(src, focus) {
  let c = src;

  const proseFirstP =
    /(<div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">\s*\n\s*<p className="mb-4">[\s\S]*?<\/p>)/;
  if (proseFirstP.test(c) && !c.includes('placement="start"')) {
    c = c.replace(
      proseFirstP,
      `$1\n\n            <ArticleCTA placement="start" focus="${focus}" />\n`
    );
  }

  const midBlock =
    /(\{\/\* 中段導覽區塊 \*\/\}[\s\S]*?<\/div>\s*\n)/;
  if (midBlock.test(c) && !c.includes('placement="middle"')) {
    c = c.replace(
      midBlock,
      `$1            <ArticleCTA placement="middle" focus="${focus}" />\n\n`
    );
  } else if (
    !c.includes('placement="middle"') &&
    proseFirstP.test(c) &&
    c.includes('placement="start"')
  ) {
    const afterSecondP =
      /(<div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">[\s\S]*?<p className="mb-4">[\s\S]*?<\/p>\s*\n\s*<p className="mb-4">[\s\S]*?<\/p>)/;
    if (afterSecondP.test(c)) {
      c = c.replace(
        afterSecondP,
        `$1\n\n            <ArticleCTA placement="middle" focus="${focus}" />\n`
      );
    }
  }

  if (!c.includes('placement="afterFaq"')) {
    c = c.replace(
      /(\{\/\* 相關文章區塊 \*\/\})/,
      `<ArticleCTA placement="afterFaq" focus="${focus}" />\n\n          $1`
    );
  }

  if (!c.includes('placement="bottom"')) {
    c = c.replace(
      /(\n\s*)(<div className="mt-8 pt-6 border-t border-gray-200">\s*\n\s*<Link\s*\n\s*to="\/blog\/policy-explained")/,
      `\n          <ArticleCTA placement="bottom" focus="${focus}" />$1$2`
    );
  }

  return c;
}

function wellnessInject(src, focus) {
  let c = src;
  if (!c.includes("gradient-bg") || !c.includes("bg-white/80")) return c;

  const firstP = /(<p className="mb-4">[\s\S]*?<\/p>)/;
  if (!c.includes('placement="start"') && firstP.test(c)) {
    c = c.replace(firstP, `$1\n\n        <ArticleCTA placement="start" focus="${focus}" />\n`);
  }

  const twoP = /^([\s\S]*?<p className="mb-4">[\s\S]*?<\/p>\s*\n\s*<p className="mb-4">[\s\S]*?<\/p>)/m;
  if (!c.includes('placement="middle"') && twoP.test(c)) {
    c = c.replace(
      twoP,
      (m) => `${m}\n\n        <ArticleCTA placement="middle" focus="${focus}" />\n`
    );
  }

  if (!c.includes('placement="afterFaq"')) {
    c = c.replace(
      /(<p className="mt-8 text-gray-500 text-center text-sm">)/,
      `<ArticleCTA placement="afterFaq" focus="${focus}" />\n\n        $1`
    );
  }

  if (!c.includes('placement="bottom"')) {
    c = c.replace(
      /(<hr className="my-8 border-gray-300" \/>)/,
      `<ArticleCTA placement="bottom" focus="${focus}" />\n\n        $1`
    );
  }

  if (!c.includes('placement="bottom"')) {
    c = c.replace(
      /(<\/article>)/,
      `        <ArticleCTA placement="bottom" focus="${focus}" />\n\n      $1`
    );
  }

  return c;
}

function fallbackStack(src, focus) {
  if (src.includes('placement="start"')) return src;
  const marker = "</article>";
  const idx = src.lastIndexOf(marker);
  if (idx === -1) return src;
  const block = `
        <ArticleCTA placement="start" focus="${focus}" />
        <ArticleCTA placement="middle" focus="${focus}" />
        <ArticleCTA placement="afterFaq" focus="${focus}" />
        <ArticleCTA placement="bottom" focus="${focus}" />
`;
  return src.slice(0, idx) + block + "\n      " + src.slice(idx);
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith(".tsx")) files.push(p);
  }
  return files;
}

function main() {
  const files = walk(blogDir);
  let changed = 0;
  for (const filePath of files) {
    const base = path.basename(filePath);
    if (SKIP.has(base)) continue;

    let src = fs.readFileSync(filePath, "utf8");
    if (src.includes('from "@/components/ArticleCTA"')) continue;

    const rel = path.relative(path.join(__dirname, ".."), filePath);
    const focus = inferFocus(rel);

    const before = src;
    src = addImport(src);

    if (src.includes("prose prose-lg max-w-none text-gray-700 leading-relaxed")) {
      src = policyInject(src, focus);
    } else if (src.includes("gradient-bg") && src.includes("bg-white/80")) {
      src = wellnessInject(src, focus);
    } else {
      src = fallbackStack(src, focus);
    }

    if (src !== before) {
      fs.writeFileSync(filePath, src, "utf8");
      changed++;
      console.log("updated:", rel);
    }
  }
  console.log("done, files changed:", changed);
}

main();
