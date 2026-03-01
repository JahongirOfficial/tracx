import { useEffect, useState } from 'react';
import {
  LogOut,
  Plus,
  RefreshCw,
  Users,
  Truck,
  Plane,
  Search,
  ShieldCheck,
  MoreHorizontal,
  CalendarClock,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ToastContainer from '../../components/ui/Toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';
import { formatDate } from '../../utils/formatters';

/* ─── Plan badge color mapping ─────────────────────────────────── */
const planLabel = (plan) => {
  if (plan === 'trial') return 'Trial';
  if (plan === 'basic') return 'Basic';
  if (plan === 'pro') return 'Pro';
  return plan;
};

/* ─── Component ────────────────────────────────────────────────── */
const SuperAdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [businessmen, setBusinessmen] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    companyName: '',
  });
  const [subForm, setSubForm] = useState({ plan: 'basic', months: 1 });
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { logout } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  /* ── Load data ────────────────────────────────────────────────── */
  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, bizRes] = await Promise.all([
        api.get('/super-admin/stats'),
        api.get('/super-admin/businessmen', {
          params: { limit: 20, search: search || undefined },
        }),
      ]);
      setStats(statsRes.data);
      setBusinessmen(bizRes.data || []);
      setMeta(bizRes.meta);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ── CRUD handlers ────────────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/super-admin/businessmen', form);
      addToast('Biznesmen yaratildi', 'success');
      setShowCreateForm(false);
      setForm({ username: '', password: '', fullName: '', phone: '', companyName: '' });
      load();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/super-admin/businessmen/${id}`, { isActive: !isActive });
      addToast(isActive ? 'Bloklandi' : 'Faollashtirildi', 'success');
      load();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    }
  };

  const handleManageSub = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/super-admin/businessmen/${selectedId}/subscription`, subForm);
      addToast('Obuna yangilandi', 'success');
      setShowSubForm(false);
      load();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Table columns ────────────────────────────────────────────── */
  const columns = [
    {
      key: 'username',
      title: 'Username',
      render: (v) => (
        <span className="font-mono text-sm font-medium text-slate-800 dark:text-slate-200">
          @{v}
        </span>
      ),
    },
    {
      key: 'fullName',
      title: 'Ism',
      render: (v) => v || <span className="text-slate-400">—</span>,
    },
    {
      key: 'companyName',
      title: 'Kompaniya',
      render: (v) => (
        <span className="flex items-center gap-1.5">
          {v ? (
            <>
              <Building2 size={13} className="text-slate-400" />
              {v}
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </span>
      ),
    },
    {
      key: 'plan',
      title: 'Obuna',
      render: (v, r) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            status={v}
            label={planLabel(v)}
            size="xs"
          />
          {r.subscriptionExpired && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-danger-700 dark:text-danger-400 bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800/50 px-1.5 py-0.5 rounded-full">
              Tugagan
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'subscriptionEnd',
      title: 'Muddat',
      render: (v) => (
        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <CalendarClock size={13} />
          {formatDate(v, true)}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (v) => (
        <Badge
          status={v ? 'active' : 'inactive'}
          label={v ? 'Faol' : 'Bloklangan'}
          size="xs"
        />
      ),
    },
    {
      key: 'id',
      title: '',
      render: (v, r) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(v);
              setShowSubForm(true);
            }}
          >
            Obuna
          </Button>
          <Button
            size="sm"
            variant={r.isActive ? 'danger' : 'success'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(v, r.isActive);
            }}
          >
            {r.isActive ? 'Blok' : 'Faol'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Top navigation bar ───────────────────────────────── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white leading-none text-sm">
                SuperAdmin
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Avtojon Platform
              </p>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="secondary"
            icon={LogOut}
            size="sm"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Chiqish
          </Button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Stats ──────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Biznesmenlar"
              value={`${stats.activeBusinessmen} / ${stats.totalBusinessmen}`}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Haydovchilar"
              value={stats.totalDrivers}
              icon={Users}
              color="purple"
            />
            <StatCard
              label="Mashinalar"
              value={stats.totalVehicles}
              icon={Truck}
              color="green"
            />
            <StatCard
              label="Faol reyslar"
              value={stats.activeFlights}
              icon={Plane}
              color="orange"
            />
          </div>
        )}

        {/* ── Businessmen table card ─────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
          {/* Card header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">Biznesmenlar</h2>
              {meta?.total && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Jami: {meta.total} ta
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search input */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                  placeholder="Qidirish..."
                  className={[
                    'pl-8 pr-3 py-1.5 text-sm rounded-lg border',
                    'border-slate-200 dark:border-slate-600',
                    'bg-white dark:bg-slate-700',
                    'text-slate-900 dark:text-slate-100',
                    'placeholder:text-slate-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                    'transition-shadow',
                  ].join(' ')}
                />
              </div>

              <Button
                size="sm"
                icon={RefreshCw}
                variant="secondary"
                onClick={load}
                loading={loading}
              >
                Yangilash
              </Button>
              <Button size="sm" icon={Plus} onClick={() => setShowCreateForm(true)}>
                Qo'shish
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            data={businessmen}
            loading={loading}
            emptyTitle="Biznesmenlar topilmadi"
            emptyDescription="Yangi biznesmen qo'shish uchun yuqoridagi tugmani bosing"
          />
        </div>
      </div>

      {/* ── Create businessman modal ──────────────────────────── */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Yangi biznesmen yaratish"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username"
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="username"
            />
            <Input
              label="Parol"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <Input
            label="To'liq ism"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Ism Familiya"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+998901234567"
            />
            <Input
              label="Kompaniya nomi"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="Kompaniya LLC"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowCreateForm(false)}
            >
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={actionLoading}>
              Yaratish
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Manage subscription modal ─────────────────────────── */}
      <Modal
        isOpen={showSubForm}
        onClose={() => setShowSubForm(false)}
        title="Obunani boshqarish"
      >
        <form onSubmit={handleManageSub} className="flex flex-col gap-4">
          {/* Plan visual cards */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reja
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'trial', label: 'Trial', desc: '7 kun' },
                { value: 'basic', label: 'Basic', desc: 'Standart' },
                { value: 'pro', label: 'Pro', desc: "To'liq" },
              ].map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setSubForm((f) => ({ ...f, plan: plan.value }))}
                  className={[
                    'flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all',
                    subForm.plan === plan.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300',
                  ].join(' ')}
                >
                  <span
                    className={`font-bold text-sm ${
                      subForm.plan === plan.value
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {plan.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{plan.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Muddati (oy)"
            type="number"
            value={subForm.months}
            onChange={(e) =>
              setSubForm((f) => ({ ...f, months: parseInt(e.target.value) }))
            }
            min="1"
            max="12"
            placeholder="1"
          />

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowSubForm(false)}
            >
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={actionLoading}>
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default SuperAdminPanel;
