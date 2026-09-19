#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const reportPath = path.join(root, "RXV-COST-RUNTIME-REPORT.txt");

const ignoreDirs = new Set([
  "node_modules",".git","dist","build",".next",".vercel","coverage",".cache",".turbo",".vite",
  "backup","backups","api-unused"
]);

const ignorePartPatterns = [
  /^_?backup/i,
  /^_?rxv_backup/i,
  /^old[-_]/i,
  /^archive[-_]/i,
  /\.bak$/i,
  /\.before[-_.]/i,
  /before-v\d/i
];

const ignoreFiles = new Set([
  "AGENTS.md","COST_LIMITS.json","RXV-COST-REPORT.txt","RXV-COST-RUNTIME-REPORT.txt",
  "package-lock.json","package.json","GOOGLE_CALENDAR_SETUP.md","README.md","README_安裝.txt"
]);

const runtimeRoots = [
  "src","api","server","supabase"
];

const textExts = new Set([".js",".cjs",".mjs",".ts",".tsx",".jsx",".env"]);

const rules = [
  { level:"HIGH", label:"OpenAI API", patterns:[
    /OPENAI_API_KEY/i,/from\s+["']openai["']/i,/require\(["']openai["']\)/i,/new\s+OpenAI\s*\(/i
  ]},
  { level:"HIGH", label:"Gemini API", patterns:[
    /GEMINI_API_KEY/i,/GOOGLE_API_KEY/i,/@google\/generative-ai/i,/@google\/genai/i,/GoogleGenerativeAI/i
  ]},
  { level:"HIGH", label:"Anthropic API", patterns:[
    /ANTHROPIC_API_KEY/i,/@anthropic-ai\/sdk/i,/new\s+Anthropic\s*\(/i
  ]},
  { level:"MEDIUM", label:"Supabase Storage", patterns:[
    /supabase\.storage/i,/\.storage\s*\.\s*from\s*\(/i
  ]},
  { level:"MEDIUM", label:"Supabase Edge Function", pathTest:p =>
    /(^|[\\/])supabase[\\/]functions[\\/]/i.test(p)
  },
  { level:"MEDIUM", label:"Vercel API Route", pathTest:p =>
    /(^|[\\/])api[\\/].+\.(js|ts|mjs|cjs)$/i.test(p)
  },
  { level:"INFO", label:"Cloudflare R2 / S3", patterns:[
    /S3Client/i,/R2_/i,/r2\.cloudflarestorage\.com/i,/cloudflarestorage/i
  ]}
];

function ignored(full) {
  const rel = path.relative(root, full);
  const parts = rel.split(/[\\/]+/);
  if (parts.some(p => ignoreDirs.has(p))) return true;
  if (parts.some(p => ignorePartPatterns.some(rx => rx.test(p)))) return true;
  if (ignoreFiles.has(path.basename(full))) return true;
  return false;
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const full = path.join(dir,e.name);
    if (ignored(full)) continue;
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = [];
for (const rr of runtimeRoots) files.push(...walk(path.join(root,rr)));

// also inspect live env files at root only
for (const envName of [".env",".env.local",".env.production",".env.production.local"]) {
  const p = path.join(root, envName);
  if (fs.existsSync(p)) files.push(p);
}

const findings = [];
const envNames = new Set();
let scanned = 0;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file);
  if (!textExts.has(ext) && !base.startsWith(".env")) continue;

  let content = "";
  try { content = fs.readFileSync(file,"utf8"); } catch { continue; }
  scanned++;
  const rel = path.relative(root,file);

  if (base.startsWith(".env")) {
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z][A-Z0-9_]{2,})\s*=/);
      if (m && /OPENAI|ANTHROPIC|GEMINI|GOOGLE_API|SUPABASE|R2|CLOUDFLARE|VERCEL/i.test(m[1])) {
        envNames.add(m[1]);
      }
    }
  }

  for (const r of rules) {
    let hit = false;
    if (r.pathTest && r.pathTest(rel)) hit = true;
    if (!hit && r.patterns) hit = r.patterns.some(rx => rx.test(content));
    if (hit) findings.push({level:r.level,label:r.label,file:rel});
  }
}

const seen = new Set();
const uniq = findings.filter(f => {
  const k = `${f.level}|${f.label}|${f.file}`;
  if (seen.has(k)) return false;
  seen.add(k); return true;
});

const order = {HIGH:0,MEDIUM:1,INFO:2};
uniq.sort((a,b)=>order[a.level]-order[b.level] || a.file.localeCompare(b.file));

const lines = [];
lines.push("RXV RUNTIME COST AUDIT");
lines.push("======================");
lines.push(`Project: ${root}`);
lines.push(`Runtime files scanned: ${scanned}`);
lines.push("Excluded: backups, *.bak, *.before-*, api-unused, docs, package files, build outputs");
lines.push("");

for (const level of ["HIGH","MEDIUM","INFO"]) {
  const arr = uniq.filter(x=>x.level===level);
  lines.push(`${level}: ${arr.length}`);
  for (const f of arr) lines.push(`- ${f.label}: ${f.file}`);
  lines.push("");
}

lines.push("LIVE ENV VARIABLE NAMES (values hidden):");
for (const n of [...envNames].sort()) lines.push(`- ${n}`);
if (envNames.size===0) lines.push("- none");

lines.push("");
lines.push("Meaning:");
lines.push("- HIGH = active runtime code or live env references a paid-capable API.");
lines.push("- MEDIUM = active cloud compute/storage path exists.");
lines.push("- INFO = cloud service exists and should be kept under free-tier limits.");
lines.push("- Presence does not prove current billing.");

const report = lines.join("\r\n");
fs.writeFileSync(reportPath,report,"utf8");
console.log(report);
console.log("");
console.log(`Saved: ${reportPath}`);
