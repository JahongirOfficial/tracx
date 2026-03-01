import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, ArrowRight, Shield, Zap } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';

/* ─── Brand features shown on the left panel ─────────────────── */
const brandPoints = [
  { icon: Truck, text: "Reyslarni real vaqtda boshqaring" },
  { icon: Zap, text: "Moliyaviy hisob avtomatik ishlaydi" },
  { icon: Shield, text: "Xavfsiz JWT autentifikatsiya" },
];

/* ─── Component ────────────────────────────────────────────────── */
const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, role } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  /* Redirect if already logged in */
  useEffect(() => {
    if (role === 'business') navigate('/dashboard', { replace: true });
    else if (role === 'driver') navigate('/driver', { replace: true });
    else if (role === 'super_admin') navigate('/super-admin', { replace: true });
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userRole = await login(form.username, form.password);
      if (userRole === 'business') navigate('/dashboard');
      else if (userRole === 'driver') navigate('/driver');
      else if (userRole === 'super_admin') navigate('/super-admin');
    } catch (err) {
      setError(err.message || 'Kirish amalga oshmadi. Foydalanuvchi nomi yoki parol noto\'g\'ri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding (hidden on mobile) ────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-12 flex-col justify-between overflow-hidden">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xl font-bold leading-none">Avtojon</p>
            <p className="text-primary-400 text-xs mt-0.5">Transport boshqaruv tizimi</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Transport biznesingizni{' '}
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              aqlli boshqaring
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Haydovchilar, mashinalar va reyslarni bir platformada boshqaring.
          </p>

          {/* Feature points */}
          <ul className="space-y-4">
            {brandPoints.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/20 border border-primary-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-primary-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">© 2026 Tracx. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-5 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo (shown only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
              <Truck size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Avtojon</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Transport boshqaruv tizimi</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/60 p-8">
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Xush kelibsiz</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Akkauntingizga kirish uchun ma'lumotlaringizni kiriting
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800/60 text-danger-700 dark:text-danger-400 text-sm px-4 py-3.5 rounded-xl mb-5">
                <div className="w-4 h-4 rounded-full bg-danger-500 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <Input
                label="Foydalanuvchi nomi"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="username"
                required
                autoFocus
                autoComplete="username"
              />

              {/* Password with show/hide toggle */}
              <div className="relative">
                <Input
                  label="Parol"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 transition-colors"
                  aria-label={showPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
                icon={ArrowRight}
                className="mt-1"
              >
                Tizimga kirish
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400">yoki</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Contact note */}
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hisobingiz yo'qmi?{' '}
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  SuperAdmin bilan bog'laning
                </span>
              </p>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-5">
            Kirish orqali siz{' '}
            <span className="text-slate-500 dark:text-slate-500">foydalanish shartlarimizga</span>{' '}
            rozilik bildirasiz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
