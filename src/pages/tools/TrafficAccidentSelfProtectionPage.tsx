import React, { useMemo, useState } from "react";
import SEO from "@/components/SEO";

type AccidentType =
  | "路口車禍"
  | "機車與汽車擦撞"
  | "追撞事故"
  | "停車場擦撞"
  | "行人／自行車事故"
  | "對方肇事離開現場";

const accidentTypes: AccidentType[] = [
  "路口車禍",
  "機車與汽車擦撞",
  "追撞事故",
  "停車場擦撞",
  "行人／自行車事故",
  "對方肇事離開現場",
];

const accidentGuide: Record<AccidentType, { label: string; summary: string; reminders: string[] }> = {
  "路口車禍": {
    label: "目前選擇：路口車禍",
    summary: "重點是先保留路口號誌、標線、車道位置與雙方行進方向，避免只拍近照而看不出事故位置。",
    reminders: ["拍到紅綠燈、停止線、斑馬線與路口全景。", "記錄自己與對方是直行、左轉、右轉或變換車道。", "若附近店家有監視器，先記下店名與位置。"],
  },
  "機車與汽車擦撞": {
    label: "目前選擇：機車與汽車擦撞",
    summary: "重點是保留機車倒地位置、汽車碰撞點、車道寬度與受傷狀況。",
    reminders: ["拍機車倒地位置、刮痕方向與汽車擦撞點。", "身體不適即使外觀看不明顯，也要就醫並保存診斷證明。", "不要只拍車損，地面痕跡與車道位置也很重要。"],
  },
  "追撞事故": {
    label: "目前選擇：追撞事故",
    summary: "重點是記錄前後車位置、煞車痕、車流狀況與是否有連環追撞。",
    reminders: ["拍前車、後車與整體排列位置。", "保存行車紀錄器，尤其是煞車前後數十秒。", "若是連環車禍，要記錄每台車的車牌與撞擊順序。"],
  },
  "停車場擦撞": {
    label: "目前選擇：停車場擦撞",
    summary: "重點是保留停車格位置、出入口動線、監視器與雙方車損角度。",
    reminders: ["拍停車格線、車輛停放位置與出入口方向。", "詢問管理室是否有監視器，先記下可調閱位置。", "避免只口頭私了，至少保留車牌、照片與聯絡方式。"],
  },
  "行人／自行車事故": {
    label: "目前選擇：行人／自行車事故",
    summary: "重點是先處理受傷與就醫，並保留行人穿越位置、斑馬線、號誌與自行車路線。",
    reminders: ["有人受傷先叫救護，不要因為傷勢看似輕微就忽略。", "拍斑馬線、號誌、路肩、自行車道與受傷位置。", "保留醫療單據、診斷證明與後續回診紀錄。"],
  },
  "對方肇事離開現場": {
    label: "目前選擇：對方肇事離開現場",
    summary: "重點是立刻報警，記錄車牌、車型、顏色、逃離方向與可調監視器位置。",
    reminders: ["先寫下或錄音記錄車牌、車型、顏色與離開方向。", "拍現場與自己的車損、傷勢，不要自行追車造成危險。", "記下附近店家、路口監視器與目擊者資訊。"],
  },
};

const sceneOptions = [
  "有人受傷或身體不適",
  "車輛還能移動",
  "對方想私下和解",
  "有行車紀錄器",
  "附近可能有監視器",
  "已報警處理",
  "尚未做筆錄",
  "準備申請保險理賠",
];

const photoChecklist = [
  "雙方車牌與車輛全貌",
  "雙方車損近照與撞擊點",
  "事故現場遠景，包含路口、車道、號誌、標線",
  "煞車痕、掉落物、碎片、機車倒地位置",
  "自己的受傷部位與就醫紀錄",
  "對方駕照、行照、強制險或保險資料",
  "行車紀錄器影片備份",
  "附近店家監視器位置與店名",
  "目擊者姓名與聯絡方式",
  "警方到場單位、員警姓名、事故登記聯單",
];

const statementTips = [
  "只說自己親眼看到、親身經歷、確定知道的事。",
  "不確定的車速、距離、秒數，不要用猜的。",
  "不要為了安撫對方直接說「都是我的錯」或「我全責」。",
  "不要替對方下結論，例如「他故意撞我」。",
  "可以說明自己有受傷、不舒服、車損與已保存的證據。",
  "簽名前要確認筆錄內容是否符合你的陳述。",
  "若內容與你說的不一致，應請求更正後再簽名。",
];

const followUpTasks = [
  { time: "事故當天", task: "報警、就醫、拍照、保存行車紀錄器、通知保險公司。" },
  { time: "1～3 天內", task: "整理照片、醫療收據、診斷證明、修車估價單與對話紀錄。" },
  { time: "7 天後", task: "可準備申請現場圖、現場照片等事故資料。" },
  { time: "30 天後", task: "可準備申請道路交通事故初步分析研判表。" },
  { time: "調解前", task: "整理醫療費、修車費、交通費、工作損失與相關證明。" },
  { time: "和解前", task: "確認和解金額、付款方式、範圍、是否包含後續請求。" },
];

type CheckItemProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

function CheckItem({ label, checked, onChange }: CheckItemProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:shadow-sm ${
        checked ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
          checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"
        }`}
      >
        ✓
      </span>
      <span className="text-base leading-relaxed text-slate-800">{label}</span>
    </button>
  );
}

export default function TrafficAccidentSelfProtectionPage() {
  const [type, setType] = useState<AccidentType>("路口車禍");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["尚未做筆錄"]);
  const [checkedPhotos, setCheckedPhotos] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    date: "",
    location: "",
    myVehicle: "機車",
    otherVehicle: "汽車",
    direction: "",
    impact: "",
    injury: "",
    evidence: "",
  });

  const toggleValue = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const progress = Math.round((checkedPhotos.length / photoChecklist.length) * 100);
  const currentGuide = accidentGuide[type];

  const generatedNote = useMemo(() => {
    return `事故經過整理稿\n\n本人於${form.date || "＿＿年＿＿月＿＿日＿＿時＿＿分"}左右，行經${
      form.location || "＿＿＿＿＿＿"
    }，當時駕駛／騎乘${form.myVehicle || "＿＿＿＿"}，事故類型初步為「${type}」。\n\n對方車輛／對象為${
      form.otherVehicle || "＿＿＿＿"
    }。本人目前可確認的行進方向與位置為：${form.direction || "＿＿＿＿＿＿"}。雙方碰撞或接觸位置約為：${
      form.impact || "＿＿＿＿＿＿"
    }。\n\n受傷或身體狀況：${form.injury || "目前尚待確認或就醫檢查。"}\n\n已保存或準備保存的證據：${
      form.evidence || "現場照片、車損照片、行車紀錄器、監視器位置、醫療單據等。"
    }\n\n事故情境提醒：${currentGuide.summary}\n\n目前狀態勾選：${selectedOptions.length ? selectedOptions.join("、") : "尚未勾選"}\n\n重要提醒：以上內容僅為目前記得且可確認的事實整理。不確定的車速、距離、秒數、對方意圖或肇事責任，不任意推測。正式筆錄仍應以本人親身見聞與確認內容為準；簽名前應確認筆錄內容是否正確。`;
  }, [currentGuide.summary, form, selectedOptions, type]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedNote);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <SEO
        title="車禍發生怎麼辦？現場處理、拍照清單、筆錄前整理一次完成"
        description="免費車禍現場與筆錄前自保清單，協助整理路口事故 SOP、拍照蒐證、筆錄前事實整理、調解與保險後續待辦。"
        keywords="車禍發生怎麼辦,車禍筆錄,車禍拍照清單,交通事故處理,車禍調解,保險理賠資料"
        path="/tools/traffic-accident"
      />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div>
                <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                  車禍現場 × 筆錄前 × 調解資料整理
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  車禍發生怎麼辦？
                  <span className="block text-amber-600">先用清單穩住現場與權益</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-slate-700">
                  發生路口車禍、機車擦撞或追撞時，先照著清單完成現場安全、拍照蒐證、筆錄前整理與後續待辦，避免慌亂時漏掉重要資料。
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <a href="#sop" className="rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-bold !text-white shadow hover:bg-amber-600">
                    先看現場 SOP
                  </a>
                  <a href="#photos" className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold !text-white shadow hover:bg-emerald-700">
                    拍照清單
                  </a>
                  <a href="#statement" className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold !text-white shadow hover:bg-blue-700">
                    筆錄前整理
                  </a>
                </div>
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-7 text-red-800">
                  本工具僅供一般事故紀錄與資料整理參考，不提供法律意見、不判斷肇責、不保證理賠或訴訟結果。若涉及重大傷亡、刑事責任、金額重大或爭議複雜，請諮詢合格律師或相關專業人士。
                </div>
              </div>

              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 text-slate-900 shadow-lg">
                <h2 className="text-xl font-bold text-slate-950">先選事故情境</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">按下不同事故情境後，下方會立即切換「目前選擇」與對應提醒，事故整理稿也會同步帶入該情境。</p>
                <div className="mt-4 grid gap-3">
                  {accidentTypes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setType(item)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                        type === item
                          ? "border-amber-500 bg-amber-500 !text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-800 hover:border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-amber-200 bg-white p-4">
                  <p className="text-sm font-bold text-amber-700">{currentGuide.label}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{currentGuide.summary}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {currentGuide.reminders.map((item) => (
                      <li key={item} className="rounded-xl bg-amber-50 px-3 py-2">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <section id="sop" className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
              <h2 className="text-2xl font-bold">第一步：現場狀況快速勾選</h2>
              <p className="mt-2 text-slate-600">依照目前情況勾選，等一下會帶入事故整理稿。</p>
              <div className="mt-5 grid gap-3">
                {sceneOptions.map((item) => (
                  <CheckItem
                    key={item}
                    label={item}
                    checked={selectedOptions.includes(item)}
                    onChange={() => toggleValue(item, setSelectedOptions)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
              <h2 className="text-2xl font-bold">第二步：路口車禍現場 SOP</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
                <p>1. 先確認人身安全，有人受傷或不適，優先撥打 119。</p>
                <p>2. 打開警示燈、放置警示標誌，避免二次事故。</p>
                <p>3. 撥打 110 報警，等待警方到場處理。</p>
                <p>4. 不急著承認肇責，也不要私下快速離開現場。</p>
                <p>5. 拍照、錄影、保存行車紀錄器與現場資訊。</p>
                <p>6. 拿到事故登記聯單，後續保存醫療與修車證明。</p>
              </div>
            </div>
          </section>

          <section id="photos" className="mt-8 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">第三步：拍照蒐證清單</h2>
                <p className="mt-2 text-slate-600">現場越慌，越需要照清單拍。完成度：{progress}%</p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 sm:w-64">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {photoChecklist.map((item) => (
                <CheckItem key={item} label={item} checked={checkedPhotos.includes(item)} onChange={() => toggleValue(item, setCheckedPhotos)} />
              ))}
            </div>
          </section>

          <section id="statement" className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
              <h2 className="text-2xl font-bold">第四步：筆錄前事實整理表</h2>
              <div className="mt-5 grid gap-4">
                {[
                  ["date", "事故時間", "例：2026/05/22 下午 3:20"],
                  ["location", "事故地點", "例：台中市○○路與○○街路口"],
                  ["myVehicle", "我方交通工具", "例：機車、汽車、行人"],
                  ["otherVehicle", "對方交通工具", "例：汽車、機車、腳踏車"],
                  ["direction", "行進方向與位置", "例：我沿○○路直行，對方由右側巷口出來"],
                  ["impact", "碰撞位置", "例：我方左前側與對方右前側碰撞"],
                  ["injury", "受傷或不適狀況", "例：左膝擦傷、腰部疼痛，已就醫"],
                  ["evidence", "已保存證據", "例：照片、行車紀錄器、診斷證明、估價單"],
                ].map(([key, label, placeholder]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-slate-900 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-950">自動整理稿</h2>
                <button type="button" onClick={handleCopy} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold !text-white shadow hover:bg-blue-700">
                  {copied ? "已複製" : "一鍵複製"}
                </button>
              </div>
              <pre className="mt-5 max-h-[620px] whitespace-pre-wrap rounded-2xl border border-blue-100 bg-white p-5 text-sm leading-7 text-slate-800">
                {generatedNote}
              </pre>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
              <h2 className="text-2xl font-bold">筆錄前提醒卡</h2>
              <ul className="mt-5 space-y-3">
                {statementTips.map((tip) => (
                  <li key={tip} className="rounded-2xl bg-amber-50 p-4 leading-7 text-amber-950">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-100">
              <h2 className="text-2xl font-bold">後續待辦時間表</h2>
              <div className="mt-5 space-y-3">
                {followUpTasks.map((item) => (
                  <div key={item.time} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-bold text-slate-950">{item.time}</p>
                    <p className="mt-1 leading-7 text-slate-700">{item.task}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">使用前提醒</h2>
            <p className="mt-3">
              本頁內容為一般交通事故資料整理與自我檢查用途，不構成法律意見、保險理賠承諾、肇責判斷或訴訟策略建議。若有重大傷亡、刑事責任、酒駕、肇逃、無照、職業駕駛、營業損失、長期後遺症或金額重大爭議，建議尋求合格律師、保險公司或相關主管機關協助。
            </p>
          </section>
        </section>
      </main>
    </>
  );
}
