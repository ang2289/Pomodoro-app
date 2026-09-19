import { Outlet, Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DesktopNav from '../components/DesktopNav';
import MobileBottomNav from '../components/MobileBottomNav';
import { useTranslation } from 'react-i18next';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      {/* 頂部 Navbar：標題 + 語言切換 + 桌機版導航 */}
      {/* 實色頂欄：避免 WebKit/平板多重 backdrop-filter 與半透明疊加造成整頁霧面 */}
      <header className="sticky top-0 z-30 px-3 py-2 sm:px-4 sm:py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="max-w-[75%] truncate"
          >
            <span className="block text-sm sm:text-lg font-semibold text-gray-800 truncate">
              {t('app_title')}
            </span>
            <span className="hidden sm:block text-xs text-slate-500 truncate">
              {t('app_tagline')}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="mt-2">
          <DesktopNav />
        </div>
      </header>

      <main className="app-main-reading flex-grow pb-20">
        <Outlet />
      </main>
      <MobileBottomNav />
      <SiteFooter />
    </div>
  );
}
