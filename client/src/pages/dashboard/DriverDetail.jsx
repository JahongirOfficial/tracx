import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Banknote,
  ChevronRight,
  Phone,
  User,
  Plane,
  DollarSign,
  Info,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Tabs from '../../components/ui/Tabs';
import DriverForm from '../../components/drivers/DriverForm';
import useDriverStore from '../../stores/driverStore';
import useUiStore from '../../stores/uiStore';
import { formatMoney, formatDate, formatDateTime } from '../../utils/formatters';

/* ─── Helper info row ──────────────────────────────────────────── */
const InfoRow = ({ label, children }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{children}</span>
  </div>
);

/* ─── Component ────────────────────────────────────────────────── */
const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [salary, setSalary] = useState({ amount: '', note: '' });
  const [salaryLoading, setSalaryLoading] = useState(false);

  const { currentDriver: driver, fetchDriver, paySalary } = useDriverStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchDriver(id);
  }, [id]);

  const handleSalary = async (e) => {
    e.preventDefault();
    setSalaryLoading(true);
    try {
      await paySalary(id, { amount: parseFloat(salary.amount), note: salary.note });
      addToast("Maosh to'landi", 'success');
      setShowSalaryForm(false);
      setSalary({ amount: '', note: '' });
      fetchDriver(id);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setSalaryLoading(false);
    }
  };

  if (!driver) return null;

  const balancePositive = parseFloat(driver.currentBalance) >= 0;

  /* ── Tab definitions ─────────────────────────────────────────── */
  const tabs = [
    { value: 'flights', label: 'Reyslar', count: driver.flights?.length },
    { value: 'payments', label: "To'lovlar", count: driver.salaryPayments?.length },
    { value: 'info', label: "Ma'lumot" },
  ];

  /* ── Table columns ────────────────────────────────────────────── */
  const flightColumns = [
    {
      key: 'vehicle',
      title: 'Mashina',
      render: (_, r) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
          {r.vehicle?.plateNumber || '—'}
        </span>
      ),
    },
    {
      key: 'totalIncome',
      title: 'Daromad',
      render: (v) => (
        <span className="font-semibold text-success-600 dark:text-success-400">
          {formatMoney(v, 'UZS', true)}
        </span>
      ),
    },
    {
      key: 'netProfit',
      title: 'Foyda',
      render: (v) => formatMoney(v, 'UZS', true),
    },
    {
      key: 'status',
      title: 'Status',
      render: (v) => <Badge status={v} size="xs" />,
    },
    {
      key: 'startedAt',
      title: 'Sana',
      render: (v) => (
        <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(v, true)}</span>
      ),
    },
  ];

  return (
    <div className="page-enter">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        {/* Back + name */}
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-2">
            <button
              onClick={() => navigate('/dashboard/drivers')}
              className="hover:text-primary-500 transition-colors"
            >
              Haydovchilar
            </button>
            <ChevronRight size={12} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {driver.fullName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/drivers')}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {driver.fullName}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                @{driver.username}
              </p>
            </div>
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
          <Button icon={Banknote} size="sm" onClick={() => setShowSalaryForm(true)}>
            Maosh to'lash
          </Button>
        </div>
      </div>

      {/* ── Profile + balance cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Profile card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-5">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-500/20">
              <span className="text-white font-bold text-xl">
                {driver.fullName?.charAt(0)?.toUpperCase() || 'H'}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                {driver.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge status={driver.status} size="xs" />
                <Badge
                  status={driver.isActive ? 'active' : 'inactive'}
                  label={driver.isActive ? 'Faol' : 'Bloklangan'}
                  size="xs"
                />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {driver.flights?.length || 0}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Jami reyslar</p>
            </div>
            <div className="text-center border-x border-slate-100 dark:border-slate-700/50">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {driver.phone ? driver.phone.replace(/\D/g, '').slice(-4) : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {driver.phone ? 'Telefon (oxirgi 4)' : 'Telefon yo\'q'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {driver.paymentType === 'per_trip' ? "Har reys" : "Oylik"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {driver.paymentType === 'per_trip'
                  ? `${driver.perTripRate}%`
                  : `${formatMoney(driver.baseSalary, 'UZS', true)}/oy`}
              </p>
            </div>
          </div>
        </div>

        {/* Balance card */}
        <div
          className={[
            'rounded-2xl border shadow-card p-5 flex flex-col justify-between',
            balancePositive
              ? 'bg-success-50 dark:bg-success-950/30 border-success-200 dark:border-success-800/50'
              : 'bg-danger-50 dark:bg-danger-950/30 border-danger-200 dark:border-danger-800/50',
          ].join(' ')}
        >
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Joriy balans</p>
          <p
            className={`text-3xl font-black mt-2 ${
              balancePositive
                ? 'text-success-700 dark:text-success-400'
                : 'text-danger-700 dark:text-danger-400'
            }`}
          >
            {formatMoney(driver.currentBalance, 'UZS', true)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {balancePositive ? "Haydovchida qarz yo'q" : 'Haydovchi qarzdor'}
          </p>
          <Button
            fullWidth
            size="sm"
            icon={Banknote}
            onClick={() => setShowSalaryForm(true)}
            className="mt-4"
            variant={balancePositive ? 'primary' : 'danger'}
          >
            Maosh to'lash
          </Button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-5">
        {/* FLIGHTS TAB */}
        {activeTab === 'flights' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
            <Table
              columns={flightColumns}
              data={driver.flights || []}
              emptyTitle="Reyslar yo'q"
              emptyDescription="Bu haydovchining hali hech qanday reysli yo'q"
              onRowClick={(r) => navigate(`/dashboard/flights/${r.id}`)}
            />
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
            {!driver.salaryPayments || driver.salaryPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <DollarSign size={22} className="text-slate-400" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                  To'lovlar yo'q
                </p>
                <p className="text-sm text-slate-400">
                  Hali hech qanday maosh to'lanmagan
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {driver.salaryPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center px-5 py-3.5"
                  >
                    <div>
                      <p className="font-semibold text-success-600 dark:text-success-400">
                        {formatMoney(p.amount)}
                      </p>
                      {p.note && (
                        <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">{formatDateTime(p.paidAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <Info size={15} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Shaxsiy ma'lumotlar</h3>
            </div>
            <InfoRow label="Username">@{driver.username}</InfoRow>
            <InfoRow label="Telefon">
              <span className="flex items-center gap-1.5">
                <Phone size={13} />
                {driver.phone || '—'}
              </span>
            </InfoRow>
            <InfoRow label="Status">
              <Badge status={driver.status} size="xs" />
            </InfoRow>
            <InfoRow label="Faollik">
              <Badge
                status={driver.isActive ? 'active' : 'inactive'}
                label={driver.isActive ? 'Faol' : 'Bloklangan'}
                size="xs"
              />
            </InfoRow>
            <InfoRow label="To'lov turi">
              {driver.paymentType === 'per_trip'
                ? `Har reys uchun ${driver.perTripRate}%`
                : `Oylik: ${formatMoney(driver.baseSalary, 'UZS', true)}`}
            </InfoRow>
          </Card>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <DriverForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          fetchDriver(id);
        }}
        driver={driver}
      />

      <Modal
        isOpen={showSalaryForm}
        onClose={() => setShowSalaryForm(false)}
        title="Maosh to'lash"
      >
        <form onSubmit={handleSalary} className="flex flex-col gap-4">
          <Input
            label="Miqdor (UZS)"
            type="number"
            required
            value={salary.amount}
            onChange={(e) => setSalary((s) => ({ ...s, amount: e.target.value }))}
            placeholder="0"
          />
          <Input
            label="Izoh"
            value={salary.note}
            onChange={(e) => setSalary((s) => ({ ...s, note: e.target.value }))}
            placeholder="Ixtiyoriy..."
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowSalaryForm(false)}
            >
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={salaryLoading}>
              To'lash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DriverDetail;
