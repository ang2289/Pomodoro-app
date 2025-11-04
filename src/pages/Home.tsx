import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link to="/aids" className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2">💰 補助懶人包</div>
          <p className="text-gray-600">查詢租屋補助、節能補貼與銀髮族補助方案。</p>
        </Link>

        <Link to="/finance" className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2">🩺 健康與理財</div>
          <p className="text-gray-600">健康理財理念與生活平衡建議。</p>
        </Link>

        <Link to="/pension" className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2">🏛️ 退休金專欄</div>
          <p className="text-gray-600">掌握退休金新制與安心理財資訊。</p>
        </Link>
      </div>

      {/* 最新官方公告區 */}
      <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">📢 最新官方公告</h2>
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
          <div className="text-blue-800 font-medium mb-1">
            ⚠️ 普發一萬元補助提醒｜認明官網防詐騙！
          </div>
          <div className="text-sm text-gray-600 mb-2">2025-11-04</div>
          <p className="text-gray-700 mb-4">
            行政院宣布普發一萬元補助方案即將開放，提醒民眾認明官方網站{' '}
            <a
              href="https://10000.gov.tw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline font-semibold"
            >
              https://10000.gov.tw
            </a>{' '}
            勿點陌生連結，防止詐騙。
          </p>
          <Link
            to="/finance/anti-fraud-2025"
            className="inline-block px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            style={{ color: '#ffffff', fontWeight: '700' }}
          >
            閱讀更多 →
          </Link>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-8">
        © 2025 RxV 夢想創作工作室 ｜ 健康理財與生活資訊平台
      </footer>
    </div>
  );
}

