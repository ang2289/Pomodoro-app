/**
 * 產生 src/data/seoPages.json（220 筆：五類工具各 44 筆）
 * 差異化：依平台／情境／角度組合，避免標題、描述、FAQ、useCases 同質化。
 * 執行：node scripts/generateSeoPagesJson.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src", "data");
const OUT = path.join(ROOT, "seoPages.json");

/** 11 主題 × 4 角度 = 44 筆 */
const ANGLES = ["流程與檢核", "常見尺寸與比例", "跨裝置預覽要點", "上稿前最後檢查"];

function idx11(i) {
  return (i - 1) % 11;
}
function angleIdx(i) {
  return Math.floor((i - 1) / 11) % 4;
}

function buildImageResize(i) {
  const platforms = [
    { name: "Instagram 貼文", detail: "正方形與直式 4:5，注意安全區與字級。" },
    { name: "Instagram 限時動態", detail: "9:16 直式，預留上下 UI 遮擋區。" },
    { name: "Facebook 貼文與連結預覽", detail: "橫式與方形並存，連結縮圖需預留邊距。" },
    { name: "YouTube 縮圖", detail: "16:9 橫式，字級與對比影響點閱。" },
    { name: "LINE 貼文與大圖", detail: "聊天室預覽與官方帳號版位略有差異。" },
    { name: "LinkedIn 動態與文章封面", detail: "偏商務橫式，文件感較重。" },
    { name: "Shopee／電商主圖", detail: "白底與長邊規範，避免邊緣裁切。" },
    { name: "部落格與 CMS 內文圖", detail: "配合佈景 max-width，避免被 CSS 硬拉。" },
    { name: "Email 電子報插圖", detail: "寬度常見 600px 級，檔案不宜過大。" },
    { name: "簡報與 PDF 嵌入圖", detail: "投影解析度與列印解析度目標不同。" },
    { name: "DM 傳單與少量印刷", detail: "出血與裁切線，螢幕與紙本色域差異。" },
  ];
  const a = ANGLES[angleIdx(i)];
  const p = platforms[idx11(i)];
  const ai = angleIdx(i);
  const title = `${p.name}｜${a}｜線上尺寸調整`;
  const tailByAngle = [
    `接下來請在 RxV 內設定目標寬高或比例，並以「${p.name}」實機預覽一次再匯出。`,
    `若你不確定像素，可先查該版位建議值，再一次性輸出，避免來回放大造成模糊。`,
    `建議用手機與桌機各預覽一次「${p.name}」縮放效果，確認字級與邊緣是否被裁切。`,
    `上稿前請核對檔名、比例標註與素材版本；「${p.name}」活動檔常因混檔而誤用舊圖。`,
  ];
  const description = `此頁整理「${p.name}」在「${a}」階段的實務重點：${p.detail} ${tailByAngle[ai]}`;
  const faq = [
    {
      q: `「${p.name}」在「${a}」最常踩的尺寸雷點是什麼？`,
      a: `多與「比例與安全區」有關：${p.detail} 建議以「${a}」為檢查點，並用目標裝置預覽確認字級與邊緣。`,
    },
    {
      q: `處理「${p.name}」素材時，先裁切還是先壓縮？`,
      a:
        ai % 2 === 0
          ? `建議先裁到「${p.name}」適用像素與比例，再視體積決定是否壓縮；在「${a}」階段先確認邊緣與文字清晰。`
          : `若長寬已接近「${p.name}」需求，可先微調比例再壓縮；差異大時先裁切再壓縮，較不易出現雜訊與模糊。`,
    },
    {
      q: `「${p.name}」若未來要印刷或交給外包，要注意什麼？`,
      a:
        a.includes("印刷") || p.name.includes("印刷") || p.name.includes("DM")
          ? `「${p.name}」若涉及出血與裁切線，請預留出血並用較高解析度；螢幕預覽仍以 sRGB 為主，轉印刷需再確認色彩與細線。`
          : `螢幕稿以 RGB 為主；若「${p.name}」後續可能轉印刷或大型輸出，預先保留較高像素並避免細線過細會更安全。`,
    },
  ];
  const useCases = [
    `每週固定上稿「${p.name}」素材、需統一比例與長邊像素者。`,
    `多人在線協作：先對齊「${a}」的檢查項，再交付給外包設計或小編。`,
    `活動檔期前批量匯出：同一主視覺衍生多版位，減少來回溝通。`,
  ];
  const kw = `圖片尺寸,裁切,像素,${p.name.replace(/\s/g, "")},${a},線上修圖,rxv-ir-${i}`;
  return { title, description, faq, useCases, kw };
}

function buildImageCompress(i) {
  const scenarios = [
    { name: "網站配額與 CDN 流量", detail: "首屏與列表縮圖過大會拖慢 LCP。" },
    { name: "Email 附件上限", detail: "常見 10～25MB 信箱限制，夾帶多圖時易爆。" },
    { name: "表單與報名系統上傳", detail: "單檔 2～5MB 限制常導致使用者卡關。" },
    { name: "相簿與雲端備份", detail: "大量原圖占用空間，可接受微損壓縮換容量。" },
    { name: "PNG 透明去背素材", detail: "色階與去背邊緣對壓縮演算法敏感。" },
    { name: "活動現場速傳照片", detail: "通訊軟體傳檔偏好較小 JPG。" },
    { name: "社群貼文配圖", detail: "平台會二次壓縮，原檔太大不一定更清。" },
    { name: "Retina 與 2x 網頁圖", detail: "顯示尺寸與實際像素不同，需平衡銳利度與體積。" },
    { name: "簡報投影與螢幕分享", detail: "檔案過大易造成開啟卡頓或上傳失敗。" },
    { name: "客服截圖與說明圖", detail: "長截圖高度高，檔案容易膨脹。" },
    { name: "電子書與長圖文 PDF 內嵌", detail: "頁數多時，圖檔體積直接影響總檔。" },
  ];
  const lenses = ["體積優先", "畫質優先", "批次處理", "單張精修"];
  const lens = lenses[angleIdx(i)];
  const s = scenarios[idx11(i)];
  const title = `圖片壓縮｜${s.name}（${lens}）`;
  const descTail = [
    `在「${lens}」下，建議先決定可接受的最小可讀細節，再調整壓縮比；與「${s.name}」相關的檔案常需兼顧體積與開啟速度。`,
    `若目標是「${s.name}」的傳輸效率，可先評估是否需先縮像素再壓縮；「${lens}」策略能避免一次壓過頭。`,
    `針對「${s.name}」：${s.detail} 以「${lens}」流程在 RxV 內完成，較容易建立可重複的降檔規則。`,
    `完成後請抽樣檢查邊緣與文字；「${s.name}」若含文字截圖，建議在「${lens}」下用較保守參數。`,
  ][angleIdx(i)];
  const description = `針對「${s.name}」：${s.detail} 本頁從「${lens}」說明壓縮策略與畫質折衷，並整理何時應先改尺寸再壓縮。${descTail}`;
  const faq = [
    {
      q: `「${s.name}」壓縮後變糊，該從哪裡調？`,
      a:
        lens === "畫質優先"
          ? `在「${s.name}」情境下，先確認原始解析度是否高於顯示需求；若「${lens}」仍糊，多半是過度放大或壓縮過頭，可改溫和壓縮或先微縮像素。`
          : `先檢查「${s.name}」是否被放大顯示；顯示尺寸遠小於像素時，先縮像素再壓縮通常比硬壓「${lens}」更有效。`,
    },
    {
      q: `「${s.name}」輸出 JPG 或 PNG 怎麼選？`,
      a:
        s.name.includes("透明")
          ? `「${s.name}」若需透明或去背邊緣，優先 PNG；若屬連續色調照片，可評估 JPG 換更小體積，並在「${lens}」下抽樣檢查。`
          : `照片類多數選 JPG；若「${s.name}」含銳利文字或 UI，PNG 可能更穩，再用「${lens}」微調體積。`,
    },
    {
      q: `「${s.name}」適合批次壓縮嗎？`,
      a:
        lens === "批次處理"
          ? `可批次，但建議「${s.name}」同類素材同參數，並抽樣檢查；重要版面在「${lens}」流程仍建議單張複核。`
          : `若「${s.name}」混雜截圖、去背與照片，建議分開批次或分開參數，避免「${lens}」一次套用導致差異過大。`,
    },
  ];
  const useCases = [
    `明確有「${s.name}」限制時，需在可讀性與檔案大小間取捨者。`,
    `偏好「${lens}」流程：希望一次設定即可套用多檔或願意逐張檢視者。`,
    `與圖片尺寸調整搭配：先降到展示用像素，再壓縮，整體體積更可控。`,
  ];
  const kw = `圖片壓縮,JPG,PNG,檔案縮小,${s.name.replace(/\s/g, "")},${lens},rxv-ic-${i}`;
  return { title, description, faq, useCases, kw };
}

function buildQrCode(i) {
  const buckets = [
    { cat: "社群導流", scene: "Instagram／Threads 個人首頁連結", detail: "適合放追蹤連結或限動精選導向。" },
    { cat: "社群導流", scene: "LINE 官方帳號加好友", detail: "店內桌貼與包裝小卡常用。" },
    { cat: "商務應用", scene: "電子名片與聯絡資訊", detail: "一碼整合電話、官網、表單。" },
    { cat: "商務應用", scene: "收款與發票載具", detail: "需注意防偽與更新失效連結。" },
    { cat: "餐飲場景", scene: "內用／外帶菜單與點餐", detail: "紙本防水與掃描距離要一併考量。" },
    { cat: "餐飲場景", scene: "訂位與候位通知", detail: "連到表單或通訊平台，減少電話占線。" },
    { cat: "活動行銷", scene: "報名與問卷填寫", detail: "線下海報導到線上表單，追蹤檔期轉換。" },
    { cat: "活動行銷", scene: "展場攤位與集點", detail: "可搭配短期活動頁，結束後替換連結。" },
    { cat: "商務應用", scene: "門市 Wi‑Fi 登入說明", detail: "密碼與 SSID 更新時需重印或換動態頁。" },
    { cat: "社群導流", scene: "社群抽獎與留言活動頁", detail: "活動結束後應替換落地內容避免失效。" },
    { cat: "餐飲場景", scene: "外送平台與評價聚合", detail: "一碼導向指定平台或 Google 評論。" },
  ];
  const b = buckets[idx11(i)];
  const focus = ["列印尺寸與掃描距離", "連結更新與備援短網址", "品牌視覺與對比", "追蹤與成效檢視"][angleIdx(i)];
  const title = `QR Code｜${b.cat}：${b.scene}（${focus}）`;
  const focusNote = [
    `在「${focus}」上，請先決定掃描距離與物料尺寸，再回推 QR 模組大小；「${b.scene}」常見錯誤是模組過小。`,
    `若你關注「${focus}」，建議把落地頁與短網址策略一次想清楚，避免「${b.scene}」上線後才頻繁重印。`,
    `從「${focus}」檢視：對比不足會比「${b.scene}」文案缺失更致命，尤其在光線不均的店面。`,
    `「${focus}」需要固定追蹤方式時，請把 UTM 或活動代碼寫進中繼頁規則，別只改 QR 圖檔。`,
  ][angleIdx(i)];
  const description = `此頁聚焦「${b.cat}」的「${b.scene}」。${b.detail} 並從「${focus}」整理注意事項，說明如何用 RxV 產生可掃描、可更新的 QR。${focusNote}`;
  const faq = [
    {
      q: `「${b.scene}」QR 印太小會掃不到嗎？`,
      a: `會。${b.scene} 若出現在遠距離海報，需同步放寬模組尺寸；近距離桌貼可較小，但仍要保留安靜區，並用「${focus}」回推尺寸。`,
    },
    {
      q: `「${b.scene}」連結會換，怎麼降低重印成本？`,
      a:
        focus.includes("更新")
          ? `建議用可替換的中繼頁或短網址；「${b.scene}」在「${focus}」策略下，QR 圖檔可不必重製即可換目的地。`
          : `可先建立固定中繼頁再轉址；針對「${b.scene}」，在物料標示「以最新活動頁為準」並搭配「${focus}」管理連結。`,
    },
    {
      q: `「${b.cat}」的「${b.scene}」需要放 Logo 嗎？`,
      a:
        b.cat === "商務應用"
          ? `商務與門市場景通常建議保留識別與足夠對比；「${b.scene}」若背景雜訊多，請優先確保掃描成功率。`
          : `視覺可做但勿犧牲對比與邊距；對「${b.scene}」而言，掃描失敗比不美觀更傷轉換。`,
    },
  ];
  const useCases = [
    `線下物料（立牌、貼紙、菜單）需對應「${b.scene}」並希望一碼導向固定流程者。`,
    `想優先處理「${focus}」：避免上線後才發現掃描率或連結管理成本過高。`,
    `檔期活動與常態服務並存：需區分短期活動碼與長期門市碼的維護方式。`,
  ];
  const kw = `QR Code,條碼,${b.cat},${b.scene.replace(/\//g, " ")},${focus},rxv-qr-${i}`;
  return { title, description, faq, useCases, kw };
}

function buildAiSummary(i) {
  const kinds = [
    { type: "網路長文與專欄", hint: "段落多、小標碎，需抓論點與證據。" },
    { type: "PDF 論文與報告", hint: "結構固定，需注意引用與圖表說明是否被誤讀。" },
    { type: "企業內部報告", hint: "背景與建議段落常為閱讀重點。" },
    { type: "會議逐字稿與備忘", hint: "口語冗餘多，需整理決議與待辦。" },
    { type: "教材與講義長文", hint: "定義與例題往往可獨立摘要。" },
    { type: "新聞稿與公告", hint: "時間線與引用來源要保留。" },
    { type: "技術文件與規格書", hint: "名詞與版本條件不可省略。" },
    { type: "訪談與紀錄稿", hint: "需區分受訪者觀點與編輯旁白。" },
    { type: "合約與條款初稿", hint: "僅作閱讀輔助，實務仍須人工與專業審閱。" },
    { type: "多語混合素材", hint: "摘要前可先標示語言段落。" },
    { type: "部落格合集匯出", hint: "多篇合併時需避免標題層級混淆。" },
  ];
  const modes = ["速讀重點", "條列式決議", "章節大綱", "關鍵問答萃取"];
  const mode = modes[angleIdx(i)];
  const k = kinds[idx11(i)];
  const title = `AI 摘要｜${k.type}（${mode}）`;
  const modeNote = [
    `以「${mode}」輸出時，建議把「${k.type}」的章節或段落先切開，再逐段摘要，較能保留因果關係。`,
    `若你選擇「${mode}」，可把「${k.type}」的重點映射到待辦或決議，但仍保留出處段落方便回溯。`,
    `「${mode}」適合快速建立閱讀地圖；針對「${k.type}」，仍建議標註不確定句並人工複核。`,
    `完成「${mode}」後，請用「${k.type}」的原句核對數字、名詞與否定句，避免誤讀。`,
  ][angleIdx(i)];
  const description = `針對「${k.type}」：${k.hint} 本頁說明如何以「${mode}」使用 RxV AI 摘要，將長內容收斂成可複製的重點。${modeNote}`;
  const faq = [
    {
      q: `「${k.type}」用「${mode}」摘要會漏掉否定句嗎？`,
      a:
        k.type.includes("合約") || k.type.includes("規格")
          ? `「${k.type}」涉及條件與但書，摘要僅能輔助；「${mode}」輸出後務必回原文核對數值與限制句。`
          : `長文若含轉折與限制條件，建議分段摘要並用「${mode}」交叉比對；「${k.type}」尤應保留引用線索。`,
    },
    {
      q: `「${k.type}」貼上與 PDF 匯入差在哪？`,
      a:
        k.type.includes("PDF")
          ? `「${k.type}」常含頁眉頁尾與欄位雜訊；貼上後先清理無用行，再用「${mode}」摘要較穩。`
          : `純文字通常較乾淨；若「${k.type}」來自網頁，留意廣告與導覽列，並在「${mode}」前先刪噪。`,
    },
    {
      q: `「${k.type}」適合自動摘要嗎？`,
      a:
        k.type.includes("會議")
          ? `「${k.type}」可用「${mode}」整理待辦與決議，但人名、日期、數字仍需人工確認並對照逐字稿。`
          : `「${k.type}」仍可比照「先萃取事實句、再合併」；搭配「${mode}」能降低遺漏，但不能取代人工判斷。`,
    },
  ];
  const useCases = [
    `手邊素材屬於「${k.type}」，希望用「${mode}」快速產出可分享的重點。`,
    `需先抓結構再深讀：先把章節與論點排好，再決定哪些段落值得原文細讀。`,
    `團隊內同步：將摘要當作閱讀地圖，而非唯一依據，重要決策仍保留出處。`,
  ];
  const kw = `AI摘要,重點整理,${k.type.replace(/\s/g, "")},${mode},長文,rxv-ai-${i}`;
  return { title, description, faq, useCases, kw };
}

function buildPomodoro(i) {
  const personas = [
    { role: "學生備考與寫作", detail: "科目輪替與考古題段落，適合短衝刺。" },
    { role: "上班族專案與會議空檔", detail: "會議前後的碎片專注，需防打斷。" },
    { role: "深度工作與創作", detail: "長時段心流，休息間隔可略拉長。" },
    { role: "遠距與家務間切換", detail: "專注區與家務區界線清楚時較易維持節奏。" },
    { role: "自由工作者接案", detail: "計費與交付節點要搭配計時紀律。" },
    { role: "程式與寫作長任務", detail: "避免長時間低頭，休息可做伸展。" },
    { role: "親子與照護者偷時間", detail: "短番茄串聯，目標要切更小。" },
    { role: "通勤與行動學習", detail: "音訊與閱讀交替，番茄長度可縮短。" },
    { role: "團隊協作衝刺", detail: "對齊衝刺長度，方便 stand-up 對照。" },
    { role: "運動與復健計畫並行", detail: "體力與專注並非無限，休息要真的離開螢幕。" },
    { role: "新手建立專注習慣", detail: "從較短番茄開始，逐步延長。" },
  ];
  const rhythms = ["25／5 經典節奏", "52／17 長衝刺", "15／5 微番茄", "自訂分段與檢核點"];
  const r = rhythms[angleIdx(i)];
  const p = personas[idx11(i)];
  const title = `番茄鐘｜${p.role}（${r}）`;
  const pmTail = [
    `接著可用「${r}」把「${p.role}」的一天切成可執行段落，並在 RxV 線上番茄鐘直接開始計時。`,
    `若你屬於「${p.role}」，可把「${r}」當成對外承諾的節拍，降低拖延與過度疲勞。`,
    `完成「${r}」設定後，請把休息也寫進行事曆；對「${p.role}」而言，休息品質常決定下一顆番茄效率。`,
    `此頁也提醒：${p.detail} 搭配「${r}」時，請依體力調整長度，不必硬套公式。`,
  ][angleIdx(i)];
  const description = `此頁從「${p.role}」出發：${p.detail} 說明如何搭配「${r}」安排專注與休息。${pmTail}`;
  const faq = [
    {
      q: `「${p.role}」專注時一直被打斷怎麼辦？`,
      a:
        p.role.includes("上班族")
          ? `可先記下中斷源並關通知；與同事約好可專心的「${r}」時段，中斷後用更短的「${r}」暖身回到狀態。`
          : `把打斷分類：可延後的記到待辦；必須處理的，結束後為「${p.role}」重開一輪「${r}」並縮小下一步目標。`,
    },
    {
      q: `「${r}」的休息段要做什麼？`,
      a:
        r.includes("15")
          ? `「${r}」偏短，建議離開座位、喝水、看遠；對「${p.role}」來說，避免滑手機延長成下一個專注黑洞。`
          : `離開螢幕、伸展或短走動；若「${p.role}」長時間久坐，可把休息固定成「離開桌邊」的儀式，並對齊「${r}」。`,
    },
    {
      q: `「${p.role}」怎麼跟待辦清單搭配「${r}」？`,
      a:
        p.role.includes("學生")
          ? `一個「${r}」只對應一個可完成的小步，符合「${p.role}」的章節粒度；目標過大時先拆題再計時。`
          : `先把行動拆到可在 1～2 個「${r}」內完成，再排進待辦；「${p.role}」的大項目用多個「${r}」串聯並保留緩衝。`,
    },
  ];
  const useCases = [
    `身分情境接近「${p.role}」，想試「${r}」來穩定專注與恢復。`,
    `過去常一次做太久或休息太久：希望有外在節拍器協助切換。`,
    `與 AI 摘要、待辦搭配：先整理任務再開番茄，避免邊做邊找方向。`,
  ];
  const kw = `番茄鐘,專注,計時,${p.role.replace(/\s/g, "")},${r},生產力,rxv-pm-${i}`;
  return { title, description, faq, useCases, kw };
}

const BUILDERS = {
  "image-resize": buildImageResize,
  "image-compress": buildImageCompress,
  "qr-code": buildQrCode,
  "ai-summary": buildAiSummary,
  pomodoro: buildPomodoro,
};

const PREFIX = {
  "image-resize": "ir",
  "image-compress": "ic",
  "qr-code": "qr",
  "ai-summary": "ai",
  pomodoro: "pm",
};

const TOOL_ORDER = ["image-resize", "image-compress", "qr-code", "ai-summary", "pomodoro"];

const entries = [];
for (const tool of TOOL_ORDER) {
  const pre = PREFIX[tool];
  const build = BUILDERS[tool];
  for (let i = 1; i <= 44; i++) {
    const slug = `rxv-seo-${pre}-${String(i).padStart(3, "0")}`;
    const { title, description, faq, useCases, kw } = build(i);
    entries.push({
      slug,
      tool,
      title,
      description,
      keywords: kw,
      faq,
      useCases,
    });
  }
}

fs.mkdirSync(ROOT, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(entries, null, 2), "utf8");
console.log("Wrote", entries.length, "entries to", OUT);
