import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle,
  User, Building2, Phone, Lock, Zap, Shield,
  BarChart3, Users, Star, TrendingUp, MessageSquare, RefreshCw,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';
import api from '../services/api';

/* ─── Password strength ─────────────────────────────────────── */
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

/* ─── Field ─────────────────────────────────────────────────── */
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

/* ─── Benefits ───────────────────────────────────────────────── */
const benefits = [
  { icon: TrendingUp, title: '2 ta mashina bepul',   sub: "Umrbot. Oylik to'lov yo'q." },
  { icon: BarChart3,  title: 'Moliya avtomatik',      sub: 'Daromad, xarajat, foyda.' },
  { icon: Users,      title: 'Haydovchi paneli',      sub: "Telefon orqali kiritadi." },
  { icon: Shield,     title: 'Xavfsiz va tez',        sub: 'JWT, SSL himoyalangan.' },
];

/* ─── OTP digit input ──────────────────────────────────────── */
const OtpInput = ({ value, onChange }) => {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => idx === i ? '' : d).join('');
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, idx) => idx === i ? char : d).join('');
    onChange(next);
    if (char && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(text.padEnd(6, '').slice(0, 6));
    const focusIdx = Math.min(text.length, 5);
    refs[focusIdx].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          autoFocus={i === 0}
          className={[
            'w-11 h-12 text-center text-lg font-bold rounded-lg border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400',
            'transition-all duration-150',
            d ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-900',
          ].join(' ')}
        />
      ))}
    </div>
  );
};

/* ─── Countdown timer hook ─────────────────────────────────── */
const useCountdown = (initial = 60) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const start = (s = initial) => {
    setSeconds(s);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);
  return { seconds, start };
};

/* ─── Component ─────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { googleLogin, role } = useAuthStore();
  const { addToast } = useUiStore();

  const [step, setStep]         = useState(1);   // 1=phone, 2=otp, 3=details
  const [visible, setVisible]   = useState(true);
  const [direction, setDir]     = useState(1);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState('');

  const [phone, setPhone]       = useState('+998 ');
  const [otp, setOtp]           = useState('');
  const [verified, setVerified] = useState(false);
  const [form, setForm]         = useState({ fullName: '', companyName: '', password: '', confirmPassword: '' });

  const { seconds, start: startCountdown } = useCountdown(60);

  useEffect(() => {
    if (role === 'business') navigate('/dashboard', { replace: true });
  }, [role]);

  const set_ = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        await googleLogin(tokenResponse.access_token);
        addToast("Google orqali muvaffaqiyatli kirdingiz!", 'success');
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || "Google orqali kirishda xatolik.");
      } finally { setGLoading(false); }
    },
    onError: () => setError("Google orqali kirishda xatolik."),
  });

  const changeStep = (next) => {
    setDir(next > step ? 1 : -1);
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 160);
  };

  /* Normalize phone */
  const normalizePhone = (p) => {
    const d = p.replace(/\D/g, '');
    return d.startsWith('998') ? d : `998${d}`;
  };

  /* Format phone as: +998 XX XXX XX XX */
  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    // always keep 998 prefix
    const local = digits.startsWith('998') ? digits.slice(3) : digits;
    let result = '+998';
    if (local.length > 0) result += ' ' + local.slice(0, 2);
    if (local.length > 2) result += ' ' + local.slice(2, 5);
    if (local.length > 5) result += ' ' + local.slice(5, 7);
    if (local.length > 7) result += ' ' + local.slice(7, 9);
    return result;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    // Don't allow deleting the +998 prefix
    if (!raw.startsWith('+')) { setPhone('+998 '); return; }
    setPhone(formatPhone(raw));
    setError('');
  };

  /* ── Step 1 → send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    const localDigits = digits.startsWith('998') ? digits.slice(3) : digits;
    if (localDigits.length < 9) return setError("To'liq telefon raqam kiriting (9 ta raqam)");
    setLoading(true); setError('');
    try {
      await api.post('/auth/otp/send', { phone: normalizePhone(phone) });
      startCountdown(60);
      setOtp('');
      changeStep(2);
    } catch (err) {
      setError(err.message || 'SMS yuborishda xato');
    } finally { setLoading(false); }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (seconds > 0) return;
    setLoading(true); setError('');
    try {
      await api.post('/auth/otp/send', { phone: normalizePhone(phone) });
      startCountdown(60);
      setOtp('');
      addToast('SMS qayta yuborildi', 'success');
    } catch (err) {
      setError(err.message || 'SMS yuborishda xato');
    } finally { setLoading(false); }
  };

  /* ── Step 2 → verify OTP ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\D/g, '').length < 6) return setError("6 ta raqam kiriting");
    setLoading(true); setError('');
    try {
      await api.post('/auth/otp/verify', { phone: normalizePhone(phone), code: otp });
      setVerified(true);
      changeStep(3);
    } catch (err) {
      setError(err.message || "Kod noto'g'ri");
    } finally { setLoading(false); }
  };

  /* ── Step 3 → register ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setError("To'liq ismingizni kiriting");
    if (form.password.length < 8) return setError("Parol kamida 8 ta belgi bo'lishi kerak");
    if (form.password !== form.confirmPassword) return setError("Parollar mos kelmaydi");
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register/phone', {
        phone: normalizePhone(phone),
        password: form.password,
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim() || undefined,
      });
      // Store tokens and user manually
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Trigger auth store init
      const { initAuth } = useAuthStore.getState();
      await initAuth();
      addToast("Xush kelibsiz! Akkaunt yaratildi.", 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally { setLoading(false); }
  };

  const str = getStrength(form.password);
  const enterClass = visible
    ? 'opacity-100 translate-x-0'
    : direction === 1 ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4';

  const stepTitles = ['Telefon raqam', 'SMS kodni tasdiqlang', "Ma'lumotlarni kiriting"];
  const stepPcts   = ['33%', '66%', '100%'];

  return (
    <div className="h-screen flex overflow-hidden bg-white">

      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col h-full px-10 xl:px-14 py-10 overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #0c1a3a 100%)' }}>

        <div aria-hidden className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div aria-hidden className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 -left-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="relative flex items-center gap-2.5 mb-10 group w-fit">
          <img src="/icon.png" alt="Avtojon" className="w-9 h-9 object-contain" />
          <span className="text-xl font-black text-white tracking-tight">Avtojon</span>
        </Link>

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

        <div className="relative space-y-3 mb-8">
          {benefits.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 bg-white/5 border border-white/[0.08] rounded-xl p-3 hover:bg-white/[0.08] transition-colors">
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

      {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.png" alt="Avtojon" className="w-7 h-7 object-contain" />
            <span className="font-black text-slate-900">Avtojon</span>
          </Link>
          <Link to="/login" className="text-xs font-semibold text-primary-600">Kirish</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-6 overflow-y-auto">
          <div className="w-full max-w-[360px]">

            <div className="hidden lg:flex items-center justify-end mb-6">
              <p className="text-sm text-slate-400">
                Akkauntingiz bormi?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">Kirish</Link>
              </p>
            </div>

            {/* Step progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-900">{stepTitles[step - 1]}</h2>
                <span className="text-xs text-slate-400 font-medium">{step} / 3</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: stepPcts[step - 1] }} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3.5 py-2.5 rounded-lg mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className={`transition-all duration-200 ease-out ${enterClass}`} style={{ willChange: 'opacity, transform' }}>

              {/* ── STEP 1: Phone ── */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-3">

                  {/* Google */}
                  <button type="button" onClick={() => handleGoogleLogin()} disabled={gLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all shadow-sm">
                    {gLoading
                      ? <svg className="animate-spin w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    }
                    Google orqali davom etish
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-medium">yoki telefon bilan</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <Field
                    label="Telefon raqam"
                    icon={Phone}
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+998 90 123 45 67"
                    required
                    autoFocus
                    autoComplete="tel"
                    maxLength={17}
                  />

                  <p className="text-[11px] text-slate-400">
                    Ushbu raqamga 6 xonali tasdiqlash kodi yuboriladi.
                  </p>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm transition-all hover:shadow-md">
                    {loading
                      ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg> Yuborilmoqda...</>
                      : <>Ro'yhatdan o'tish <ArrowRight size={15} /></>
                    }
                  </button>
                </form>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">

                  {/* Phone recap */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone size={14} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">+{normalizePhone(phone)}</p>
                      <p className="text-xs text-slate-400">Ushbu raqamga SMS yuborildi</p>
                    </div>
                    <button type="button" onClick={() => { changeStep(1); setError(''); setOtp(''); }}
                      className="text-xs text-primary-600 font-semibold hover:underline flex-shrink-0">
                      O'zgartirish
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-center text-slate-500">6 ta raqamli kodni kiriting</p>
                    <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(''); }} />
                  </div>

                  {/* Resend */}
                  <div className="flex items-center justify-center gap-2">
                    {seconds > 0 ? (
                      <p className="text-xs text-slate-400">
                        Qayta yuborish: <span className="font-semibold text-slate-600">{seconds}s</span>
                      </p>
                    ) : (
                      <button type="button" onClick={handleResend} disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline disabled:opacity-50">
                        <RefreshCw size={12} /> SMS qayta yuborish
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => { changeStep(1); setError(''); setOtp(''); }}
                      className="flex items-center gap-1 px-3.5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs rounded-lg transition-all">
                      <ArrowLeft size={13} /> Orqaga
                    </button>
                    <button type="submit" disabled={loading || otp.replace(/\D/g,'').length < 6}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm transition-all hover:shadow-md">
                      {loading
                        ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg> Tekshirilmoqda...</>
                        : <>Tasdiqlash <ArrowRight size={15} /></>
                      }
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: Details ── */}
              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-3">

                  {/* Verified badge */}
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                    <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-emerald-700">
                      +{normalizePhone(phone)} tasdiqlandi
                    </p>
                  </div>

                  <Field label="To'liq ism *" icon={User}
                    value={form.fullName} onChange={set_('fullName')}
                    placeholder="Ism Familiya" required autoFocus autoComplete="name" />

                  <Field label="Kompaniya nomi" icon={Building2}
                    value={form.companyName} onChange={set_('companyName')}
                    placeholder="Kompaniya LLC (ixtiyoriy)" autoComplete="organization" />

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Parol *</label>
                    <div className="relative flex items-center">
                      <Lock size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={form.password} onChange={set_('password')}
                        placeholder="Kamida 8 ta belgi" required autoComplete="new-password"
                        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="space-y-1 pt-0.5">
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${str.color}`} style={{ width: `${str.pct}%` }} />
                        </div>
                        <p className={`text-[11px] font-medium ${str.score <= 2 ? 'text-red-400' : str.score === 3 ? 'text-amber-500' : 'text-emerald-500'}`}>{str.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Parolni tasdiqlang *</label>
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
                    <button type="button" onClick={() => { changeStep(2); setError(''); }}
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

            <p className="lg:hidden text-center text-xs text-slate-400 mt-5">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:underline">Kirish</Link>
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-300">© 2026 Avtojon · Transport boshqaruv tizimi</p>
        </div>
      </div>
    </div>
  );
}
