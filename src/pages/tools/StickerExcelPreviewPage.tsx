import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  STICKER_SALES_FACEBOOK,
  STICKER_SALES_MAILTO,
} from "@/components/StickerExcelOffers";

/**
 * PUBLIC PREVIEW ONLY.
 * The paid 1330 profession/scenario records and purchase ZIP MUST NOT be imported,
 * serialized into this page, or placed in public assets. These six professions,
 * four scenarios and short phrases are independently written sample content.
 */

const previewCareers = [
  {
    id: "coffee", title: "咖啡店老闆", role: "親切的台灣咖啡店老闆，穿著簡潔圍裙",
    service: "手沖咖啡、拿鐵、甜點、外帶咖啡",
    prop: "咖啡杯、咖啡壺、點單本",
    color: "奶茶棕與奶油白",
  },
  {
    id: "florist", title: "花店花藝師", role: "親切專業的台灣花藝師，穿著工作圍裙",
    service: "花束、開幕花禮、節日預訂、配送",
    prop: "花束、緞帶、包裝紙",
    color: "玫瑰粉與森林綠",
  },
  {
    id: "breakfast", title: "早餐店老闆", role: "笑容開朗的台灣早餐店老闆",
    service: "蛋餅、吐司、餐點預訂、外帶",
    prop: "料理夾、托盤、餐袋",
    color: "暖橘與米白",
  },
  {
    id: "realtor", title: "房仲服務專員", role: "親切可靠的台灣房仲服務顧問",
    service: "看屋安排、物件諮詢、進度追蹤",
    prop: "鑰匙、手機、文件夾",
    color: "海軍藍與暖杏色",
  },
  {
    id: "drinks", title: "飲料店店員", role: "活潑俐落的台灣手搖飲服務人員",
    service: "手搖飲、外帶、訂單、取餐",
    prop: "飲料杯、封膜杯、點餐單",
    color: "湖水綠與奶油黃",
  },
  {
    id: "pet", title: "寵物美容師", role: "溫柔細心的台灣寵物美容師",
    service: "寵物洗澡、美容、預約接送",
    prop: "梳子、毛巾、可愛寵物配件",
    color: "霧藍與珊瑚粉",
  },
] as const;

const previewScenarios = [
  {
    id: "greeting", title: "日常問候",
    desc: "先用問候建立好印象，適合每天回覆客戶。",
    phrases: ["早安呀", "歡迎光臨", "今天也加油", "很高興見到您"],
    actions: "微笑揮手、雙手歡迎、比讚、親切點頭",
  },
  {
    id: "order", title: "接單／預約",
    desc: "適合收到需求、確認內容和安排時間。",
    phrases: ["已收到", "幫您確認", "預約成功", "稍等一下"],
    actions: "拿手機回覆、仔細核對、舉起確認手勢、查看筆記本",
  },
  {
    id: "progress", title: "服務進度",
    desc: "把工作流程變成易懂的專業服務回覆。",
    phrases: ["正在處理", "幫您安排", "進度更新", "完成通知"],
    actions: "專注工作、翻看行事曆、拿著文件夾、開心比讚",
  },
  {
    id: "thanks", title: "感謝／回訪",
    desc: "感謝支持、提醒回訪與維持客戶關係。",
    phrases: ["謝謝支持", "辛苦了", "期待再見", "祝您順心"],
    actions: "鞠躬感謝、比心、揮手道別、雙手合十致意",
  },
] as const;

type StickerSheet = "4x4" | "5x4";

export default function StickerExcelPreviewPage() {
  const [careerId, setCareerId] = useState<string>("coffee");
  const [scenarioId, setScenarioId] = useState<string>("order");
  const [sheet, setSheet] = useState<StickerSheet>("4x4");

  const career = previewCareers.find((item) => item.id === careerId) ?? previewCareers[0];
  const scenario = previewScenarios.find((item) => item.id === scenarioId) ?? previewScenarios[0];
  const count = sheet === "4x4" ? 16 : 20;
  const cols = sheet === "4x4" ? 4 : 5;
  const previewPrompt = [
    `請設計一張原創 Q 版 LINE 貼圖母圖（示範節錄）。`,
    `職業／店家：${career.title}`,
    `情境：${scenario.title}`,
    `角色：${career.role}`,
    `商品與服務：${career.service}`,
    `道具：${career.prop}`,
    `角色配色：${career.color}`,
    `畫布：${sheet === "4x4" ? "4 欄 × 4 列，共 16 格，1:1 正方形" : "5 欄 × 4 列，共 20 格，5:4 橫向"}`,
    `短句示範（僅列出前四句）：${scenario.phrases.join("、")}`,
    `動作建議：${scenario.actions}`,
    "每格角色一致、文字清楚，人物與文字不要重疊，各格保留安全白邊。",
    "【其餘短句、進階參數及完整提示詞不在公開試看頁提供】",
  ].join("\n");

  return (
    <>
      <SEO
        title="RXV 進階 Excel 試看｜選職業與情境，看看 LINE 貼圖提示詞"
        description="操作 RXV 多職業 LINE 貼圖 AI 提示詞模板的精簡示範：挑選職業、情境、4×4／5×4，查看部分貼圖短句與提示詞節錄。完整 133 職業 × 10 情境採人工訂購。"
        path="/tools/sticker-excel-preview"
        keywords="LINE 貼圖提示詞 Excel,多職業貼圖,職業貼圖試看,LINE貼圖商用模板"
      />
      <main className="min-h-screen bg-[#faf9ff] px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-6xl space-y-5">
          <Link to="/tools/line-sticker-start#rxv-sticker-excel-download"
            className="inline-flex min-h-11 items-center text-sm font-bold text-violet-800 underline underline-offset-4">
            ← 返回免費下載／進階版訂購
          </Link>

          <header className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-8">
            <p className="text-xs font-black text-violet-700">RXV LINE 貼圖 AI 提示詞模板｜NT$160 商用實戰版</p>
            <h1 className="mt-2 text-2xl font-black leading-snug sm:text-3xl">先選職業、情境，實際看看進階版怎麼用</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">
              正式商品提供 133 種職業 × 每種 10 種情境，共 1,330 組職業情境，
              搭配 Excel 下拉選擇及 AI 生圖提示詞。這裡先提供少量可操作的網頁試看範例。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-800">133 種職業</span>
              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-blue-800">10 種情境／職業</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">4×4／5×4 母圖設定</span>
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-900">NT$160｜人工訂購</span>
            </div>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-950">
              <strong>試看說明：</strong>本頁僅使用 6 種職業、4 種情境及每次 4 句示範文案，操作邏輯用來說明 Excel 使用方式。
              並非直接連動正式付費檔案，也不是免費開放全部 1,330 組資料。實際 Excel 功能與內容以交付檔為準。
            </p>
          </header>

          <section aria-labelledby="demo-title" className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 id="demo-title" className="text-xl font-black">試著操作 Excel 的下拉選擇</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">選擇不同職業及情境，右方試看會立即變化。</p>
              <div className="mt-5 space-y-5">
                <div>
                  <label htmlFor="excel-preview-career" className="mb-2 block text-sm font-bold">1. 選擇職業／店家 <span className="font-normal text-slate-500">（試看 6 種）</span></label>
                  <select id="excel-preview-career" value={careerId} onChange={(event) => setCareerId(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-violet-200 bg-white px-3 text-sm text-slate-900 focus:border-violet-500 focus:outline focus:outline-2 focus:outline-violet-300">
                    {previewCareers.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="excel-preview-scenario" className="mb-2 block text-sm font-bold">2. 選擇情境 <span className="font-normal text-slate-500">（試看 4 種）</span></label>
                  <select id="excel-preview-scenario" value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-violet-200 bg-white px-3 text-sm text-slate-900 focus:border-violet-500 focus:outline focus:outline-2 focus:outline-violet-300">
                    {previewScenarios.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                  </select>
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-bold">3. 選擇母圖版型</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {([{ id: "4x4", title: "4×4｜16 格" }, { id: "5x4", title: "5×4｜20 格" }] as const).map((item) => (
                      <label key={item.id} className={"flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 text-sm font-bold " +
                        (sheet === item.id ? "border-violet-600 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700")}>
                        <input type="radio" name="excel-preview-sheet" checked={sheet === item.id}
                          onChange={() => setSheet(item.id)} className="accent-violet-700" />
                        {item.title}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <p className="font-black text-slate-900">目前選擇</p>
                <p>{career.title}／{scenario.title}／{sheet === "4x4" ? "16 格" : "20 格"}</p>
                <p className="mt-1 text-xs text-slate-500">{scenario.desc}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">試看選擇後的結果</h2>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">內容節錄</span>
              </div>
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-900">貼圖主題</p>
                <p className="mt-1 font-black text-slate-900">{career.title}｜{scenario.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-700">{career.service}</p>
              </div>
              <h3 className="mt-5 text-sm font-black">短句示範（完整商品每組有對應的貼圖短句）</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {scenario.phrases.map((phrase) => (
                  <div key={phrase} className="flex min-h-11 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 p-2 text-center text-sm font-bold text-pink-900">
                    {phrase}
                  </div>
                ))}
              </div>
              <h3 className="mt-5 text-sm font-black">AI 生圖提示詞節錄</h3>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-800" aria-live="polite">{previewPrompt}</pre>
              <p className="mt-2 text-xs leading-6 text-slate-500">以上是教學用精簡範例，沒有提供可直接匯出的付費版完整提示詞或 Excel。</p>
            </div>
          </section>

          <section className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">母圖格數排版示意</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">目前選擇 {sheet === "4x4" ? "4 欄 × 4 列" : "5 欄 × 4 列"}，共 {count} 格。下方只是格數與文字位置示意，不是 AI 生成圖片。</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{cols} 欄 × 4 列</span>
            </div>
            <div className="mx-auto mt-4 max-w-[570px] rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-5">
              <div className={sheet === "4x4" ? "grid grid-cols-4 gap-2" : "grid grid-cols-5 gap-2"}>
                {Array.from({length: count}, (_, index) => (
                  <div key={index} className="flex aspect-square min-w-0 flex-col items-center justify-center rounded-lg border border-violet-100 bg-white p-1 text-center">
                    {index < 4 ? (
                      <>
                        <span className="text-[9px] font-bold leading-tight text-violet-800 sm:text-xs">{scenario.phrases[index]}</span>
                        <span className="mt-2 h-7 w-7 rounded-full border-2 border-amber-200 bg-amber-50 sm:h-10 sm:w-10" aria-hidden="true" />
                      </>
                    ) : <span className="text-[10px] font-bold text-slate-300" aria-label="付費版完整格數示意">···</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-black">覺得這樣選職業與情境很方便？</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              正式版 Excel 有更多職業與情境選項，適合規劃店家專屬 LINE 貼圖。
              售價 NT$160，透過 Messenger 或 Email 人工洽詢、確認匯款後寄送完整商品 ZIP，
              不會在本頁直接公開完整付費資料。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={STICKER_SALES_FACEBOOK} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-black !text-white hover:bg-blue-800">
                Messenger 私訊訂購｜NT$160
              </a>
              <a href={STICKER_SALES_MAILTO}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-400 bg-violet-50 px-5 py-3 text-sm font-black text-violet-900 hover:bg-violet-100">
                Email 詢問訂購
              </a>
              <Link to="/tools/line-sticker-start#rxv-sticker-excel-download"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-100">
                先下載免費 100 組 Excel
              </Link>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-500">本商品採人工確認訂購與匯款；確認收款後提供完整檔案，非即時下載。</p>
          </section>
        </div>
      </main>
    </>
  );
}
