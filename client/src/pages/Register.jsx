import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle,
  Mail, User, Building2, Phone, Lock, Zap, Shield,
  BarChart3, Users, Star, TrendingUp, Check,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';

/* ─── Password strength ───────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', pct: 0, color: '' };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: '',            pct: 0,   color: 'bg-slate-200' },
    { label: 'Juda zaif',   pct: 20,  color: 'bg-red-400' },
    { label: 'Zaif',        pct: 40,  color: 'bg-orange-400' },
    { label: "O'rtacha",    pct: 60,  color: 'bg-amber-400' },
    { label: 'Kuchli',      pct: 80,  color: 'bg-emerald-400' },
    { label: 'Juda kuchli', pct: 100, color: 'bg-emerald-500' },
  ];
  return { score: s, ...map[s] };
};

/* ─── Minimal field ───────────────────────────────────────────── */
const Field = ({ label, icon: Icon, suffix, className = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
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

/* ─── Benefits data ───────────────────────────────────────────── */
const benefits = [
  { icon: TrendingUp, color: 'text-blue-500',    bg: 'bg-blue-50',    title: '2 ta mashina bepul',         sub: "Umrbot. Oylik to'lov yo'q." },
  { icon: BarChart3,  color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Moliya avtomatik',            sub: 'Daromad, xarajat, foyda.' },
  { icon: Users,      color: 'text-violet-500',  bg: 'bg-violet-50',  title: 'Haydovchi paneli',           sub: "Telefon orqali kiritadi." },
  { icon: Shield,     color: 'text-amber-500',   bg: 'bg-amber-50',   title: 'Xavfsiz va tez',             sub: 'JWT, SSL himoyalangan.' },
];

/* ─── Component ───────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { register, role } = useAuthStore();
  const { addToast } = useUiStore();

  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);   // 1=forward -1=back
  const [visible, setVisible]     = useState(true); // for fade anim
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({
    email: '', fullName: '', companyName: '', phone: '',
    password: '', confirmPassword: '',
  });

  const set_ = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  useEffect(() => {
    if (role === 'business') navigate('/dashboard', { replace: true });
  }, [role]);

  /* Animated step transition */
  const changeStep = (next) => {
    setDirection(next > step ? 1 : -1);
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 160);
  };

  const goStep2 = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("To'g'ri email manzil kiriting");
    if (!form.fullName.trim())
      return setError("To'liq ismingizni kiriting");
    setError('');
    changeStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError("Parol kamida 8 ta belgi bo'lishi kerak");
    if (form.password !== form.confirmPassword) return setError("Parollar mos kelmaydi");
    setLoading(true);
    try {
      await register({
        email: form.email, fullName: form.fullName, password: form.password,
        phone: form.phone || undefined, companyName: form.companyName || undefined,
      });
      addToast("Xush kelibsiz! Akkaunt yaratildi.", 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally { setLoading(false); }
  };

  const str = getStrength(form.password);

  /* Slide direction classes */
  const enterClass  = visible
    ? 'opacity-100 translate-x-0'
    : direction === 1 ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4';

  return (
    <div className="h-screen flex overflow-hidden bg-white">

      {/* ══ LEFT PANEL — oq minimal ═══════════════════════════ */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col h-full px-10 xl:px-14 py-10 overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #0c1a3a 100%)' }}>

        {/* Dot pattern */}
        <div aria-hidden className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
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
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold px-3 py-1 rounded-full mb-4">
            <Zap size={11} className="fill-emerald-300 text-emerald-300" />
            Kredit karta kerak emas
          </div>
          <h1 className="text-2xl xl:text-3xl font-black text-white leading-tight mb-2">
            Transport biznesingizni <br />
            <span className="bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">bepul boshlang</span>
          </h1>
          <p className="text-sm text-blue-200/70 leading-relaxed">
            Haydovchilar, mashinalar va reyslarni bir joyda. Moliya avtomatik ishlaydi.
          </p>
        </div>

        {/* Benefits */}
        <div className="relative space-y-3 mb-8">
          {benefits.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl p-3 hover:bg-white/8 transition-colors">
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
            {['#3b82f6','#10b981','#8b5cf6','#f59e0b'].map((c,i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ background: c }}>
                {['A','D','S','R'][i]}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {[...Array(5)].map((_,i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-[11px] text-blue-200/60">
              <span className="font-semibold text-white">50+</span> kompaniya ishlatmoqda
            </p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            <span className="font-black text-slate-900">Avtojon</span>
          </Link>
          <Link to="/login" className="text-xs font-semibold text-primary-600">Kirish</Link>
        </div>

        {/* Center form */}
        <div className="flex-1 flex items-center justify-center px-5 py-6 overflow-y-auto">
          <div className="w-full max-w-[360px]">

            {/* Desktop: top link */}
            <div className="hidden lg:flex items-center justify-end mb-6">
              <p className="text-sm text-slate-400">
                Akkauntingiz bormi?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">Kirish</Link>
              </p>
            </div>

            {/* Step progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-900">
                  {step === 1 ? "Akkaunt yaratish" : "Parolni o'rnating"}
                </h2>
                <span className="text-xs text-slate-400 font-medium">{step} / 2</span>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3.5 py-2.5 rounded-lg mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Animated form body */}
            <div
              className={`transition-all duration-200 ease-out ${enterClass}`}
              style={{ willChange: 'opacity, transform' }}
            >

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form onSubmit={goStep2} className="space-y-3">

                  {/* Google button (UI only) */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google orqali davom etish
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-medium">yoki email bilan</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <Field label="Email manzil" icon={Mail} type="email"
                    value={form.email} onChange={set_('email')}
                    placeholder="siz@kompaniya.uz" required autoFocus autoComplete="email" />

                  <Field label="To'liq ism" icon={User}
                    value={form.fullName} onChange={set_('fullName')}
                    placeholder="Ism Familiya" required autoComplete="name" />

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Kompaniya" icon={Building2}
                      value={form.companyName} onChange={set_('companyName')}
                      placeholder="Nom (ixtiyoriy)" autoComplete="organization" />
                    <Field label="Telefon" icon={Phone}
                      value={form.phone} onChange={set_('phone')}
                      placeholder="+998 90..." autoComplete="tel" />
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all duration-150 hover:shadow-md mt-1">
                    Davom etish
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={submit} className="space-y-3">

                  {/* Recap */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{form.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{form.email}</p>
                    </div>
                    <button type="button"
                      onClick={() => { changeStep(1); setError(''); }}
                      className="text-xs text-primary-600 font-semibold hover:underline flex-shrink-0">
                      O'zgartirish
                    </button>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">
                      Parol <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={form.password} onChange={set_('password')}
                        placeholder="Kamida 8 ta belgi" required autoFocus autoComplete="new-password"
                        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Strength */}
                    {form.password && (
                      <div className="space-y-1 pt-0.5">
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${str.color}`}
                            style={{ width: `${str.pct}%` }}
                          />
                        </div>
                        <p className={`text-[11px] font-medium ${
                          str.score <= 2 ? 'text-red-400' :
                          str.score === 3 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>{str.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">
                      Tasdiqlang <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={form.confirmPassword} onChange={set_('confirmPassword')}
                        placeholder="Parolni qayta kiriting" required autoComplete="new-password"
                        className={[
                          'w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-300 shadow-sm focus:outline-none focus:ring-2 transition-all',
                          form.confirmPassword
                            ? form.password === form.confirmPassword
                              ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-400'
                              : 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                            : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-400',
                        ].join(' ')}
                      />
                      {form.confirmPassword && (
                        <span className="absolute right-3">
                          {form.password === form.confirmPassword
                            ? <CheckCircle size={14} className="text-emerald-500" />
                            : <div className="w-3.5 h-3.5 rounded-full bg-red-400 flex items-center justify-center">
                                <span className="text-white leading-none" style={{ fontSize: 9 }}>✕</span>
                              </div>
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ro'yxatdan o'tib{' '}
                    <span className="text-slate-500 underline cursor-pointer">foydalanish shartlari</span>
                    {' '}ga rozilik bildirasiz.
                  </p>

                  <div className="flex gap-2 pt-0.5">
                    <button type="button"
                      onClick={() => { changeStep(1); setError(''); }}
                      className="flex items-center gap-1 px-3.5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs rounded-lg transition-all">
                      <ArrowLeft size={13} /> Orqaga
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm transition-all hover:shadow-md">
                      {loading
                        ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg> Yaratilmoqda...</>
                        : <>Akkaunt yaratish <ArrowRight size={15} /></>
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Mobile login link */}
            <p className="lg:hidden text-center text-xs text-slate-400 mt-5">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:underline">Kirish</Link>
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
}
