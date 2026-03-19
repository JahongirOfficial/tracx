import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation, Plus, Zap, Clock, CreditCard,
  ChevronDown, Fuel, Utensils, Shield,
  Gauge, ArrowUpRight, MapPinned, PackageCheck,
} from 'lucide-react';
import ExpenseForm from '../../components/flights/ExpenseForm';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import { formatMoney } from '../../utils/formatters';

/* ─── constants ─────────────────────────────────────────────── */
const FUEL_LABEL = { fuel_diesel:'Dizel', fuel_benzin:'Benzin', fuel_metan:'Metan', fuel_propan:'Propan', fuel:"Yoqilg'i" };
const FUEL_COLOR = { fuel_diesel:'#f59e0b', fuel_benzin:'#ef4444', fuel_metan:'#3b82f6', fuel_propan:'#f97316', fuel:'#f59e0b' };

const QUICK_EXPENSE = (ft) => [
  { type: ft || 'fuel_diesel', label: FUEL_LABEL[ft] || 'Yoqilg\'i', icon: Fuel,     bg:'#fef3c7', fg:'#d97706' },
  { type: 'food',              label: 'Ovqat',                        icon: Utensils,  bg:'#d1fae5', fg:'#059669' },
  { type: 'toll',              label: "Yo'l to'lovi",                 icon: Shield,    bg:'#ede9fe', fg:'#7c3aed' },
  { type: 'other',             label: 'Boshqa',                       icon: Plus,      bg:'#f1f5f9', fg:'#64748b' },
];

const elapsed = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return `${s} soniya`;
  if (s < 3600) return `${Math.floor(s/60)} daqiqa`;
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60);
  return `${h}h ${m}m`;
};

/* ─── Idle / no-flight screen ───────────────────────────────── */
const IdleScreen = ({ user }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1200);
    return () => clearInterval(t);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">

      {/* top */}
      <div className="px-6 pt-14 pb-6">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-1">{greeting}</p>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
          {user?.fullName?.split(' ')[0] || 'Haydovchi'}
        </h1>
      </div>

      {/* balance chip */}
      <div className="mx-6 mb-8 bg-zinc-950 dark:bg-zinc-100 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium mb-0.5">Joriy balans</p>
          <p className="text-white dark:text-zinc-900 text-xl font-black">
            {user?.currentBalance !== undefined ? formatMoney(user.currentBalance) : '—'}
          </p>
        </div>
        <CreditCard size={22} className="text-zinc-500 dark:text-zinc-400" />
      </div>

      {/* waiting card */}
      <div className="mx-6 flex-1">
        <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center py-16 px-8 gap-5">
          {/* animated radar */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {[0,1,2].map(i => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border-2 border-zinc-300 dark:border-zinc-700 animate-ping"
                style={{ animationDelay:`${i*0.4}s`, animationDuration:'2s', opacity: tick % 3 === i ? 0.5 : 0.15 }}
              />
            ))}
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center z-10">
              <Navigation size={22} className="text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-bold text-zinc-800 dark:text-zinc-200 text-base mb-1">Reys kutilmoqda</p>
            <p className="text-zinc-400 dark:text-zinc-600 text-sm leading-relaxed">
              Biznesmen reys tayinlashi bilan<br />darhol ko'rinadi
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">Tizim ulangan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Active flight screen ───────────────────────────────────── */
const ActiveScreen = ({ flight, user, onAddExpense }) => {
  const navigate = useNavigate();
  const vehicle      = flight?.vehicle;
  const fuelType     = vehicle?.fuelType || 'fuel_diesel';
  const legs         = flight?.legs || [];
  const activeLeg    = legs.find(l => l.status === 'pending') || legs[legs.length - 1];
  const doneLegs     = legs.filter(l => l.status === 'completed').length;
  const pct          = legs.length ? Math.round((doneLegs / legs.length) * 100) : 0;
  const quickItems   = QUICK_EXPENSE(fuelType);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-100 dark:bg-zinc-950">

      {/* ── Hero card ── */}
      <div className="bg-zinc-950 dark:bg-zinc-900 rounded-b-[36px] px-5 pt-12 pb-8 mx-0">

        {/* Status row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">Reys Faol</span>
          </div>
          <button
            onClick={() => navigate(`/driver/flight/${flight.id}`)}
            className="flex items-center gap-1 text-zinc-400 text-xs font-semibold active:opacity-60"
          >
            Batafsil <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Route */}
        {activeLeg ? (
          <div className="mb-7">
            <div className="flex items-end gap-3 mb-2">
              <div className="flex-1">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Qayerdan</p>
                <p className="text-white font-black text-2xl leading-none truncate">{activeLeg.fromCity}</p>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-1 text-zinc-600">
                  <div className="w-12 h-px bg-zinc-600" />
                  <Navigation size={14} className="text-zinc-500 fill-zinc-500" />
                  <div className="w-12 h-px bg-zinc-600" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Qayerga</p>
                <p className="text-white font-black text-2xl leading-none truncate">{activeLeg.toCity}</p>
              </div>
            </div>
            {activeLeg.cargo && (
              <div className="flex items-center gap-2 mt-3">
                <PackageCheck size={13} className="text-zinc-500" />
                <p className="text-zinc-400 text-xs">
                  {activeLeg.cargo}
                  {activeLeg.weight ? <span className="ml-1 text-zinc-500">· {activeLeg.weight} t</span> : ''}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-7">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Joriy reys</p>
            <p className="text-white font-black text-2xl">{vehicle?.plateNumber || '—'}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-xs">
              {doneLegs} / {legs.length} yo'nalish bajarildi
            </span>
            <span className="text-zinc-400 text-xs font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: CreditCard, label: 'Balans',    value: formatMoney(user?.currentBalance || 0, 'UZS', true), color: 'text-emerald-400' },
            { icon: Gauge,      label: "Yo'l puli", value: formatMoney(flight.roadMoney || 0, 'UZS', true),     color: 'text-sky-400' },
            { icon: Clock,      label: 'Vaqt',      value: elapsed(flight.startedAt),                           color: 'text-violet-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-zinc-800/60 rounded-2xl px-3 py-3">
              <Icon size={13} className={`${color} mb-1.5`} />
              <p className="text-white text-sm font-bold leading-tight tabular-nums">{value || '—'}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll content ── */}
      <div className="flex-1 px-4 pt-5 pb-32 space-y-4">

        {/* Vehicle chip */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
            style={{ background: FUEL_COLOR[fuelType] }}
          >
            ⛽
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-900 dark:text-white font-bold text-sm truncate">
              {vehicle?.plateNumber || '—'}
              {vehicle?.brand ? ` · ${vehicle.brand}` : ''}
            </p>
            <p className="text-zinc-400 text-xs">{FUEL_LABEL[fuelType]}</p>
          </div>
          <div className="flex items-center gap-1">
            <MapPinned size={13} className="text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">GPS</span>
          </div>
        </div>

        {/* Quick expense buttons */}
        <div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3 px-1">
            Tezkor xarajat
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quickItems.map(({ type, label, icon: Icon, bg, fg }) => (
              <button
                key={type}
                onClick={() => onAddExpense(type)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-transform shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={16} style={{ color: fg }} />
                </div>
                <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 text-center leading-tight px-1">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Legs list */}
        {legs.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                Yo'nalishlar
              </p>
            </div>
            {legs.map((leg, i) => {
              const isDone = leg.status === 'completed';
              const isActive = leg.id === activeLeg?.id;
              return (
                <div key={leg.id || i} className={[
                  'flex items-center gap-3 px-4 py-3.5',
                  i < legs.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : '',
                  isActive ? 'bg-zinc-50 dark:bg-zinc-800/40' : '',
                ].join(' ')}>
                  {/* step dot */}
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 border-2',
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-400',
                  ].join(' ')}>
                    {isDone ? '✓' : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={[
                      'text-sm font-bold truncate',
                      isDone ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-white',
                    ].join(' ')}>
                      {leg.fromCity} → {leg.toCity}
                    </p>
                    {leg.cargo && (
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{leg.cargo}</p>
                    )}
                  </div>

                  <p className={[
                    'text-xs font-bold flex-shrink-0',
                    isDone ? 'text-zinc-400' : 'text-zinc-700 dark:text-zinc-300',
                  ].join(' ')}>
                    {formatMoney(leg.netPayment || 0, 'UZS', true)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Root component ─────────────────────────────────────────── */
export default function DriverHome() {
  const [flight, setFlight]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showExpense, setShowExpense]  = useState(false);
  const [presetType, setPresetType]   = useState(null);
  const { user } = useAuthStore();

  const load = async () => {
    try {
      const res = await api.get('/driver/flights', { params: { status: 'active', limit: 1 } });
      setFlight(res.data?.[0] || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => api.put('/driver/location', {
        lat: pos.coords.latitude, lng: pos.coords.longitude,
        speed: pos.coords.speed,  heading: pos.coords.heading,
      }).catch(() => {}),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const openExpense = (type = null) => {
    setPresetType(type);
    setShowExpense(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
      <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {!flight
        ? <IdleScreen user={user} />
        : <ActiveScreen flight={flight} user={user} onAddExpense={openExpense} />
      }

      {/* ── Floating action button (only when flight active) ── */}
      {flight && (
        <button
          onClick={() => openExpense(null)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-zinc-950 dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/30 active:scale-90 transition-transform z-40"
          aria-label="Xarajat qo'shish"
        >
          <Plus size={24} className="text-white dark:text-zinc-900" />
        </button>
      )}

      {flight && (
        <ExpenseForm
          isOpen={showExpense}
          onClose={() => { setShowExpense(false); setPresetType(null); }}
          flightId={flight.id}
          vehicleFuelType={flight.vehicle?.fuelType}
          isDriver
          onSuccess={() => { setShowExpense(false); setPresetType(null); load(); }}
        />
      )}
    </>
  );
}
