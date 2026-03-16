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
  User,
  Car,
  Globe,
  Banknote,
  Clock,
  CheckCircle2,
  ArrowRight,
  Weight,
  Receipt,
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
import FlightFinanceCharts from '../../components/flights/FlightFinanceCharts';
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
  const [showRoadMoneyForm, setShowRoadMoneyForm] = useState(false);
  const [roadMoneyAmount, setRoadMoneyAmount] = useState('');
  const [roadMoneyDate, setRoadMoneyDate] = useState(new Date().toISOString().split('T')[0]);
  const [roadMoneyNote, setRoadMoneyNote] = useState('');
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
    addRoadMoneyPayment,
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
      await addDriverPayment(id, parseFloat(paymentAmount), paymentDate);
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

  const handleAddRoadMoney = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await addRoadMoneyPayment(id, parseFloat(roadMoneyAmount), roadMoneyDate, roadMoneyNote);
      addToast("Yo'l puli qo'shildi", 'success');
      setShowRoadMoneyForm(false);
      setRoadMoneyAmount('');
      setRoadMoneyNote('');
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
        {activeTab === 'general' && (() => {
          const fuelUnit = (flight.fuelType === 'metan' || flight.fuelType === 'propan') ? 'kub' : 'litr';
          const distanceDriven = flight.startOdometer && flight.endOdometer
            ? flight.endOdometer - flight.startOdometer : null;
          return (
            <div className="flex flex-col gap-4">
              {/* Quick stat strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Jami daromad', value: formatMoney(flight.totalIncome), color: 'emerald', icon: TrendingUp },
                  { label: 'Xarajatlar',   value: formatMoney(flight.lightExpenses), color: 'red',    icon: TrendingDown },
                  { label: 'Sof foyda',    value: formatMoney(flight.netProfit),    color: 'primary', icon: Building2 },
                  { label: 'Biznes foydasi', value: formatMoney(flight.businessProfit), color: 'violet', icon: HandCoins },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label}
                    className={`rounded-2xl border p-3.5 bg-${color}-50 dark:bg-${color}-900/10 border-${color}-100 dark:border-${color}-800/30`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-2`}>
                      <Icon size={13} className={`text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                    <p className={`text-sm font-bold text-${color}-700 dark:text-${color}-300 tabular-nums`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flight details card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Plane size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Reys ma'lumotlari</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {[
                      { icon: User,     label: 'Haydovchi',        value: flight.driver?.fullName },
                      { icon: Car,      label: 'Mashina',           value: flight.vehicle?.plateNumber },
                      { icon: Globe,    label: 'Reys turi',         value: flight.flightType === 'domestic' ? 'Ichki' : 'Xalqaro' },
                      { icon: Banknote, label: "Yo'l puli",         value: formatMoney(flight.roadMoney) },
                      { icon: HandCoins,label: 'Haydovchi ulushi',  value: `${flight.driverProfitPercent}%` },
                      { icon: Clock,    label: 'Boshlangan',        value: formatDateTime(flight.startedAt) },
                      ...(flight.completedAt ? [{ icon: CheckCircle2, label: 'Yakunlangan', value: formatDateTime(flight.completedAt) }] : []),
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 px-5 py-3">
                        <Icon size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex-1">{label}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">{value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Odometer card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <Gauge size={14} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Odometr & Yoqilg'i</h3>
                  </div>

                  {/* km progress */}
                  {(flight.startOdometer || flight.endOdometer) && (
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-center">
                          <p className="text-[11px] text-slate-400 mb-1">Boshlang'ich</p>
                          <p className="text-base font-bold text-slate-800 dark:text-white tabular-nums">
                            {flight.startOdometer ? flight.startOdometer.toLocaleString('uz-UZ') : '—'}
                          </p>
                          <p className="text-[11px] text-slate-400">km</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 px-3">
                          {distanceDriven !== null && (
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                              +{distanceDriven.toLocaleString('uz-UZ')} km
                            </span>
                          )}
                          <div className="w-full flex items-center gap-1">
                            <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700" />
                            <ArrowRight size={12} className="text-slate-400 shrink-0" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] text-slate-400 mb-1">Yakuniy</p>
                          <p className="text-base font-bold text-slate-800 dark:text-white tabular-nums">
                            {flight.endOdometer ? flight.endOdometer.toLocaleString('uz-UZ') : '—'}
                          </p>
                          <p className="text-[11px] text-slate-400">km</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fuel row */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {[
                      { icon: Droplets, label: `Yoqilg'i boshi`, value: flight.startFuel ? `${flight.startFuel} ${fuelUnit}` : null },
                      { icon: Droplets, label: `Yoqilg'i oxiri`, value: flight.endFuel   ? `${flight.endFuel} ${fuelUnit}`   : null },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 px-5 py-3">
                        <Icon size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex-1">{label}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* LEGS (YO'NALISHLAR) TAB */}
        {activeTab === 'legs' && (() => {
          return (
            <div className="flex flex-col gap-4">

              {flight.status === 'active' && (
                <div className="flex justify-end">
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
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Yo'nalishlar yo'q</p>
                    <p className="text-sm text-slate-400">Hali hech qanday yo'nalish qo'shilmagan</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {flight.legs.map((leg, idx) => (
                    <div
                      key={leg.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden"
                    >
                      {/* Status accent line */}
                      <div className={`h-1 ${leg.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                      <div className="p-4">
                        {/* Row 1: number + route + status badge */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs font-black text-primary-700 dark:text-primary-300 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 flex items-center gap-1.5 min-w-0 overflow-hidden">
                            <span className="font-bold text-slate-800 dark:text-white truncate text-sm">{leg.fromCity}</span>
                            <ArrowRight size={13} className="text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800 dark:text-white truncate text-sm">{leg.toCity}</span>
                          </div>
                          <span className={[
                            'shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full',
                            leg.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                          ].join(' ')}>
                            {leg.status === 'completed' ? '✓ Yetdi' : '⏳ Yo\'lda'}
                          </span>
                        </div>

                        {/* Row 2: meta chips */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                          {leg.cargo && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                              <Package size={10} className="text-slate-400" />
                              {leg.cargo}{leg.weight ? ` · ${leg.weight}t` : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                            {paymentTypeLabel(leg.paymentType)}
                          </span>
                          {leg.createdAt && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                              {formatDate(leg.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Row 3: amount + actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatMoney(leg.netPayment)}
                          </span>

                          {flight.status === 'active' && (
                            <div className="flex items-center gap-2">
                              <button
                                disabled={legStatusLoading === leg.id}
                                onClick={async () => {
                                  const nextStatus = leg.status === 'completed' ? 'pending' : 'completed';
                                  setLegStatusLoading(leg.id);
                                  try {
                                    await updateLegStatus(flight.id, leg.id, nextStatus);
                                    fetchFlight(id);
                                    addToast(nextStatus === 'completed' ? "Yo'nalish yetib bordi" : "Kutilmoqda holatiga o'tkazildi", 'success');
                                  } catch { addToast('Xato', 'error'); }
                                  finally { setLegStatusLoading(null); }
                                }}
                                className={[
                                  'flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all',
                                  leg.status === 'completed'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400',
                                  legStatusLoading === leg.id ? 'opacity-50 cursor-not-allowed' : '',
                                ].join(' ')}
                              >
                                <CheckCircle2 size={13} />
                                {leg.status === 'completed' ? 'Yetib bordi' : 'Belgilash'}
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm("Yo'nalishni o'chirasizmi?")) return;
                                  await deleteLeg(flight.id, leg.id);
                                  fetchFlight(id);
                                  addToast("Yo'nalish o'chirildi", 'success');
                                }}
                                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all"
                              >
                                <Trash2 size={14} />
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
          );
        })()}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (() => {
          const exps = flight.expenses || [];
          const totalLight = exps.filter(e => e.expenseClass !== 'heavy').reduce((s, e) => s + (parseFloat(e.amountInUZS) || 0), 0);
          const totalHeavy = exps.filter(e => e.expenseClass === 'heavy').reduce((s, e) => s + (parseFloat(e.amountInUZS) || 0), 0);
          return (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              {exps.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-3.5 text-center">
                    <p className="text-[11px] text-slate-400 mb-1">Jami</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{exps.length}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30 p-3.5 text-center">
                    <p className="text-[11px] text-slate-400 mb-1">Oddiy</p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400 tabular-nums leading-tight mt-0.5">{formatMoney(totalLight)}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/30 p-3.5 text-center">
                    <p className="text-[11px] text-slate-400 mb-1">Kapital</p>
                    <p className="text-sm font-black text-orange-600 dark:text-orange-400 tabular-nums leading-tight mt-0.5">{formatMoney(totalHeavy)}</p>
                  </div>
                </div>
              )}

              {flight.status === 'active' && (
                <div className="flex justify-end">
                  <Button icon={Plus} onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}>
                    Xarajat qo'shish
                  </Button>
                </div>
              )}

              {exps.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card">
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                      <Receipt size={22} className="text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Xarajatlar yo'q</p>
                    <p className="text-sm text-slate-400">Hali hech qanday xarajat qo'shilmagan</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {exps.map((exp) => {
                    const typeInfo = EXPENSE_TYPES.find((t) => t.value === exp.type);
                    const hasFuel = exp.fuelLiters && parseFloat(exp.fuelLiters) > 0;
                    const isGas = exp.type === 'fuel_metan' || exp.type === 'fuel_propan';
                    const fuelUnit = isGas ? 'kub' : 'litr';
                    const isHeavy = exp.expenseClass === 'heavy';
                    return (
                      <div
                        key={exp.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden"
                      >
                        <div className="flex items-start gap-3.5 p-4">
                          {/* Emoji icon */}
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-xl">
                            {typeInfo?.emoji}
                          </div>

                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                                  {typeInfo?.label || exp.type}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                  <span className={[
                                    'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                                    exp.addedBy === 'driver'
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400'
                                      : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400',
                                  ].join(' ')}>
                                    {exp.addedBy === 'driver' ? 'Haydovchi' : 'Biznesmen'}
                                  </span>
                                  <span className={[
                                    'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                                    isHeavy
                                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30 text-orange-600 dark:text-orange-400'
                                      : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400',
                                  ].join(' ')}>
                                    {isHeavy ? 'Kapital' : 'Oddiy'}
                                  </span>
                                  {exp.expenseDate && (
                                    <span className="text-[11px] text-slate-400">
                                      {formatDate(exp.expenseDate, true)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="text-right shrink-0">
                                <p className="font-black text-danger-600 dark:text-danger-400 text-base tabular-nums">
                                  {formatMoney(exp.amountInUZS)}
                                </p>
                                {exp.currency === 'USD' && (
                                  <p className="text-[11px] text-slate-400 tabular-nums">${exp.amount}</p>
                                )}
                              </div>
                            </div>

                            {/* Fuel detail chip */}
                            {hasFuel && (
                              <div className="flex items-center gap-3 mt-2.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                                <Droplets size={12} className="text-blue-400 shrink-0" />
                                <span className="text-xs text-blue-700 dark:text-blue-300 tabular-nums">
                                  {parseFloat(exp.fuelLiters)} {fuelUnit}
                                </span>
                                {exp.fuelPricePerLiter && (
                                  <span className="text-xs text-blue-500 dark:text-blue-400 tabular-nums">
                                    × {formatMoney(exp.fuelPricePerLiter)}/{fuelUnit}
                                  </span>
                                )}
                                {exp.odometerAtExpense && (
                                  <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 ml-auto tabular-nums">
                                    <Gauge size={11} />
                                    {exp.odometerAtExpense.toLocaleString('uz-UZ')} km
                                  </span>
                                )}
                              </div>
                            )}

                            {exp.description && (
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{exp.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Action row — only when active */}
                        {flight.status === 'active' && (
                          <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                            {exp.addedBy !== 'driver' && (
                              <button
                                onClick={() => { setEditingExpense(exp); setShowExpenseForm(true); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 py-1"
                              >
                                <Edit2 size={12} /> Tahrirlash
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (!confirm("Xarajatni o'chirasizmi?")) return;
                                await deleteExpense(flight.id, exp.id);
                                fetchFlight(id);
                                addToast("Xarajat o'chirildi", 'success');
                              }}
                              className="flex items-center gap-1.5 text-xs font-medium text-danger-400 hover:text-danger-600 transition-colors px-2 py-1"
                            >
                              <Trash2 size={12} /> O'chirish
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FlightFinanceSummary
              flight={flight}
              onAddPayment={() => setShowPaymentForm(true)}
              onAddRoadMoney={() => setShowRoadMoneyForm(true)}
            />
            <FlightFinanceCharts flight={flight} />
          </div>
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
            label={(flight.fuelType === 'metan' || flight.fuelType === 'propan') ? 'Kub' : 'Litr'}
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

      {/* Road money modal */}
      <Modal
        isOpen={showRoadMoneyForm}
        onClose={() => setShowRoadMoneyForm(false)}
        title="Yo'l puli qo'shish"
      >
        <form onSubmit={handleAddRoadMoney} className="flex flex-col gap-4">
          <Input
            label="Sana"
            type="date"
            value={roadMoneyDate}
            onChange={(e) => setRoadMoneyDate(e.target.value)}
          />
          <Input
            label="Miqdor (UZS)"
            type="number"
            required
            value={roadMoneyAmount}
            onChange={(e) => setRoadMoneyAmount(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Izoh (ixtiyoriy)"
            value={roadMoneyNote}
            onChange={(e) => setRoadMoneyNote(e.target.value)}
            placeholder="Masalan: 2-marta yo'l puli"
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowRoadMoneyForm(false)}>
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
