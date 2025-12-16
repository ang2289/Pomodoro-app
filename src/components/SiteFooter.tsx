import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function SiteFooter() {
  const { t } = useTranslation()
  const isEnglish = !i18n.language.startsWith("zh")
  
  return (
    <footer className="text-center text-gray-600 text-sm mt-10 pb-6">
      <div className="space-x-4 mb-2">
        <Link to="/privacy-policy" className="hover:underline">
          {t("privacy")}
        </Link>
        <Link to="/terms" className="hover:underline">
          {t("terms")}
        </Link>
        <Link to="/about" className="hover:underline">
          {t("about")}
        </Link>
        <Link to="/contact" className="hover:underline">
          {t("contact_us")}
        </Link>
        <Link to="/service-description" className="hover:underline">
          Service Description (English)
        </Link>
      </div>

      <div className="space-x-3">
        <a
          href="/rss.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:underline"
        >
          RSS
        </a>
        <a
          href="https://feedly.com/i/my"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          Feedly
        </a>
        <a
          href="https://news.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {isEnglish ? "Google News" : "Google 新聞"}
        </a>
      </div>

      <p className="mt-2 text-gray-500">
        {t('copyright')}
      </p>

      {/* 聯絡 Email */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">聯絡我們</p>
        <a
          href="mailto:rxv0227@gmail.com"
          className="text-blue-600 hover:underline font-medium"
        >
          📧 rxv0227@gmail.com
        </a>
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        Buy the AI JSON Summarizer Template →{' '}
        <a
          href="https://ko-fi.com/s/b5b4180ff1"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          Ko-fi Store
        </a>
      </p>
      
      <div className="text-center text-xs text-gray-500 mt-6 mb-4">
        Build your own AI JSON summarizer →{' '}
        <a
          href="https://ko-fi.com/s/b5b4180ff1"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 font-medium hover:text-blue-700"
        >
          Buy Template
        </a>
      </div>
    </footer>
  )
}

