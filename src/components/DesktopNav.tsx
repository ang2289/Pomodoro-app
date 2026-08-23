import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout as logoutUser } from '@/lib/auth';

interface NavItem {
  to: string;
  labelKey: string;
}

const mainNavItems: NavItem[] = [
  { to: '/', labelKey: 'nav_home' },
  { to: '/tools', labelKey: 'nav_tools' },
  { to: '/blog', labelKey: 'nav_blog' },
];

function isActive(pathname: string, hash: string, to: string): boolean {
  if (to === '/') {
    return pathname === '/';
  }
  if (to.includes('#')) {
    const [path, frag] = to.split('#');
    return pathname === path && hash === `#${frag}`;
  }
  return pathname === to || pathname.startsWith(to + '/');
}

export default function DesktopNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(
    (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') ||
      (typeof window !== 'undefined' && localStorage.getItem('rxv_logged_in') === '1')
  );
  const pathname = location.pathname;
  const hash = location.hash || '';

  useEffect(() => {
    const syncAuth = () => {
      setIsLogin(
        localStorage.getItem('isLoggedIn') === 'true' ||
          localStorage.getItem('rxv_logged_in') === '1'
      );
    };
    window.addEventListener('auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);
    syncAuth();
    return () => {
      window.removeEventListener('auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsLogin(false);
    navigate('/', { replace: true });
  };

  return (
    <nav className="hidden md:flex items-center gap-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {mainNavItems.map((item) => {
          const active = isActive(pathname, hash, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`px-2.5 py-1.5 rounded-md transition-colors
                ${active
                  ? 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
        {isLogin ? (
          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-md transition-colors bg-purple-600 text-white dark:bg-purple-500 dark:text-white hover:bg-purple-700 dark:hover:bg-purple-600"
          >
            {t('logout')}
          </button>
        ) : (
          <Link
            to="/login"
            className={`px-2.5 py-1.5 rounded-md transition-colors
              ${isActive(pathname, hash, '/login')
                ? 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            {t('login')}
          </Link>
        )}
      </div>
    </nav>
  );
}
