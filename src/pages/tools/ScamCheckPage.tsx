import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { RelatedTools } from '@/components/seo/RelatedTools';
import { RelatedGuides } from '@/components/seo/RelatedGuides';
import { getRelatedGuideItems, getRelatedToolsItems } from '@/data/internalLinks';
import { analyzeScam, type ScamResult } from '@/lib/scamRisk';

const LEVEL_KEYS: Record<ScamResult['level'], string> = {
  LOW: 'scam_level_low',
  MEDIUM: 'scam_level_medium',
  HIGH: 'scam_level_high',
};

const LEVEL_COLORS: Record<ScamResult['level'], string> = {
  LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  HIGH: 'bg-red-100 text-red-800 border-red-200',
};

const SAMPLE_KEYS = ['scam_sample_invest', 'scam_sample_unlock', 'scam_sample_parcel'] as const;

const SAMPLE_TEXTS = [
  '您好！我們是專業投資團隊，提供穩賺不賠的投資方案，月報酬可達 15% 以上。限時名額，請加 LINE 詳談：https://line.me/xxx',
  '【銀行通知】您的信用卡將於今日扣款 12000 元，若非本人操作請立即撥打 02-xxxx-xxxx 或點選連結 https://bit.ly/xxx 解除分期設定。',
  '【宅配通】您有海外包裹尚未領取，請於 24 小時內點擊 http://reurl.cc/xxx 確認收件資訊，否則將退運並收取滯留費。',
] as const;

export default function ScamCheckPage() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [result, setResult] = useState<ScamResult | null>(null);

  const handleAnalyze = useCallback(() => {
    setResult(analyzeScam(text));
  }, [text]);

  const handleClear = useCallback(() => {
    setText('');
    setResult(null);
  }, []);

  const handleCopy = useCallback(() => {
    if (!result) return;
    const levelLabel = t(LEVEL_KEYS[result.level]);
    const summary = [
      t('scam_copy_result_title', { level: levelLabel, score: result.score }),
      '',
      t('scam_copy_reasons'),
      ...result.reasons.map((r) => `・${r}`),
      '',
      t('scam_copy_tips'),
      ...result.tips.map((tip) => `・${tip}`),
    ].join('\n');
    navigator.clipboard.writeText(summary);
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = t('scam_copied');
      setTimeout(() => { btn.textContent = orig; }, 1500);
    }
  }, [result, t]);

  return (
    <>
      <SEO
        title="詐騙訊息檢測工具｜免費詐騙訊息檢測工具 - RxV AI工具中心"
        description="免費詐騙訊息檢測工具，支援線上使用，快速完成任務，無需下載。"
        keywords="詐騙訊息檢測工具, AI工具, 免費工具"
        path="/tools/scam-check"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 pb-24">
        <div className="mx-auto max-w-xl">
          <div className="mb-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              {t('scam_back_home')}
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">詐騙訊息檢測工具（免費）｜AI工具推薦</h1>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            這是一款免費詐騙訊息檢測工具，可用於快速評估可疑文字風險並取得防詐建議，支援線上使用，不需下載，快速完成任務。
          </p>

          {/* 輸入區 */}
          <section className="mb-6">
            <label htmlFor="scam-input" className="block text-sm font-medium text-slate-700 mb-2">
              {t('scam_label_paste')}
            </label>
            <textarea
              id="scam-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('scam_placeholder')}
              rows={6}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-y min-h-[120px]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-slate-500 self-center">{t('scam_sample_label')}</span>
              {SAMPLE_KEYS.map((key, i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setText(SAMPLE_TEXTS[i])}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {t(key)}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAnalyze}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {t('scam_btn_analyze')}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {t('scam_btn_clear')}
              </button>
            </div>
          </section>

          {/* 結果區 */}
          {result && (
            <section className="mb-8">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-base font-semibold border ${LEVEL_COLORS[result.level]}`}
                    >
                      {t(LEVEL_KEYS[result.level])}
                    </span>
                    <span className="ml-2 text-slate-600 text-base">
                      {t('scam_score', { score: result.score })}
                    </span>
                  </div>
                  <button
                    id="copy-btn"
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    {t('scam_btn_copy')}
                  </button>
                </div>

                {result.reasons.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">{t('scam_reasons_title')}</h3>
                    <ul className="space-y-1">
                      {result.reasons.map((r, i) => (
                        <li key={i} className="text-base text-slate-700 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">{t('scam_tips_title')}</h3>
                  <ul className="space-y-1">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-base text-slate-700 flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 免責聲明 */}
          <section className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-bold text-amber-900 mb-2">{t('scam_disclaimer_title')}</h3>
            <p className="text-base text-amber-900/90 leading-relaxed mb-2">
              {t('scam_disclaimer_p1')}
            </p>
            <p className="text-base text-amber-900/90 leading-relaxed">
              <strong>{t('scam_disclaimer_p2')}</strong>
            </p>
          </section>

          <section className="mt-12 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">什麼是詐騙訊息檢測工具？</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              詐騙訊息檢測工具是一種常見的AI工具，可幫助使用者提升效率，適合用於工作、學習與日常應用。
            </p>

            <h2 className="mt-6 text-xl font-semibold text-slate-900">為什麼使用這個工具？</h2>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-slate-600">
              <li>免費使用</li>
              <li>不需安裝</li>
              <li>支援快速處理</li>
            </ul>

            <RelatedTools items={getRelatedToolsItems('scam-check')} title="相關工具" />
            <RelatedGuides items={getRelatedGuideItems('scam-check')} />
            <p className="mt-4 text-slate-600 leading-relaxed">
              詐騙訊息檢測工具屬於實用型AI工具，可協助你快速判讀可疑內容。這款免費工具適合長輩提醒、學生防詐與上班族自我檢查，讓詐騙訊息檢測工具在日常對話更有防護力。想持續善用AI工具與免費工具，詐騙訊息檢測工具是很好的入口。
            </p>
            <div className="mt-8">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
              >
                前往 RxV 工具中心瀏覽完整工具清單
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
