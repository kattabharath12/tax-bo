import React, { useState, useEffect } from 'react';

// CSS-based icon components
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

const Eye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const API_BASE_URL = 'https://tax-box-production.up.railway.app';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
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
      window.location.reload();
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to TaxBox.AI' : 'Register for TaxBox.AI'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Document Upload Component
const DocumentUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      onUpload(result);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600 mb-4">
        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
      </p>
      <input
        type="file"
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        className="hidden"
        id="file-upload"
        disabled={uploading}
      />
      <label
        htmlFor="file-upload"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </label>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      income: parseFloat(formData.income),
      deductions: useStandardDeduction ? null : parseFloat(formData.deductions || 0),
      withholdings: parseFloat(formData.withholdings || 0),
    };
    onSubmit(submitData);
  };

  const currentStandardDeduction = standardDeductions?.[formData.filing_status_info.filing_status] || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Year
          </label>
          <input
            type="number"
            value={formData.tax_year}
            onChange={(e) => setFormData({...formData, tax_year: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="2020"
            max="2024"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filingStatusOptions?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Income
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.income}
            onChange={(e) => setFormData({...formData, income: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Withholdings
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.withholdings}
            onChange={(e) => setFormData({...formData, withholdings: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useStandardDeduction}
            onChange={(e) => setUseStandardDeduction(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Use Standard Deduction (${currentStandardDeduction.toLocaleString()})
          </span>
        </label>
      </div>

      {!useStandardDeduction && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Itemized Deductions
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.deductions}
            onChange={(e) => setFormData({...formData, deductions: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Spouse Information for Married Filing Jointly */}
      {formData.filing_status_info.filing_status === 'married_jointly' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spouse Information</h3>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="xxx-xx-xxxx"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Calculate Tax Return
      </button>
    </form>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [taxReturns, setTaxReturns] = useState([]);
  const [filingStatusOptions, setFilingStatusOptions] = useState([]);
  const [standardDeductions, setStandardDeductions] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadFilingStatusOptions();
    loadStandardDeductions();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await apiCall('/api/users/me');
      setUser(userData);
      
      const [docsData, taxReturnsData] = await Promise.all([
        apiCall('/api/documents'),
        apiCall('/api/tax-returns')
      ]);
      
      setDocuments(docsData);
      setTaxReturns(taxReturnsData);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilingStatusOptions = async () => {
    try {
      const data = await apiCall('/api/filing-status/options');
      setFilingStatusOptions(data.filing_statuses);
    } catch (err) {
      console.error('Error loading filing status options:', err);
    }
  };

  const loadStandardDeductions = async () => {
    try {
      const data = await apiCall('/api/filing-status/standard-deductions');
      setStandardDeductions(data.standard_deductions);
    } catch (err) {
      console.error('Error loading standard deductions:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.reload();
  };

  const handleDocumentUpload = (document) => {
    setDocuments([...documents, document]);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await apiCall(`/api/documents/${documentId}`, { method: 'DELETE' });
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleTaxReturnSubmit = async (taxReturnData) => {
    try {
      const newTaxReturn = await apiCall('/api/tax-returns', {
        method: 'POST',
        body: JSON.stringify(taxReturnData),
      });
      setTaxReturns([...taxReturns, newTaxReturn]);
      setActiveTab('returns');
    } catch (err) {
      console.error('Error creating tax return:', err);
    }
  };

  const handlePayment = async (taxReturnId, amount) => {
    try {
      await apiCall('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          tax_return_id: taxReturnId,
          amount: amount
        }),
      });
      // Refresh tax returns to update payment status
      const updatedTaxReturns = await apiCall('/api/tax-returns');
      setTaxReturns(updatedTaxReturns);
    } catch (err) {
      console.error('Error processing payment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Calculator className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">TaxBox.AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
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
              { id: 'new-return', label: 'New Tax Return', icon: Plus },
              { id: 'returns', label: 'Tax Returns', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="h-12 w-12 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-12 w-12 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tax Returns</p>
                  <p className="text-2xl font-bold text-gray-900">{taxReturns.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-12 w-12 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Returns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {taxReturns.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h2>
              <DocumentUpload onUpload={handleDocumentUpload} />
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {documents.map(doc => (
                  <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.processing_status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.processing_status}
                      </span>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No documents uploaded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'new-return' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Create New Tax Return</h2>
            <TaxReturnForm
              onSubmit={handleTaxReturnSubmit}
              filingStatusOptions={filingStatusOptions}
              standardDeductions={standardDeductions}
            />
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tax Returns</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {taxReturns.map(taxReturn => (
                <div key={taxReturn.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {taxReturn.tax_year} Tax Return
                      </h3>
                      <p className="text-sm text-gray-500">
                        Filing Status: {taxReturn.filing_status} • 
                        Created: {new Date(taxReturn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      taxReturn.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {taxReturn.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Income</p>
                      <p className="font-medium">${taxReturn.income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deductions</p>
                      <p className="font-medium">${taxReturn.deductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tax Owed</p>
                      <p className="font-medium">${taxReturn.tax_owed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        {taxReturn.refund_amount > 0 ? 'Refund' : 'Amount Owed'}
                      </p>
                      <p className={`font-medium ${
                        taxReturn.refund_amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${(taxReturn.refund_amount || taxReturn.amount_owed).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {taxReturn.amount_owed > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => handlePayment(taxReturn.id, taxReturn.amount_owed)}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Pay ${taxReturn.amount_owed.toLocaleString()}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {taxReturns.length === 0 && (
                <div className="px-6 py-4 text-center text-gray-500">
                  No tax returns created yet
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
      // Verify token is still valid
      apiCall('/api/users/me')
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem('access_token');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
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
