import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Plane,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { formatMoney } from '../../utils/formatters';

/* ─── Financial row in the summary table ──────────────────────── */
const FinanceRow = ({ label, value, valueClass = '', isBold = false, isLast = false }) => (
  <div
    className={[
      'flex items-center justify-between py-3',
      !isLast ? 'border-b border-slate-100 dark:border-slate-700/50' : '',
    ].join(' ')}
  >
    <span className={`text-sm ${isBold ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
      {label}
    </span>
    <span className={`text-sm font-semibold ${valueClass || 'text-slate-800 dark:text-slate-200'}`}>
      {value}
    </span>
  </div>
);

/* ─── Status count pill ────────────────────────────────────────── */
const StatusCount = ({ label, value, color }) => (
  <div className="text-center">
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
  </div>
);

/* ─── Component ────────────────────────────────────────────────── */
const Reports = () => {
  const [stats, setStats] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await api.get('/flights/stats/summary', { params });
      setStats(res.data);
    } catch {}
    setLoading(false);
  };

  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
    setTimeout(load, 100);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-enter">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hisobotlar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Moliyaviy ko'rsatgichlar va tahlil
          </p>
        </div>
        {/* Export button (placeholder) */}
        <Button variant="secondary" icon={Download} size="sm">
          Eksport
        </Button>
      </div>

      {/* ── Date range filter ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sana oralig'i
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Sana (dan)"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Sana (gacha)"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pb-[1px]">
            <Button onClick={load} loading={loading} icon={RefreshCw}>
              Qidirish
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              Tozalash
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      {stats && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Jami daromad"
              value={formatMoney(stats.totalIncome, 'UZS', true)}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Yengil xarajatlar"
              value={formatMoney(stats.lightExpenses, 'UZS', true)}
              icon={TrendingDown}
              color="orange"
            />
            <StatCard
              label="Sof foyda"
              value={formatMoney(stats.netProfit, 'UZS', true)}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              label="Jami reyslar"
              value={stats.totalFlights}
              icon={BarChart3}
              color="purple"
            />
          </div>

          {/* Status breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <Plane size={15} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white">
                Reyslar statusi bo'yicha
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100 dark:divide-slate-700/50">
              <StatusCount
                label="Faol"
                value={stats.byStatus?.active || 0}
                color="text-blue-600 dark:text-blue-400"
              />
              <StatusCount
                label="Yakunlangan"
                value={stats.byStatus?.completed || 0}
                color="text-success-600 dark:text-success-400"
              />
              <StatusCount
                label="Bekor"
                value={stats.byStatus?.cancelled || 0}
                color="text-danger-600 dark:text-danger-400"
              />
            </div>

            {/* Progress bar */}
            {stats.totalFlights > 0 && (
              <div className="mt-5">
                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                  <div
                    className="bg-blue-500 transition-all"
                    style={{
                      width: `${((stats.byStatus?.active || 0) / stats.totalFlights) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-success-500 transition-all"
                    style={{
                      width: `${((stats.byStatus?.completed || 0) / stats.totalFlights) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-danger-500 transition-all"
                    style={{
                      width: `${((stats.byStatus?.cancelled || 0) / stats.totalFlights) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2.5">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Faol
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-success-500" />
                    Yakunlangan
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                    Bekor
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Financial breakdown table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <DollarSign size={15} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Moliyaviy xulosa
                </h3>
              </div>
            </div>

            <FinanceRow
              label="Jami daromad"
              value={formatMoney(stats.totalIncome)}
              valueClass="text-success-600 dark:text-success-400"
            />
            <FinanceRow
              label="Yengil xarajatlar"
              value={formatMoney(stats.lightExpenses)}
              valueClass="text-danger-600 dark:text-danger-400"
            />
            <FinanceRow
              label="Og'ir xarajatlar"
              value={formatMoney(stats.heavyExpenses || 0)}
              valueClass="text-slate-600 dark:text-slate-400"
            />
            <FinanceRow
              label="Sof foyda"
              value={formatMoney(stats.netProfit)}
              valueClass="text-primary-600 dark:text-primary-400"
              isBold
            />
            <FinanceRow
              label="Biznes foydasi"
              value={formatMoney(stats.businessProfit)}
              valueClass="text-blue-600 dark:text-blue-400"
              isBold
              isLast
            />
          </div>
        </>
      )}

      {/* Empty / loading state */}
      {!stats && !loading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
            <BarChart3 size={22} className="text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ma'lumot yo'q
          </p>
          <p className="text-sm text-slate-400">
            Yuqorida sana tanlang va "Qidirish" tugmasini bosing
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
