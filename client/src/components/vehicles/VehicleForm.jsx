import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { PlateInput } from '../ui/MaskedInput';
import useVehicleStore from '../../stores/vehicleStore';
import useUiStore from '../../stores/uiStore';

const VehicleForm = ({ isOpen, onClose, vehicle = null }) => {
  const isEdit = !!vehicle;
  const [form, setForm] = useState({
    plateNumber: vehicle?.plateNumber || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    color: vehicle?.color || '',
    currentOdometer: vehicle?.currentOdometer || '',
    oilChangeIntervalKm: vehicle?.oilChangeIntervalKm || '10000',
    lastOilChangeKm: vehicle?.lastOilChangeKm || '',
  });
  const [loading, setLoading] = useState(false);
  const { createVehicle, updateVehicle } = useVehicleStore();
  const { addToast } = useUiStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        currentOdometer: form.currentOdometer ? parseInt(form.currentOdometer) : 0,
        oilChangeIntervalKm: parseInt(form.oilChangeIntervalKm) || 10000,
        lastOilChangeKm: form.lastOilChangeKm ? parseInt(form.lastOilChangeKm) : 0,
      };

      if (isEdit) {
        await updateVehicle(vehicle.id, data);
        addToast('Mashina yangilandi', 'success');
      } else {
        await createVehicle(data);
        addToast('Mashina qo\'shildi', 'success');
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Xato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Mashinani tahrirlash' : 'Yangi mashina'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PlateInput
          label="Davlat raqami"
          required
          value={form.plateNumber}
          onChange={(e) => set('plateNumber', e.target.value)}
          disabled={isEdit}
          helper={isEdit ? "Davlat raqami o'zgartirilmaydi" : undefined}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Marka" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Mercedes" />
          <Input label="Model" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Actros" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Yil" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2020" />
          <Input label="Rang" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Oq" />
        </div>
        <Input
          label="Joriy speedometr (km)"
          type="number"
          value={form.currentOdometer}
          onChange={(e) => set('currentOdometer', e.target.value)}
          placeholder="0"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Moy intervali (km)"
            type="number"
            value={form.oilChangeIntervalKm}
            onChange={(e) => set('oilChangeIntervalKm', e.target.value)}
          />
          <Input
            label="Oxirgi moy (km)"
            type="number"
            value={form.lastOilChangeKm}
            onChange={(e) => set('lastOilChangeKm', e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" fullWidth loading={loading}>{isEdit ? 'Saqlash' : 'Qo\'shish'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleForm;
