/**
 * FlightFinanceSummary — beautiful financial summary card for a flight.
 *
 * Sections:
 *   Payment status banner  — colored banner at top (paid/partial/pending).
 *   Income table           — total income (green).
 *   Expenses table         — fuel, trip, light total, heavy (muted).
 *   Profit table           — net profit, driver share, business profit (blue).
 *   Driver settlement box  — road money, cash in hand, owes, paid, remaining.
 *
 * Color coding:
 *   Income rows  → emerald
 *   Expense rows → red
 *   Profit rows  → blue / primary
 *   Neutral      → slate
 *
 * Props:
 *   flight       — flight object
 *   onAddPayment — optional callback to open add-payment modal
 */

import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  Route,
  Wallet,
  Building2,
  Banknote,
  HandCoins,
  CircleDollarSign,
  CheckCircle2,
} from 'lucide-react';

/* ── Helper: single table row ── */
const Row = ({
  label,
  value,
  valueClass = 'text-slate-700 dark:text-slate-300',
  bold = false,
  muted = false,
  icon: Icon,
}) => (
  <div
    className={[
      'flex items-center justify-between py-2',
      bold ? '' : '',
    ].join(' ')}
  >
    <span
      className={[
        'flex items-center gap-2 text-sm',
        muted
          ? 'text-slate-400 dark:text-slate-500'
          : 'text-slate-600 dark:text-slate-400',
        bold ? 'font-semibold' : '',
      ].join(' ')}
    >
      {Icon && <Icon size={13} className="shrink-0 opacity-70" />}
      {label}
    </span>
    <span
      className={[
        'text-sm tabular-nums',
        bold ? 'font-bold' : 'font-medium',
        valueClass,
      ].join(' ')}
    >
      {value}
    </span>
  </div>
);

/* ── Helper: section divider ── */
const Divider = () => <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />;

/* ── Payment status banner config ── */
const PAYMENT_BANNER = {
  paid: {
    label: "To'liq to'langan",
    className:
      'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
  },
  partial: {
    label: "Qisman to'langan",
    className:
      'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300',
    icon: CircleDollarSign,
    iconClass: 'text-amber-500',
  },
  pending: {
    label: "To'lanmagan",
    className:
      'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300',
    icon: CircleDollarSign,
    iconClass: 'text-red-500',
  },
};

const FlightFinanceSummary = ({ flight, onAddPayment }) => {
  if (!flight) return null;

  const f = flight;
  const remaining = parseFloat(f.driverOwes) - parseFloat(f.driverPaidAmount);
  const netProfitNum = parseFloat(f.netProfit) || 0;

  const banner = PAYMENT_BANNER[f.paymentStatus] || PAYMENT_BANNER.pending;
  const BannerIcon = banner.icon;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* ── Payment status banner ── */}
      <div
        className={[
          'flex items-center gap-2.5 px-5 py-3',
          banner.className,
        ].join(' ')}
      >
        <BannerIcon size={16} className={banner.iconClass} />
        <span className="text-sm font-semibold">{banner.label}</span>
        <div className="flex-1" />
        {/* Add payment button inside banner */}
        {f.status === 'completed' && f.paymentStatus !== 'paid' && onAddPayment && (
          <button
            onClick={onAddPayment}
            className={[
              'px-3 py-1 rounded-lg text-xs font-semibold border transition-colors duration-150',
              'border-current opacity-80 hover:opacity-100',
            ].join(' ')}
          >
            To'lov qo'shish
          </button>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-1">

        {/* ── Income ── */}
        <div className="mb-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingUp size={11} />
            Daromad
          </p>
          <Row
            label="Jami daromad"
            value={formatMoney(f.totalIncome)}
            valueClass="text-emerald-600 dark:text-emerald-400"
            bold
            icon={TrendingUp}
          />
        </div>

        <Divider />

        {/* ── Expenses ── */}
        <div className="mb-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 mt-2">
            <TrendingDown size={11} />
            Xarajatlar
          </p>
          <Row
            label="Yoqilg'i"
            value={`-${formatMoney(f.fuelExpenses)}`}
            valueClass="text-red-500 dark:text-red-400"
            icon={Fuel}
          />
          <Row
            label="Yo'l xarajatlari"
            value={`-${formatMoney(f.tripExpenses)}`}
            valueClass="text-red-500 dark:text-red-400"
            icon={Route}
          />
          <Row
            label="Yengil xarajatlar jami"
            value={`-${formatMoney(f.lightExpenses)}`}
            valueClass="text-red-600 dark:text-red-400"
            bold
            icon={TrendingDown}
          />
          <Row
            label="Og'ir xarajatlar (hisob-kitobga kirmaydi)"
            value={formatMoney(f.heavyExpenses)}
            valueClass="text-slate-400 dark:text-slate-500"
            muted
          />
        </div>

        <Divider />

        {/* ── Profit ── */}
        <div className="mb-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 mt-2">
            <CircleDollarSign size={11} />
            Foyda
          </p>
          <Row
            label="Sof foyda"
            value={formatMoney(f.netProfit)}
            valueClass={
              netProfitNum >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }
            bold
            icon={TrendingUp}
          />
          <Row
            label={`Haydovchi ulushi (${f.driverProfitPercent}%)`}
            value={`-${formatMoney(f.driverProfitAmount)}`}
            valueClass="text-slate-500 dark:text-slate-400"
            icon={HandCoins}
          />
          <Row
            label="Biznes foydasi"
            value={formatMoney(f.businessProfit)}
            valueClass="text-primary-600 dark:text-primary-400"
            bold
            icon={Building2}
          />
        </div>

        <Divider />

        {/* ── Driver settlement ── */}
        <div
          className={[
            'rounded-2xl p-4 mt-2',
            'bg-slate-50 dark:bg-slate-800/50',
            'border border-slate-200 dark:border-slate-700',
          ].join(' ')}
        >
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wallet size={11} />
            Haydovchi hisob-kitobi
          </p>
          <Row
            label="Yo'l puli"
            value={formatMoney(f.roadMoney)}
            icon={Banknote}
          />
          <Row
            label="Haydovchi qo'lidagi pul"
            value={formatMoney(f.driverCashInHand)}
            bold
            icon={HandCoins}
          />
          <Divider />
          <Row
            label="Biznesga berishi kerak"
            value={formatMoney(f.driverOwes)}
            valueClass="text-red-600 dark:text-red-400"
            bold
            icon={TrendingUp}
          />
          <Row
            label="To'langan"
            value={formatMoney(f.driverPaidAmount)}
            valueClass="text-emerald-600 dark:text-emerald-400"
            icon={CheckCircle2}
          />
          {remaining > 0 && (
            <Row
              label="Qoldiq"
              value={formatMoney(remaining)}
              valueClass="text-amber-600 dark:text-amber-400"
              bold
              icon={CircleDollarSign}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default FlightFinanceSummary;
