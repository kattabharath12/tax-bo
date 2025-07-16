import React, { useState, useEffect, useCallback, useMemo } from 'react';

const API_BASE_URL = 'https://tax-box-production.up.railway.app';

// Icon components
const Upload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileText = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogOut = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Calculator = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CreditCard = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Refresh = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Cache Management System
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.ttl
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  invalidate(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  isStale(key) {
    const cached = this.cache.get(key);
    if (!cached) return true;
    
    const staleness = 2 * 60 * 1000; // 2 minutes for staleness
    return Date.now() - cached.timestamp > staleness;
  }
}

const cacheManager = new CacheManager();

// API call with caching
const apiCall = async (endpoint, options = {}) => {
  const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
  
  if (!options.method || options.method === 'GET') {
    const cached = cacheManager.get(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }
  }

  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      cacheManager.invalidate();
      window.location.reload();
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!options.method || options.method === 'GET') {
    cacheManager.set(cacheKey, data);
  }

  return data;
};

// Login Component
const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const formBody = new FormData();
        formBody.append('username', formData.email);
        formBody.append('password', formData.password);

        const response = await fetch(`${API_BASE_URL}/token`, {
          method: 'POST',
          body: formBody,
        });

        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        onLogin();
      } else {
        await apiCall('/register', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setIsLogin(true);
        setFormData({ email: '', password: '', full_name: '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <Calculator className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Join TaxBox.AI'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <span className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-600 font-semibold hover:underline transition-colors duration-200"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Document Upload Component
const DocumentUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      onUpload(result);
      
      cacheManager.invalidate('/api/documents');
      
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        dragActive 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {uploading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-blue-500 animate-bounce" />
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
          </div>
        </div>
      )}
      
      <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Upload Documents
      </h3>
      <p className="text-gray-600 mb-6">
        Drag and drop files here, or click to browse
      </p>
      
      <input
        type="file"
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        className="hidden"
        id="file-upload"
        disabled={uploading}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors duration-200 disabled:opacity-50"
      >
        <Upload className="h-5 w-5 mr-2" />
        Choose Files
      </label>
      
      <p className="text-xs text-gray-500 mt-4">
        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
      </p>
    </div>
  );
};

// Tax Return Form Component
const TaxReturnForm = ({ onSubmit, filingStatusOptions, standardDeductions }) => {
  const [formData, setFormData] = useState({
    tax_year: new Date().getFullYear() - 1,
    income: '',
    deductions: '',
    withholdings: '',
    filing_status_info: {
      filing_status: 'single',
      spouse_name: '',
      spouse_ssn: '',
      spouse_has_income: false,
      spouse_itemizes: false,
      qualifying_person_name: '',
      qualifying_person_relationship: '',
      lived_with_taxpayer: false
    }
  });

  const [useStandardDeduction, setUseStandardDeduction] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        income: parseFloat(formData.income),
        deductions: useStandardDeduction ? null : parseFloat(formData.deductions || 0),
        withholdings: parseFloat(formData.withholdings || 0),
      };
      
      await onSubmit(submitData);
      
      cacheManager.invalidate('/api/tax-returns');
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStandardDeduction = useMemo(() => {
    return standardDeductions?.[formData.filing_status_info.filing_status] || 0;
  }, [standardDeductions, formData.filing_status_info.filing_status]);

  const taxPreview = useMemo(() => {
    if (!formData.income) return null;
    
    const income = parseFloat(formData.income) || 0;
    const deductions = useStandardDeduction ? currentStandardDeduction : (parseFloat(formData.deductions) || 0);
    const taxableIncome = Math.max(0, income - deductions);
    
    let estimatedTax = 0;
    if (taxableIncome <= 11000) {
      estimatedTax = taxableIncome * 0.10;
    } else if (taxableIncome <= 44725) {
      estimatedTax = 1100 + (taxableIncome - 11000) * 0.12;
    } else {
      estimatedTax = 5147 + (taxableIncome - 44725) * 0.22;
    }
    
    const withholdings = parseFloat(formData.withholdings) || 0;
    const refund = Math.max(0, withholdings - estimatedTax);
    const owed = Math.max(0, estimatedTax - withholdings);
    
    return {
      taxableIncome,
      estimatedTax,
      refund,
      owed
    };
  }, [formData.income, formData.deductions, formData.withholdings, useStandardDeduction, currentStandardDeduction]);

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tax Year
            </label>
            <select
              value={formData.tax_year}
              onChange={(e) => setFormData({...formData, tax_year: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
              <option value={2021}>2021</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filing Status
            </label>
            <select
              value={formData.filing_status_info.filing_status}
              onChange={(e) => setFormData({
                ...formData,
                filing_status_info: {
                  ...formData.filing_status_info,
                  filing_status: e.target.value
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {filingStatusOptions?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.income}
                onChange={(e) => setFormData({...formData, income: e.target.value})}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tax Withholdings
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.withholdings}
                onChange={(e) => setFormData({...formData, withholdings: e.target.value})}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={useStandardDeduction}
              onChange={(e) => setUseStandardDeduction(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Use Standard Deduction ({currentStandardDeduction ? `$${currentStandardDeduction.toLocaleString()}` : 'Loading...'})
            </span>
          </label>
        </div>

        {!useStandardDeduction && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Itemized Deductions
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.deductions}
                onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {formData.filing_status_info.filing_status === 'married_jointly' && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Spouse Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spouse Name
                </label>
                <input
                  type="text"
                  value={formData.filing_status_info.spouse_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    filing_status_info: {
                      ...formData.filing_status_info,
                      spouse_name: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter spouse name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spouse SSN
                </label>
                <input
                  type="text"
                  value={formData.filing_status_info.spouse_ssn}
                  onChange={(e) => setFormData({
                    ...formData,
                    filing_status_info: {
                      ...formData.filing_status_info,
                      spouse_ssn: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="xxx-xx-xxxx"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
       >
         {isSubmitting ? (
           <div className="flex items-center justify-center">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
             Calculating Tax Return...
           </div>
         ) : (
           'Calculate Tax Return'
         )}
       </button>
     </form>

     {/* Tax Preview Card */}
     {taxPreview && (
       <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Calculation Preview</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="text-center">
             <p className="text-sm text-gray-600 mb-1">Taxable Income</p>
             <p className="text-xl font-bold text-gray-900">${taxPreview.taxableIncome.toLocaleString()}</p>
           </div>
           <div className="text-center">
             <p className="text-sm text-gray-600 mb-1">Estimated Tax</p>
             <p className="text-xl font-bold text-gray-900">${taxPreview.estimatedTax.toLocaleString()}</p>
           </div>
           <div className="text-center">
             <p className="text-sm text-gray-600 mb-1">Refund</p>
             <p className="text-xl font-bold text-green-600">${taxPreview.refund.toLocaleString()}</p>
           </div>
           <div className="text-center">
             <p className="text-sm text-gray-600 mb-1">Amount Owed</p>
             <p className="text-xl font-bold text-red-600">${taxPreview.owed.toLocaleString()}</p>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

// Main Dashboard Component
const Dashboard = () => {
 const [user, setUser] = useState(null);
 const [documents, setDocuments] = useState([]);
 const [taxReturns, setTaxReturns] = useState([]);
 const [filingStatusOptions, setFilingStatusOptions] = useState([]);
 const [standardDeductions, setStandardDeductions] = useState({});
 const [activeTab, setActiveTab] = useState('dashboard');
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);

 const loadUserData = useCallback(async (skipCache = false) => {
   try {
     const userData = await apiCall('/api/users/me', { skipCache });
     setUser(userData);
     
     const [docsData, taxReturnsData] = await Promise.all([
       apiCall('/api/documents', { skipCache }),
       apiCall('/api/tax-returns', { skipCache })
     ]);
     
     setDocuments(docsData);
     setTaxReturns(taxReturnsData);
   } catch (err) {
     console.error('Error loading user data:', err);
   } finally {
     setLoading(false);
     setRefreshing(false);
   }
 }, []);

 const loadFilingStatusOptions = useCallback(async () => {
   try {
     const data = await apiCall('/api/filing-status/options');
     setFilingStatusOptions(data.filing_statuses);
   } catch (err) {
     console.error('Error loading filing status options:', err);
   }
 }, []);

 const loadStandardDeductions = useCallback(async () => {
   try {
     const data = await apiCall('/api/filing-status/standard-deductions');
     setStandardDeductions(data.standard_deductions);
   } catch (err) {
     console.error('Error loading standard deductions:', err);
   }
 }, []);

 useEffect(() => {
   loadUserData();
   loadFilingStatusOptions();
   loadStandardDeductions();
 }, [loadUserData, loadFilingStatusOptions, loadStandardDeductions]);

 const handleRefresh = useCallback(() => {
   setRefreshing(true);
   loadUserData(true);
 }, [loadUserData]);

 const handleLogout = useCallback(() => {
   localStorage.removeItem('access_token');
   cacheManager.invalidate();
   window.location.reload();
 }, []);

 const handleDocumentUpload = useCallback((document) => {
   setDocuments(prev => [document, ...prev]);
 }, []);

 const handleDeleteDocument = useCallback(async (documentId) => {
   try {
     await apiCall(`/api/documents/${documentId}`, { method: 'DELETE' });
     setDocuments(prev => prev.filter(doc => doc.id !== documentId));
     cacheManager.invalidate('/api/documents');
   } catch (err) {
     console.error('Error deleting document:', err);
   }
 }, []);

 const handleTaxReturnSubmit = useCallback(async (taxReturnData) => {
   try {
     const newTaxReturn = await apiCall('/api/tax-returns', {
       method: 'POST',
       body: JSON.stringify(taxReturnData),
     });
     setTaxReturns(prev => [newTaxReturn, ...prev]);
     setActiveTab('returns');
     cacheManager.invalidate('/api/tax-returns');
   } catch (err) {
     console.error('Error creating tax return:', err);
   }
 }, []);

 const handlePayment = useCallback(async (taxReturnId, amount) => {
   try {
     await apiCall('/api/payments', {
       method: 'POST',
       body: JSON.stringify({
         tax_return_id: taxReturnId,
         amount: amount
       }),
     });
     const updatedTaxReturns = await apiCall('/api/tax-returns', { skipCache: true });
     setTaxReturns(updatedTaxReturns);
   } catch (err) {
     console.error('Error processing payment:', err);
   }
 }, []);

 const dashboardStats = useMemo(() => ({
   documents: documents.length,
   taxReturns: taxReturns.length,
   completedReturns: taxReturns.filter(r => r.status === 'completed').length,
   totalRefunds: taxReturns.reduce((sum, r) => sum + (r.refund_amount || 0), 0),
   totalOwed: taxReturns.reduce((sum, r) => sum + (r.amount_owed || 0), 0)
 }), [documents, taxReturns]);

 if (loading) {
   return (
     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
       <div className="text-center">
         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
         <p className="text-gray-600 text-lg">Loading your dashboard...</p>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-gray-50">
     {/* Header */}
     <header className="bg-white shadow-sm border-b">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center py-4">
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-3">
               <Calculator className="h-10 w-10 text-blue-500" />
               <div>
                 <h1 className="text-2xl font-bold text-gray-900">TaxBox.AI</h1>
                 <p className="text-sm text-gray-500">Smart Tax Management</p>
               </div>
             </div>
           </div>
           <div className="flex items-center space-x-4">
             <button
               onClick={handleRefresh}
               disabled={refreshing}
               className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
             >
               <Refresh className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
             </button>
             <div className="text-right">
               <p className="text-sm font-medium text-gray-900">Welcome back,</p>
               <p className="text-sm text-gray-500">{user?.full_name}</p>
             </div>
             <button
               onClick={handleLogout}
               className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
             >
               <LogOut className="h-4 w-4" />
               <span>Logout</span>
             </button>
           </div>
         </div>
       </div>
     </header>

     {/* Navigation */}
     <nav className="bg-white border-b">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex space-x-8">
           {[
             { id: 'dashboard', label: 'Dashboard', icon: User },
             { id: 'documents', label: 'Documents', icon: FileText },
             { id: 'new-return', label: 'New Return', icon: Plus },
             { id: 'returns', label: 'Tax Returns', icon: DollarSign }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                 activeTab === tab.id
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               <tab.icon className="h-4 w-4" />
               <span>{tab.label}</span>
             </button>
           ))}
         </div>
       </div>
     </nav>

     {/* Main Content */}
     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {activeTab === 'dashboard' && (
         <div className="space-y-8">
           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center">
                 <div className="p-3 bg-blue-100 rounded-lg">
                   <FileText className="h-8 w-8 text-blue-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Documents</p>
                   <p className="text-2xl font-bold text-gray-900">{dashboardStats.documents}</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center">
                 <div className="p-3 bg-green-100 rounded-lg">
                   <DollarSign className="h-8 w-8 text-green-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Tax Returns</p>
                   <p className="text-2xl font-bold text-gray-900">{dashboardStats.taxReturns}</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center">
                 <div className="p-3 bg-purple-100 rounded-lg">
                   <CheckCircle className="h-8 w-8 text-purple-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Completed</p>
                   <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedReturns}</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center">
                 <div className="p-3 bg-yellow-100 rounded-lg">
                   <CreditCard className="h-8 w-8 text-yellow-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                   <p className="text-2xl font-bold text-green-600">${dashboardStats.totalRefunds.toLocaleString()}</p>
                 </div>
               </div>
             </div>
           </div>

           {/* Recent Activity */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
             <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
             </div>
             <div className="p-6">
               {taxReturns.length === 0 && documents.length === 0 ? (
                 <div className="text-center py-8">
                   <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500">No recent activity. Start by uploading documents or creating a tax return.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {taxReturns.slice(0, 3).map(taxReturn => (
                     <div key={taxReturn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                       <div className="flex items-center space-x-3">
                         <DollarSign className="h-5 w-5 text-green-500" />
                         <div>
                           <p className="font-medium text-gray-900">{taxReturn.tax_year} Tax Return</p>
                           <p className="text-sm text-gray-500">Created {new Date(taxReturn.created_at).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                         taxReturn.status === 'completed' 
                           ? 'bg-green-100 text-green-800' 
                           : 'bg-yellow-100 text-yellow-800'
                       }`}>
                         {taxReturn.status}
                       </span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

       {activeTab === 'documents' && (
         <div className="space-y-8">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
             <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
             </div>
             <div className="p-6">
               <DocumentUpload onUpload={handleDocumentUpload} />
             </div>
           </div>
           
           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
             <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
             </div>
             <div className="divide-y divide-gray-200">
               {documents.map(doc => (
                 <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                   <div className="flex items-center space-x-4">
                     <div className="p-2 bg-blue-100 rounded-lg">
                       <FileText className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                       <p className="font-medium text-gray-900">{doc.filename}</p>
                       <p className="text-sm text-gray-500">
                         {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-3">
                     <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                       doc.processing_status === 'completed' 
                         ? 'bg-green-100 text-green-800' 
                         : 'bg-yellow-100 text-yellow-800'
                     }`}>
                       {doc.processing_status}
                     </span>
                     <button
                       onClick={() => handleDeleteDocument(doc.id)}
                       className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
               ))}
               {documents.length === 0 && (
                 <div className="p-12 text-center">
                   <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500">No documents uploaded yet</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

       {activeTab === 'new-return' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
           <div className="p-6 border-b border-gray-200">
             <h2 className="text-xl font-semibold text-gray-900">Create New Tax Return</h2>
           </div>
           <div className="p-6">
             <TaxReturnForm
               onSubmit={handleTaxReturnSubmit}
               filingStatusOptions={filingStatusOptions}
               standardDeductions={standardDeductions}
             />
           </div>
         </div>
       )}

       {activeTab === 'returns' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
           <div className="p-6 border-b border-gray-200">
             <h2 className="text-xl font-semibold text-gray-900">Tax Returns</h2>
           </div>
           <div className="divide-y divide-gray-200">
             {taxReturns.map(taxReturn => (
               <div key={taxReturn.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                       {taxReturn.tax_year} Tax Return
                     </h3>
                     <p className="text-sm text-gray-500">
                       Filing Status: {taxReturn.filing_status} • 
                       Created: {new Date(taxReturn.created_at).toLocaleDateString()}
                     </p>
                   </div>
                   <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                     taxReturn.status === 'completed' 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-yellow-100 text-yellow-800'
                   }`}>
                     {taxReturn.status}
                   </span>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-600 mb-1">Income</p>
                     <p className="text-xl font-bold text-gray-900">${taxReturn.income.toLocaleString()}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-600 mb-1">Deductions</p>
                     <p className="text-xl font-bold text-gray-900">${taxReturn.deductions.toLocaleString()}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-600 mb-1">Tax Owed</p>
                     <p className="text-xl font-bold text-gray-900">${taxReturn.tax_owed.toLocaleString()}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-600 mb-1">
                       {taxReturn.refund_amount > 0 ? 'Refund' : 'Amount Owed'}
                     </p>
                     <p className={`text-xl font-bold ${
                       taxReturn.refund_amount > 0 ? 'text-green-600' : 'text-red-600'
                     }`}>
                       ${(taxReturn.refund_amount || taxReturn.amount_owed).toLocaleString()}
                     </p>
                   </div>
                 </div>
                 
                 {taxReturn.amount_owed > 0 && (
                   <div className="flex justify-end">
                     <button
                       onClick={() => handlePayment(taxReturn.id, taxReturn.amount_owed)}
                       className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                     >
                       <CreditCard className="h-5 w-5" />
                       <span>Pay ${taxReturn.amount_owed.toLocaleString()}</span>
                     </button>
                   </div>
                 )}
               </div>
             ))}
             {taxReturns.length === 0 && (
               <div className="p-12 text-center">
                 <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                 <p className="text-gray-500">No tax returns created yet</p>
               </div>
             )}
           </div>
         </div>
       )}
     </main>
   </div>
 );
};

// Main App Component
const App = () => {
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const token = localStorage.getItem('access_token');
   if (token) {
     apiCall('/api/users/me')
       .then(() => setIsAuthenticated(true))
       .catch(() => {
         localStorage.removeItem('access_token');
         cacheManager.invalidate();
         setIsAuthenticated(false);
       })
       .finally(() => setLoading(false));
   } else {
     setLoading(false);
   }
 }, []);

 const handleLogin = () => {
   setIsAuthenticated(true);
 };

 if (loading) {
   return (
     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
       <div className="text-center">
         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
         <p className="text-gray-600 text-lg">Loading...</p>
       </div>
     </div>
   );
 }

 return (
   <div className="App">
     {isAuthenticated ? (
       <Dashboard />
     ) : (
       <Login onLogin={handleLogin} />
     )}
   </div>
 );
};

export default App;
