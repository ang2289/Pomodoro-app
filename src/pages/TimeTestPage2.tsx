import React from 'react'

export default function TimeTestPage2() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">⏰ 時間測試頁面</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">當前時間</h3>
              <p className="text-gray-600">
                現在時間：{new Date().toLocaleString('zh-TW')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">時間格式測試</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>ISO 格式：</strong> {new Date().toISOString()}
                </p>
                <p className="text-gray-600">
                  <strong>本地格式：</strong> {new Date().toLocaleDateString('zh-TW')}
                </p>
                <p className="text-gray-600">
                  <strong>時間格式：</strong> {new Date().toLocaleTimeString('zh-TW')}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">時區資訊</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>時區偏移：</strong> {new Date().getTimezoneOffset()} 分鐘
                </p>
                <p className="text-gray-600">
                  <strong>UTC 時間：</strong> {new Date().toUTCString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}