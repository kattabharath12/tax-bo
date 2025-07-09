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

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
            Loading your dashboard...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

// Add this button somewhere in your Dashboard component
<button 
  onClick={() => {
    window.history.pushState(null, '', '/filing-status');
    window.location.reload();
  }}
  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
>
  New Filing Status
</button>

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
    <>
      <style>{`
        .dashboard-button:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .document-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        .download-button:hover {
          background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
          transform: translateY(-2px);
        }
        .apply-button:hover {
          background: linear-gradient(135deg, #059669, #047857) !important;
          transform: translateY(-2px);
        }
        .view-button:hover {
          background: rgba(102, 126, 234, 0.2) !important;
          color: #4338ca !important;
        }
        .upload-button:hover {
          background: linear-gradient(135deg, #4338ca, #3730a3) !important;
          transform: translateY(-2px);
        }
      `}</style>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: '#ffffff'
                }}>
                  Welcome back, {user?.full_name}! 🎉
                </h1>
                <p style={{ 
                  fontSize: '1.2rem', 
                  opacity: '0.95',
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  Your AI-powered tax assistant is ready to work!
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setShowTaxForm(false)} 
                  className="dashboard-button"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  🏠 Dashboard
                </button>
                <button 
                  onClick={handleLogout} 
                  className="dashboard-button"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)'
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
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <TaxForm onSuccess={handleTaxFormSuccess} />
            </div>
          )}

          {/* Upload Form */}
          {showUploadForm && (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '1.5rem',
                color: '#1e293b',
                fontWeight: 'bold'
              }}>
                📤 Upload Tax Documents
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                marginBottom: '2rem'
              }}>
                🤖 AI will automatically extract your tax data!
              </p>
              <label 
                className="upload-button"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '15px 30px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                🎯 Choose Your Document
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ 
                marginTop: '1rem', 
                color: '#64748b',
                fontSize: '0.9rem'
              }}>
                📋 Accepted: PDF, JPG, PNG, DOC, DOCX, TXT
              </p>
              <button 
                onClick={() => setShowUploadForm(false)} 
                style={{
                  background: 'white',
                  border: '2px solid #ef4444',
                  borderRadius: '15px',
                  padding: '10px 20px',
                  color: '#ef4444',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
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
                className="action-card"
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #fbbf24',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setShowTaxForm(true)}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b', fontWeight: 'bold' }}>File New Return</h3>
                <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '1rem' }}>Start your 2024 tax return with AI assistance</p>
              </div>
              
              <div 
                className="action-card"
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #10b981',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setShowUploadForm(true)}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b', fontWeight: 'bold' }}>Upload Documents</h3>
                <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '1rem' }}>Upload W-2, 1099 forms for processing</p>
              </div>
              
              <div 
                className="action-card"
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #8b5cf6',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setShowUploadForm(true)}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b', fontWeight: 'bold' }}>AI Processing</h3>
                <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '1rem' }}>Auto-extract tax data with 99% accuracy</p>
              </div>
            </div>
          )}

          {/* Documents Section */}
          {!showTaxForm && !showUploadForm && (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '1.5rem',
                color: '#1e293b',
                fontWeight: 'bold'
              }}>
                📋 Your Documents
              </h2>
              
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                  <p style={{ 
                    marginBottom: '2rem', 
                    fontSize: '1.2rem', 
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    No documents uploaded yet.
                  </p>
                  <button 
                    onClick={() => setShowUploadForm(true)} 
                    className="upload-button"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '15px 30px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    🚀 Upload Your First Document
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {documents.map((doc) => (
                    <div key={doc.id} 
                      className="document-card"
                      style={{
                        background: '#f8fafc',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ 
                          fontSize: '1.2rem', 
                          color: '#1e293b', 
                          fontWeight: 'bold',
                          margin: 0
                        }}>
                          📄 {doc.filename}
                        </h3>
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
                      
                      <div style={{ marginBottom: '1rem', color: '#64748b' }}>
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong style={{ color: '#374151' }}>Type:</strong> {doc.document_type ? doc.document_type.toUpperCase() : 'Unknown'}
                        </p>
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong style={{ color: '#374151' }}>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {doc.processing_status === 'completed' && doc.extracted_data && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ 
                            fontSize: '1rem', 
                            marginBottom: '0.5rem', 
                            color: '#1e293b', 
                            fontWeight: 'bold' 
                          }}>
                            💎 Extracted Data:
                          </h4>
                          <div style={{ 
                            background: 'white', 
                            padding: '1rem', 
                            borderRadius: '15px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {Object.entries(doc.extracted_data).map(([key, value]) => (
                              <p key={key} style={{ margin: '0.25rem 0', color: '#374151' }}>
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
                            className="apply-button"
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              borderRadius: '15px',
                              padding: '10px 20px',
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            🎯 Apply to Tax Form
                          </button>
                        )}
                        <button 
                          onClick={() => viewDocumentDetails(doc.id)}
                          className="view-button"
                          style={{
                            background: 'white',
                            border: '2px solid #667eea',
                            borderRadius: '15px',
                            padding: '10px 20px',
                            color: '#667eea',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
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
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                marginBottom: '1.5rem',
                color: '#1e293b',
                fontWeight: 'bold'
              }}>
                💼 Your Tax Returns
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {taxReturns.map((taxReturn) => (
                  <div key={taxReturn.id} style={{
                    background: '#f8fafc',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.3rem', 
                      color: '#1e293b', 
                      marginBottom: '1rem',
                      fontWeight: 'bold'
                    }}>
                      📅 Tax Year: {taxReturn.tax_year}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem', color: '#374151' }}>
                      <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                        <strong>💰 Income:</strong> ${taxReturn.income.toLocaleString()}
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                        <strong>🏛️ Tax Owed:</strong> ${taxReturn.tax_owed.toFixed(2)}
                      </p>
                    </div>
                    
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      borderRadius: '15px', 
                      background: 'white',
                      border: '1px solid #e2e8f0'
                    }}>
                      {taxReturn.refund_amount > 0 ? (
                        <p style={{ 
                          color: '#059669', 
                          fontWeight: 'bold', 
                          fontSize: '1.2rem', 
                          textAlign: 'center', 
                          margin: 0 
                        }}>
                          🎉 Refund: ${taxReturn.refund_amount.toFixed(2)}
                        </p>
                      ) : (
                        <p style={{ 
                          color: '#dc2626', 
                          fontWeight: 'bold', 
                          fontSize: '1.2rem', 
                          textAlign: 'center', 
                          margin: 0 
                        }}>
                          💳 Amount Owed: ${taxReturn.amount_owed.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => downloadTaxReturn(taxReturn.id)}
                      className="download-button"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none',
                        borderRadius: '15px',
                        padding: '8px 16px',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📥 Download JSON
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#64748b',
            fontSize: '0.9rem'
          }}>
            <p style={{ margin: 0 }}>
              🚀 Powered by <strong style={{ color: '#667eea' }}>TaxBox.AI</strong> - Your Smart Tax Assistant
            </p>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Making tax filing intelligent, simple, and secure ✨
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
