import { useState } from 'react';
import Card from '../ui/Card';
import { formatMoney, formatDate } from '../../utils/formatters';
import {
  TrendingUp, TrendingDown, Fuel, Route, Wallet, Building2,
  HandCoins, CircleDollarSign, CheckCircle2, Calendar, Plus, Banknote, RefreshCw,
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

const FlightFinanceSummary = ({ flight, onAddPayment, onAddRoadMoney, onRecalculate }) => {
  const [recalcLoading, setRecalcLoading] = useState(false);

  if (!flight) return null;

  const f = flight;

  const handleRecalculate = async () => {
    if (!onRecalculate || recalcLoading) return;
    setRecalcLoading(true);
    await onRecalculate();
    setRecalcLoading(false);
  };
  const netProfitNum      = parseFloat(f.netProfit) || 0;
  const remaining         = Math.max(0, parseFloat(f.driverOwes) - parseFloat(f.driverPaidAmount));
  const payments          = f.driverPayments || [];
  const canAddPayment     = (f.status === 'active' || f.status === 'completed') && f.paymentStatus !== 'paid' && onAddPayment;
  const roadMoney         = parseFloat(f.roadMoney) || 0;
  const lightExpenses     = parseFloat(f.lightExpenses) || 0;
  const heavyExpenses     = parseFloat(f.heavyExpenses) || 0;
  const totalIncome       = parseFloat(f.totalIncome) || 0;
  const driverOwnExpenses = parseFloat(f.driverOwnExpenses) || 0;
  const hasRoadMoney      = roadMoney > 0;
  const qolganPul         = (totalIncome + roadMoney) - (lightExpenses + heavyExpenses);
  const roadPayments      = f.roadMoneyPayments || [];
  const canAddRoadMoney   = f.status === 'active' && onAddRoadMoney;

  /* ── To'lov turlari bo'yicha daromad ── */
  const PAYMENT_LABELS = {
    cash:     { label: 'Naqd',      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    peritsena:{ label: 'Peritsena', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
    card:     { label: 'Karta',     color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    transfer: { label: "O'tkazma",  color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
    other:    { label: 'Boshqa',    color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  };
  const incomeByType = {};
  for (const leg of f.legs || []) {
    if (leg.status === 'cancelled') continue;
    const t = leg.paymentType || 'other';
    incomeByType[t] = (incomeByType[t] || 0) + (parseFloat(leg.netPayment) || 0);
  }
  const incomeEntries = Object.entries(incomeByType).filter(([, v]) => v > 0);

  const banner   = BANNER[f.paymentStatus] || BANNER.pending;
  const BIcon    = banner.icon;

  return (
    <div className="flex flex-col gap-4 relative">

      {/* ── Recalculate loading overlay ── */}
      {recalcLoading && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <RefreshCw size={22} className="text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Qayta hisoblanmoqda...</p>
        </div>
      )}

      {/* ── Recalculate button ── */}
      {onRecalculate && (
        <button
          onClick={handleRecalculate}
          disabled={recalcLoading}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={recalcLoading ? 'animate-spin' : ''} />
          Moliyani qayta hisoblash
        </button>
      )}

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
            <Plus size={11} /> Pul olish
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
        {incomeEntries.length > 1 && (
          <>
            <Divider />
            <div className="flex flex-col gap-1.5">
              {incomeEntries.map(([type, amount]) => {
                const cfg = PAYMENT_LABELS[type] || PAYMENT_LABELS.other;
                const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">{pct}%</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                      {formatMoney(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {incomeEntries.length === 1 && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${(PAYMENT_LABELS[incomeEntries[0][0]] || PAYMENT_LABELS.other).color}`}>
              {(PAYMENT_LABELS[incomeEntries[0][0]] || PAYMENT_LABELS.other).label}
            </span>
            <span className="text-[11px] text-slate-400">100%</span>
          </div>
        )}
      </Card>

      {/* ── Expenses ── */}
      <Card>
        <SectionTitle icon={TrendingDown} label="Xarajatlar" />

        {/* Yo'l puli bloki */}
        <div className="mb-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Banknote size={12} /> Yo'l puli (berilgan)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-blue-700 dark:text-blue-300 tabular-nums">
                {formatMoney(roadMoney)}
              </span>
              {canAddRoadMoney && (
                <button
                  onClick={onAddRoadMoney}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                >
                  <Plus size={10} /> Qo'shish
                </button>
              )}
            </div>
          </div>
          {roadPayments.length > 0 && (
            <div className="border-t border-blue-100 dark:border-blue-800/40 px-3 py-2 flex flex-col gap-1">
              {roadPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-[11px] text-blue-500 dark:text-blue-400 tabular-nums flex items-center gap-1.5">
                    <Calendar size={9} /> {formatDate(p.paidAt, true)}
                    {p.note && <span className="text-blue-400 truncate max-w-[60px]">· {p.note}</span>}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-300 tabular-nums">
                    +{formatMoney(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Row label="Yoqilg'i"          value={`-${formatMoney(f.fuelExpenses)}`}   valueClass="text-red-500 dark:text-red-400" />
        <Row label="Yo'l xarajatlari"  value={`-${formatMoney(f.tripExpenses)}`}   valueClass="text-red-500 dark:text-red-400" />
        <Divider />
        <Row label="Jami (yengil)"     value={`-${formatMoney(f.lightExpenses)}`}  valueClass="text-red-600 dark:text-red-400" bold />
        {heavyExpenses > 0 && (
          <Row label="Kapital (hisob-kitobga kirmaydi)" value={formatMoney(heavyExpenses)} valueClass="text-slate-400 dark:text-slate-500" muted />
        )}
        <Divider />
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <CircleDollarSign size={13} /> Qolgan pul
          </span>
          <span className={`text-base font-black tabular-nums ${qolganPul >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {qolganPul >= 0 ? '+' : ''}{formatMoney(qolganPul)}
          </span>
        </div>

        {/* Haydovchi o'z cho'ntagidan to'lagan */}
        {driverOwnExpenses > 0 && (
          <>
            <Divider />
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Wallet size={12} /> Haydovchi o'z cho'ntagidan
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatMoney(driverOwnExpenses)}
              </span>
            </div>
          </>
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
