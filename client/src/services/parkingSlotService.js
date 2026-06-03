import api from './api';

const parkingSlotService = {
  getAll: (params = {}) => api.get('/parking-slots', { params }),
  getById: (id) => api.get(`/parking-slots/${id}`),
  create: (data) => api.post('/parking-slots', data),
  createBulk: (data) => api.post('/parking-slots/bulk', data),
  update: (id, data) => api.put(`/parking-slots/${id}`, data),
  delete: (id) => api.delete(`/parking-slots/${id}`),
};

export default parkingSlotService;