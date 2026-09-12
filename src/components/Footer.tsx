import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdBanner from './AdBanner'
import { useUserStore } from '../store/userStore'

const isChantWishEnabled = import.meta.env.VITE_ENABLE_CHANT === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === 'true';

const baseNavigationItems = [
  { path: '/summary', icon: '/src/assets/icon_flower.png', labelKey: 'ai_summary' },
  { path: '/chant', icon: '/src/assets/icon_flower.png', labelKey: 'nav_chant_short' },
  { path: '/todo', icon: '/src/assets/icon_todo.png', labelKey: 'nav_todo_short' },
  { path: '/pomodoro', icon: '/src/assets/icon_tomato.png', labelKey: 'nav_focus' },
  { path: '/settings', icon: '/src/assets/icon_settings.png', labelKey: 'settings' }
];

const chantWishNavigationItems = isChantWishEnabled ? [
  { path: '/wish', icon: '/src/assets/icon_wish.png', labelKey: 'nav_wish' }
] : [];

const navigationItems = [...baseNavigationItems, ...chantWishNavigationItems];

export default function Footer() {
  const { t } = useTranslation()
  const location = useLocation()
  const currentPath = location.pathname
  const isPremium = useUserStore((state) => state.isPremium)

  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow z-50">
      <AdBanner />

      <div className="flex justify-around items-center py-3 px-2">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path ||
                          (item.path === '/chant' && currentPath === '/') ||
                          (item.path === '/summary' && currentPath === '/summary')

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all duration-150 ${
                isActive
                  ? 'scale-110 text-pink-500'
                  : 'hover:scale-105 text-gray-600 hover:text-pink-400'
              }`}
            >
              <img
                src={item.icon}
                alt={t(item.labelKey)}
                className="w-6 h-6 object-contain mb-1"
              />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </footer>
  )
}
