import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// === Request Interceptor: Tự gắn token vào mỗi request ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Response Interceptor: Tự refresh token khi hết hạn ===
api.interceptors.response.use(
  (response) => response, // Response OK → trả về bình thường

  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 + token hết hạn + chưa retry
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token (cookie tự gửi theo)
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Lưu token mới
        localStorage.setItem('accessToken', data.data.accessToken);

        // Retry request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn → đăng xuất
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;