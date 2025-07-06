import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaxForm from './TaxForm';
import api from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const [taxReturns, setTaxReturns] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchTaxReturns();
    fetchDocuments();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      const response = await api.get('/tax-returns');
      setTaxReturns(response.data);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
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
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  const downloadTaxReturn = async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}/export/json`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
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

  const applySuggestionsToForm = (document) => {
    if (document.extracted_data) {
      const data = document.extracted_data;
      const income = data.wages || data.income || 0;
      const withholdings = data.federal_tax || 0;
      
      alert(`Ready to apply data!\nIncome: $${income.toLocaleString()}\nWithholdings: $${withholdings.toLocaleString()}`);
      setShowTaxForm(true);
    }
  };

  const viewDocumentDetails = async (documentId) => {
    try {
      const response = await api.get(`/debug/document/${documentId}`);
      const data = response.data;
      
      const details = `Document: ${data.filename}\nStatus: ${data.processing_status}\nType: ${data.document_type || 'Unknown'}\nExtracted Data: ${JSON.stringify(data.extracted_data, null, 2)}`;
      alert(details);
    } catch (error) {
      console.error('Error fetching document details:', error);
      alert('Failed to fetch document details');
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Welcome back, {user?.full_name}! 🎉
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: '0.9' }}>Your AI-powered tax assistant is ready!</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowTaxForm(false)} 
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🏠 Dashboard
              </button>
              <button 
                onClick={handleLogout} 
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                👋 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tax Form */}
        {showTaxForm && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <TaxForm onSuccess={handleTaxFormSuccess} />
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>📤 Upload Tax Documents</h2>
            <label style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '20px',
              padding: '15px 30px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-block'
            }}>
              🎯 Choose Your Document
              <input
                type="file"
                onChange={handleUploadDocument}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ marginTop: '1rem', color: '#666' }}>
              📋 Accepted: PDF, JPG, PNG, DOC, DOCX, TXT
            </p>
            <button 
              onClick={() => setShowUploadForm(false)} 
              style={{
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px solid #667eea',
                borderRadius: '15px',
                padding: '10px 20px',
                color: '#667eea',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {!showTaxForm && !showUploadForm && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div 
              style={{
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }}
              onClick={() => setShowTaxForm(true)}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>File New Return</h3>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Start your 2024 tax return</p>
            </div>
            
            <div 
              style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }}
              onClick={() => setShowUploadForm(true)}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Upload Documents</h3>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Upload W-2, 1099 forms</p>
            </div>
            
            <div 
              style={{
                background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }}
              onClick={() => setShowUploadForm(true)}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>AI Processing</h3>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Auto-extract tax data</p>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {!showTaxForm && !showUploadForm && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>📋 Your Documents</h2>
            
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#666' }}>No documents uploaded yet.</p>
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 30px',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Upload Your First Document
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>📄 {doc.filename}</h3>
                      <span 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: doc.processing_status === 'completed' ? '#4ade80' : 
                                     doc.processing_status === 'processing' ? '#fbbf24' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {doc.processing_status === 'completed' ? '✅ COMPLETED' : 
                         doc.processing_status === 'processing' ? '⏳ PROCESSING' : '❌ FAILED'}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1rem', color: '#666' }}>
                      <p><strong>Type:</strong> {doc.document_type ? doc.document_type.toUpperCase() : 'Unknown'}</p>
                      <p><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    
                    {doc.processing_status === 'completed' && doc.extracted_data && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>💎 Extracted Data:</h4>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.7)', 
                          padding: '1rem', 
                          borderRadius: '15px'
                        }}>
                          {Object.entries(doc.extracted_data).map(([key, value]) => (
                            <p key={key} style={{ margin: '0.25rem 0', color: '#333' }}>
                              <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {' '}
                              <span style={{ color: '#059669', fontWeight: 'bold' }}>
                                {typeof value === 'number' && (key.includes('tax') || key.includes('wage') || key.includes('income')) ? 
                                  `$${value.toLocaleString()}` : value}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {doc.processing_status === 'completed' && doc.extracted_data && (
                        <button 
                          onClick={() => applySuggestionsToForm(doc)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '10px 20px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          🎯 Apply to Tax Form
                        </button>
                      )}
                      <button 
                        onClick={() => viewDocumentDetails(doc.id)}
                        style={{
                          background: 'rgba(102, 126, 234, 0.1)',
                          border: '2px solid #667eea',
                          borderRadius: '15px',
                          padding: '10px 20px',
                          color: '#667eea',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tax Returns */}
        {!showTaxForm && !showUploadForm && taxReturns.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>💼 Your Tax Returns</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {taxReturns.map((taxReturn) => (
                <div key={taxReturn.id} style={{
                  background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
                }}>
                  <h3 style={{ fontSize: '1.3rem', color: '#333', marginBottom: '1rem' }}>📅 Tax Year: {taxReturn.tax_year}</h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p><strong>💰 Income:</strong> ${taxReturn.income.toLocaleString()}</p>
                    <p><strong>🏛️ Tax Owed:</strong> ${taxReturn.tax_owed.toFixed(2)}</p>
                  </div>
                  
                  <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '15px', background: 'rgba(255,255,255,0.7)' }}>
                    {taxReturn.refund_amount > 0 ? (
                      <p style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', margin: 0 }}>
                        🎉 Refund: ${taxReturn.refund_amount.toFixed(2)}
                      </p>
                    ) : (
                      <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', margin: 0 }}>
                        💳 Amount Owed: ${taxReturn.amount_owed.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => downloadTaxReturn(taxReturn.id)}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Download JSON
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
