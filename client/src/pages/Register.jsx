import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle,
  Mail, User, Building2, Phone, Lock, Zap, Shield, Star,
  BarChart3, Users,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';

/* ─── Password strength ─────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Juda zaif',    color: 'bg-red-500' };
  if (s === 2) return { score: s, label: 'Zaif',        color: 'bg-orange-400' };
  if (s === 3) return { score: s, label: "O'rtacha",    color: 'bg-amber-400' };
  if (s === 4) return { score: s, label: 'Kuchli',      color: 'bg-emerald-400' };
  return              { score: s, label: 'Juda kuchli', color: 'bg-emerald-500' };
};

/* ─── Compact text input ────────────────────────────────────────── */
const Field = ({ label, icon: Icon, right, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
    )}
    <div className="relative flex items-center">
      {Icon && <Icon size={14} className="absolute left-3 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={[
          'w-full py-2 text-sm rounded-lg border shadow-sm transition-all duration-150 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
          'focus:outline-none focus:ring-2',
          Icon ? 'pl-8' : 'pl-3',
          right ? 'pr-9' : 'pr-3',
          error
            ? 'border-red-400 focus:ring-red-500/25 focus:border-red-500'
            : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/25 focus:border-primary-500',
        ].join(' ')}
      />
      {right && <span className="absolute right-3">{right}</span>}
    </div>
  </div>
);

/* ─── Component ─────────────────────────────────────────────────── */
const Register = () => {
  const navigate = useNavigate();
  const { register, role } = useAuthStore();
  const { addToast } = useUiStore();

  const [step, setStep]       = useState(1);
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    email: '', fullName: '', companyName: '', phone: '',
    password: '', confirmPassword: '',
  });

  const set_ = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  useEffect(() => {
    if (role === 'business') navigate('/dashboard', { replace: true });
  }, [role]);

  const goStep2 = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("To'g'ri email kiriting");
    if (!form.fullName.trim()) return setError("Ismingizni kiriting");
    setError(''); setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError("Parol kamida 8 ta belgi");
    if (form.password !== form.confirmPassword) return setError("Parollar mos kelmaydi");
    setLoading(true);
    try {
      await register({
        email: form.email, fullName: form.fullName, password: form.password,
        phone: form.phone || undefined, companyName: form.companyName || undefined,
      });
      addToast("Xush kelibsiz!", 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi");
    } finally { setLoading(false); }
  };

  const str = getStrength(form.password);

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-slate-950">

      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col h-full relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e3a8a 60%,#0c1a3a 100%)' }}
      >
        <div aria-hidden className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 -left-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col h-full px-10 py-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/40">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-base leading-none">Avtojon</p>
              <p className="text-primary-400 text-[10px]">Transport boshqaruv tizimi</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wide">
              <Zap size={10} className="fill-emerald-300" />
              Kredit karta kerak emas
            </div>
            <h1 className="text-2xl xl:text-3xl font-black text-white leading-tight mb-2">
              Transport biznesingizni{' '}
              <span className="bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
                bepul boshlang
              </span>
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Haydovchilar, mashinalar va reyslarni bir platformada boshqaring.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-2.5 mb-6">
            {[
              { icon: Truck,    g: 'from-blue-500 to-cyan-500',    t: '2 ta mashina — umrbot bepul',      d: "Oylik to'lov yo'q, kredit karta shart emas" },
              { icon: BarChart3,g: 'from-emerald-500 to-teal-500', t: 'Moliya avtomatik hisoblanadi',      d: 'Daromad, xarajat, foyda — real vaqtda' },
              { icon: Users,    g: 'from-violet-500 to-purple-500',t: 'Haydovchi o\'z telefonidan kiradi', d: 'Alohida login, telefon orqali kiritadi' },
            ].map(({ icon: Icon, g, t, d }) => (
              <div key={t} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl p-3 hover:bg-white/8 transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon size={15} className="text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-white font-semibold text-xs leading-tight mb-0.5">{t}</p>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Free plan */}
          <div className="bg-white/8 border border-white/12 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-white font-bold text-xs">Bepul reja</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Faol</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {['2 ta mashina — 0 so\'m', 'Cheksiz haydovchilar', 'Cheksiz reyslar', 'GPS va moliya paneli'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-auto border-t border-white/10 pt-4">
            <div className="flex -space-x-1.5">
              {['A','S','D','R'].map((l,i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: ['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i] }}>
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_,i) => <Star key={i} size={9} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-400 text-[10px]">
                <span className="text-white font-semibold">50+</span> kompaniya ishlatmoqda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            <span className="font-black text-sm text-slate-900 dark:text-white">Avtojon</span>
          </div>
          <Link to="/login" className="text-xs text-primary-600 dark:text-primary-400 font-semibold">Kirish</Link>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              {[1,2].map((s,i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300',
                    step > s  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : step===s ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500',
                  ].join(' ')}>
                    {step > s ? <CheckCircle size={13}/> : s}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold truncate ${step>=s?'text-slate-900 dark:text-white':'text-slate-400'}`}>
                      {s===1 ? "Ma'lumotlar" : "Parol"}
                    </p>
                  </div>
                  {i < 1 && (
                    <div className={`h-0.5 w-8 rounded-full mx-1 transition-all duration-500 ${step>s?'bg-emerald-400':'bg-slate-200 dark:bg-slate-700'}`}/>
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-primary-500 via-blue-500 to-cyan-500" />

              <div className="p-5">
                {/* Heading */}
                <div className="mb-4">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {step===1 ? "Akkaunt yaratish" : "Parolni belgilang"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {step===1 ? "2 ta mashinagacha umrbot bepul" : "Kuchli parol akkauntingizni himoyalaydi"}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs px-3 py-2 rounded-lg mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
                    {error}
                  </div>
                )}

                {/* ── STEP 1 ── */}
                {step===1 && (
                  <form onSubmit={goStep2} className="space-y-3">
                    <Field label="Email" icon={Mail} type="email" value={form.email}
                      onChange={set_('email')} placeholder="siz@kompaniya.uz" required autoFocus autoComplete="email"/>

                    <Field label="To'liq ism" icon={User} value={form.fullName}
                      onChange={set_('fullName')} placeholder="Ism Familiya" required autoComplete="name"/>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Kompaniya" icon={Building2} value={form.companyName}
                        onChange={set_('companyName')} placeholder="Nom (ixtiyoriy)" autoComplete="organization"/>
                      <Field label="Telefon" icon={Phone} value={form.phone}
                        onChange={set_('phone')} placeholder="+998 90..." autoComplete="tel"/>
                    </div>

                    <button type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all hover:scale-[1.01] mt-1">
                      Davom etish <ArrowRight size={15}/>
                    </button>
                  </form>
                )}

                {/* ── STEP 2 ── */}
                {step===2 && (
                  <form onSubmit={submit} className="space-y-3">
                    {/* Recap */}
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                      <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-primary-600 dark:text-primary-400"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{form.fullName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{form.email}</p>
                      </div>
                      <button type="button" onClick={()=>{setStep(1);setError('');}}
                        className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold hover:underline flex-shrink-0">
                        O'zgartirish
                      </button>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Parol <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={14} className="absolute left-3 text-slate-400 pointer-events-none"/>
                        <input
                          type={showPw?'text':'password'} value={form.password} onChange={set_('password')}
                          placeholder="Kamida 8 ta belgi" required autoFocus autoComplete="new-password"
                          className="w-full pl-8 pr-9 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 shadow-sm transition-all"
                        />
                        <button type="button" onClick={()=>setShowPw(!showPw)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
                        </button>
                      </div>
                      {form.password && (
                        <div className="pt-0.5">
                          <div className="flex gap-1 mb-0.5">
                            {[1,2,3,4,5].map(i=>(
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i<=str.score?str.color:'bg-slate-200 dark:bg-slate-700'}`}/>
                            ))}
                          </div>
                          <p className={`text-[10px] font-medium ${str.score<=2?'text-red-500':str.score===3?'text-amber-500':'text-emerald-500'}`}>
                            {str.label}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Tasdiqlang <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={14} className="absolute left-3 text-slate-400 pointer-events-none"/>
                        <input
                          type={showPw?'text':'password'} value={form.confirmPassword} onChange={set_('confirmPassword')}
                          placeholder="Parolni qayta kiriting" required autoComplete="new-password"
                          className={[
                            'w-full pl-8 pr-9 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm transition-all',
                            form.confirmPassword && form.password!==form.confirmPassword
                              ? 'border-red-400 focus:ring-red-500/25 focus:border-red-500'
                              : form.confirmPassword && form.password===form.confirmPassword
                                ? 'border-emerald-400 focus:ring-emerald-500/25 focus:border-emerald-500'
                                : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/25 focus:border-primary-500',
                          ].join(' ')}
                        />
                        {form.confirmPassword && (
                          <span className="absolute right-3">
                            {form.password===form.confirmPassword
                              ? <CheckCircle size={14} className="text-emerald-500"/>
                              : <div className="w-3.5 h-3.5 rounded-full bg-red-400 flex items-center justify-center">
                                  <span className="text-white text-[9px] font-bold leading-none">✕</span>
                                </div>
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Ro'yxatdan o'tib{' '}
                      <span className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">foydalanish shartlari</span>
                      {' '}ga rozilik bildirasiz.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button type="button" onClick={()=>{setStep(1);setError('');}}
                        className="flex items-center justify-center gap-1 px-3 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs rounded-xl transition-all">
                        <ArrowLeft size={14}/> Orqaga
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-bold text-sm rounded-xl shadow-md shadow-primary-500/25 transition-all hover:scale-[1.01]">
                        {loading ? (
                          <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg> Yaratilmoqda...</>
                        ) : (<>Akkaunt yaratish <ArrowRight size={15}/></>)}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Login link */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
              Hisobingiz bor?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Tizimga kiring
              </Link>
            </p>

            {/* Mobile perks */}
            <div className="lg:hidden flex gap-2 mt-3 flex-wrap justify-center">
              {[
                { icon: CheckCircle, t: '2 mashina bepul', c: 'text-emerald-500' },
                { icon: Shield,      t: 'Xavfsiz',         c: 'text-blue-500' },
                { icon: Zap,         t: '30 soniyada',     c: 'text-amber-500' },
              ].map(({ icon: Icon, t, c }) => (
                <div key={t} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                  <Icon size={12} className={`${c} flex-shrink-0`}/>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 text-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <p className="text-[10px] text-slate-400">© 2026 Avtojon · Transport boshqaruv tizimi</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
