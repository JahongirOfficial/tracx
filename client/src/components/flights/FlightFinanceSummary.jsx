import Card from '../ui/Card';
import { formatMoney, formatDate } from '../../utils/formatters';
import {
  TrendingUp, TrendingDown, Fuel, Route, Wallet, Building2,
  HandCoins, CircleDollarSign, CheckCircle2, Calendar, Plus,
} from 'lucide-react';

/* ── Status banner config ── */
const BANNER = {
  paid:    { label: "To'liq to'langan",  cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2,    iconCls: 'text-emerald-500' },
  partial: { label: "Qisman to'langan", cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300',       icon: CircleDollarSign, iconCls: 'text-amber-500'   },
  pending: { label: "To'lanmagan",       cls: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300',                   icon: CircleDollarSign, iconCls: 'text-red-500'     },
};

/* ── Section header ── */
const SectionTitle = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 mb-3">
    <Icon size={12} className="text-slate-400 dark:text-slate-500" />
    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
      {label}
    </span>
  </div>
);

/* ── Single data row ── */
const Row = ({ label, value, valueClass = 'text-slate-700 dark:text-slate-200', bold = false, muted = false }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className={['text-sm', muted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400', bold ? 'font-semibold' : ''].join(' ')}>
      {label}
    </span>
    <span className={['text-sm tabular-nums', bold ? 'font-bold' : 'font-medium', valueClass].join(' ')}>
      {value}
    </span>
  </div>
);

const Divider = () => <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />;

const FlightFinanceSummary = ({ flight, onAddPayment }) => {
  if (!flight) return null;

  const f = flight;
  const netProfitNum  = parseFloat(f.netProfit) || 0;
  const remaining     = Math.max(0, parseFloat(f.driverOwes) - parseFloat(f.driverPaidAmount));
  const payments      = f.driverPayments || [];
  const canAddPayment = (f.status === 'active' || f.status === 'completed') && f.paymentStatus !== 'paid' && onAddPayment;

  const banner   = BANNER[f.paymentStatus] || BANNER.pending;
  const BIcon    = banner.icon;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Status banner ── */}
      <div className={['flex items-center gap-2.5 px-4 py-3 rounded-2xl border', banner.cls].join(' ')}>
        <BIcon size={15} className={banner.iconCls} />
        <span className="text-sm font-semibold">{banner.label}</span>
        <div className="flex-1" />
        {canAddPayment && (
          <button
            onClick={onAddPayment}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border border-current opacity-80 hover:opacity-100 transition-opacity"
          >
            <Plus size={11} /> To'lov qo'shish
          </button>
        )}
      </div>

      {/* ── Income ── */}
      <Card>
        <SectionTitle icon={TrendingUp} label="Daromad" />
        <Row
          label="Jami daromad"
          value={formatMoney(f.totalIncome)}
          valueClass="text-emerald-600 dark:text-emerald-400"
          bold
        />
      </Card>

      {/* ── Expenses ── */}
      <Card>
        <SectionTitle icon={TrendingDown} label="Xarajatlar" />
        <Row label="Yoqilg'i"          value={`-${formatMoney(f.fuelExpenses)}`}   valueClass="text-red-500 dark:text-red-400" />
        <Row label="Yo'l xarajatlari"  value={`-${formatMoney(f.tripExpenses)}`}   valueClass="text-red-500 dark:text-red-400" />
        <Divider />
        <Row label="Jami (yengil)"     value={`-${formatMoney(f.lightExpenses)}`}  valueClass="text-red-600 dark:text-red-400" bold />
        {parseFloat(f.heavyExpenses) > 0 && (
          <Row label="Kapital (hisob-kitobga kirmaydi)" value={formatMoney(f.heavyExpenses)} valueClass="text-slate-400 dark:text-slate-500" muted />
        )}
      </Card>

      {/* ── Profit ── */}
      <Card>
        <SectionTitle icon={CircleDollarSign} label="Foyda" />
        <Row
          label="Sof foyda"
          value={formatMoney(f.netProfit)}
          valueClass={netProfitNum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          bold
        />
        <Row
          label={`Haydovchi ulushi (${f.driverProfitPercent}%)`}
          value={`-${formatMoney(f.driverProfitAmount)}`}
          valueClass="text-slate-500 dark:text-slate-400"
        />
        <Divider />
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40">
          <span className="text-sm font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
            <Building2 size={13} />
            Biznes foydasi
          </span>
          <span className="text-base font-black text-primary-600 dark:text-primary-400 tabular-nums">
            {formatMoney(f.businessProfit)}
          </span>
        </div>
      </Card>

      {/* ── Driver settlement ── */}
      <Card>
        <SectionTitle icon={Wallet} label="Haydovchi hisob-kitobi" />

        <Row
          label="Qo'lidagi pul"
          value={formatMoney(f.driverCashInHand)}
          valueClass="text-slate-700 dark:text-slate-200"
          bold
        />
        <Row
          label="Biznesga berishi kerak"
          value={formatMoney(f.driverOwes)}
          valueClass="text-red-600 dark:text-red-400"
          bold
        />

        {/* Payment history */}
        {payments.length > 0 && (
          <>
            <Divider />
            <div className="mb-1">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Calendar size={10} /> To'lovlar tarixi
              </p>
              <div className="flex flex-col gap-1">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatDate(p.paidAt, true)}
                      </span>
                      {p.note && <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{p.note}</span>}
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatMoney(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Divider />
        <Row
          label="Jami to'langan"
          value={formatMoney(f.driverPaidAmount)}
          valueClass="text-emerald-600 dark:text-emerald-400"
          bold
        />
        {remaining > 0 && (
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 mt-1">
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <CircleDollarSign size={13} />
              Qoldiq
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatMoney(remaining)}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FlightFinanceSummary;
