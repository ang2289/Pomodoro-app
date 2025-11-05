import React from "react";
import ModuleDropdown from '../components/ModuleDropdown';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">關於我們</h1>
        <ModuleDropdown />
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">
        本網站由 <strong>RxV 夢想創作工作室</strong> 獨立開發與維運。
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        我們致力於整理政府公開資訊、補助申請方式、健康理財與退休金政策內容，
        協助民眾快速理解並提升資訊透明度。
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        本站所有資料皆以政府機關正式公告為準，並提醒用戶提高警覺，
        小心不明來源連結與詐騙網站。
      </p>

      <p className="text-gray-600 text-sm mt-6">
        本站不屬於任何政府單位，為資訊整理服務平台。
      </p>
    </div>
  );
}
