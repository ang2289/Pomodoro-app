import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Area } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import SEO, { getBaseUrl } from '@/components/SEO';
import { RelatedTools } from '@/components/seo/RelatedTools';
import { RelatedGuides } from '@/components/seo/RelatedGuides';
import { getRelatedGuideItems, getRelatedToolsItems } from '@/data/internalLinks';
import JSZip from 'jszip';
import { getCroppedImageBlob, mimeToExt, type OutputMimeType } from './canvasCrop';
import { downloadBlob, safeDownloadBasename } from './downloadBlob';
import { ImageCropper } from './components/Cropper';

function messageForCropError(err: unknown, t: (key: string) => string): string {
  const code = err instanceof Error ? err.message : '';
  switch (code) {
    case 'IMAGE_LOAD':
      return t('imageCrop.err_image_load');
    case 'IMAGE_DECODE':
      return t('imageCrop.err_image_decode');
    case 'IMAGE_NO_DIMENSIONS':
    case 'CROP_NAN':
    case 'CROP_INVALID_SIZE':
      return t('imageCrop.err_crop_invalid');
    case 'NO_2D_CONTEXT':
    case 'TO_BLOB':
    case 'TO_DATA_URL':
    case 'DRAW_IMAGE':
      return t('imageCrop.err_canvas');
    default:
      return t('imageCrop.err_unknown');
  }
}

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp';

export type AspectPresetId = '1:1' | '4:5' | '16:9' | '9:16' | 'free';

function aspectFromPreset(id: AspectPresetId): number | undefined {
  switch (id) {
    case '1:1':
      return 1;
    case '4:5':
      return 4 / 5;
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case 'free':
      return undefined;
    default:
      return undefined;
  }
}

export default function ImageCropPage() {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-TW';
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const path = '/tools/image-crop';

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [preset, setPreset] = useState<AspectPresetId>('1:1');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outFormat, setOutFormat] = useState<OutputMimeType>('image/png');
  const [jpegQuality, setJpegQuality] = useState(0.92);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipPng, setZipPng] = useState(false);
  const [zipJpg, setZipJpg] = useState(false);
  const [zipWebp, setZipWebp] = useState(false);
  const [error, setError] = useState('');

  /** 僅供 unmount 釋放用；勿在 previewUrl 變更時 revoke 主圖 blob，否則預覽／裁切會讀到失效 URL */
  const imageBlobRef = useRef<string | null>(null);
  const previewBlobRef = useRef<string | null>(null);
  imageBlobRef.current = imageSrc;
  previewBlobRef.current = previewUrl;

  const aspect = aspectFromPreset(preset);

  const relatedTools = getRelatedToolsItems('image-crop');
  const relatedGuides = getRelatedGuideItems('image-crop');

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
  }, [preset, imageSrc]);

  useEffect(() => {
    return () => {
      const img = imageBlobRef.current;
      const prev = previewBlobRef.current;
      if (img?.startsWith('blob:')) URL.revokeObjectURL(img);
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
    };
  }, []);

  useEffect(() => {
    if (!imageSrc || !croppedAreaPixels) {
      setPreviewUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    let cancelled = false;
    setPreviewBusy(true);
    setError('');
    getCroppedImageBlob(imageSrc, croppedAreaPixels, outFormat, jpegQuality)
      .then((blob) => {
        if (cancelled) return;
        setPreviewUrl((prev) => {
          if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(messageForCropError(err, t));
      })
      .finally(() => {
        if (!cancelled) setPreviewBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [imageSrc, croppedAreaPixels, outFormat, jpegQuality, t]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ACCEPT.split(',').some((m) => f.type === m.trim())) {
      setError(t('imageCrop.err_type'));
      return;
    }
    setError('');
    if (imageSrc?.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCroppedAreaPixels(null);
    setFileName(f.name);
    setImageSrc(URL.createObjectURL(f));
  };

  const handleDownload = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError(t('imageCrop.err_no_crop'));
      return;
    }
    const w = croppedAreaPixels.width;
    const h = croppedAreaPixels.height;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setError(t('imageCrop.err_crop_invalid'));
      return;
    }
    setDownloadBusy(true);
    setError('');
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, outFormat, jpegQuality);
      const ext = mimeToExt(outFormat);
      const base = safeDownloadBasename(fileName, 'cropped-image');
      downloadBlob(blob, `${base}-cropped.${ext}`);
    } catch (err: unknown) {
      setError(messageForCropError(err, t));
    } finally {
      setDownloadBusy(false);
    }
  };

  const zipAnySelected = zipPng || zipJpg || zipWebp;

  const handleZipDownload = async () => {
    if (!zipAnySelected) return;
    if (!imageSrc || !croppedAreaPixels) {
      setError(t('imageCrop.err_no_crop'));
      return;
    }
    const w = croppedAreaPixels.width;
    const h = croppedAreaPixels.height;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setError(t('imageCrop.err_crop_invalid'));
      return;
    }
    setZipBusy(true);
    setError('');
    try {
      const zip = new JSZip();
      const tasks: { mime: OutputMimeType; filename: string }[] = [];
      if (zipPng) tasks.push({ mime: 'image/png', filename: 'cropped-image.png' });
      if (zipJpg) tasks.push({ mime: 'image/jpeg', filename: 'cropped-image.jpg' });
      if (zipWebp) tasks.push({ mime: 'image/webp', filename: 'cropped-image.webp' });
      for (const { mime, filename } of tasks) {
        const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, mime, jpegQuality);
        zip.file(filename, blob);
      }
      const zblob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zblob, 'rxv-image-crop-export.zip');
    } catch {
      setError(t('imageCrop.err_zip'));
    } finally {
      setZipBusy(false);
    }
  };

  const formatLabel = (m: OutputMimeType) =>
    m === 'image/png' ? t('imageCrop.fmt_png') : m === 'image/jpeg' ? t('imageCrop.fmt_jpg') : t('imageCrop.fmt_webp');

  const suggestedSingleName = croppedAreaPixels
    ? `${safeDownloadBasename(fileName, 'cropped-image')}-cropped.${mimeToExt(outFormat)}`
    : '';

  const presets: AspectPresetId[] = ['1:1', '4:5', '16:9', '9:16', 'free'];
  const showQuality = outFormat === 'image/jpeg' || outFormat === 'image/webp';

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('imageCrop.seo.title'),
    description: t('imageCrop.seo.description'),
    url: `${baseUrl}${path}`,
    inLanguage: inLang,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <SEO
        title={t('imageCrop.seo.title')}
        description={t('imageCrop.seo.description')}
        path={path}
        jsonLdList={[webPageSchema]}
      />

      <nav className="mb-6 text-sm text-slate-500">
        <a href="/" className="text-blue-600 hover:underline">
          {t('nav_home')}
        </a>
        <span className="mx-2">/</span>
        <a href="/tools" className="text-blue-600 hover:underline">
          {t('nav.breadcrumb.toolsHub')}
        </a>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{t('imageCrop.breadcrumb')}</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('imageCrop.h1')}</h1>
      <p className="mt-3 leading-relaxed text-slate-600">{t('imageCrop.intro')}</p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">{t('imageCrop.upload_label')}</span>
          <input
            type="file"
            accept={ACCEPT}
            className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFile}
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">{t('imageCrop.upload_hint')}</p>

        {imageSrc ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0 space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-800">{t('imageCrop.presets_title')}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPreset(id)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        preset === id
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {id === 'free' ? t('imageCrop.preset_free') : id}
                    </button>
                  ))}
                </div>
              </div>
              <ImageCropper
                imageUrl={imageSrc}
                aspect={aspect}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div>
                <label className="text-sm font-medium text-slate-800">{t('imageCrop.zoom', { v: zoom.toFixed(2) })}</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>

              <div>
                <span className="text-sm font-medium text-slate-800">{t('imageCrop.output_format')}</span>
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="fmt"
                      checked={outFormat === 'image/png'}
                      onChange={() => setOutFormat('image/png')}
                    />
                    {t('imageCrop.fmt_png')}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="fmt"
                      checked={outFormat === 'image/jpeg'}
                      onChange={() => setOutFormat('image/jpeg')}
                    />
                    {t('imageCrop.fmt_jpg')}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="fmt"
                      checked={outFormat === 'image/webp'}
                      onChange={() => setOutFormat('image/webp')}
                    />
                    {t('imageCrop.fmt_webp')}
                  </label>
                </div>
              </div>

              {showQuality ? (
                <div>
                  <label className="text-sm text-slate-700">{t('imageCrop.quality', { v: jpegQuality.toFixed(2) })}</label>
                  <input
                    type="range"
                    min={0.6}
                    max={1}
                    step={0.02}
                    value={jpegQuality}
                    onChange={(e) => setJpegQuality(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col space-y-4 lg:sticky lg:top-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                <h2 className="text-sm font-semibold text-slate-900">{t('imageCrop.preview_title')}</h2>
                {croppedAreaPixels ? (
                  <dl className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between gap-2">
                      <dt>{t('imageCrop.output_size')}</dt>
                      <dd className="font-medium text-slate-800">
                        {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} px
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>{t('imageCrop.current_format')}</dt>
                      <dd className="font-medium text-slate-800">{formatLabel(outFormat)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>{t('imageCrop.suggested_filename')}</dt>
                      <dd className="break-all text-right font-mono text-[11px] text-slate-800">{suggestedSingleName}</dd>
                    </div>
                  </dl>
                ) : null}
                {previewBusy ? (
                  <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                    {t('imageCrop.preview_updating')}
                  </p>
                ) : null}
                {previewUrl ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                    <img src={previewUrl} alt="" className="mx-auto max-h-64 w-full object-contain" />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                disabled={downloadBusy || !croppedAreaPixels}
                onClick={() => void handleDownload()}
                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-semibold !text-white shadow transition hover:bg-blue-700 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadBusy ? t('imageCrop.downloading') : t('imageCrop.download')}
              </button>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">{t('imageCrop.extra_export_title')}</h3>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={zipPng} onChange={(e) => setZipPng(e.target.checked)} />
                    {t('imageCrop.fmt_png')}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={zipJpg} onChange={(e) => setZipJpg(e.target.checked)} />
                    {t('imageCrop.fmt_jpg')}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={zipWebp} onChange={(e) => setZipWebp(e.target.checked)} />
                    {t('imageCrop.fmt_webp')}
                  </label>
                </div>
                <button
                  type="button"
                  disabled={zipBusy || !croppedAreaPixels || !zipAnySelected}
                  onClick={() => void handleZipDownload()}
                  className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {zipBusy ? t('imageCrop.zip_packaging') : t('imageCrop.zip_download')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{t('imageCrop.faq_title')}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-medium text-slate-900">{t('imageCrop.faq.q1')}</p>
            <p>{t('imageCrop.faq.a1')}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">{t('imageCrop.faq.q2')}</p>
            <p>{t('imageCrop.faq.a2')}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">{t('imageCrop.faq.q3')}</p>
            <p>{t('imageCrop.faq.a3')}</p>
          </div>
        </div>
      </section>


      {/* --- 輕量贊助區塊（避免干擾使用者） --- */}
      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
        <div className="text-center">
          <h2 className="text-base font-black text-slate-900 tracking-tight">❤️ 支持免費工具開發</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            如果這個圖片裁切工具有幫助到你，可以小額支持；不用也沒關係，有幫助再支持就好 🙌
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://p.ecpay.com.tw/FD7CD6D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-amber-600 hover:!text-white active:scale-[0.98]"
          >
            ☕ 台灣小額支持
          </a>
          <a
            href="https://ko-fi.com/ang2289"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98]"
          >
            🌍 Ko-fi 海外支持
          </a>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          建議支持：50 元 / 100 元 / 200 元　｜　💡 功能建議：
          <a href="mailto:rxv0227@gmail.com" className="font-bold text-emerald-600 hover:text-emerald-700">rxv0227@gmail.com</a>
        </p>
      </section>
      {/* --- 輕量贊助區塊結束 --- */}

      <RelatedTools items={relatedTools} title={t('related_tools_section_title')} />
      <RelatedGuides items={relatedGuides} />
    </div>
  );
}
