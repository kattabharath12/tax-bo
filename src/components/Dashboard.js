{[
                      { label: "Income", value: `${(taxReturn.income || 0).toLocaleString()}`, icon: "💰", color: "text-green-400" },
                      { label: "Deductions", value: `${(taxReturn.deductions || 0).toLocaleString()}`, icon: "📄", color: "text-blue-400" },
                      { label: "Tax Owed", value: `${(taxReturn.tax_owed || 0).toFixed(2)}`, icon: "⚠️", color: "text-orange-400" },
                      { label: "Withholdings", value: `${(taxReturn.withholdings || 0).toFixed(2)}`, icon: "🛡️", color: "text-purple-400" }
                    ].map((item, i) => (
                      <div key={i} className="text-center p-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className={`text-xl mx-auto mb-1 block ${item.color}`}>{item.icon}</span>
                        <p className="text-xs text-gray-400 font-medium">{item.labelimport React, { useState, useEffect, useCallback } from 'react';

function Dashboard() {
  // Simulated data and state management
  const [user] = useState({ full_name: 'Alex Johnson' });
  const [taxReturns, setTaxReturns] = useState([
    {
      id: 1,
      tax_year: 2024,
      income: 85000,
      deductions: 12550,
      withholdings: 9500,
      tax_owed: 8200,
      refund_amount: 1300,
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
      status: 'filed',
      auto_generated: false,
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
  
  const [loading, setLoading] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
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

  const stats = [
    { title: 'Total Returns', value: taxReturns.length, icon: '📄', gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Total Refunds', value: `${taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0).toLocaleString()}`, icon: '💰', gradient: 'from-emerald-500 to-green-500' },
    { title: 'AI Generated', value: taxReturns.filter(tr => tr.auto_generated).length, icon: '🤖', gradient: 'from-purple-500 to-indigo-500' },
    { title: 'Documents', value: documents.length, icon: '📤', gradient: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Console */}
        <div className="bg-black/40 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 mb-8 font-mono text-xs overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-green-400 font-bold">TaxBox.AI Terminal</span>
            <button 
              onClick={() => setDebugInfo('System ready... 🚀')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
          <div className="text-green-400 max-h-32 overflow-y-auto leading-relaxed">
            {debugInfo}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                Hey {user?.full_name}! ✨
              </h1>
              <p className="text-xl text-gray-300">
                Experience the future of tax filing with AI-powered automation
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Smart Filing Toggle */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span className="font-medium">Smart Filing</span>
                </div>
                <button
                  onClick={() => setAutoFilingEnabled(!autoFilingEnabled)}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoFilingEnabled ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      autoFilingEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 rounded-2xl hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {processingDocument && (
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-purple-300/30 border-t-purple-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-10 h-10 border-4 border-cyan-300/30 border-b-cyan-400 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-300">AI Processing Document</h3>
                <p className="text-gray-300">Advanced neural networks analyzing your tax data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Smart Tax Entry</h2>
                <p className="text-gray-300">
                  {currentDocument ? `Processing: ${currentDocument.filename}` : 'Manual tax information entry'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleManualTaxEntry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                  <select
                    value={manualTaxData.document_type}
                    onChange={(e) => setManualTaxData(prev => ({...prev, document_type: e.target.value}))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200"
                  >
                    <option value="w2">💼 W-2 (Wage Statement)</option>
                    <option value="1099">💰 1099 (Miscellaneous Income)</option>
                    <option value="1098">🏠 1098 (Mortgage Interest)</option>
                    <option value="other">📄 Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tax Year</label>
                  <select
                    value={manualTaxData.tax_year}
                    onChange={(e) => setManualTaxData(prev => ({...prev, tax_year: parseInt(e.target.value)}))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200"
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">💵 Income/Wages ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.income}
                    onChange={(e) => setManualTaxData(prev => ({...prev, income: e.target.value}))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all duration-200"
                    placeholder="75,000.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">🧾 Federal Tax Withheld ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.withholdings}
                    onChange={(e) => setManualTaxData(prev => ({...prev, withholdings: e.target.value}))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all duration-200"
                    placeholder="8,500.00"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">📋 Deductions ($) - Optional</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.deductions}
                    onChange={(e) => setManualTaxData(prev => ({...prev, deductions: e.target.value}))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                    placeholder="12,550 (Leave blank for standard deduction)"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualEntry(false);
                    setCurrentDocument(null);
                  }}
                  className="px-6 py-3 bg-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600/70 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
                >
                  ✨ Create Tax Return
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📤</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Upload Tax Documents</h2>
                <p className="text-gray-300">Drag & drop or click to upload your tax documents</p>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-500/50 rounded-2xl p-8 text-center hover:border-cyan-400/50 transition-all duration-300 bg-white/5">
              <label className="cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">📤</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                    Choose Files or Drag & Drop
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-md">
                    Upload your W-2, 1099, 1098, and other tax documents for AI processing
                  </p>
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg group-hover:from-cyan-600 group-hover:to-purple-600 transition-all duration-300">
                    <span className="text-xl">⚡</span>
                    Select Files
                  </div>
                </div>
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  className="hidden"
                  disabled={processingDocument}
                />
              </label>
              <p className="text-sm text-gray-400 mt-6">
                Supported: PDF, JPG, PNG, DOC, DOCX, TXT • Max 10MB per file
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowUploadForm(false)} 
                className="px-6 py-3 bg-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600/70 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              {
                icon: "📝",
                title: "Manual Tax Filing",
                description: "Complete control over your tax return process",
                gradient: "from-blue-500 to-cyan-500",
                action: () => console.log('Manual filing')
              },
              {
                icon: "🤖",
                title: "AI-Powered Filing",
                description: "Upload documents and let AI handle the rest!",
                gradient: "from-purple-500 to-pink-500",
                action: () => setShowUploadForm(true)
              },
              {
                icon: "📄",
                title: "View All Returns",
                description: "Access your complete tax return history",
                gradient: "from-emerald-500 to-teal-500",
                action: () => console.log('View returns')
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 hover:border-white/20 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={item.action}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors duration-300">
                  {item.description}
                </p>
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${item.gradient} text-white px-6 py-3 rounded-2xl font-semibold group-hover:shadow-lg transition-all duration-300`}>
                  Get Started
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <span className="text-2xl text-green-400">📈</span>
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Documents Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Your Documents</h2>
                <p className="text-gray-300">Manage and process your uploaded tax documents</p>
              </div>
            </div>
            <button 
              onClick={() => setShowUploadForm(true)} 
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <span className="text-lg">➕</span>
              Upload Document
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {documents.map((document, index) => (
              <div 
                key={document.id} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {document.filename}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {document.file_type} • {(document.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                {document.ocr_text ? (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-400 text-lg">✅</span>
                      <p className="text-sm font-semibold text-green-300">AI-Ready Document</p>
                    </div>
                    <p className="text-xs text-green-400">Text extracted and ready for processing</p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-400 text-lg">⚠️</span>
                      <p className="text-sm font-semibold text-orange-300">Manual Processing Available</p>
                    </div>
                    <p className="text-xs text-orange-400">No text extracted - use manual entry option</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm rounded-lg hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center gap-1">
                    <span>👁️</span>
                    View
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentDocument(document);
                      setShowManualEntry(true);
                    }}
                    className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-lg hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <span>📝</span>
                    Process
                  </button>
                  <button className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg hover:bg-red-500/30 transition-all duration-200">
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Returns Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Your Tax Returns</h2>
                <p className="text-gray-300">Track and manage all your tax filings</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold flex items-center gap-2"
              >
                <span className="text-lg">🤖</span>
                Smart Filing
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold flex items-center gap-2">
                <span className="text-lg">📝</span>
                Manual Filing
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-300 text-lg">Loading your tax returns...</p>
            </div>
          ) : taxReturns.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📄</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready to file your taxes?</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Choose between AI-powered smart filing or traditional manual filing
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg font-semibold text-lg"
                >
                  <span className="text-2xl">🤖</span>
                  Smart Filing
                </button>
                <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-lg font-semibold text-lg">
                  <span className="text-2xl">📝</span>
                  Manual Filing
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {taxReturns.map((taxReturn, index) => (
                <div 
                  key={taxReturn.id} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transform hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                        Tax Year {taxReturn.tax_year}
                      </h3>
                      <p className="text-gray-400">Filed {new Date(taxReturn.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        taxReturn.status === 'draft' 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300' 
                          : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300'
                      }`}>
                        {taxReturn.status.toUpperCase()}
                      </span>
                      {taxReturn.auto_generated && (
                        <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
                          <span>🤖</span>
                          AI
                        </span>
                      )}
                    </div>
                  </div>

                  {taxReturn.auto_generated && (
                    <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                      <p className="text-sm font-medium text-purple-300 flex items-center gap-2">
                        <span>🤖</span>
                        AI-generated from: {taxReturn.source_document}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "Income", value: `${(taxReturn.income || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
                      { label: "Deductions", value: `${(taxReturn.deductions || 0).toLocaleString()}`, icon: FileText, color: "text-blue-400" },
                      { label: "Tax Owed", value: `${(taxReturn.tax_owed || 0).toFixed(2)}`, icon: AlertCircle, color: "text-orange-400" },
                      { label: "Withholdings", value: `${(taxReturn.withholdings || 0).toFixed(2)}`, icon: Shield, color: "text-purple-400" }
                    ].map((item, i) => (
                      <div key={i} className="text-center p-3 bg-white/5 border border-white/10 rounded-xl">
                        <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                        <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-6 p-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/5">
                    {(taxReturn.refund_amount || 0) > 0 ? (
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-bold text-lg">
                          Refund: ${(taxReturn.refund_amount || 0).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-red-400 font-bold text-lg">
                          Amount Owed: ${(taxReturn.amount_owed || 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-gray-500/20 border border-gray-500/30 text-gray-300 text-sm rounded-xl hover:bg-gray-500/30 transition-all duration-200 font-medium flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {taxReturn.status === 'draft' && (
                      <button className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm rounded-xl hover:bg-blue-500/30 transition-all duration-200 font-medium flex items-center justify-center gap-1">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    <button className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-xl hover:bg-green-500/30 transition-all duration-200 font-medium">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Info Panel */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-3">How Smart Filing Works</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Upload W-2, 1099, 1098, and other tax documents
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      AI extracts data automatically when possible
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Manual entry option for maximum flexibility
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Automatic tax return creation and updates
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Review and edit before final submission
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Professional PDF generation and download
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
        
        /* Glassmorphism enhancement */
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        /* Smooth gradient animations */
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
