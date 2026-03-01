import { create } from 'zustand';
import api from '../services/api';

const useFlightStore = create((set, get) => ({
  flights: [],
  currentFlight: null,
  meta: null,
  loading: false,
  error: null,

  fetchFlights: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/flights', { params });
      set({ flights: res.data, meta: res.meta, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchFlight: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/flights/${id}`);
      set({ currentFlight: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createFlight: async (data) => {
    const res = await api.post('/flights', data);
    set((s) => ({ flights: [res.data, ...s.flights] }));
    return res.data;
  },

  updateFlight: async (id, data) => {
    const res = await api.put(`/flights/${id}`, data);
    set((s) => ({
      flights: s.flights.map((f) => f.id === id ? res.data : f),
      currentFlight: s.currentFlight?.id === id ? res.data : s.currentFlight,
    }));
    return res.data;
  },

  deleteFlight: async (id) => {
    await api.delete(`/flights/${id}`);
    set((s) => ({ flights: s.flights.filter((f) => f.id !== id) }));
  },

  completeFlight: async (id, data) => {
    const res = await api.put(`/flights/${id}/complete`, data);
    set((s) => ({
      flights: s.flights.map((f) => f.id === id ? res.data : f),
      currentFlight: s.currentFlight?.id === id ? res.data : s.currentFlight,
    }));
    return res.data;
  },

  cancelFlight: async (id) => {
    await api.put(`/flights/${id}/cancel`);
    set((s) => ({
      flights: s.flights.map((f) => f.id === id ? { ...f, status: 'cancelled' } : f),
    }));
  },

  addLeg: async (flightId, data) => {
    const res = await api.post(`/flights/${flightId}/legs`, data);
    return res.data;
  },

  updateLeg: async (flightId, legId, data) => {
    const res = await api.put(`/flights/${flightId}/legs/${legId}`, data);
    return res.data;
  },

  deleteLeg: async (flightId, legId) => {
    await api.delete(`/flights/${flightId}/legs/${legId}`);
  },

  updateLegStatus: async (flightId, legId, status) => {
    const res = await api.put(`/flights/${flightId}/legs/${legId}/status`, { status });
    return res.data;
  },

  addExpense: async (flightId, data) => {
    const res = await api.post(`/flights/${flightId}/expenses`, data);
    return res.data;
  },

  deleteExpense: async (flightId, expId) => {
    await api.delete(`/flights/${flightId}/expenses/${expId}`);
  },

  addDriverPayment: async (flightId, amount) => {
    const res = await api.post(`/flights/${flightId}/driver-payment`, { amount });
    set((s) => ({
      currentFlight: s.currentFlight?.id === flightId ? res.data : s.currentFlight,
    }));
    return res.data;
  },

  refreshCurrentFlight: async () => {
    const id = get().currentFlight?.id;
    if (id) await get().fetchFlight(id);
  },

  clearCurrentFlight: () => set({ currentFlight: null }),
}));

export default useFlightStore;
