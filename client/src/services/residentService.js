import api from './api';

const residentService = {
  getAll: (params = {}) => api.get('/residents', { params }),
  getById: (id) => api.get(`/residents/${id}`),
  create: (data) => api.post('/residents', data),
  update: (id, data) => api.put(`/residents/${id}`, data),
  delete: (id) => api.delete(`/residents/${id}`),
};

export default residentService;