import { Outlet } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      {/* ⛔ 已停用 TopNoticeBar，送審版本不顯示任何公告 */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
