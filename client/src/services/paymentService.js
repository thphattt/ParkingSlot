import api from './api';

const paymentService = {
  getAll: (params = {}) => api.get('/payments', { params }),
  generate: (data) => api.post('/payments/generate', data),
  markAsPaid: (id, data) => api.put(`/payments/${id}/pay`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export default paymentService;