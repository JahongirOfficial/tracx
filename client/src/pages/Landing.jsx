import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Users,
  BarChart3,
  MapPin,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Star,
  Clock,
  Globe,
} from 'lucide-react';
import Button from '../components/ui/Button';

/* ─── Feature data ─────────────────────────────────────────── */
const features = [
  {
    icon: Truck,
    title: 'Reyslar boshqaruvi',
    desc: "Haydovchi, mashina va yo'nalishlarni bir joyda boshqaring. Real vaqtda holat kuzatuv.",
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-900/40',
  },
  {
    icon: BarChart3,
    title: 'Moliyaviy hisobot',
    desc: "Daromad, xarajat va foyda avtomatik hisoblanadi. Excel eksport bilan.",
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-100 dark:border-green-900/40',
  },
  {
    icon: MapPin,
    title: 'Real-vaqt GPS',
    desc: "Haydovchi joylashuvini real vaqtda kuzating. Yo'l tarixi va tezlik nazorati.",
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-100 dark:border-rose-900/40',
  },
  {
    icon: Users,
    title: "Ko'p foydalanuvchi",
    desc: 'SuperAdmin, biznesmen va haydovchi rollari. Har biri uchun alohida panel.',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-100 dark:border-purple-900/40',
  },
  {
    icon: Shield,
    title: 'Xavfsiz tizim',
    desc: "JWT autentifikatsiya, refresh tokenlar va kuchli himoya mexanizmlari.",
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-100 dark:border-orange-900/40',
  },
  {
    icon: Zap,
    title: 'Tezkor ishlaydi',
    desc: "Redis kesh va Socket.io bilan real-vaqt yangilanishlar. Sekin internet ham muammo emas.",
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-100 dark:border-cyan-900/40',
  },
];

/* ─── How it works steps ────────────────────────────────────── */
const steps = [
  {
    num: '01',
    title: "Ro'yxatdan o'ting",
    desc: "SuperAdmin orqali akkaunt oching. Biznesmen sifatida tizimga kiring.",
  },
  {
    num: '02',
    title: "Haydovchi va mashina qo'shing",
    desc: "Haydovchilar va avtomobillar ma'lumotlarini kiriting. Birlashtiring.",
  },
  {
    num: '03',
    title: 'Reys boshlang',
    desc: "Reys oching, buyurtmalar va xarajatlarni kiriting. Daromad avtomatik hisoblanadi.",
  },
];

/* ─── Pricing plans ─────────────────────────────────────────── */
const plans = [
  {
    name: 'Trial',
    price: 'Bepul',
    period: '7 kunlik sinov',
    desc: "Barcha imkoniyatlarni 7 kun bepul sinab ko'ring.",
    features: [
      "Barcha asosiy imkoniyatlar",
      "1 ta mashina",
      "Cheksiz reyslar",
      'Texnik yordam',
    ],
    cta: "Bepul boshlash",
    popular: false,
    variant: 'secondary',
  },
  {
    name: 'Basic',
    price: '30 000',
    period: "so'm / mashina / oy",
    desc: "O'rta hajmli transport biznesi uchun optimal.",
    features: [
      'Cheksiz reyslar',
      'GPS kuzatuv',
      'Moliyaviy hisobotlar',
      "Haydovchi mobil app",
      'Email yordam',
    ],
    cta: 'Boshlash',
    popular: true,
    variant: 'primary',
  },
  {
    name: 'Pro',
    price: '50 000',
    period: "so'm / oy",
    desc: "Yirik transport kompaniyalari uchun kengaytirilgan imkoniyatlar.",
    features: [
      'Cheksiz mashinalar',
      'Priority yordam',
      'API kirish',
      "Ko'p filial boshqaruv",
      'Maxsus imkoniyatlar',
    ],
    cta: 'Boshlash',
    popular: false,
    variant: 'secondary',
  },
];

/* ─── Component ─────────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── Sticky nav ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
              <Truck size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Avtojon</span>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary-600 dark:hover:text-white transition-colors">
              Imkoniyatlar
            </a>
            <a href="#how" className="hover:text-primary-600 dark:hover:text-white transition-colors">
              Qanday ishlaydi
            </a>
            <a href="#pricing" className="hover:text-primary-600 dark:hover:text-white transition-colors">
              Narxlar
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Kirish
            </Button>
            <Button size="sm" onClick={() => navigate('/login')} icon={ArrowRight}>
              Boshlash
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)'}}>
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap size={13} className="fill-blue-300 text-blue-300" />
            Transport logistika tizimi
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5 text-white">
            Transport biznesingizni{' '}
            <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              aqlli boshqaring
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Haydovchilar, mashinalar va reyslarni bir platformada boshqaring.
            Moliyaviy hisob-kitoblar avtomatik, real vaqt GPS kuzatuv bilan.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              icon={ArrowRight}
              className="shadow-xl shadow-primary-500/40"
            >
              Bepul boshlash
            </Button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-base font-medium rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors duration-150 backdrop-blur-sm"
            >
              Demo ko'rish
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-1 text-slate-300 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2">
              <strong className="text-white">50+</strong> transport kompaniyasi ishlatadi
            </span>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-0 -mb-1">
          <div className="bg-slate-800/60 backdrop-blur rounded-t-2xl border border-white/10 border-b-0 p-4 shadow-2xl">
            {/* Mockup browser bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="ml-3 flex-1 bg-slate-700/60 rounded-md h-5" />
            </div>
            {/* Mockup content grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['blue', 'green', 'purple', 'orange'].map((c) => (
                <div
                  key={c}
                  className="h-16 rounded-xl bg-gradient-to-br opacity-80"
                  style={{
                    background: {
                      blue: 'linear-gradient(135deg,#3b82f620,#1d4ed820)',
                      green: 'linear-gradient(135deg,#22c55e20,#15803d20)',
                      purple: 'linear-gradient(135deg,#a855f720,#7e22ce20)',
                      orange: 'linear-gradient(135deg,#f9731620,#c2410c20)',
                    }[c],
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>
            <div className="h-28 rounded-xl bg-white/5 border border-white/5" />
          </div>
        </div>
      </section>

      {/* Wave separator */}
      <div className="h-8 bg-slate-100 dark:bg-slate-900" />

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-14">
            <span className="inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Imkoniyatlar
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Biznesingiz uchun kerakli{' '}
              <span className="text-primary-600 dark:text-primary-400">hamma narsa</span>
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Avtojon transport logistikasini boshqarishning eng qulay usulini taqdim etadi.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                className={`${bg} border ${border} rounded-2xl p-6 hover:shadow-md transition-all duration-200 group`}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon size={20} className="text-white" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Qanday ishlaydi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              3 ta oddiy qadam
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-0.5 bg-gradient-to-r from-primary-300 to-transparent dark:from-primary-700"
                  />
                )}
                {/* Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-2xl font-black mb-4 shadow-lg shadow-primary-500/25">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Narxlar
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Biznesingizga mos rejani tanlang
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Barcha rejalarda bepul 7 kunlik sinov muddati mavjud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'relative rounded-2xl border p-7 bg-white dark:bg-slate-800',
                  plan.popular
                    ? 'border-primary-500 shadow-xl shadow-primary-500/10 scale-[1.03]'
                    : 'border-slate-200 dark:border-slate-700 shadow-sm',
                ].join(' ')}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      <Star size={11} className="fill-white" />
                      Mashhur
                    </span>
                  </div>
                )}

                {/* Plan name + desc */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{plan.desc}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black ${plan.popular ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    {plan.price !== 'Bepul' && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 leading-tight">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.price === 'Bepul' && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{plan.period}</p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle
                        size={16}
                        className={`flex-shrink-0 mt-0.5 ${plan.popular ? 'text-primary-500' : 'text-green-500'}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  fullWidth
                  variant={plan.popular ? 'primary' : 'secondary'}
                  onClick={() => navigate('/login')}
                  icon={ChevronRight}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Truck size={26} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Bugundan boshlang
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            7 kunlik bepul sinov. Hech qanday kredit karta talab qilinmaydi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-primary-700 hover:bg-primary-50"
              icon={ArrowRight}
            >
              Bepul boshlash
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Tizimga kirish
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <span className="text-white font-bold">Avtojon</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-5 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Imkoniyatlar</a>
              <a href="#pricing" className="hover:text-white transition-colors">Narxlar</a>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                Kirish
              </button>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-xs">
              <Globe size={13} />
              <span>© 2024 Avtojon. Transport logistika platformasi.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
