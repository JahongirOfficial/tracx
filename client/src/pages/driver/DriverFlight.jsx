import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, CheckCircle, DollarSign, MapPin,
  ArrowRight, Truck, AlertCircle, Package, TrendingDown,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ExpenseForm from '../../components/flights/ExpenseForm';
import api from '../../services/api';
import { formatMoney, formatDate } from '../../utils/formatters';
import { EXPENSE_TYPES } from '../../utils/constants';

const Spinner = () => (
  <div className="flex justify-center py-16">
    <div className="w-9 h-9 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const DriverFlight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get(`/driver/flights/${id}`);
      setFlight(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const confirmExpense = async (expId) => {
    setConfirmingId(expId);
    try {
      await api.post(`/driver/expenses/${expId}/confirm`);
      await load();
    } catch {}
    setConfirmingId(null);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><Spinner /></div>;

  if (!flight) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={40} className="text-slate-300 mb-3" />
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Reys topilmadi</p>
        <button
          onClick={() => navigate('/driver')}
          className="mt-3 flex items-center gap-2 text-sm text-primary-600 font-medium"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
      </div>
    );
  }

  const isActive = flight.status === 'active';
  const currentLeg = flight.legs?.find((l) => l.status === 'pending')
    || flight.legs?.find((l) => l.status === 'in_progress');
  const pendingExpenses = flight.expenses?.filter((e) => !e.confirmedByDriver && e.addedBy === 'businessman') || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Dark header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 px-4 pt-10 pb-14">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/driver')}
            className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft size={17} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-primary-300 text-xs font-medium">Reys tafsiloti</p>
            <h1 className="text-white font-bold text-lg mt-0.5">{flight.vehicle?.plateNumber || 'Mashina'}</h1>
          </div>
          <Badge
            status={flight.status}
            label={flight.status === 'active' ? 'Faol' : flight.status === 'completed' ? 'Yakunlangan' : 'Bekor'}
          />
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Truck size={11} className="text-primary-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Mashina</p>
            </div>
            <p className="text-white font-bold font-mono">{flight.vehicle?.plateNumber || '—'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign size={11} className="text-primary-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Yo'l puli</p>
            </div>
            <p className="text-white font-bold">{formatMoney(flight.roadMoney, 'UZS', true)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={11} className="text-emerald-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Daromad</p>
            </div>
            <p className="text-emerald-300 font-bold">{formatMoney(flight.totalIncome, 'UZS', true)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={11} className="text-red-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Xarajat</p>
            </div>
            <p className="text-red-300 font-bold">{formatMoney(flight.lightExpenses, 'UZS', true)}</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 -mt-6 pb-28 space-y-4">

        {/* ── Current direction (prominent) ── */}
        {currentLeg && (
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/50 dark:to-blue-950/30 border border-primary-200 dark:border-primary-800/50 rounded-2xl p-4">
            <p className="text-primary-600 dark:text-primary-400 text-[11px] font-semibold uppercase tracking-widest mb-3">
              Hozirgi yo'nalish
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2 flex-1 text-center border border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 text-[10px] mb-0.5">Qayerdan</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{currentLeg.fromCity}</p>
              </div>
              <ArrowRight size={16} className="text-primary-400 shrink-0" />
              <div className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2 flex-1 text-center border border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 text-[10px] mb-0.5">Qayerga</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{currentLeg.toCity}</p>
              </div>
            </div>
            {currentLeg.cargo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                {currentLeg.cargo}{currentLeg.weight ? ` · ${currentLeg.weight} t` : ''}
              </p>
            )}
          </div>
        )}

        {/* Pending expenses alert */}
        {pendingExpenses.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              {pendingExpenses.length} ta xarajat tasdiqlanmagan
            </p>
          </div>
        )}

        {/* ── Yo'nalishlar ── */}
        {flight.legs?.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <MapPin size={13} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
                Yo'nalishlar ({flight.legs.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {flight.legs.map((leg, idx) => {
                const isPending = leg.status === 'pending';
                const isDone = leg.status === 'completed';
                return (
                  <div
                    key={leg.id}
                    className={[
                      'flex items-start gap-3 px-4 py-3.5',
                      isPending ? 'bg-primary-50/50 dark:bg-primary-900/10' : '',
                    ].join(' ')}
                  >
                    <div className={[
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      isDone
                        ? 'bg-emerald-100 dark:bg-emerald-900/40'
                        : isPending
                        ? 'bg-primary-100 dark:bg-primary-900/40'
                        : 'bg-slate-100 dark:bg-slate-700',
                    ].join(' ')}>
                      {isDone ? (
                        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className={['text-xs font-bold', isPending ? 'text-primary-700 dark:text-primary-300' : 'text-slate-500'].join(' ')}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={['font-semibold text-sm', isDone ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'].join(' ')}>
                            {leg.fromCity} → {leg.toCity}
                          </p>
                          {leg.cargo && (
                            <p className="text-xs text-slate-500 mt-0.5">{leg.cargo}</p>
                          )}
                          <p className="text-[10px] mt-0.5 font-medium">
                            {isDone
                              ? <span className="text-emerald-600 dark:text-emerald-400">✓ Yetib bordi</span>
                              : isPending
                              ? <span className="text-primary-600 dark:text-primary-400">Ketmoqda</span>
                              : <span className="text-slate-400">Bekor</span>
                            }
                          </p>
                        </div>
                        <p className={['font-bold flex-shrink-0 text-sm', isDone ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'].join(' ')}>
                          {formatMoney(leg.netPayment)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Xarajatlar ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <DollarSign size={13} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
              Xarajatlar{flight.expenses?.length ? ` (${flight.expenses.length})` : ''}
            </h2>
          </div>

          {!flight.expenses?.length ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Package size={26} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Xarajatlar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {flight.expenses.map((exp) => {
                const typeInfo = EXPENSE_TYPES.find((t) => t.value === exp.type);
                const needsConfirm = !exp.confirmedByDriver && exp.addedBy === 'businessman';
                return (
                  <div
                    key={exp.id}
                    className={[
                      'flex items-center justify-between gap-3 px-4 py-3.5',
                      needsConfirm ? 'bg-amber-50/60 dark:bg-amber-950/20' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{typeInfo?.emoji || '📌'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {typeInfo?.label || exp.type}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{exp.description}</p>
                        )}
                        {needsConfirm && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full mt-0.5">
                            <AlertCircle size={9} />
                            Tasdiqlanmagan
                          </span>
                        )}
                        {exp.expenseDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(exp.expenseDate, true)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-danger-600 dark:text-danger-400 text-sm">
                        {formatMoney(exp.amountInUZS)}
                      </p>
                      {needsConfirm && (
                        <button
                          onClick={() => confirmExpense(exp.id)}
                          disabled={confirmingId === exp.id}
                          className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:scale-90 transition-transform disabled:opacity-50"
                        >
                          {confirmingId === exp.id ? (
                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {isActive && (
        <div className="fixed bottom-24 right-4 z-40">
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-xl shadow-primary-500/30 transition-all"
          >
            <Plus size={20} />
            Xarajat qo'shish
          </button>
        </div>
      )}

      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        flightId={id}
        isDriver
        onSuccess={load}
      />
    </div>
  );
};

export default DriverFlight;
