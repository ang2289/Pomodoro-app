import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const adminFile = path.join(root, 'src', 'pages', 'admin', 'images.tsx')
const viteFile = path.join(root, 'vite.config.ts')
const backupDir = path.join(root, 'backup', 'image-admin-v4')
const adminMarker = 'RXV_IMAGE_ADMIN_V4'
const viteMarker = 'rxv-local-image-admin-api-v4'

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function backup(file) {
  fs.mkdirSync(backupDir, { recursive: true })
  const target = path.join(backupDir, `${path.basename(file)}.${stamp()}.bak`)
  fs.copyFileSync(file, target)
  return target
}

function latestBackup(prefix) {
  if (!fs.existsSync(backupDir)) return ''
  const files = fs.readdirSync(backupDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.bak'))
    .sort()
    .reverse()
  return files[0] ? path.join(backupDir, files[0]) : ''
}

if (process.argv.includes('--restore')) {
  const adminBackup = latestBackup('images.tsx.')
  const viteBackup = latestBackup('vite.config.ts.')
  if (!adminBackup || !viteBackup) throw new Error('找不到 v4 備份，無法還原。')
  fs.copyFileSync(adminBackup, adminFile)
  fs.copyFileSync(viteBackup, viteFile)
  console.log(`已還原：${adminBackup}`)
  console.log(`已還原：${viteBackup}`)
  process.exit(0)
}

for (const file of [adminFile, viteFile]) {
  if (!fs.existsSync(file)) throw new Error(`找不到檔案：${file}`)
}

let admin = fs.readFileSync(adminFile, 'utf8')
let vite = fs.readFileSync(viteFile, 'utf8')

const adminBackup = backup(adminFile)
const viteBackup = backup(viteFile)

if (!admin.includes(adminMarker)) {
  const interfaceToken = `interface ImageCategory {\n  id: string\n  name: string\n  sort_order: number\n  is_active: boolean\n}\n`
  if (!admin.includes(interfaceToken)) throw new Error('找不到 ImageCategory 區塊，未修改 admin。')

  const fallbackBlock = `${interfaceToken}\n// ${adminMarker}: 後台固定大分類只影響網站上傳介面，不改 APP，也不改 catalog JSON 結構。\nconst FALLBACK_IMAGE_CATEGORIES: ImageCategory[] = [\n  { id: 'real-estate', name: '房仲／房地產', sort_order: 0, is_active: true },\n  { id: 'hair-salon', name: '美髮／沙龍', sort_order: 1, is_active: true },\n  { id: 'beauty-fashion', name: '美容／時尚', sort_order: 2, is_active: true },\n  { id: 'food-drink', name: '食物／飲品', sort_order: 3, is_active: true },\n  { id: 'business-office', name: '商業／辦公', sort_order: 4, is_active: true },\n  { id: 'product-display', name: '商品展示', sort_order: 5, is_active: true },\n  { id: 'home-lifestyle', name: '居家／生活', sort_order: 6, is_active: true },\n  { id: 'flower-plant', name: '花卉／植物', sort_order: 7, is_active: true },\n  { id: 'background-wallpaper', name: '背景／桌布', sort_order: 8, is_active: true },\n  { id: 'pet-animal', name: '寵物／動物', sort_order: 9, is_active: true },\n  { id: 'wedding-event', name: '婚禮／活動', sort_order: 10, is_active: true },\n  { id: 'travel-hotel', name: '旅遊／住宿', sort_order: 11, is_active: true },\n  { id: 'education', name: '教育／學習', sort_order: 12, is_active: true },\n  { id: 'finance', name: '金融／理財', sort_order: 13, is_active: true },\n  { id: 'professional-service', name: '專業服務', sort_order: 14, is_active: true },\n  { id: 'taiwan-local', name: '台灣在地生活', sort_order: 15, is_active: true },\n  { id: 'nature-landscape', name: '自然／風景', sort_order: 16, is_active: true },\n  { id: 'festival', name: '節慶／節日', sort_order: 17, is_active: true },\n  { id: 'religion-healing', name: '宗教／療癒', sort_order: 18, is_active: true },\n  { id: 'technology', name: '科技／數位', sort_order: 19, is_active: true },\n  { id: 'other', name: '其他素材', sort_order: 20, is_active: true },\n]\n`
  admin = admin.replace(interfaceToken, fallbackBlock)

  const loadingStateToken = `  const [loadingCategories, setLoadingCategories] = useState(false)\n`
  if (!admin.includes(loadingStateToken)) throw new Error('找不到 loadingCategories state。')
  admin = admin.replace(
    loadingStateToken,
    `${loadingStateToken}  const [catalogWarning, setCatalogWarning] = useState('')\n`,
  )

  const refreshStart = `  const refreshCatalog = async () => {\n    const response = await imageAdminFetch('/api/image-admin?action=admin-list-images')\n    const data = await response.json().catch(() => ({}))\n    if (!response.ok || !data?.ok) throw new Error(data?.error || \`HTTP \${response.status}\`)\n    const uniqueCategories = new Map<string, ImageCategory>()\n`
  if (!admin.includes(refreshStart)) throw new Error('找不到 refreshCatalog 起點。')
  admin = admin.replace(
    refreshStart,
    `  const refreshCatalog = async () => {\n    const response = await imageAdminFetch('/api/image-admin?action=admin-list-images')\n    const data = await response.json().catch(() => ({}))\n    if (!response.ok || !data?.ok) throw new Error(data?.error || \`HTTP \${response.status}\`)\n    const uniqueCategories = new Map<string, ImageCategory>()\n    for (const category of FALLBACK_IMAGE_CATEGORIES) {\n      uniqueCategories.set(category.id, category)\n    }\n`,
  )

  const rowsToken = `    const rows = [...uniqueCategories.values()]\n    setCategories(rows)\n    setSelectedCategoryId((current) => current || rows[0]?.id || '')\n    return Number(data?.total || 0)\n`
  if (!admin.includes(rowsToken)) throw new Error('找不到分類 rows 區塊。')
  admin = admin.replace(
    rowsToken,
    `    const rows = [...uniqueCategories.values()]\n    setCategories(rows)\n    setSelectedCategoryId((current) => current || rows[0]?.id || '')\n    setCatalogWarning('')\n    return Number(data?.total || 0)\n`,
  )

  const catchToken = `    } catch (err: any) {\n      console.error('載入分類時發生錯誤:', err)\n      setUploadStatus('載入分類時發生錯誤：' + err.message)\n    } finally {\n`
  if (!admin.includes(catchToken)) throw new Error('找不到 fetchCategories catch 區塊。')
  admin = admin.replace(
    catchToken,
    `    } catch (err: any) {\n      console.error('載入分類時發生錯誤:', err)\n      setCategories(FALLBACK_IMAGE_CATEGORIES)\n      setSelectedCategoryId((current) => current || FALLBACK_IMAGE_CATEGORIES[0]?.id || '')\n      setCatalogWarning('目前無法讀取 R2 分類清單，已改用固定大分類。可先選分類；若上傳仍失敗，請確認本機圖片 API 是否正常。')\n      setUploadStatus('')\n    } finally {\n`,
  )

  const categoryEndToken = `            {!selectedCategoryId && uploadStatus === '請先選擇圖片分類' && (\n              <p className="text-sm text-red-600 mt-1">請先選擇圖片分類</p>\n            )}\n          </div>\n\n          {/* 圖片方案選擇 */}`
  if (!admin.includes(categoryEndToken)) throw new Error('找不到分類 UI 結尾。')
  admin = admin.replace(
    categoryEndToken,
    `            {!selectedCategoryId && uploadStatus === '請先選擇圖片分類' && (\n              <p className="text-sm text-red-600 mt-1">請先選擇圖片分類</p>\n            )}\n            {catalogWarning && (\n              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-800">\n                {catalogWarning}\n              </p>\n            )}\n          </div>\n\n          {/* 圖片方案選擇 */}`,
  )

  admin = admin.replace(
    '完整素材庫（NT$399 素材包）－本階段固定',
    '網站付費素材（原圖不公開）－本階段固定',
  )
}

if (!vite.includes(viteMarker)) {
  const pluginToken = `    react(),\n    {\n      name: 'local-group-buy-api',`
  if (!vite.includes(pluginToken)) throw new Error('找不到 Vite plugin 插入點，未修改 vite.config.ts。')

  const localImageAdminPlugin = `    react(),\n    {\n      name: '${viteMarker}',\n      apply: 'serve' as const,\n      configureServer(server: any) {\n        server.middlewares.use(async (req: any, res: any, next: () => void) => {\n          if (!req.url?.startsWith('/api/image-admin')) return next()\n          try {\n            const requestUrl = new URL(req.url, 'http://localhost')\n            req.query = Object.fromEntries(requestUrl.searchParams.entries())\n            if (!req.body && !['GET', 'HEAD'].includes(String(req.method || '').toUpperCase())) {\n              const chunks: Buffer[] = []\n              for await (const chunk of req) chunks.push(Buffer.from(chunk))\n              const rawBody = Buffer.concat(chunks).toString('utf8')\n              if (rawBody) {\n                try { req.body = JSON.parse(rawBody) } catch { req.body = rawBody }\n              } else {\n                req.body = {}\n              }\n            }\n            res.status = (statusCode: number) => {\n              res.statusCode = statusCode\n              return res\n            }\n            res.json = (payload: unknown) => {\n              res.setHeader('Content-Type', 'application/json; charset=utf-8')\n              res.end(JSON.stringify(payload))\n              return res\n            }\n            const apiModule = await server.ssrLoadModule('/api/image-admin.ts')\n            await apiModule.default(req, res)\n          } catch (error: any) {\n            console.error('[local-image-admin-api] request failed', error)\n            if (!res.headersSent) {\n              res.statusCode = 500\n              res.setHeader('Content-Type', 'application/json; charset=utf-8')\n            }\n            if (!res.writableEnded) res.end(JSON.stringify({ ok: false, error: error?.message || 'LOCAL_IMAGE_ADMIN_API_FAILED' }))\n          }\n        })\n      },\n    },\n    {\n      name: 'local-group-buy-api',`

  vite = vite.replace(pluginToken, localImageAdminPlugin)
}

fs.writeFileSync(adminFile, admin, 'utf8')
fs.writeFileSync(viteFile, vite, 'utf8')

console.log('RXV 圖片後台 v4 已套用。')
console.log('只修改網站本機後台與 Vite dev API；沒有修改 rxv-app、Capacitor、APP 版本或 catalog JSON 結構。')
console.log(`後台備份：${adminBackup}`)
console.log(`Vite 備份：${viteBackup}`)
console.log('重啟 npm run dev 後測試：http://localhost:3005/admin/images')
console.log('如要還原：node scripts/apply-image-admin-v4.mjs --restore')
