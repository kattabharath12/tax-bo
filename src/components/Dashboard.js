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
        
        // Wait for potential OCR processing
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
                
                // Pre-fill document type based on filename
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
    
    // Pre-fill document type
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug Console */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-6 font-mono text-xs max-h-40 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">🐛 Debug Console</h3>
            <button 
              onClick={() => setDebugInfo('')}
              className="text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{debugInfo || 'Debug information will appear here...'}</pre>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name}! 👋</h1>
              <p className="text-gray-600 mt-1">Upload documents and create tax returns automatically!</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Auto Filing:</label>
                <button
                  onClick={() => setAutoFilingEnabled(!autoFilingEnabled)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${
                    autoFilingEnabled 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {autoFilingEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {processingDocument && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Processing Document</h3>
                <p className="text-blue-700">Uploading and analyzing your document...</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Tax Data Entry Form */}
        {showManualEntry && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enter Tax Information
              {currentDocument && ` for ${currentDocument.filename}`}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Since OCR text extraction isn't available, please manually enter the tax information from your uploaded document.
              </p>
            </div>

            <form onSubmit={handleManualTaxEntry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={manualTaxData.document_type}
                    onChange={(e) => setManualTaxData(prev => ({...prev, document_type: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="w2">W-2 (Wage Statement)</option>
                    <option value="1099">1099 (Miscellaneous Income)</option>
                    <option value="1098">1098 (Mortgage Interest)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Year
                  </label>
                  <select
                    value={manualTaxData.tax_year}
                    onChange={(e) => setManualTaxData(prev => ({...prev, tax_year: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income/Wages ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.income}
                    onChange={(e) => setManualTaxData(prev => ({...prev, income: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Federal Tax Withheld ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.withholdings}
                    onChange={(e) => setManualTaxData(prev => ({...prev, withholdings: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8500.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductions ($) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualTaxData.deductions}
                    onChange={(e) => setManualTaxData(prev => ({...prev, deductions: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12550 (Leave blank for standard deduction)"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualEntry(false);
                    setCurrentDocument(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Create Tax Return
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tax Form */}
        {showTaxForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <TaxForm onSuccess={handleTaxFormSuccess} />
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Tax Documents</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Auto Filing {autoFilingEnabled ? 'Enabled' : 'Disabled'}:</strong> 
                {autoFilingEnabled 
                  ? ' Upload documents and we\'ll help you create tax returns!' 
                  : ' Upload documents for storage only.'
                }
              </p>
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose File
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  className="hidden"
                  disabled={processingDocument}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX, TXT<br />
                <strong>Supported forms:</strong> W-2, 1099, 1098, and other tax documents
              </p>
            </div>
            <button 
              onClick={() => setShowUploadForm(false)} 
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Tax Filing</h3>
              <p className="text-gray-600 mb-4">Start your tax return manually</p>
              <button 
                onClick={navigateToCreateTaxReturn} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Start Manual Filing
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Tax Filing</h3>
              <p className="text-gray-600 mb-4">Upload documents and we'll help create your tax return!</p>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Upload & Create Return
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Returns</h3>
              <p className="text-gray-600 mb-4">See all your tax returns</p>
              <button 
                onClick={navigateToTaxReturns} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                View Returns
              </button>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Uploaded Documents</h2>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Upload New Document
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
                <p className="text-gray-600 mb-4">Upload your tax documents to get started!</p>
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {documents.map((document) => (
                  <div key={document.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center mb-3">
                      <div className="text-2xl mr-3">📄</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.filename || 'Unknown File'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {document.file_type || 'Unknown Type'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">
                        <strong>Uploaded:</strong> {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    {document.ocr_text ? (
                      <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium text-green-900">✅ OCR Text Available</p>
                      </div>
                    ) : (
                      <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-medium text-yellow-900">⚠️ No OCR Text</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      {document.file_url && (
                        <a 
                          href={document.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm text-center rounded hover:bg-blue-700 transition duration-200"
                        >
                          View
                        </a>
                      )}
                      
                      <button 
                        onClick={() => openManualEntryForDocument(document)}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition duration-200"
                      >
                        📝 Enter Tax Data
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteDocument(document.id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition duration-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 How It Works:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Upload your tax documents (W-2, 1099, etc.)</li>
                <li>• Click "📝 Enter Tax Data" to manually input tax information</li>
                <li>• We'll automatically create/update your tax return</li>
                <li>• Review and download your completed tax return</li>
                <li>• Works even without OCR text extraction!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tax Returns History */}
        {!showTaxForm && !showUploadForm && !showManualEntry && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Tax Returns</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Upload & Create Return
                </button>
                <button 
                  onClick={navigateToCreateTaxReturn} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Manual Filing
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading tax returns...</p>
              </div>
            ) : taxReturns.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tax returns found</h3>
                <p className="text-gray-600 mb-4">Upload documents or start filing manually!</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowUploadForm(true)} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    Upload Documents
                  </button>
                  <button 
                    onClick={navigateToCreateTaxReturn} 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Manual Filing
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {taxReturns.slice(0, 4).map((taxReturn) => (
                  <div key={taxReturn.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Tax Year: {taxReturn.tax_year}</h3>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          taxReturn.status === 'draft' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {taxReturn.status.toUpperCase()}
                        </span>
                        {taxReturn.auto_generated && (
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            🤖 AUTO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Auto-generated indicator */}
                    {taxReturn.auto_generated && (
                      <div className="mb-3 p-2 bg-purple-50 rounded border border-purple-200">
                        <p className="text-xs font-medium text-purple-900">
                          🤖 Auto-generated from: {taxReturn.source_document || 'uploaded documents'}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Income</p>
                        <p className="font-semibold">${taxReturn.income?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Deductions</p>
                        <p className="font-semibold">${taxReturn.deductions?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tax Owed</p>
                        <p className="font-semibold">${taxReturn.tax_owed?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Withholdings</p>
                        <p className="font-semibold">${taxReturn.withholdings?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 p-3 rounded-lg border-2 border-dashed">
                      {(taxReturn.refund_amount || 0) > 0 ? (
                        <p className="text-green-700 font-bold text-center">
                          💰 Refund: ${taxReturn.refund_amount?.toFixed(2) || '0.00'}
                        </p>
                      ) : (
                        <p className="text-red-700 font-bold text-center">
                          💸 Amount Owed: ${taxReturn.amount_owed?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => window.location.href = `/tax-returns/view/${taxReturn.id}`}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition duration-200"
                      >
                        View Details
                      </button>
                      {taxReturn.status === 'draft' && (
                        <button 
                          onClick={() => window.location.href = `/tax-returns/edit/${taxReturn.id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200"
                        >
                          Continue
                        </button>
                      )}
                      <button 
                        onClick={() => downloadTaxReturn(taxReturn)}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition duration-200"
                      >
                        📥
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      Created: {new Date(taxReturn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!showTaxForm && !showUploadForm && !showManualEntry && taxReturns.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tax Summary</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Returns</h3>
                <p className="text-3xl font-bold text-blue-600">{taxReturns.length}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Total Refunds</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
                <p className="text-3xl font-bold text-gray-600">
                  ${taxReturns.reduce((sum, tr) => sum + (tr.income || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">Auto Generated</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {taxReturns.filter(tr => tr.auto_generated).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
