import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  TrendingUp,
  Users,
  Clock,
  Plus,
  ArrowRight,
  Plane,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FlightForm from '../../components/flights/FlightForm';
import DriverForm from '../../components/drivers/DriverForm';
import api from '../../services/api';
import { formatMoney, formatDate } from '../../utils/formatters';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

/* ─── Quick action config ──────────────────────────────────────── */
const quickActions = (navigate, setShowFlightForm, setShowDriverForm) => [
  {
    label: 'Yangi reys',
    icon: Plane,
    color: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/25',
    onClick: () => setShowFlightForm(true),
  },
  {
    label: 'Yangi haydovchi',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/25',
    onClick: () => setShowDriverForm(true),
  },
  {
    label: 'Yangi mashina',
    icon: Truck,
    color: 'from-green-500 to-emerald-600',
    shadow: 'shadow-green-500/25',
    onClick: () => navigate('/dashboard/vehicles'),
  },
];

/* ─── Subscription status banner ──────────────────────────────── */
const SubscriptionBanner = ({ user }) => {
  if (!user?.plan || user.plan !== 'trial') return null;

  const end = user.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
  const daysLeft = end ? Math.max(0, Math.ceil((end - Date.now()) / 86400000)) : null;

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3 mb-5">
      <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
        <strong>Trial davri:</strong>{' '}
        {daysLeft !== null ? `${daysLeft} kun qoldi.` : 'Muddat tugayapti.'}{' '}
        SuperAdmin bilan bog'laning.
      </p>
    </div>
  );
};

/* ─── Component ────────────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentFlights, setRecentFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [pendingDebts, setPendingDebts] = useState(0);

  const { t } = useUiStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  /* ── Data loading ─────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, flightsRes, activeRes, driversRes, vehiclesRes, debtsRes] =
          await Promise.allSettled([
            api.get('/flights/stats/summary'),
            api.get('/flights', { params: { limit: 5 } }),
            api.get('/flights', { params: { limit: 1, status: 'active' } }),
            api.get('/drivers', { params: { limit: 1 } }),
            api.get('/vehicles', { params: { limit: 1 } }),
            api.get('/flights/driver-debts'),
          ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (flightsRes.status === 'fulfilled') setRecentFlights(flightsRes.value.data || []);
        if (activeRes.status === 'fulfilled')
          setActiveCount(activeRes.value.meta?.total || 0);
        if (driversRes.status === 'fulfilled')
          setDriverCount(driversRes.value.meta?.total || 0);
        if (vehiclesRes.status === 'fulfilled')
          setVehicleCount(vehiclesRes.value.meta?.total || 0);
        if (debtsRes.status === 'fulfilled') {
          const total = (debtsRes.value.data || []).reduce(
            (s, d) => s + (d.totalOwed - d.totalPaid),
            0,
          );
          setPendingDebts(total);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  /* ── Table columns ────────────────────────────────────────────── */
  const flightColumns = [
    {
      key: 'driver',
      title: 'Haydovchi',
      render: (_, r) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {r.driver?.fullName || '—'}
        </span>
      ),
    },
    {
      key: 'vehicle',
      title: 'Mashina',
      render: (_, r) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
          {r.vehicle?.plateNumber || '—'}
        </span>
      ),
    },
    {
      key: 'totalIncome',
      title: 'Daromad',
      render: (v) => (
        <span className="font-semibold text-success-600 dark:text-success-400">
          {formatMoney(v, 'UZS', true)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (v) => (
        <Badge
          status={v}
          label={v === 'active' ? 'Faol' : v === 'completed' ? 'Yakunlangan' : 'Bekor'}
        />
      ),
    },
    {
      key: 'startedAt',
      title: 'Sana',
      render: (v) => (
        <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(v, true)}</span>
      ),
    },
  ];

  const actions = quickActions(navigate, setShowFlightForm, setShowDriverForm);

  return (
    <div className="page-enter">
      {/* ── Subscription banner ──────────────────────────────── */}
      <SubscriptionBanner user={user} />

      {/* ── Welcome banner ───────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 p-5 md:p-6"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)' }}
      >
        {/* Decorative background circles for depth */}
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute right-16 -bottom-10 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-300 text-xs font-medium mb-1 uppercase tracking-widest">
              Xush kelibsiz
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {user?.fullName ? user.fullName.split(' ')[0] : t('dashboard.title')} 👋
            </h1>
            <p className="text-blue-200/80 text-sm mt-1">
              Bugungi ko'rsatgichlar va faoliyat
            </p>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <button
              onClick={() => setShowDriverForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              <Users size={14} />
              Haydovchi
            </button>
            <button
              onClick={() => setShowFlightForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-primary-700 text-xs font-bold hover:bg-blue-50 transition-colors shadow-md"
            >
              <Plus size={14} />
              Yangi reys
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t('dashboard.activeFlights')}
          value={activeCount}
          icon={Truck}
          color="blue"
          onClick={() => navigate('/dashboard/flights?status=active')}
        />
        <StatCard
          label={t('dashboard.monthlyIncome')}
          value={formatMoney(stats?.totalIncome || 0, 'UZS', true)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label={t('dashboard.totalDrivers')}
          value={driverCount}
          icon={Users}
          color="purple"
          onClick={() => navigate('/dashboard/drivers')}
        />
        <StatCard
          label="Kutilayotgan to'lovlar"
          value={formatMoney(pendingDebts, 'UZS', true)}
          icon={Clock}
          color="orange"
          onClick={() => navigate('/dashboard/flights')}
        />
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={[
                'flex flex-col items-center justify-center gap-2.5',
                'rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60',
                'bg-white dark:bg-slate-800/80',
                'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
                'transition-all duration-150 group',
              ].join(' ')}
            >
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg ${action.shadow} flex items-center justify-center group-hover:scale-105 transition-transform duration-150`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Recent flights ────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              {t('dashboard.recentFlights')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Oxirgi 5 ta reys
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/flights')}
            icon={ChevronRight}
          >
            Barchasi
          </Button>
        </div>

        <Table
          columns={flightColumns}
          data={recentFlights}
          loading={loading}
          emptyTitle="Reyslar yo'q"
          emptyDescription="Yangi reys yaratish uchun yuqoridagi tugmani bosing"
          onRowClick={(r) => navigate(`/dashboard/flights/${r.id}`)}
        />
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <FlightForm isOpen={showFlightForm} onClose={() => setShowFlightForm(false)} />
      <DriverForm isOpen={showDriverForm} onClose={() => setShowDriverForm(false)} />
    </div>
  );
};

export default Dashboard;
