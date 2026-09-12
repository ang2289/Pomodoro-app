import React from "react";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">聯絡我們</h1>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">
        若您對本站內容有任何建議或合作洽談，歡迎使用 Email 與我們聯繫。
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <p className="text-gray-700 text-lg font-semibold">📩 聯絡 Email</p>
        <p className="text-blue-600 font-medium select-all">
          rxv0227@gmail.com
        </p>
        <p className="text-sm text-gray-500 mt-2">
          回覆時間：週一～週五 10:00 - 18:00（例假日休息）
        </p>
      </div>
    </div>
  );
}

