import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Wrench,
  ChevronRight,
  Gauge,
  Truck,
  AlertTriangle,
  CheckCircle,
  User,
  Plus,
  Receipt,
  TrendingDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import VehicleForm from '../../components/vehicles/VehicleForm';
import useVehicleStore from '../../stores/vehicleStore';
import useUiStore from '../../stores/uiStore';
import { formatMoney, formatDate, formatOdometer } from '../../utils/formatters';
import { MAINTENANCE_TYPES } from '../../utils/constants';
import api from '../../services/api';

/* ─── Helper info row ──────────────────────────────────────────── */
const InfoRow = ({ label, children }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{children}</span>
  </div>
);

/* ─── Component ────────────────────────────────────────────────── */
const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [maint, setMaint] = useState({
    type: 'oil_change',
    description: '',
    cost: '',
    odometerAt: '',
  });
  const [expense, setExpense] = useState({
    type: 'tire_change',
    description: '',
    cost: '',
    odometerAt: '',
  });
  const [maintLoading, setMaintLoading] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'maintenance' | 'expenses'

  const { currentVehicle: vehicle, fetchVehicle, assignDriver, addMaintenance } =
    useVehicleStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchVehicle(id);
    api
      .get('/drivers', { params: { limit: 100 } })
      .then((r) => setDrivers(r.data || []))
      .catch(() => {});
  }, [id]);

  const handleMaintenance = async (e) => {
    e.preventDefault();
    setMaintLoading(true);
    try {
      await addMaintenance(id, {
        type: maint.type,
        description: maint.description || undefined,
        cost: maint.cost ? parseFloat(maint.cost) : undefined,
        odometerAt: maint.odometerAt ? parseInt(maint.odometerAt) : undefined,
      });
      addToast("Ta'mir qo'shildi", 'success');
      setShowMaintenanceForm(false);
      setMaint({ type: 'oil_change', description: '', cost: '', odometerAt: '' });
      fetchVehicle(id);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setMaintLoading(false);
    }
  };

  const handleExpense = async (e) => {
    e.preventDefault();
    setExpenseLoading(true);
    try {
      // Vehicle expenses also go through addMaintenance with specific types
      await addMaintenance(id, {
        type: expense.type,
        description: expense.description || undefined,
        cost: expense.cost ? parseFloat(expense.cost) : undefined,
        odometerAt: expense.odometerAt ? parseInt(expense.odometerAt) : undefined,
      });
      addToast("Xarajat qo'shildi", 'success');
      setShowExpenseForm(false);
      setExpense({ type: 'tire_change', description: '', cost: '', odometerAt: '' });
      fetchVehicle(id);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setExpenseLoading(false);
    }
  };

  if (!vehicle) return null;

  const needsOilChange =
    vehicle.currentOdometer - vehicle.lastOilChangeKm >= vehicle.oilChangeIntervalKm;

  const assignedDriver = drivers.find((d) => d.id === vehicle.currentDriverId);

  const logs = vehicle.maintenanceLogs || [];
  const totalExpenses = logs.reduce((sum, l) => sum + (parseFloat(l.cost) || 0), 0);

  const TABS = [
    { key: 'info', label: "Ma'lumotlar" },
    { key: 'expenses', label: `Xarajatlar${logs.length ? ` (${logs.length})` : ''}` },
  ];

  return (
    <div className="page-enter">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        {/* Back + title */}
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-2">
            <button
              onClick={() => navigate('/dashboard/vehicles')}
              className="hover:text-primary-500 transition-colors"
            >
              Mashinalar
            </button>
            <ChevronRight size={12} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {vehicle.plateNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/vehicles')}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {vehicle.plateNumber}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {vehicle.brand} {vehicle.model} {vehicle.year ? `· ${vehicle.year}` : ''}
              </p>
            </div>
            <Badge status={vehicle.status} size="sm" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Edit}
            size="sm"
            onClick={() => setShowEditForm(true)}
          >
            Tahrirlash
          </Button>
          <Button
            variant="secondary"
            icon={Wrench}
            size="sm"
            onClick={() => setShowMaintenanceForm(true)}
          >
            Ta'mir
          </Button>
          <Button
            icon={Plus}
            size="sm"
            onClick={() => setShowExpenseForm(true)}
          >
            Xarajat
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <>
          {/* ── Info cards row ────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Vehicle info */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Truck size={15} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Mashina ma'lumotlari
                </h3>
              </div>
              <InfoRow label="Marka/Model">{vehicle.brand} {vehicle.model}</InfoRow>
              <InfoRow label="Yil">{vehicle.year || '—'}</InfoRow>
              <InfoRow label="Rang">{vehicle.color || '—'}</InfoRow>
              <InfoRow label="Status">
                <Badge status={vehicle.status} size="xs" />
              </InfoRow>
            </Card>

            {/* Odometer + oil */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <Gauge size={15} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Odometr & Moy
                  </h3>
                </div>
                {/* Oil status indicator */}
                {needsOilChange ? (
                  <div className="flex items-center gap-1.5 bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800/50 text-warning-700 dark:text-warning-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <AlertTriangle size={12} />
                    Moy kerak!
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800/50 text-success-700 dark:text-success-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <CheckCircle size={12} />
                    Yaxshi
                  </div>
                )}
              </div>
              <InfoRow label="Joriy odometr">
                <span className="font-semibold">{formatOdometer(vehicle.currentOdometer)}</span>
              </InfoRow>
              <InfoRow label="Oxirgi moy">{formatOdometer(vehicle.lastOilChangeKm)}</InfoRow>
              <InfoRow label="Moy intervali">{formatOdometer(vehicle.oilChangeIntervalKm)}</InfoRow>
              <InfoRow label="Keyingi moyga">
                {vehicle.lastOilChangeKm && vehicle.oilChangeIntervalKm
                  ? formatOdometer(
                      vehicle.lastOilChangeKm +
                        vehicle.oilChangeIntervalKm -
                        vehicle.currentOdometer,
                    ) + ' qoldi'
                  : '—'}
              </InfoRow>
            </Card>
          </div>

          {/* ── Assign driver ─────────────────────────────────────── */}
          <Card className="mb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <User size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Haydovchi</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {assignedDriver
                      ? assignedDriver.fullName
                      : 'Biriktirilmagan'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {vehicle.currentDriverId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      await assignDriver(id, null);
                      addToast('Haydovchi olib tashlandi', 'success');
                      fetchVehicle(id);
                    }}
                  >
                    Olib tashlash
                  </Button>
                )}
                <Select
                  placeholder="Haydovchi tanlash"
                  value={vehicle.currentDriverId || ''}
                  onChange={async (e) => {
                    await assignDriver(id, e.target.value || null);
                    addToast('Haydovchi biriktirildi', 'success');
                    fetchVehicle(id);
                  }}
                  options={drivers
                    .filter((d) => d.isActive)
                    .map((d) => ({ value: d.id, label: d.fullName }))}
                  className="w-44"
                />
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Total summary card */}
          {logs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Receipt size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Jami xarajatlar</p>
                  <p className="font-bold text-slate-900 dark:text-white">{formatMoney(totalExpenses)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Yozuvlar soni</p>
                <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">{logs.length}</p>
              </div>
            </div>
          )}

          {/* Expense list */}
          {logs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm py-12 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <TrendingDown size={22} className="text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Xarajatlar topilmadi</p>
              <Button icon={Plus} size="sm" onClick={() => setShowExpenseForm(true)}>
                Xarajat qo'shish
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 dark:text-white">Xarajatlar tarixi</h2>
                <Button icon={Plus} size="sm" onClick={() => setShowExpenseForm(true)}>
                  Qo'shish
                </Button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-start px-5 py-3.5 gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Wrench size={14} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                          {MAINTENANCE_TYPES.find((t) => t.value === log.type)?.label || log.type}
                        </p>
                        {log.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{log.description}</p>
                        )}
                        {log.odometerAt && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatOdometer(log.odometerAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {log.cost && (
                        <p className="font-semibold text-danger-600 dark:text-danger-400 text-sm">
                          {formatMoney(log.cost)}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(log.performedAt, true)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      <VehicleForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          fetchVehicle(id);
        }}
        vehicle={vehicle}
      />

      {/* Maintenance modal */}
      <Modal
        isOpen={showMaintenanceForm}
        onClose={() => setShowMaintenanceForm(false)}
        title="Ta'mir kiritish"
      >
        <form onSubmit={handleMaintenance} className="flex flex-col gap-4">
          <Select
            label="Turi"
            required
            value={maint.type}
            onChange={(e) => setMaint((m) => ({ ...m, type: e.target.value }))}
            options={MAINTENANCE_TYPES}
          />
          <Input
            label="Tavsif"
            value={maint.description}
            onChange={(e) => setMaint((m) => ({ ...m, description: e.target.value }))}
            placeholder="Ixtiyoriy..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Narxi (UZS)"
              type="number"
              value={maint.cost}
              onChange={(e) => setMaint((m) => ({ ...m, cost: e.target.value }))}
              placeholder="0"
            />
            <Input
              label="Odometr (km)"
              type="number"
              value={maint.odometerAt}
              onChange={(e) => setMaint((m) => ({ ...m, odometerAt: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowMaintenanceForm(false)}
            >
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={maintLoading}>
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Vehicle expense modal */}
      <Modal
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        title="Mashina xarajati"
      >
        <form onSubmit={handleExpense} className="flex flex-col gap-4">
          <Select
            label="Xarajat turi"
            required
            value={expense.type}
            onChange={(e) => setExpense((x) => ({ ...x, type: e.target.value }))}
            options={MAINTENANCE_TYPES}
          />
          <Input
            label="Narxi (UZS)"
            type="number"
            required
            value={expense.cost}
            onChange={(e) => setExpense((x) => ({ ...x, cost: e.target.value }))}
            placeholder="0"
          />
          <Input
            label="Tavsif"
            value={expense.description}
            onChange={(e) => setExpense((x) => ({ ...x, description: e.target.value }))}
            placeholder="Masalan: Balon almashtirish, Tormoz ta'miri..."
          />
          <Input
            label="Odometr (km)"
            type="number"
            value={expense.odometerAt}
            onChange={(e) => setExpense((x) => ({ ...x, odometerAt: e.target.value }))}
            placeholder="0"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowExpenseForm(false)}
            >
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={expenseLoading}>
              Qo'shish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehicleDetail;
