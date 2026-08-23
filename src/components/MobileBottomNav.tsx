import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout as logoutUser } from '@/lib/auth';

interface NavItem {
  to: string;
  labelKey: string;
  icon: string;
  mobileLabelKey?: string;
}

const navItems: NavItem[] = [
  { to: '/', labelKey: 'nav_home', icon: '🏠' },
  { to: '/tools', labelKey: 'nav_tools', mobileLabelKey: 'nav_tools_short', icon: '🧰' },
  { to: '/blog', labelKey: 'nav_blog', mobileLabelKey: 'nav_blog_short', icon: '📝' },
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

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const hash = location.hash || '';
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isLogin, setIsLogin] = useState(
    (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') ||
      (typeof window !== 'undefined' && localStorage.getItem('rxv_logged_in') === '1')
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const hideOnPomodoro = location.pathname === '/pomodoro';
  if (hideOnPomodoro) return null;

  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] md:hidden z-40
bg-white/80 backdrop-blur-md rounded-2xl shadow-lg
transition-transform duration-300
${visible ? 'translate-y-0' : 'translate-y-24'}`}
    >
      <div className="flex justify-between">
        {navItems.map((item) => {
          const active = isActive(pathname, hash, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors
                ${active
                  ? 'text-blue-600 dark:text-sky-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-300'
                }`}
            >
              <span className="text-lg leading-none mb-0.5" aria-hidden="true">
                {item.icon}
              </span>
              <span className="truncate">{t(item.mobileLabelKey || item.labelKey)}</span>
            </Link>
          );
        })}
        {isLogin ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors text-blue-600 dark:text-sky-300 hover:text-blue-700 dark:hover:text-sky-200"
          >
            <span className="text-lg leading-none mb-0.5" aria-hidden="true">
              🚪
            </span>
            <span className="truncate">{t('logout')}</span>
          </button>
        ) : (
          <Link
            to="/login"
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors
                ${isActive(pathname, hash, '/login')
                  ? 'text-blue-600 dark:text-sky-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-300'
                }`}
          >
            <span className="text-lg leading-none mb-0.5" aria-hidden="true">
              🔐
            </span>
            <span className="truncate">{t('login')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
