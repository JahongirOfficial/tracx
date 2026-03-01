import { useEffect, useState } from 'react';
import {
  Wallet, TrendingUp, Clock, Truck,
  CreditCard, ArrowDownCircle, ArrowUpCircle, AlertTriangle,
  CheckCircle, Gift, RefreshCw, ExternalLink,
} from 'lucide-react';
import useBalanceStore from '../../stores/balanceStore';
import useUiStore from '../../stores/uiStore';
import { formatMoney, formatDateTime } from '../../utils/formatters';

/* ── Helpers ── */
const daysColor = (days) => {
  if (days <= 3)  return { bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    bar: 'bg-red-500' };
  if (days <= 7)  return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' };
  return          { bg: 'bg-emerald-50 dark:bg-emerald-900/20',    text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' };
};

const TX_ICONS = {
  topup:        { icon: ArrowUpCircle,   cls: 'text-emerald-500' },
  daily_charge: { icon: ArrowDownCircle, cls: 'text-red-400' },
  manual:       { icon: RefreshCw,       cls: 'text-blue-400' },
  trial_start:  { icon: Gift,            cls: 'text-purple-400' },
};

const AMOUNTS = [30_000, 50_000, 100_000, 150_000, 200_000, 300_000];

/* ── Balance page ── */
const Balance = () => {
  const { info, transactions, meta, loading, txLoading, fetchBalance, fetchTransactions, createCheckout, manualTopUp } = useBalanceStore();
  const { addToast } = useUiStore();

  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(page);
  }, [page]);

  const handleTopUp = async () => {
    const amount = selectedAmount || parseInt(customAmount.replace(/\D/g, ''), 10);
    if (!amount || amount < 10_000) {
      addToast("Minimal miqdor 10,000 UZS bo'lishi kerak", 'error');
      return;
    }
    setCheckoutLoading(true);
    try {
      // Always open Payme checkout (test or production)
      const data = await createCheckout(amount);
      window.open(data.url, '_blank');
      addToast("Payme to'lov oynasi ochildi. To'lovdan so'ng balans yangilanadi.", 'success');
    } catch {
      addToast("Checkout yaratishda xato. Qayta urinib ko'ring.", 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const days  = info?.daysLeft ?? 0;
  const dc    = daysColor(days);
  const barPct = Math.min(100, (days / 30) * 100);

  return (
    <div className="page-enter space-y-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          Balans
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          To'lov va tranzaksiyalar tarixi
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 skeleton-shimmer rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Top cards row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Balance card */}
            <div className="sm:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-lg shadow-primary-600/20 relative overflow-hidden">
              {/* decorative circles */}
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet size={16} className="opacity-80" />
                  <span className="text-sm font-medium opacity-80">Joriy balans</span>
                </div>
                <p className="text-3xl font-extrabold tabular-nums leading-none mb-1">
                  {formatMoney(info?.balance ?? 0, 'UZS')}
                </p>
                {info?.isTrial && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    <Gift size={11} /> Sinov davri
                  </span>
                )}
              </div>
            </div>

            {/* Days remaining */}
            <div className={['rounded-2xl p-5 border', dc.bg, 'border-transparent'].join(' ')}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={15} className={dc.text} />
                <span className={['text-sm font-semibold', dc.text].join(' ')}>
                  {info?.isTrial ? 'Sinov muddati' : 'Qolgan kunlar'}
                </span>
              </div>
              <p className={['text-4xl font-extrabold tabular-nums leading-none mb-3', dc.text].join(' ')}>
                {info?.isTrial ? info?.trialDaysLeft : days}
                <span className="text-base font-normal ml-1 opacity-70">kun</span>
              </p>
              {/* Progress bar */}
              <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={['h-full rounded-full transition-all duration-500', dc.bar].join(' ')}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>

            {/* Daily cost */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Kunlik to'lov</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mb-1">
                {formatMoney(info?.dailyCost ?? 0, 'UZS')}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {info?.vehicleCount ?? 0} ta mashina × 1,000 UZS/kun
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 tabular-nums">
                Oyiga ~{formatMoney((info?.dailyCost ?? 0) * 30, 'UZS', true)}
              </div>
            </div>
          </div>

          {/* ── Status banner (if suspended / low balance) ── */}
          {info?.isExpired && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Hisob to'xtatildi</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  Balansni to'ldiring. Minimal: 30,000 UZS (1 mashina, 1 oy).
                </p>
              </div>
            </div>
          )}
          {!info?.isExpired && !info?.isTrial && days <= 5 && days > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Balans yaqinda tugaydi</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  {days} kun qoldi. Uzluksiz ishlash uchun balansni to'ldiring.
                </p>
              </div>
            </div>
          )}
          {info?.isTrial && (
            <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/15 border border-purple-200 dark:border-purple-800/40 rounded-xl p-4">
              <Gift size={18} className="text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-400">Bepul sinov davri</p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">
                  {info?.trialDaysLeft} kun qoldi. Sinov tugagandan so'ng har kecha mashinalar soni × 1,000 UZS hisobdan yechiladi.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Top-up section ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <CreditCard size={16} className="text-primary-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Balans to'ldirish</h2>
          <span className="ml-auto text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ExternalLink size={9} /> Payme
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick amounts */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Tez miqdorlar</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
                  className={[
                    'py-2.5 rounded-xl text-sm font-bold border transition-all duration-150',
                    selectedAmount === a
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300',
                  ].join(' ')}
                >
                  {a >= 1_000_000 ? `${a / 1_000_000}M` : `${a / 1_000}K`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Boshqa miqdor</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    setCustomAmount(v);
                    if (v) setSelectedAmount(null);
                  }}
                  placeholder="Miqdor (UZS)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 tabular-nums"
                />
                {customAmount && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">UZS</span>
                )}
              </div>

              <button
                onClick={handleTopUp}
                disabled={checkoutLoading || (!selectedAmount && !customAmount)}
                className={[
                  'px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-2',
                  checkoutLoading || (!selectedAmount && !customAmount)
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/30',
                ].join(' ')}
              >
                {checkoutLoading ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <><ExternalLink size={15} /> Payme orqali to'lash</>
                )}
              </button>
            </div>

            {(selectedAmount || customAmount) && (
              <p className="text-xs text-slate-400 mt-2">
                To'lanadigan summa:{' '}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {formatMoney(selectedAmount || parseInt(customAmount || '0', 10), 'UZS')}
                </span>
                {' '} · Taxminiy qo'shimcha:{' '}
                <span className="font-bold text-emerald-600">
                  {info?.dailyCost
                    ? `~${Math.floor((selectedAmount || parseInt(customAmount || '0', 10)) / info.dailyCost)} kun`
                    : '—'}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Transaction history ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tranzaksiyalar</h2>
            {meta?.total ? (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums">
                {meta.total}
              </span>
            ) : null}
          </div>
          <button
            onClick={() => fetchTransactions(page)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <RefreshCw size={14} className={txLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {txLoading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={['h-14 skeleton-shimmer', i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''].join(' ')} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center">
            <Wallet size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-400">Tranzaksiyalar mavjud emas</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {transactions.map((tx) => {
                const isPositive = parseFloat(tx.amount) > 0;
                const { icon: Icon, cls } = TX_ICONS[tx.type] || TX_ICONS.manual;
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    {/* Type icon */}
                    <div className={['w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                      isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/15'
                    ].join(' ')}>
                      <Icon size={15} className={cls} />
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(tx.createdAt)}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className={[
                        'text-sm font-bold tabular-nums',
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                      ].join(' ')}>
                        {isPositive ? '+' : ''}{formatMoney(tx.amount, 'UZS', true)}
                      </p>
                      <p className="text-xs text-slate-400 tabular-nums">
                        → {formatMoney(tx.balanceAfter, 'UZS', true)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  ← Oldingi
                </button>
                <span className="text-xs text-slate-400 tabular-nums">
                  {page} / {meta.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page === meta.pages}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Keyingi →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Balance;
