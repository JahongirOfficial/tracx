import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Combobox from '../ui/Combobox';
import Button from '../ui/Button';
import StepHeader from '../ui/StepHeader';
import api from '../../services/api';
import useFlightStore from '../../stores/flightStore';
import useUiStore from '../../stores/uiStore';
import { Gauge, Droplets, Fuel } from 'lucide-react';

const STEPS = ['Ekipaj', 'Reys'];

const FUEL_TYPES = [
  { value: 'diesel',  label: 'Dizel',  emoji: '⛽' },
  { value: 'benzin',  label: 'Benzin', emoji: '🟥' },
  { value: 'metan',   label: 'Metan',  emoji: '🔵' },
  { value: 'propan',  label: 'Propan', emoji: '🟡' },
];

const INITIAL = {
  driverId: '',
  vehicleId: '',
  flightType: 'domestic',
  roadMoney: '',
  fuelType: '',
  startOdometer: '',
  startFuel: '',
};

const FlightForm = ({ isOpen, onClose }) => {
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState(INITIAL);
  const [drivers, setDrivers]   = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(false);

  const { createFlight } = useFlightStore();
  const { addToast }     = useUiStore();

  useEffect(() => {
    if (!isOpen) return;
    api.get('/drivers',  { params: { limit: 200 } }).then((r) => setDrivers(r.data  || []));
    api.get('/vehicles', { params: { limit: 200 } }).then((r) => setVehicles(r.data || []));
  }, [isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleClose = () => { setStep(0); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFlight({
        driverId:      form.driverId,
        vehicleId:     form.vehicleId,
        flightType:    form.flightType,
        roadMoney:     parseFloat(form.roadMoney) || 0,
        fuelType:      form.fuelType || undefined,
        startOdometer: form.startOdometer ? parseInt(form.startOdometer) : undefined,
        startFuel:     form.startFuel     ? parseFloat(form.startFuel)   : undefined,
      });
      addToast('Reys yaratildi', 'success');
      setForm(INITIAL);
      handleClose();
    } catch (err) {
      addToast(err.message || 'Xato yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const driverOptions = drivers
    .filter((d) => d.isActive)
    .map((d) => ({ value: d.id, label: `${d.fullName} — ${d.status === 'free' ? "Bo'sh" : 'Band'}` }));

  const vehicleOptions = vehicles
    .filter((v) => v.isActive)
    .map((v) => ({ value: v.id, label: `${v.plateNumber}${v.brand ? `  ${v.brand} ${v.model || ''}` : ''}` }));

  const canNext = !!form.driverId && !!form.vehicleId;
  const fuelUnit = (form.fuelType === 'metan' || form.fuelType === 'propan') ? 'kub' : 'litr';

  /* Toggle button style */
  const tog = (active) => [
    'flex-1 py-2 text-sm font-medium border-b-2 transition-colors duration-150',
    active
      ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
  ].join(' ');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yangi reys" size="md">
      <StepHeader steps={STEPS} current={step} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ─── Step 0: Ekipaj ─── */}
        {step === 0 && (<>
          <Combobox
            label="Haydovchi"
            required
            value={form.driverId}
            onChange={(v) => set('driverId', v)}
            placeholder="Haydovchini tanlang..."
            options={driverOptions}
          />
          <Combobox
            label="Mashina"
            required
            value={form.vehicleId}
            onChange={(v) => set('vehicleId', v)}
            placeholder="Mashinani tanlang..."
            options={vehicleOptions}
          />

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={handleClose}>Bekor</Button>
            <Button type="button" fullWidth disabled={!canNext} onClick={() => setStep(1)}>
              Keyingi →
            </Button>
          </div>
        </>)}

        {/* ─── Step 1: Reys ─── */}
        {step === 1 && (<>

          {/* Reys turi — tab style */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Reys turi</p>
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button type="button" className={tog(form.flightType === 'domestic')}
                onClick={() => set('flightType', 'domestic')}>Ichki</button>
              <button type="button" className={tog(form.flightType === 'international')}
                onClick={() => set('flightType', 'international')}>Xalqaro</button>
            </div>
          </div>

          {/* Yo'l puli */}
          <Input
            label="Yo'l puli (UZS)"
            money
            value={form.roadMoney}
            onChange={(e) => set('roadMoney', e.target.value)}
            placeholder="0"
          />

          {/* Yoqilg'i turi */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Fuel size={11} />
              Yoqilg'i turi <span className="font-normal normal-case tracking-normal text-slate-400">(ixtiyoriy)</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {FUEL_TYPES.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => set('fuelType', form.fuelType === ft.value ? '' : ft.value)}
                  className={[
                    'flex flex-col items-center gap-1 py-3 text-xs font-medium border transition-colors duration-150',
                    form.fuelType === ft.value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
                  ].join(' ')}
                >
                  <span className="text-lg leading-none">{ft.emoji}</span>
                  {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* Boshlang'ich ko'rsatkichlar */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Gauge size={11} />
              Boshlang'ich ko'rsatkichlar
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={fuelUnit === 'kub' ? "Boshlang'ich kub" : "Boshlang'ich litr"}
                type="number"
                leftIcon={Droplets}
                value={form.startFuel}
                onChange={(e) => set('startFuel', e.target.value)}
                placeholder="0"
              />
              <Input
                label="Odometr (km)"
                type="number"
                leftIcon={Gauge}
                value={form.startOdometer}
                onChange={(e) => set('startOdometer', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setStep(0)}>← Orqaga</Button>
            <Button type="submit" fullWidth loading={loading}>Reys yaratish</Button>
          </div>
        </>)}

      </form>
    </Modal>
  );
};

export default FlightForm;
