import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaxForm from './TaxForm';
import { apiService } from '../services/api';  // ← Fixed import

function Dashboard() {
  const { user, logout } = useAuth();
  const [taxReturns, setTaxReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchTaxReturns();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      const response = await apiService.getTaxReturns();  // ← Fixed API call
      setTaxReturns(response);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleTaxFormSuccess = (newTaxReturn) => {
    setShowTaxForm(false);
    fetchTaxReturns();
    alert('Tax return filed successfully!');
  };

  const handleUploadDocument = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiService.uploadDocument(formData);  // ← Fixed API call
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  const downloadTaxReturn = async (taxReturnId) => {
    try {
      // Use direct fetch for file downloads since apiService doesn't handle blobs
      const token = localStorage.getItem('token');
      const response = await fetch(`https://tax-box-production.up.railway.app/tax-returns/${taxReturnId}/export/json`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax_return_${taxReturnId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Tax return downloaded successfully!');
    } catch (error) {
      console.error('Error downloading tax return:', error);
      alert('Failed to download tax return');
    }
  };

  // Navigation functions for new tax return pages
  const navigateToTaxReturns = () => {
    window.location.href = '/tax-returns';
  };

  const navigateToCreateTaxReturn = () => {
    window.location.href = '/tax-returns/create';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name}! 👋</h1>
              <p className="text-gray-600 mt-1">Ready to manage your taxes with advanced filing status support?</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => setShowTaxForm(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Dashboard
              </button>
              <button 
                onClick={navigateToTaxReturns} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Tax Returns
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tax Form */}
        {showTaxForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <TaxForm onSuccess={handleTaxFormSuccess} />
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Tax Documents</h2>
            <div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose File
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
            <button 
              onClick={() => setShowUploadForm(false)} 
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Quick Actions - Only show if not in tax form or upload mode */}
        {!showTaxForm && !showUploadForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">File New Return</h3>
              <p className="text-gray-600 mb-4">Start your tax return for 2024 with filing status support</p>
              <button 
                onClick={navigateToCreateTaxReturn} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Start Filing
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-gray-600 mb-4">Upload W-2, 1099, and other forms with OCR processing</p>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Upload Files
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Returns</h3>
              <p className="text-gray-600 mb-4">See all your tax returns with filing status details</p>
              <button 
                onClick={navigateToTaxReturns} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                View Returns
              </button>
            </div>
          </div>
        )}

        {/* Tax Returns History - Only show if not in forms */}
        {!showTaxForm && !showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Tax Returns</h2>
              <div className="flex gap-3">
                <button 
                  onClick={navigateToCreateTaxReturn} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  File New Return
                </button>
                <button 
                  onClick={navigateToTaxReturns} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  View All
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading tax returns...</p>
              </div>
            ) : taxReturns.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tax returns found</h3>
                <p className="text-gray-600 mb-4">Start your first return with our advanced filing status support!</p>
                <button 
                  onClick={navigateToCreateTaxReturn} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  File Your First Return
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {taxReturns.slice(0, 4).map((taxReturn) => (
                  <div key={taxReturn.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Tax Year: {taxReturn.tax_year}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        taxReturn.status === 'draft' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {taxReturn.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Display Filing Status */}
                    <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">
                        Filing Status: {taxReturn.filing_status ? 
                          taxReturn.filing_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          'Not specified'
                        }
                      </p>
                      {taxReturn.spouse_name && (
                        <p className="text-sm text-blue-700">Spouse: {taxReturn.spouse_name}</p>
                      )}
                      {taxReturn.qualifying_person_name && (
                        <p className="text-sm text-blue-700">Qualifying Person: {taxReturn.qualifying_person_name}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Income</p>
                        <p className="font-semibold">${taxReturn.income?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Deductions</p>
                        <p className="font-semibold">${taxReturn.deductions?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tax Owed</p>
                        <p className="font-semibold">${taxReturn.tax_owed?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Withholdings</p>
                        <p className="font-semibold">${taxReturn.withholdings?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 p-3 rounded-lg border-2 border-dashed">
                      {(taxReturn.refund_amount || 0) > 0 ? (
                        <p className="text-green-700 font-bold text-center">
                          💰 Refund: ${taxReturn.refund_amount?.toFixed(2) || '0.00'}
                        </p>
                      ) : (
                        <p className="text-red-700 font-bold text-center">
                          💸 Amount Owed: ${taxReturn.amount_owed?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => window.location.href = `/tax-returns/view/${taxReturn.id}`}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition duration-200"
                      >
                        View Details
                      </button>
                      {taxReturn.status === 'draft' && (
                        <button 
                          onClick={() => window.location.href = `/tax-returns/edit/${taxReturn.id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200"
                        >
                          Continue
                        </button>
                      )}
                      <button 
                        onClick={() => downloadTaxReturn(taxReturn.id)}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition duration-200"
                      >
                        📥
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      Created: {new Date(taxReturn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!showTaxForm && !showUploadForm && taxReturns.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tax Summary</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Returns</h3>
                <p className="text-3xl font-bold text-blue-600">{taxReturns.length}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Total Refunds</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
                <p className="text-3xl font-bold text-gray-600">
                  ${taxReturns.reduce((sum, tr) => sum + (tr.income || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">Avg. Refund</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${taxReturns.length > 0 ? 
                    (taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0) / taxReturns.length).toFixed(2) : 
                    '0.00'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 className="text-2xl">Welcome, {user?.full_name}! 👋</h1>
            <p>Ready to file your taxes?</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowTaxForm(false)} 
              className="btn btn-secondary"
            >
              Dashboard
            </button>
            <button 
              onClick={navigateToTaxReturns} 
              className="btn btn-primary"
            >
              Tax Returns
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tax Form */}
      {showTaxForm && (
        <TaxForm onSuccess={handleTaxFormSuccess} />
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card">
          <h2 className="text-2xl mb-4">Upload Tax Documents</h2>
          <div>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Choose File
              <input
                type="file"
                onChange={handleUploadDocument}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Accepted formats: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>
          <button 
            onClick={() => setShowUploadForm(false)} 
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Quick Actions - Only show if not in tax form or upload mode */}
      {!showTaxForm && !showUploadForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <h3 className="text-lg mb-4">📝 File New Return</h3>
            <p className="mb-4">Start your tax return for 2024 with filing status support</p>
            <button 
              onClick={navigateToCreateTaxReturn} 
              className="btn btn-primary"
            >
              Start Filing
            </button>
          </div>
          
          <div className="card text-center">
            <h3 className="text-lg mb-4">📄 Upload Documents</h3>
            <p className="mb-4">Upload W-2, 1099, and other forms</p>
            <button 
              onClick={() => setShowUploadForm(true)} 
              className="btn btn-secondary"
            >
              Upload Files
            </button>
          </div>
          
          <div className="card text-center">
            <h3 className="text-lg mb-4">💰 View All Returns</h3>
            <p className="mb-4">See all your tax returns with filing status details</p>
            <button 
              onClick={navigateToTaxReturns} 
              className="btn btn-primary"
            >
              View Returns
            </button>
          </div>
        </div>
      )}

      {/* Tax Returns History - Only show if not in forms */}
      {!showTaxForm && !showUploadForm && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="text-2xl">Recent Tax Returns</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={navigateToCreateTaxReturn} 
                className="btn btn-primary"
              >
                File New Return
              </button>
              <button 
                onClick={navigateToTaxReturns} 
                className="btn btn-secondary"
              >
                View All
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center">
              <p>Loading tax returns...</p>
            </div>
          ) : taxReturns.length === 0 ? (
            <div className="text-center">
              <p style={{ marginBottom: '2rem' }}>No tax returns found. Start your first return!</p>
              <button 
                onClick={navigateToCreateTaxReturn} 
                className="btn btn-primary"
              >
                File Your First Return
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taxReturns.slice(0, 4).map((taxReturn) => (
                <div key={taxReturn.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="text-lg">Tax Year: {taxReturn.tax_year}</h3>
                    <span 
                      style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        backgroundColor: taxReturn.status === 'draft' ? '#fef3c7' : '#d1fae5',
                        color: taxReturn.status === 'draft' ? '#92400e' : '#065f46'
                      }}
                    >
                      {taxReturn.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Display Filing Status */}
                  <div style={{ marginBottom: '1rem' }}>
                    <p><strong>Filing Status:</strong> {taxReturn.filing_status ? 
                      taxReturn.filing_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                      'Not specified'
                    }</p>
                    {taxReturn.spouse_name && (
                      <p><strong>Spouse:</strong> {taxReturn.spouse_name}</p>
                    )}
                    {taxReturn.qualifying_person_name && (
                      <p><strong>Qualifying Person:</strong> {taxReturn.qualifying_person_name}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                    <div>
                      <p><strong>Income:</strong> ${taxReturn.income?.toLocaleString() || '0'}</p>
                      <p><strong>Deductions:</strong> ${taxReturn.deductions?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p><strong>Tax Owed:</strong> ${taxReturn.tax_owed?.toFixed(2) || '0.00'}</p>
                      <p><strong>Withholdings:</strong> ${taxReturn.withholdings?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    {(taxReturn.refund_amount || 0) > 0 ? (
                      <p style={{ color: 'green', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        💰 Refund: ${taxReturn.refund_amount?.toFixed(2) || '0.00'}
                      </p>
                    ) : (
                      <p style={{ color: 'red', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        💸 Amount Owed: ${taxReturn.amount_owed?.toFixed(2) || '0.00'}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => window.location.href = `/tax-returns/view/${taxReturn.id}`}
                      className="btn btn-secondary"
                    >
                      View Details
                    </button>
                    {taxReturn.status === 'draft' && (
                      <button 
                        onClick={() => window.location.href = `/tax-returns/edit/${taxReturn.id}`}
                        className="btn btn-primary"
                      >
                        Continue Filing
                      </button>
                    )}
                    <button 
                      onClick={() => downloadTaxReturn(taxReturn.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      📥 Download
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                    Created: {new Date(taxReturn.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!showTaxForm && !showUploadForm && taxReturns.length > 0 && (
        <div className="card">
          <h2 className="text-2xl mb-4">Tax Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-lg">Total Returns</h3>
              <p className="text-2xl" style={{ color: '#3b82f6' }}>{taxReturns.length}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg">Total Refunds</h3>
              <p className="text-2xl" style={{ color: 'green' }}>
                ${taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg">Total Income</h3>
              <p className="text-2xl" style={{ color: '#374151' }}>
                ${taxReturns.reduce((sum, tr) => sum + (tr.income || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg">Avg. Refund</h3>
              <p className="text-2xl" style={{ color: '#10b981' }}>
                ${taxReturns.length > 0 ? 
                  (taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0) / taxReturns.length).toFixed(2) : 
                  '0.00'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
