import React from 'react';
import { useTranslation } from 'react-i18next';

export default function OfficialSourceNote() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEnglish = !lang.startsWith("zh");

  return (
    <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed px-4">
      {isEnglish ? (
        <>
          📘 Data source: Executive Yuan official announcement (
          <a
            href="https://10000.gov.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://10000.gov.tw
          </a>
          ) and the open data platform (
          <a
            href="https://data.gov.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            data.gov.tw
          </a>
          ). For accurate details, please refer to official government releases.
        </>
      ) : (
        <>
          📘 資料來源：
          行政院官方公告（
          <a
            href="https://10000.gov.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://10000.gov.tw
          </a>
          ）及政府資料開放平台（
          <a
            href="https://data.gov.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            data.gov.tw
          </a>
          ），內容僅供參考，實際以政府公告為準。
        </>
      )}
    </div>
  );
}

