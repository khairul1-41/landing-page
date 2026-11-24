import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ShieldAlert,
  LayoutDashboard,
  Layers,
  Users,
  Megaphone,
  Palette,
  TrendingUp,
  Settings,
  LogOut,
  ExternalLink,
  KeyRound,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigate, children }) => {
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // If not admin, direct to admin login
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk']">Administrative Access Required</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-2">
          This section is restricted to the platform Main Administrator. Sensitive database and advertisement actions require server verification.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('/admin/login')}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
          >
            Admin Sign In
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Landing Pages', path: '/admin/landing-pages', icon: Layers },
    { label: 'Advertisements', path: '/admin/advertisements', icon: Megaphone, badge: 'Ads' },
    { label: 'ACO & SEO Options', path: '/admin/aco', icon: Sparkles, badge: 'ACO' },
    { label: 'Admins & Password', path: '/admin/admins', icon: KeyRound, badge: 'Multi' },
    { label: 'Creators & Users', path: '/admin/users', icon: Users },
    { label: 'Templates', path: '/admin/templates', icon: Palette },
    { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { label: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleNav = (p: string) => {
    setSidebarOpen(false);
    navigate(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-sm text-white">Main Admin Portal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border border-slate-700 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between p-4 z-40`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="px-2 pt-2">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>{user.adminLevel === 'sub_admin' ? 'Sub Admin Console' : 'Main Admin Console'}</span>
            </div>
            <h3 className="text-lg font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
              Launch<span className="text-indigo-400">Craft</span>
            </h3>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
            {user.adminId && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-mono text-[10px] font-bold">
                ID: {user.adminId}
              </span>
            )}
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/admin/dashboard' && currentPath === '/admin');
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Public Website</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
