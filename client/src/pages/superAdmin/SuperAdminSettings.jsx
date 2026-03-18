import { useState } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

const SuperAdminSettings = () => {
  const { addToast } = useUiStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return addToast('Yangi parollar mos kelmaydi', 'error');
    }
    if (form.newPassword.length < 8) {
      return addToast("Parol kamida 8 ta belgi bo'lishi kerak", 'error');
    }
    setLoading(true);
    try {
      await api.put('/super-admin/settings/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      addToast('Parol muvaffaqiyatli yangilandi', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.message || 'Xato yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sozlamalar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Hisob sozlamalari va xavfsizlik</p>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.username}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck size={13} className="text-primary-500" />
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password change card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <KeyRound size={15} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Parolni o'zgartirish</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div className="relative">
            <Input
              label="Joriy parol"
              type={showCurrent ? 'text' : 'password'}
              required
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New password */}
            <div className="relative">
              <Input
                label="Yangi parol"
                type={showNew ? 'text' : 'password'}
                required
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Confirm password */}
            <Input
              label="Parolni tasdiqlang"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          {/* Strength hint */}
          {form.newPassword.length > 0 && (
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => {
                const strength = Math.min(4, Math.floor(form.newPassword.length / 3));
                return (
                  <div
                    key={i}
                    className={[
                      'h-1 flex-1 rounded-full transition-colors',
                      i < strength
                        ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : strength <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700',
                    ].join(' ')}
                  />
                );
              })}
              <span className="text-[10px] text-slate-400 ml-2 self-center">
                {form.newPassword.length < 4 ? 'Juda zaif' : form.newPassword.length < 8 ? 'Zaif' : form.newPassword.length < 12 ? 'Yaxshi' : 'Kuchli'}
              </span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={loading} icon={KeyRound}>
              Parolni saqlash
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
