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
      // Refresh documents after upload
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
      
      alert(`Ready to apply data:\nIncome: $${income.toLocaleString()}\nWithholdings: $${withholdings.toLocaleString()}\n\nClick "Start Filing" to use this data!`);
      
      // You can enhance this to actually pre-fill the tax form
      setShowTaxForm(true);
    }
  };

  const viewDocumentDetails = async (documentId) => {
    try {
      const response = await api.get(`/debug/document/${documentId}`);
      const data = response.data;
      
      const details = `Document Details:
━━━━━━━━━━━━━━━━━━
📄 File: ${data.filename}
📊 Status: ${data.processing_status}
🏷️ Type: ${data.document_type || 'Unknown'}
📅 Processed: ${data.processed_at ? new Date(data.processed_at).toLocaleDateString() : 'Not processed'}

💰 Extracted Data:
${data.extracted_data ? Object.entries(data.extracted_data)
  .map(([key, value]) => `• ${key.replace(/_/g, ' ').toUpperCase()}: ${typeof value === 'number' ? '$' + value.toLocaleString() : value}`)
  .join('\n') : 'No data extracted'}
`;
      
      alert(details);
    } catch (error) {
      console.error('Error fetching document details:', error);
      alert('Failed to fetch document details');
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 className="text-2xl">Welcome, {user?.full_name}! 👋</h1>
            <p>Ready to file your taxes with AI document processing?</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowTaxForm(false)} 
              className="btn btn-secondary"
            >
              Dashboard
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
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Accepted formats: PDF, JPG, PNG, DOC, DOCX, TXT
            </p>
            <p style={{ fontSize: '0.9rem', color: '#3b82f6' }}>
              🤖 We'll automatically extract tax information from your documents!
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

      {/* Quick Actions */}
      {!showTaxForm && !showUploadForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <h3 className="text-lg mb-4">📝 File New Return</h3>
            <p className="mb-4">Start your tax return for 2024</p>
            <button 
              onClick={() => setShowTaxForm(true)} 
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
            <h3 className="text-lg mb-4">🤖 AI Processing</h3>
            <p className="mb-4">Let AI extract your tax data</p>
            <button 
              onClick={() => setShowUploadForm(true)} 
              className="btn btn-primary"
            >
              Upload & Process
            </button>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {!showTaxForm && !showUploadForm && (
        <div className="card">
          <h2 className="text-2xl mb-4">Your Documents</h2>
          
          {documents.length === 0 ? (
            <div className="text-center">
              <p style={{ marginBottom: '2rem' }}>No documents uploaded yet.</p>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="btn btn-primary"
              >
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="text-lg">{doc.filename}</h3>
                    <span 
                      style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        backgroundColor: doc.processing_status === 'completed' ? '#d1fae5' : 
                                        doc.processing_status === 'processing' ? '#fef3c7' : '#fee2e2',
                        color: doc.processing_status === 'completed' ? '#065f46' : 
                               doc.processing_status === 'processing' ? '#92400e' : '#dc2626'
                      }}
                    >
                      {doc.processing_status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p><strong>Type:</strong> {doc.document_type || 'Unknown'}</p>
                    <p><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    {doc.processed_at && (
                      <p><strong>Processed:</strong> {new Date(doc.processed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {/* Show extracted data if available */}
                  {doc.processing_status === 'completed' && doc.extracted_data && (
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>📊 Extracted Data:</h4>
                      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                        {Object.entries(doc.extracted_data).map(([key, value]) => (
                          <p key={key} style={{ margin: '0.25rem 0' }}>
                            <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {' '}
                            {typeof value === 'number' && (key.includes('tax') || key.includes('wage') || key.includes('income')) ? 
                              `$${value.toLocaleString()}` : value}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {doc.processing_status === 'completed' && doc.extracted_data && (
                      <button 
                        onClick={() => applySuggestionsToForm(doc)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem' }}
                      >
                        📝 Apply to Tax Form
                      </button>
                    )}
                    <button 
                      onClick={() => viewDocumentDetails(doc.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.9rem' }}
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
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="text-2xl">Your Tax Returns</h2>
            <button 
              onClick={() => setShowTaxForm(true)} 
              className="btn btn-primary"
            >
              File New Return
            </button>
          </div>
          
          {loading ? (
            <div className="text-center">
              <p>Loading tax returns...</p>
            </div>
          ) : taxReturns.length === 0 ? (
            <div className="text-center">
              <p style={{ marginBottom: '2rem' }}>No tax returns found. Start your first return above!</p>
              <button 
                onClick={() => setShowTaxForm(true)} 
                className="btn btn-primary"
              >
                File Your First Return
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taxReturns.map((taxReturn) => (
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
                  
                  <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                    <div>
                      <p><strong>Income:</strong> ${taxReturn.income.toLocaleString()}</p>
                      <p><strong>Deductions:</strong> ${taxReturn.deductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><strong>Tax Owed:</strong> ${taxReturn.tax_owed.toFixed(2)}</p>
                      <p><strong>Withholdings:</strong> ${taxReturn.withholdings.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    {taxReturn.refund_amount > 0 ? (
                      <p style={{ color: 'green', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        💰 Refund: ${taxReturn.refund_amount.toFixed(2)}
                      </p>
                    ) : (
                      <p style={{ color: 'red', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        💸 Amount Owed: ${taxReturn.amount_owed.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary">
                      View Details
                    </button>
                    {taxReturn.status === 'draft' && (
                      <button className="btn btn-primary">
                        Continue Filing
                      </button>
                    )}
                    <button 
                      onClick={() => downloadTaxReturn(taxReturn.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      📥 Download JSON
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg">Total Returns</h3>
              <p className="text-2xl" style={{ color: '#3b82f6' }}>{taxReturns.length}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg">Total Refunds</h3>
              <p className="text-2xl" style={{ color: 'green' }}>
                ${taxReturns.reduce((sum, tr) => sum + tr.refund_amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg">Total Income</h3>
              <p className="text-2xl" style={{ color: '#374151' }}>
                ${taxReturns.reduce((sum, tr) => sum + tr.income, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
