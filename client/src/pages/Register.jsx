import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Eye, EyeOff, ArrowRight, Shield, Zap, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';

const perks = [
  { icon: CheckCircle, text: "2 ta mashinagacha umrbot BEPUL" },
  { icon: Zap, text: "Reyslar va haydovchilarni boshqaring" },
  { icon: Shield, text: "3-mashina va undan keyin 50,000 UZS" },
];

const Register = () => {
  const [form, setForm] = useState({
    email: '', fullName: '', password: '', confirmPassword: '',
    phone: '', companyName: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, role } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'business') navigate('/dashboard', { replace: true });
  }, [role]);

  const set_ = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError("Parollar mos kelmaydi");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
      });
      addToast("Muvaffaqiyatli ro'yxatdan o'tdingiz!", 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-12 flex-col justify-between overflow-hidden">
        <div aria-hidden className="absolute top-0 right-0 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
        <div aria-hidden className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xl font-bold leading-none">Avtojon</p>
            <p className="text-primary-400 text-xs mt-0.5">Transport boshqaruv tizimi</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Bepul boshlang,{' '}
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              o'sing!
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Hoziroq ro'yxatdan o'ting va transport biznesingizni boshqarishni boshlang.
          </p>
          <ul className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/20 border border-primary-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-primary-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">© 2026 Tracx. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
              <Truck size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Avtojon</h1>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-700/60 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ro'yxatdan o'tish</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                2 ta mashinagacha umrbot bepul
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800/60 text-danger-700 dark:text-danger-400 text-sm px-4 py-3.5 rounded-xl mb-5">
                <div className="w-4 h-4 rounded-full bg-danger-500 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={set_('email')}
                placeholder="example@mail.com"
                required
                autoFocus
                autoComplete="email"
              />

              <Input
                label="To'liq ism"
                value={form.fullName}
                onChange={set_('fullName')}
                placeholder="Ism Familiya"
                required
                autoComplete="name"
              />

              <Input
                label="Kompaniya nomi (ixtiyoriy)"
                value={form.companyName}
                onChange={set_('companyName')}
                placeholder="Kompaniya LLC"
                autoComplete="organization"
              />

              <Input
                label="Telefon (ixtiyoriy)"
                value={form.phone}
                onChange={set_('phone')}
                placeholder="+998 90 000 00 00"
                autoComplete="tel"
              />

              <div className="relative">
                <Input
                  label="Parol"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set_('password')}
                  placeholder="Kamida 8 ta belgi"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Input
                label="Parolni tasdiqlang"
                type={showPass ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set_('confirmPassword')}
                placeholder="Parolni qayta kiriting"
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
                icon={ArrowRight}
                className="mt-1"
              >
                Ro'yxatdan o'tish
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400">yoki</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hisobingiz bor?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Kirish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
