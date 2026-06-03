import api from './api';

const contractService = {
  getAll: (params = {}) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  cancel: (id) => api.put(`/contracts/${id}/cancel`),
  delete: (id) => api.delete(`/contracts/${id}`),
};

export default contractService;