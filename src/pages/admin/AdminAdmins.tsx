import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { AdminLevel, AdminPermissions, User } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import {
  ShieldAlert,
  KeyRound,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Lock,
  BadgeCheck,
  UserMinus,
  X,
  Power,
} from 'lucide-react';

const EMPTY_PERMISSIONS: AdminPermissions = {
  manageAds: false,
  managePages: true,
  manageUsers: false,
  manageAdmins: false,
  manageACO: false,
  manageSettings: false,
};

const ALL_PERMISSIONS: AdminPermissions = {
  manageAds: true,
  managePages: true,
  manageUsers: true,
  manageAdmins: true,
  manageACO: true,
  manageSettings: true,
};

const PERMISSION_LABELS: { key: keyof AdminPermissions; label: string; desc: string }[] = [
  { key: 'manageAds', label: 'Advertisements', desc: 'Create, edit & toggle global ads' },
  { key: 'managePages', label: 'Landing Pages', desc: 'Moderate or disable user pages' },
  { key: 'manageUsers', label: 'Users & Creators', desc: 'Suspend or activate creators' },
  { key: 'manageAdmins', label: 'Multi-Admin Control', desc: 'Add, edit or remove admins' },
  { key: 'manageACO', label: 'ACO & SEO Options', desc: 'Manage pixels, SEO & conversion tools' },
  { key: 'manageSettings', label: 'Site & Templates', desc: 'Edit global site settings & templates' },
];

export const AdminAdmins: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // My Credentials State
  const [myName, setMyName] = useState(user?.name || '');
  const [myAdminId, setMyAdminId] = useState(user?.adminId || '');
  const [myEmail, setMyEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Admins List State
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [admins, setAdmins] = useState<User[]>([]);

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<{
    name: string;
    adminId: string;
    email: string;
    password: string;
    adminLevel: AdminLevel;
    permissions: AdminPermissions;
  }>({
    name: '',
    adminId: '',
    email: '',
    password: '',
    adminLevel: 'sub_admin',
    permissions: { ...EMPTY_PERMISSIONS },
  });
  const [showAddPw, setShowAddPw] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    adminId: string;
    email: string;
    newPassword: string;
    adminLevel: AdminLevel;
    status: 'active' | 'suspended';
    permissions: AdminPermissions;
  }>({
    name: '',
    adminId: '',
    email: '',
    newPassword: '',
    adminLevel: 'sub_admin',
    status: 'active',
    permissions: { ...EMPTY_PERMISSIONS },
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete/Demote Confirmation Modal
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState(false);

  const canManageAdmins =
    user?.role === 'admin' &&
    (user.adminLevel === 'main_admin' || !user.adminLevel || Boolean(user.permissions?.manageAdmins));

  useEffect(() => {
    if (user) {
      setMyName(user.name || '');
      setMyAdminId(user.adminId || '');
      setMyEmail(user.email || '');
    }
  }, [user]);

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const res = await api.getAdmins();
      setAdmins(res.admins);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load administrators', 'error');
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSaveMyCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      showToast('Please enter your current password to confirm changes.', 'error');
      return;
    }
    if (newPassword && newPassword.trim().length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.updateAdminProfile({
        currentPassword: currentPassword.trim(),
        newAdminId: myAdminId.trim(),
        newEmail: myEmail.trim(),
        name: myName.trim(),
        newPassword: newPassword.trim() || undefined,
      });
      showToast(res.message, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
      await loadAdmins();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update admin credentials', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const res = await api.createAdmin({
        name: addForm.name.trim(),
        adminId: addForm.adminId.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        adminLevel: addForm.adminLevel,
        permissions: addForm.adminLevel === 'main_admin' ? { ...ALL_PERMISSIONS } : addForm.permissions,
      });
      showToast(res.message, 'success');
      setShowAddModal(false);
      setAddForm({
        name: '',
        adminId: '',
        email: '',
        password: '',
        adminLevel: 'sub_admin',
        permissions: { ...EMPTY_PERMISSIONS },
      });
      await loadAdmins();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create admin account', 'error');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const openEditModal = (adm: User) => {
    setEditingAdmin(adm);
    setEditForm({
      name: adm.name || '',
      adminId: adm.adminId || '',
      email: adm.email || '',
      newPassword: '',
      adminLevel: adm.adminLevel || 'sub_admin',
      status: adm.status === 'suspended' ? 'suspended' : 'active',
      permissions: adm.permissions ? { ...adm.permissions } : { ...EMPTY_PERMISSIONS },
    });
  };

  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setSavingEdit(true);
    try {
      const res = await api.updateAdmin(editingAdmin.id, {
        name: editForm.name.trim(),
        adminId: editForm.adminId.trim(),
        email: editForm.email.trim(),
        adminLevel: editForm.adminLevel,
        status: editForm.status,
        permissions: editForm.adminLevel === 'main_admin' ? { ...ALL_PERMISSIONS } : editForm.permissions,
        newPassword: editForm.newPassword.trim() || undefined,
      });
      showToast(res.message, 'success');
      setEditingAdmin(null);
      await loadAdmins();
      if (editingAdmin.id === user?.id) {
        await refreshUser();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update admin account', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveOrDemote = async (demote: boolean) => {
    if (!confirmTarget) return;
    setRemovingAdmin(true);
    try {
      const res = await api.deleteAdmin(confirmTarget.id, demote);
      showToast(res.message, 'success');
      setConfirmTarget(null);
      await loadAdmins();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setRemovingAdmin(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Admin ID, Password & Multi-Admin Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Change your Admin ID and password, add multiple team administrators, and configure Access Control Options.
          </p>
        </div>

        {canManageAdmins && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Admin</span>
          </button>
        )}
      </div>

      {/* Card 1: My Admin ID & Password Settings */}
      <form
        onSubmit={handleSaveMyCredentials}
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                Change My Admin ID & Password
              </h2>
              <p className="text-[11px] text-slate-400">
                Sign in with either your Admin ID or email. Updating your password immediately replaces your old secret.
              </p>
            </div>
          </div>
          {user?.adminId && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-mono text-xs font-bold">
              ID: {user.adminId}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin ID (Custom Login ID)
            </label>
            <input
              type="text"
              required
              value={myAdminId}
              onChange={(e) => setMyAdminId(e.target.value)}
              placeholder="e.g. MAIN-ADMIN"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-amber-300 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-500 mt-1">3–40 chars (letters, numbers, - or _)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={myEmail}
              onChange={(e) => setMyEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Password (Optional)
            </label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type={showNewPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Current Password (Required to Save) *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-8 pr-9 py-2.5 rounded-xl border border-amber-500/40 bg-slate-950 text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save My Admin ID & Password</span>
          </button>
        </div>
      </form>

      {/* Card 2: Multiple Admins & Access Control */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Platform Administrators ({admins.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Each administrator has a unique Admin ID, password, and granular Access Control permissions.
            </p>
          </div>
          {canManageAdmins && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Admin</span>
            </button>
          )}
        </div>

        {loadingAdmins ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading administrator accounts...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {admins.map((adm) => {
              const isSelf = adm.id === user?.id;
              const isMain = adm.adminLevel === 'main_admin' || !adm.adminLevel;
              const perms = adm.permissions || ALL_PERMISSIONS;

              return (
                <div
                  key={adm.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-900/80"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{adm.name}</span>
                      {adm.adminId && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-amber-300 font-mono text-[11px] font-bold">
                          ID: {adm.adminId}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isMain
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {isMain ? 'Main Admin' : 'Sub Admin'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          adm.status === 'suspended'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {adm.status || 'active'}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          You
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">{adm.email}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {isMain ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <BadgeCheck className="w-3 h-3" /> Full System Access
                        </span>
                      ) : (
                        PERMISSION_LABELS.filter((p) => perms[p.key]).map((p) => (
                          <span
                            key={p.key}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {p.label}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {canManageAdmins && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(adm)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit / Permissions</span>
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => setConfirmTarget(adm)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Add New Administrator
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Tariqul Islam"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin ID *</label>
                  <input
                    type="text"
                    required
                    value={addForm.adminId}
                    onChange={(e) => setAddForm({ ...addForm, adminId: e.target.value })}
                    placeholder="e.g. ADMIN-02"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-amber-300 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="admin2@yourdomain.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showAddPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPw(!showAddPw)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showAddPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, adminLevel: 'sub_admin' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      addForm.adminLevel === 'sub_admin'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold">Sub Admin</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Custom permissions below</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, adminLevel: 'main_admin' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      addForm.adminLevel === 'main_admin'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold">Main Admin</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Unrestricted full access</p>
                  </button>
                </div>
              </div>

              {addForm.adminLevel === 'sub_admin' && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <p className="text-xs font-bold text-slate-300">Access Control Options (Permissions)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERMISSION_LABELS.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-900 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={addForm.permissions[perm.key]}
                          onChange={(e) =>
                            setAddForm({
                              ...addForm,
                              permissions: { ...addForm.permissions, [perm.key]: e.target.checked },
                            })
                          }
                          className="mt-0.5 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <p className="text-xs font-semibold text-white">{perm.label}</p>
                          <p className="text-[10px] text-slate-400">{perm.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creatingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Create Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Edit Administrator: {editingAdmin.adminId || editingAdmin.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin ID</label>
                  <input
                    type="text"
                    required
                    value={editForm.adminId}
                    onChange={(e) => setEditForm({ ...editForm, adminId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-amber-300 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reset Password (Optional)</label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Leave blank to keep"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Level</label>
                  <select
                    value={editForm.adminLevel}
                    onChange={(e) => setEditForm({ ...editForm, adminLevel: e.target.value as AdminLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  >
                    <option value="sub_admin">Sub Admin (Custom Permissions)</option>
                    <option value="main_admin">Main Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                  <button
                    type="button"
                    disabled={editingAdmin.id === user?.id}
                    onClick={() =>
                      setEditForm({ ...editForm, status: editForm.status === 'active' ? 'suspended' : 'active' })
                    }
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                      editForm.status === 'active'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{editForm.status === 'active' ? 'Active' : 'Suspended'}</span>
                  </button>
                </div>
              </div>

              {editForm.adminLevel === 'sub_admin' && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <p className="text-xs font-bold text-slate-300">Access Control Options (Permissions)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERMISSION_LABELS.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-900 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.permissions[perm.key]}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              permissions: { ...editForm.permissions, [perm.key]: e.target.checked },
                            })
                          }
                          className="mt-0.5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="text-xs font-semibold text-white">{perm.label}</p>
                          <p className="text-[10px] text-slate-400">{perm.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove / Demote Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Remove Administrator Access
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              How would you like to handle <strong className="text-white">{confirmTarget.name}</strong> (
              <span className="font-mono text-amber-300">{confirmTarget.adminId || confirmTarget.email}</span>)?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                disabled={removingAdmin}
                onClick={() => handleRemoveOrDemote(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <UserMinus className="w-4 h-4" />
                <span>Demote to Regular Creator Account</span>
              </button>
              <button
                disabled={removingAdmin}
                onClick={() => handleRemoveOrDemote(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Account</span>
              </button>
              <button
                disabled={removingAdmin}
                onClick={() => setConfirmTarget(null)}
                className="w-full py-2 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
