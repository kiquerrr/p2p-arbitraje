import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

export const generalCyclesAPI = {
  create: (data) => api.post('/general-cycles', data),
  list: (params) => api.get('/general-cycles', { params }),
  getById: (id) => api.get(`/general-cycles/${id}`),
  complete: (id) => api.put(`/general-cycles/${id}/complete`),
};

export const dailyCyclesAPI = {
  getStatus: (id) => api.get(`/daily-cycles/${id}/status`),
  close: (id, data) => api.post(`/daily-cycles/${id}/close`, data),
};

export const ordersAPI = {
  calculateBuyPrice: (data) => api.post('/orders/calculate-buy-price', data),
  calculateSellPrice: (data) => api.post('/orders/calculate-sell-price', data),
  publishBuy: (data) => api.post('/orders/publish-buy', data),
  publishSell: (data) => api.post('/orders/publish-sell', data),
  list: (dailyCycleId) => api.get(`/orders/daily-cycle/${dailyCycleId}`),
  cancel: (orderId) => api.put(`/orders/${orderId}/cancel`),
};

export const transactionsAPI = {
  registerBuy: (data) => api.post('/transactions/register-buy', data),
  registerSell: (data) => api.post('/transactions/register-sell', data),
  list: (dailyCycleId) => api.get(`/transactions/daily-cycle/${dailyCycleId}`),
};

export default api;
