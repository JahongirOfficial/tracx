import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Plane, Users, RefreshCw, Calendar,
  CheckCircle2, XCircle, Clock, Minus,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { formatMoney } from '../../utils/formatters';

/* ── Period helpers ─────────────────────────────────────────────── */
const todayRange = () => {
  const d = new Date().toISOString().slice(0, 10);
  return { dateFrom: d, dateTo: d };
};
const weekRange = () => {
  const n = new Date(), m = new Date(n);
  m.setDate(n.getDate() - n.getDay() + 1);
  const s = new Date(m); s.setDate(m.getDate() + 6);
  return { dateFrom: m.toISOString().slice(0, 10), dateTo: s.toISOString().slice(0, 10) };
};
const monthRange = () => {
  const n = new Date();
  return {
    dateFrom: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10),
    dateTo:   new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().slice(0, 10),
  };
};
const yearRange = () => {
  const y = new Date().getFullYear();
  return { dateFrom: y + '-01-01', dateTo: y + '-12-31' };
};

const PERIODS = [
  { key: 'today',  label: 'Bugun',    fn: todayRange },
  { key: 'week',   label: 'Bu hafta', fn: weekRange  },
  { key: 'month',  label: 'Bu oy',    fn: monthRange },
  { key: 'year',   label: 'Bu yil',   fn: yearRange  },
  { key: 'custom', label: 'Maxsus',   fn: null       },
];

/* ── Mini progress bar ──────────────────────────────────────────── */
const Bar = ({ pct, color }) => (
  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
    <div
      className={'h-full rounded-full transition-all duration-500 ' + color}
      style={{ width: Math.min(100, Math.max(0, pct)) + '%' }}
    />
  </div>
);

/* ── Financial row ──────────────────────────────────────────────── */
const FinRow = ({ icon: Icon, iconBg, iconColor, label, value, valueColor, pct, isTotal }) => (
  <div className={
    'flex items-center gap-3 py-3 ' +
    (isTotal
      ? 'border-t border-slate-200 dark:border-slate-700'
      : 'border-b border-slate-100 dark:border-slate-800/60 last:border-0')
  }>
    <div className={'w-8 h-8 rounded-md flex items-center justify-center shrink-0 ' + iconBg}>
      <Icon size={14} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={'text-sm ' + (isTotal ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400')}>
        {label}
      </p>
      {pct !== undefined && (
        <div className="mt-1.5">
          <Bar pct={pct} color={
            iconBg.includes('green')   ? 'bg-success-500' :
            iconBg.includes('red')     ? 'bg-danger-500'  :
            iconBg.includes('blue')    ? 'bg-blue-500'    :
            iconBg.includes('primary') ? 'bg-primary-500' : 'bg-slate-400'
          } />
        </div>
      )}
    </div>
    <p className={'text-sm font-semibold tabular-nums shrink-0 ' + valueColor}>{value}</p>
  </div>
);

/* ── Status block ───────────────────────────────────────────────── */
const StatusBlock = ({ icon: Icon, label, count, color, bgColor, total }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
    <div className={'w-8 h-8 rounded-md flex items-center justify-center shrink-0 ' + bgColor}>
      <Icon size={14} className={color} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
        <span className={'text-sm font-bold tabular-nums ' + color}>{count}</span>
      </div>
      <Bar
        pct={total > 0 ? (count / total) * 100 : 0}
        color={
          bgColor.includes('blue')  ? 'bg-blue-500'    :
          bgColor.includes('green') ? 'bg-success-500' : 'bg-danger-500'
        }
      />
    </div>
    {total > 0 && (
      <span className="text-xs text-slate-400 tabular-nums w-9 text-right shrink-0">
        {Math.round((count / total) * 100)}%
      </span>
    )}
  </div>
);

/* ── Debt row ───────────────────────────────────────────────────── */
const DebtRow = ({ driver }) => {
  const remaining = driver.totalOwed - driver.totalPaid;
  const paidPct   = driver.totalOwed > 0 ? (driver.totalPaid / driver.totalOwed) * 100 : 0;
  return (
    <tr className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-0.5">{driver.fullName}</p>
        <Badge
          status={driver.status}
          label={driver.status === 'free' ? "Bo'sh" : driver.status === 'busy' ? 'Band' : driver.status}
          dot size="xs"
        />
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
        {formatMoney(driver.totalOwed)}
      </td>
      <td className="px-4 py-3 text-sm text-success-600 dark:text-success-400 tabular-nums">
        {formatMoney(driver.totalPaid)}
      </td>
      <td className="px-4 py-3 min-w-[160px]">
        <p className="text-sm font-semibold text-danger-600 dark:text-danger-400 tabular-nums mb-1">
          {formatMoney(remaining)}
        </p>
        <Bar pct={paidPct} color="bg-success-500" />
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
          {driver.pendingFlights} reys
        </span>
      </td>
    </tr>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const Reports = () => {
  const [stats,    setStats]    = useState(null);
  const [debts,    setDebts]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [period,   setPeriod]   = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.allSettled([
        api.get('/flights/stats/summary', { params }),
        api.get('/flights/driver-debts'),
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      if (dRes.status === 'fulfilled') setDebts(dRes.value.data || []);
    } finally { setLoading(false); }
  }, []);

  /* Default: this month */
  useEffect(() => {
    const p = monthRange();
    setDateFrom(p.dateFrom);
    setDateTo(p.dateTo);
    load(p);
  }, []);

  const handlePeriod = (key) => {
    setPeriod(key);
    if (key === 'custom') return;
    const p = PERIODS.find(x => x.key === key).fn();
    setDateFrom(p.dateFrom);
    setDateTo(p.dateTo);
    load(p);
  };

  /* Derived values */
  const income   = stats?.totalIncome || 0;
  const totalExp = (stats?.lightExpenses || 0) + (stats?.heavyExpenses || 0);
  const totalF   = stats?.totalFlights  || 0;

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="page-enter space-y-4">

      {/* Period selector card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Tab strip */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => handlePeriod(p.key)}
              className={
                'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 ' +
                (period === p.key
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom range inputs */}
        {period === 'custom' ? (
          <div className="px-4 py-3 flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Dan</p>
              <input
                type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Gacha</p>
              <input
                type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
              />
            </div>
            <Button onClick={() => load({ dateFrom, dateTo })} loading={loading} icon={RefreshCw} size="sm">
              Qidirish
            </Button>
          </div>
        ) : (
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar size={11} />
              <span>{dateFrom && dateTo ? dateFrom + ' — ' + dateTo : '—'}</span>
            </div>
            <button
              onClick={() => load({ dateFrom, dateTo })} disabled={loading}
              className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-40"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              Yangilash
            </button>
          </div>
        )}
      </div>

      {/* Skeleton */}
      {loading && !stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-28 rounded-lg skeleton-shimmer" />)}
        </div>
      )}

      {/* ── Data ────────────────────────────────────────────────── */}
      {stats && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Jami daromad" value={formatMoney(income,   'UZS', true)} icon={TrendingUp}  color="green"  />
            <StatCard label="Jami xarajat" value={formatMoney(totalExp, 'UZS', true)} icon={TrendingDown} color="orange" />
            <StatCard label="Sof foyda"    value={formatMoney(stats.netProfit, 'UZS', true)} icon={DollarSign} color="blue" />
            <StatCard label="Jami reyslar" value={totalF}                               icon={BarChart3}   color="purple" />
          </div>

          {/* Finance + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* ── Financial breakdown (3/5) ── */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                    Moliyaviy tahlil
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">{dateFrom} — {dateTo}</p>
                </div>
                {income > 0 && (
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Rentabellik</p>
                    <p className={'text-2xl font-black tabular-nums ' + (stats.netProfit >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400')}>
                      {Math.round((stats.netProfit / income) * 100)}%
                    </p>
                  </div>
                )}
              </div>

              <FinRow icon={TrendingUp}
                iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600 dark:text-green-400"
                label="Jami daromad" value={formatMoney(income)}
                valueColor="text-success-600 dark:text-success-400" pct={100} />

              <FinRow icon={Minus}
                iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500 dark:text-red-400"
                label="Yengil xarajatlar" value={'— ' + formatMoney(stats.lightExpenses)}
                valueColor="text-danger-600 dark:text-danger-400"
                pct={income > 0 ? (stats.lightExpenses / income) * 100 : 0} />

              <FinRow icon={Minus}
                iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-500 dark:text-orange-400"
                label="Og'ir xarajatlar" value={'— ' + formatMoney(stats.heavyExpenses || 0)}
                valueColor="text-warning-600 dark:text-warning-400"
                pct={income > 0 ? ((stats.heavyExpenses || 0) / income) * 100 : 0} />

              <FinRow icon={Users}
                iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-500 dark:text-purple-400"
                label="Haydovchi ulushi" value={'— ' + formatMoney(stats.driverProfitAmount || 0)}
                valueColor="text-slate-600 dark:text-slate-400"
                pct={income > 0 ? ((stats.driverProfitAmount || 0) / income) * 100 : 0} />

              <FinRow icon={DollarSign}
                iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600 dark:text-blue-400"
                label="Sof foyda" value={formatMoney(stats.netProfit)}
                valueColor={stats.netProfit >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}
                pct={income > 0 ? (Math.abs(stats.netProfit) / income) * 100 : 0}
                isTotal />

              <FinRow icon={TrendingUp}
                iconBg="bg-primary-50 dark:bg-primary-900/20" iconColor="text-primary-600 dark:text-primary-400"
                label="Biznes foydasi" value={formatMoney(stats.businessProfit || 0)}
                valueColor="text-primary-600 dark:text-primary-400"
                isTotal />
            </div>

            {/* ── Flight status (2/5) ── */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Reys holati
              </p>

              {totalF === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Plane size={28} className="text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">Reyslar yo'q</p>
                </div>
              ) : (
                <>
                  <div className="text-center py-4">
                    <p className="text-5xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{totalF}</p>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest">Jami reys</p>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mb-3" />

                  <StatusBlock icon={Clock}        label="Faol"           count={stats.byStatus?.active    || 0} color="text-blue-600 dark:text-blue-400"       bgColor="bg-blue-50 dark:bg-blue-900/20"   total={totalF} />
                  <StatusBlock icon={CheckCircle2} label="Yakunlangan"    count={stats.byStatus?.completed || 0} color="text-success-600 dark:text-success-400" bgColor="bg-green-50 dark:bg-green-900/20" total={totalF} />
                  <StatusBlock icon={XCircle}      label="Bekor qilingan" count={stats.byStatus?.cancelled || 0} color="text-danger-600 dark:text-danger-400"   bgColor="bg-red-50 dark:bg-red-900/20"    total={totalF} />

                  {/* Segmented bar */}
                  <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-px">
                    {(stats.byStatus?.active    || 0) > 0 && <div className="bg-blue-500 transition-all"    style={{ width: ((stats.byStatus.active)    / totalF * 100) + '%' }} />}
                    {(stats.byStatus?.completed || 0) > 0 && <div className="bg-success-500 transition-all" style={{ width: ((stats.byStatus.completed)  / totalF * 100) + '%' }} />}
                    {(stats.byStatus?.cancelled || 0) > 0 && <div className="bg-danger-400 transition-all"  style={{ width: ((stats.byStatus.cancelled)  / totalF * 100) + '%' }} />}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Driver debts */}
          {debts.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                  Haydovchi qarzdorligi
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {debts.length} haydovchi &middot; Jami{' '}
                  <span className="font-semibold text-danger-600 dark:text-danger-400">
                    {formatMoney(debts.reduce((s, d) => s + (d.totalOwed - d.totalPaid), 0), 'UZS', true)}
                  </span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50/60 dark:bg-slate-800/30">
                      {["Haydovchi", "Jami", "To'langan", "Qoldiq", "Reyslar"].map((h, i) => (
                        <th key={h} className={'px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ' + (i === 4 ? 'text-center' : 'text-left')}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map(d => <DebtRow key={d.id} driver={d} />)}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-lg">
              <CheckCircle2 size={15} className="text-success-600 dark:text-success-400 shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Barcha haydovchilar to'lovlari to'liq — qarzdorlik yo'q
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!stats && !loading && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <BarChart3 size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ma'lumot yuklanmadi</p>
          <p className="text-xs text-slate-400">Yangilash tugmasini bosing</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
