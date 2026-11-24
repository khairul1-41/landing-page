import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Rocket,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isPublicPage = currentPath.startsWith('/p/');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNav('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
              Launch<span className="text-indigo-600 dark:text-indigo-400">Craft</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Pro
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleNav('/')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentPath === '/'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleNav('/p/lumina-pro-anc-headphones')}
            className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Live Sample</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>

          {user && (
            <button
              onClick={() => handleNav('/dashboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentPath === '/dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          )}

          <button
            onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/admin/login')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              currentPath.startsWith('/admin')
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-amber-500/20'
                : 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
            }`}
            title="Access Main Admin Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Access</span>
          </button>
        </nav>

        {/* CTA & User Area */}
        <div className="hidden md:flex items-center gap-3">
          <PWAInstallButton variant="navbar" />

          <button
            onClick={() => handleNav('/create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-102 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Page</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNav('/dashboard')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>My Landing Pages</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleNav('/admin/dashboard')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Admin Management</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNav('/login')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <PWAInstallButton variant="compact" />
          <button
            onClick={() => handleNav('/create')}
            className="p-2 rounded-xl bg-indigo-600 text-white"
            title="Create Page"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-6 space-y-2">
          <PWAInstallButton variant="mobile" />

          <button
            onClick={() => handleNav('/')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Overview
          </button>
          <button
            onClick={() => handleNav('/create')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
          >
            + Generate Landing Page
          </button>
          <button
            onClick={() => handleNav('/p/lumina-pro-anc-headphones')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-between"
          >
            <span>Live Sample Page</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/admin/login')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Admin Access Portal</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {isAdmin ? 'Dashboard' : 'Sign In'}
            </span>
          </button>

          {user ? (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin/dashboard')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Admin Management Hub</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user.name})</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/admin/login')}
                className="w-full text-center py-2 text-xs font-semibold text-amber-600"
              >
                Admin Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
