import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { AdminLevel, User } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import { Power, ShieldCheck, Loader2, UserPlus, X, CheckCircle2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Promote to Admin modal state
  const [promoteTarget, setPromoteTarget] = useState<User | null>(null);
  const [promoteAdminId, setPromoteAdminId] = useState('');
  const [promoteLevel, setPromoteLevel] = useState<AdminLevel>('sub_admin');
  const [promoting, setPromoting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      setUsers(res.users);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.toggleUserStatus(id);
      showToast(res.message, 'success');
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: res.user.status } : u)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update user status', 'error');
    }
  };

  const openPromoteModal = (u: User) => {
    setPromoteTarget(u);
    const suggested = `ADMIN-${u.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || '02'}`;
    setPromoteAdminId(suggested);
    setPromoteLevel('sub_admin');
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteTarget) return;
    setPromoting(true);
    try {
      const res = await api.promoteUserToAdmin(promoteTarget.id, {
        adminId: promoteAdminId.trim(),
        adminLevel: promoteLevel,
      });
      showToast(res.message, 'success');
      setPromoteTarget(null);
      await loadUsers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to promote user to admin', 'error');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
          Creators & User Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review registered accounts, promote trusted creators to admins, and enforce platform authorization safety.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            Registered Accounts ({users.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading user accounts...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      u.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}
                  >
                    {u.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{u.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                      {u.adminId && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300">
                          {u.adminId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="text-right mr-2">
                    <p className="text-slate-300">
                      Pages Created: <strong className="font-mono text-white">{u.landingPagesCount ?? 0}</strong>
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase ${
                        u.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {u.status || 'active'}
                    </span>
                  </div>

                  {u.role !== 'admin' && (
                    <>
                      <button
                        onClick={() => openPromoteModal(u)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Make Admin</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promote User to Admin Modal */}
      {promoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Promote User to Admin
              </h3>
              <button
                onClick={() => setPromoteTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Promoting <strong className="text-white">{promoteTarget.name}</strong> ({promoteTarget.email}) grants Admin Console access.
            </p>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Admin ID *</label>
                <input
                  type="text"
                  required
                  value={promoteAdminId}
                  onChange={(e) => setPromoteAdminId(e.target.value)}
                  placeholder="e.g. ADMIN-ALEX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-amber-300 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Role Level</label>
                <select
                  value={promoteLevel}
                  onChange={(e) => setPromoteLevel(e.target.value as AdminLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                >
                  <option value="sub_admin">Sub Admin (Customize permissions in Admins tab)</option>
                  <option value="main_admin">Main Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPromoteTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {promoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Promote to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
