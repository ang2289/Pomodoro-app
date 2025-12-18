import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function SiteFooter() {
  const { t } = useTranslation()
  const isEnglish = !i18n.language.startsWith("zh")
  
  return (
    <footer className="text-center text-gray-600 text-sm mt-10 pb-6">
      {/* 網站說明 */}
      <div className="mb-6 max-w-3xl mx-auto px-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {isEnglish 
            ? "This website is a tool and learning assistance platform, providing users with resources for focus, organization, understanding, and efficiency improvement."
            : "本網站為工具與學習輔助平台，提供使用者進行專注、整理、理解與效率提升之用途。"}
        </p>
      </div>

      {/* 專注輔助工具 */}
      <div className="mt-8 border-t pt-6 text-sm text-gray-600 max-w-4xl mx-auto px-4">
        <div className="font-semibold text-gray-800 mb-2">
          🎧 專注輔助工具
        </div>

        <p className="mb-3 leading-relaxed text-xs">
          {isEnglish
            ? "Some users use simple auxiliary tools during extended focus, learning, or meditation sessions to reduce environmental distractions. The following are common focus assistance items, provided for informational reference only."
            : "部分使用者在長時間專注、學習或靜心時，會搭配使用簡單的輔助工具，以降低環境干擾。以下為常見的專注輔助用品，僅供資訊參考。"}
        </p>

        <ul className="space-y-2 text-left">
          <li>
            ▸ <span className="font-medium">靜音專注耳塞（資訊參考）</span><br />
            <span className="text-gray-500 text-xs">
              {isEnglish
                ? "Suitable for use during study, focus, or rest, helping to reduce environmental noise interference."
                : "適合在學習、專注或休息時使用，協助降低環境噪音干擾。"}
            </span><br />
            <a
              href="https://s.shopee.tw/4q8h2wvGZe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-block mt-1 text-xs"
            >
              👉 {isEnglish ? "View Tool Information" : "查看工具資訊"}
            </a>
          </li>
        </ul>
      </div>

      {/* 導覽連結 */}
      <div className="space-x-4 mb-2">
        <Link to="/points" className="hover:underline">
          {isEnglish ? "Points Information" : "點數說明"}
        </Link>
        <Link to="/terms" className="hover:underline">
          {t("terms")}
        </Link>
        <Link to="/terms" className="hover:underline">
          {isEnglish ? "Policy Information" : "政策說明"}
        </Link>
        <Link to="/privacy-policy" className="hover:underline">
          {t("privacy")}
        </Link>
        <Link to="/about" className="hover:underline">
          {t("about")}
        </Link>
        <Link to="/contact" className="hover:underline">
          {t("contact_us")}
        </Link>
        <Link to="/service-description" className="hover:underline">
          {isEnglish ? "Service Description" : "服務說明"}
        </Link>
      </div>

      {/* RSS 與訂閱連結 */}
      <div className="space-x-3 mb-4">
        <a
          href="/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:underline"
        >
          RSS
        </a>
        <a
          href="https://feedly.com/i/my"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:underline"
        >
          Feedly
        </a>
        <a
          href="https://news.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:underline"
        >
          {isEnglish ? "Google News" : "Google 新聞"}
        </a>
      </div>

      {/* 📌 延伸資源說明區 */}
      <div className="mt-4 text-center mb-4">
        <p className="text-xs font-medium text-gray-600 mb-1">
          <span className="mr-1">📌</span>
          {isEnglish ? "Extended Resources" : "延伸資源"}
        </p>
        <p className="text-xs text-gray-500 max-w-2xl mx-auto px-4 leading-relaxed">
          {isEnglish
            ? "This section provides external resource links related to focus, learning, and efficiency improvement, for informational and reference purposes only, with no direct connection to this site's points, features, or services."
            : "本區提供與專注、學習、效率提升相關的外部資源連結，僅作為資訊補充與參考，與本站點數、功能與服務無直接關聯。"}
        </p>
      </div>

      {/* 延伸工具與資源 */}
      <div id="extended-tools-resources" className="mt-6 mb-4 max-w-4xl mx-auto px-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {isEnglish ? "Extended Tools & Resources" : "延伸工具與資源"}
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          {isEnglish
            ? "The following are external tools and resources that some users commonly use alongside focus, learning, or content organization processes, provided as usage scenario references only."
            : "以下為部分使用者在專注、學習或內容整理過程中，常搭配使用的外部工具與資源，僅作為使用情境參考。"}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
          {/* 範例工具項目 1 - 筆記工具 */}
          <a
            href="https://www.notion.so"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 group"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">📝</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-700 group-hover:text-gray-900 mb-1">
                  {isEnglish ? "Notion" : "Notion"}
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {isEnglish
                    ? "Note-taking and workspace organization tool"
                    : "筆記與工作區整理工具"}
                </p>
              </div>
            </div>
          </a>

          {/* 範例工具項目 2 - 專注工具 */}
          <a
            href="https://www.forestapp.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 group"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">🌲</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-700 group-hover:text-gray-900 mb-1">
                  {isEnglish ? "Forest" : "Forest"}
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {isEnglish
                    ? "Focus timer with visual progress tracking"
                    : "專注計時工具，具視覺化進度追蹤"}
                </p>
              </div>
            </div>
          </a>

          {/* 範例工具項目 3 - 知識管理 */}
          <a
            href="https://obsidian.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 group"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">🔗</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-700 group-hover:text-gray-900 mb-1">
                  {isEnglish ? "Obsidian" : "Obsidian"}
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {isEnglish
                    ? "Knowledge base with linked notes"
                    : "知識庫工具，支援筆記連結"}
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* 工具範例說明 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">
          {isEnglish 
            ? "Tool Example Documentation →" 
            : "工具範例說明 →"}{' '}
          <a
            href="https://ko-fi.com/s/b5b4180ff1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 underline"
          >
            {isEnglish ? "Developer Resources" : "開發者資源"}
          </a>
        </p>
      </div>

      {/* 聯絡 Email */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          {isEnglish ? "Contact" : "聯絡"}
        </p>
        <a
          href="mailto:rxv0227@gmail.com"
          className="text-gray-600 hover:text-gray-800 hover:underline"
        >
          📧 rxv0227@gmail.com
        </a>
      </div>

      {/* 版權聲明 */}
      <p className="mt-4 text-gray-500">
        {t('copyright')}
      </p>

      {/* 免責聲明（置於底部） */}
      <p className="text-[10px] text-gray-400 mt-4 max-w-2xl mx-auto px-4">
        {isEnglish
          ? "The content of this site is for learning and tool usage reference only, and does not constitute any commercial or investment advice."
          : "本站內容僅供學習與工具使用參考，不構成任何商業或投資建議。"}
      </p>
    </footer>
  )
}

