#!/usr/bin/env node

import fs from "fs";
import path from "path";

const root = process.cwd();
const reportPath = path.join(root, "RXV-COST-REPORT.txt");

const ignoreDirNames = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".vercel",
  "coverage", ".cache", ".turbo", ".vite"
]);

const ignoreNamePatterns = [
  /^_?backup/i,
  /^_?rxv_backup/i,
  /^backup[-_]/i,
  /[-_]backup[-_]/i,
  /^old[-_]/i,
  /^archive[-_]/i
];

const ignoreExactFiles = new Set([
  "AGENTS.md",
  "COST_LIMITS.json",
  "RXV-COST-REPORT.txt",
  "check-cost-policy.mjs"
]);

const textExts = new Set([
  ".js",".cjs",".mjs",".ts",".tsx",".jsx",".json",".md",".txt",".env",".yaml",".yml"
]);

const riskRules = [
  {
    level: "HIGH",
    label: "OpenAI API",
    patterns: [/OPENAI_API_KEY/i, /from\s+["']openai["']/i, /require\(["']openai["']\)/i, /new\s+OpenAI\s*\(/i]
  },
  {
    level: "HIGH",
    label: "Anthropic / Claude API",
    patterns: [/ANTHROPIC_API_KEY/i, /@anthropic-ai\/sdk/i, /new\s+Anthropic\s*\(/i]
  },
  {
    level: "HIGH",
    label: "Gemini / Google Generative AI API",
    patterns: [/GEMINI_API_KEY/i, /GOOGLE_API_KEY/i, /@google\/generative-ai/i, /@google\/genai/i, /GoogleGenerativeAI/i]
  },
  {
    level: "MEDIUM",
    label: "Supabase Storage",
    patterns: [/supabase\.storage/i, /\.storage\s*\.\s*from\s*\(/i]
  },
  {
    level: "MEDIUM",
    label: "Supabase Edge Function / Functions code",
    pathTest: p => /(^|[\\/])supabase[\\/]functions[\\/]/i.test(p)
  },
  {
    level: "MEDIUM",
    label: "Vercel / serverless API route",
    pathTest: p => /(^|[\\/])api[\\/].+\.(js|ts|mjs|cjs)$/i.test(p)
  },
  {
    level: "INFO",
    label: "Cloudflare R2 / S3 client",
    patterns: [/S3Client/i, /R2_/i, /cloudflarestorage/i, /r2\.cloudflarestorage\.com/i]
  }
];

function shouldIgnorePath(fullPath) {
  const rel = path.relative(root, fullPath);
  const parts = rel.split(/[\\/]+/);

  for (const part of parts) {
    if (ignoreDirNames.has(part)) return true;
    if (ignoreNamePatterns.some(rx => rx.test(part))) return true;
  }

  if (ignoreExactFiles.has(path.basename(fullPath))) return true;
  return false;
}

function isTextFile(file) {
  const name = path.basename(file);
  if (name.startsWith(".env")) return true;
  return textExts.has(path.extname(file).toLowerCase());
}

const findings = [];
const envVars = new Set();
let scannedFiles = 0;

function inspectEnvNames(content) {
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]{2,})\s*=/);
    if (!m) continue;
    const key = m[1];
    if (/OPENAI|ANTHROPIC|GEMINI|GOOGLE_API|SUPABASE|R2|CLOUDFLARE|VERCEL/i.test(key)) {
      envVars.add(key);
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (shouldIgnorePath(full)) continue;

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!isTextFile(full)) continue;

    let content = "";
    try {
      content = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }

    scannedFiles++;
    const rel = path.relative(root, full);

    if (entry.name.startsWith(".env")) {
      inspectEnvNames(content); // only collect variable names, never values
    }

    for (const rule of riskRules) {
      let hit = false;

      if (rule.pathTest && rule.pathTest(rel)) hit = true;

      if (!hit && rule.patterns) {
        hit = rule.patterns.some(rx => rx.test(content));
      }

      if (hit) {
        findings.push({
          level: rule.level,
          label: rule.label,
          file: rel
        });
      }
    }
  }
}

walk(root);

const uniqueMap = new Map();
for (const f of findings) {
  const k = `${f.level}|${f.label}|${f.file}`;
  if (!uniqueMap.has(k)) uniqueMap.set(k, f);
}
const unique = [...uniqueMap.values()];

const order = { HIGH: 0, MEDIUM: 1, INFO: 2 };
unique.sort((a,b) =>
  (order[a.level] - order[b.level]) ||
  a.label.localeCompare(b.label) ||
  a.file.localeCompare(b.file)
);

const groups = {
  HIGH: unique.filter(x => x.level === "HIGH"),
  MEDIUM: unique.filter(x => x.level === "MEDIUM"),
  INFO: unique.filter(x => x.level === "INFO")
};

const lines = [];
lines.push("RXV COST POLICY REPORT");
lines.push("======================");
lines.push(`Project: ${root}`);
lines.push(`Scanned active text files: ${scannedFiles}`);
lines.push(`Ignored backups: yes`);
lines.push("");

if (groups.HIGH.length === 0 && groups.MEDIUM.length === 0 && groups.INFO.length === 0) {
  lines.push("PASS: No configured cloud/API risk patterns found in active code.");
} else {
  lines.push(`HIGH RISK (metered/paid-capable API): ${groups.HIGH.length}`);
  for (const f of groups.HIGH) lines.push(`- ${f.label}: ${f.file}`);
  lines.push("");

  lines.push(`MEDIUM RISK (cloud compute/storage usage): ${groups.MEDIUM.length}`);
  for (const f of groups.MEDIUM) lines.push(`- ${f.label}: ${f.file}`);
  lines.push("");

  lines.push(`INFO (cloud service present, review limits): ${groups.INFO.length}`);
  for (const f of groups.INFO) lines.push(`- ${f.label}: ${f.file}`);
}

lines.push("");
lines.push("ENV VARIABLE NAMES FOUND (values are NOT shown):");
if (envVars.size === 0) {
  lines.push("- none");
} else {
  for (const k of [...envVars].sort()) lines.push(`- ${k}`);
}

lines.push("");
lines.push("Interpretation:");
lines.push("- HIGH does NOT mean you are currently being charged.");
lines.push("- It means active code contains an API that can create usage-based cost.");
lines.push("- MEDIUM means cloud compute/storage exists and should be checked against free-tier limits.");
lines.push("- Backup folders/files are excluded from this report.");
lines.push("- This scanner is warning-only and does not modify or block your app.");

const report = lines.join("\r\n");
fs.writeFileSync(reportPath, report, "utf8");
console.log(report);
console.log("");
console.log(`Saved report: ${reportPath}`);
