import React, { useMemo, useRef, useState } from "react";

type ProductType = "甜點蛋糕" | "飲料咖啡" | "熱炒小吃" | "早餐熟食" | "手作商品" | "一般商品";
type ImagePurpose = "社群貼文圖" | "新品上市圖" | "限時優惠圖" | "今日推薦圖" | "商品主圖";
type VisualStyle = "清新明亮" | "溫暖食慾感" | "高級簡約" | "活潑促銷" | "日系自然" | "韓系質感";

type GeneratedResult = {
  imageUrl: string;
  caption: string;
  hashtags: string[];
  creditsUsed?: number;
  mode: "demo" | "api";
};

const productTypes: ProductType[] = ["甜點蛋糕", "飲料咖啡", "熱炒小吃", "早餐熟食", "手作商品", "一般商品"];
const purposes: ImagePurpose[] = ["社群貼文圖", "新品上市圖", "限時優惠圖", "今日推薦圖", "商品主圖"];
const styles: VisualStyle[] = ["清新明亮", "溫暖食慾感", "高級簡約", "活潑促銷", "日系自然", "韓系質感"];

const purposeHints: Record<ImagePurpose, string> = {
  社群貼文圖: "適合 FB、IG、LINE 貼文，重點是第一眼吸引人。",
  新品上市圖: "適合新口味、新菜色、新商品，會強化新品感。",
  限時優惠圖: "適合特價、買一送一、今日限定，價格與優惠會更醒目。",
  今日推薦圖: "適合每日菜單、招牌商品、限量主打。",
  商品主圖: "適合電商、蝦皮、官網，畫面較乾淨、商品主體清楚。",
};

const styleHints: Record<VisualStyle, string> = {
  清新明亮: "乾淨、明亮、自然，適合甜點、飲料、早餐。",
  溫暖食慾感: "暖色光線、食物更有食慾，適合熱炒、小吃、熟食。",
  高級簡約: "留白、質感、品牌感，適合禮盒、甜點、手作商品。",
  活潑促銷: "醒目、有活動感，適合限時優惠與價格促銷。",
  日系自然: "柔和、生活感、自然清爽，適合咖啡、甜點、手作。",
  韓系質感: "柔霧、乾淨、年輕質感，適合甜點、美業、小品牌。",
};

function buildPrompt(data: {
  productType: ProductType;
  purpose: ImagePurpose;
  visualStyle: VisualStyle;
  productName: string;
  shopName: string;
  price: string;
  promoText: string;
}) {
  return `請以使用者上傳的商品照片為基準，保留原商品本身，不要改變商品形狀、顏色、食材、份量與主要特色。請只優化光線、背景、構圖與商業感，將照片整理成適合「${data.purpose}」的商業宣傳圖。商品類型：${data.productType}。視覺風格：${data.visualStyle}。請避免加入不存在的食材或配件，不要讓商品與實品落差太大。圖片底圖請不要直接生成錯誤文字，文字會由系統後製排版。商品名稱：${data.productName || "未填"}。店家名稱：${data.shopName || "未填"}。價格：${data.price || "未填"}。優惠文字：${data.promoText || "未填"}。`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function CommercialImageToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [productName, setProductName] = useState("葡式蛋塔");
  const [shopName, setShopName] = useState("示範甜點店");
  const [price, setPrice] = useState("NT$45");
  const [promoText, setPromoText] = useState("今日推薦");
  const [productType, setProductType] = useState<ProductType>("甜點蛋糕");
  const [purpose, setPurpose] = useState<ImagePurpose>("今日推薦圖");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("高級簡約");
  const [includeLogo, setIncludeLogo] = useState(false);
  const [includeQr, setIncludeQr] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const prompt = useMemo(
    () => buildPrompt({ productType, purpose, visualStyle, productName, shopName, price, promoText }),
    [productType, purpose, visualStyle, productName, shopName, price, promoText],
  );

  const canGenerate = Boolean(previewUrl && productName.trim());

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError("");
    setResult(null);
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("請上傳圖片檔，例如 JPG、PNG、WEBP。");
      return;
    }
    if (selected.size > 8 * 1024 * 1024) {
      setError("圖片請小於 8MB，避免上傳與產圖失敗。");
      return;
    }
    setFile(selected);
    setPreviewUrl(await fileToDataUrl(selected));
  }

  function drawDemoPoster(baseImageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return reject(new Error("無法建立圖片輸出環境"));
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = 1080;
        canvas.width = size;
        canvas.height = size;
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, "#fff8ed");
        gradient.addColorStop(0.46, "#fffdf8");
        gradient.addColorStop(1, "#f2d5a6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.beginPath();
        ctx.ellipse(820, 200, 330, 190, -0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(183,126,48,0.12)";
        ctx.beginPath();
        ctx.arc(80, 930, 260, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        roundRect(ctx, 130, 250, 820, 650, 42);
        ctx.clip();
        drawImageCover(ctx, img, 130, 250, 820, 650);
        ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.30)";
        ctx.fillRect(130, 250, 820, 650);

        ctx.fillStyle = "rgba(255,255,255,0.90)";
        ctx.beginPath();
        roundRect(ctx, 82, 56, 916, 138, 42);
        ctx.fill();
        ctx.fillStyle = "#4b2c1d";
        ctx.font = "700 62px system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText((productName || "商品名稱").slice(0, 12), 540, 130);
        ctx.fillStyle = "#b87925";
        ctx.font = "500 30px system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif";
        ctx.fillText(styleSubtitle(visualStyle, productType), 540, 172);

        if (promoText.trim()) {
          ctx.fillStyle = "#9b5a20";
          ctx.beginPath();
          roundRect(ctx, 84, 214, 260, 68, 34);
          ctx.fill();
          ctx.fillStyle = "#fffaf2";
          ctx.font = "700 34px system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(promoText.slice(0, 8), 214, 258);
        }

        if (price.trim()) {
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.beginPath();
          roundRect(ctx, 714, 790, 270, 108, 32);
          ctx.fill();
          ctx.fillStyle = "#9b3320";
          ctx.font = "800 56px system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(price.slice(0, 12), 849, 860);
        }

        ctx.fillStyle = "rgba(75,44,29,0.88)";
        ctx.font = "500 30px system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText((shopName || "店家名稱").slice(0, 18), 86, 982);

        if (includeLogo) {
          ctx.fillStyle = "rgba(255,255,255,0.88)";
          ctx.beginPath();
          ctx.arc(972, 92, 48, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#9b5a20";
          ctx.font = "800 24px system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("LOGO", 972, 101);
        }

        if (includeQr) {
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath();
          roundRect(ctx, 884, 920, 112, 112, 18);
          ctx.fill();
          ctx.strokeStyle = "#7a4a22";
          ctx.lineWidth = 5;
          for (let y = 938; y < 1014; y += 22) {
            for (let x = 902; x < 978; x += 22) {
              if ((x + y) % 44 === 0) ctx.strokeRect(x, y, 12, 12);
            }
          }
        }
        resolve(canvas.toDataURL("image/png", 0.95));
      };
      img.onerror = () => reject(new Error("圖片載入失敗"));
      img.src = baseImageUrl;
    });
  }

  async function handleGenerate() {
    if (!canGenerate) {
      setError("請先上傳圖片並填寫商品名稱。");
      return;
    }
    setIsGenerating(true);
    setError("");
    setResult(null);
    try {
      const useApi = false;
      if (useApi && file) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("productName", productName);
        formData.append("shopName", shopName);
        formData.append("price", price);
        formData.append("promoText", promoText);
        formData.append("productType", productType);
        formData.append("purpose", purpose);
        formData.append("visualStyle", visualStyle);
        formData.append("includeLogo", String(includeLogo));
        formData.append("includeQr", String(includeQr));
        formData.append("prompt", prompt);
        const response = await fetch("/api/commercial-image/generate", { method: "POST", body: formData });
        if (!response.ok) throw new Error((await response.text()) || "產生失敗");
        const data = await response.json();
        setResult({ imageUrl: data.imageUrl, caption: data.caption, hashtags: data.hashtags || [], creditsUsed: data.creditsUsed, mode: "api" });
        return;
      }
      const demoImage = await drawDemoPoster(previewUrl);
      setResult({ imageUrl: demoImage, caption: buildCaption({ productName, shopName, price, promoText, productType, purpose, visualStyle }), hashtags: buildHashtags(productType, purpose), creditsUsed: 0, mode: "demo" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "產生圖片時發生錯誤");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8ef] text-[#3c2417]">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#ead8c3] sm:p-7">
            <div className="mb-6">
              <p className="mb-2 inline-flex rounded-full bg-[#f7ead8] px-4 py-1 text-sm font-semibold text-[#9b5a20]">小店商業圖工具 MVP</p>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">上傳商品照，快速產出可發文商業圖</h1>
              <p className="mt-3 text-sm leading-6 text-[#765b49] sm:text-base">這一版先做前台頁面與自動排版示範。正式串接後，AI 會先產出商業底圖，再由程式自動加商品名、價格、店名與優惠標籤。</p>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">上傳商品照片</span>
                <div className="rounded-3xl border-2 border-dashed border-[#d9b98e] bg-[#fffaf2] p-4 text-center">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="product-upload" />
                  <label htmlFor="product-upload" className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#9b5a20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90">選擇圖片</label>
                  <p className="mt-3 text-xs text-[#8a7160]">支援 JPG、PNG、WEBP，建議小於 8MB。</p>
                </div>
              </label>

              {previewUrl && <div className="overflow-hidden rounded-3xl border border-[#ead8c3] bg-[#fffaf2]"><img src={previewUrl} alt="商品預覽" className="h-64 w-full object-cover" /></div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="商品名稱" value={productName} onChange={setProductName} placeholder="例：葡式蛋塔" />
                <Field label="店家名稱" value={shopName} onChange={setShopName} placeholder="例：舒菓蜜甜點" />
                <Field label="價格" value={price} onChange={setPrice} placeholder="例：NT$45" />
                <Field label="優惠文字" value={promoText} onChange={setPromoText} placeholder="例：今日推薦" />
              </div>

              <SelectField label="商品類型" value={productType} options={productTypes} onChange={(value) => setProductType(value as ProductType)} />
              <SelectField label="圖片用途" value={purpose} options={purposes} onChange={(value) => setPurpose(value as ImagePurpose)} hint={purposeHints[purpose]} />
              <SelectField label="視覺風格" value={visualStyle} options={styles} onChange={(value) => setVisualStyle(value as VisualStyle)} hint={styleHints[visualStyle]} />

              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="加入 Logo 位置" checked={includeLogo} onChange={setIncludeLogo} />
                <Toggle label="加入 QR Code 位置" checked={includeQr} onChange={setIncludeQr} />
              </div>

              <div className="rounded-3xl bg-[#fff4e5] p-4 text-sm leading-6 text-[#765b49]"><strong className="text-[#4b2c1d]">實品保留規則：</strong>商品本身不應改成不同食材、不同外型或不同份量。AI 主要處理光線、背景、構圖與商業感，文字由程式後製，避免錯字與價格錯誤。</div>
              {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
              <button type="button" onClick={handleGenerate} disabled={!canGenerate || isGenerating} className="w-full rounded-2xl bg-[#b46b2a] px-6 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#9b5a20] disabled:cursor-not-allowed disabled:opacity-50">{isGenerating ? "產生中..." : "產生商業圖示範"}</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#ead8c3] sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><h2 className="text-2xl font-black">輸出結果</h2><p className="mt-1 text-sm text-[#765b49]">正式版會在這裡顯示 AI 商業底圖＋自動排版後的成品。</p></div>
                {result?.mode === "demo" && <span className="rounded-full bg-[#fff0d6] px-3 py-1 text-xs font-bold text-[#9b5a20]">前端示範</span>}
              </div>
              <div className="overflow-hidden rounded-3xl border border-[#ead8c3] bg-[#fffaf2]">
                {result ? <img src={result.imageUrl} alt="商業圖結果" className="aspect-square w-full object-cover" /> : <div className="flex aspect-square w-full items-center justify-center p-8 text-center text-[#8a7160]">上傳圖片並填寫資料後，點擊產生即可看到結果。</div>}
              </div>
              {result && <div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => downloadDataUrl(result.imageUrl, `${productName || "commercial-image"}.png`)} className="rounded-2xl bg-[#4b2c1d] px-4 py-3 text-sm font-black text-white transition hover:opacity-90">下載圖片</button><button type="button" onClick={handleGenerate} disabled={isGenerating} className="rounded-2xl bg-[#efe0ce] px-4 py-3 text-sm font-black text-[#4b2c1d] transition hover:bg-[#e7d2bb] disabled:opacity-50">重新產生示範</button></div>}
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#ead8c3] sm:p-7">
              <h2 className="text-xl font-black">自動產生文案</h2>
              <p className="mt-2 text-sm leading-6 text-[#765b49]">圖片完成後，可同步產生 FB／IG／LINE 發文文案，讓店家不只拿到圖，也能直接複製發文。</p>
              <div className="mt-4 whitespace-pre-line rounded-3xl bg-[#fff8ef] p-4 text-sm leading-7 text-[#4b2c1d]">{result ? result.caption : "產生圖片後，這裡會顯示對應的社群發文文案。"}</div>
              {result?.hashtags?.length ? <div className="mt-4 flex flex-wrap gap-2">{result.hashtags.map((tag) => <span key={tag} className="rounded-full bg-[#f7ead8] px-3 py-1 text-xs font-bold text-[#9b5a20]">{tag}</span>)}</div> : null}
            </div>

            <div className="rounded-[2rem] bg-[#3c2417] p-5 text-white shadow-sm sm:p-7">
              <h2 className="text-xl font-black">之後要接的後端入口</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">等你傳現有專案入口後，可以把目前頁面的 demo 模式改成呼叫 API。</p>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/25 p-4 text-xs leading-6 text-white/90">{`POST /api/commercial-image/generate\n\nFormData:\n- image\n- productName\n- shopName\n- price\n- promoText\n- productType\n- purpose\n- visualStyle\n- includeLogo\n- includeQr\n- prompt\n\nResponse:\n{ imageUrl, caption, hashtags, creditsUsed }`}</pre>
            </div>
          </div>
        </div>
      </section>
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-[#ead8c3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b46b2a] focus:ring-4 focus:ring-[#f2dcc0]" /></label>;
}

function SelectField({ label, value, options, onChange, hint }: { label: string; value: string; options: string[]; onChange: (value: string) => void; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-[#ead8c3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b46b2a] focus:ring-4 focus:ring-[#f2dcc0]">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{hint && <p className="mt-2 text-xs leading-5 text-[#8a7160]">{hint}</p>}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${checked ? "border-[#b46b2a] bg-[#fff0d6] text-[#4b2c1d]" : "border-[#ead8c3] bg-white text-[#765b49]"}`}><span>{label}</span><span className={`ml-3 inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-[#b46b2a]" : "bg-[#d9c7b5]"}`}><span className={`h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-1"}`} /></span></button>;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function styleSubtitle(style: VisualStyle, productType: ProductType) {
  if (productType === "甜點蛋糕") return style === "高級簡約" ? "香氣濃郁・質感甜點" : "今日甜點・新鮮推薦";
  if (productType === "飲料咖啡") return "清爽飲品・人氣推薦";
  if (productType === "熱炒小吃") return "現做美味・熱騰騰上桌";
  if (productType === "早餐熟食") return "日常美味・簡單好吃";
  if (productType === "手作商品") return "手作質感・細節呈現";
  return "商品特色・質感呈現";
}

function buildCaption(data: { productName: string; shopName: string; price: string; promoText: string; productType: ProductType; purpose: ImagePurpose; visualStyle: VisualStyle }) {
  const title = data.promoText ? `${data.promoText}｜${data.productName}` : data.productName;
  const priceLine = data.price ? `價格：${data.price}` : "";
  const shopLine = data.shopName ? `店家：${data.shopName}` : "";
  const body = `今天想推薦這款${data.productName || "商品"}，畫面以「${data.visualStyle}」風格整理，適合用在${data.purpose}。保留實品本身，只加強光線、背景、構圖與質感，讓商品更適合發文呈現。`;
  return [title, body, priceLine, shopLine].filter(Boolean).join("\n");
}

function buildHashtags(productType: ProductType, purpose: ImagePurpose) {
  const base = ["#商品圖", "#商業圖", "#小店行銷"];
  const typeMap: Record<ProductType, string> = { 甜點蛋糕: "#甜點", 飲料咖啡: "#飲料", 熱炒小吃: "#小吃", 早餐熟食: "#早餐", 手作商品: "#手作", 一般商品: "#商品照" };
  const purposeMap: Record<ImagePurpose, string> = { 社群貼文圖: "#社群貼文", 新品上市圖: "#新品上市", 限時優惠圖: "#限時優惠", 今日推薦圖: "#今日推薦", 商品主圖: "#商品主圖" };
  return [...base, typeMap[productType], purposeMap[purpose]];
}
