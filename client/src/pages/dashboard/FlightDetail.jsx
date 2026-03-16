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
  const [roadMoneyType, setRoadMoneyType] = useState('cash');
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
    recalculateFlight,
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
      await addRoadMoneyPayment(id, parseFloat(roadMoneyAmount), roadMoneyDate, roadMoneyNote, roadMoneyType);
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
      {/* ── Header card ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm mb-5 overflow-hidden">

        {/* Status accent line */}
        <div className={`h-1 w-full ${
          flight.status === 'active' ? 'bg-gradient-to-r from-primary-400 to-primary-600' :
          flight.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
          'bg-gradient-to-r from-slate-300 to-slate-400'
        }`} />

        <div className="px-5 pt-4 pb-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3">
            <button onClick={() => navigate('/dashboard/flights')} className="hover:text-primary-500 transition-colors flex items-center gap-1">
              <ArrowLeft size={11} /> Reyslar
            </button>
            <ChevronRight size={11} />
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{flight.driver?.fullName}</span>
          </div>

          {/* Main row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Left: identity */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base shrink-0 ${
                flight.status === 'active' ? 'bg-primary-500' :
                flight.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}>
                {flight.driver?.fullName?.[0]?.toUpperCase() || 'H'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {flight.driver?.fullName}
                  </h1>
                  <Badge
                    status={flight.status}
                    label={
                      flight.status === 'active' ? 'Faol' :
                      flight.status === 'completed' ? 'Yakunlangan' : 'Bekor'
                    }
                  />
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                    <Car size={11} /> {flight.vehicle?.plateNumber}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Clock size={11} /> {formatDate(flight.startedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            {flight.status === 'active' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => setShowCompleteForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <CheckCircle size={13} /> Yakunlash
                </button>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            {[
              { label: 'Daromad', value: formatMoney(flight.totalIncome), color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Xarajat', value: formatMoney(flight.lightExpenses), color: 'text-red-500 dark:text-red-400' },
              { label: 'Sof foyda', value: formatMoney(flight.netProfit), color: parseFloat(flight.netProfit) >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                <p className={`text-sm font-black tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs inside header card */}
        <div className="px-2 border-t border-slate-100 dark:border-slate-700/50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Tab content */}
      <div>

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
          const legs = flight.legs || [];
          const totalFromLegs = legs.reduce((s, l) => s + (parseFloat(l.netPayment) || 0), 0);
          const completedCount = legs.filter(l => l.status === 'completed').length;
          return (
            <div className="flex flex-col gap-3">

              {/* Top bar: summary + add button */}
              <div className="flex items-center justify-between">
                {legs.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>/{legs.length} yetib bordi
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatMoney(totalFromLegs)}
                    </span>
                  </div>
                ) : <div />}
                {flight.status === 'active' && (
                  <Button icon={Plus} size="sm" onClick={() => setShowLegForm(true)}>
                    Yo'nalish qo'shish
                  </Button>
                )}
              </div>

              {legs.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <MapPin size={22} className="text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Yo'nalishlar yo'q</p>
                  <p className="text-sm text-slate-400">Hali hech qanday yo'nalish qo'shilmagan</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {legs.map((leg, idx) => {
                    const isDone = leg.status === 'completed';
                    return (
                      <div key={leg.id} className={[
                        'bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden transition-all',
                        isDone
                          ? 'border-emerald-200/70 dark:border-emerald-800/40'
                          : 'border-slate-200/70 dark:border-slate-700/60',
                      ].join(' ')}>

                        {/* Left color bar */}
                        <div className="flex">
                          <div className={`w-1 shrink-0 ${isDone ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                          <div className="flex-1 p-4">
                            {/* Row 1: index + route + status */}
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <span className={[
                                'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                                isDone
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                              ].join(' ')}>
                                {idx + 1}
                              </span>
                              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{leg.fromCity}</span>
                                <ArrowRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{leg.toCity}</span>
                              </div>
                              <span className={[
                                'shrink-0 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                                isDone
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                              ].join(' ')}>
                                {isDone ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                {isDone ? 'Yetdi' : "Yo'lda"}
                              </span>
                            </div>

                            {/* Row 2: meta */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                              {leg.cargo && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 px-2 py-0.5 rounded-full">
                                  <Package size={9} /> {leg.cargo}{leg.weight ? ` · ${leg.weight}t` : ''}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-2 py-0.5 rounded-full">
                                {paymentTypeLabel(leg.paymentType)}
                              </span>
                              {leg.createdAt && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-full">
                                  <Clock size={9} /> {formatDate(leg.createdAt)}
                                </span>
                              )}
                            </div>

                            {/* Row 3: amount + actions */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  {formatMoney(leg.netPayment)}
                                </span>
                                {parseFloat(leg.transferFeeAmount) > 0 && (
                                  <span className="ml-2 text-xs text-slate-400 line-through tabular-nums">{formatMoney(leg.payment)}</span>
                                )}
                              </div>

                              {flight.status === 'active' && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={legStatusLoading === leg.id}
                                    onClick={async () => {
                                      const nextStatus = isDone ? 'pending' : 'completed';
                                      setLegStatusLoading(leg.id);
                                      try {
                                        await updateLegStatus(flight.id, leg.id, nextStatus);
                                        fetchFlight(id);
                                        addToast(nextStatus === 'completed' ? "Yetib bordi" : "Kutilmoqda", 'success');
                                      } catch { addToast('Xato', 'error'); }
                                      finally { setLegStatusLoading(null); }
                                    }}
                                    className={[
                                      'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all',
                                      isDone
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-slate-50 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700',
                                      legStatusLoading === leg.id ? 'opacity-50 cursor-not-allowed' : '',
                                    ].join(' ')}
                                  >
                                    <CheckCircle2 size={12} />
                                    {isDone ? 'Bekor' : 'Yetdi'}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm("Yo'nalishni o'chirasizmi?")) return;
                                      await deleteLeg(flight.id, leg.id);
                                      fetchFlight(id);
                                      addToast("O'chirildi", 'success');
                                    }}
                                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
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
          );
        })()}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (() => {
          const exps = flight.expenses || [];
          const totalLight = exps.filter(e => e.expenseClass !== 'heavy').reduce((s, e) => s + (parseFloat(e.amountInUZS) || 0), 0);
          const totalHeavy = exps.filter(e => e.expenseClass === 'heavy').reduce((s, e) => s + (parseFloat(e.amountInUZS) || 0), 0);
          return (
            <div className="flex flex-col gap-3">

              {/* Top bar */}
              <div className="flex items-center justify-between">
                {exps.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      <span className="font-bold text-red-500 dark:text-red-400 tabular-nums">{formatMoney(totalLight)}</span> oddiy
                    </span>
                    {totalHeavy > 0 && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        <span className="font-bold text-orange-500 dark:text-orange-400 tabular-nums">{formatMoney(totalHeavy)}</span> kapital
                      </span>
                    )}
                  </div>
                ) : <div />}
                {flight.status === 'active' && (
                  <Button icon={Plus} size="sm" onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}>
                    Xarajat qo'shish
                  </Button>
                )}
              </div>

              {exps.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <Receipt size={22} className="text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Xarajatlar yo'q</p>
                  <p className="text-sm text-slate-400">Hali hech qanday xarajat qo'shilmagan</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {exps.map((exp) => {
                    const typeInfo = EXPENSE_TYPES.find((t) => t.value === exp.type);
                    const hasFuel = exp.fuelLiters && parseFloat(exp.fuelLiters) > 0;
                    const isGas = exp.type === 'fuel_metan' || exp.type === 'fuel_propan';
                    const fuelUnit = isGas ? 'kub' : 'litr';
                    const isHeavy = exp.expenseClass === 'heavy';
                    const byDriver = exp.addedBy === 'driver';
                    return (
                      <div key={exp.id} className={[
                        'bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden',
                        isHeavy
                          ? 'border-orange-200/70 dark:border-orange-800/30'
                          : 'border-slate-200/70 dark:border-slate-700/60',
                      ].join(' ')}>

                        <div className="flex">
                          {/* Left color bar */}
                          <div className={`w-1 shrink-0 ${isHeavy ? 'bg-orange-400' : 'bg-red-400'}`} />

                          <div className="flex-1 p-3.5">
                            <div className="flex items-start gap-3">
                              {/* Emoji */}
                              <div className={[
                                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg',
                                isHeavy
                                  ? 'bg-orange-50 dark:bg-orange-900/20'
                                  : 'bg-red-50 dark:bg-red-900/10',
                              ].join(' ')}>
                                {typeInfo?.emoji}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Title + amount */}
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                                    {typeInfo?.label || exp.type}
                                  </p>
                                  <div className="text-right shrink-0">
                                    <p className={`font-black text-sm tabular-nums ${isHeavy ? 'text-orange-600 dark:text-orange-400' : 'text-red-500 dark:text-red-400'}`}>
                                      {formatMoney(exp.amountInUZS)}
                                    </p>
                                    {exp.currency === 'USD' && (
                                      <p className="text-[10px] text-slate-400 tabular-nums">${exp.amount}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Badges + date */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={[
                                    'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                                    byDriver
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                                  ].join(' ')}>
                                    {byDriver ? 'Haydovchi' : 'Biznesmen'}
                                  </span>
                                  <span className={[
                                    'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                                    isHeavy
                                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                                  ].join(' ')}>
                                    {isHeavy ? 'Kapital' : 'Oddiy'}
                                  </span>
                                  {exp.expenseDate && (
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                                      <Clock size={9} /> {formatDate(exp.expenseDate, true)}
                                    </span>
                                  )}
                                </div>

                                {/* Fuel detail */}
                                {hasFuel && (
                                  <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                                    <Droplets size={11} className="text-blue-400 shrink-0" />
                                    <span className="text-xs text-blue-700 dark:text-blue-300 tabular-nums font-semibold">
                                      {parseFloat(exp.fuelLiters)} {fuelUnit}
                                    </span>
                                    {exp.fuelPricePerLiter && (
                                      <span className="text-xs text-blue-400 tabular-nums">× {formatMoney(exp.fuelPricePerLiter)}</span>
                                    )}
                                    {exp.odometerAtExpense && (
                                      <span className="flex items-center gap-1 text-xs text-blue-400 ml-auto tabular-nums">
                                        <Gauge size={10} /> {exp.odometerAtExpense.toLocaleString('uz-UZ')} km
                                      </span>
                                    )}
                                  </div>
                                )}

                                {exp.description && (
                                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{exp.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Actions — compact, inline */}
                            {flight.status === 'active' && (
                              <div className="flex items-center justify-end gap-1 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/40">
                                {exp.addedBy !== 'driver' && (
                                  <button
                                    onClick={() => { setEditingExpense(exp); setShowExpenseForm(true); }}
                                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                  >
                                    <Edit2 size={11} /> Tahrirlash
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    if (!confirm("Xarajatni o'chirasizmi?")) return;
                                    await deleteExpense(flight.id, exp.id);
                                    fetchFlight(id);
                                    addToast("O'chirildi", 'success');
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                  <Trash2 size={11} /> O'chirish
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
              onRecalculate={async () => {
                try {
                  await recalculateFlight(flight.id);
                  addToast('Moliya qayta hisoblandi', 'success');
                } catch (err) {
                  addToast(err.message || 'Xato', 'error');
                }
              }}
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
            money
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
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              To'lov turi
            </label>
            <div className="flex gap-2">
              {[
                { value: 'cash', label: '💵 Naqd' },
                { value: 'transfer', label: '🏦 O\'tkazma' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoadMoneyType(opt.value)}
                  className={[
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    roadMoneyType === opt.value
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Sana"
            type="date"
            value={roadMoneyDate}
            onChange={(e) => setRoadMoneyDate(e.target.value)}
          />
          <Input
            label="Miqdor (UZS)"
            money
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
