import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import uz from '../i18n/uz.json';
import ru from '../i18n/ru.json';

const translations = { uz, ru };

const useUiStore = create(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      lang: 'uz',
      toasts: [],

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },

      setLang: (lang) => set({ lang }),

      t: (key) => {
        const lang = get().lang;
        const dict = translations[lang] || uz;
        const parts = key.split('.');
        let val = dict;
        for (const p of parts) {
          val = val?.[p];
          if (val === undefined) return key;
        }
        return typeof val === 'string' ? val : key;
      },

      addToast: (message, type = 'success') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
      },

      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'avtojon-ui',
      partialize: (s) => ({ theme: s.theme, lang: s.lang, sidebarOpen: s.sidebarOpen }),
    }
  )
);

export default useUiStore;
