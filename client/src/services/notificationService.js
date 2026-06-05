import api from './api';

const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  create: (data) => api.post('/notifications', data),
  autoRemind: () => api.post('/notifications/auto-remind'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;