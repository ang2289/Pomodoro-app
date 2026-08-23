import React, { ChangeEvent, useMemo, useState } from 'react';
import { defaultPetPromptForm, petOptions, petPromptModes, petStickerPhrases, PetPromptForm } from '../../data/petPromptOptions';

type PhotoReferenceMode = 'original' | 'realPhoto';

const Field = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
    >
      {options.map((item) => (
        <option key={item} value={item}>{item}</option>
      ))}
    </select>
  </label>
);

function buildPetPrompt(form: PetPromptForm, photoReferenceMode: PhotoReferenceMode) {
  const isUsingRealPhoto = photoReferenceMode === 'realPhoto';
  const subject = isUsingRealPhoto
    ? `請根據我提供的真實寵物照片作為參考，保留寵物的毛色、臉型、耳朵形狀、眼神、花紋、毛髮特徵與主要辨識特徵，並重新繪製成乾淨可愛、有商業質感的寵物圖片。照片中的寵物可參考設定為一隻${form.furColor !== '不指定' ? form.furColor : ''}${form.furStyle !== '不指定' ? form.furStyle : ''}${form.petType}${form.breed !== '不指定' ? `，品種偏向${form.breed}` : ''}`
    : `主角是一隻${form.furColor !== '不指定' ? form.furColor : ''}${form.furStyle !== '不指定' ? form.furStyle : ''}${form.petType}${form.breed !== '不指定' ? `，品種偏向${form.breed}` : ''}`;

  const common = `${subject}，表情是${form.expression}，動作是${form.action}，配件為${form.accessory}，場景是${form.scene}，整體風格為${form.style}，用途是${form.purpose}，畫面比例為${form.ratio}。`;

  const photoNotice = isUsingRealPhoto
    ? `\n請注意：需要保留真實寵物的辨識感，但可以用更可愛、更乾淨、更適合商業貼圖或社群宣傳的方式重新詮釋。不要把寵物畫成完全不同品種，也不要改變主要毛色與臉部特徵。`
    : '';

  if (form.mode === 'sticker') {
    return `請生成一張寵物 LINE 貼圖大圖，${common}${photoNotice}
貼圖主題：${form.stickerTopic}。
請做成乾淨明亮、商業貼圖感、可愛但不要雜亂的風格。每格角色大小一致，保留足夠安全邊距，方便後續切割。背景請保持乾淨，避免複雜花紋。每格加入繁體中文短句，文字風格為${form.textStyle}，文字要清楚、可愛、粗體，不要遮住寵物臉部，不要出現簡體中文、英文、亂碼、重複字或水印。
建議文字：${petStickerPhrases.join('、')}。`;
  }

  if (form.mode === 'business') {
    return `請生成一張寵物商業宣傳圖，${common}${photoNotice}
店家類型：${form.businessType}。
行銷主題：${form.marketingTheme}。
請讓畫面有吸引人的商業質感，適合社群貼文與店家宣傳。主體清楚、構圖乾淨、留出文字區，文字風格為${form.textStyle}。若有文字，請使用繁體中文，避免誇大療效、保證效果、侵權角色、品牌 Logo 或水印。`;
  }

  return `請生成一張寵物寫實美圖，${common}${photoNotice}
請呈現溫馨、自然、乾淨、有質感的寵物攝影風格，毛髮細節清楚，眼神自然有生命感，背景柔和不雜亂，適合毛孩紀念圖、社群分享圖或頭像使用。不要出現文字、浮水印、品牌 Logo、奇怪肢體、變形五官或不自然的腳掌。`;
}

export default function PetPromptPage() {
  const [form, setForm] = useState<PetPromptForm>(defaultPetPromptForm);
  const [photoReferenceMode, setPhotoReferenceMode] = useState<PhotoReferenceMode>('original');
  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildPetPrompt(form, photoReferenceMode), [form, photoReferenceMode]);
  const currentMode = petPromptModes.find((m) => m.value === form.mode);

  const update = <K extends keyof PetPromptForm>(key: K, value: PetPromptForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const updatePhotoReferenceMode = (value: PhotoReferenceMode) => {
    setPhotoReferenceMode(value);
    setCopied(false);
    if (value === 'original') {
      setPreviewUrl('');
    }
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 px-4 py-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-amber-100 md:p-8">
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">毛孩專用 AI 生圖提示詞工具</p>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">寵物貼圖／毛孩美圖／寵物店宣傳圖提示詞</h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            選擇寵物類型、毛色、動作、表情與用途，一鍵產生可複製的 AI 生圖提示詞。適合製作 LINE 貼圖、毛孩紀念圖、社群貼文與寵物店宣傳圖。
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {petPromptModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => update('mode', mode.value)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${form.mode === mode.value ? 'border-amber-400 bg-amber-100' : 'border-slate-200 bg-white'}`}
            >
              <div className="mb-2 text-lg font-black text-slate-900">{mode.label}</div>
              <p className="text-sm leading-6 text-slate-600">{mode.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-900">選擇分類</h2>
              <p className="mt-2 text-sm text-slate-500">目前模式：{currentMode?.label}</p>
            </div>

            <div className="mb-5 rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="mb-3 text-sm font-bold text-slate-800">是否使用真實寵物照片？</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border bg-white p-4 text-sm transition ${photoReferenceMode === 'original' ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-200 hover:border-amber-200'}`}>
                  <input
                    type="radio"
                    name="photoReferenceMode"
                    value="original"
                    checked={photoReferenceMode === 'original'}
                    onChange={() => updatePhotoReferenceMode('original')}
                    className="mr-2 accent-amber-500"
                  />
                  不使用，直接產生原創寵物角色
                </label>
                <label className={`cursor-pointer rounded-2xl border bg-white p-4 text-sm transition ${photoReferenceMode === 'realPhoto' ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-200 hover:border-amber-200'}`}>
                  <input
                    type="radio"
                    name="photoReferenceMode"
                    value="realPhoto"
                    checked={photoReferenceMode === 'realPhoto'}
                    onChange={() => updatePhotoReferenceMode('realPhoto')}
                    className="mr-2 accent-amber-500"
                  />
                  使用，我會上傳真實寵物照片作為參考
                </label>
              </div>

              {photoReferenceMode === 'realPhoto' && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-7 text-slate-600">
                  <p>請上傳清楚的寵物照片，建議正面、光線充足、五官與毛色清楚。</p>
                  <p>生成時會盡量保留毛色、臉型、耳朵、花紋與主要特徵，但 AI 圖像仍可能與原照片有差異。</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-amber-600">
                    上傳寵物照片
                    <input type="file" accept="image/png,image/jpeg" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {previewUrl && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold text-slate-500">照片預覽</p>
                      <img src={previewUrl} alt="寵物照片預覽" className="max-h-56 rounded-2xl border border-slate-200 object-contain" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="寵物類型" value={form.petType} options={petOptions.petTypes} onChange={(v) => update('petType', v)} />
              <Field label="品種" value={form.breed} options={petOptions.breeds} onChange={(v) => update('breed', v)} />
              <Field label="毛色" value={form.furColor} options={petOptions.furColors} onChange={(v) => update('furColor', v)} />
              <Field label="毛髮特徵" value={form.furStyle} options={petOptions.furStyles} onChange={(v) => update('furStyle', v)} />
              <Field label="表情" value={form.expression} options={petOptions.expressions} onChange={(v) => update('expression', v)} />
              <Field label="動作" value={form.action} options={petOptions.actions} onChange={(v) => update('action', v)} />
              <Field label="配件" value={form.accessory} options={petOptions.accessories} onChange={(v) => update('accessory', v)} />
              <Field label="場景" value={form.scene} options={petOptions.scenes} onChange={(v) => update('scene', v)} />
              <Field label="圖片風格" value={form.style} options={petOptions.styles} onChange={(v) => update('style', v)} />
              <Field label="用途" value={form.purpose} options={petOptions.purposes} onChange={(v) => update('purpose', v)} />

              {form.mode === 'sticker' && (
                <Field label="貼圖主題" value={form.stickerTopic} options={petOptions.stickerTopics} onChange={(v) => update('stickerTopic', v)} />
              )}

              {form.mode === 'business' && (
                <>
                  <Field label="店家類型" value={form.businessType} options={petOptions.businessTypes} onChange={(v) => update('businessType', v)} />
                  <Field label="行銷主題" value={form.marketingTheme} options={petOptions.marketingThemes} onChange={(v) => update('marketingTheme', v)} />
                </>
              )}

              <Field label="文字風格" value={form.textStyle} options={petOptions.textStyles} onChange={(v) => update('textStyle', v)} />
              <Field label="尺寸／比例" value={form.ratio} options={petOptions.ratios} onChange={(v) => update('ratio', v)} />
            </div>
          </div>

          <aside className="rounded-[2rem] border border-amber-100 bg-white p-5 text-slate-900 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">產生的提示詞</h2>
                <p className="mt-2 text-sm text-slate-500">可直接複製到 ChatGPT 或其他生圖工具。</p>
              </div>
            </div>

            <textarea
              readOnly
              value={prompt}
              className="min-h-[430px] w-full rounded-3xl border border-slate-200 bg-amber-50/40 p-4 text-sm leading-7 text-slate-800 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            />

            <button
              type="button"
              onClick={copyPrompt}
              className="mt-4 w-full rounded-2xl bg-amber-500 px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-amber-600"
            >
              {copied ? '已複製提示詞' : '一鍵複製提示詞'}
            </button>

            <div className="mt-5 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm leading-7 text-slate-600">
              <p className="font-bold text-slate-900">使用提醒</p>
              <p>寵物貼圖若要用於 LINE，建議生成後再去背、檢查文字是否清楚，並使用貼圖切割工具打包。示範圖與提示詞請避免宣稱療效、使用侵權角色或品牌 Logo。</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
