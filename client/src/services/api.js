import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request interceptor — token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 bo'lsa refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;

    // Faqat login/register/refresh/logout uchun refresh qilmaymiz (loop oldini olish)
    // /auth/me — token yangilash kerak bo'ladi, shuning uchun istisno
    const isAuthEndpoint = /\/auth\/(login|register|refresh|logout|google|otp)/.test(original?.url || '');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken } = response.data.data;

        localStorage.setItem('token', accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;

        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
