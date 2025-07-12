import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import TaxForm from './TaxForm';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';

function Dashboard() {
  const { user, logout } = useAuth();
  const [taxReturns, setTaxReturns] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [processingDocument, setProcessingDocument] = useState(false);
  const [autoFilingEnabled, setAutoFilingEnabled] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');
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
    console.log(`[AUTO-FILING DEBUG] ${message}`);
  }, []);

  const fetchTaxReturns = useCallback(async () => {
    try {
      const response = await apiService.getTaxReturns();
      setTaxReturns(response);
      addDebugInfo(`Fetched ${response.length} tax returns`);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
      addDebugInfo(`Error fetching tax returns: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [addDebugInfo]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await apiService.getDocuments();
      setDocuments(response);
      addDebugInfo(`Fetched ${response.length} documents`);
      
      if (response.length > 0) {
        addDebugInfo(`Sample document structure: ${JSON.stringify(Object.keys(response[0]))}`);
        addDebugInfo(`Has OCR text: ${!!response[0].ocr_text}`);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      addDebugInfo(`Error fetching documents: ${error.message}`);
      setDocuments([]);
    }
  }, [addDebugInfo]);

  useEffect(() => {
    fetchTaxReturns();
    fetchDocuments();
  }, [fetchTaxReturns, fetchDocuments]);

  const createAutoTaxReturn = async (taxData) => {
    try {
      setProcessingDocument(true);
      addDebugInfo('Starting tax return creation...');
      
      const existingReturn = taxReturns.find(tr => tr.tax_year === taxData.tax_year);
      
      if (existingReturn) {
        addDebugInfo(`Found existing return for ${taxData.tax_year}, updating...`);
        
        const updatedData = {
          ...existingReturn,
          income: (existingReturn.income || 0) + (taxData.income || 0),
          withholdings: (existingReturn.withholdings || 0) + (taxData.withholdings || 0),
          deductions: Math.max(existingReturn.deductions || 0, taxData.deductions || 0),
          updated_from_document: true
        };
        
        await apiService.updateTaxReturn(existingReturn.id, updatedData);
        addDebugInfo('Successfully updated existing tax return');
        
        alert(`Tax return for ${taxData.tax_year} updated!\nIncome: +$${(taxData.income || 0).toLocaleString()}\nWithholdings: +$${(taxData.withholdings || 0).toLocaleString()}`);
        
      } else {
        addDebugInfo(`Creating new return for ${taxData.tax_year}...`);
        
        const newTaxReturn = {
          tax_year: taxData.tax_year,
          income: taxData.income || 0,
          withholdings: taxData.withholdings || 0,
          deductions: Math.max(taxData.deductions || 0, 12550),
          filing_status: 'single',
          status: 'draft',
          auto_generated: true,
          source_document: taxData.document_source || 'manual_entry'
        };
        
        await apiService.createTaxReturn(newTaxReturn);
        addDebugInfo('Successfully created new tax return');
        
        alert(`New tax return created for ${taxData.tax_year}!\nIncome: $${(taxData.income || 0).toLocaleString()}\nWithholdings: $${(taxData.withholdings || 0).toLocaleString()}`);
      }
      
      await fetchTaxReturns();
      
    } catch (error) {
      console.error('Error creating tax return:', error);
      addDebugInfo(`Error creating tax return: ${error.message}`);
      alert('Failed to create tax return. Please try again.');
    } finally {
      setProcessingDocument(false);
    }
  };

  const handleManualTaxEntry = async (e) => {
    e.preventDefault();
    
    const taxData = {
      income: parseFloat(manualTaxData.income) || 0,
      withholdings: parseFloat(manualTaxData.withholdings) || 0,
      deductions: parseFloat(manualTaxData.deductions) || 0,
      tax_year: parseInt(manualTaxData.tax_year),
      document_source: currentDocument?.filename || 'manual_entry'
    };
    
    if (taxData.income <= 0 && taxData.withholdings <= 0) {
      alert('Please enter at least income or withholdings amount.');
      return;
    }
    
    await createAutoTaxReturn(taxData);
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
      setProcessingDocument(true);
      addDebugInfo(`Uploading file: ${file.name} (${file.type})`);
      
      const uploadResponse = await apiService.uploadDocument(formData);
      addDebugInfo(`Upload successful. Response: ${JSON.stringify(uploadResponse, null, 2)}`);
      
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      
      await fetchDocuments();
      
      if (autoFilingEnabled) {
        addDebugInfo('Auto filing enabled - checking for OCR text...');
        
        setTimeout(async () => {
          try {
            const documents = await apiService.getDocuments();
            const latestDocument = documents[0];
            
            if (latestDocument && latestDocument.ocr_text) {
              addDebugInfo('OCR text found - would process automatically');
              alert('OCR text detected! Auto-processing would happen here.\n(This feature needs backend OCR support)');
            } else {
              addDebugInfo('No OCR text - offering manual entry');
              
              const shouldManualEntry = window.confirm(
                `Document uploaded successfully!\n\n` +
                `No OCR text was extracted from your document.\n` +
                `Would you like to manually enter the tax information from this document?\n\n` +
                `This will help create your tax return automatically.`
              );
              
              if (shouldManualEntry) {
                setCurrentDocument(latestDocument);
                setShowManualEntry(true);
                
                const filename = latestDocument.filename?.toLowerCase() || '';
                let docType = 'w2';
                if (filename.includes('1099')) docType = '1099';
                else if (filename.includes('1098')) docType = '1098';
                
                setManualTaxData(prev => ({
                  ...prev,
                  document_type: docType
                }));
              }
            }
          } catch (error) {
            addDebugInfo(`Error in processing: ${error.message}`);
          } finally {
            setProcessingDocument(false);
          }
        }, 2000);
      } else {
        setProcessingDocument(false);
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
      addDebugInfo(`Upload error: ${error.message}`);
      alert('Failed to upload document');
      setProcessingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await apiService.deleteDocument(documentId);
      alert('Document deleted successfully!');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const openManualEntryForDocument = (document) => {
    setCurrentDocument(document);
    setShowManualEntry(true);
    
    const filename = document.filename?.toLowerCase() || '';
    let docType = 'w2';
    if (filename.includes('1099')) docType = '1099';
    else if (filename.includes('1098')) docType = '1098';
    
    setManualTaxData(prev => ({
      ...prev,
      document_type: docType
    }));
  };

  const downloadTaxReturn = async (taxReturn) => {
    try {
      if (typeof taxReturn === 'number' || typeof taxReturn === 'string') {
        alert('Error: Tax return data not available. Please refresh the page and try again.');
        return;
      }

      if (!taxReturn || typeof taxReturn !== 'object') {
        alert('Error: Invalid tax return data. Please try again.');
        return;
      }

      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('TAX RETURN SUMMARY', 105, 30, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`Tax Year: ${taxReturn.tax_year || 'N/A'}`, 20, 50);
      
      doc.setFontSize(12);
      let yPosition = 70;
      
      doc.text(`Taxpayer: ${user?.full_name || 'N/A'}`, 20, yPosition);
      yPosition += 20;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('INCOME INFORMATION', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      const income = Number(taxReturn.income) || 0;
      const deductions = Number(taxReturn.deductions) || 0;
      const withholdings = Number(taxReturn.withholdings) || 0;
      
      doc.text(`Total Income: $${income.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Deductions: $${deductions.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Tax Withholdings: $${withholdings.toFixed(2)}`, 20, yPosition);
      yPosition += 20;
      
      if (taxReturn.auto_generated) {
        doc.text(`Auto-generated from: ${taxReturn.source_document || 'uploaded documents'}`, 20, yPosition);
        yPosition += 15;
      }
      
      doc.setFontSize(8);
      doc.text('Generated by TaxBox.AI - For informational purposes only', 20, yPosition);
      
      const safeId = taxReturn.id || Date.now();
      const safeYear = taxReturn.tax_year || 'unknown';
      const filename = `tax_return_${safeYear}_${safeId}.pdf`;
      
      doc.save(filename);
      alert('Tax return PDF downloaded successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const navigateToTaxReturns = () => {
    window.location.href = '/tax-returns';
  };

  const navigateToCreateTaxReturn = () => {
    window.location.href = '/tax-returns/create';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Debug Console */}
        <div className="bg-gray-900/95 backdrop-blur-sm text-green-400 p-6 rounded-2xl mb-8 font-mono text-xs max-h-40 overflow-y-auto border border-gray-700 shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-white font-bold text-sm">🔧 Debug Console</h3>
            </div>
            <button 
              onClick={() => setDebugInfo('')}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              ✕ Clear
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">{debugInfo || 'System ready... Waiting for activity...'}</pre>
        </div>

        {/* Modern Header with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.full_name}! 👋
              </h1>
              <p className="text-gray-600 text-lg">Transform your tax filing experience with AI-powered automation</p>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 shadow-lg">
                <label className="text-sm font-medium text-gray-700">Smart Filing</label>
                <button
                  onClick={() => setAutoFilingEnabled(!autoFilingEnabled)}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoFilingEnabled ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      autoFilingEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <button 
                onClick={handleLogout} 
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Modern Processing Indicator */}
        {processingDocument && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-purple-200 border-b-purple-600 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-blue-900">🚀 AI Processing in Progress</h3>
                <p className="text-blue-700">Analyzing your document with advanced intelligence...</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Manual Entry Form */}
        {showManualEntry && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Smart Tax Data Entry
                </h2>
                <p className="text-gray-600">
                  {currentDocument ? `Processing: ${currentDocument.filename}` : 'Manual tax information entry'}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <p className="text-blue-800 font-medium">
                ✨ Our AI couldn't extract text automatically, but we'll help you create your tax return manually!
              </p>
            </div>

            <form onSubmit={handleManualTaxEntry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Document Type
                  </label>
                  <select
                    value={manualTaxData.document_type}
                    onChange={(e) => setManualTaxData(prev => ({...prev, document_type: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/80"
                  >
                    <option value="w2">💼 W-2 (Wage Statement)</option>
                    <option value="1099">💰 1099 (Miscellaneous Income)</option>
                    <option value="1098">🏠 1098 (Mortgage Interest)</option>
                    <option value="other">📄 Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tax Year
                  </label>
                  <select
                    value={manualTaxData.tax_year}
                    onChange={(e) => setManualTaxData(prev => ({...prev, tax_year: parseInt(e.target.value)}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/80"
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    💵 Income/Wages ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.income}
                    onChange={(e) => setManualTaxData(prev => ({...prev, income: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/80"
                    placeholder="75,000.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    🧾 Federal Tax Withheld ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.withholdings}
                    onChange={(e) => setManualTaxData(prev => ({...prev, withholdings: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/80"
                    placeholder="8,500.00"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    📋 Deductions ($) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.deductions}
                    onChange={(e) => setManualTaxData(prev => ({...prev, deductions: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/80"
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
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
                >
                  ✨ Create Tax Return
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tax Form */}
        {showTaxForm && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
            <TaxForm onSuccess={handleTaxFormSuccess} />
          </div>
        )}

        {/* Modern Upload Form */}
        {showUploadForm && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-3xl">📤</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Upload Tax Documents</h2>
                <p className="text-gray-600">Drag & drop or click to upload your tax documents</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                <strong>🤖 Smart Filing {autoFilingEnabled ? 'Enabled' : 'Disabled'}:</strong> 
                {autoFilingEnabled 
                  ? ' Our AI will help analyze and process your documents automatically!' 
                  : ' Documents will be stored for manual processing.'
                }
              </p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50/50">
              <label className="cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    Choose Files or Drag & Drop
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upload your W-2, 1099, 1098, and other tax documents
                  </p>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                    <span>📁</span>
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
              <p className="text-sm text-gray-500 mt-4">
                <strong>Supported formats:</strong> PDF, JPG, PNG, DOC, DOCX, TXT<br />
                <strong>File size limit:</strong> 10MB per file
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowUploadForm(false)} 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Modern Quick Actions with Animations */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              {
                icon: "📝",
                title: "Manual Tax Filing",
                description: "Complete control over your tax return process",
                action: navigateToCreateTaxReturn,
                gradient: "from-blue-500 to-blue-600",
                hoverGradient: "from-blue-600 to-blue-700"
              },
              {
                icon: "🤖",
                title: "AI-Powered Filing",
                description: "Upload documents and let AI handle the rest!",
                action: () => setShowUploadForm(true),
                gradient: "from-green-500 to-emerald-600",
                hoverGradient: "from-green-600 to-emerald-700"
              },
              {
                icon: "💰",
                title: "View All Returns",
                description: "Access your complete tax return history",
                action: navigateToTaxReturns,
                gradient: "from-purple-500 to-indigo-600",
                hoverGradient: "from-purple-600 to-indigo-700"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={item.action}
              >
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-3xl flex items-center justify-center mx-auto group-hover:bg-gradient-to-r group-hover:${item.hoverGradient} transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                    <span className="text-4xl filter drop-shadow-sm">{item.icon}</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 to-blue-200 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-6 group-hover:text-gray-700 transition-colors duration-200">
                  {item.description}
                </p>
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${item.gradient} text-white px-6 py-3 rounded-2xl font-semibold group-hover:bg-gradient-to-r group-hover:${item.hoverGradient} transition-all duration-200 shadow-lg`}>
                  Get Started
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Documents Section */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">📄</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Your Documents</h2>
                  <p className="text-gray-600">Manage and process your uploaded tax documents</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold flex items-center gap-2"
              >
                <span>📤</span>
                Upload New Document
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📁</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No documents yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Upload your first tax document to get started with AI-powered tax filing!
                </p>
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold text-lg"
                >
                  <span>🚀</span>
                  Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {documents.map((document, index) => (
                  <div 
                    key={document.id} 
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transform hover:scale-105 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-white text-xl">
                          {document.file_type?.toLowerCase().includes('pdf') ? '📄' : 
                           document.file_type?.toLowerCase().includes('image') ? '🖼️' : 
                           document.file_type?.toLowerCase().includes('doc') ? '📝' : '📎'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                          {document.filename || 'Unknown File'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {document.file_type || 'Unknown Type'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📅 Uploaded:</span> {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : 'Unknown'}
                      </p>
                      {document.file_size && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">📏 Size:</span> {(document.file_size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    
                    {document.ocr_text ? (
                      <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-600">✅</span>
                          <p className="text-sm font-semibold text-green-900">AI-Ready Document</p>
                        </div>
                        <p className="text-xs text-green-700">Text extracted and ready for processing</p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-amber-600">⚠️</span>
                          <p className="text-sm font-semibold text-amber-900">Manual Processing Available</p>
                        </div>
                        <p className="text-xs text-amber-700">No text extracted - use manual entry option</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {document.file_url && (
                        <a 
                          href={document.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm text-center rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                        >
                          👁️ View
                        </a>
                      )}
                      
                      <button 
                        onClick={() => openManualEntryForDocument(document)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                      >
                        📝 Process
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteDocument(document.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white text-sm rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 font-medium"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Enhanced Info Box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl">💡</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900 mb-3">How Smart Filing Works</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Upload W-2, 1099, 1098, and other tax documents
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        AI extracts data automatically when possible
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Manual entry option for maximum flexibility
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Automatic tax return creation and updates
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Review and edit before final submission
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Professional PDF generation and download
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Tax Returns Section */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">💼</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Your Tax Returns</h2>
                  <p className="text-gray-600">Track and manage all your tax filings</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold flex items-center gap-2"
                >
                  <span>🤖</span>
                  Smart Filing
                </button>
                <button 
                  onClick={navigateToCreateTaxReturn} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold flex items-center gap-2"
                >
                  <span>📝</span>
                  Manual Filing
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 text-lg">Loading your tax returns...</p>
              </div>
            ) : taxReturns.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to file your taxes?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Choose between AI-powered smart filing or traditional manual filing
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setShowUploadForm(true)} 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold text-lg"
                  >
                    <span>🤖</span>
                    Smart Filing
                  </button>
                  <button 
                    onClick={navigateToCreateTaxReturn} 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold text-lg"
                  >
                    <span>📝</span>
                    Manual Filing
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {taxReturns.slice(0, 4).map((taxReturn, index) => (
                  <div 
                    key={taxReturn.id} 
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          Tax Year {taxReturn.tax_year}
                        </h3>
                        <p className="text-gray-600">Filed on {new Date(taxReturn.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          taxReturn.status === 'draft' 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                            : 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                        }`}>
                          {taxReturn.status.toUpperCase()}
                        </span>
                        {taxReturn.auto_generated && (
                          <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-purple-400 to-purple-500 text-white font-semibold">
                            🤖 AI
                          </span>
                        )}
                      </div>
                    </div>

                    {taxReturn.auto_generated && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                        <p className="text-sm font-medium text-purple-900">
                          🤖 AI-generated from: {taxReturn.source_document || 'uploaded documents'}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: "Income", value: `${(taxReturn.income || 0).toLocaleString()}`, icon: "💰" },
                        { label: "Deductions", value: `${(taxReturn.deductions || 0).toLocaleString()}`, icon: "📋" },
                        { label: "Tax Owed", value: `${(taxReturn.tax_owed || 0).toFixed(2)}`, icon: "🧾" },
                        { label: "Withholdings", value: `${(taxReturn.withholdings || 0).toFixed(2)}`, icon: "🏦" }
                      ].map((item, i) => (
                        <div key={i} className="text-center p-3 bg-white/60 rounded-xl">
                          <div className="text-lg mb-1">{item.icon}</div>
                          <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                          <p className="text-sm font-bold text-gray-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-6 p-4 rounded-2xl border-2 border-dashed bg-gradient-to-r from-gray-50 to-white">
                      {(taxReturn.refund_amount || 0) > 0 ? (
                        <div className="text-center">
                          <div className="text-2xl mb-2">💰</div>
                          <p className="text-green-700 font-bold text-lg">
                            Refund: ${(taxReturn.refund_amount || 0).toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-2xl mb-2">💸</div>
                          <p className="text-red-700 font-bold text-lg">
                            Amount Owed: ${(taxReturn.amount_owed || 0).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => window.location.href = `/tax-returns/view/${taxReturn.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium"
                      >
                        👁️ View
                      </button>
                      {taxReturn.status === 'draft' && (
                        <button 
                          onClick={() => window.location.href = `/tax-returns/edit/${taxReturn.id}`}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      <button 
                        onClick={() => downloadTaxReturn(taxReturn)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                      >
                        📥
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modern Summary Stats */}
        {!showTaxForm && !showUploadForm && !showManualEntry && taxReturns.length > 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Tax Summary</h2>
                <p className="text-gray-600">Your complete tax filing overview</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Returns",
                  value: taxReturns.length,
                  icon: "📄",
                  gradient: "from-blue-400 to-blue-600"
                },
                {
                  title: "Total Refunds",
                  value: `${taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0).toFixed(2)}`,
                  icon: "💰",
                  gradient: "from-green-400 to-emerald-600"
                },
                {
                  title: "Total Income",
                  value: `${taxReturns.reduce((sum, tr) => sum + (tr.income || 0), 0).toLocaleString()}`,
                  icon: "📈",
                  gradient: "from-gray-400 to-gray-600"
                },
                {
                  title: "AI Generated",
                  value: taxReturns.filter(tr => tr.auto_generated).length,
                  icon: "🤖",
                  gradient: "from-purple-400 to-indigo-600"
                }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">{stat.title}</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
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
      `}</style>
    </div>
  );
}

export default Dashboard;
