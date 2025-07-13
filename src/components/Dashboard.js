import React, { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// API Functions
const updateTaxReturn = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tax-returns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update tax return');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update tax return error:', error);
    throw error;
  }
};

const saveTaxReturn = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tax-returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save tax return');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Save tax return error:', error);
    throw error;
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};

function Dashboard() {
  const [user] = useState({ full_name: 'Your Name' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Logout function that navigates back to login
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Navigate back to login page
      window.location.href = '/login';
    }
  };
  
  const [taxReturns, setTaxReturns] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [processingDocument, setProcessingDocument] = useState(false);
  const [autoFilingEnabled, setAutoFilingEnabled] = useState(true);
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailViewData, setDetailViewData] = useState(null);
  const [detailViewType, setDetailViewType] = useState('');
  const [manualTaxData, setManualTaxData] = useState({
    income: '',
    withholdings: '',
    deductions: '',
    tax_year: new Date().getFullYear() - 1,
    document_type: 'w2'
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate loading initial data
        // Replace with actual API calls when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for development
        setTaxReturns([]);
        setDocuments([]);
        
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Load data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Helper function to safely convert to number and format
  const safeToFixed = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Helper function to safely convert to number
  const safeToNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleUploadDocument = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setProcessingDocument(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to backend
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const uploadedDoc = await response.json();
      
      // Add to local state
      setDocuments(prev => [uploadedDoc, ...prev]);
      setProcessingDocument(false);
      setShowUploadForm(false);
      
      // AI Processing Logic
      if (autoFilingEnabled) {
        if (uploadedDoc.ocr_text) {
          setTimeout(() => {
            const extractedData = simulateAIExtraction(uploadedDoc);
            
            if (extractedData) {
              const confirmMessage = 'AI successfully extracted tax data from ' + uploadedDoc.filename + '!\n\n' +
                'Detected:\n• Income: ' + extractedData.income.toLocaleString() + '\n• Withholdings: ' + 
                extractedData.withholdings.toLocaleString() + '\n• Tax Year: ' + extractedData.tax_year + 
                '\n\nWould you like to create a tax return with this data?';
              
              if (window.confirm(confirmMessage)) {
                createTaxReturnFromData(extractedData, uploadedDoc);
              }
            }
          }, 1500);
        } else {
          setTimeout(() => {
            if (window.confirm('No OCR text detected. Would you like to manually enter tax information from this document?')) {
              setCurrentDocument(uploadedDoc);
              setShowManualEntry(true);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document: ' + error.message);
      setProcessingDocument(false);
    }
  };

  const simulateAIExtraction = (document) => {
    const filename = document.filename.toLowerCase();
    
    if (filename.includes('w2') || filename.includes('wage')) {
      return {
        income: Math.floor(Math.random() * 50000) + 40000,
        withholdings: Math.floor(Math.random() * 8000) + 5000,
        deductions: 12550,
        tax_year: 2024,
        document_type: 'w2'
      };
    } else if (filename.includes('1099')) {
      return {
        income: Math.floor(Math.random() * 30000) + 10000,
        withholdings: Math.floor(Math.random() * 3000) + 1000,
        deductions: 12550,
        tax_year: 2024,
        document_type: '1099'
      };
    } else {
      return {
        income: Math.floor(Math.random() * 40000) + 30000,
        withholdings: Math.floor(Math.random() * 6000) + 3000,
        deductions: 12550,
        tax_year: 2024,
        document_type: 'other'
      };
    }
  };

  const createTaxReturnFromData = async (extractedData, sourceDocument) => {
    try {
      const existingReturn = taxReturns.find(tr => tr.tax_year === extractedData.tax_year);
      
      if (existingReturn) {
        // Update existing return
        const updatedReturn = {
          ...existingReturn,
          income: safeToNumber(existingReturn.income) + safeToNumber(extractedData.income),
          withholdings: safeToNumber(existingReturn.withholdings) + safeToNumber(extractedData.withholdings),
          deductions: Math.max(safeToNumber(existingReturn.deductions), safeToNumber(extractedData.deductions)),
          source_document: existingReturn.source_document + ', ' + sourceDocument.filename
        };
        
        // Save to backend
        const savedReturn = await updateTaxReturn(existingReturn.id, updatedReturn);
        
        // Update local state
        setTaxReturns(prev => prev.map(tr => 
          tr.id === existingReturn.id ? savedReturn : tr
        ));
        
        const alertMessage = 'Tax return for ' + extractedData.tax_year + ' updated!\n\n' +
          'Added:\n• Income: +' + extractedData.income.toLocaleString() + 
          '\n• Withholdings: +' + extractedData.withholdings.toLocaleString() + 
          '\n\nTotal Income: ' + updatedReturn.income.toLocaleString();
        
        alert(alertMessage);
      } else {
        // Create new return
        const income = safeToNumber(extractedData.income);
        const withholdings = safeToNumber(extractedData.withholdings);
        const deductions = safeToNumber(extractedData.deductions);
        
        const newReturn = {
          tax_year: extractedData.tax_year,
          income: income,
          withholdings: withholdings,
          deductions: deductions,
          tax_owed: Math.max(0, (income - deductions) * 0.22 - withholdings),
          refund_amount: 0,
          amount_owed: 0,
          status: 'draft',
          auto_generated: true,
          source_document: sourceDocument.filename,
          created_at: new Date().toISOString()
        };
        
        // Calculate refund vs owed
        const taxOwed = (newReturn.income - newReturn.deductions) * 0.22;
        if (newReturn.withholdings > taxOwed) {
          newReturn.refund_amount = newReturn.withholdings - taxOwed;
          newReturn.amount_owed = 0;
        } else {
          newReturn.refund_amount = 0;
          newReturn.amount_owed = taxOwed - newReturn.withholdings;
        }
        
        // Save to backend
        const savedReturn = await saveTaxReturn(newReturn);
        
        // Update local state
        setTaxReturns(prev => [savedReturn, ...prev]);
        
        const result = savedReturn.refund_amount > 0 
          ? 'Refund: ' + savedReturn.refund_amount.toFixed(2)
          : 'Owed: ' + savedReturn.amount_owed.toFixed(2);
        
        const alertMessage = 'New tax return created for ' + extractedData.tax_year + '!\n\n' +
          'Summary:\n• Income: ' + extractedData.income.toLocaleString() + 
          '\n• Withholdings: ' + extractedData.withholdings.toLocaleString() + 
          '\n• ' + result;
        
        alert(alertMessage);
      }
    } catch (error) {
      console.error('Error creating/updating tax return:', error);
      setError('Failed to save tax return: ' + error.message);
    }
  };

  const handleManualTaxEntry = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const income = safeToNumber(manualTaxData.income);
      const withholdings = safeToNumber(manualTaxData.withholdings);
      const deductions = safeToNumber(manualTaxData.deductions) || 12550;
      
      const newReturn = {
        tax_year: parseInt(manualTaxData.tax_year),
        income: income,
        withholdings: withholdings,
        deductions: deductions,
        tax_owed: 0,
        refund_amount: 0,
        amount_owed: 0,
        status: 'draft',
        auto_generated: false,
        source_document: currentDocument?.filename || 'manual_entry',
        created_at: new Date().toISOString()
      };
      
      const taxOwed = (income - deductions) * 0.22;
      if (withholdings > taxOwed) {
        newReturn.refund_amount = withholdings - taxOwed;
        newReturn.amount_owed = 0;
      } else {
        newReturn.refund_amount = 0;
        newReturn.amount_owed = taxOwed - withholdings;
      }
      
      // Save to backend
      const savedReturn = await saveTaxReturn(newReturn);
      
      // Update local state
      setTaxReturns(prev => [savedReturn, ...prev]);
      setShowManualEntry(false);
      setCurrentDocument(null);
      setManualTaxData({
        income: '',
        withholdings: '',
        deductions: '',
        tax_year: new Date().getFullYear() - 1,
        document_type: 'w2'
      });
    } catch (error) {
      console.error('Error saving manual tax return:', error);
      setError('Failed to save tax return: ' + error.message);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Delete from backend
        await deleteDocument(documentId);
        
        // Update local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error('Error deleting document:', error);
        setError('Failed to delete document: ' + error.message);
      }
    }
  };

  const handleProcessDocument = (document) => {
    setCurrentDocument(document);
    setShowManualEntry(true);
  };

  const stats = [
    { title: 'Total Returns', value: taxReturns.length, icon: '📄' },
    { 
      title: 'Total Refunds', 
      value: '$' + taxReturns.reduce((sum, tr) => sum + safeToNumber(tr.refund_amount), 0).toLocaleString(), 
      icon: '💰' 
    },
    { title: 'AI Generated', value: taxReturns.filter(tr => tr.auto_generated).length, icon: '🤖' },
    { title: 'Documents', value: documents.length, icon: '📤' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #581c87 50%, #1e1b4b 75%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(6, 182, 212, 0.9))',
            padding: '2rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>Loading your tax data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          padding: '1rem',
          margin: '1rem',
          color: '#fca5a5',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: '600' }}>⚠️ {error}</p>
          <button 
            onClick={() => setError(null)} 
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              marginTop: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3))',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '2rem',
          padding: '2.5rem',
          marginBottom: '3rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            textShadow: '0 0 50px rgba(139, 92, 246, 0.5)'
          }}>
            🚀 TaxBox.AI Dashboard
          </h1>
          <p style={{
            fontSize: 'clamp(1.25rem, 3vw, 2rem)',
            color: '#e2e8f0',
            marginBottom: '2rem',
            fontWeight: '600'
          }}>
            Welcome {user?.full_name}! ✨ Your AI-Powered Tax Filing Experience
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '1rem 2rem',
            margin: '0 auto',
            maxWidth: 'fit-content',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '2rem' }}>✨</span>
            <span style={{ fontWeight: '600', fontSize: '1.25rem' }}>Smart Filing</span>
            <button
              onClick={() => setAutoFilingEnabled(!autoFilingEnabled)}
              style={{
                width: '4rem',
                height: '2rem',
                borderRadius: '1rem',
                border: 'none',
                background: autoFilingEnabled ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : '#6b7280',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '1.75rem',
                height: '1.75rem',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '0.125rem',
                left: autoFilingEnabled ? '2.125rem' : '0.125rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}></div>
            </button>
            <button style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              borderRadius: '1rem',
              padding: '0.75rem 1.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.875rem'
            }}
            onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Processing Indicator */}
        {processingDocument && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '2rem',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid rgba(139, 92, 246, 0.3)',
                borderTop: '4px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c084fc', marginBottom: '0.5rem' }}>
                  🤖 AI Processing Document
                </h3>
                <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
                  Advanced neural networks analyzing your tax data...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '2rem',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📝
              </div>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Smart Tax Entry
                </h2>
                <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
                  {currentDocument ? 'Processing: ' + currentDocument.filename : 'Manual tax information entry'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleManualTaxEntry}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '0.5rem'
                  }}>
                    Document Type
                  </label>
                  <select
                    value={manualTaxData.document_type}
                    onChange={(e) => setManualTaxData(prev => ({...prev, document_type: e.target.value}))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="w2">💼 W-2 (Wage Statement)</option>
                    <option value="1099">💰 1099 (Miscellaneous Income)</option>
                    <option value="1098">🏠 1098 (Mortgage Interest)</option>
                    <option value="other">📄 Other</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '0.5rem'
                  }}>
                    Tax Year
                  </label>
                  <select
                    value={manualTaxData.tax_year}
                    onChange={(e) => setManualTaxData(prev => ({...prev, tax_year: parseInt(e.target.value)}))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '0.5rem'
                  }}>
                    💵 Income/Wages ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.income}
                    onChange={(e) => setManualTaxData(prev => ({...prev, income: e.target.value}))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="75,000.00"
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '0.5rem'
                  }}>
                    🧾 Federal Tax Withheld ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.withholdings}
                    onChange={(e) => setManualTaxData(prev => ({...prev, withholdings: e.target.value}))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="8,500.00"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualEntry(false);
                    setCurrentDocument(null);
                  }}
                  style={{
                    background: 'rgba(107, 114, 128, 0.5)',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem'
                }}>
                  ✨ Create Tax Return
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '2rem',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📤
              </div>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Upload Tax Documents
                </h2>
                <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
                  Drag & drop or click to upload your tax documents
                </p>
              </div>
            </div>
            
            <div style={{
              border: '3px dashed rgba(107, 114, 128, 0.5)',
              borderRadius: '1.5rem',
              padding: '3rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              marginBottom: '2rem'
            }}>
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{
                  width: '6rem',
                  height: '6rem',
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  borderRadius: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  margin: '0 auto 2rem',
                  boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)'
                }}>
                  📤
                </div>
                <h3 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#06b6d4'
                }}>
                  Choose Files or Drag & Drop
                </h3>
                <p style={{
                  color: '#e2e8f0',
                  marginBottom: '2rem',
                  fontSize: '1.125rem'
                }}>
                  Upload your W-2, 1099, 1098, and other tax documents for AI processing
                </p>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '1rem 2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  Select Files
                </div>
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  disabled={processingDocument}
                />
              </label>
              <p style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                marginTop: '1rem'
              }}>
                Supported: PDF, JPG, PNG, DOC, DOCX, TXT • Max 10MB per file
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowUploadForm(false)} 
                style={{
                  background: 'rgba(107, 114, 128, 0.5)',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!showUploadForm && !showManualEntry && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {[
              {
                icon: "📝",
                title: "Manual Tax Filing",
                description: "Complete control over your tax return process",
                gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                action: () => {
                  setShowManualEntry(true);
                  setCurrentDocument(null);
                }
              },
              {
                icon: "🤖",
                title: "AI-Powered Filing",
                description: "Upload documents and let AI handle the rest!",
                gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                action: () => setShowUploadForm(true)
              },
              {
                icon: "📄",
                title: "View All Returns",
                description: "Access your complete tax return history",
                gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
                action: () => {
                  const returnsList = taxReturns.map(tr => 
                    '• ' + tr.tax_year + ': ' + tr.status + ' - ' + safeToNumber(tr.income).toLocaleString()
                  ).join('\n');
                  alert('You have ' + taxReturns.length + ' tax returns:\n\n' + returnsList);
                }
              }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: item.gradient.replace(')', ', 0.1)'),
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '2rem',
                  padding: '2.5rem',
                  marginBottom: '2rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={item.action}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05) translateY(-10px)';
                  e.target.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) translateY(0)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                }}
              >
                <div style={{
                  width: '6rem',
                  height: '6rem',
                  background: item.gradient,
                  borderRadius: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  margin: '0 auto 2rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  background: item.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: '#e2e8f0',
                  marginBottom: '2rem',
                  fontSize: '1.125rem',
                  lineHeight: '1.6'
                }}>
                  {item.description}
                </p>
                <div style={{
                  background: item.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '1rem 2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Get Started →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '2rem',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize: '2rem', color: '#10b981' }}>📈</span>
              </div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#9ca3af',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {stat.title}
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                color: 'white',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Documents Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '2rem',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📄
              </div>
              <div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Your Documents
                </h2>
                <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
                  Manage and process your uploaded tax documents
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowUploadForm(true)} 
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                padding: '1rem 2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1.125rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>➕</span>
              Upload Document
            </button>
          </div>
          
          {documents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ fontSize: '1.25rem' }}>No documents uploaded yet</p>
              <p style={{ fontSize: '1rem' }}>Upload your tax documents to get started</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '2rem'
            }}>
              {documents.map((document) => (
                <div 
                  key={document.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                    e.target.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '4rem',
                      height: '4rem',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      borderRadius: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      📄
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {document.filename}
                      </h3>
                      <p style={{ fontSize: '1rem', color: '#9ca3af' }}>
                        {document.file_type} • {(document.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  {document.ocr_text ? (
                    <div style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '2px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#10b981', fontSize: '1.5rem' }}>✅</span>
                        <p style={{ fontSize: '1rem', fontWeight: '700', color: '#6ee7b7' }}>
                          AI-Ready Document
                        </p>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#10b981' }}>
                        Text extracted and ready for processing
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '2px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#f59e0b', fontSize: '1.5rem' }}>⚠️</span>
                        <p style={{ fontSize: '1rem', fontWeight: '700', color: '#fbbf24' }}>
                          Manual Processing Available
                        </p>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
                        No text extracted - use manual entry option
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => {
                        setDetailViewData(document);
                        setDetailViewType('document');
                        setShowDetailView(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        color: '#93c5fd',
                        fontSize: '1rem',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      👁️ View
                    </button>
                    <button 
                      onClick={() => handleProcessDocument(document)}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        color: '#6ee7b7',
                        fontSize: '1rem',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📝 Process
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(document.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        fontSize: '1rem',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tax Returns Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '2rem',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📊
              </div>
              <div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Your Tax Returns
                </h2>
                <p style={{ color: '#e2e8f0', fontSize: '1.125rem' }}>
                  Track and manage all your tax filings
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowUploadForm(true)} 
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '1rem 2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🤖</span>
                Smart Filing
              </button>
              <button 
                onClick={() => {
                  setShowManualEntry(true);
                  setCurrentDocument(null);
                }} 
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '1rem 2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1.125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📝</span>
                Manual Filing
              </button>
            </div>
          </div>
          
          {taxReturns.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <p style={{ fontSize: '1.25rem' }}>No tax returns created yet</p>
              <p style={{ fontSize: '1rem' }}>Create your first tax return to get started</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '2rem'
            }}>
              {taxReturns.map((taxReturn) => (
                <div 
                  key={taxReturn.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '2rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.75rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Tax Year {taxReturn.tax_year}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                        Filed {new Date(taxReturn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        background: taxReturn.status === 'draft' 
                          ? 'rgba(245, 158, 11, 0.2)' 
                          : 'rgba(16, 185, 129, 0.2)',
                        border: taxReturn.status === 'draft'
                          ? '2px solid rgba(245, 158, 11, 0.3)'
                          : '2px solid rgba(16, 185, 129, 0.3)',
                        color: taxReturn.status === 'draft' ? '#fbbf24' : '#6ee7b7'
                      }}>
                        {taxReturn.status.toUpperCase()}
                      </span>
                      {taxReturn.auto_generated && (
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          background: 'rgba(139, 92, 246, 0.2)',
                          border: '2px solid rgba(139, 92, 246, 0.3)',
                          color: '#c084fc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          🤖 AI
                        </span>
                      )}
                    </div>
                  </div>

                  {taxReturn.auto_generated && (
                    <div style={{
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '2px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '1rem'
                    }}>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#c084fc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        🤖 AI-generated from: {taxReturn.source_document}
                      </p>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    {[
                      { label: "Income", value: safeToNumber(taxReturn.income).toLocaleString(), icon: "💰", color: "#10b981" },
                      { label: "Deductions", value: safeToNumber(taxReturn.deductions).toLocaleString(), icon: "📄", color: "#3b82f6" },
                      { label: "Tax Owed", value: safeToFixed(taxReturn.tax_owed), icon: "⚠️", color: "#f59e0b" },
                      { label: "Withholdings", value: safeToFixed(taxReturn.withholdings), icon: "🛡️", color: "#8b5cf6" }
                    ].map((item, i) => (
                      <div key={i} style={{
                        textAlign: 'center',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem'
                      }}>
                        <span style={{
                          fontSize: '2rem',
                          display: 'block',
                          marginBottom: '0.5rem',
                          color: item.color
                        }}>
                          {item.icon}
                        </span>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#9ca3af',
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {item.label}
                        </p>
                        <p style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    borderRadius: '1.5rem',
                    border: '3px dashed rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                  }}>
                    {safeToNumber(taxReturn.refund_amount) > 0 ? (
                      <div>
                        <span style={{
                          fontSize: '4rem',
                          color: '#10b981',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}>
                          💰
                        </span>
                        <p style={{
                          color: '#10b981',
                          fontWeight: 'bold',
                          fontSize: '2rem',
                          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          Refund: ${safeToFixed(taxReturn.refund_amount)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span style={{
                          fontSize: '4rem',
                          color: '#ef4444',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}>
                          ⚠️
                        </span>
                        <p style={{
                          color: '#ef4444',
                          fontWeight: 'bold',
                          fontSize: '2rem',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          Amount Owed: ${safeToFixed(taxReturn.amount_owed)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => {
                        const refundOrOwed = safeToNumber(taxReturn.refund_amount) > 0 
                          ? 'Refund of  + safeToFixed(taxReturn.refund_amount)
                          : 'Amount Owed:  + safeToFixed(taxReturn.amount_owed);
                        
                        const returnInfo = 'Tax Return Details - ' + taxReturn.tax_year + '\n\n' +
                          'Financial Summary:\n' +
                          '• Income:  + safeToNumber(taxReturn.income).toLocaleString() + '\n' +
                          '• Deductions:  + safeToNumber(taxReturn.deductions).toLocaleString() + '\n' +
                          '• Tax Owed:  + safeToFixed(taxReturn.tax_owed) + '\n' +
                          '• Withholdings:  + safeToFixed(taxReturn.withholdings) + '\n\n' +
                          'Result: ' + refundOrOwed + '\n\n' +
                          'Status: ' + taxReturn.status.toUpperCase() + '\n' +
                          'AI Generated: ' + (taxReturn.auto_generated ? 'Yes' : 'No') + '\n' +
                          'Source: ' + taxReturn.source_document;
                        
                        alert(returnInfo);
                      }}
                      style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        background: 'rgba(107, 114, 128, 0.2)',
                        border: '2px solid rgba(107, 114, 128, 0.3)',
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        borderRadius: '1rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      👁️ View
                    </button>
                    {taxReturn.status === 'draft' && (
                      <button 
                        onClick={() => {
                          const newIncome = prompt('Edit Income for ' + taxReturn.tax_year + ':', taxReturn.income);
                          const newWithholdings = prompt('Edit Withholdings for ' + taxReturn.tax_year + ':', taxReturn.withholdings);
                          const newDeductions = prompt('Edit Deductions for ' + taxReturn.tax_year + ':', taxReturn.deductions);
                          
                          if (newIncome !== null || newWithholdings !== null || newDeductions !== null) {
                            const updatedReturn = {
                              ...taxReturn,
                              income: safeToNumber(newIncome || taxReturn.income),
                              withholdings: safeToNumber(newWithholdings || taxReturn.withholdings),
                              deductions: safeToNumber(newDeductions || taxReturn.deductions)
                            };
                            
                            const taxOwed = (updatedReturn.income - updatedReturn.deductions) * 0.22;
                            if (updatedReturn.withholdings > taxOwed) {
                              updatedReturn.refund_amount = updatedReturn.withholdings - taxOwed;
                              updatedReturn.amount_owed = 0;
                            } else {
                              updatedReturn.refund_amount = 0;
                              updatedReturn.amount_owed = taxOwed - updatedReturn.withholdings;
                            }
                            
                            setTaxReturns(prev => prev.map(tr => 
                              tr.id === taxReturn.id ? updatedReturn : tr
                            ));
                            
                            alert('Tax return for ' + taxReturn.tax_year + ' updated successfully!');
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '1rem 1.5rem',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                          color: '#93c5fd',
                          fontSize: '1rem',
                          borderRadius: '1rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const refundOrOwedResult = safeToNumber(taxReturn.refund_amount) > 0 
                          ? 'Refund Amount:  + safeToFixed(taxReturn.refund_amount)
                          : 'Amount Owed:  + safeToFixed(taxReturn.amount_owed);
                        
                        const pdfContent = 'TAX RETURN SUMMARY - ' + taxReturn.tax_year + '\n\n' +
                          'Taxpayer: ' + (user?.full_name || 'Your Name') + '\n' +
                          'Tax Year: ' + taxReturn.tax_year + '\n' +
                          'Filing Status: ' + taxReturn.status.toUpperCase() + '\n\n' +
                          'INCOME INFORMATION:\n' +
                          'Total Income:  + safeToNumber(taxReturn.income).toLocaleString() + '\n' +
                          'Deductions:  + safeToNumber(taxReturn.deductions).toLocaleString() + '\n' +
                          'Tax Owed:  + safeToFixed(taxReturn.tax_owed) + '\n' +
                          'Withholdings:  + safeToFixed(taxReturn.withholdings) + '\n\n' +
                          'RESULT:\n' +
                          refundOrOwedResult + '\n\n' +
                          'Generated by TaxBox.AI\n' +
                          (taxReturn.auto_generated ? 'AI-Generated from: ' + taxReturn.source_document : 'Manually entered') + '\n' +
                          'Date: ' + new Date(taxReturn.created_at).toLocaleDateString();
                        
                        const blob = new Blob([pdfContent], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'tax_return_' + taxReturn.tax_year + '_' + taxReturn.id + '.txt';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        alert('Tax return for ' + taxReturn.tax_year + ' downloaded successfully!');
                      }}
                      style={{
                        padding: '1rem 1.5rem',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        color: '#6ee7b7',
                        fontSize: '1rem',
                        borderRadius: '1rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail View Modal */}
        {showDetailView && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95))',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '2rem',
              padding: '2rem',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                  {detailViewType === 'document' && '📄 Document Details'}
                  {detailViewType === 'taxReturn' && '📊 Tax Return Details'}
                  {detailViewType === 'allReturns' && '📋 All Tax Returns'}
                  {detailViewType === 'message' && '💡 Information'}
                </h2>
                <button
                  onClick={() => setShowDetailView(false)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Document Details */}
              {detailViewType === 'document' && detailViewData && (
                <div style={{ color: 'white' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#06b6d4' }}>
                      {detailViewData.filename}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>File Type</p>
                        <p style={{ fontWeight: '600' }}>{detailViewData.file_type}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>File Size</p>
                        <p style={{ fontWeight: '600' }}>{(detailViewData.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Uploaded</p>
                        <p style={{ fontWeight: '600' }}>{new Date(detailViewData.uploaded_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>OCR Status</p>
                        <p style={{ fontWeight: '600', color: detailViewData.ocr_text ? '#10b981' : '#f59e0b' }}>
                          {detailViewData.ocr_text ? '✅ Text Extracted' : '⚠️ No Text Extracted'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {detailViewData.ocr_text && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '1rem',
                      padding: '1rem'
                    }}>
                      <p style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>Extracted Text Preview:</p>
                      <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{detailViewData.ocr_text}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tax Return Details */}
              {detailViewType === 'taxReturn' && detailViewData && (
                <div style={{ color: 'white' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#8b5cf6' }}>
                      Tax Year {detailViewData.tax_year}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Income</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#10b981' }}>${safeToNumber(detailViewData.income).toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Deductions</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#3b82f6' }}>${safeToNumber(detailViewData.deductions).toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tax Owed</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#f59e0b' }}>${safeToFixed(detailViewData.tax_owed)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Withholdings</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#8b5cf6' }}>${safeToFixed(detailViewData.withholdings)}</p>
                      </div>
                    </div>
                    
                    <div style={{
                      background: safeToNumber(detailViewData.refund_amount) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: safeToNumber(detailViewData.refund_amount) > 0 ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '1rem',
                      padding: '1rem',
                      textAlign: 'center',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {safeToNumber(detailViewData.refund_amount) > 0 ? '💰' : '⚠️'}
                      </p>
                      <p style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.25rem',
                        color: safeToNumber(detailViewData.refund_amount) > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {safeToNumber(detailViewData.refund_amount) > 0 
                          ? 'Refund:  + safeToFixed(detailViewData.refund_amount)
                          : 'Amount Owed:  + safeToFixed(detailViewData.amount_owed)
                        }
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</p>
                        <p style={{ 
                          fontWeight: 'bold',
                          color: detailViewData.status === 'draft' ? '#fbbf24' : '#10b981'
                        }}>
                          {detailViewData.status.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>AI Generated</p>
                        <p style={{ fontWeight: 'bold', color: detailViewData.auto_generated ? '#8b5cf6' : '#9ca3af' }}>
                          {detailViewData.auto_generated ? '🤖 Yes' : '👤 Manual'}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Source</p>
                        <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{detailViewData.source_document}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Created</p>
                        <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{new Date(detailViewData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message View */}
              {detailViewType === 'message' && detailViewData && (
                <div style={{
                  textAlign: 'center',
                  color: 'white',
                  padding: '2rem'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                  <p style={{ fontSize: '1.125rem', color: '#e2e8f0' }}>{detailViewData.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '2rem',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1.125rem',
            color: '#9ca3af',
            marginBottom: '0.5rem'
          }}>
            🚀 Powered by TaxBox.AI - The Future of Tax Filing
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Built with ❤️ using React and modern web technologies
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important;
          }
          
          input:focus, select:focus {
            outline: none !important;
            border-color: rgba(139, 92, 246, 0.6) !important;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2) !important;
          }
          
          * {
            box-sizing: border-box;
          }
        `
      }} />
    </div>
  );
}

export default Dashboard;
