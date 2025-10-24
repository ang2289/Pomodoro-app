// 簡易多語言系統
// TODO: 可升級為 react-i18next 或其他完整的 i18n 解決方案

type Language = 'zh-TW' | 'en' | 'ja'

// 翻譯字典
const translations: Record<Language, Record<string, string>> = {
  'zh-TW': {
    // 首頁
    'home.pomodoro.title': '番茄鐘',
    'home.pomodoro.desc': '專注工作 25 分鐘．休息 5 分鐘',
    'home.todo.title': '待辦清單',
    'home.todo.desc': '管理您的任務和待辦事項',
    'home.meditation.title': '念經計數',
    'home.meditation.desc': '自訂經文並統計次數',
    'home.settings.title': '設定中心',
    'home.settings.desc': '個人設定和應用程式選項',
  },
  'en': {
    // Home Page
    'home.pomodoro.title': 'Pomodoro',
    'home.pomodoro.desc': 'Focus 25 min · Break 5 min',
    'home.todo.title': 'Todo List',
    'home.todo.desc': 'Manage your tasks',
    'home.meditation.title': 'Chant Counter',
    'home.meditation.desc': 'Custom chants and statistics',
    'home.settings.title': 'Settings',
    'home.settings.desc': 'App settings and preferences',
  },
  'ja': {
    // ホームページ
    'home.pomodoro.title': 'ポモドーロ',
    'home.pomodoro.desc': '25分集中・5分休憩',
    'home.todo.title': 'ToDoリスト',
    'home.todo.desc': 'タスクを管理',
    'home.meditation.title': 'お経カウンター',
    'home.meditation.desc': 'カスタムお経と統計',
    'home.settings.title': '設定',
    'home.settings.desc': 'アプリの設定と環境設定',
  }
}

// 從 localStorage 取得當前語言，預設為繁體中文
export const getCurrentLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language
  return saved || 'zh-TW'
}

// 設定語言
export const setLanguage = (lang: Language) => {
  localStorage.setItem('language', lang)
  window.dispatchEvent(new Event('languagechange'))
}

// 翻譯函數
export const t = (key: string): string => {
  const currentLang = getCurrentLanguage()
  return translations[currentLang][key] || key
}

// 匯出供其他模組使用
export default { t, getCurrentLanguage, setLanguage }


















