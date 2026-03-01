import { useEffect, useState } from 'react';
import {
  Building2, Users, Truck, Activity,
  TrendingUp, Wallet, AlertTriangle, Clock,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';
import { formatMoney } from '../../utils/formatters';

const SkeletonCard = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 h-28" />
);

const InfoRow = ({ label, value, sub }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <div className="text-right">
      <span className="text-sm font-semibold text-slate-800 dark:text-white">{value}</span>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/super-admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl h-48 border border-slate-200/60 dark:border-slate-700/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Boshqaruv paneli
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Avtojon platformasi umumiy ko'rinishi
        </p>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Biznesmenlar"
          value={`${stats.activeBusinessmen} / ${stats.totalBusinessmen}`}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Haydovchilar"
          value={stats.totalDrivers}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Mashinalar"
          value={stats.totalVehicles}
          icon={Truck}
          color="green"
        />
        <StatCard
          label="Faol reyslar"
          value={stats.activeFlights}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Secondary info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp size={17} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Moliyaviy ko'rsatkichlar</p>
          </div>
          <InfoRow label="Jami daromad"    value={formatMoney(stats.totalRevenue || 0)} />
          <InfoRow label="Jami foyda"      value={formatMoney(stats.totalProfit  || 0)} />
          <InfoRow label="Jami reyslar"    value={stats.totalFlights} />
          <InfoRow label="Faol reyslar"    value={stats.activeFlights} />
        </div>

        {/* Platform balance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Wallet size={17} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Platforma balansi</p>
          </div>
          <InfoRow
            label="Jami balans"
            value={formatMoney(stats.totalPlatformBalance || 0)}
            sub="faol biznesmenlar"
          />
          <InfoRow label="Sinov davrida"   value={stats.trialCount ?? 0} sub="ta biznesmen" />
          <InfoRow label="To'xtatilgan"    value={stats.suspendedCount ?? 0} sub="ta biznesmen" />
        </div>

        {/* Users summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Users size={17} className="text-violet-600 dark:text-violet-400" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">Foydalanuvchilar</p>
          </div>
          <InfoRow label="Jami biznesmenlar"  value={stats.totalBusinessmen} />
          <InfoRow label="Faol biznesmenlar"  value={stats.activeBusinessmen} />
          <InfoRow
            label="Bloklangan"
            value={stats.totalBusinessmen - stats.activeBusinessmen}
          />
          <InfoRow label="Jami haydovchilar"  value={stats.totalDrivers} />
        </div>
      </div>

      {/* Alert banner if suspensions exist */}
      {stats.suspendedCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3.5">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {stats.suspendedCount} ta biznesmen to'xtatilgan
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400/80 mt-0.5">
              Balanslari yetarli emas. Biznesmenlar bo'limida balanslari to'ldiring.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
