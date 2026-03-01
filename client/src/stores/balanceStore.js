import { create } from 'zustand';
import api from '../services/api';

const useBalanceStore = create((set, get) => ({
  info: null,        // { balance, isTrial, trialDaysLeft, daysLeft, dailyCost, vehicleCount, isExpired }
  transactions: [],
  meta: null,
  loading: false,
  txLoading: false,

  fetchBalance: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/balance');
      // api.js interceptor returns response.data directly
      // Server: { success: true, data: { balance, ... } }  →  res = that object, res.data = inner info
      set({ info: res?.data ?? null });
    } catch {
      // keep existing info on error
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactions: async (page = 1, limit = 20) => {
    set({ txLoading: true });
    try {
      const res = await api.get('/balance/transactions', { params: { page, limit } });
      // Server: { success: true, transactions: [...], meta: {...} }  →  res = that object
      set({ transactions: res?.transactions ?? [], meta: res?.meta ?? null });
    } catch {
      set({ transactions: [], meta: null });
    } finally {
      set({ txLoading: false });
    }
  },

  createCheckout: async (amount) => {
    const res = await api.post('/balance/checkout', { amount });
    // Server: { success: true, data: { url, amount, amountTiyins } }  →  res.data = checkout info
    return res?.data;
  },

  manualTopUp: async (amount) => {
    await api.post('/balance/topup', { amount });
    await get().fetchBalance();
    await get().fetchTransactions();
  },
}));

export default useBalanceStore;
