import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useTranslation } from 'react-i18next'

export default function LanguageGuide() {
  const { t, i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState<'zh-TW' | 'en'>(i18n.language as 'zh-TW' | 'en')

  const changeLanguage = (lang: 'zh-TW' | 'en') => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }

  const content = {
    'zh-TW': {
      title: '中／英語系切換教學',
      subtitle: '本模板支援繁體中文與英文切換，並可擴充至更多語言',
      sections: [
        {
          title: '1. i18n.ts 如何設定',
          content: `i18n.ts 是整個多語言系統的核心設定檔。以下是基本設定：

\`\`\`typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'en': { translation: enUS },
    },
    fallbackLng: 'zh-TW',
    supportedLngs: ['en', 'zh-TW'],
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })
\`\`\``,
        },
        {
          title: '2. 如何新增語系',
          content: `要新增新的語系，請依照以下步驟：

1. 在 \`src/locales/\` 目錄下建立新的 JSON 檔案，例如 \`ja-JP.json\`
2. 複製現有的語系檔案結構，並翻譯所有 key 的內容
3. 在 \`i18n.ts\` 中匯入並加入 resources：
   \`\`\`typescript
   import jaJP from './locales/ja-JP.json'
   
   resources: {
     'zh-TW': { translation: zhTW },
     'en': { translation: enUS },
     'ja-JP': { translation: jaJP }, // 新增日文
   }
   \`\`\`
4. 在 \`supportedLngs\` 中加入新語系：\`['en', 'zh-TW', 'ja-JP']\``,
        },
        {
          title: '3. 如何讓 UI 文字自動切換',
          content: `在 React 元件中使用 \`useTranslation\` hook：

\`\`\`typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  )
}
\`\`\`

在 JSON 檔案中定義翻譯：

\`\`\`json
// zh-TW.json
{
  "home": {
    "title": "首頁",
    "description": "歡迎來到首頁"
  }
}

// en-US.json
{
  "home": {
    "title": "Home",
    "description": "Welcome to Home"
  }
}
\`\`\`

切換語系：
\`\`\`typescript
const { i18n } = useTranslation()
i18n.changeLanguage('en') // 切換到英文
\`\`\``,
        },
        {
          title: '4. 示範截圖',
          content: `以下是語系切換的實際效果示範：`,
        },
      ],
    },
    en: {
      title: 'Language Switching Guide',
      subtitle: 'This template supports Traditional Chinese and English switching, and can be extended to more languages',
      sections: [
        {
          title: '1. How to Configure i18n.ts',
          content: `i18n.ts is the core configuration file for the entire multilingual system. Here's the basic setup:

\`\`\`typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'en': { translation: enUS },
    },
    fallbackLng: 'zh-TW',
    supportedLngs: ['en', 'zh-TW'],
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })
\`\`\``,
        },
        {
          title: '2. How to Add New Languages',
          content: `To add a new language, follow these steps:

1. Create a new JSON file in the \`src/locales/\` directory, e.g., \`ja-JP.json\`
2. Copy the structure of an existing language file and translate all key contents
3. Import and add to resources in \`i18n.ts\`:
   \`\`\`typescript
   import jaJP from './locales/ja-JP.json'
   
   resources: {
     'zh-TW': { translation: zhTW },
     'en': { translation: enUS },
     'ja-JP': { translation: jaJP }, // Add Japanese
   }
   \`\`\`
4. Add the new language to \`supportedLngs\`: \`['en', 'zh-TW', 'ja-JP']\``,
        },
        {
          title: '3. How to Make UI Text Auto-Switch',
          content: `Use the \`useTranslation\` hook in React components:

\`\`\`typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  )
}
\`\`\`

Define translations in JSON files:

\`\`\`json
// zh-TW.json
{
  "home": {
    "title": "首頁",
    "description": "歡迎來到首頁"
  }
}

// en-US.json
{
  "home": {
    "title": "Home",
    "description": "Welcome to Home"
  }
}
\`\`\`

Switch language:
\`\`\`typescript
const { i18n } = useTranslation()
i18n.changeLanguage('en') // Switch to English
\`\`\``,
        },
        {
          title: '4. Demo Screenshots',
          content: `Here are the actual effects of language switching:`,
        },
      ],
    },
  }

  const currentContent = content[currentLang]

  return (
    <>
      <SEO
        title={`${currentContent.title} — Language Switching Guide`}
        description={currentContent.subtitle}
        keywords="i18n, language switching, multilingual, React i18next, translation"
        url="https://pomodoro-app-eight-rouge.vercel.app/language-guide"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24">
        {/* 語系切換按鈕 */}
        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => changeLanguage('zh-TW')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentLang === 'zh-TW'
                ? 'bg-blue-600 text-white border-black'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
          >
            繁體中文
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentLang === 'en'
                ? 'bg-blue-600 text-white border-black'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
          >
            English
          </button>
        </div>

        {/* 標題 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">
          {currentContent.title}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {currentContent.subtitle}
        </p>

        {/* 內容區塊 */}
        <div className="space-y-8">
          {currentContent.sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {section.title}
              </h2>
              <div className="prose max-w-none">
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{section.content}</code>
                </pre>
              </div>
              {index === 3 && (
                <div className="mt-4 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                  <p className="text-lg mb-2">📸 Screenshot Placeholder</p>
                  <p className="text-sm">
                    {currentLang === 'zh-TW'
                      ? '語系切換示範截圖將顯示於此'
                      : 'Language switching demo screenshots will be displayed here'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 返回首頁 */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentLang === 'zh-TW' ? '返回首頁' : 'Back to Home'}
          </Link>
        </div>
      </main>
    </>
  )
}




