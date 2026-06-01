import { create } from 'zustand';
import api from '../services/api';


const useAuthStore = create((set) => ({
  // === State ===
  user: null,
  isAuthenticated: false,
  isLoading: true, // true khi đang kiểm tra token lúc mở app

  // === Actions ===

  // Đăng ký
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  // Đăng nhập
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  // Đăng xuất
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Vẫn logout dù API lỗi
    }
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },

  // Kiểm tra user hiện tại (gọi khi mở app)
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get('/auth/me');
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;