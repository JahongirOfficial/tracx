import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Phone, User, Calendar,
  Wallet, TrendingUp, TrendingDown, Plus, Edit3,
  ShieldCheck, ShieldOff, Clock, CheckCircle2,
  AlertTriangle, Truck, Users, Plane, RefreshCw,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import useUiStore from '../../stores/uiStore';
import { formatMoney, formatDate, formatDateTime, formatPhone } from '../../utils/formatters';

/* ── helpers ── */
const planLabel = (p) => ({ trial: 'Trial', basic: 'Basic', pro: 'Pro' }[p] || p);
const planColor = (p) => ({
  trial: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  basic: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  pro:   'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
}[p] || '');

const txTypeLabel = (t) => ({
  topup:        'To\'lov',
  daily_charge: 'Kunlik hisob',
  trial_start:  'Sinov davri',
  manual:       'Qo\'l bilan',
}[t] || t);

const txTypeColor = (t, amount) => {
  if (parseFloat(amount) > 0) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-red-500 dark:text-red-400';
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-slate-500 dark:text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{value || '—'}</p>
    </div>
  </div>
);

/* ── Skeleton ── */
const Skeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
    <div className="grid lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60" />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────── */
const SuperAdminBusinessmanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUiStore();

  const [biz, setBiz]             = useState(null);
  const [balInfo, setBalInfo]     = useState(null);
  const [txs, setTxs]             = useState([]);
  const [txMeta, setTxMeta]       = useState(null);
  const [txPage, setTxPage]       = useState(1);
  const [loading, setLoading]     = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [actionLoading, setAL]    = useState(false);

  /* modals */
  const [showTopup, setTopup]     = useState(false);
  const [showSet, setSet]         = useState(false);
  const [showSub, setSub]         = useState(false);
  const [showEdit, setEdit]       = useState(false);
  const [topupAmt, setTopupAmt]   = useState('');
  const [setAmt, setSetAmt]       = useState('');
  const [subForm, setSubForm]     = useState({ plan: 'basic', months: 1 });
  const [editForm, setEditForm]   = useState({});

  /* ── Load businessman ── */
  const loadBiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/businessmen/${id}`);
      setBiz(res.data);
      setBalInfo(res.data.balanceInfo);
      setEditForm({
        fullName:    res.data.fullName    || '',
        phone:       res.data.phone       || '',
        companyName: res.data.companyName || '',
      });
      setSubForm({ plan: res.data.plan || 'basic', months: 1 });
    } catch { navigate('/super-admin/businessmen'); }
    setLoading(false);
  }, [id, navigate]);

  /* ── Load transactions ── */
  const loadTxs = useCallback(async (p = 1) => {
    setTxLoading(true);
    try {
      const res = await api.get(`/super-admin/businessmen/${id}/transactions`, {
        params: { page: p, limit: 10 },
      });
      setTxs(res.transactions || []);
      setTxMeta(res.meta);
    } catch {}
    setTxLoading(false);
  }, [id]);

  useEffect(() => { loadBiz(); }, [loadBiz]);
  useEffect(() => { loadTxs(txPage); }, [loadTxs, txPage]);

  /* ── Toggle active ── */
  const handleToggle = async () => {
    setAL(true);
    try {
      await api.put(`/super-admin/businessmen/${id}`, { isActive: !biz.isActive });
      addToast(biz.isActive ? 'Bloklandi' : 'Faollashtirildi', 'success');
      loadBiz();
    } catch (err) { addToast(err.message || 'Xato', 'error'); }
    setAL(false);
  };

  /* ── Top-up ── */
  const handleTopup = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topupAmt);
    if (!amount || amount <= 0) return addToast('Miqdorni kiriting', 'error');
    setAL(true);
    try {
      const res = await api.post(`/super-admin/businessmen/${id}/balance/topup`, { amount });
      setBalInfo(res.data);
      addToast(`+${formatMoney(amount)} qo'shildi`, 'success');
      setTopup(false); setTopupAmt('');
      loadTxs(1); setTxPage(1);
    } catch (err) { addToast(err.message || 'Xato', 'error'); }
    setAL(false);
  };

  /* ── Set balance ── */
  const handleSet = async (e) => {
    e.preventDefault();
    const amount = parseFloat(setAmt);
    if (isNaN(amount)) return addToast('Miqdorni kiriting', 'error');
    setAL(true);
    try {
      const res = await api.post(`/super-admin/businessmen/${id}/balance/set`, { balance: amount });
      setBalInfo(res.data);
      addToast('Balans o\'rnatildi', 'success');
      setSet(false); setSetAmt('');
      loadTxs(1); setTxPage(1);
    } catch (err) { addToast(err.message || 'Xato', 'error'); }
    setAL(false);
  };

  /* ── Manage subscription ── */
  const handleSub = async (e) => {
    e.preventDefault();
    setAL(true);
    try {
      await api.put(`/super-admin/businessmen/${id}/subscription`, subForm);
      addToast('Obuna yangilandi', 'success');
      setSub(false); loadBiz();
    } catch (err) { addToast(err.message || 'Xato', 'error'); }
    setAL(false);
  };

  /* ── Edit info ── */
  const handleEdit = async (e) => {
    e.preventDefault();
    setAL(true);
    try {
      await api.put(`/super-admin/businessmen/${id}`, editForm);
      addToast('Ma\'lumotlar yangilandi', 'success');
      setEdit(false); loadBiz();
    } catch (err) { addToast(err.message || 'Xato', 'error'); }
    setAL(false);
  };

  if (loading) return (
    <div className="space-y-5">
      <button onClick={() => navigate('/super-admin/businessmen')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </button>
      <Skeleton />
    </div>
  );

  if (!biz) return null;

  const daysLeftColor = balInfo?.isExpired
    ? 'text-red-500'
    : (balInfo?.daysLeft ?? 0) <= 3
    ? 'text-amber-500'
    : 'text-emerald-600 dark:text-emerald-400';

  const balPct = balInfo?.isTrial
    ? 100
    : balInfo?.dailyCost > 0
    ? Math.min(100, Math.max(0, ((balInfo.balance / (balInfo.dailyCost * 30)) * 100)))
    : 100;

  const initials = (biz.fullName || biz.username || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/super-admin/businessmen')}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Biznesmenlar ro'yxati
      </button>

      {/* ── Top header card ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-primary-500/25 shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {biz.fullName || biz.username}
                </h1>
                <Badge
                  status={biz.isActive ? 'active' : 'inactive'}
                  label={biz.isActive ? 'Faol' : 'Bloklangan'}
                  size="xs"
                />
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${planColor(biz.plan)}`}>
                  {planLabel(biz.plan)}
                </span>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-mono mt-0.5">@{biz.username}</p>
              {biz.companyName && (
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <Building2 size={13} /> {biz.companyName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="secondary" icon={Edit3} onClick={() => setEdit(true)}>
              Tahrirlash
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSub(true)}>
              Obuna
            </Button>
            <Button
              size="sm"
              variant={biz.isActive ? 'danger' : 'primary'}
              icon={biz.isActive ? ShieldOff : ShieldCheck}
              loading={actionLoading}
              onClick={handleToggle}
            >
              {biz.isActive ? 'Bloklash' : 'Faollashtirish'}
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700/40">
          {[
            { icon: Users, label: 'Haydovchilar', value: biz._count?.drivers ?? 0 },
            { icon: Truck, label: 'Mashinalar',   value: biz._count?.vehicles ?? 0 },
            { icon: Plane, label: 'Reyslar',       value: biz._count?.flights ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Info card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">Shaxsiy ma'lumotlar</h2>
          <InfoRow icon={User}     label="Username"    value={`@${biz.username}`} />
          <InfoRow icon={User}     label="To'liq ism"  value={biz.fullName} />
          <InfoRow icon={Phone}    label="Telefon"     value={formatPhone(biz.phone)} />
          <InfoRow icon={Building2} label="Kompaniya"  value={biz.companyName} />
          <InfoRow icon={Calendar} label="Ro'yxatdan o'tgan" value={formatDate(biz.registrationDate)} />
          <InfoRow icon={Calendar} label="Obuna tugaydi" value={formatDate(biz.subscriptionEnd)} />
        </div>

        {/* ── Balance card ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Balance overview */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-lg shadow-primary-600/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-primary-200 text-sm">Joriy balans</p>
                <p className="text-3xl font-bold mt-1">
                  {formatMoney(balInfo?.balance ?? 0)}
                </p>
              </div>
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-white" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-primary-200 mb-1.5">
                <span>
                  {balInfo?.isTrial
                    ? `Sinov davri: ~${balInfo.trialDaysLeft ?? 0} kun qoldi`
                    : `~${balInfo?.daysLeft ?? 0} kun qoldi`}
                </span>
                {balInfo?.dailyCost > 0 && (
                  <span>{formatMoney(balInfo.dailyCost)}/kun</span>
                )}
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${balPct}%` }}
                />
              </div>
            </div>

            {/* Status chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {balInfo?.isTrial ? (
                <span className="flex items-center gap-1.5 text-xs bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-full">
                  <Clock size={11} /> Sinov davri
                </span>
              ) : balInfo?.isExpired ? (
                <span className="flex items-center gap-1.5 text-xs bg-red-400/20 text-red-200 border border-red-400/30 px-2.5 py-1 rounded-full">
                  <AlertTriangle size={11} /> To'xtatilgan
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={11} /> Faol
                </span>
              )}
              {balInfo?.vehicleCount > 0 && (
                <span className="text-xs bg-white/10 text-primary-200 border border-white/20 px-2.5 py-1 rounded-full">
                  {balInfo.vehicleCount} ta mashina
                </span>
              )}
            </div>
          </div>

          {/* Balance actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTopup(true)}
              className="flex items-center justify-center gap-2.5 bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl p-4 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
                <TrendingUp size={17} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Balans qo'shish</p>
                <p className="text-xs text-slate-400">Miqdorni oshirish</p>
              </div>
            </button>

            <button
              onClick={() => { setSetAmt(String(Math.round(balInfo?.balance ?? 0))); setSet(true); }}
              className="flex items-center justify-center gap-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 rounded-2xl p-4 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                <Edit3 size={17} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Balans o'rnatish</p>
                <p className="text-xs text-slate-400">Aniq miqdor kiritish</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Transaction history ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
          <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Tranzaksiya tarixi</h2>
          <button
            onClick={() => { setTxPage(1); loadTxs(1); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <RefreshCw size={14} className={txLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50">
                {['Sana', 'Tur', 'Miqdor', 'Oldin', 'Keyin', 'Izoh'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-700/40">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Tranzaksiyalar topilmadi
                  </td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
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
                    <td className="py-3 px-4 text-sm text-slate-500">{formatMoney(tx.balanceBefore)}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{formatMoney(tx.balanceAfter)}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 max-w-[160px] truncate">
                      {tx.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tx pagination */}
        {txMeta && txMeta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-xs text-slate-400">{txMeta.total} ta tranzaksiya</p>
            <div className="flex items-center gap-1.5">
              <button disabled={txPage <= 1} onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} className="text-slate-500" />
              </button>
              <span className="text-xs text-slate-500 px-2">{txPage} / {txMeta.pages}</span>
              <button disabled={txPage >= txMeta.pages} onClick={() => setTxPage((p) => Math.min(txMeta.pages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Top-up modal */}
      <Modal isOpen={showTopup} onClose={() => setTopup(false)} title="Balansni to'ldirish">
        <form onSubmit={handleTopup} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Joriy balans: <span className="font-semibold text-slate-800 dark:text-white">{formatMoney(balInfo?.balance ?? 0)}</span>
          </p>
          <Input
            label="Qo'shiladigan miqdor (UZS)"
            type="number"
            min="1000"
            step="1000"
            required
            autoFocus
            value={topupAmt}
            onChange={(e) => setTopupAmt(e.target.value)}
            placeholder="100000"
          />
          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000, 500000, 1000000, 2000000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopupAmt(String(amt))}
                className={[
                  'py-2 text-xs font-medium rounded-xl border transition-all',
                  topupAmt === String(amt)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300',
                ].join(' ')}
              >
                {formatMoney(amt, 'UZS', true)}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setTopup(false)}>Bekor</Button>
            <Button type="submit" fullWidth loading={actionLoading} icon={TrendingUp}>
              Qo'shish
            </Button>
          </div>
        </form>
      </Modal>

      {/* Set balance modal */}
      <Modal isOpen={showSet} onClose={() => setSet(false)} title="Balansni o'rnatish">
        <form onSubmit={handleSet} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Joriy balans: <span className="font-semibold text-slate-800 dark:text-white">{formatMoney(balInfo?.balance ?? 0)}</span>
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Bu amalni bajarish balansni ko'rsatilgan miqdorga o'rnatadi va farqni tranzaksiya sifatida qayd etadi.
            </p>
          </div>
          <Input
            label="Yangi balans (UZS)"
            type="number"
            step="1000"
            required
            autoFocus
            value={setAmt}
            onChange={(e) => setSetAmt(e.target.value)}
            placeholder="0"
          />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setSet(false)}>Bekor</Button>
            <Button type="submit" fullWidth loading={actionLoading}>O'rnatish</Button>
          </div>
        </form>
      </Modal>

      {/* Subscription modal */}
      <Modal isOpen={showSub} onClose={() => setSub(false)} title="Obunani boshqarish">
        <form onSubmit={handleSub} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reja tanlang</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'trial', label: 'Trial',  desc: '7 kun' },
                { value: 'basic', label: 'Basic',  desc: 'Standart' },
                { value: 'pro',   label: 'Pro',    desc: "To'liq" },
              ].map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setSubForm((f) => ({ ...f, plan: plan.value }))}
                  className={[
                    'flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all',
                    subForm.plan === plan.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300',
                  ].join(' ')}
                >
                  <span className={`font-bold text-sm ${subForm.plan === plan.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
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
            min="1"
            max="24"
            value={subForm.months}
            onChange={(e) => setSubForm((f) => ({ ...f, months: parseInt(e.target.value) || 1 }))}
          />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setSub(false)}>Bekor</Button>
            <Button type="submit" fullWidth loading={actionLoading}>Saqlash</Button>
          </div>
        </form>
      </Modal>

      {/* Edit info modal */}
      <Modal isOpen={showEdit} onClose={() => setEdit(false)} title="Ma'lumotlarni tahrirlash">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="To'liq ism" value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Ism Familiya" />
          <Input label="Telefon" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998901234567" />
          <Input label="Kompaniya" value={editForm.companyName} onChange={(e) => setEditForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Kompaniya LLC" />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setEdit(false)}>Bekor</Button>
            <Button type="submit" fullWidth loading={actionLoading}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminBusinessmanDetail;
