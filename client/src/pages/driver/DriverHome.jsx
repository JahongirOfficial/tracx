import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Plus,
  MapPin,
  Truck,
  ArrowRight,
  Clock,
  DollarSign,
  Package,
  Wifi,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ExpenseForm from '../../components/flights/ExpenseForm';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import { formatMoney, formatDate } from '../../utils/formatters';

/* ─── Loading spinner ──────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center py-14">
    <div className="w-9 h-9 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ─── No active flight state ───────────────────────────────────── */
const NoFlight = () => (
  <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
    {/* Animated icon */}
    <div className="relative mb-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/10 rounded-2xl blur-xl scale-150"
      />
      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-lg border border-white/60 dark:border-slate-600/40">
        <Plane size={36} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
      </div>
    </div>
    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
      Faol reys yo'q
    </h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
      Biznesmen tomonidan reys ochilishini kuting. GPS joylashuv avtomatik uzatiladi.
    </p>
    {/* GPS indicator */}
    <div className="flex items-center gap-2 mt-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-2 rounded-full">
      <Wifi size={13} />
      GPS faol
    </div>
  </div>
);

/* ─── Component ────────────────────────────────────────────────── */
const DriverHome = () => {
  const [activeFlight, setActiveFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadActiveFlight = async () => {
      try {
        const res = await api.get('/driver/flights', {
          params: { status: 'active', limit: 1 },
        });
        setActiveFlight(res.data?.[0] || null);
      } catch {}
      setLoading(false);
    };
    loadActiveFlight();

    /* GPS tracking */
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          api
            .put('/driver/location', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: pos.coords.speed,
              heading: pos.coords.heading,
            })
            .catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="page-enter min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top profile bar ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 px-4 pt-6 pb-14">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-300 text-sm font-medium">Xush kelibsiz</p>
            <h1 className="text-white text-xl font-bold mt-0.5">
              {user?.fullName || 'Haydovchi'}
            </h1>
          </div>
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-lg">
              {(user?.fullName || 'H').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Balance card (inline) */}
        <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs">Balans</p>
            <p className="text-white font-bold text-lg mt-0.5">
              {user?.currentBalance !== undefined
                ? formatMoney(user.currentBalance, 'UZS', true)
                : '—'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-xs font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ────────────────────────────── */}
      <div className="px-4 -mt-8">
        {loading ? (
          <Spinner />
        ) : activeFlight ? (
          <div className="space-y-3">
            {/* Active flight card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-4 shadow-xl shadow-primary-500/20 border border-primary-500/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-primary-200 text-xs font-medium uppercase tracking-wide mb-1">
                    Joriy reys
                  </p>
                  <p className="text-white font-bold text-lg">
                    {activeFlight.vehicle?.plateNumber || 'Mashina'}
                  </p>
                </div>
                <Badge status="active" label="Faol" />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {/* Road money */}
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <DollarSign size={14} className="text-primary-200 mx-auto mb-1" />
                  <p className="text-white font-semibold text-sm">
                    {formatMoney(activeFlight.roadMoney, 'UZS', true)}
                  </p>
                  <p className="text-primary-200 text-[10px]">Yo'l puli</p>
                </div>
                {/* Legs count */}
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <Package size={14} className="text-primary-200 mx-auto mb-1" />
                  <p className="text-white font-bold text-xl">
                    {activeFlight._count?.legs || 0}
                  </p>
                  <p className="text-primary-200 text-[10px]">Buyurtma</p>
                </div>
                {/* Start date */}
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <Clock size={14} className="text-primary-200 mx-auto mb-1" />
                  <p className="text-white font-semibold text-xs">
                    {formatDate(activeFlight.startedAt, true)}
                  </p>
                  <p className="text-primary-200 text-[10px]">Boshlangan</p>
                </div>
              </div>

              {/* View button */}
              <Button
                fullWidth
                onClick={() => navigate(`/driver/flight/${activeFlight.id}`)}
                className="mt-3 bg-white text-primary-700 hover:bg-primary-50 font-semibold"
                icon={ArrowRight}
              >
                Reysni batafsil ko'rish
              </Button>
            </div>

            {/* Add expense button */}
            <button
              onClick={() => setShowExpenseForm(true)}
              className="w-full flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card px-4 py-4 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-emerald-600 flex items-center justify-center shadow-md shadow-success-500/25">
                  <Plus size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Xarajat qo'shish
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Joriy reysga xarajat kiriting
                  </p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>

            {/* GPS status */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                GPS joylashuv uzatilmoqda
              </span>
            </div>
          </div>
        ) : (
          <NoFlight />
        )}
      </div>

      {/* ── Expense form modal ────────────────────────────────── */}
      {activeFlight && (
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          flightId={activeFlight.id}
          isDriver
          onSuccess={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );
};

export default DriverHome;
