import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck, Users, BarChart3, MapPin, Shield, Zap, ArrowRight,
  CheckCircle, ChevronRight, Star, Globe, Phone, MessageCircle,
  TrendingUp, Clock, ChevronDown, Package, Wallet, Bell, Menu, X,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────── */
const stats = [
  { value: '50+', label: "Faol kompaniya" },
  { value: '300+', label: "Haydovchi" },
  { value: '5 000+', label: "Reys bajarildi" },
  { value: '99.9%', label: "Uptime" },
];

const features = [
  {
    icon: Truck,
    title: 'Reyslar boshqaruvi',
    desc: "Haydovchi, mashina va yo'nalishlarni bir joyda boshqaring. Har bir reys uchun to'liq moliyaviy hisob.",
    color: 'from-blue-500 to-blue-700',
    light: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40',
  },
  {
    icon: BarChart3,
    title: 'Avtomatik moliya',
    desc: "Naqd, o'tkazma, peritsena bo'yicha daromad tahlili. Xarajatlar va foyda real vaqtda.",
    color: 'from-emerald-500 to-green-700',
    light: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
  },
  {
    icon: MapPin,
    title: 'GPS kuzatuv',
    desc: "Haydovchi joylashuvini real vaqtda ko'ring. Tezlik va yo'l tarixi nazorati.",
    color: 'from-rose-500 to-pink-700',
    light: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40',
  },
  {
    icon: Users,
    title: "Haydovchi paneli",
    desc: "Haydovchi o'z telefonidan xarajat va reys ma'lumotlarini kirita oladi.",
    color: 'from-violet-500 to-purple-700',
    light: 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/40',
  },
  {
    icon: Wallet,
    title: "Xarajat nazorati",
    desc: "Yoqilg'i, ta'mir, yo'l haqi — barcha xarajatlar kategoriya bo'yicha. Haydovchi qo'lidagi pul real vaqtda.",
    color: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40',
  },
  {
    icon: Bell,
    title: "Ogohlantirish tizimi",
    desc: "Moyin almashtirish, texnik xizmat muddatlari va balans ogohlantirishlari.",
    color: 'from-cyan-500 to-sky-700',
    light: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/40',
  },
];

const steps = [
  {
    num: '01',
    icon: Users,
    title: "Email bilan ro'yxatdan o'ting",
    desc: "30 soniyada akkaunt oching. Hech qanday hujjat yoki tasdiqlash kerak emas.",
  },
  {
    num: '02',
    icon: Truck,
    title: "Mashina va haydovchi qo'shing",
    desc: "2 ta mashinangizni bepul qo'shing. Haydovchilarga kirish ma'lumotlari bering.",
  },
  {
    num: '03',
    icon: TrendingUp,
    title: "Reys boshlang, foyda sanang",
    desc: "Reyslar ochilganda moliyaviy hisob avtomatik ishlaydi. Har kuni natijani kuzating.",
  },
];

const pricing = [
  {
    name: 'Bepul',
    badge: null,
    priceMain: '0',
    priceSub: "so'm",
    period: 'umrbot',
    desc: "Kichik biznes uchun. 2 ta mashina bilan doimiy bepul.",
    popular: false,
    features: [
      "2 ta mashina — umrbot bepul",
      "Cheksiz haydovchilar",
      "Cheksiz reyslar",
      "Moliyaviy hisobotlar",
      "Haydovchi mobil paneli",
    ],
    cta: "Bepul boshlash",
    to: '/register',
    highlight: false,
  },
  {
    name: 'O\'sish',
    badge: 'Mashhur',
    priceMain: '50 000',
    priceSub: "so'm",
    period: 'har qo\'shimcha mashina',
    desc: "3-mashina va undan keyin har birini qo'shishda bir martalik to'lov.",
    popular: true,
    features: [
      "2 ta mashina bepul (asosiy)",
      "Qo'shimcha har mashina 50 000 UZS",
      "Kunlik to'lov yo'q",
      "Barcha imkoniyatlar",
      "Ustunlik qo'llab-quvvatlash",
    ],
    cta: "Hoziroq boshlash",
    to: '/register',
    highlight: true,
  },
  {
    name: 'Korporativ',
    badge: null,
    priceMain: 'Aloqa',
    priceSub: '',
    period: 'narx kelishiladi',
    desc: "Yirik flot uchun. 10+ mashina, maxsus shart va imkoniyatlar.",
    popular: false,
    features: [
      "Cheksiz mashinalar",
      "API integratsiya",
      "Maxsus hisobotlar",
      "Shaxsiy menejer",
      "24/7 qo'llab-quvvatlash",
    ],
    cta: "Bog'lanish",
    to: null,
    phone: true,
    highlight: false,
  },
];

const faqs = [
  {
    q: "Ro'yxatdan o'tish uchun kredit karta kerakmi?",
    a: "Yo'q. Faqat email va parol bilan ro'yxatdan o'tishingiz mumkin. 2 ta mashina bepul va doimiy.",
  },
  {
    q: "3-mashina qo'shganda qanday to'lov ishlaydi?",
    a: "3-mashina va undan keyingi har bir mashina uchun hisobingizdan bir martalik 50,000 UZS ayiriladi. Oylik to'lov yo'q.",
  },
  {
    q: "Haydovchi o'z telefonidan foydalana oladimi?",
    a: "Ha. Haydovchiga alohida login beriladi. U telefon orqali reys ma'lumotlarini ko'radi va xarajat kiritadi.",
  },
  {
    q: "Ma'lumotlarim xavfsizmi?",
    a: "Barcha ma'lumotlar shifrlangan holda saqllanadi. JWT autentifikatsiya va xavfsiz server infratuzilmasi bilan himoyalangan.",
  },
  {
    q: "Balansga pul qanday yuklanadi?",
    a: "Payme orqali istalgan vaqt balans to'ldirishingiz mumkin. To'ldirilgan pul qo'shimcha mashina qo'shishda ishlatiladi.",
  },
];

const testimonials = [
  {
    name: "Akbar Toshmatov",
    role: "Transport kompaniyasi, Toshkent",
    text: "Avtojondan oldin hamma narsa Excel da edi. Endi haydovchi qo'lidagi pul, xarajatlar, foyda — hammasi bir ekranda. Vaqtni 3 barobar tejadim.",
    stars: 5,
  },
  {
    name: "Dilshod Raximov",
    role: "Yuk tashish, Samarqand",
    text: "2 ta mashinam bor, bepul ishlatyapman. Reyslar hisob-kitobi to'g'ri chiqmoqda. Juda qulay dastur.",
    stars: 5,
  },
  {
    name: "Sardor Nazarov",
    role: "Logistika, Buxoro",
    text: "Haydovchilarim o'zlari xarajat kiritishadi. Men faqat hisobotni ko'raman. Ajoyib sistema.",
    stars: 5,
  },
];

/* ─── FAQ Item ──────────────────────────────────────────────────── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-white text-sm leading-relaxed">{q}</span>
        <ChevronDown
          size={18}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const PHONE = '+998 90 000 00 00'; // TODO: replace with real phone
  const TELEGRAM = 'https://t.me/avtojon_support'; // TODO: replace

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── Sticky Nav ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
              <Truck size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Avtojon</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary-600 dark:hover:text-white transition-colors">Imkoniyatlar</a>
            <a href="#how" className="hover:text-primary-600 dark:hover:text-white transition-colors">Qanday ishlaydi</a>
            <a href="#pricing" className="hover:text-primary-600 dark:hover:text-white transition-colors">Narxlar</a>
            <a href="#faq" className="hover:text-primary-600 dark:hover:text-white transition-colors">Savol-javob</a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-white transition-colors"
            >
              Kirish
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-primary-500/30"
            >
              Bepul boshlash
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 flex flex-col gap-3">
            {['#features', '#how', '#pricing', '#faq'].map((href, i) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenu(false)}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 py-1"
              >
                {['Imkoniyatlar', 'Qanday ishlaydi', 'Narxlar', 'Savol-javob'][i]}
              </a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link to="/login" className="flex-1 text-center py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium">
                Kirish
              </Link>
              <Link to="/register" className="flex-1 text-center py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">
                Bepul boshlash
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0c1a3a 100%)' }}
      >
        <div aria-hidden className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 md:pt-28 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-sm uppercase tracking-wide">
            <Zap size={12} className="fill-blue-300 text-blue-300" />
            Transport logistika platformasi · O'zbekiston
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight mb-5">
            Transport biznesingizni{' '}
            <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              aqlli boshqaring
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-3 max-w-2xl mx-auto leading-relaxed">
            Haydovchilar, mashinalar va reyslarni bir platformada boshqaring.
            Moliyaviy hisob avtomatik. Real vaqt GPS kuzatuv.
          </p>
          <p className="text-sm text-emerald-400 font-semibold mb-10">
            ✓ 2 ta mashinaga umrbot bepul · ✓ Kredit karta kerak emas · ✓ 30 soniyada boshlang
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-500 hover:bg-primary-400 text-white font-bold text-base rounded-xl shadow-2xl shadow-primary-500/40 transition-all duration-150 hover:scale-105"
            >
              Bepul boshlash
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/25 text-white font-semibold text-base rounded-xl hover:bg-white/20 transition-all duration-150 backdrop-blur-sm"
            >
              Qanday ishlashini ko'ring
            </a>
          </div>

          {/* Social proof stars */}
          <div className="mt-10 flex items-center justify-center gap-1 text-slate-300 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2">
              <strong className="text-white">50+</strong> transport kompaniyasi ishlatmoqda
            </span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-0 -mb-1">
          <div className="bg-slate-800/70 backdrop-blur rounded-t-2xl border border-white/10 border-b-0 p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="ml-3 flex-1 bg-slate-700/60 rounded-md h-5 flex items-center px-3">
                <span className="text-[10px] text-slate-400">avtojon.uz/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { c: 'from-blue-500/20 to-blue-700/20', label: 'Jami daromad', val: '18.6M' },
                { c: 'from-green-500/20 to-green-700/20', label: 'Xarajatlar', val: '4.2M' },
                { c: 'from-purple-500/20 to-purple-700/20', label: 'Foyda', val: '14.4M' },
                { c: 'from-amber-500/20 to-orange-700/20', label: 'Haydovchi', val: '33K' },
              ].map(({ c, label, val }) => (
                <div
                  key={label}
                  className="h-16 rounded-xl flex flex-col justify-center px-3"
                  style={{ background: `linear-gradient(135deg,${c.split(' ').join(',')})`, border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-[9px] text-slate-400 leading-none mb-1">{label}</p>
                  <p className="text-sm font-bold text-white">{val}</p>
                </div>
              ))}
            </div>
            <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
              <div className="flex gap-2 items-end h-14 px-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="w-4 rounded-sm opacity-70"
                    style={{ height: `${h}%`, background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#22c55e' : '#8b5cf6' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-8 bg-slate-100 dark:bg-slate-900" />

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="py-14 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Imkoniyatlar
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Biznesingiz uchun kerakli{' '}
              <span className="text-primary-600 dark:text-primary-400">hamma narsa</span>
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              Avtojon transport logistikasini boshqarishning eng qulay usulini taqdim etadi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, light }) => (
              <div key={title} className={`${light} border rounded-2xl p-6 hover:shadow-lg transition-all duration-200 group`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={22} className="text-white" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="how" className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Qanday ishlaydi
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              3 ta oddiy qadam
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
              30 daqiqada to'liq sozlab ishga tushiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div aria-hidden className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-0.5 bg-gradient-to-r from-primary-400 to-transparent dark:from-primary-600" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-2xl font-black mb-4 shadow-xl shadow-primary-500/30">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-150 shadow-lg shadow-primary-500/30 hover:scale-105"
            >
              Hoziroq boshlang
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Narxlar
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Sodda va shaffof narxlar
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Oylik to'lov yo'q. Faqat qo'shimcha mashina qo'shganda to'laysiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'relative rounded-2xl border p-7 transition-all duration-200',
                  plan.highlight
                    ? 'border-primary-500 shadow-2xl shadow-primary-500/15 scale-[1.03] bg-white dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800',
                ].join(' ')}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      <Star size={10} className="fill-white" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{plan.desc}</p>

                <div className="mb-6">
                  <div className="flex items-end gap-1 flex-wrap">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                      {plan.priceMain}
                    </span>
                    {plan.priceSub && (
                      <span className="text-sm text-slate-400 mb-1">{plan.priceSub}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{plan.period}</p>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle size={16} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-primary-500' : 'text-emerald-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.phone ? (
                  <a
                    href={`tel:${PHONE}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all text-sm"
                  >
                    <Phone size={15} />
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to={plan.to}
                    className={[
                      'flex items-center justify-center gap-2 w-full py-2.5 font-semibold rounded-xl transition-all text-sm',
                      plan.highlight
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/30'
                        : 'border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600',
                    ].join(' ')}
                  >
                    {plan.cta}
                    <ChevronRight size={15} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Mijozlar fikri
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Ular nima deyishadi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5 italic">"{text}"</p>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Savol-javob
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Ko'p beriladigan savollar
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #1e3a8a 100%)' }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Truck size={28} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Bugundan boshlang — bepul
          </h2>
          <p className="text-blue-200 mb-2 max-w-xl mx-auto text-sm">
            2 ta mashinagacha hech qanday to'lov talab qilinmaydi. Kredit karta shart emas.
          </p>
          <p className="text-blue-300 font-semibold mb-8 text-sm">
            Tanishingizdan eshitdingizmi? Hoziroq ro'yxatdan o'ting!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-700 hover:bg-blue-50 font-bold rounded-xl transition-all duration-150 shadow-xl hover:scale-105"
            >
              Bepul ro'yxatdan o'tish
              <ArrowRight size={18} />
            </Link>
            <a
              href={TELEGRAM}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-150"
            >
              <MessageCircle size={18} />
              Telegram orqali bog'lanish
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Truck size={17} className="text-white" />
                </div>
                <span className="text-white font-black text-lg">Avtojon</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-4">
                O'zbekistonning transport logistika boshqaruv platformasi. Haydovchilar, mashinalar va reyslarni bir joyda boshqaring.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={TELEGRAM}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle size={14} className="text-sky-400" />
                  Telegram
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <Phone size={14} className="text-green-400" />
                  {PHONE}
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Platforma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Imkoniyatlar</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Narxlar</a></li>
                <li><a href="#how" className="hover:text-white transition-colors">Qanday ishlaydi</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Savol-javob</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Hisob</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Ro'yxatdan o'tish
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Tizimga kirish
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Globe size={13} />
              <span>© 2026 Avtojon. Barcha huquqlar himoyalangan.</span>
            </div>
            <span className="text-slate-600">O'zbekiston · UZS</span>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp/Telegram button ───────────────────── */}
      <a
        href={TELEGRAM}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-13 h-13 bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-2xl shadow-sky-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="Telegram orqali bog'laning"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
};

export default Landing;
