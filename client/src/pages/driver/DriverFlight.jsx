import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Package,
  DollarSign,
  MapPin,
  Clock,
  Truck,
  AlertCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ExpenseForm from '../../components/flights/ExpenseForm';
import api from '../../services/api';
import { formatMoney, formatDate } from '../../utils/formatters';
import { EXPENSE_TYPES } from '../../utils/constants';

/* ─── Loading spinner ──────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center py-16">
    <div className="w-9 h-9 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ─── Component ────────────────────────────────────────────────── */
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

  useEffect(() => {
    load();
  }, [id]);

  const confirmExpense = async (expId) => {
    setConfirmingId(expId);
    try {
      await api.post(`/driver/expenses/${expId}/confirm`);
      await load();
    } catch {}
    setConfirmingId(null);
  };

  /* Loading */
  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><Spinner /></div>;

  /* Not found */
  if (!flight) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <AlertCircle size={24} className="text-slate-400" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Reys topilmadi
        </p>
        <p className="text-sm text-slate-500 mb-4">Bu reys mavjud emas yoki sizga tegishli emas</p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/driver')}>
          Orqaga
        </Button>
      </div>
    );
  }

  const isActive = flight.status === 'active';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Hero header ───────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 px-4 pt-5 pb-12">
        {/* Back button + title */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/driver')}
            className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center"
          >
            <ArrowLeft size={17} className="text-white" />
          </button>
          <div>
            <p className="text-primary-300 text-xs font-medium">Reys tafsiloti</p>
            <h1 className="text-white font-bold text-lg mt-0.5">
              {flight.vehicle?.plateNumber || 'Mashina'}
            </h1>
          </div>
          <div className="ml-auto">
            <Badge
              status={flight.status}
              label={
                flight.status === 'active'
                  ? 'Faol'
                  : flight.status === 'completed'
                  ? 'Yakunlangan'
                  : 'Bekor'
              }
            />
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Truck size={12} className="text-primary-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Mashina</p>
            </div>
            <p className="text-white font-bold font-mono">{flight.vehicle?.plateNumber || '—'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign size={12} className="text-primary-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Yo'l puli</p>
            </div>
            <p className="text-white font-bold">{formatMoney(flight.roadMoney, 'UZS', true)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={12} className="text-green-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Daromad</p>
            </div>
            <p className="text-green-300 font-bold">
              {formatMoney(flight.totalIncome, 'UZS', true)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle size={12} className="text-red-300" />
              <p className="text-primary-200 text-[10px] uppercase tracking-wide">Xarajat</p>
            </div>
            <p className="text-red-300 font-bold">
              {formatMoney(flight.lightExpenses, 'UZS', true)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="px-4 -mt-6 pb-24 space-y-4">

        {/* ── Legs / Orders timeline ──────────────────────────── */}
        {flight.legs?.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <MapPin size={13} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
                Buyurtmalar ({flight.legs.length})
              </h2>
            </div>

            {/* Timeline list */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {flight.legs.map((leg, idx) => (
                <div key={leg.id} className="flex items-start gap-3 px-4 py-3.5">
                  {/* Index bubble */}
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {leg.fromCity} → {leg.toCity}
                        </p>
                        {leg.cargo && (
                          <p className="text-xs text-slate-500 mt-0.5">{leg.cargo}</p>
                        )}
                      </div>
                      <p className="font-bold text-success-600 dark:text-success-400 flex-shrink-0">
                        {formatMoney(leg.netPayment, 'UZS', true)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Expenses list ───────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <DollarSign size={13} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
                Xarajatlar
                {flight.expenses?.length ? ` (${flight.expenses.length})` : ''}
              </h2>
            </div>
          </div>

          {!flight.expenses || flight.expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Package size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Xarajatlar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {flight.expenses.map((exp) => {
                const typeInfo = EXPENSE_TYPES.find((t) => t.value === exp.type);
                const needsConfirm =
                  !exp.confirmedByDriver && exp.addedBy === 'businessman';

                return (
                  <div
                    key={exp.id}
                    className={[
                      'flex items-center justify-between gap-3 px-4 py-3.5',
                      needsConfirm
                        ? 'bg-amber-50/50 dark:bg-amber-950/20'
                        : '',
                    ].join(' ')}
                  >
                    {/* Left: emoji + label */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{typeInfo?.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {typeInfo?.label || exp.type}
                        </p>
                        {needsConfirm && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full mt-0.5">
                            <AlertCircle size={9} />
                            Tasdiqlanmagan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: amount + confirm button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-danger-600 dark:text-danger-400 text-sm">
                        {formatMoney(exp.amountInUZS, 'UZS', true)}
                      </p>
                      {needsConfirm && (
                        <button
                          onClick={() => confirmExpense(exp.id)}
                          disabled={confirmingId === exp.id}
                          className="w-8 h-8 rounded-xl bg-success-100 dark:bg-success-900/40 flex items-center justify-center text-success-600 dark:text-success-400 hover:bg-success-200 transition-colors disabled:opacity-50"
                        >
                          {confirmingId === exp.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-success-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
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

      {/* ── FAB — Add expense ─────────────────────────────────── */}
      {isActive && (
        <div className="fixed bottom-6 right-4 z-40">
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-semibold px-5 py-3 rounded-2xl shadow-xl shadow-primary-500/30 transition-all"
          >
            <Plus size={20} />
            Xarajat qo'shish
          </button>
        </div>
      )}

      {/* ── Expense form ──────────────────────────────────────── */}
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
