import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, RefreshCw, Search, Building2,
  Users, ShieldOff, Clock, ChevronRight, Wallet,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import useUiStore from '../../stores/uiStore';
import { formatMoney, formatDate, formatPhone } from '../../utils/formatters';

/* ── Quick stat card ── */
const QStat = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 shadow-card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color] || colors.blue}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
      </div>
    </div>
  );
};

/* ── Skeleton rows ── */
const SkeletonRows = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-700/40">
        <td className="py-3 px-4"><div className="h-4 w-6 bg-slate-100 dark:bg-slate-700 rounded" /></td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-100 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </td>
        <td className="py-3 px-4"><div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-700 rounded" /></td>
        <td className="py-3 px-4"><div className="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full" /></td>
        <td className="py-3 px-4"><div className="h-3.5 w-20 bg-slate-100 dark:bg-slate-700 rounded" /></td>
        <td className="py-3 px-4"><div className="h-5 w-14 bg-slate-100 dark:bg-slate-700 rounded-full" /></td>
        <td className="py-3 px-4" />
      </tr>
    ))}
  </>
);

/* ── Plan label helper ── */
const planLabel = (p) => ({ trial: 'Trial', basic: 'Basic', pro: 'Pro' }[p] || p);
const planColor = (p) => ({ trial: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400', basic: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', pro: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400' }[p] || '');

/* ── Avatar gradient ── */
const avatarColor = (name = '') => {
  const colors = ['from-blue-500 to-blue-600','from-violet-500 to-violet-600','from-emerald-500 to-emerald-600','from-amber-500 to-orange-500','from-rose-500 to-pink-500'];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
};

/* ─────────────────────────────────────────────── */
const SuperAdminBusinessmen = () => {
  const [items, setItems]         = useState([]);
  const [meta, setMeta]           = useState(null);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [planFilter, setPlan]     = useState('');
  const [showCreate, setCreate]   = useState(false);
  const [actionLoading, setAL]    = useState(false);
  const [form, setForm]           = useState({
    username: '', password: '', fullName: '', phone: '', companyName: '',
  });

  const navigate    = useNavigate();
  const { addToast } = useUiStore();

  /* ── Load list ── */
  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const [bizRes, statsRes] = await Promise.all([
        api.get('/super-admin/businessmen', {
          params: {
            page: p, limit: 20,
            search:  search  || undefined,
            status:  statusFilter || undefined,
            plan:    planFilter   || undefined,
          },
        }),
        api.get('/super-admin/stats'),
      ]);
      setItems(bizRes.data || []);
      setMeta(bizRes.meta);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  }, [search, statusFilter, planFilter, page]);

  useEffect(() => { load(1); setPage(1); }, [search, statusFilter, planFilter]);
  useEffect(() => { load(page); }, [page]);

  /* ── Create ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setAL(true);
    try {
      await api.post('/super-admin/businessmen', form);
      addToast('Biznesmen yaratildi', 'success');
      setCreate(false);
      setForm({ username: '', password: '', fullName: '', phone: '', companyName: '' });
      load(1);
    } catch (err) {
      addToast(err.message || 'Xato yuz berdi', 'error');
    } finally { setAL(false); }
  };

  /* ── Filter pills ── */
  const StatusPill = ({ val, label }) => (
    <button
      onClick={() => setStatus(statusFilter === val ? '' : val)}
      className={[
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
        statusFilter === val
          ? 'bg-primary-600 text-white shadow-sm'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300',
      ].join(' ')}
    >
      {label}
    </button>
  );

  const PlanPill = ({ val, label }) => (
    <button
      onClick={() => setPlan(planFilter === val ? '' : val)}
      className={[
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
        planFilter === val
          ? 'bg-primary-600 text-white shadow-sm'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Biznesmenlar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {meta?.total ?? 0} ta biznesmen
          </p>
        </div>
        <Button icon={Plus} onClick={() => setCreate(true)}>Qo'shish</Button>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QStat label="Jami"          value={stats.totalBusinessmen}  icon={Building2}   color="blue"   />
          <QStat label="Faol"          value={stats.activeBusinessmen} icon={Users}        color="green"  />
          <QStat label="Sinov davrida" value={stats.trialCount ?? 0}   icon={Clock}        color="amber"  />
          <QStat label="To'xtatilgan"  value={stats.suspendedCount ?? 0} icon={ShieldOff} color="red"    />
        </div>
      )}

      {/* Filters + search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Username, ism yoki kompaniya..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Status:</span>
            <StatusPill val="active"  label="Faol" />
            <StatusPill val="blocked" label="Bloklangan" />
          </div>

          {/* Plan pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Reja:</span>
            <PlanPill val="trial" label="Trial" />
            <PlanPill val="basic" label="Basic" />
            <PlanPill val="pro"   label="Pro" />
          </div>

          <button
            onClick={() => load(page)}
            disabled={loading}
            className="ml-auto p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50">
                {['#', 'Biznesmen', 'Kompaniya', 'Reja', 'Balans / Kun', 'Status', ''].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Biznesmenlar topilmadi
                  </td>
                </tr>
              ) : (
                items.map((b, idx) => {
                  const initials = (b.fullName || b.username || '?').charAt(0).toUpperCase();
                  const daysColor = b.isExpired ? 'text-red-500' : b.daysLeft <= 3 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400';
                  return (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/super-admin/businessmen/${b.id}`)}
                      className="border-b border-slate-100 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group"
                    >
                      {/* # */}
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {(meta?.page - 1) * 20 + idx + 1}
                      </td>
                      {/* Biznesmen */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(b.username)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {b.fullName || b.username}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">@{b.username}</p>
                          </div>
                        </div>
                      </td>
                      {/* Kompaniya */}
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {b.companyName ? (
                          <span className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-slate-400" />
                            {b.companyName}
                          </span>
                        ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      {/* Reja */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${planColor(b.plan)}`}>
                          {planLabel(b.plan)}
                        </span>
                      </td>
                      {/* Balans */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {formatMoney(b.balance)}
                          </p>
                          <p className={`text-xs font-medium ${daysColor}`}>
                            {b.isTrial ? `Sinov: ~${b.daysLeft} kun` : b.isExpired ? 'To\'xtatilgan' : `~${b.daysLeft} kun`}
                          </p>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          status={b.isActive ? 'active' : 'inactive'}
                          label={b.isActive ? 'Faol' : 'Bloklangan'}
                          size="xs"
                        />
                      </td>
                      {/* Arrow */}
                      <td className="py-3 px-4">
                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-xs text-slate-400">
              {meta.total} tadan {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} ko'rsatilmoqda
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Oldingi
              </button>
              <span className="text-xs text-slate-500 px-2">{page} / {meta.pages}</span>
              <button
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Keyingi →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create modal ── */}
      <Modal isOpen={showCreate} onClose={() => setCreate(false)} title="Yangi biznesmen yaratish">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Username *" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="username" />
            <Input label="Parol *" type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <Input label="To'liq ism" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Ism Familiya" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Telefon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998901234567" />
            <Input label="Kompaniya" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Kompaniya LLC" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setCreate(false)}>Bekor</Button>
            <Button type="submit" fullWidth loading={actionLoading}>Yaratish</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminBusinessmen;
