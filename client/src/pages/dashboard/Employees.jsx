import { useEffect, useState } from 'react';
import {
  Plus, Users, Search, X, Key, Trash2, Edit2,
  Shield, CheckSquare, Square, ChevronDown, ChevronUp,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useEmployeeStore from '../../stores/employeeStore';
import useUiStore from '../../stores/uiStore';
import { EMPLOYEE_PERMISSION_GROUPS, EMPLOYEE_POSITIONS } from '../../utils/constants';

/* ── Permission preset bundles ── */
const PRESETS = [
  {
    label: 'Dispetcher',
    perms: ['view_flights', 'create_flight', 'view_legs', 'add_leg', 'view_expenses', 'add_expense', 'view_drivers', 'view_vehicles', 'view_reports'],
  },
  {
    label: 'Buxgalter',
    perms: ['view_flights', 'view_legs', 'view_expenses', 'view_reports', 'view_finance', 'add_driver_payment', 'view_drivers'],
  },
  {
    label: 'Logist',
    perms: ['view_flights', 'create_flight', 'edit_flight', 'view_legs', 'add_leg', 'edit_leg', 'view_expenses', 'add_expense', 'view_drivers', 'view_vehicles'],
  },
];

const ALL_PERMS = EMPLOYEE_PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.value));

const EMPTY_FORM = {
  username: '', password: '', fullName: '', phone: '',
  position: 'dispatcher', permissions: [],
};

/* ── Permission group checkbox section ── */
const PermGroup = ({ group, permissions, selected, onChange }) => {
  const [open, setOpen] = useState(true);
  const groupPerms = permissions.map((p) => p.value);
  const allChecked = groupPerms.every((p) => selected.includes(p));
  const someChecked = groupPerms.some((p) => selected.includes(p));

  const toggleGroup = () => {
    if (allChecked) {
      onChange(selected.filter((p) => !groupPerms.includes(p)));
    } else {
      const added = [...new Set([...selected, ...groupPerms])];
      onChange(added);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleGroup(); }}
            className="shrink-0"
          >
            {allChecked ? (
              <CheckSquare size={16} className="text-primary-600 dark:text-primary-400" />
            ) : someChecked ? (
              <CheckSquare size={16} className="text-slate-400" />
            ) : (
              <Square size={16} className="text-slate-300 dark:text-slate-600" />
            )}
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{group}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-4">
          {permissions.map((perm) => (
            <label key={perm.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(perm.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, perm.value]);
                  } else {
                    onChange(selected.filter((p) => p !== perm.value));
                  }
                }}
                className="w-3.5 h-3.5 rounded accent-primary-600"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                {perm.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main component ── */
const Employees = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showPwModal, setShowPwModal] = useState(null); // employee id
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const { employees, meta, loading, fetchEmployees, createEmployee, updateEmployee, deleteEmployee, changePassword } = useEmployeeStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchEmployees(search ? { search } : {}), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingEmployee(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setForm({
      username: emp.username,
      password: '',
      fullName: emp.fullName,
      phone: emp.phone || '',
      position: emp.position || 'dispatcher',
      permissions: emp.permissions || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          fullName: form.fullName,
          phone: form.phone || undefined,
          position: form.position,
          permissions: form.permissions,
        });
        addToast('Xodim yangilandi', 'success');
      } else {
        await createEmployee({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone || undefined,
          position: form.position,
          permissions: form.permissions,
        });
        addToast("Xodim qo'shildi", 'success');
      }
      setShowForm(false);
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee(deletingId);
      addToast("Xodim o'chirildi", 'success');
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      await changePassword(showPwModal, newPw);
      addToast('Parol yangilandi', 'success');
      setShowPwModal(null);
      setNewPw('');
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setForm((f) => ({ ...f, permissions: preset.perms }));
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="page-enter space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            Xodimlar
            {meta?.total ? (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums">
                {meta.total}
              </span>
            ) : null}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Xodimlar va ularning ruxsatlari</p>
        </div>
        <Button icon={Plus} onClick={openCreate} className="sm:self-start">
          Yangi xodim
        </Button>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center gap-3">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki login bo'yicha qidirish..."
          className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={['h-[58px] skeleton-shimmer', i ? 'border-t border-slate-100 dark:border-slate-800' : ''].join(' ')} />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <EmptyState
            icon={Users}
            title="Xodimlar topilmadi"
            description="Yangi xodim qo'shish uchun quyidagi tugmani bosing"
            action={openCreate}
            actionLabel="Yangi xodim"
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Xodim</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lavozim</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ruxsatlar</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="w-24 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">{emp.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{emp.username}</p>
                      {emp.phone && <p className="text-[11px] text-slate-400 mt-0.5">{emp.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {EMPLOYEE_POSITIONS.find((p) => p.value === emp.position)?.label || emp.position || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
                        <Shield size={10} />
                        {(emp.permissions || []).length} ruxsat
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={emp.isActive ? 'active' : 'inactive'} label={emp.isActive ? 'Faol' : 'Nofaol'} dot size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowPwModal(emp.id); setNewPw(''); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Parol o'zgartirish"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(emp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit employee modal ── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingEmployee ? 'Xodimni tahrirlash' : "Yangi xodim qo'shish"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Login"
              required
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              placeholder="login123"
              disabled={!!editingEmployee}
            />
            {!editingEmployee && (
              <Input
                label="Parol"
                type="password"
                required
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••"
              />
            )}
            {editingEmployee && <div />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="To'liq ism"
              required
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Alisher Karimov"
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+998 90 123 45 67"
            />
          </div>
          <Select
            label="Lavozim"
            value={form.position}
            onChange={(e) => set('position', e.target.value)}
            options={EMPLOYEE_POSITIONS}
          />

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield size={14} className="text-primary-500" />
                Ruxsatlar ({form.permissions.length}/{ALL_PERMS.length})
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => set('permissions', ALL_PERMS)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Barchasi
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => set('permissions', [])}
                  className="text-xs text-red-500 hover:underline"
                >
                  Tozalash
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-300 hover:text-primary-600 transition-colors"
                >
                  {preset.label} shablon
                </button>
              ))}
            </div>

            {/* Permission groups */}
            <div className="flex flex-col gap-2">
              {EMPLOYEE_PERMISSION_GROUPS.map((g) => (
                <PermGroup
                  key={g.group}
                  group={g.group}
                  permissions={g.permissions}
                  selected={form.permissions}
                  onChange={(perms) => set('permissions', perms)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)}>
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={formLoading}>
              {editingEmployee ? 'Saqlash' : "Qo'shish"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Change password modal ── */}
      <Modal
        isOpen={!!showPwModal}
        onClose={() => setShowPwModal(null)}
        title="Parolni o'zgartirish"
      >
        <form onSubmit={handleChangePw} className="flex flex-col gap-4">
          <Input
            label="Yangi parol"
            type="password"
            required
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Kamida 6 ta belgi"
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowPwModal(null)}>
              Bekor
            </Button>
            <Button type="submit" fullWidth loading={pwLoading}>
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Xodimni o'chirish"
        message="Ushbu xodimni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
        confirmLabel="O'chirish"
        variant="danger"
      />
    </div>
  );
};

export default Employees;
