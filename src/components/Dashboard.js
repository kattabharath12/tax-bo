import React, { useState, useCallback } from 'react';

function Dashboard() {
  // User data
  const [user] = useState({ full_name: 'Alex Johnson' });
  
  // Sample data
  const [taxReturns, setTaxReturns] = useState([
    {
      id: 1,
      tax_year: 2024,
      income: 85000,
      deductions: 12550,
      withholdings: 9500,
      tax_owed: 8200,
      refund_amount: 1300,
      amount_owed: 0,
      status: 'draft',
      auto_generated: true,
      source_document: 'W2_Acme_Corp.pdf',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      tax_year: 2023,
      income: 78000,
      deductions: 12550,
      withholdings: 8900,
      tax_owed: 7800,
      refund_amount: 1100,
      amount_owed: 0,
      status: 'filed',
      auto_generated: false,
      source_document: 'manual_entry',
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  
  const [documents, setDocuments] = useState([
    {
      id: 1,
      filename: 'W2_Acme_Corp_2024.pdf',
      file_type: 'application/pdf',
      file_size: 245760,
      uploaded_at: new Date().toISOString(),
      ocr_text: 'Sample OCR text extracted',
      file_url: '#'
    },
    {
      id: 2,
      filename: '1099_Freelance_2024.pdf',
      file_type: 'application/pdf',
      file_size: 189440,
      uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ocr_text: null,
      file_url: '#'
    }
  ]);
  
  // State management
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [processingDocument, setProcessingDocument] = useState(false);
  const [autoFilingEnabled, setAutoFilingEnabled] = useState(true);
  const [debugInfo, setDebugInfo] = useState('System initialized... Ready for smart tax filing! 🚀');
  const [manualTaxData, setManualTaxData] = useState({
    income: '',
    withholdings: '',
    deductions: '',
    tax_year: new Date().getFullYear() - 1,
    document_type: 'w2'
  });

  const addDebugInfo = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
  }, []);

  const handleUploadDocument = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessingDocument(true);
    addDebugInfo(`🔄 Processing ${file.name}...`);
    
    // Simulate upload process
    setTimeout(() => {
      const newDoc = {
        id: documents.length + 1,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        ocr_text: Math.random() > 0.5 ? 'Sample OCR text' : null,
        file_url: '#'
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      addDebugInfo(`✅ Successfully uploaded ${file.name}`);
      setProcessingDocument(false);
      setShowUploadForm(false);
      
      if (!newDoc.ocr_text && autoFilingEnabled) {
        setTimeout(() => {
          if (window.confirm('No OCR text detected. Would you like to manually enter tax information?')) {
            setCurrentDocument(newDoc);
            setShowManualEntry(true);
          }
        }, 1000);
      }
    }, 2000);
  };

  const handleManualTaxEntry = (e) => {
    e.preventDefault();
    
    const newReturn = {
      id: taxReturns.length + 1,
      tax_year: parseInt(manualTaxData.tax_year),
      income: parseFloat(manualTaxData.income) || 0,
      withholdings: parseFloat(manualTaxData.withholdings) || 0,
      deductions: parseFloat(manualTaxData.deductions) || 12550,
      tax_owed: 0,
      refund_amount: 0,
      amount_owed: 0,
      status: 'draft',
      auto_generated: true,
      source_document: currentDocument?.filename || 'manual_entry',
      created_at: new Date().toISOString()
    };
    
    setTaxReturns(prev => [newReturn, ...prev]);
    addDebugInfo(`🎉 Created new tax return for ${newReturn.tax_year}`);
    setShowManualEntry(false);
    setCurrentDocument(null);
    setManualTaxData({
      income: '',
      withholdings: '',
      deductions: '',
      tax_year: new Date().getFullYear() - 1,
      document_type: 'w2'
    });
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      addDebugInfo(`🗑️ Deleted document ID: ${documentId}`);
    }
  };

  const handleProcessDocument = (document) => {
    setCurrentDocument(document);
    setShowManualEntry(true);
    addDebugInfo(`🔄 Processing document: ${document.filename}`);
  };

  const stats = [
    { title: 'Total Returns', value: taxReturns.length, icon: '📄' },
    { title: 'Total Refunds', value: `$${taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0).toLocaleString()}`, icon: '💰' },
    { title: 'AI Generated', value: taxReturns.filter(tr => tr.auto_generated).length, icon: '🤖' },
    { title: 'Documents', value: documents.length, icon: '📤' }
  ];

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%)',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px'
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '14px',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* Debug Console */}
        <div style={{
          ...cardStyle,
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid #10b981',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#eab308', borderRadius: '50%' }}></div>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
            </div>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>TaxBox.AI Terminal</span>
            <button 
              onClick={() => setDebugInfo('System ready... 🚀')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
          <div style={{ color: '#10b981', maxHeight: '120px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {debugInfo}
          </div>
        </div>

        {/* Header */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px'
              }}>
                Hey {user?.full_name}! ✨
              </h1>
              <p style={{ fontSize: '20px', color: '#d1d5db' }}>
                Experience the future of tax filing with AI-powered automation
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '16px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <span style={{ fontWeight: '500' }}>Smart Filing</span>
                <button
                  onClick={() => setAutoFilingEnabled(!autoFilingEnabled)}
                  style={{
                    width: '56px',
                    height: '32px',
                    borderRadius: '16px',
                    border: 'none',
                    background: autoFilingEnabled ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : '#6b7280',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    borderRadius: '14px',
                    position: 'absolute',
                    top: '2px',
                    left: autoFilingEnabled ? '26px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}></div>
                </button>
              </div>
              <button 
                onClick={() => addDebugInfo('🚪 User logged out')}
                style={{
                  ...buttonStyle,
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {processingDocument && (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid rgba(139, 92, 246, 0.3)',
                  borderTop: '4px solid #8b5cf6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#c084fc', marginBottom: '4px' }}>AI Processing Document</h3>
                <p style={{ color: '#d1d5db' }}>Advanced neural networks analyzing your tax data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📝
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Smart Tax Entry</h2>
                <p style={{ color: '#d1d5db' }}>
                  {currentDocument ? `Processing: ${currentDocument.filename}` : 'Manual tax information entry'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleManualTaxEntry}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                    Document Type
                  </label>
                  <select
                    value={manualTaxData.document_type}
                    onChange={(e) => setManualTaxData(prev => ({...prev, document_type: e.target.value}))}
                    style={inputStyle}
                  >
                    <option value="w2">💼 W-2 (Wage Statement)</option>
                    <option value="1099">💰 1099 (Miscellaneous Income)</option>
                    <option value="1098">🏠 1098 (Mortgage Interest)</option>
                    <option value="other">📄 Other</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                    Tax Year
                  </label>
                  <select
                    value={manualTaxData.tax_year}
                    onChange={(e) => setManualTaxData(prev => ({...prev, tax_year: parseInt(e.target.value)}))}
                    style={inputStyle}
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                    💵 Income/Wages ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.income}
                    onChange={(e) => setManualTaxData(prev => ({...prev, income: e.target.value}))}
                    style={inputStyle}
                    placeholder="75,000.00"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                    🧾 Federal Tax Withheld ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.withholdings}
                    onChange={(e) => setManualTaxData(prev => ({...prev, withholdings: e.target.value}))}
                    style={inputStyle}
                    placeholder="8,500.00"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualEntry(false);
                    setCurrentDocument(null);
                  }}
                  style={{
                    ...buttonStyle,
                    background: 'rgba(107, 114, 128, 0.5)',
                    color: '#d1d5db'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={buttonStyle}>
                  ✨ Create Tax Return
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📤
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Upload Tax Documents</h2>
                <p style={{ color: '#d1d5db' }}>Drag & drop or click to upload your tax documents</p>
              </div>
            </div>
            
            <div style={{
              border: '2px dashed rgba(107, 114, 128, 0.5)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              marginBottom: '24px'
            }}>
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 24px',
                  transition: 'transform 0.3s ease'
                }}>
                  📤
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Choose Files or Drag & Drop
                </h3>
                <p style={{ color: '#d1d5db', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                  Upload your W-2, 1099, 1098, and other tax documents for AI processing
                </p>
                <div style={{
                  ...buttonStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  padding: '16px 32px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
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
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                Supported: PDF, JPG, PNG, DOC, DOCX, TXT • Max 10MB per file
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowUploadForm(false)} 
                style={{
                  ...buttonStyle,
                  background: 'rgba(107, 114, 128, 0.5)',
                  color: '#d1d5db'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!showUploadForm && !showManualEntry && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            {[
              {
                icon: "📝",
                title: "Manual Tax Filing",
                description: "Complete control over your tax return process",
                action: () => addDebugInfo('📝 Manual filing mode selected')
              },
              {
                icon: "🤖",
                title: "AI-Powered Filing",
                description: "Upload documents and let AI handle the rest!",
                action: () => setShowUploadForm(true)
              },
              {
                icon: "📄",
                title: "View All Returns",
                description: "Access your complete tax return history",
                action: () => addDebugInfo('📄 Viewing all tax returns')
              }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': { transform: 'scale(1.05)' }
                }}
                onClick={item.action}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 24px',
                  boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#d1d5db', marginBottom: '24px' }}>
                  {item.description}
                </p>
                <div style={{
                  ...buttonStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Get Started
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              ...cardStyle,
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize: '24px', color: '#10b981' }}>📈</span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#9ca3af', marginBottom: '8px' }}>{stat.title}</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Documents Section */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                📄
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Your Documents</h2>
                <p style={{ color: '#d1d5db' }}>Manage and process your uploaded tax documents</p>
              </div>
            </div>
            <button 
              onClick={() => setShowUploadForm(true)} 
              style={{
                ...buttonStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '16px' }}>➕</span>
              Upload Document
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {documents.map((document) => (
              <div 
                key={document.id} 
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginRight: '16px'
                  }}>
                    📄
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {document.filename}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                      {document.file_type} • {(document.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                {document.ocr_text ? (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#10b981', fontSize: '16px' }}>✅</span>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#6ee7b7' }}>AI-Ready Document</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#10b981' }}>Text extracted and ready for processing</p>
                  </div>
                ) : (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#f59e0b', fontSize: '16px' }}>⚠️</span>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>Manual Processing Available</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#f59e0b' }}>No text extracted - use manual entry option</p>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => addDebugInfo(`👁️ Viewing document: ${document.filename}`)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#93c5fd',
                      fontSize: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>👁️</span>
                    View
                  </button>
                  <button 
                    onClick={() => handleProcessDocument(document)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#6ee7b7',
                      fontSize: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>📝</span>
                    Process
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(document.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      fontSize: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Returns Section */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                📊
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Your Tax Returns</h2>
                <p style={{ color: '#d1d5db' }}>Track and manage all your tax filings</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowUploadForm(true)} 
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px' }}>🤖</span>
                Smart Filing
              </button>
              <button 
                onClick={() => addDebugInfo('📝 Manual filing initiated')}
                style={{
                  ...buttonStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px' }}>📝</span>
                Manual Filing
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
            {taxReturns.map((taxReturn) => (
              <div 
                key={taxReturn.id} 
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                      Tax Year {taxReturn.tax_year}
                    </h3>
                    <p style={{ color: '#9ca3af' }}>Filed {new Date(taxReturn.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: taxReturn.status === 'draft' 
                        ? 'rgba(245, 158, 11, 0.2)' 
                        : 'rgba(16, 185, 129, 0.2)',
                      border: taxReturn.status === 'draft'
                        ? '1px solid rgba(245, 158, 11, 0.3)'
                        : '1px solid rgba(16, 185, 129, 0.3)',
                      color: taxReturn.status === 'draft' ? '#fbbf24' : '#6ee7b7'
                    }}>
                      {taxReturn.status.toUpperCase()}
                    </span>
                    {taxReturn.auto_generated && (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#c084fc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>🤖</span>
                        AI
                      </span>
                    )}
                  </div>
                </div>

                {taxReturn.auto_generated && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🤖</span>
                      AI-generated from: {taxReturn.source_document}
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: "Income", value: `${(taxReturn.income || 0).toLocaleString()}`, icon: "💰", color: "#10b981" },
                    { label: "Deductions", value: `${(taxReturn.deductions || 0).toLocaleString()}`, icon: "📄", color: "#3b82f6" },
                    { label: "Tax Owed", value: `${(taxReturn.tax_owed || 0).toFixed(2)}`, icon: "⚠️", color: "#f59e0b" },
                    { label: "Withholdings", value: `${(taxReturn.withholdings || 0).toFixed(2)}`, icon: "🛡️", color: "#8b5cf6" }
                  ].map((item, i) => (
                    <div key={i} style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px', color: item.color }}>
                        {item.icon}
                      </span>
                      <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  textAlign: 'center'
                }}>
                  {(taxReturn.refund_amount || 0) > 0 ? (
                    <div>
                      <span style={{ fontSize: '32px', color: '#10b981', display: 'block', marginBottom: '8px' }}>💰</span>
                      <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>
                        Refund: ${(taxReturn.refund_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '32px', color: '#ef4444', display: 'block', marginBottom: '8px' }}>⚠️</span>
                      <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>
                        Amount Owed: ${(taxReturn.amount_owed || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => addDebugInfo(`👁️ Viewing tax return ${taxReturn.tax_year}`)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(107, 114, 128, 0.2)',
                      border: '1px solid rgba(107, 114, 128, 0.3)',
                      color: '#d1d5db',
                      fontSize: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>👁️</span>
                    View
                  </button>
                  {taxReturn.status === 'draft' && (
                    <button 
                      onClick={() => addDebugInfo(`✏️ Editing tax return ${taxReturn.tax_year}`)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#93c5fd',
                        fontSize: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>✏️</span>
                      Edit
                    </button>
                  )}
                  <button 
                    onClick={() => addDebugInfo(`📥 Downloading tax return ${taxReturn.tax_year}`)}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#6ee7b7',
                      fontSize: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <span>📥</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Info Panel */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}>
                ✨
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>How Smart Filing Works</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                      'Upload W-2, 1099, 1098, and other tax documents',
                      'AI extracts data automatically when possible',
                      'Manual entry option for maximum flexibility'
                    ].map((item, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>
                        <span style={{ color: '#10b981' }}>✅</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                      'Automatic tax return creation and updates',
                      'Review and edit before final submission',
                      'Professional PDF generation and download'
                    ].map((item, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>
                        <span style={{ color: '#10b981' }}>✅</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          }
          
          [style*="cursor: pointer"]:hover {
            transform: translateY(-2px);
          }
          
          input:focus, select:focus {
            outline: none;
            border-color: rgba(139, 92, 246, 0.5) !important;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }
        `
      }} />
    </div>
  );
}

export default Dashboard;
