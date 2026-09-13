import fs from 'fs';
import path from 'path';

const target = path.resolve('src/pages/images/index.tsx');
if (!fs.existsSync(target)) throw new Error(`File not found: ${target}`);

const originalRaw = fs.readFileSync(target, 'utf8');
const hadCrLf = originalRaw.includes('\r\n');
const original = originalRaw.replace(/\r\n/g, '\n');

if (original.includes('RXV_HIDE_PUBLIC_TEST_CATEGORY')) {
  console.log('RXV test category is already hidden; no duplicate change.');
  process.exit(0);
}

const backupDir = path.resolve('backup/hide-test-category-v1');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `index.tsx.${stamp}.bak`);
fs.writeFileSync(backup, originalRaw, 'utf8');

const from = `        const categoryMap = new Map<string, ImageCategory>();

        (manifest.categories || []).forEach((category) => {
          if (category?.id) categoryMap.set(category.id, category);
        });

        const formatted: ImageAsset[] = sourceImages
          .filter((img) => img?.id)`;

const to = `        // RXV_HIDE_PUBLIC_TEST_CATEGORY
        // Keep R2/catalog data untouched; hide internal test categories only on the public website.
        const hiddenPublicCategoryNames = new Set(["\\u672c\\u6a5f WebP \\u6e2c\\u8a66"]);
        const hiddenPublicCategoryIds = new Set(
          (manifest.categories || [])
            .filter((category) =>
              hiddenPublicCategoryNames.has(String(category?.name || "").trim()),
            )
            .map((category) => String(category?.id || "").trim())
            .filter(Boolean),
        );

        const categoryMap = new Map<string, ImageCategory>();

        (manifest.categories || []).forEach((category) => {
          const categoryId = String(category?.id || "").trim();
          const categoryName = String(category?.name || "").trim();
          if (
            categoryId &&
            !hiddenPublicCategoryIds.has(categoryId) &&
            !hiddenPublicCategoryNames.has(categoryName)
          ) {
            categoryMap.set(categoryId, category);
          }
        });

        const formatted: ImageAsset[] = sourceImages
          .filter((img) => {
            if (!img?.id) return false;
            const categoryId = String(
              img.category_id ||
                img.category_slug ||
                img.category_name ||
                img.category ||
                "",
            ).trim();
            const categoryName = String(img.category_name || img.category || "").trim();
            return (
              !hiddenPublicCategoryIds.has(categoryId) &&
              !hiddenPublicCategoryNames.has(categoryId) &&
              !hiddenPublicCategoryNames.has(categoryName)
            );
          })`;

if (!original.includes(from)) {
  throw new Error('Could not find the image manifest category block. No file was changed.');
}

let next = original.replace(from, to);
if (hadCrLf) next = next.replace(/\n/g, '\r\n');
fs.writeFileSync(target, next, 'utf8');

console.log('RXV public website test-category hide v1 applied.');
console.log('Hidden from /images: local WebP test category and its test images.');
console.log(`Backup: ${backup}`);
console.log('R2, catalog JSON, image files, admin upload, and mobile APP were not changed.');
console.log('Next: npm run dev, then check http://localhost:3005/images');
