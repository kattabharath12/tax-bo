// src/services/api.js - FIXED VERSION
import axios from 'axios';

// FIXED: Correct API URL matching your Railway deployment
const API_BASE_URL = 'https://tax-box-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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

// API service methods
export const apiService = {
  // Auth methods
  login: async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  // User endpoints
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }
  },

  // Filing status endpoints
  getStandardDeductions: async (taxYear = 2024) => {
    try {
      const response = await api.get(`/filing-status/standard-deductions?tax_year=${taxYear}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching standard deductions:', error);
      throw new Error('Failed to fetch standard deductions');
    }
  },

  getFilingStatusOptions: async () => {
    try {
      const response = await api.get('/filing-status/options');
      return response.data;
    } catch (error) {
      console.error('Error fetching filing status options:', error);
      throw new Error('Failed to fetch filing status options');
    }
  },

  // Tax return endpoints
  createTaxReturn: async (taxReturnData) => {
    try {
      const response = await api.post('/tax-returns', taxReturnData);
      return response.data;
    } catch (error) {
      console.error('Error creating tax return:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create tax return');
    }
  },

  getTaxReturns: async () => {
    try {
      const response = await api.get('/tax-returns');
      return response.data;
    } catch (error) {
      console.error('Error fetching tax returns:', error);
      throw new Error('Failed to fetch tax returns');
    }
  },

  getTaxReturn: async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tax return:', error);
      throw new Error('Failed to fetch tax return');
    }
  },

  updateTaxReturn: async (taxReturnId, taxReturnData) => {
    try {
      const response = await api.put(`/tax-returns/${taxReturnId}`, taxReturnData);
      return response.data;
    } catch (error) {
      console.error('Error updating tax return:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update tax return');
    }
  },

  updateFilingStatus: async (taxReturnId, filingStatusData) => {
    try {
      const response = await api.put(`/tax-returns/${taxReturnId}/filing-status`, filingStatusData);
      return response.data;
    } catch (error) {
      console.error('Error updating filing status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update filing status');
    }
  },

  // Document endpoints
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error(error.response?.data?.detail || 'Failed to upload document');
    }
  },

  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete document');
    }
  },

  // Payment endpoints
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create payment');
    }
  },

  // Export functionality
  exportTaxReturnJSON: async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}/export/json`);
      return response.data;
    } catch (error) {
      console.error('Error exporting tax return as JSON:', error);
      throw new Error(error.response?.data?.detail || 'Failed to export tax return as JSON');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

// Legacy exports for backward compatibility
export const login = (email, password) => apiService.login(email, password);
export const register = (userData) => apiService.register(userData);
export const getCurrentUser = () => apiService.getProfile();
export const uploadDocument = (file) => apiService.uploadDocument(file);
export const getDocuments = () => apiService.getDocuments();
export const deleteDocument = (id) => apiService.deleteDocument(id);
export const createTaxReturn = (data) => apiService.createTaxReturn(data);
export const getTaxReturns = () => apiService.getTaxReturns();
export const updateTaxReturn = (id, data) => apiService.updateTaxReturn(id, data);
export const createPayment = (data) => apiService.createPayment(data);

export default apiService;
export { api };
