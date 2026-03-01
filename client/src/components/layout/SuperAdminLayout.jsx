/**
 * SuperAdminLayout — dedicated shell for the super-admin section.
 *
 * Desktop: fixed 256px sidebar on left + main content.
 * Mobile:  hidden sidebar + hamburger menu in topbar.
 *
 * Nav items: Dashboard, Biznesmenlar
 * Bottom:    theme toggle + user info + logout
 */

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import ToastContainer from '../ui/Toast';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';

const NAV = [
  { to: '/super-admin',              label: 'Boshqaruv paneli', icon: LayoutDashboard, end: true },
  { to: '/super-admin/businessmen',  label: 'Biznesmenlar',      icon: Users },
];

/* ── Sidebar component ── */
const Sidebar = ({ open, onClose }) => {
  const { user, logout }    = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const navigate            = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const initials = user?.username?.[0]?.toUpperCase() || 'A';

  return (
    <aside
      className={[
        'fixed top-0 left-0 h-full w-64 z-40 flex flex-col',
        'bg-white dark:bg-[#0d1420]',
        'border-r border-slate-200 dark:border-white/[0.06]',
        'transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-white/[0.06] shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25 shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">Avtojon Admin</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">SuperAdmin Panel</p>
        </div>
        <button
          className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white',
              ].join(' ')
            }
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-200 dark:border-white/[0.06] p-3 space-y-1 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Super Admin</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={17} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};

/* ── Layout ── */
const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center px-4 gap-3 lg:hidden sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary-600" />
            <span className="font-semibold text-slate-800 dark:text-white text-sm">Avtojon Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SuperAdminLayout;
