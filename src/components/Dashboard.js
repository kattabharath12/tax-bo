import React, { useState, useEffect } from 'react';
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
  const [processingDocument, setProcessingDocument] = useState(false);
  const [autoFilingEnabled, setAutoFilingEnabled] = useState(true); // Toggle for auto filing

  useEffect(() => {
    fetchTaxReturns();
    fetchDocuments();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      const response = await apiService.getTaxReturns();
      setTaxReturns(response);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments();
      setDocuments(response);
      console.log('Documents fetched:', response);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  // Function to extract tax data from document OCR text
  const extractTaxDataFromDocument = (document) => {
    const ocrText = document.ocr_text || '';
    const documentType = document.document_type || '';
    
    console.log('Extracting tax data from:', documentType, ocrText.substring(0, 200));
    
    // Initialize tax data object
    const taxData = {
      tax_year: new Date().getFullYear() - 1, // Default to previous year
      income: 0,
      withholdings: 0,
      deductions: 0,
      filing_status: 'single',
      document_source: document.filename || 'uploaded_document'
    };

    // Extract data based on document type
    if (documentType === 'w2' || ocrText.toLowerCase().includes('w-2') || ocrText.toLowerCase().includes('wage')) {
      // Extract W-2 data
      taxData.income = extractAmountFromText(ocrText, ['wages', 'salary', 'income', 'box 1']);
      taxData.withholdings = extractAmountFromText(ocrText, ['federal', 'withholding', 'withheld', 'box 2']);
      taxData.tax_year = extractYearFromText(ocrText) || taxData.tax_year;
      
    } else if (documentType === '1099' || ocrText.toLowerCase().includes('1099')) {
      // Extract 1099 data
      taxData.income = extractAmountFromText(ocrText, ['income', 'earnings', 'amount', 'box 1']);
      taxData.withholdings = extractAmountFromText(ocrText, ['backup', 'withholding', 'box 4']);
      taxData.tax_year = extractYearFromText(ocrText) || taxData.tax_year;
      
    } else if (documentType === '1098' || ocrText.toLowerCase().includes('1098')) {
      // Extract 1098 mortgage interest data
      const mortgageInterest = extractAmountFromText(ocrText, ['interest', 'paid', 'box 1']);
      taxData.deductions = mortgageInterest; // This would be itemized deduction
      taxData.tax_year = extractYearFromText(ocrText) || taxData.tax_year;
      
    } else {
      // Generic document - try to find any financial amounts
      taxData.income = extractAmountFromText(ocrText, ['income', 'salary', 'wages', 'earnings']);
      taxData.withholdings = extractAmountFromText(ocrText, ['tax', 'withholding', 'withheld']);
      taxData.deductions = extractAmountFromText(ocrText, ['deduction', 'expense']);
    }

    return taxData;
  };

  // Helper function to extract monetary amounts from text
  const extractAmountFromText = (text, keywords) => {
    const lines = text.split('\n');
    
    for (const keyword of keywords) {
      for (const line of lines) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          // Look for dollar amounts in the line
          const amounts = line.match(/\$?[\d,]+\.?\d*/g);
          if (amounts) {
            // Return the largest amount found (assuming it's the main figure)
            const numericAmounts = amounts.map(amt => 
              parseFloat(amt.replace(/[$,]/g, '')) || 0
            );
            const maxAmount = Math.max(...numericAmounts);
            if (maxAmount > 0) return maxAmount;
          }
        }
      }
    }
    
    // Fallback: look for any dollar amount in the entire text
    const allAmounts = text.match(/\$[\d,]+\.?\d*/g);
    if (allAmounts && allAmounts.length > 0) {
      const amounts = allAmounts.map(amt => parseFloat(amt.replace(/[$,]/g, '')) || 0);
      return Math.max(...amounts);
    }
    
    return 0;
  };

  // Helper function to extract year from text
  const extractYearFromText = (text) => {
    const yearMatch = text.match(/20\d{2}/g);
    if (yearMatch && yearMatch.length > 0) {
      // Return the most recent year found
      const years = yearMatch.map(y => parseInt(y));
      return Math.max(...years);
    }
    return null;
  };

  // Function to automatically create tax return from document data
  const createAutoTaxReturn = async (extractedData) => {
    try {
      setProcessingDocument(true);
      
      console.log('Creating auto tax return with data:', extractedData);
      
      // Check if a tax return for this year already exists
      const existingReturn = taxReturns.find(tr => tr.tax_year === extractedData.tax_year);
      
      if (existingReturn) {
        // Update existing return by adding the new income/withholdings
        const updatedData = {
          ...existingReturn,
          income: (existingReturn.income || 0) + extractedData.income,
          withholdings: (existingReturn.withholdings || 0) + extractedData.withholdings,
          deductions: Math.max(existingReturn.deductions || 0, extractedData.deductions),
          updated_from_document: true
        };
        
        const response = await apiService.updateTaxReturn(existingReturn.id, updatedData);
        console.log('Updated existing tax return:', response);
        
        alert(`Tax return for ${extractedData.tax_year} updated with new document data!\nIncome: +$${extractedData.income.toLocaleString()}\nWithholdings: +$${extractedData.withholdings.toLocaleString()}`);
        
      } else {
        // Create new tax return
        const newTaxReturn = {
          tax_year: extractedData.tax_year,
          income: extractedData.income,
          withholdings: extractedData.withholdings,
          deductions: Math.max(extractedData.deductions, 12550), // Use standard deduction if higher
          filing_status: extractedData.filing_status,
          status: 'draft',
          auto_generated: true,
          source_document: extractedData.document_source
        };
        
        const response = await apiService.createTaxReturn(newTaxReturn);
        console.log('Created new auto tax return:', response);
        
        alert(`New tax return automatically created for ${extractedData.tax_year}!\nIncome: $${extractedData.income.toLocaleString()}\nWithholdings: $${extractedData.withholdings.toLocaleString()}\n\nPlease review and complete the filing.`);
      }
      
      // Refresh tax returns to show the new/updated data
      await fetchTaxReturns();
      
    } catch (error) {
      console.error('Error creating auto tax return:', error);
      alert('Failed to automatically create tax return. Please file manually.');
    } finally {
      setProcessingDocument(false);
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
      setProcessingDocument(true);
      
      // Upload document
      const uploadResponse = await apiService.uploadDocument(formData);
      console.log('Document uploaded:', uploadResponse);
      
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      
      // Refresh documents list
      await fetchDocuments();
      
      // If auto filing is enabled and document has OCR text, process it
      if (autoFilingEnabled && uploadResponse.ocr_text) {
        console.log('Auto filing enabled, processing document...');
        
        // Wait a moment for OCR processing to complete
        setTimeout(async () => {
          try {
            // Extract tax data from the uploaded document
            const extractedData = extractTaxDataFromDocument(uploadResponse);
            
            // Only auto-file if we extracted meaningful data
            if (extractedData.income > 0 || extractedData.withholdings > 0) {
              const shouldAutoFile = window.confirm(
                `Document analysis complete!\n\n` +
                `Detected Income: $${extractedData.income.toLocaleString()}\n` +
                `Detected Withholdings: $${extractedData.withholdings.toLocaleString()}\n` +
                `Tax Year: ${extractedData.tax_year}\n\n` +
                `Would you like to automatically create/update your tax return with this data?`
              );
              
              if (shouldAutoFile) {
                await createAutoTaxReturn(extractedData);
              }
            } else {
              console.log('No significant tax data found in document');
            }
          } catch (error) {
            console.error('Error in auto filing process:', error);
          } finally {
            setProcessingDocument(false);
          }
        }, 2000);
      } else {
        setProcessingDocument(false);
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
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

  // Function to manually trigger auto-filing for an existing document
  const processDocumentForTaxFiling = async (document) => {
    if (!document.ocr_text) {
      alert('This document has no OCR text available for processing.');
      return;
    }

    try {
      setProcessingDocument(true);
      
      const extractedData = extractTaxDataFromDocument(document);
      
      if (extractedData.income > 0 || extractedData.withholdings > 0) {
        const shouldProcess = window.confirm(
          `Process this document for tax filing?\n\n` +
          `Detected Income: $${extractedData.income.toLocaleString()}\n` +
          `Detected Withholdings: $${extractedData.withholdings.toLocaleString()}\n` +
          `Tax Year: ${extractedData.tax_year}`
        );
        
        if (shouldProcess) {
          await createAutoTaxReturn(extractedData);
        }
      } else {
        alert('No significant tax data found in this document.');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Failed to process document for tax filing.');
    } finally {
      setProcessingDocument(false);
    }
  };

  // Your existing downloadTaxReturn function stays the same...
  const downloadTaxReturn = async (taxReturn) => {
    try {
      if (typeof taxReturn === 'number' || typeof taxReturn === 'string') {
        alert('Error: Tax return data not available. Please refresh the page and try again.');
        console.error('Received ID instead of tax return object:', taxReturn);
        return;
      }

      if (!taxReturn || typeof taxReturn !== 'object') {
        alert('Error: Invalid tax return data. Please try again.');
        console.error('Invalid tax return data:', taxReturn);
        return;
      }

      console.log('Processing tax return:', taxReturn);

      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('TAX RETURN SUMMARY', 105, 30, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`Tax Year: ${taxReturn.tax_year || 'N/A'}`, 20, 50);
      
      doc.setFontSize(12);
      let yPosition = 70;
      
      doc.text(`Taxpayer: ${user?.full_name || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      
      if (taxReturn.filing_status) {
        const filingStatus = String(taxReturn.filing_status).replace(/_/g, ' ').toUpperCase();
        doc.text(`Filing Status: ${filingStatus}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (taxReturn.spouse_name) {
        doc.text(`Spouse Name: ${taxReturn.spouse_name}`, 20, yPosition);
        yPosition += 10;
      }
      
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('INCOME INFORMATION', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      const income = Number(taxReturn.income) || 0;
      const deductions = Number(taxReturn.deductions) || 0;
      const taxOwed = Number(taxReturn.tax_owed) || 0;
      const withholdings = Number(taxReturn.withholdings) || 0;
      const refundAmount = Number(taxReturn.refund_amount) || 0;
      const amountOwed = Number(taxReturn.amount_owed) || 0;
      
      doc.text(`Total Income: $${income.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Deductions: $${deductions.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Taxable Income: $${Math.max(0, income - deductions).toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('TAX CALCULATION', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Tax Owed: $${taxOwed.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Tax Withholdings: $${withholdings.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
      
      yPosition += 20;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      
      if (refundAmount > 0) {
        doc.setTextColor(0, 128, 0);
        doc.text(`REFUND AMOUNT: $${refundAmount.toFixed(2)}`, 20, yPosition);
      } else if (amountOwed > 0) {
        doc.setTextColor(128, 0, 0);
        doc.text(`AMOUNT OWED: $${amountOwed.toFixed(2)}`, 20, yPosition);
      } else {
        doc.setTextColor(0, 128, 0);
        doc.text(`NO TAX DUE`, 20, yPosition);
      }
      
      doc.setTextColor(0, 0, 0);
      
      yPosition += 30;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Status: ${(taxReturn.status || 'DRAFT').toUpperCase()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Created: ${taxReturn.created_at ? new Date(taxReturn.created_at).toLocaleDateString() : 'N/A'}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      
      // Add auto-generated indicator if applicable
      if (taxReturn.auto_generated) {
        yPosition += 10;
        doc.text(`Auto-generated from: ${taxReturn.source_document || 'uploaded documents'}`, 20, yPosition);
      }
      
      yPosition += 20;
      doc.setFontSize(8);
      doc.text('Generated by TaxBox.AI - For informational purposes only', 20, yPosition);
      doc.text('Please consult with a tax professional for official tax filing.', 20, yPosition + 10);
      
      const safeId = taxReturn.id || Date.now();
      const safeYear = taxReturn.tax_year || 'unknown';
      const filename = `tax_return_${safeYear}_${safeId}.pdf`;
      
      doc.save(filename);
      
      console.log('PDF generated successfully:', filename);
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name}! 👋</h1>
              <p className="text-gray-600 mt-1">Upload documents and we'll automatically file your taxes!</p>
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
                onClick={() => setShowTaxForm(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Dashboard
              </button>
              <button 
                onClick={navigateToTaxReturns} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Tax Returns
              </button>
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
                <p className="text-blue-700">Analyzing your document and extracting tax information...</p>
              </div>
            </div>
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
                  ? ' We\'ll automatically analyze your documents and create/update tax returns!' 
                  : ' Upload documents for manual processing only.'
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
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  disabled={processingDocument}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX<br />
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
        {!showTaxForm && !showUploadForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Tax Filing</h3>
              <p className="text-gray-600 mb-4">Start your tax return manually for complete control</p>
              <button 
                onClick={navigateToCreateTaxReturn} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Start Manual Filing
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Tax Filing</h3>
              <p className="text-gray-600 mb-4">Upload documents and we'll file your taxes automatically!</p>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Upload & Auto File
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Returns</h3>
              <p className="text-gray-600 mb-4">See all your tax returns and their status</p>
              <button 
                onClick={navigateToTaxReturns} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                View Returns
              </button>
            </div>
          </div>
        )}

        {/* Uploaded Documents Section */}
        {!showTaxForm && !showUploadForm && (
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
                <p className="text-gray-600 mb-4">Upload your tax documents to get started with auto filing!</p>
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
                      <div className="text-2xl mr-3">
                        {document.file_type?.toLowerCase().includes('pdf') ? '📄' : 
                         document.file_type?.toLowerCase().includes('image') ? '🖼️' : 
                         document.file_type?.toLowerCase().includes('doc') ? '📝' : '📎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.filename || document.original_name || 'Unknown File'}
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
                      {document.file_size && (
                        <p className="text-xs text-gray-600">
                          <strong>Size:</strong> {(document.file_size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    
                    {/* OCR Results */}
                    {document.ocr_text && (
                      <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">Extracted Text (OCR):</p>
                        <p className="text-xs text-blue-700">
                          {document.ocr_text.substring(0, 100)}
                          {document.ocr_text.length > 100 ? '...' : ''}
                        </p>
                      </div>
                    )}
                    
                    {/* Document Category */}
                    {document.document_type && (
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {document.document_type.replace('_', ' ').toUpperCase()}
                        </span>
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
                      
                      {/* Auto Filing Button */}
                      {document.ocr_text && (
                        <button 
                          onClick={() => processDocumentForTaxFiling(document)}
                          disabled={processingDocument}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition duration-200 disabled:opacity-50"
                        >
                          🤖 Auto File
                        </button>
                      )}
                      
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
            
            {/* Auto Filing Info */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">🤖 Auto Filing Features:</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Automatically detects W-2, 1099, and 1098 forms</li>
                <li>• Extracts income, withholdings, and deduction data</li>
                <li>• Creates or updates tax returns automatically</li>
                <li>• Uses OCR technology to read document text</li>
                <li>• You can review and edit before final submission</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tax Returns History */}
        {!showTaxForm && !showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Tax Returns</h2>
              <div className="flex gap-3">
                <button 
                  onClick={navigateToCreateTaxReturn} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  File New Return
                </button>
                <button 
                  onClick={navigateToTaxReturns} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  View All
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
                <p className="text-gray-600 mb-4">Upload documents for auto filing or start manually!</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowUploadForm(true)} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    Upload for Auto Filing
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

                    {/* Display Filing Status */}
                    <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">
                        Filing Status: {taxReturn.filing_status ? 
                          taxReturn.filing_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          'Not specified'
                        }
                      </p>
                      {taxReturn.spouse_name && (
                        <p className="text-sm text-blue-700">Spouse: {taxReturn.spouse_name}</p>
                      )}
                      {taxReturn.qualifying_person_name && (
                        <p className="text-sm text-blue-700">Qualifying Person: {taxReturn.qualifying_person_name}</p>
                      )}
                    </div>
                    
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
        {!showTaxForm && !showUploadForm && taxReturns.length > 0 && (
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
