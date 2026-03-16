import Card from '../ui/Card';
import {
  TrendingUp, TrendingDown,
  CircleDollarSign, Wallet, Fuel,
} from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

/* ── Horizontal bar row ── */
const BarRow = ({ label, value, max, colorClass, icon: Icon, pct: forcedPct }) => {
  const pct = forcedPct !== undefined ? forcedPct : (max > 0 ? Math.min(100, (Math.max(0, value) / max) * 100) : 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {Icon && <Icon size={11} />}
          {label}
        </span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
          {formatMoney(value)}
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ── Mini stat tile ── */
const StatTile = ({ label, value, sub, colorClass = 'text-slate-800 dark:text-white', bgClass = 'bg-slate-50 dark:bg-slate-800/60' }) => (
  <div className={`rounded-xl p-3 ${bgClass} border border-slate-100 dark:border-slate-700/50`}>
    <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{label}</p>
    <p className={`text-sm font-black tabular-nums ${colorClass}`}>{value}</p>
    {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const FlightFinanceCharts = ({ flight }) => {
  if (!flight) return null;

  const totalIncome   = parseFloat(flight.totalIncome)       || 0;
  const lightExpenses = parseFloat(flight.lightExpenses)     || 0;
  const netProfit     = parseFloat(flight.netProfit)         || 0;
  const fuelExpenses  = parseFloat(flight.fuelExpenses)      || 0;
  const tripExpenses  = parseFloat(flight.tripExpenses)      || 0;
  const driverOwnExp  = parseFloat(flight.driverOwnExpenses) || 0;

  const marginPct = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">

      {/* ── 1. Income vs Expenses bars ── */}
      <Card>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Daromad &amp; Xarajatlar
        </p>

        {/* Quick KPI row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatTile
            label="Daromad"
            value={formatMoney(totalIncome)}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-50 dark:bg-emerald-900/10"
          />
          <StatTile
            label="Xarajat"
            value={formatMoney(lightExpenses)}
            colorClass="text-red-600 dark:text-red-400"
            bgClass="bg-red-50 dark:bg-red-900/10"
          />
          <StatTile
            label="Sof foyda"
            value={formatMoney(netProfit)}
            sub={`${marginPct}% margin`}
            colorClass={netProfit >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}
            bgClass="bg-primary-50 dark:bg-primary-900/10"
          />
        </div>

        <div className="flex flex-col gap-3.5">
          <BarRow label="Jami daromad"   value={totalIncome}           max={totalIncome}  colorClass="bg-emerald-500"   icon={TrendingUp} />
          <BarRow label="Yoqilg'i"       value={fuelExpenses}          max={totalIncome}  colorClass="bg-red-400"       icon={Fuel} />
          <BarRow label="Yo'l xarajat"   value={tripExpenses}          max={totalIncome}  colorClass="bg-orange-400"    icon={TrendingDown} />
          {driverOwnExp > 0 && (
            <BarRow label="Haydovchi o'z cho'ntagidan" value={driverOwnExp} max={totalIncome} colorClass="bg-amber-400" icon={Wallet} />
          )}
          <BarRow label="Sof foyda"      value={Math.max(0, netProfit)} max={totalIncome} colorClass="bg-primary-500"   icon={CircleDollarSign} />
        </div>
      </Card>

    </div>
  );
};

export default FlightFinanceCharts;
