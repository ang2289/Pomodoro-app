import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type DragTarget = { type: 'x' | 'y'; index: number } | null;
type TransparencyStatus = 'idle' | 'transparent' | 'not-transparent' | 'unknown';

const PHOTOROOM_BG_URL = 'https://www.photoroom.com/zh-tw/tools/background-remover';
const MIN_GAP_RATIO = 0.025;
const MAX_COUNT = 10;

const PRESETS = [
  { cols: 2, rows: 2, label: '2×2' },
  { cols: 3, rows: 3, label: '3×3' },
  { cols: 4, rows: 4, label: '4×4' },
  { cols: 5, rows: 4, label: '5×4' },
  { cols: 1, rows: 2, label: '1×2' },
  { cols: 1, rows: 3, label: '1×3' },
];

function createEvenLines(count: number) {
  return Array.from({ length: Math.max(0, count - 1) }, (_, index) => (index + 1) / count);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBoundaries(lines: number[]) {
  return [0, ...lines, 1];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('圖片載入失敗，請改用 PNG、JPG 或 WebP。'));
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('圖片輸出失敗'))), 'image/png');
  });
}

function getDownloadLocationMessage(fileName: string) {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isWindows = /Win/i.test(platform);
  const isMac = /Mac/i.test(platform) && !isIOS;

  if (isAndroid) {
    return `下載完成：${fileName}\n檔案通常會存在手機「下載 / Download」資料夾。\n找不到時，請開啟「檔案」App → 下載，或到 Chrome / Edge 右上角選單 → 下載內容查看。`;
  }

  if (isIOS) {
    return `下載完成：${fileName}\n檔案通常會在「檔案」App → 下載項目，或瀏覽器的下載清單中。`;
  }

  if (isWindows) {
    return `下載完成：${fileName}\n檔案通常會存在「下載」資料夾。也可以按瀏覽器右上角的下載圖示查看。`;
  }

  if (isMac) {
    return `下載完成：${fileName}\n檔案通常會存在「下載項目」資料夾。也可以按瀏覽器右上角的下載圖示查看。`;
  }

  return `下載完成：${fileName}\n請到瀏覽器的下載清單，或裝置的「下載 / Download」資料夾查看。`;
}

async function detectTransparency(img: HTMLImageElement, fileType: string): Promise<TransparencyStatus> {
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'not-transparent';

  const sampleSize = 160;
  const canvas = document.createElement('canvas');
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 'unknown';

  ctx.clearRect(0, 0, sampleSize, sampleSize);
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  try {
    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] < 250) return 'transparent';
    }
    return 'not-transparent';
  } catch {
    return 'unknown';
  }
}

export default function StickerImageSplitter() {
  const [fileName, setFileName] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const [transparencyStatus, setTransparencyStatus] = useState<TransparencyStatus>('idle');
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [colsInput, setColsInput] = useState('4');
  const [rowsInput, setRowsInput] = useState('4');
  const [padding, setPadding] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [verticalLines, setVerticalLines] = useState<number[]>(() => createEvenLines(4));
  const [horizontalLines, setHorizontalLines] = useState<number[]>(() => createEvenLines(4));
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [selectedLine, setSelectedLine] = useState<DragTarget>(null);
  const [nudgeStep, setNudgeStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string>('');

  const total = cols * rows;
  const xBounds = useMemo(() => getBoundaries(verticalLines), [verticalLines]);
  const yBounds = useMemo(() => getBoundaries(horizontalLines), [horizontalLines]);
  // 手機或窄版畫面預設不再強制放大，避免右側圖片被裁掉看不到。
  // 需要放大時，使用者可自行拉動『預覽縮放』滑桿，外層會提供水平捲動。
  const previewZoom = zoom;

  const resetLines = useCallback((nextCols = cols, nextRows = rows) => {
    setVerticalLines(createEvenLines(nextCols));
    setHorizontalLines(createEvenLines(nextRows));
  }, [cols, rows]);

  const applyGrid = useCallback((nextCols: number, nextRows: number) => {
    const safeCols = clamp(Math.round(nextCols) || 1, 1, MAX_COUNT);
    const safeRows = clamp(Math.round(nextRows) || 1, 1, MAX_COUNT);
    setCols(safeCols);
    setRows(safeRows);
    setColsInput(String(safeCols));
    setRowsInput(String(safeRows));
    resetLines(safeCols, safeRows);
  }, [resetLines]);

  const commitGridInput = useCallback((type: 'cols' | 'rows', rawValue: string) => {
    const numericValue = Number(rawValue);
    const safeValue = clamp(Math.round(numericValue) || 1, 1, MAX_COUNT);

    if (type === 'cols') {
      applyGrid(safeValue, rows);
      return;
    }

    applyGrid(cols, safeValue);
  }, [applyGrid, cols, rows]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth < 768);
    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  }, []);

  async function onSelectFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setMessage('請上傳 PNG、JPG 或 WebP 圖片。');
      return;
    }

    setLoading(true);
    setMessage('圖片載入中...');
    setTransparencyStatus('unknown');

    try {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;

      const img = await loadImage(objectUrl);
      const alphaStatus = await detectTransparency(img, file.type);

      setFileName(file.name);
      setPreviewSrc(objectUrl);
      setImageInfo({ width: img.naturalWidth, height: img.naturalHeight });
      setTransparencyStatus(alphaStatus);

      if (alphaStatus === 'not-transparent') {
        setMessage(`已載入圖片：${img.naturalWidth}×${img.naturalHeight}。系統判斷這張圖可能尚未去背，建議先用 PhotoRoom 或其他去背工具處理後再打包。`);
      } else if (alphaStatus === 'transparent') {
        setMessage(`已載入圖片：${img.naturalWidth}×${img.naturalHeight}。偵測到透明背景，可拖曳紅色分割線微調後下載。`);
      } else {
        setMessage(`已載入圖片：${img.naturalWidth}×${img.naturalHeight}。無法完全判斷是否去背，請確認背景是否透明。`);
      }
    } catch (error) {
      setPreviewSrc('');
      setImageInfo(null);
      setFileName('');
      setTransparencyStatus('idle');
      setMessage(error instanceof Error ? error.message : '圖片載入失敗。');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function shareCurrentPage() {
    const shareData = {
      title: 'RxV LINE 貼圖圖片分割工具',
      text: '上傳 LINE 貼圖大圖，拖曳分割線後一鍵下載 ZIP。',
      url: window.location.href,
    };

    try {
      const nav = navigator as Navigator & {
        share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
      };

      if (nav.share) {
        await nav.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setMessage('已複製分享連結，可以貼到 LINE、FB 或訊息中分享。');
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setMessage('已複製分享連結，可以貼到 LINE、FB 或訊息中分享。');
      } catch {
        setMessage('目前瀏覽器不支援自動分享，請手動複製網址。');
      }
    }
  }

  function nudgeSelectedLine(direction: -1 | 1) {
    if (!selectedLine) {
      setMessage('請先點選一條紅色分割線，再用手機微調按鈕移動。');
      return;
    }

    const current = selectedLine.type === 'x'
      ? verticalLines[selectedLine.index]
      : horizontalLines[selectedLine.index];

    const rect = previewRef.current?.getBoundingClientRect();
    const baseSize = selectedLine.type === 'x' ? rect?.width : rect?.height;
    const delta = baseSize ? (nudgeStep / baseSize) * direction : 0.005 * direction;
    updateLine(selectedLine.type, selectedLine.index, current + delta);
  }

  function updateLine(type: 'x' | 'y', index: number, ratio: number) {
    const setter = type === 'x' ? setVerticalLines : setHorizontalLines;
    setter((prev) => {
      const next = [...prev];
      const lower = index === 0 ? MIN_GAP_RATIO : prev[index - 1] + MIN_GAP_RATIO;
      const upper = index === prev.length - 1 ? 1 - MIN_GAP_RATIO : prev[index + 1] - MIN_GAP_RATIO;
      next[index] = clamp(ratio, lower, upper);
      return next;
    });
  }

  useEffect(() => {
    if (!dragTarget) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();
      const rect = previewRef.current?.getBoundingClientRect();
      if (!rect) return;

      const ratio = dragTarget.type === 'x'
        ? (event.clientX - rect.left) / rect.width
        : (event.clientY - rect.top) / rect.height;

      updateLine(dragTarget.type, dragTarget.index, ratio);
    };

    const handleUp = () => {
      setDragTarget(null);
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp, { once: true });
    window.addEventListener('pointercancel', handleUp, { once: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragTarget]);

  async function splitAndDownload() {
    if (!previewSrc || !imageInfo) {
      setMessage('請先上傳貼圖大圖。');
      return;
    }

    setLoading(true);
    setMessage('正在切割圖片...');

    try {
      const img = await loadImage(previewSrc);
      const zip = new JSZip();
      let index = 1;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const rawX = xBounds[col] * img.naturalWidth;
          const rawY = yBounds[row] * img.naturalHeight;
          const rawW = (xBounds[col + 1] - xBounds[col]) * img.naturalWidth;
          const rawH = (yBounds[row + 1] - yBounds[row]) * img.naturalHeight;

          const sx = Math.round(rawX + padding);
          const sy = Math.round(rawY + padding);
          const sw = Math.max(1, Math.round(rawW - padding * 2));
          const sh = Math.max(1, Math.round(rawH - padding * 2));

          const canvas = document.createElement('canvas');
          canvas.width = sw;
          canvas.height = sh;

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.clearRect(0, 0, sw, sh);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

          zip.file(`${String(index).padStart(2, '0')}.png`, await canvasToBlob(canvas));
          index += 1;
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadFileName = `rxv-sticker-split-${cols}x${rows}.zip`;
      saveAs(content, downloadFileName);
      setMessage(`${getDownloadLocationMessage(downloadFileName)}\n共切出 ${total} 張 PNG。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '切割失敗。');
    } finally {
      setLoading(false);
    }
  }

  const transparencyBox = (() => {
    if (!imageInfo || transparencyStatus === 'idle') return null;

    if (transparencyStatus === 'transparent') {
      return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-relaxed text-emerald-800">
          ✅ 已偵測到透明背景，可直接分割並下載 ZIP。
        </div>
      );
    }

    if (transparencyStatus === 'not-transparent') {
      return (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold leading-relaxed text-amber-900">
          ⚠️ 這張圖可能不是去背 PNG。若要做 LINE 貼圖，建議先去背再回來分割，否則切出來可能會有白底。
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-relaxed text-slate-600">
        ℹ️ 無法完全判斷背景是否透明，請開新視窗確認圖片背景。
      </div>
    );
  })();

  return (
    <>
      <SEO
        title="LINE 貼圖圖片分割工具"
        description="上傳 4×4 或 5×4 LINE 貼圖大圖，拖曳分割線後下載 ZIP。"
      />

      <main className="bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-black text-slate-900">LINE 貼圖圖片分割工具</h1>
              <button
                type="button"
                onClick={() => void shareCurrentPage()}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-black !text-white shadow-sm hover:bg-emerald-700 whitespace-nowrap"
              >
                分享本頁
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              上傳 AI 產生的 4×4 或 5×4 貼圖大圖，可直接平均分割，也可拖曳紅色分割線微調，避免切到文字、角色與邊緣。
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link
                to="/tools/sticker-prompt"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-purple-600 px-4 text-sm font-black !text-white shadow-md hover:bg-purple-700 whitespace-nowrap"
              >
                ✨ 產生提示詞
              </Link>
              <a
                href={PHOTOROOM_BG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-fuchsia-600 px-4 text-sm font-black !text-white shadow-md hover:bg-fuchsia-700 whitespace-nowrap"
              >
                🪄 PhotoRoom 去背
              </a>
              <Link
                to="/tools/line-sticker"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-black !text-white shadow-md hover:bg-blue-700 whitespace-nowrap"
              >
                📦 回貼圖打包
              </Link>
            </div>
          </section>

          <LineStickerAuthorCard />

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">功能設定</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">先上傳圖片，再選擇切割格式；窄版畫面預設完整顯示全圖，需要放大時再調整下方預覽縮放。</p>
              </div>
              {imageInfo && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 whitespace-nowrap">
                  已載入：{imageInfo.width}×{imageInfo.height}｜目前 {cols}×{rows}
                </span>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) void onSelectFile(selected);
              }}
            />

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-5 text-base font-black text-blue-700 hover:border-blue-500 hover:bg-blue-100 whitespace-nowrap"
              >
                {loading ? '圖片處理中...' : '上傳貼圖大圖'}
              </button>

              <a
                href={PHOTOROOM_BG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-purple-600 px-5 text-base font-black !text-white shadow-md hover:bg-purple-700 whitespace-nowrap"
              >
                🪄 先去背
              </a>

              <button
                type="button"
                onClick={() => resetLines()}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-100 px-5 text-base font-black text-slate-700 hover:bg-slate-200 whitespace-nowrap"
              >
                重置平均線
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-end">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-black text-slate-500">列數</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={MAX_COUNT}
                    value={colsInput}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setColsInput(value);
                      if (value !== '') commitGridInput('cols', value);
                    }}
                    onBlur={() => commitGridInput('cols', colsInput)}
                    className="h-12 w-full rounded-2xl border border-slate-300 px-3 text-center text-xl font-black text-slate-800 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-black text-slate-500">行數</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={MAX_COUNT}
                    value={rowsInput}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setRowsInput(value);
                      if (value !== '') commitGridInput('rows', value);
                    }}
                    onBlur={() => commitGridInput('rows', rowsInput)}
                    className="h-12 w-full rounded-2xl border border-slate-300 px-3 text-center text-xl font-black text-slate-800 outline-none focus:border-emerald-500"
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-xs font-black text-slate-500">快速預設</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {PRESETS.map((item) => {
                    const active = item.cols === cols && item.rows === rows;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => applyGrid(item.cols, item.rows)}
                        className={`inline-flex h-10 w-full items-center justify-center rounded-xl px-2 text-sm font-black transition whitespace-nowrap ${
                          active
                            ? 'bg-emerald-600 !text-white shadow-sm ring-2 ring-emerald-200'
                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">圖片預覽與拖曳分割線</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  紅色分割線可拖曳微調；手機版可先點選分割線，再用下方微調按鈕移動，避免拖線時變成滑動畫面。
                </p>
              </div>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-600 whitespace-nowrap">拖曳紅線微調</span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-600">
                  <span>預覽縮放</span>
                  <span className="rounded-full bg-white px-3 py-1 text-emerald-700 ring-1 ring-slate-200">{zoom}%</span>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[80, 100, 120].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setZoom(value)}
                      className={`h-9 rounded-xl text-xs font-black ${zoom === value ? 'bg-emerald-600 !text-white' : 'bg-white text-emerald-700 ring-1 ring-slate-200'}`}
                    >
                      {value === 100 ? '完整顯示' : `${value}%`}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="60"
                  max="160"
                  step="2"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-3 w-full accent-emerald-600"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-600">
                  <span>每格內縮</span>
                  <span className="rounded-full bg-white px-3 py-1 text-emerald-700 ring-1 ring-slate-200">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="h-3 w-full accent-emerald-600"
                />
              </label>
            </div>


            <div className="mt-4 -mx-2 rounded-3xl border-2 border-dashed border-blue-300 bg-slate-50 p-2 sm:mx-0 sm:p-4">
              {!previewSrc || !imageInfo ? (
                <div className="flex min-h-[360px] sm:min-h-[520px] items-center justify-center rounded-3xl bg-white text-center text-base font-bold text-slate-400">
                  尚未上傳圖片，請先按上方「上傳貼圖大圖」
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-xs font-black text-emerald-700">
                    <span className="break-all">已選取：{fileName}</span>
                    <span>{imageInfo.width}×{imageInfo.height}</span>
                    <span>預設完整顯示全圖</span>
                    <button
                      type="button"
                      onClick={() => window.open(previewSrc, '_blank', 'noopener,noreferrer')}
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-black !text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                      開新視窗檢查圖片
                    </button>
                  </div>


            {previewSrc && imageInfo && (
              <div className="mb-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 md:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-blue-900">手機微調模式</p>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-blue-700">先點選紅色分割線，再用按鈕移動位置，避免手指拖曳時滑動畫面。</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                    {selectedLine ? `${selectedLine.type === 'x' ? '直線' : '橫線'} ${selectedLine.index + 1}` : '未選線'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setNudgeStep(step)}
                      className={`h-10 rounded-xl text-sm font-black ${nudgeStep === step ? 'bg-blue-600 !text-white' : 'bg-white text-blue-700 ring-1 ring-blue-100'}`}
                    >
                      {step}px
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => nudgeSelectedLine(-1)} className="h-12 rounded-xl bg-white text-sm font-black text-slate-800 ring-1 ring-blue-100">
                    {selectedLine?.type === 'y' ? '上移' : '左移'}
                  </button>
                  <button type="button" onClick={() => nudgeSelectedLine(1)} className="h-12 rounded-xl bg-white text-sm font-black text-slate-800 ring-1 ring-blue-100">
                    {selectedLine?.type === 'y' ? '下移' : '右移'}
                  </button>
                </div>
              </div>
            )}

                  <div className="overflow-x-auto overflow-y-visible rounded-2xl bg-white p-2 sm:rounded-3xl sm:p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div
                      className="mx-auto"
                      style={{
                        width: previewZoom <= 100 ? '100%' : `${previewZoom}%`,
                        minWidth: previewZoom <= 100 ? '0' : `${previewZoom}%`,
                      }}
                    >
                      <div
                        ref={previewRef}
                        className="relative mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        style={{ aspectRatio: `${imageInfo.width} / ${imageInfo.height}`, width: '100%' }}
                      >
                        <img src={previewSrc} alt="貼圖預覽" className="absolute inset-0 h-full w-full object-contain" />

                        {verticalLines.map((ratio, index) => (
                          <button
                            key={`x-${index}`}
                            type="button"
                            aria-label={`拖曳第 ${index + 1} 條直向分割線`}
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.currentTarget.setPointerCapture?.(event.pointerId);
                              setSelectedLine({ type: 'x', index });
                              setDragTarget({ type: 'x', index });
                            }}
                            className={`absolute top-0 z-20 h-full w-10 -translate-x-1/2 cursor-col-resize bg-transparent md:w-9 ${selectedLine?.type === 'x' && selectedLine.index === index ? 'ring-2 ring-blue-400/40' : ''}`}
                            style={{ left: `${ratio * 100}%`, touchAction: 'none' }}
                          >
                            <span className="mx-auto block h-full w-0.5 bg-rose-500 shadow-[0_0_0_1px_rgba(255,255,255,.9)] md:w-1" />
                          </button>
                        ))}

                        {horizontalLines.map((ratio, index) => (
                          <button
                            key={`y-${index}`}
                            type="button"
                            aria-label={`拖曳第 ${index + 1} 條橫向分割線`}
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.currentTarget.setPointerCapture?.(event.pointerId);
                              setSelectedLine({ type: 'y', index });
                              setDragTarget({ type: 'y', index });
                            }}
                            className={`absolute left-0 z-20 h-10 w-full -translate-y-1/2 cursor-row-resize bg-transparent md:h-9 ${selectedLine?.type === 'y' && selectedLine.index === index ? 'ring-2 ring-blue-400/40' : ''}`}
                            style={{ top: `${ratio * 100}%`, touchAction: 'none' }}
                          >
                            <span className="block h-0.5 w-full bg-rose-500 shadow-[0_0_0_1px_rgba(255,255,255,.9)] md:h-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-slate-600">
                <p className="font-black text-slate-900">下載前提醒</p>
                <p className="mt-1">若 AI 圖每格間距不平均，請先在上方預覽框拖曳紅線，避開文字與角色，再下載 ZIP。若切到格線或邊緣，可調整「每格內縮」。</p>
              </div>

              <button
                type="button"
                disabled={!previewSrc || loading}
                onClick={splitAndDownload}
                className={`inline-flex h-16 w-full items-center justify-center rounded-2xl px-5 text-base font-black shadow-md transition whitespace-nowrap ${
                  !previewSrc || loading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 !text-white hover:bg-blue-700'
                }`}
              >
                {loading ? '切割中...' : `下載 ZIP（共 ${total} 張）`}
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {transparencyBox}
              {message && (
                <p className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold leading-relaxed text-blue-800">
                  {message}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
