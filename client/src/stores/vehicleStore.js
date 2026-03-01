import { create } from 'zustand';
import api from '../services/api';

const useVehicleStore = create((set) => ({
  vehicles: [],
  currentVehicle: null,
  meta: null,
  loading: false,

  fetchVehicles: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/vehicles', { params });
      set({ vehicles: res.data, meta: res.meta, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchVehicle: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(`/vehicles/${id}`);
      set({ currentVehicle: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createVehicle: async (data) => {
    const res = await api.post('/vehicles', data);
    set((s) => ({ vehicles: [res.data, ...s.vehicles] }));
    return res.data;
  },

  updateVehicle: async (id, data) => {
    const res = await api.put(`/vehicles/${id}`, data);
    set((s) => ({
      vehicles: s.vehicles.map((v) => v.id === id ? res.data : v),
      currentVehicle: s.currentVehicle?.id === id ? res.data : s.currentVehicle,
    }));
    return res.data;
  },

  deleteVehicle: async (id) => {
    await api.delete(`/vehicles/${id}`);
    set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
  },

  assignDriver: async (vehicleId, driverId) => {
    const res = await api.put(`/vehicles/${vehicleId}/assign-driver`, { driverId });
    set((s) => ({
      vehicles: s.vehicles.map((v) => v.id === vehicleId ? res.data : v),
    }));
    return res.data;
  },

  addMaintenance: async (vehicleId, data) => {
    const res = await api.post(`/vehicles/${vehicleId}/maintenance`, data);
    return res.data;
  },

  clearCurrentVehicle: () => set({ currentVehicle: null }),
}));

export default useVehicleStore;
