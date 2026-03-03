import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  ChevronRight,
  Plane,
  Gauge,
  DollarSign,
  Package,
  MapPin,
  Edit2,
  TrendingUp,
  TrendingDown,
  Building2,
  HandCoins,
  Droplets,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LegForm from '../../components/flights/LegForm';
import ExpenseForm from '../../components/flights/ExpenseForm';
import FlightFinanceSummary from '../../components/flights/FlightFinanceSummary';
import useFlightStore from '../../stores/flightStore';
import useUiStore from '../../stores/uiStore';
import { formatMoney, formatDate, formatDateTime } from '../../utils/formatters';
import { EXPENSE_TYPES, PAYMENT_TYPES } from '../../utils/constants';

const InfoRow = ({ label, value, valueClass = '' }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`text-sm font-medium text-slate-800 dark:text-slate-200 ${valueClass}`}>
      {value ?? '—'}
    </span>
  </div>
);

/* Completion profit summary modal content */
const CompletionSummary = ({ flight, onClose }) => {
  if (!flight) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reys yakunlandi!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {flight.driver?.fullName} — {flight.vehicle?.plateNumber}
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" /> Jami daromad
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(flight.totalIncome)}</span>
        </div>
        <div className="flex items-center justify-between py-1 border-t border-slate-200 dark:border-slate-700">
          <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <TrendingDown size={14} className="text-red-500" /> Xarajatlar
          </span>
          <span className="font-semibold text-red-500 dark:text-red-400">-{formatMoney(flight.lightExpenses)}</span>
        </div>
        <div className="flex items-center justify-between py-1 border-t border-slate-200 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sof foyda</span>
          <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">{formatMoney(flight.netProfit)}</span>
        </div>
        <div className="h-px bg-slate-200 dark:border-slate-700" />
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <HandCoins size={14} className="text-amber-500" /> Haydovchi ulushi ({flight.driverProfitPercent}%)
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">{formatMoney(flight.driverProfitAmount)}</span>
        </div>
        <div className="flex items-center justify-between py-1 bg-primary-50 dark:bg-primary-900/20 rounded-xl px-3">
          <span className="text-sm font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2">
            <Building2 size={14} /> Biznes foydasi
          </span>
          <span className="font-black text-primary-600 dark:text-primary-400 text-lg">{formatMoney(flight.businessProfit)}</span>
        </div>
      </div>

      <Button fullWidth onClick={onClose}>
        OK
      </Button>
    </div>
  );
};

const FlightDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showLegForm, setShowLegForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [completedFlightData, setCompletedFlightData] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [completeData, setCompleteData] = useState({ endOdometer: '', endFuel: '' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionLoading, setActionLoading] = useState(false);
  const [legStatusLoading, setLegStatusLoading] = useState(null);

  const {
    currentFlight: flight,
    fetchFlight,
    deleteLeg,
    deleteExpense,
    completeFlight,
    cancelFlight,
    addDriverPayment,
    updateLegStatus,
  } = useFlightStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchFlight(id);
  }, [id]);

  if (!flight) return null;

  const tabs = [
    { value: 'general', label: 'Umumiy' },
    { value: 'legs', label: "Yo'nalishlar", count: flight.legs?.length },
    { value: 'expenses', label: 'Xarajatlar', count: flight.expenses?.length },
    { value: 'finance', label: 'Moliya' },
  ];

  const handleComplete = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const result = await completeFlight(id, {
        endOdometer: completeData.endOdometer ? parseInt(completeData.endOdometer) : undefined,
        endFuel: completeData.endFuel ? parseFloat(completeData.endFuel) : undefined,
      });
      setShowCompleteForm(false);
      setCompletedFlightData(result);
      setShowCompletionSummary(true);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelFlight(id);
      addToast('Reys bekor qilindi', 'success');
      setShowCancelConfirm(false);
      navigate('/dashboard/flights');
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await addDriverPayment(id, parseFloat(paymentAmount));
      addToast("To'lov qo'shildi", 'success');
      setShowPaymentForm(false);
      setPaymentAmount('');
      fetchFlight(id);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const paymentTypeLabel = (type) =>
    PAYMENT_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-2">
            <button
              onClick={() => navigate('/dashboard/flights')}
              className="hover:text-primary-500 transition-colors"
            >
              Reyslar
            </button>
            <ChevronRight size={12} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {flight.driver?.fullName}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/flights')}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {flight.driver?.fullName} — {flight.vehicle?.plateNumber}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {formatDate(flight.startedAt)}
              </p>
            </div>
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

        {flight.status === 'active' && (
          <div className="flex gap-2 sm:flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setShowCancelConfirm(true)}>
              Bekor qilish
            </Button>
            <Button icon={CheckCircle} size="sm" onClick={() => setShowCompleteForm(true)}>
              Yakunlash
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-5">

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Plane size={15} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Reys ma'lumotlari</h3>
              </div>
              <InfoRow label="Haydovchi" value={flight.driver?.fullName} />
              <InfoRow label="Mashina" value={flight.vehicle?.plateNumber} />
              <InfoRow
                label="Reys turi"
                value={flight.flightType === 'domestic' ? 'Ichki' : 'Xalqaro'}
              />
              <InfoRow label="Yo'l puli" value={formatMoney(flight.roadMoney)} />
              <InfoRow label="Haydovchi ulushi" value={`${flight.driverProfitPercent}% (foydadan)`} />
              <InfoRow label="Boshlangan" value={formatDateTime(flight.startedAt)} />
              {flight.completedAt && (
                <InfoRow label="Yakunlangan" value={formatDateTime(flight.completedAt)} />
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <Gauge size={15} className="text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Odometr & Yoqilg'i</h3>
              </div>
              <InfoRow
                label="Boshlang'ich km"
                value={flight.startOdometer ? `${flight.startOdometer.toLocaleString('uz-UZ')} km` : null}
              />
              <InfoRow
                label="Yakuniy km"
                value={flight.endOdometer ? `${flight.endOdometer.toLocaleString('uz-UZ')} km` : null}
              />
              {flight.startOdometer && flight.endOdometer && (
                <InfoRow
                  label="Bosib o'tilgan"
                  value={`${(flight.endOdometer - flight.startOdometer).toLocaleString('uz-UZ')} km`}
                  valueClass="text-primary-600 dark:text-primary-400 font-semibold"
                />
              )}
              <InfoRow
                label="Yoqilg'i (boshi)"
                value={flight.startFuel ? `${flight.startFuel} l` : null}
              />
              <InfoRow
                label="Yoqilg'i (oxiri)"
                value={flight.endFuel ? `${flight.endFuel} l` : null}
              />
            </Card>
          </div>
        )}

        {/* LEGS (YO'NALISHLAR) TAB */}
        {activeTab === 'legs' && (
          <div>
            {flight.status === 'active' && (
              <div className="flex justify-end mb-4">
                <Button icon={Plus} onClick={() => setShowLegForm(true)}>
                  Yo'nalish qo'shish
                </Button>
              </div>
            )}
            {!flight.legs || flight.legs.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card">
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <Package size={22} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Yo'nalishlar yo'q
                  </p>
                  <p className="text-sm text-slate-400">
                    Hali hech qanday yo'nalish qo'shilmagan
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flight.legs.map((leg, idx) => (
                  <div
                    key={leg.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {leg.fromCity} → {leg.toCity}
                          </p>
                          {leg.cargo && (
                            <p className="text-sm text-slate-500 mt-0.5">
                              {leg.cargo} {leg.weight ? `(${leg.weight}t)` : ''}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                              {paymentTypeLabel(leg.paymentType)}
                            </span>
                            {leg.transferFeePercent > 0 && (
                              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                Komissiya: {leg.transferFeePercent}%
                              </span>
                            )}
                            <Badge
                              status={leg.status}
                              size="xs"
                              label={
                                leg.status === 'pending'
                                  ? 'Kutilmoqda'
                                  : leg.status === 'completed'
                                  ? 'Yetib bordi'
                                  : leg.status
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                        {leg.transferFeeAmount > 0 && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatMoney(leg.payment)}
                          </p>
                        )}
                        <p className="font-bold text-success-600 dark:text-success-400 text-lg">
                          {formatMoney(leg.netPayment)}
                        </p>
                        {flight.status === 'active' && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <button
                              disabled={legStatusLoading === leg.id}
                              onClick={async () => {
                                const nextStatus = leg.status === 'completed' ? 'pending' : 'completed';
                                setLegStatusLoading(leg.id);
                                try {
                                  await updateLegStatus(flight.id, leg.id, nextStatus);
                                  fetchFlight(id);
                                  addToast(
                                    nextStatus === 'completed'
                                      ? "Yo'nalish yetib bordi"
                                      : "Yo'nalish kutilmoqda holatiga o'tkazildi",
                                    'success'
                                  );
                                } catch {
                                  addToast('Xato', 'error');
                                } finally {
                                  setLegStatusLoading(null);
                                }
                              }}
                              title={leg.status === 'completed' ? "Kutilmoqda holatiga qaytarish" : "Yetib bordi deb belgilash"}
                              className={[
                                'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border transition-all',
                                leg.status === 'completed'
                                  ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-700 dark:text-success-400'
                                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-success-300 hover:text-success-600',
                                legStatusLoading === leg.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                              ].join(' ')}
                            >
                              <MapPin size={11} />
                              {leg.status === 'completed' ? 'Yetib bordi ✓' : 'Yetib bordi?'}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm("Yo'nalishni o'chirasizmi?")) return;
                                await deleteLeg(flight.id, leg.id);
                                fetchFlight(id);
                                addToast("Yo'nalish o'chirildi", 'success');
                              }}
                              className="text-danger-400 hover:text-danger-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div>
            {flight.status === 'active' && (
              <div className="flex justify-end mb-4">
                <Button icon={Plus} onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}>
                  Xarajat qo'shish
                </Button>
              </div>
            )}
            {!flight.expenses || flight.expenses.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card">
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <DollarSign size={22} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Xarajatlar yo'q
                  </p>
                  <p className="text-sm text-slate-400">
                    Hali hech qanday xarajat qo'shilmagan
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flight.expenses.map((exp) => {
                  const typeInfo = EXPENSE_TYPES.find((t) => t.value === exp.type);
                  const hasFuel = exp.fuelLiters && parseFloat(exp.fuelLiters) > 0;
                  return (
                    <div
                      key={exp.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none mt-0.5">{typeInfo?.emoji}</span>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {typeInfo?.label || exp.type}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                {exp.addedBy === 'driver' ? 'Haydovchi' : 'Biznesmen'}
                              </span>
                              <span className={[
                                'text-xs px-2 py-0.5 rounded-full',
                                exp.expenseClass === 'heavy'
                                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400',
                              ].join(' ')}>
                                {exp.expenseClass === 'heavy' ? 'Kapital' : 'Oddiy'}
                              </span>
                              {exp.expenseDate && (
                                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                  {formatDate(exp.expenseDate, true)}
                                </span>
                              )}
                            </div>
                            {/* Fuel details row */}
                            {hasFuel && (
                              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <Droplets size={11} className="text-blue-400" />
                                <span>{parseFloat(exp.fuelLiters)} litr</span>
                                {exp.fuelPricePerLiter && (
                                  <span>× {formatMoney(exp.fuelPricePerLiter)}/l</span>
                                )}
                                {exp.odometerAtExpense && (
                                  <span className="flex items-center gap-1">
                                    <Gauge size={11} />
                                    {exp.odometerAtExpense.toLocaleString('uz-UZ')} km
                                  </span>
                                )}
                              </div>
                            )}
                            {exp.description && (
                              <p className="text-xs text-slate-400 mt-1">{exp.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          {/* Full amount without K abbreviation */}
                          <p className="font-bold text-danger-600 dark:text-danger-400 text-lg">
                            {formatMoney(exp.amountInUZS)}
                          </p>
                          {exp.currency === 'USD' && (
                            <p className="text-xs text-slate-400">${exp.amount}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 justify-end">
                            {/* Edit button - show for businessman's expenses */}
                            {exp.addedBy !== 'driver' && (
                              <button
                                onClick={() => {
                                  setEditingExpense(exp);
                                  setShowExpenseForm(true);
                                }}
                                className="text-slate-400 hover:text-primary-500 transition-colors"
                                title="Tahrirlash"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                            {flight.status === 'active' && (
                              <button
                                onClick={async () => {
                                  if (!confirm("Xarajatni o'chirasizmi?")) return;
                                  await deleteExpense(flight.id, exp.id);
                                  fetchFlight(id);
                                  addToast("Xarajat o'chirildi", 'success');
                                }}
                                className="text-danger-400 hover:text-danger-600 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <FlightFinanceSummary flight={flight} onAddPayment={() => setShowPaymentForm(true)} />
        )}
      </div>

      {/* Modals */}
      <LegForm
        isOpen={showLegForm}
        onClose={() => setShowLegForm(false)}
        flightId={id}
        onSuccess={() => fetchFlight(id)}
        initialFromCity={flight.legs?.length ? flight.legs[flight.legs.length - 1].toCity : ''}
      />

      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => { setShowExpenseForm(false); setEditingExpense(null); }}
        flightId={id}
        onSuccess={() => fetchFlight(id)}
        expense={editingExpense}
      />

      {/* Complete flight modal */}
      <Modal
        isOpen={showCompleteForm}
        onClose={() => setShowCompleteForm(false)}
        title="Reysni yakunlash"
      >
        <form onSubmit={handleComplete} className="flex flex-col gap-4">
          <Input
            label="Yakuniy odometr (km)"
            type="number"
            value={completeData.endOdometer}
            onChange={(e) => setCompleteData((d) => ({ ...d, endOdometer: e.target.value }))}
            placeholder="0"
          />
          <Input
            label="Yakuniy yoqilg'i (l)"
            type="number"
            value={completeData.endFuel}
            onChange={(e) => setCompleteData((d) => ({ ...d, endFuel: e.target.value }))}
            placeholder="0"
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowCompleteForm(false)}>
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={actionLoading}>
              Yakunlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Completion summary modal - shown after flight is completed */}
      <Modal
        isOpen={showCompletionSummary}
        onClose={() => { setShowCompletionSummary(false); fetchFlight(id); }}
        title="Moliyaviy xulosa"
      >
        <CompletionSummary
          flight={completedFlightData || flight}
          onClose={() => { setShowCompletionSummary(false); fetchFlight(id); }}
        />
      </Modal>

      {/* Driver payment modal */}
      <Modal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title="Haydovchi to'lovi"
      >
        <form onSubmit={handleAddPayment} className="flex flex-col gap-4">
          <Input
            label="To'lov sanasi"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
          <Input
            label="To'lov miqdori (UZS)"
            type="number"
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="0"
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowPaymentForm(false)}>
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={actionLoading}>
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel confirm */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Reysni bekor qilish"
        message="Bu reysni bekor qilmoqchimisiz? Bu amal qaytarib bo'lmaydi."
        confirmLabel="Bekor qilish"
        loading={actionLoading}
      />
    </div>
  );
};

export default FlightDetail;
