import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="text-center text-gray-600 text-sm mt-10 pb-6">
      <div className="mb-6 max-w-3xl mx-auto px-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('footer_site_intro')}
        </p>
      </div>

      <div className="mt-8 border-t pt-6 text-sm text-gray-600 max-w-4xl mx-auto px-4">
        <div className="font-semibold text-gray-800 mb-2">
          🎧 {t('footer_focus_tools')}
        </div>

        <p className="mb-3 leading-relaxed text-xs">
          {t('footer_focus_tools_intro')}
        </p>

        <ul className="space-y-2 text-left">
          <li>
            ▸ <span className="font-medium">{t('footer_focus_tools')}</span><br />
            <span className="text-gray-500 text-xs">
              {t('footer_focus_tools_intro')}
            </span><br />
            <a
              href="https://s.shopee.tw/4q8h2wvGZe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-block mt-1 text-xs"
            >
              👉 {t('footer_view_tool_info')}
            </a>
          </li>
        </ul>
      </div>

      <div className="space-x-4 mb-2">
        <Link to="/help" className="hover:underline">
          {t('footer_help')}
        </Link>
        <Link to="/points" className="hover:underline">
          {t('footer_usage_info')}
        </Link>
        <Link to="/terms" className="hover:underline">
          {t('terms')}
        </Link>
        <Link to="/terms" className="hover:underline">
          {t('footer_policy_info')}
        </Link>
        <Link to="/privacy-policy" className="hover:underline">
          {t('privacy')}
        </Link>
        <Link to="/about" className="hover:underline">
          {t('about')}
        </Link>
        <Link to="/contact" className="hover:underline">
          {t('contact_us')}
        </Link>
        <Link to="/service-description" className="hover:underline">
          {t('footer_service_desc')}
        </Link>
      </div>

      <div className="space-x-3 mb-4">
        <a
          href="/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:underline"
        >
          {t('footer_link_rss')}
        </a>
        <a
          href="https://feedly.com/i/my"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:underline"
        >
          {t('footer_link_feedly')}
        </a>
        <a
          href="https://news.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:underline"
        >
          {t('footer_link_google_news')}
        </a>
      </div>

      <div className="mt-4 text-center mb-4">
        <p className="text-xs font-medium text-gray-600 mb-1">
          <span className="mr-1">📌</span>
          {t('footer_extended_resources')}
        </p>
        <p className="text-xs text-gray-500 max-w-2xl mx-auto px-4 leading-relaxed">
          {t('footer_extended_intro')}
        </p>
      </div>

      <div id="extended-tools-resources" className="mt-6 mb-4 max-w-4xl mx-auto px-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t('footer_extended_tools')}
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          {t('footer_extended_tools_intro')}
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
                  Notion
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {t('footer_notion_desc')}
                </p>
              </div>
            </div>
          </a>

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
                  Forest
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {t('footer_forest_desc')}
                </p>
              </div>
            </div>
          </a>

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
                  Obsidian
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {t('footer_obsidian_desc')}
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">
          {t('footer_tool_example_docs')} →{' '}
          <a
            href="https://ko-fi.com/s/b5b4180ff1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 underline"
          >
            {t('footer_developer_resources')}
          </a>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          to="/services/design-commission"
          className="mb-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 font-bold !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          查看設計接案作品與服務
        </Link>
        <p className="text-sm text-gray-600 mb-2">
          {t('footer_contact')}
        </p>
        <a
          href="mailto:rxv0227@gmail.com"
          className="text-gray-600 hover:text-gray-800 hover:underline"
        >
          📧 rxv0227@gmail.com
        </a>
      </div>

      <p className="mt-4 text-gray-500">
        {t('copyright')}
      </p>

      <p className="text-[10px] text-gray-400 mt-4 max-w-2xl mx-auto px-4">
        {t('footer_disclaimer')}
      </p>
    </footer>
  )
}
