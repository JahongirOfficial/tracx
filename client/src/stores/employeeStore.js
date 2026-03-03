import { create } from 'zustand';
import api from '../services/api';

const useEmployeeStore = create((set) => ({
  employees: [],
  meta: null,
  loading: false,

  fetchEmployees: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/employees', { params });
      set({ employees: res.data, meta: res.meta, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createEmployee: async (data) => {
    const res = await api.post('/employees', data);
    set((s) => ({ employees: [res.data, ...s.employees] }));
    return res.data;
  },

  updateEmployee: async (id, data) => {
    const res = await api.put(`/employees/${id}`, data);
    set((s) => ({ employees: s.employees.map((e) => e.id === id ? res.data : e) }));
    return res.data;
  },

  deleteEmployee: async (id) => {
    await api.delete(`/employees/${id}`);
    set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
  },

  changePassword: async (id, newPassword) => {
    await api.put(`/employees/${id}/password`, { newPassword });
  },
}));

export default useEmployeeStore;
