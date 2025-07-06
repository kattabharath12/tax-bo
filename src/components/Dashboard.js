import React, { useState } from 'react';

export default function Dashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    console.log('Files dropped:', files);
    // Handle file upload logic here
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyle = {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const logoIconStyle = {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const logoTextStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b'
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  };

  const navButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const logoutButtonStyle = {
    ...navButtonStyle,
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  };

  const mainStyle = {
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const welcomeStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const welcomeTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const welcomeSubtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '24px'
  };

  const uploadSectionStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const uploadTitleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const uploadSubtitleStyle = {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px'
  };

  const uploadAreaStyle = {
    border: `2px dashed ${dragActive ? '#667eea' : '#cbd5e1'}`,
    borderRadius: '12px',
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: dragActive ? '#f0f4ff' : '#f8fafc',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const uploadIconStyle = {
    width: '64px',
    height: '64px',
    backgroundColor: '#667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  };

  const uploadTextStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px'
  };

  const uploadHintStyle = {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px'
  };

  const acceptedFormatsStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px'
  };

  const formatTagStyle = {
    padding: '4px 12px',
    backgroundColor: '#e2e8f0',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569'
  };

  const aiFeatureStyle = {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const aiIconStyle = {
    width: '48px',
    height: '48px',
    backgroundColor: '#0ea5e9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const aiTextStyle = {
    fontSize: '16px',
    color: '#0c4a6e',
    fontWeight: '500'
  };

  const footerStyle = {
    textAlign: 'center',
    padding: '32px 24px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: 'white',
    marginTop: '48px'
  };

  const footerTextStyle = {
    fontSize: '14px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const brandStyle = {
    fontWeight: '600',
    color: '#667eea'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <span style={logoTextStyle}>TaxBox.AI</span>
        </div>
        
        <nav style={navStyle}>
          <button style={navButtonStyle} className="nav-button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            Dashboard
          </button>
          
          <button style={logoutButtonStyle} className="logout-button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={mainStyle}>
        {/* Welcome Section */}
        <section style={welcomeStyle}>
          <h1 style={welcomeTitleStyle}>
            <span>Welcome back, bharath!</span>
            <span style={{fontSize: '32px'}}>🎉</span>
          </h1>
          <p style={welcomeSubtitleStyle}>
            Your AI-powered tax assistant is ready to work!
          </p>
        </section>

        {/* Upload Section */}
        <section style={uploadSectionStyle}>
          <h2 style={uploadTitleStyle}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" style={{color: '#667eea'}}>
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            Upload Tax Documents
          </h2>
          <p style={uploadSubtitleStyle}>
            Choose your document and let our AI extract your tax data automatically
          </p>

          <div 
            style={uploadAreaStyle}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            className="upload-area"
          >
            <div style={uploadIconStyle}>
              <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h3 style={uploadTextStyle}>Choose Your Document</h3>
            <p style={uploadHintStyle}>
              Drag & drop your files here, or click to browse
            </p>
            
            <div style={acceptedFormatsStyle}>
              {['PDF', 'JPG', 'PNG', 'DOC', 'DOCX', 'TXT'].map(format => (
                <span key={format} style={formatTagStyle}>{format}</span>
              ))}
            </div>
          </div>

          <input 
            id="file-input"
            type="file" 
            multiple 
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            style={{display: 'none'}}
            onChange={(e) => console.log('Files selected:', e.target.files)}
          />

          {/* AI Feature Highlight */}
          <div style={aiFeatureStyle}>
            <div style={aiIconStyle}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="white">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p style={aiTextStyle}>
              🤖 AI will automatically extract your tax data with 99% accuracy!
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <p style={footerTextStyle}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{color: '#667eea'}}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          Powered by <span style={brandStyle}>TaxBox.AI</span> - Your Smart Tax Assistant
        </p>
        <p style={{...footerTextStyle, marginTop: '8px', fontSize: '13px'}}>
          Making tax filing intelligent, simple, and secure ✨
        </p>
      </footer>

      <style>{`
        .nav-button:hover {
          background-color: #e2e8f0 !important;
          color: #334155 !important;
        }
        
        .logout-button:hover {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
        }
        
        .upload-area:hover {
          border-color: #667eea;
          background-color: #f0f4ff;
        }
        
        .upload-area:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
