import { useState } from "react";
import type { FormEvent } from "react";

/** 2026-10 客製 LINE 貼圖五折活動；純前端 mailto，不會假裝已寄信或收款。 */
const SALES_EMAIL = "rxv0227@gmail.com";
const PRICE_PLANS = {
  static: [
    { count: 8, original: 980, sale: 490 },
    { count: 16, original: 1380, sale: 690 },
    { count: 24, original: 1980, sale: 990 },
    { count: 32, original: 2580, sale: 1290 },
    { count: 40, original: 2980, sale: 1490 },
  ],
  animated: [
    { count: 8, original: 1980, sale: 990 },
    { count: 16, original: 2980, sale: 1490 },
    { count: 24, original: 3980, sale: 1990 },
  ],
} as const;

type StickerType = keyof typeof PRICE_PLANS;
type ContactForm = {
  name: string;
  email: string;
  business: string;
  style: string;
  character: string;
  phrases: string;
  description: string;
};

const money = (value: number) => "NT$" + value.toLocaleString("zh-TW");
const emptyForm: ContactForm = {
  name: "", email: "", business: "", style: "原創 Q 版",
  character: "", phrases: "", description: "",
};

export default function StickerCustomPricing({ compact = false }: { compact?: boolean }) {
  const [stickerType, setStickerType] = useState<StickerType>("static");
  const [quantity, setQuantity] = useState<number>(24);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [status, setStatus] = useState("");
  const plans = PRICE_PLANS[stickerType] as ReadonlyArray<{ count: number; original: number; sale: number }>;
  const selected = plans.find((plan) => plan.count === quantity) ?? plans[0];
  const typeName = stickerType === "animated" ? "動態貼圖（基礎動畫）" : "靜態貼圖";
  const subject = "【LINE 貼圖客製詢問】" + typeName + " " + selected.count + " 張｜" + (form.name.trim() || "新客戶");
  const message = [
    "您好，我想詢問 LINE 專屬貼圖客製服務。",
    "",
    "【五折活動方案】" + typeName + "，共 " + selected.count + " 張",
    "原價：" + money(selected.original) + "；活動參考價：" + money(selected.sale),
    "（實際製作內容、複雜動畫或特殊需求將另行確認報價；本信不是付款訂單。）",
    "",
    "【聯絡人】" + form.name.trim(),
    "【回覆 Email】" + form.email.trim(),
    "【店家／職業／用途】" + (form.business.trim() || "未填"),
    "【人物風格】" + form.style,
    "【人物設定或照片來源】" + (form.character.trim() || "未填"),
    "【希望出現的短句】" + (form.phrases.trim() || "請協助建議"),
    "【其他需求／交期】" + (form.description.trim() || "未填"),
    "",
    "我了解真人照片須由本人或合法權利人授權；照片請待後續聯絡再提供。",
    "此詢問由 RxV 免費 LINE 貼圖工具客製區產生。",
  ].join("\n");
  const mailtoUrl = "mailto:" + SALES_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
  const setValue = (key: keyof ContactForm, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setStatus("");
  };
  const selectPlan = (type: StickerType, count: number) => {
    setStickerType(type);
    setQuantity(count);
    setStatus("");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setStatus("請先填寫稱呼與 Email。");
      return;
    }
    setStatus("已嘗試開啟您的 Email 程式；請在郵件畫面按「寄送」才會送出。如未開啟，請改用下方複製按鈕。");
    window.location.href = mailtoUrl;
  };
  const copyInquiry = async () => {
    const prepared = "收件人：" + SALES_EMAIL + "\n主旨：" + subject + "\n\n" + message;
    try {
      await navigator.clipboard.writeText(prepared);
      setStatus("已複製詢價內容。請貼到 Gmail、Outlook 或其他信箱，寄給 " + SALES_EMAIL + "。");
    } catch {
      setStatus("此瀏覽器不允許直接複製。請展開下方「手動複製詢價內容」。");
    }
  };

  return (
    <section id="sticker-custom-service" className={"scroll-mt-24 overflow-hidden rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-[#fff1f5] via-white to-[#f2edff] shadow-sm " + (compact ? "p-4 sm:p-6" : "p-5 sm:p-8")} aria-label="不想自己做？LINE 貼圖客製五折方案與 Email 詢價">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-black text-white">客製接案・活動五折</span>
        <span className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-800">免費工具持續免費</span>
      </div>
      <h2 className="mt-3 text-xl font-black leading-snug text-slate-900 sm:text-3xl">不想自己製作？交給我們做專屬 LINE 貼圖</h2>
      <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">沒有時間生圖、修圖、切割和打包？可委託製作真人照片風格或原創 Q 版人物，指定短句、表情與職業情境，適合房仲、業務、美髮、美甲、餐飲店及個人專屬貼圖。</p>
      <p className="mt-2 text-xs leading-6 text-slate-600">基本服務包含統一角色風格、對應張數貼圖素材、主圖／標籤圖與上架 ZIP；含一次文字或小範圍修正。客戶仍須自行確認素材權利與 LINE 官方審核結果。</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2" aria-label="五折客製報價表">
        {(["static", "animated"] as const).map((type) => (
          <div key={type} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
            <h3 className="text-base font-black text-slate-900">{type === "static" ? "靜態貼圖" : "動態貼圖・基礎動畫"}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRICE_PLANS[type].map((plan) => {
                const isActive = stickerType === type && selected.count === plan.count;
                return (
                  <button key={plan.count} type="button" onClick={() => selectPlan(type, plan.count)}
                    aria-pressed={isActive} aria-label={type === "static" ? "靜態貼圖 " + plan.count + " 張五折方案" : "動態貼圖 " + plan.count + " 張五折方案"}
                    className={"min-h-[90px] rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 " + (isActive ? "border-rose-500 bg-rose-50" : "border-slate-100 bg-slate-50 hover:border-rose-300")}>
                    <span className="block text-xs font-bold text-slate-800">{plan.count} 張</span>
                    <span className="mt-1 block text-[11px] text-slate-400 line-through">{money(plan.original)}</span>
                    <strong className="mt-0.5 block text-lg font-black text-rose-700">{money(plan.sale)}</strong>
                  </button>
                );
              })}
            </div>
            {type === "animated" && <p className="mt-2 text-xs leading-5 text-slate-600">限基本位移／縮放／淡入等 AI 輔助動畫；複雜逐格動作、精細口型或特殊效果需另行估價。動態僅有 8／16／24 張方案。</p>}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 rounded-2xl border border-violet-100 bg-white p-4 sm:p-6" aria-label="LINE 貼圖客製需求 Email 表單">
        <h3 className="text-lg font-black text-violet-900">填寫需求 → 開啟 Email 詢問客製</h3>
        <p className="mt-1 text-xs leading-6 text-slate-600">目前選擇：<strong className="text-rose-700">{typeName} {selected.count} 張，五折 {money(selected.sale)}</strong>。填好後會幫你整理郵件內容，不需註冊或先付款。</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-800">稱呼／聯絡人 <span className="text-rose-600">*</span>
            <input name="name" type="text" required maxLength={80} autoComplete="name" value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="例如：王小姐" className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900" />
          </label>
          <label className="text-sm font-bold text-slate-800">您的 Email <span className="text-rose-600">*</span>
            <input name="email" type="email" required maxLength={150} autoComplete="email" value={form.email} onChange={(e) => setValue("email", e.target.value)} placeholder="name@example.com" className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900" />
          </label>
          <label className="text-sm font-bold text-slate-800">職業／店家／使用用途
            <input name="business" type="text" maxLength={120} value={form.business} onChange={(e) => setValue("business", e.target.value)} placeholder="例如：房仲個人品牌、飲料店" className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900" />
          </label>
          <label className="text-sm font-bold text-slate-800">想要的人物風格
            <select name="style" value={form.style} onChange={(e) => setValue("style", e.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900">
              <option>原創 Q 版</option>
              <option>真人照片風格（需合法授權）</option>
              <option>真人轉 Q 版（需合法授權）</option>
              <option>寵物 Q 版</option>
              <option>店家／品牌吉祥物</option>
              <option>尚未決定，想請您建議</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm font-bold text-slate-800">人物設定／照片來源說明
          <input name="character" type="text" maxLength={250} value={form.character} onChange={(e) => setValue("character", e.target.value)} placeholder="例如：40 歲台灣女性、短髮；照片由本人提供" className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900" />
        </label>
        <label className="mt-3 block text-sm font-bold text-slate-800">指定貼圖短句（可先填幾句）
          <textarea name="phrases" rows={2} maxLength={900} value={form.phrases} onChange={(e) => setValue("phrases", e.target.value)} placeholder="例如：收到、謝謝您、我幫您確認、稍等一下…" className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900" />
        </label>
        <label className="mt-3 block text-sm font-bold text-slate-800">其他需求／預計使用時間
          <textarea name="description" rows={2} maxLength={900} value={form.description} onChange={(e) => setValue("description", e.target.value)} placeholder="例如：主要用來回覆客戶，想在下個月前完成" className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-700">開啟 Email 寄送詢價 →</button>
          <button type="button" onClick={copyInquiry} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-black text-violet-900 hover:bg-violet-100">一鍵複製詢價內容</button>
        </div>
        {status && <p role="status" className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold leading-6 text-sky-900">{status}</p>}
        <details className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          <summary className="cursor-pointer font-bold">沒有自動開啟 Email？手動複製詢價內容</summary>
          <p className="mt-2">收件信箱：<a href={"mailto:" + SALES_EMAIL} className="font-bold text-violet-800 underline">{SALES_EMAIL}</a></p>
          <textarea readOnly value={"主旨：" + subject + "\n\n" + message} className="mt-2 h-40 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs" aria-label="可以手動複製的詢價郵件內容" />
        </details>
        <p className="mt-3 text-xs leading-6 text-slate-600">重要：本表單只在你的裝置整理文字，不會直接上傳資料；點「開啟 Email」後，仍須在郵件程式按下「寄送」才會送出。請勿在表單內填寫身分證號、信用卡或其他敏感資料。真人照片須有合法授權，請待雙方確認需求後再提供。</p>
        <p className="mt-2 text-xs leading-6 text-slate-600">上述為指定張數與基本內容的活動參考價；特殊人物細節、商標使用權、複雜動畫或額外修正需先確認需求，報價不代表保證 LINE 官方審核通過。</p>
      </form>
    </section>
  );
}
