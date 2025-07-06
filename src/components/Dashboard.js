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
      
      alert(`🎉 Ready to apply extracted data!\n\n💰 Income: $${income.toLocaleString()}\n🏛️ Withholdings: $${withholdings.toLocaleString()}\n\nClick "Start Filing" to use this data!`);
      setShowTaxForm(true);
    }
  };

  const viewDocumentDetails = async (documentId) => {
    try {
      const response = await api.get(`/debug/document/${documentId}`);
      const data = response.data;
      
      const details = `📄 Document Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 File: ${data.filename}
⚡ Status: ${data.processing_status}
🏷️ Type: ${data.document_type || 'Unknown'}
📅 Processed: ${data.processed_at ? new Date(data.processed_at).toLocaleDateString() : 'Not processed'}

💎 Extracted Data:
${data.extracted_data ? Object.entries(data.extracted_data)
  .map(([key, value]) => `  💰 ${key.replace(/_/g, ' ').toUpperCase()}: ${typeof value === 'number' ? '$' + value.toLocaleString() : value}`)
  .join('\n') : '  📭 No data extracted'}
`;
      
      alert(details);
    } catch (error) {
      console.error('Error fetching document details:', error);
      alert('❌ Failed to fetch document details');
    }
  };

  const modernCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: 'none',
    color: 'white',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    transition: 'all 0.3s ease'
  };

  const actionCardStyle = {
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    border: 'none',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  };

  const documentCardStyle = {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    borderRadius: '20px',
    padding: '1.5rem',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative'
  };

  const taxReturnCardStyle = {
    background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    borderRadius: '20px',
    padding: '1.5rem',
    border: 'none',
    boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={modernCardStyle}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Welcome back, {user?.full_name}! 🎉
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: '0.9' }}>Your AI-powered tax assistant is ready to work!</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowTaxForm(false)} 
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
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
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                👋 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tax Form */}
        {showTaxForm && (
          <div style={glassCardStyle}>
            <TaxForm onSuccess={handleTaxFormSuccess} />
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div style={glassCardStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📤 Upload Tax Documents
            </h2>
            <div style={{ textAlign: 'center' }}>
              <label style={{
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
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }}>
                🎯 Choose Your Document
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ marginTop: '1rem', fontSize: '1rem', color: '#666' }}>
                📋 Accepted: PDF, JPG, PNG, DOC, DOCX, TXT
              </p>
              <p style={{ fontSize: '1rem', color: '#667eea', fontWeight: 'bold' }}>
                🤖 AI will automatically extract your tax data!
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
                  marginTop: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!showTaxForm && !showUploadForm && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div 
              style={{...actionCardStyle, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'}}
              onClick={() => setShowTaxForm(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>File New Return</h3>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Start your 2024 tax return with AI assistance</p>
              <div style={{
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '8px 16px',
                display: 'inline-block',
                color: '#333',
                fontWeight: 'bold'
              }}>
                🚀 Start Filing
              </div>
            </div>
            
            <div 
              style={{...actionCardStyle, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}
              onClick={() => setShowUploadForm(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Upload Documents</h3>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Upload W-2, 1099, and other forms</p>
              <div style={{
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '8px 16px',
                display: 'inline-block',
                color: '#333',
                fontWeight: 'bold'
              }}>
                📤 Upload Files
              </div>
            </div>
            
            <div 
              style={{...actionCardStyle, background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'}}
              onClick={() => setShowUploadForm(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>AI Processing</h3>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>Let AI extract your tax data automatically</p>
              <div style={{
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '8px 16px',
                display: 'inline-block',
                color: '#333',
                fontWeight: 'bold'
              }}>
                ✨ Process Now
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {!showTaxForm && !showUploadForm && (
          <div style={glassCardStyle}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📋 Your Smart Documents
            </h2>
            
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
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🚀 Upload Your First Document
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={documentCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>📄 {doc.filename}</h3>
                      <span 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: doc.processing_status === 'completed' ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 
                                     doc.processing_status === 'processing' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 
                                     'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                      >
                        {doc.processing_status === 'completed' ? '✅ COMPLETED' : 
                         doc.processing_status === 'processing' ? '⏳ PROCESSING' : '❌ FAILED'}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1rem', color: '#666' }}>
                      <p><strong>🏷️ Type:</strong> {doc.document_type ? doc.document_type.toUpperCase() : 'Unknown'}</p>
                      <p><strong>📅 Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      {doc.processed_at && (
                        <p><strong>⚡ Processed:</strong> {new Date(doc.processed_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    {/* Show extracted data if available */}
                    {doc.processing_status === 'completed' && doc.extracted_data && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>💎 Extracted Data:</h4>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.7)', 
                          padding: '1rem', 
                          borderRadius: '15px',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }}>
                          {Object.entries(doc.extracted_data).map(([key, value]) => (
                            <p key={key} style={{ margin: '0.25rem 0', color: '#333' }}>
                              <strong>💰 {key.replace(/_/g, ' ').toUpperCase()}:</strong> {' '}
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
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
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
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.1)'}
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

        {/* Tax Returns History */}
        {!showTaxForm && !showUploadForm && (
          <div style={glassCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                💼 Your Tax Returns
              </h2>
              <button 
                onClick={() => setShowTaxForm(true)} 
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ➕ File New Return
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading your tax returns...</p>
              </div>
            ) : taxReturns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#666' }}>No tax returns found. Start your first return!</p>
                <button 
                  onClick={() => setShowTaxForm(true)} 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 30px',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🚀 File Your First Return
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {taxReturns.map((taxReturn) => (
                  <div key={taxReturn.id} style={taxReturnCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#333', fontWeight: 'bold' }}>📅 Tax Year: {taxReturn.tax_year}</h3>
                      <span 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: taxReturn.status === 'draft' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                      >
                        {taxReturn.status === 'draft' ? '📝 DRAFT' : '✅ COMPLETED'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ color: '#333' }}>
                        <p><strong>💰 Income:</strong> ${taxReturn.income.toLocaleString()}</p>
                        <p><strong>📋 Deductions:</strong> ${taxReturn.deductions.toLocaleString()}</p>
                      </div>
                      <div style={{ color: '#333' }}>
                        <p><strong>🏛️ Tax Owed:</strong> ${taxReturn.tax_owed.toFixed(2)}</p>
                        <p><strong>💸 Withholdings:</strong> ${taxReturn.withholdings.toFixed(2)}</p>
                      </div>
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
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button 
                        style={{
                          background: 'rgba(102, 126, 234, 0.1)',
                          border: '2px solid #667eea',
                          borderRadius: '15px',
                          padding: '8px 16px',
                          color: '#667eea',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        👁️ View Details
                      </button>
                      {taxReturn.status === 'draft' && (
                        <button 
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.9
                              fontSize: '0.9rem',
                           fontWeight: 'bold',
                           cursor: 'pointer',
                           boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                           transition: 'all 0.3s ease'
                         }}
                       >
                         ✏️ Continue Filing
                       </button>
                     )}
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
                         cursor: 'pointer',
                         boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                         transition: 'all 0.3s ease'
                       }}
                       onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                       onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                     >
                       📥 Download JSON
                     </button>
                   </div>
                   
                   <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem', textAlign: 'center' }}>
                     ⏰ Created: {new Date(taxReturn.created_at).toLocaleDateString()}
                   </p>
                 </div>
               ))}
             </div>
           )}
         </div>
       )}

       {/* Summary Stats */}
       {!showTaxForm && !showUploadForm && taxReturns.length > 0 && (
         <div style={glassCardStyle}>
           <h2 style={{ 
             fontSize: '2rem', 
             marginBottom: '1.5rem', 
             textAlign: 'center',
             background: 'linear-gradient(45deg, #667eea, #764ba2)', 
             WebkitBackgroundClip: 'text', 
             WebkitTextFillColor: 'transparent' 
           }}>
             📊 Your Tax Analytics
           </h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
             <div style={{ 
               textAlign: 'center', 
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               borderRadius: '20px',
               padding: '2rem',
               color: 'white',
               boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
             }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
               <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Total Returns</h3>
               <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{taxReturns.length}</p>
             </div>
             
             <div style={{ 
               textAlign: 'center', 
               background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
               borderRadius: '20px',
               padding: '2rem',
               color: 'white',
               boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
             }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
               <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Total Refunds</h3>
               <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                 ${taxReturns.reduce((sum, tr) => sum + tr.refund_amount, 0).toFixed(2)}
               </p>
             </div>
             
             <div style={{ 
               textAlign: 'center', 
               background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
               borderRadius: '20px',
               padding: '2rem',
               color: 'white',
               boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
             }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
               <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Total Income</h3>
               <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                 ${taxReturns.reduce((sum, tr) => sum + tr.income, 0).toLocaleString()}
               </p>
             </div>
           </div>
         </div>
       )}

       {/* Footer */}
       <div style={{ 
         textAlign: 'center', 
         marginTop: '3rem', 
         padding: '2rem',
         background: 'rgba(255,255,255,0.1)',
         borderRadius: '20px',
         backdropFilter: 'blur(10px)'
       }}>
         <p style={{ color: 'white', fontSize: '1.1rem', margin: 0 }}>
           🚀 Powered by TaxBox.AI - Your Smart Tax Assistant 
         </p>
         <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
           Making tax filing intelligent, simple, and secure ✨
         </p>
       </div>
     </div>
   </div>
 );
}

export default Dashboard;
