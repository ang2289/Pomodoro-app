import React from "react";
import { useTranslation } from 'react-i18next';
import ModuleDropdown from '../components/ModuleDropdown';

export default function ContactPage() {
  const { t } = useTranslation();
  
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 max-w-2xl w-full text-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('contact_us')}</h1>
          <ModuleDropdown />
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">📧 電子郵件聯絡</h2>
            <p className="mb-2">
              如果您有任何問題、建議或合作提案，歡迎透過以下方式與我們聯繫：
            </p>
            <p className="mb-4">
              <a
                href="mailto:rxv0227@gmail.com"
                className="text-blue-600 underline hover:text-blue-800 font-medium"
              >
                rxv0227@gmail.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">💬 常見問題</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium mb-1">關於網站功能</h3>
                <p className="text-sm text-gray-600">
                  如果您在使用過程中遇到任何問題，請詳細描述問題情況，我們會盡快回覆。
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">關於隱私權與資料</h3>
                <p className="text-sm text-gray-600">
                  您可以隨時透過 Email 要求查看、修改或刪除您的個人資料。
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">關於內容建議</h3>
                <p className="text-sm text-gray-600">
                  我們歡迎任何有助於改善網站內容與功能的建議。
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              我們會在收到您的訊息後，盡可能在 3-5 個工作天內回覆。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

