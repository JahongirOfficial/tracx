import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import api from '../../services/api';
import { formatMoney, formatDateTime } from '../../utils/formatters';

const txTypeLabel = (t) => ({
  topup:        "To'lov",
  daily_charge: 'Kunlik hisob',
  trial_start:  'Sinov davri',
  manual:       "Qo'l bilan",
}[t] || t);

const txTypeColor = (type, amount) => {
  const amt = parseFloat(amount);
  if (amt > 0) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-red-500 dark:text-red-400';
};

const SkeletonRows = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-700/40">
        {[...Array(6)].map((_, j) => (
          <td key={j} className="py-3 px-4">
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-20" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const SuperAdminTransactions = () => {
  const [txs, setTxs]     = useState([]);
  const [meta, setMeta]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [summary, setSummary] = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/transactions', {
        params: { page: p, limit: 20, type: typeFilter || undefined },
      });
      setTxs(res.transactions || []);
      setMeta(res.meta);
      setSummary(res.summary || null);
    } catch {}
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(1); setPage(1); }, [typeFilter]);
  useEffect(() => { load(page); }, [page]);

  const types = [
    { val: '', label: 'Barchasi' },
    { val: 'topup', label: "To'lovlar" },
    { val: 'daily_charge', label: 'Kunlik' },
    { val: 'manual', label: "Qo'l bilan" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tranzaksiyalar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Barcha biznesmenlar bo'yicha to'lovlar va hisoblar
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Jami kirim", value: summary.totalIn, icon: TrendingUp, color: 'emerald' },
            { label: "Jami chiqim", value: summary.totalOut, icon: TrendingDown, color: 'red' },
            { label: "To'lovlar soni", value: summary.topupCount, isCount: true, color: 'blue' },
            { label: "Kunlik hisoblar", value: summary.chargeCount, isCount: true, color: 'amber' },
          ].map(({ label, value, icon: Icon, color, isCount }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
              {Icon && (
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-${color}-50 dark:bg-${color}-900/20`}>
                  <Icon size={16} className={`text-${color}-600 dark:text-${color}-400`} />
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {isCount ? value : formatMoney(value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter + table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {types.map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setTypeFilter(val)}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  typeFilter === val
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50">
                {['Sana', 'Biznesmen', 'Tur', 'Miqdor', 'Oldin', 'Keyin'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Tranzaksiyalar topilmadi
                  </td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {tx.businessman ? (
                        <span className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{tx.businessman.companyName || tx.businessman.username}</span>
                        </span>
                      ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        {txTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${txTypeColor(tx.type, tx.amount)}`}>
                        {parseFloat(tx.amount) > 0 ? '+' : ''}{formatMoney(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatMoney(tx.balanceBefore)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatMoney(tx.balanceAfter)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {meta.total} ta tranzaksiya · {page}/{meta.pages} sahifa
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} className="text-slate-500" />
              </button>
              <span className="text-xs text-slate-500 px-2">{page} / {meta.pages}</span>
              <button
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminTransactions;
