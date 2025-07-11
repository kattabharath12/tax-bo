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
    <div className="container">
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
