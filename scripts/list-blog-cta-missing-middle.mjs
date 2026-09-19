import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/pages/blog");

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".tsx"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (t.includes("ArticleCTA") && !t.includes('placement="middle"')) {
    console.log(f);
  }
}
