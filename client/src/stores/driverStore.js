import { create } from 'zustand';
import api from '../services/api';

const useDriverStore = create((set) => ({
  drivers: [],
  currentDriver: null,
  meta: null,
  loading: false,

  fetchDrivers: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/drivers', { params });
      set({ drivers: res.data, meta: res.meta, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchDriver: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(`/drivers/${id}`);
      set({ currentDriver: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createDriver: async (data) => {
    const res = await api.post('/drivers', data);
    set((s) => ({ drivers: [res.data, ...s.drivers] }));
    return res.data;
  },

  updateDriver: async (id, data) => {
    const res = await api.put(`/drivers/${id}`, data);
    set((s) => ({
      drivers: s.drivers.map((d) => d.id === id ? res.data : d),
      currentDriver: s.currentDriver?.id === id ? res.data : s.currentDriver,
    }));
    return res.data;
  },

  deleteDriver: async (id) => {
    await api.delete(`/drivers/${id}`);
    set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) }));
  },

  paySalary: async (driverId, data) => {
    const res = await api.post(`/drivers/${driverId}/salary`, data);
    return res.data;
  },

  clearCurrentDriver: () => set({ currentDriver: null }),
}));

export default useDriverStore;
