import React from "react";
import { Link } from "react-router-dom";
import FAQ from '@/components/FAQ';
import ShareButtons from '@/components/ShareButtons';

export default function HealthBalance2025() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article className="bg-white p-6 rounded-2xl border shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          身心平衡理財術｜從日常習慣開始建立穩定的健康與財務
        </h1>
        <p className="text-gray-500 mb-6">更新：{new Date().toISOString().slice(0,10)}</p>

        <p className="leading-8">
          健康與財務看似分開，實際上彼此深深影響。良好的健康習慣可降低醫療開銷；穩定的財務規劃能減少壓力，進而改善睡眠、飲食與心情。
          <strong> 身心與財務是互相支持的循環</strong>，不是分開處理的。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">先從日常做到的五個基礎健康行為</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">習慣</th>
                <th className="p-3">建議做法</th>
                <th className="p-3">為什麼重要</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3 font-semibold">規律睡眠</td>
                <td className="p-3">固定就寢時間，睡前不滑手機</td>
                <td className="p-3">睡眠不足會增加焦慮與衝動消費</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-semibold">清淡飲食</td>
                <td className="p-3">減少含糖飲、炸物、加工食品</td>
                <td className="p-3">健康改善，醫療支出下降</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-semibold">每週 3 次活動</td>
                <td className="p-3">快走、伸展或瑜珈</td>
                <td className="p-3">運動穩定情緒，降低報復性購物</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-semibold">固定節奏</td>
                <td className="p-3">用行事曆安排作息</td>
                <td className="p-3">穩定感可減少「壓力消費」</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-semibold">社交支持</td>
                <td className="p-3">定期與信任的人交流</td>
                <td className="p-3">降低焦慮，改善決策能力</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">可執行的理財三步驟</h2>
        <ol className="list-decimal pl-6 space-y-2 leading-8">
          <li><strong>記錄花費：</strong>先不改習慣，只記錄真實支出（手機記事 App 皆可）。</li>
          <li><strong>分類支出：</strong>必要／生活品質／情緒消費，找出最能小調整的區塊。</li>
          <li><strong>每月微調 10%：</strong>不求一次到位，像「手搖飲每週 5 杯 → 4 杯」。</li>
        </ol>

        <h2 className="text-xl font-bold mt-8 mb-3">心理層面的財務穩定感</h2>
        <ul className="list-disc pl-6 space-y-2 leading-8">
          <li>避免設定過高金額目標，改用「行動目標」（例：每週記帳 5 次）。</li>
          <li>先照顧情緒與睡眠，金流調整才容易長期維持。</li>
          <li>允許「小小批准」以避免爆炸性消費。</li>
        </ul>

        <FAQ
          title="常見問題 Q&A"
          items={[
            { q: '理財一定要從投資開始嗎？', a: '不一定。先讓支出透明與節奏穩定，再考慮投資，成功率更高。' },
            { q: '情緒不穩時會亂花錢怎麼辦？', a: '先處理睡眠與呼吸、散步等身心調節，再處理金流。' },
            { q: '收入不高能存錢嗎？', a: '可以。從降低波動與固定生活節奏著手，比追求一次多存更有效。' },
            { q: '很懶不想運動？', a: '先建立 3 分鐘伸展的儀式感，時間會自然延長。' },
          ]}
        />

        <ShareButtons title="身心平衡理財術｜從日常習慣開始建立穩定的健康與財務" />

        <section className="mt-8 text-sm text-gray-500">
          <p className="mb-2">資料來源與參考：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>衛生福利部 國民健康署 健康促進資料</li>
            <li>金融消費評議中心 財務行為研究</li>
          </ul>
          <p className="mt-3 italic">
            本平台為資訊整理性網站，非政府單位，所有資料以官方公告為準。
          </p>
        </section>

        <div className="mt-10">
          <Link
            to="/finance"
            className="inline-block bg-blue-600 !text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            style={{ color: '#ffffff' }}
          >
            ← 回到健康與理財專欄
          </Link>
        </div>
      </article>
    </main>
  );
}

