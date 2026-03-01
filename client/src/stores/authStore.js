import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  role: null,
  isLoading: true,

  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { user, accessToken, refreshToken, role } = res.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, token: accessToken, refreshToken, role, isLoading: false });
    return role;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.clear();
    set({ user: null, token: null, refreshToken: null, role: null });
  },

  initAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, token, role: res.data.role, isLoading: false });
    } catch {
      localStorage.clear();
      set({ user: null, token: null, role: null, isLoading: false });
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = res.data;
    localStorage.setItem('token', accessToken);
    set({ token: accessToken });
    return accessToken;
  },

  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}));

export default useAuthStore;
