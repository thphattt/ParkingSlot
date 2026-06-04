import api from './api';

const parkingLogService = {
  entry: (data) => api.post('/parking-logs/entry', data),
  exit: (data) => api.post('/parking-logs/exit', data),
  getLogs: (params = {}) => api.get('/parking-logs', { params }),
  getCurrent: () => api.get('/parking-logs/current'),
};

export default parkingLogService;