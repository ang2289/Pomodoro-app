import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Volume2, ExternalLink, Loader2 } from 'lucide-react';

/**
 * 📢 公告中心頁面（動態載入版）
 * - 自動讀取 public/data/announcements.json
 * - 支援多語言與未來新增
 */
export default function Announcements() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEnglish = !lang.startsWith("zh");

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/announcements.json')
      .then((res) => res.json())
      .then((data) => setAnnouncements(data))
      .catch(() => console.error('無法載入公告資料'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-8">
        {isEnglish ? '📢 Official Announcement Center' : '📢 公告中心'}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  {isEnglish ? a.title_en : a.title_zh}
                </h2>
                <span className="text-gray-500 text-sm">{a.date}</span>
              </div>
              <p className="text-gray-800 leading-relaxed mb-4">
                {isEnglish ? a.content_en : a.content_zh}
              </p>

              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                >
                  {isEnglish
                    ? 'Go to Official Site'
                    : '前往官方網站（開新頁）'}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <p className="text-gray-500 text-xs mt-3">
                {isEnglish
                  ? `Source: ${a.source}`
                  : `資料來源：${a.source}`}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {isEnglish ? '← Back to Home' : '← 回首頁'}
        </Link>
      </div>
    </div>
  );
}

