import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Combobox from '../ui/Combobox';
import Button from '../ui/Button';
import api from '../../services/api';
import useFlightStore from '../../stores/flightStore';
import useUiStore from '../../stores/uiStore';
import { Users, Truck, Globe, Banknote, Gauge, Droplets, Fuel } from 'lucide-react';

const FormSection = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-3 mt-1">
    <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
      <Icon size={13} className="text-primary-600 dark:text-primary-400" />
    </div>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {title}
    </p>
    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
  </div>
);

const INITIAL_FORM = {
  driverId: '',
  vehicleId: '',
  flightType: 'domestic',
  roadMoney: '',
  fuelType: '',
  startOdometer: '',
  startFuel: '',
};

const FUEL_TYPE_OPTIONS = [
  { value: 'diesel', label: 'Dizel', emoji: '⛽' },
  { value: 'metan', label: 'Metan', emoji: '🔵' },
  { value: 'benzin', label: 'Benzin', emoji: '⛽' },
  { value: 'propan', label: 'Propan', emoji: '🟡' },
];

const FlightForm = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { createFlight } = useFlightStore();
  const { addToast } = useUiStore();

  useEffect(() => {
    if (!isOpen) return;
    api.get('/drivers', { params: { limit: 200 } }).then((r) => setDrivers(r.data || []));
    api.get('/vehicles', { params: { limit: 200 } }).then((r) => setVehicles(r.data || []));
  }, [isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFlight({
        driverId: form.driverId,
        vehicleId: form.vehicleId,
        flightType: form.flightType,
        roadMoney: parseFloat(form.roadMoney) || 0,
        fuelType: form.fuelType || undefined,
        startOdometer: form.startOdometer ? parseInt(form.startOdometer) : undefined,
        startFuel: form.startFuel ? parseFloat(form.startFuel) : undefined,
      });
      addToast('Reys yaratildi', 'success');
      onClose();
      setForm(INITIAL_FORM);
    } catch (err) {
      addToast(err.message || 'Xato yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const driverOptions = drivers
    .filter((d) => d.isActive)
    .map((d) => ({
      value: d.id,
      label: `${d.fullName} (${d.status === 'free' ? "Bo'sh" : 'Band'}) — ${d.perTripRate}%`,
    }));

  const vehicleOptions = vehicles
    .filter((v) => v.isActive)
    .map((v) => ({
      value: v.id,
      label: `${v.plateNumber}${v.brand ? ` — ${v.brand} ${v.model || ''}` : ''}`,
    }));

  const canSubmit = form.driverId && form.vehicleId;

  const selectedDriver = drivers.find(d => d.id === form.driverId);
  const fuelUnit = (form.fuelType === 'metan' || form.fuelType === 'propan') ? 'kub' : 'litr';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi reys yaratish">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Section 1: Crew & vehicle */}
        <div>
          <FormSection icon={Users} title="Ekipaj va transport" />
          <div className="flex flex-col gap-3">
            <Combobox
              label="Haydovchi"
              required
              value={form.driverId}
              onChange={(v) => set('driverId', v)}
              placeholder="Haydovchini tanlang..."
              options={driverOptions}
            />
            {selectedDriver && (
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 flex items-center gap-2">
                <span>Haydovchi ulushi:</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedDriver.perTripRate}%</span>
                <span className="text-slate-400">(foydadan)</span>
              </div>
            )}
            <Combobox
              label="Mashina"
              required
              value={form.vehicleId}
              onChange={(v) => set('vehicleId', v)}
              placeholder="Mashinani tanlang..."
              options={vehicleOptions}
            />
          </div>
        </div>

        {/* Section 2: Flight settings */}
        <div>
          <FormSection icon={Globe} title="Reys sozlamalari" />
          <div className="flex flex-col gap-3">
            {/* Flight type */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Reys turi
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'domestic', label: 'Ichki' },
                  { value: 'international', label: 'Xalqaro' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('flightType', opt.value)}
                    className={[
                      'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150',
                      form.flightType === opt.value
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Yo'l puli (UZS)"
              type="number"
              leftIcon={Banknote}
              value={form.roadMoney}
              onChange={(e) => set('roadMoney', e.target.value)}
              placeholder="0"
            />

            {/* Fuel type */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                <Fuel size={13} className="inline mr-1.5 text-slate-500" />
                Yoqilg'i turi <span className="text-slate-400 text-xs">(ixtiyoriy)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('fuelType', form.fuelType === opt.value ? '' : opt.value)}
                    className={[
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150',
                      form.fuelType === opt.value
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300',
                    ].join(' ')}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Initial readings */}
        <div>
          <FormSection icon={Gauge} title="Boshlang'ich ko'rsatkichlar" />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Odometr (km)"
              type="number"
              leftIcon={Gauge}
              value={form.startOdometer}
              onChange={(e) => set('startOdometer', e.target.value)}
              placeholder="0"
            />
            <Input
              label={`Yoqilg'i (${fuelUnit})`}
              type="number"
              leftIcon={Droplets}
              value={form.startFuel}
              onChange={(e) => set('startFuel', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" fullWidth loading={loading} disabled={!canSubmit}>
            Yaratish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FlightForm;
