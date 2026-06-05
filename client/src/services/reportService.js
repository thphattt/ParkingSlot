import api from './api';

const reportService = {
  getReports: (params = {}) => api.get('/reports', { params }),
};

export default reportService;
