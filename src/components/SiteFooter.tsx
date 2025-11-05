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
    </footer>
  )
}

