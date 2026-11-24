import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { ShieldAlert, Lock, Mail, Loader2, ArrowRight, Eye, EyeOff, Key, Sparkles } from 'lucide-react';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { adminLogin } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('MAIN-ADMIN');
  const [password, setPassword] = useState('AdminLaunch#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await adminLogin(identifier.trim(), password.trim());
      showToast('Admin verification successful. Welcome to Console.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invalid administrator credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofill = (pw: string) => {
    setIdentifier('MAIN-ADMIN');
    setPassword(pw);
    showToast(`Autofilled with MAIN-ADMIN`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">
          Administrator Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in with your Admin ID or Email. Multi-admin and ACO controls are available inside.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-amber-200">Default Main Admin Credentials:</p>
            <p className="text-[11px] text-amber-300/90 font-mono">
              Admin ID: <strong>MAIN-ADMIN</strong> &nbsp;|&nbsp; Email: <strong>lofimusic492@gmail.com</strong>
            </p>
            <p className="text-[11px] text-amber-300/90 font-mono">
              Default Password: <strong>AdminLaunch#2026</strong> (changeable in Console)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin ID or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter Admin ID or email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Admin Secret Password
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutofill('AdminLaunch#2026')}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Autofill Default
                  </button>
                </div>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-101 active:scale-99 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Main Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back to Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
