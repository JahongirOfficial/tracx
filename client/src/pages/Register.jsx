import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle,
  Mail, User, Building2, Phone, Lock, Zap, BarChart3,
  MapPin, Star, Shield, Users,
} from 'lucide-react';
import Input from '../components/ui/Input';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';

/* ─── Password strength ─────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Juda zaif", color: "bg-red-500" };
  if (score === 2) return { score, label: "Zaif",     color: "bg-orange-400" };
  if (score === 3) return { score, label: "O'rtacha", color: "bg-amber-400" };
  if (score === 4) return { score, label: "Kuchli",   color: "bg-emerald-400" };
  return { score, label: "Juda kuchli", color: "bg-emerald-500" };
};

/* ─── Left panel perks ──────────────────────────────────────────── */
const perks = [
  {
    icon: Truck,
    title: "2 ta mashina — umrbot bepul",
    desc: "Hech qanday oylik to'lov yo'q. Boshlash uchun kredit karta ham shart emas.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Moliya avtomatik hisoblanadi",
    desc: "Daromad, xarajat, haydovchi qo'lidagi pul — hammasi real vaqtda.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Haydovchi o'z telefonidan kiradi",
    desc: "Haydovchi alohida login oladi, telefon orqali reys ma'lumotlarini kiritadi.",
    gradient: "from-violet-500 to-purple-500",
  },
];

/* ─── Component ─────────────────────────────────────────────────── */
const Register = () => {
  const navigate  = useNavigate();
  const { register, role } = useAuthStore();
  const { addToast } = useUiStore();

  const [step, setStep]       = useState(1); // 1 = info, 2 = password
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    email: '', fullName: '', companyName: '', phone: '',
    password: '', confirmPassword: '',
  });

  const set_ = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (error) setError('');
  };

  useEffect(() => {
    if (role === 'business') navigate('/dashboard', { replace: true });
  }, [role]);

  /* ── Step 1 validate ── */
  const goToStep2 = (e) => {
    e.preventDefault();
    if (!form.email.trim())    return setError("Email kiriting");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("Email formati noto'g'ri");
    if (!form.fullName.trim()) return setError("To'liq ismingizni kiriting");
    setError('');
    setStep(2);
  };

  /* ── Step 2 submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError("Parol kamida 8 ta belgi bo'lishi kerak");
    if (form.password !== form.confirmPassword) return setError("Parollar mos kelmaydi");
    setLoading(true);
    try {
      await register({
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
      });
      addToast("Xush kelibsiz! Akkaunt muvaffaqiyatli yaratildi.", 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">

      {/* ══════════════════════ LEFT PANEL ══════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-1/2 relative flex-col overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #0c1a3a 100%)' }}>

        {/* Decorative blobs */}
        <div aria-hidden className="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div aria-hidden className="absolute bottom-0 -left-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Grid dots pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex flex-col h-full p-10 xl:p-14">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/40">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">Avtojon</p>
              <p className="text-primary-400 text-xs">Transport boshqaruv tizimi</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-14 mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Zap size={11} className="fill-emerald-300" />
              Kredit karta kerak emas · 30 soniyada tayyor
            </div>
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3">
              Transport biznesingizni{' '}
              <span className="bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
                bepul boshlang
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Haydovchilar, mashinalar va reyslarni bir platformada boshqaring.
              Moliya avtomatik, GPS real vaqtda.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3 mb-10">
            {perks.map(({ icon: Icon, title, desc, gradient }) => (
              <div key={title}
                className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 hover:bg-white/8 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon size={18} className="text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight mb-0.5">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Free plan card */}
          <div className="bg-white/8 border border-white/12 rounded-2xl p-5 mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-sm">Bepul reja</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Hozirdan faol
              </span>
            </div>
            <div className="space-y-2">
              {[
                "2 ta mashina — 0 so'm",
                "Cheksiz haydovchilar",
                "Cheksiz reyslar va hisobotlar",
                "GPS va moliya paneli",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-5">
            <div className="flex -space-x-2">
              {['A','S','D','R'].map((l, i) => (
                <div key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: ['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_,i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-400 text-xs">
                <span className="text-white font-semibold">50+</span> kompaniya ishlatmoqda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════ RIGHT PANEL ══════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <span className="font-black text-slate-900 dark:text-white">Avtojon</span>
          </div>
          <Link to="/login" className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
            Kirish
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-5 overflow-y-auto">
          <div className="w-full max-w-md py-6">

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-3 flex-1">
                  <div className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300',
                    step > s
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : step === s
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500',
                  ].join(' ')}>
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold leading-none mb-0.5 ${step >= s ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {s === 1 ? "Shaxsiy ma'lumotlar" : "Parol"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {s === 1 ? "Email va ismingiz" : "Xavfsiz parol"}
                    </p>
                  </div>
                  {s < 2 && (
                    <div className={`h-0.5 w-10 rounded-full transition-all duration-500 ${step > s ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">

              {/* Card top accent */}
              <div className="h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-cyan-500" />

              <div className="p-7 sm:p-8">

                {/* Heading */}
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {step === 1 ? "Akkaunt yaratish" : "Parolni belgilang"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {step === 1
                      ? "2 ta mashinagacha umrbot bepul ishlatishingiz mumkin"
                      : "Kuchli parol akkauntingizni himoyalaydi"
                    }
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <form onSubmit={goToStep2} className="space-y-4">
                    <Input
                      label="Email manzil"
                      type="email"
                      leftIcon={Mail}
                      value={form.email}
                      onChange={set_('email')}
                      placeholder="siz@kompaniya.uz"
                      required
                      autoFocus
                      autoComplete="email"
                    />

                    <Input
                      label="To'liq ism"
                      leftIcon={User}
                      value={form.fullName}
                      onChange={set_('fullName')}
                      placeholder="Ism Familiya"
                      required
                      autoComplete="name"
                    />

                    <Input
                      label="Kompaniya nomi"
                      leftIcon={Building2}
                      value={form.companyName}
                      onChange={set_('companyName')}
                      placeholder="Kompaniya LLC (ixtiyoriy)"
                      autoComplete="organization"
                      helper="Ixtiyoriy — keyinchalik ham qo'shish mumkin"
                    />

                    <Input
                      label="Telefon raqam"
                      leftIcon={Phone}
                      value={form.phone}
                      onChange={set_('phone')}
                      placeholder="+998 90 000 00 00 (ixtiyoriy)"
                      autoComplete="tel"
                      helper="Ixtiyoriy"
                    />

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-150 hover:scale-[1.01] mt-2"
                    >
                      Davom etish
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Recap */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{form.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{form.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); }}
                        className="ml-auto text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex-shrink-0"
                      >
                        O'zgartirish
                      </button>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                        Parol <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={form.password}
                          onChange={set_('password')}
                          placeholder="Kamida 8 ta belgi"
                          required
                          autoFocus
                          autoComplete="new-password"
                          className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 shadow-sm transition-all duration-150"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {form.password && (
                        <div className="pt-1">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${
                            strength.score <= 2 ? 'text-red-500' :
                            strength.score === 3 ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                            {strength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                        Parolni tasdiqlang <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={set_('confirmPassword')}
                          placeholder="Parolni qayta kiriting"
                          required
                          autoComplete="new-password"
                          className={[
                            "w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 shadow-sm transition-all duration-150",
                            form.confirmPassword && form.password !== form.confirmPassword
                              ? "border-red-400 focus:ring-red-500/30 focus:border-red-500"
                              : form.confirmPassword && form.password === form.confirmPassword
                                ? "border-emerald-400 focus:ring-emerald-500/30 focus:border-emerald-500"
                                : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/30 focus:border-primary-500",
                          ].join(' ')}
                        />
                        {form.confirmPassword && (
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {form.password === form.confirmPassword
                              ? <CheckCircle size={16} className="text-emerald-500" />
                              : <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center">
                                  <span className="text-white text-[10px] font-bold">✕</span>
                                </div>
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
                      Ro'yxatdan o'tib siz{' '}
                      <span className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                        foydalanish shartlari
                      </span>
                      {' '}va{' '}
                      <span className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                        maxfiylik siyosati
                      </span>
                      ga rozilik bildirasiz.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); }}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm rounded-xl transition-all"
                      >
                        <ArrowLeft size={15} />
                        Orqaga
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-150 hover:scale-[1.01]"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Yaratilmoqda...
                          </>
                        ) : (
                          <>
                            Akkaunt yaratish
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

            {/* Login link */}
            <div className="text-center mt-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hisobingiz bor?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  Tizimga kiring
                </Link>
              </p>
            </div>

            {/* Mobile perks */}
            <div className="lg:hidden mt-6 grid grid-cols-1 gap-3">
              {[
                { icon: CheckCircle, text: "2 ta mashina umrbot bepul", color: "text-emerald-500" },
                { icon: Shield,      text: "Xavfsiz JWT autentifikatsiya", color: "text-blue-500" },
                { icon: Zap,         text: "30 soniyada boshlang",         color: "text-amber-500" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                  <Icon size={15} className={`${color} flex-shrink-0`} />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 text-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-400">© 2026 Avtojon · Transport boshqaruv tizimi</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
