import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Truck, Eye, EyeOff, ArrowRight, Shield, Zap,
  BarChart3, Users, TrendingUp, Star, Mail, Lock,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';

/* ─── Benefits (left panel) ──────────────────────────────────── */
const benefits = [
  { icon: TrendingUp, title: 'Reyslar boshqaruvi',  sub: "Har bir reys to'liq moliyaviy hisob." },
  { icon: BarChart3,  title: 'Moliya avtomatik',     sub: 'Daromad, xarajat, foyda real vaqtda.' },
  { icon: Users,      title: 'Haydovchi paneli',     sub: "Telefon orqali xarajat kiritadi." },
  { icon: Shield,     title: 'Xavfsiz tizim',        sub: 'JWT, SSL himoyalangan.' },
];

/* ─── Minimal input field ─────────────────────────────────────── */
const Field = ({ label, icon: Icon, suffix, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-slate-500">{label}</label>}
    <div className="relative flex items-center">
      {Icon && <Icon size={14} className="absolute left-3 text-slate-400 pointer-events-none z-10" />}
      <input
        {...props}
        className={[
          'w-full py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900',
          'placeholder-slate-300 shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400',
          'transition-all duration-150',
          Icon ? 'pl-9' : 'pl-3',
          suffix ? 'pr-9' : 'pr-3',
        ].join(' ')}
      />
      {suffix && <span className="absolute right-3 z-10">{suffix}</span>}
    </div>
  </div>
);

/* ─── Component ───────────────────────────────────────────────── */
const Login = () => {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState('');
  const { login, googleLogin, role } = useAuthStore();
  const { addToast }            = useUiStore();
  const navigate                = useNavigate();

  const set_ = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        const userRole = await googleLogin(tokenResponse.access_token);
        if (userRole === 'business')         navigate('/dashboard');
        else if (userRole === 'driver')      navigate('/driver');
        else if (userRole === 'super_admin') navigate('/super-admin');
      } catch (err) {
        setError(err.message || "Google orqali kirishda xatolik yuz berdi.");
      } finally { setGLoading(false); }
    },
    onError: () => setError("Google orqali kirishda xatolik yuz berdi."),
  });

  useEffect(() => {
    if (role === 'business')    navigate('/dashboard',   { replace: true });
    else if (role === 'driver') navigate('/driver',      { replace: true });
    else if (role === 'super_admin') navigate('/super-admin', { replace: true });
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userRole = await login(form.username, form.password);
      if (userRole === 'business')    navigate('/dashboard');
      else if (userRole === 'driver') navigate('/driver');
      else if (userRole === 'super_admin') navigate('/super-admin');
    } catch (err) {
      setError(err.message || "Foydalanuvchi nomi yoki parol noto'g'ri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">

      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col h-full px-10 xl:px-14 py-10 overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #0c1a3a 100%)' }}
      >
        {/* Dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div aria-hidden className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 -left-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 mb-10 group w-fit">
          <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Truck size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">Avtojon</span>
        </Link>

        {/* Headline */}
        <div className="relative mb-8">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] font-semibold px-3 py-1 rounded-full mb-4">
            <Zap size={11} className="fill-blue-300 text-blue-300" />
            Transport boshqaruv tizimi
          </div>
          <h1 className="text-2xl xl:text-3xl font-black text-white leading-tight mb-2">
            Xush kelibsiz! <br />
            <span className="bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
              Hisobingizga kiring
            </span>
          </h1>
          <p className="text-sm text-blue-200/70 leading-relaxed">
            Haydovchilar, mashinalar va reyslarni bir joyda. Moliya avtomatik ishlaydi.
          </p>
        </div>

        {/* Benefits */}
        <div className="relative space-y-3 mb-8">
          {benefits.map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl p-3 hover:bg-white/8 transition-colors"
            >
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-white/80" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                <p className="text-xs text-blue-200/60">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="relative mt-auto flex items-center gap-3 pt-4 border-t border-white/10">
          <div className="flex -space-x-2">
            {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ background: c }}
              >
                {['A', 'D', 'S', 'R'][i]}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[11px] text-blue-200/60">
              <span className="font-semibold text-white">50+</span> kompaniya ishlatmoqda
            </p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            <span className="font-black text-slate-900">Avtojon</span>
          </Link>
          <Link to="/register" className="text-xs font-semibold text-primary-600">
            Ro'yxatdan o'tish
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-6 overflow-y-auto">
          <div className="w-full max-w-[360px]">

            {/* Desktop: top link */}
            <div className="hidden lg:flex items-center justify-end mb-6">
              <p className="text-sm text-slate-400">
                Hisobingiz yo'qmi?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:underline">
                  Ro'yxatdan o'tish
                </Link>
              </p>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-900 mb-1">Tizimga kirish</h2>
              <p className="text-sm text-slate-400">Login va parolingizni kiriting</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3.5 py-2.5 rounded-lg mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field
                label="Foydalanuvchi nomi"
                icon={Mail}
                value={form.username}
                onChange={set_('username')}
                placeholder="username yoki email"
                required
                autoFocus
                autoComplete="username"
              />
              <Field
                label="Parol"
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set_('password')}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPass ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm transition-all duration-150 hover:shadow-md mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Kirilmoqda...
                  </>
                ) : (
                  <> Kirish <ArrowRight size={15} /> </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">yoki</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={gLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all duration-150 shadow-sm"
            >
              {gLoading ? (
                <svg className="animate-spin w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google orqali kirish
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {[
                { icon: Shield, label: 'Xavfsiz kirish' },
                { icon: Zap,    label: 'Tez va oson' },
                { icon: Users,  label: '50+ kompaniya' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Icon size={14} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-slate-400 mt-4">
              Hisobingiz yo'qmi?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:underline">
                Bepul boshlash
              </Link>
            </p>

          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-300">© 2026 Avtojon · Transport boshqaruv tizimi</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
