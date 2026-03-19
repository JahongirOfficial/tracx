import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, ArrowRight, Package, Fuel,
  TrendingDown, Wifi, WifiOff, ChevronRight,
  Plus, Clock, Banknote, Route, AlertCircle,
} from 'lucide-react';
import ExpenseForm from '../../components/flights/ExpenseForm';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import { formatMoney } from '../../utils/formatters';

/* ── Helpers ── */
const fuelLabel = (type) => ({
  fuel_diesel: 'Dizel', fuel_benzin: 'Benzin',
  fuel_metan: 'Metan',  fuel_propan: 'Propan', fuel: "Yoqilg'i",
}[type] || type);

const fuelEmoji = (type) => ({
  fuel_diesel: '⛽', fuel_benzin: '⛽', fuel_metan: '🔵', fuel_propan: '🟡', fuel: '⛽',
}[type] || '⛽');

const elapsed = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h} soat ${m} daqiqa` : `${m} daqiqa`;
};

/* ── Empty state ── */
const NoFlight = ({ gps }) => (
  <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-6 gap-5">
    <div className="relative">
      <div className="absolute inset-0 bg-primary-400/15 rounded-full blur-2xl scale-150" />
      <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-xl border border-white/50 dark:border-slate-600/30">
        <Truck size={44} className="text-slate-300 dark:text-slate-500" strokeWidth={1.2} />
      </div>
    </div>
    <div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Faol reys yo'q</h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[260px] leading-relaxed">
        Biznesmen reys tayinlashini kuting. Reys tayinlanishi bilan darhol xabardor bo'lasiz.
      </p>
    </div>
    <div className={[
      'inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border',
      gps
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
    ].join(' ')}>
      {gps ? <Wifi size={13} /> : <WifiOff size={13} />}
      {gps ? 'GPS joylashuv uzatilmoqda' : 'GPS ulanmagan'}
    </div>
  </div>
);

/* ── Main component ── */
const DriverHome = () => {
  const [activeFlight, setActiveFlight] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [gpsActive, setGpsActive]       = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await api.get('/driver/flights', { params: { status: 'active', limit: 1 } });
      setActiveFlight(res.data?.[0] || null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsActive(true);
        api.put('/driver/location', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        }).catch(() => {});
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true, maximumAge: 30_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const pendingLeg = activeFlight?.legs?.find((l) => l.status === 'pending');
  const currentLeg = pendingLeg || activeFlight?.legs?.[activeFlight.legs.length - 1];
  const completedLegs = activeFlight?.legs?.filter((l) => l.status === 'completed')?.length || 0;
  const totalLegs = activeFlight?.legs?.length || 0;
  const vehicle = activeFlight?.vehicle;
  const vehicleFuelType = vehicle?.fuelType || 'fuel_diesel';

  const initials = ((user?.fullName || user?.username || 'H')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()) || 'D';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 select-none">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 px-5 pt-10 pb-24 relative overflow-hidden">
        {/* bg decoration */}
        <div aria-hidden className="absolute -top-10 -right-10 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
        <div aria-hidden className="absolute bottom-0 left-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between mb-5">
          <div>
            <p className="text-primary-300 text-xs font-medium mb-0.5">Xush kelibsiz</p>
            <h1 className="text-white text-xl font-bold leading-tight truncate max-w-[200px]">
              {user?.fullName || user?.username || 'Haydovchi'}
            </h1>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary-600/40 border border-primary-500/40 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-base">{initials}</span>
          </div>
        </div>

        {/* Balance + GPS */}
        <div className="relative grid grid-cols-2 gap-3">
          <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-slate-400 text-[11px] font-medium mb-0.5">Balans</p>
            <p className="text-white font-bold text-lg leading-tight">
              {user?.currentBalance !== undefined ? formatMoney(user.currentBalance, 'UZS', true) : '—'}
            </p>
          </div>
          <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-slate-400 text-[11px] font-medium mb-0.5">GPS holati</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={['w-2 h-2 rounded-full', gpsActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'].join(' ')} />
              <span className={['text-sm font-semibold', gpsActive ? 'text-emerald-300' : 'text-slate-400'].join(' ')}>
                {gpsActive ? 'Faol' : 'Yo\'q'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 -mt-14 pb-28 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !activeFlight ? (
          <NoFlight gps={gpsActive} />
        ) : (
          <>
            {/* ── Mashina + Yo'nalish kartasi ── */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-5 shadow-2xl shadow-primary-500/20 border border-primary-500/20">

              {/* Mashina */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                    <Truck size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">
                      {vehicle?.plateNumber || '—'}
                    </p>
                    <p className="text-primary-200 text-[11px]">
                      {vehicle?.brand} {vehicle?.model}
                      {vehicle?.fuelType && (
                        <span className="ml-1">{fuelEmoji(vehicleFuelType)} {fuelLabel(vehicleFuelType)}</span>
                      )}
                    </p>
                  </div>
                </div>
                {activeFlight.startedAt && (
                  <div className="text-right">
                    <p className="text-primary-200 text-[10px]">Boshlangan</p>
                    <p className="text-white text-xs font-semibold">{elapsed(activeFlight.startedAt)}</p>
                  </div>
                )}
              </div>

              {/* Yo'nalish */}
              {currentLeg ? (
                <div className="mb-4">
                  <p className="text-primary-200 text-[10px] font-semibold uppercase tracking-widest mb-2">
                    {pendingLeg ? 'Hozirgi yo\'nalish' : 'Oxirgi yo\'nalish'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/12 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-primary-200 text-[10px] mb-0.5">Qayerdan</p>
                      <p className="text-white font-bold text-sm truncate">{currentLeg.fromCity}</p>
                    </div>
                    <ArrowRight size={16} className="text-primary-300 shrink-0" />
                    <div className="flex-1 bg-white/12 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-primary-200 text-[10px] mb-0.5">Qayerga</p>
                      <p className="text-white font-bold text-sm truncate">{currentLeg.toCity}</p>
                    </div>
                  </div>

                  {currentLeg.cargo && (
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <Package size={12} className="text-primary-300 shrink-0" />
                      <p className="text-primary-200 text-xs">
                        <span className="text-white font-medium">{currentLeg.cargo}</span>
                        {currentLeg.weight ? <span className="ml-1">· {currentLeg.weight} t</span> : ''}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/10 rounded-xl px-2 py-2 text-center">
                  <Route size={12} className="text-primary-200 mx-auto mb-0.5" />
                  <p className="text-white font-bold text-sm">{completedLegs}/{totalLegs}</p>
                  <p className="text-primary-200 text-[10px]">Yo'nalish</p>
                </div>
                <div className="bg-white/10 rounded-xl px-2 py-2 text-center">
                  <Banknote size={12} className="text-primary-200 mx-auto mb-0.5" />
                  <p className="text-white font-bold text-sm">{formatMoney(activeFlight.roadMoney || 0, 'UZS', true)}</p>
                  <p className="text-primary-200 text-[10px]">Yo'l puli</p>
                </div>
                <div className="bg-white/10 rounded-xl px-2 py-2 text-center">
                  <TrendingDown size={12} className="text-red-300 mx-auto mb-0.5" />
                  <p className="text-white font-bold text-sm">{formatMoney(activeFlight.lightExpenses || 0, 'UZS', true)}</p>
                  <p className="text-primary-200 text-[10px]">Xarajat</p>
                </div>
              </div>

              {/* Batafsil tugma */}
              <button
                onClick={() => navigate(`/driver/flight/${activeFlight.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold py-2.5 rounded-xl shadow-lg active:scale-[0.98] transition-transform text-sm"
              >
                Reysni boshqarish <ChevronRight size={15} />
              </button>
            </div>

            {/* ── Quick actions ── */}
            <div className="grid grid-cols-2 gap-3">

              {/* Yoqilg'i qo'shish */}
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex flex-col items-center gap-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm p-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Fuel size={22} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {fuelEmoji(vehicleFuelType)} {fuelLabel(vehicleFuelType)}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Yoqilg'i kiriting</p>
                </div>
              </button>

              {/* Boshqa xarajat */}
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex flex-col items-center gap-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm p-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <Plus size={22} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Xarajat</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Xarajat kiriting</p>
                </div>
              </button>
            </div>

            {/* ── Yo'nalishlar ro'yxati ── */}
            {activeFlight.legs?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <Route size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Yo'nalishlar
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {activeFlight.legs.map((leg, i) => (
                    <div key={leg.id || i} className="flex items-center gap-3 px-4 py-3">
                      <div className={[
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                        leg.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : leg.status === 'pending'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400',
                      ].join(' ')}>
                        {leg.status === 'completed' ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {leg.fromCity} → {leg.toCity}
                        </p>
                        {leg.cargo && (
                          <p className="text-[11px] text-slate-400 truncate">{leg.cargo}{leg.weight ? ` · ${leg.weight}t` : ''}</p>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                        {formatMoney(leg.netPayment || 0, 'UZS', true)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── GPS holati ── */}
            {!gpsActive && (
              <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3">
                <AlertCircle size={15} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  GPS joylashuv aniqlanmayapti. Telefon joylashuviga ruxsat bering.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {activeFlight && (
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          flightId={activeFlight.id}
          vehicleFuelType={vehicleFuelType}
          isDriver
          onSuccess={() => { setShowExpenseForm(false); load(); }}
        />
      )}
    </div>
  );
};

export default DriverHome;
