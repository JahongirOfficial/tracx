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
    name: 'Starter',
    badge: null,
    priceMain: '0',
    priceSub: "so'm",
    period: 'umrbot bepul',
    desc: "2 ta mashinagacha hech qanday to'lov yo'q. Kredit karta kerak emas.",
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
    priceSub: "so'm/oy",
    period: 'har bir qo\'shimcha mashina uchun',
    desc: "3-mashina va undan ortiq har biridan 50,000 UZS/oy. 2 ta mashina har doim bepul.",
    popular: true,
    features: [
      "2 ta mashina bepul (har doim)",
      "3-mashina: +50,000 so'm/oy",
      "5 ta mashina: 150,000 so'm/oy",
      "10 ta mashina: 400,000 so'm/oy",
      "Barcha imkoniyatlar kiradi",
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
    desc: "Yirik flot uchun. 20+ mashina, maxsus shart va imkoniyatlar.",
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
    a: "Yo'q. Faqat email va parol bilan ro'yxatdan o'tishingiz mumkin. 2 ta mashina umrbot bepul.",
  },
  {
    q: "3-mashina qo'shganda qanday to'lov ishlaydi?",
    a: "3-mashina va undan keyingi har bir qo'shimcha mashina uchun oyiga 50,000 UZS to'lanadi. 2 ta mashina esa har doim bepul qoladi.",
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
    a: "Payme orqali istalgan vaqt balans to'ldirishingiz mumkin. To'ldirilgan pul 3-mashina va undan keyingilar uchun oylik to'lovda ishlatiladi.",
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

  const PHONE = '+998 88-863-36-63';
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
        className="relative overflow-hidden dark:bg-slate-950"
        style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #f0f6ff 40%, #ffffff 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-stretch min-h-[580px]">

            {/* ── Left: Text ── */}
            <div className="flex-1 flex flex-col justify-center py-16 lg:py-20 text-center lg:text-left lg:pr-10">
              {/* Badge */}
              <div className="inline-flex self-center lg:self-start items-center gap-2 bg-primary-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                <Zap size={11} className="fill-white" />
                O'zbekistonda №1 transport boshqaruv platformasi
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.1] tracking-tight mb-5 text-slate-900 dark:text-white">
                Transport biznesingizni{' '}
                <span className="text-primary-600 dark:text-primary-400">aqlli boshqaring</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-2 max-w-md mx-auto lg:mx-0 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-200">Web platforma orqali</strong> haydovchilar, mashinalar va reyslarni boshqaring. Moliyaviy hisob avtomatik.
              </p>

              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-8">
                ✓ 2 ta mashina bepul &nbsp;·&nbsp; ✓ Kredit karta kerak emas &nbsp;·&nbsp; ✓ Hoziroq boshlang
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm rounded-xl shadow-md transition-all duration-150 hover:scale-[1.02]"
                >
                  <Zap size={15} className="fill-white dark:fill-slate-900" />
                  Bepul boshlash
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl hover:border-primary-400 hover:text-primary-600 transition-all duration-150"
                >
                  <ArrowRight size={15} />
                  Qanday ishlashini ko'ring
                </a>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-2.5">
                <div className="flex -space-x-2">
                  {['bg-blue-400','bg-emerald-400','bg-amber-400','bg-rose-400'].map((c,i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white dark:border-slate-950 flex items-center justify-center`}>
                      <span className="text-white text-[9px] font-bold">{String.fromCharCode(65+i)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_,i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-200">50+</strong> kompaniya ishlatmoqda
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: Phone — right-edge anchored, overflows bottom ── */}
            <div className="flex flex-shrink-0 items-start justify-center lg:justify-end pt-4 pb-10 lg:pt-10 lg:pb-0 pl-0 lg:pl-4">
              {/* Phone shell */}
              <div className="relative w-[300px] bg-slate-900 rounded-[3.2rem] p-[10px] shadow-2xl shadow-slate-900/30 ring-1 ring-slate-800/80">
                <div className="bg-white rounded-[2.6rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-900">9:41</span>
                    <div className="w-[90px] h-[18px] bg-slate-900 rounded-full mx-auto" />
                    <div className="flex items-center gap-1">
                      <div className="flex gap-[2px] items-end h-3">
                        {[3,4,5,6].map(h => <div key={h} className="w-[3px] bg-slate-900 rounded-sm" style={{height: h+'px'}} />)}
                      </div>
                      <div className="w-4 h-[9px] border border-slate-900 rounded-[2px] relative ml-0.5">
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-emerald-500 rounded-[2px]" />
                      </div>
                    </div>
                  </div>

                  {/* App topbar */}
                  <div className="bg-white px-4 pt-1 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Truck size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-black text-slate-900 tracking-tight">Avtojon</span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-slate-400">jonli</span>
                    </div>
                  </div>

                  {/* Cards list */}
                  <div className="bg-slate-50 px-3 py-3 space-y-2">
                    {[
                      { from:'TOSHKENT', to:'SAMARQAND', type:'Quruq yuk', price:'1,200,000', time:'bugun' },
                      { from:'BUXORO',   to:'TOSHKENT',  type:'Meva',      price:'4,500,000', time:'bugun' },
                      { from:'NAMANGAN', to:'TOSHKENT',  type:'Elektronika',price:'800,000',  time:'1s' },
                      { from:'ANDIJON',  to:'QARSHI',    type:'Tekstil',   price:'2,100,000', time:'2s' },
                      { from:'XORAZM',   to:'TOSHKENT',  type:'Shisha',    price:'1,800,000', time:'3s' },
                    ].map((f,i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-primary-600">{f.from}</span>
                            <ArrowRight size={8} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-primary-600">{f.to}</span>
                          </div>
                          <span className="text-[9px] text-slate-400">{f.time}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mb-1.5">Yuklashga tayyor · {f.type}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-black text-slate-900">UZS {f.price}</span>
                          <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Truck size={8} className="text-emerald-600" />
                            <span className="text-[9px] text-emerald-700 font-semibold">1 ta</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom nav */}
                  <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center justify-around">
                    <div className="flex flex-col items-center gap-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563eb" stroke="none"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                      <span className="text-[8px] text-primary-600 font-semibold">Asosiy</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <span className="text-[8px] text-slate-400">Qidirish</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 -mt-4">
                      <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                      <span className="text-[8px] text-slate-400">Reys</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span className="text-[8px] text-slate-400">Reyslar</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="text-[8px] text-slate-400">Profil</span>
                    </div>
                  </div>
                  {/* Home indicator */}
                  <div className="bg-white pb-2 pt-1 flex justify-center">
                    <div className="w-20 h-[4px] bg-slate-900 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="py-8 sm:py-14 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <span className="inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Imkoniyatlar
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
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
      <section id="how" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Qanday ishlaydi
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              3 ta oddiy qadam
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
              Tez va oson sozlab ishga tushiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div aria-hidden className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-0.5 bg-gradient-to-r from-primary-400 to-transparent dark:from-primary-600" />
                )}
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xl sm:text-2xl font-black mb-3 sm:mb-4 shadow-xl shadow-primary-500/30">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-150 shadow-lg shadow-primary-500/30 hover:scale-105"
            >
              Hoziroq boshlang
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <span className="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Narxlar
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
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
                    ? 'border-primary-500 shadow-2xl shadow-primary-500/15 bg-white dark:bg-slate-800 md:scale-[1.03]'
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Mijozlar fikri
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
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
      <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Savol-javob
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
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


      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-800">
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
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-2xl shadow-sky-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="Telegram orqali bog'laning"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
};

export default Landing;
