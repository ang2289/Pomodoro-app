import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import ToolAdSlot from "@/components/ToolAdSlot";

type Status = "likely" | "confirm" | "special";

type County = {
  name: string;
  phone: string;
  note?: string;
  officialUrl?: string;
};

type ItemRule = {
  key: string;
  label: string;
  keywords: string[];
  status: Status;
  summary: string;
  steps: string[];
};

const counties: County[] = [
  { name: "基隆市", phone: "02-2465-1115" },
  { name: "臺北市", phone: "02-2720-8889", officialUrl: "https://www.dep.gov.taipei/News_Content.aspx?n=ACEFA960B5A4ACD7&s=402ACF2A9AD6B8EB" },
  { name: "新北市", phone: "02-2953-2111", officialUrl: "https://recycle.ntpc.gov.tw/Article/Index/category55" },
  { name: "桃園市", phone: "03-338-6021" },
  { name: "新竹市", phone: "03-536-8920" },
  { name: "新竹縣", phone: "03-551-9345" },
  { name: "苗栗縣", phone: "037-558-558" },
  { name: "臺中市", phone: "04-2227-6011" },
  { name: "彰化縣", phone: "04-711-5655" },
  { name: "南投縣", phone: "049-223-7530" },
  { name: "雲林縣", phone: "05-534-0414" },
  { name: "嘉義市", phone: "05-225-1775" },
  { name: "嘉義縣", phone: "05-362-0800" },
  { name: "臺南市", phone: "06-657-2813" },
  { name: "高雄市", phone: "07-735-1500" },
  { name: "屏東縣", phone: "08-739-1911" },
  { name: "宜蘭縣", phone: "03-990-7755" },
  { name: "花蓮縣", phone: "03-823-7575" },
  { name: "臺東縣", phone: "089-221-999" },
  { name: "澎湖縣", phone: "06-922-1778" },
  { name: "金門縣", phone: "082-336-823" },
  { name: "連江縣", phone: "0836-26520" },
];

const itemRules: ItemRule[] = [
  {
    key: "furniture",
    label: "沙發／床墊／床架／桌椅／櫃子",
    keywords: ["沙發", "床墊", "彈簧床", "床架", "床組", "桌子", "桌", "椅子", "椅", "衣櫃", "櫃子", "櫥櫃", "家具", "書櫃"],
    status: "likely",
    summary: "這類通常屬家戶巨大垃圾／大型家具，可先向所在地清潔隊預約，不要直接丟在路邊。",
    steps: ["先電話或線上預約。", "確認排出日期、地點及是否需要拆解。", "依清潔隊指定時間搬到約定地點。"],
  },
  {
    key: "sanitary",
    label: "馬桶／洗手台／面盆",
    keywords: ["馬桶", "洗手台", "面盆", "臉盆", "衛浴"],
    status: "confirm",
    summary: "家戶自行汰換的少量衛浴設備，有些地區會收、有些會要求分類或另外處理，務必先向轄區清潔隊確認。",
    steps: ["說明是一般住家自行汰換，不是裝修工程大量廢棄物。", "詢問陶瓷本體、金屬配件是否要分開。", "確認件數、搬運位置與收運日期。"],
  },
  {
    key: "appliance",
    label: "冰箱／洗衣機／冷氣／電視",
    keywords: ["冰箱", "電冰箱", "洗衣機", "冷氣", "冷氣機", "電視", "電視機", "家電"],
    status: "confirm",
    summary: "大型家電多屬應回收廢棄物，購買新機時可優先詢問販售業者回收，或洽清潔隊資源回收。",
    steps: ["換新機時先問販售業者是否可回收舊機。", "沒有換新機時，洽所在地清潔隊或合法回收商。", "不要交給來路不明的清運車。"],
  },
  {
    key: "bike",
    label: "腳踏車／嬰兒車／大型行李箱",
    keywords: ["腳踏車", "自行車", "嬰兒車", "推車", "行李箱"],
    status: "likely",
    summary: "這類在部分縣市列為巨大垃圾或大型家具類，可先預約清運；不同地區對件數可能有不同規定。",
    steps: ["先電話確認品項是否屬巨大垃圾。", "依約定時間、地點排出。", "仍可使用者也可優先轉贈或二手處理。"],
  },
  {
    key: "glass",
    label: "鏡子／玻璃家具",
    keywords: ["鏡子", "玻璃", "玻璃桌", "玻璃櫃"],
    status: "confirm",
    summary: "玻璃、鏡面有割傷風險，通常不能當成一般大型家具整組直接推出去，需先問清潔隊如何拆分與包裝。",
    steps: ["預約時主動說明含玻璃或鏡面。", "依清潔隊指示拆分、包覆或標示。", "避免裸露尖銳玻璃直接排出。"],
  },
  {
    key: "renovation",
    label: "磚塊／磁磚／石膏板／大量裝潢木料",
    keywords: ["磚塊", "磁磚", "石膏板", "水泥", "土石", "裝潢", "工程廢棄物", "拆除", "大量木料", "系統板", "廢土"],
    status: "special",
    summary: "這類常涉及裝修或營建廢棄物，通常不能把清潔隊當作免費工程清運車，需要依地方規定或合法清除管道處理。",
    steps: ["先區分是否為一般家戶少量自行修繕。", "若為裝修工程或數量大，詢問合法清運／處理方式。", "不要任意棄置或混入一般垃圾。"],
  },
  {
    key: "branches",
    label: "樹枝／大型庭院廢棄物",
    keywords: ["樹枝", "樹幹", "庭院", "落葉", "盆栽", "木頭"],
    status: "confirm",
    summary: "樹枝、庭院廢棄物的收運方式依縣市與數量差異較大，可能要求裁切、綑綁或另約時間。",
    steps: ["說明大約尺寸與數量。", "詢問是否需裁切或綑綁。", "依清潔隊指定方式排出。"],
  },
];

const statusMeta: Record<Status, { label: string; color: string; bg: string }> = {
  likely: { label: "🟢 通常可先預約清潔隊", color: "text-emerald-800", bg: "bg-emerald-50 border-emerald-200" },
  confirm: { label: "🟡 先電話確認再搬", color: "text-amber-900", bg: "bg-amber-50 border-amber-200" },
  special: { label: "🔴 多半需另外處理", color: "text-red-800", bg: "bg-red-50 border-red-200" },
};

function findRule(input: string): ItemRule | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;
  return itemRules.find((rule) => rule.keywords.some((keyword) => value.includes(keyword.toLowerCase()))) ?? null;
}

export default function BulkyWasteToolPage() {
  const [countyName, setCountyName] = useState("臺北市");
  const [item, setItem] = useState("沙發");
  const [searched, setSearched] = useState(false);

  const county = counties.find((row) => row.name === countyName) ?? counties[0];
  const rule = useMemo(() => findRule(item), [item]);
  const meta = rule ? statusMeta[rule.status] : statusMeta.confirm;

  const handleSearch = () => setSearched(true);

  return (
    <>
      <SEO
        title="大型垃圾怎麼丟？沙發、床墊、馬桶清潔隊收不收｜免費查詢工具"
        description="輸入縣市與要丟的物品，快速判斷大型家具、馬桶、洗手台、家電、玻璃與裝潢廢棄物該先找清潔隊、回收商或合法清運管道。"
        keywords="大型垃圾,大型家具清運,沙發怎麼丟,床墊怎麼丟,馬桶怎麼丟,清潔隊,巨大垃圾,垃圾清運"
        path="/tools/bulky-waste"
      />

      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 sm:p-10">
            <p className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
              RxV 免費生活工具
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              這個大型垃圾，清潔隊收不收？
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
              先選縣市，再輸入「沙發、床墊、馬桶、洗衣機、磁磚…」。先查處理方向，再打電話確認，避免明明可預約卻先花錢叫民間清運。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-[0.9fr_1.4fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">1. 你在哪個縣市？</span>
                <select
                  value={countyName}
                  onChange={(e) => { setCountyName(e.target.value); setSearched(false); }}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {counties.map((row) => <option key={row.name} value={row.name}>{row.name}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">2. 你想丟什麼？</span>
                <input
                  value={item}
                  onChange={(e) => { setItem(e.target.value); setSearched(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="例：沙發、馬桶、洗衣機、石膏板"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-2xl bg-emerald-600 px-6 py-3 font-bold !text-white shadow hover:bg-emerald-700"
              >
                🔍 幫我查
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["沙發", "床墊", "馬桶", "洗手台", "洗衣機", "鏡子", "腳踏車", "磁磚"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setItem(value); setSearched(true); }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50"
                >
                  {value}
                </button>
              ))}
            </div>
          </section>

          {searched && (
            <section className={`mt-6 rounded-3xl border p-6 shadow-sm ${meta.bg}`}>
              <p className={`text-lg font-black ${meta.color}`}>{rule ? meta.label : "🟡 沒找到完全相同品項，先問清潔隊最安全"}</p>
              <h2 className="mt-2 text-2xl font-black">{countyName}｜{item}</h2>

              {rule ? (
                <>
                  <p className="mt-4 text-base leading-8 text-slate-800">{rule.summary}</p>
                  <ol className="mt-4 space-y-2 text-slate-800">
                    {rule.steps.map((step, index) => (
                      <li key={step} className="rounded-xl bg-white/80 px-4 py-3">{index + 1}. {step}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="mt-4 leading-8 text-slate-800">
                  各縣市收運品項不同，請直接向所在地清潔隊描述「物品名稱、數量、是否為住家自行汰換、是否含玻璃／金屬、是否為裝修拆除產生」後再處理。
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${county.phone.replace(/[^0-9+]/g, "")}`}
                  className="rounded-2xl bg-slate-900 px-5 py-4 text-center font-black !text-white"
                >
                  ☎️ 環保局／清潔隊詢問：{county.phone}
                </a>
                {county.officialUrl ? (
                  <a
                    href={county.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-black !text-slate-800"
                  >
                    查看該縣市官方大型垃圾資訊
                  </a>
                ) : (
                  <a
                    href="https://data.moenv.gov.tw/dataset/detail/wr_s_04"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-black !text-slate-800"
                  >
                    查全國清潔隊官方聯絡資料
                  </a>
                )}
              </div>
            </section>
          )}

          <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">水費有垃圾處理費，可以直接要求清潔隊收嗎？</h2>
            <p className="mt-3 leading-8 text-blue-950">
              不建議這樣說。部分縣市的一般廢棄物清除處理費確實會依用水量計算並由自來水機構代徵，但「有繳清除處理費」不等於每一種大型物品都必須免費收運。是否屬家戶巨大垃圾、是否免費、是否要拆解，以及裝修廢棄物怎麼處理，仍以所在地清潔隊規定為準。
            </p>
            <Link to="/blog/bulky-waste-water-fee-guide" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-3 font-bold !text-white">
              看完整說明：為什麼很多人不知道這項服務？
            </Link>
          </section>

          <ToolAdSlot />

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["🟢 通常先問清潔隊", "沙發、床墊、床架、桌椅、櫃子等家戶大型家具。"],
              ["🟡 一定先確認", "馬桶、面盆、鏡子、玻璃、大型家電、樹枝等。"],
              ["🔴 不要直接推出去", "大量磚塊、磁磚、石膏板、拆除木料等裝修或工程廢棄物。"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h3 className="font-black">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-2xl font-black">常見問題</h2>
            <div className="mt-5 space-y-5 leading-8 text-slate-700">
              <div><h3 className="font-bold text-slate-950">清潔隊會進家裡幫忙搬嗎？</h3><p>多數情況要由住戶自行搬到約定地點；例如新北市官方明確說明，清潔隊無法進入民宅協助搬運。</p></div>
              <div><h3 className="font-bold text-slate-950">裝修拆下來的東西都可以叫清潔隊嗎？</h3><p>不一定。一般家戶少量自行修繕與裝修工程產生的大量廢棄物不同，後者常需找合法清運管道。</p></div>
              <div><h3 className="font-bold text-slate-950">工具顯示可以收，就代表一定會收嗎？</h3><p>不是。本工具先做「處理方向判斷」，最後仍應以所在地清潔隊當次回覆、數量與現場條件為準。</p></div>
            </div>
          </section>

          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            資料說明：本工具整理一般處理方向與環境部公開資訊，地方收運規則可能調整。最後更新：2026-10-05。
          </p>
        </div>
      </main>
    </>
  );
}
