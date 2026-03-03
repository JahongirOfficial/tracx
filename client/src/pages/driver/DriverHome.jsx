import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Plus, ArrowRight, Clock, DollarSign,
  MapPin, Wifi, ChevronRight, TrendingDown,
} from 'lucide-react';
import ExpenseForm from '../../components/flights/ExpenseForm';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import { formatMoney, formatDate } from '../../utils/formatters';

const Spinner = () => (
  <div className="flex justify-center py-20">
    <div className="w-10 h-10 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const NoFlight = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/10 rounded-3xl blur-2xl scale-150" />
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-xl border border-white/60 dark:border-slate-600/40">
        <Plane size={40} className="text-slate-400 dark:text-slate-500" strokeWidth={1.4} />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Faol reys yo'q</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
      Biznesmen reys tayinlashini kuting. Sizga reys ochilishi bilanoq bu yerda ko'rinadi.
    </p>
    <div className="flex items-center gap-2 mt-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full">
      <Wifi size={13} />
      GPS faol
    </div>
  </div>
);

const DriverHome = () => {
  const [activeFlight, setActiveFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
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
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          api.put('/driver/location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const currentLeg = activeFlight?.legs?.find((l) => l.status === 'pending')
    || activeFlight?.legs?.[activeFlight.legs.length - 1];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 select-none">

      {/* Dark header */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 px-5 pt-12 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-300 text-sm font-medium mb-1">Xush kelibsiz</p>
            <h1 className="text-white text-2xl font-bold leading-tight">{user?.fullName || 'Haydovchi'}</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/40">
            <span className="text-white font-bold text-xl">{(user?.fullName || 'H').charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs mb-0.5">Balans</p>
            <p className="text-white font-bold text-xl">
              {user?.currentBalance !== undefined ? formatMoney(user.currentBalance) : '—'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 -mt-12 pb-28 space-y-3">
        {loading ? (
          <Spinner />
        ) : activeFlight ? (
          <>
            {/* Current direction card */}
            {currentLeg ? (
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-5 shadow-2xl shadow-primary-500/25 border border-primary-500/30">
                <p className="text-primary-200 text-[11px] font-semibold uppercase tracking-widest mb-3">
                  Hozirgi yo'nalish
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white/15 rounded-xl px-3 py-2.5 flex-1 text-center">
                    <p className="text-white/60 text-[10px] mb-0.5">Qayerdan</p>
                    <p className="text-white font-bold text-base">{currentLeg.fromCity}</p>
                  </div>
                  <ArrowRight size={18} className="text-primary-300 shrink-0" />
                  <div className="bg-white/15 rounded-xl px-3 py-2.5 flex-1 text-center">
                    <p className="text-white/60 text-[10px] mb-0.5">Qayerga</p>
                    <p className="text-white font-bold text-base">{currentLeg.toCity}</p>
                  </div>
                </div>
                {currentLeg.cargo && (
                  <p className="text-primary-200 text-xs mb-3">
                    Yuk: <span className="text-white font-medium">{currentLeg.cargo}</span>
                    {currentLeg.weight ? ` · ${currentLeg.weight} t` : ''}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-200 text-[11px]">To'lov</p>
                    <p className="text-white font-bold text-lg">{formatMoney(currentLeg.netPayment)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/driver/flight/${activeFlight.id}`)}
                    className="flex items-center gap-1.5 bg-white text-primary-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg active:scale-95 transition-transform"
                  >
                    Batafsil <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-5 shadow-2xl shadow-primary-500/25 border border-primary-500/30">
                <p className="text-primary-200 text-[11px] font-semibold uppercase tracking-widest mb-2">Joriy reys</p>
                <p className="text-white font-bold text-xl mb-4">{activeFlight.vehicle?.plateNumber || 'Mashina'}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                    <DollarSign size={13} className="text-primary-200 mx-auto mb-1" />
                    <p className="text-white font-semibold text-sm">{formatMoney(activeFlight.roadMoney, 'UZS', true)}</p>
                    <p className="text-primary-200 text-[10px]">Yo'l puli</p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                    <Clock size={13} className="text-primary-200 mx-auto mb-1" />
                    <p className="text-white font-semibold text-xs">{formatDate(activeFlight.startedAt, true)}</p>
                    <p className="text-primary-200 text-[10px]">Boshlangan</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/driver/flight/${activeFlight.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
                >
                  Reysni ko'rish <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-primary-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Yo'nalishlar</p>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {activeFlight.legs?.length || activeFlight._count?.legs || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown size={14} className="text-red-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Xarajatlar</p>
                </div>
                <p className="text-base font-bold text-red-600 dark:text-red-400 tabular-nums">
                  {formatMoney(activeFlight.lightExpenses || 0, 'UZS', true)}
                </p>
              </div>
            </div>

            {/* Add expense */}
            <button
              onClick={() => setShowExpenseForm(true)}
              className="w-full flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm px-4 py-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <Plus size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Xarajat qo'shish</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Joriy reysga xarajat kiriting</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            {/* GPS indicator */}
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400 dark:text-slate-500">GPS joylashuv uzatilmoqda</span>
            </div>
          </>
        ) : (
          <NoFlight />
        )}
      </div>

      {activeFlight && (
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          flightId={activeFlight.id}
          isDriver
          onSuccess={() => { setShowExpenseForm(false); load(); }}
        />
      )}
    </div>
  );
};

export default DriverHome;
