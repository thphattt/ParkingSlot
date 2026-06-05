import api from './api';

const settingsService = {
  // Cá nhân
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  changePassword: (data) => api.put('/settings/change-password', data),

  // Quản lý nhân viên (Admin)
  getUsers: (params = {}) => api.get('/settings/users', { params }),
  createUser: (data) => api.post('/settings/users', data),
  toggleUserStatus: (id) => api.put(`/settings/users/${id}/toggle`),
  resetPassword: (id) => api.put(`/settings/users/${id}/reset-password`),
  deleteUser: (id) => api.delete(`/settings/users/${id}`),
};

export default settingsService;