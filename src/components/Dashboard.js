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
  const [autoFilingEnabled, setAutoFilingEnabled] = useState(true);
  const [debugInfo, setDebugInfo] = useState(''); // Debug information

  useEffect(() => {
    fetchTaxReturns();
    fetchDocuments();
  }, []);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
    console.log(`[AUTO-FILING DEBUG] ${message}`);
  };

  const fetchTaxReturns = async () => {
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
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments();
      setDocuments(response);
      addDebugInfo(`Fetched ${response.length} documents`);
      
      // Debug: Log document structure
      if (response.length > 0) {
        addDebugInfo(`Sample document structure: ${JSON.stringify(Object.keys(response[0]))}`);
        addDebugInfo(`Has OCR text: ${!!response[0].ocr_text}`);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      addDebugInfo(`Error fetching documents: ${error.message}`);
      setDocuments([]);
    }
  };

  // Enhanced data extraction with more debugging
  const extractTaxDataFromDocument = (document) => {
    addDebugInfo(`Starting extraction for document: ${document.filename}`);
    
    const ocrText = document.ocr_text || '';
    const documentType = document.document_type || '';
    
    addDebugInfo(`Document type: ${documentType}`);
    addDebugInfo(`OCR text length: ${ocrText.length}`);
    addDebugInfo(`OCR text preview: ${ocrText.substring(0, 200)}...`);
    
    if (!ocrText) {
      addDebugInfo('No OCR text found - cannot extract tax data');
      return null;
    }
    
    const taxData = {
      tax_year: new Date().getFullYear() - 1,
      income: 0,
      withholdings: 0,
      deductions: 0,
      filing_status: 'single',
      document_source: document.filename || 'uploaded_document'
    };

    // More aggressive text analysis
    const text = ocrText.toLowerCase();
    
    // Look for W-2 indicators
    if (text.includes('w-2') || text.includes('wage') || text.includes('employer') || documentType === 'w2') {
      addDebugInfo('Detected as W-2 form');
      
      // Extract wages (box 1)
      const wages = extractAmountFromText(ocrText, [
        'wages', 'tips', 'other compensation', 'box 1', 'wages tips',
        'federal wages', 'gross wages', 'total wages'
      ]);
      
      // Extract federal withholding (box 2)
      const withholdings = extractAmountFromText(ocrText, [
        'federal income tax withheld', 'box 2', 'federal tax',
        'income tax withheld', 'federal withholding', 'tax withheld'
      ]);
      
      taxData.income = wages;
      taxData.withholdings = withholdings;
      
      addDebugInfo(`W-2 extracted - Income: $${wages}, Withholdings: $${withholdings}`);
    }
    
    // Look for 1099 indicators
    else if (text.includes('1099') || text.includes('miscellaneous income') || documentType === '1099') {
      addDebugInfo('Detected as 1099 form');
      
      const income = extractAmountFromText(ocrText, [
        'nonemployee compensation', 'box 1', 'miscellaneous income',
        'income', 'compensation', 'amount paid'
      ]);
      
      const backupWithholding = extractAmountFromText(ocrText, [
        'backup withholding', 'box 4', 'federal income tax withheld'
      ]);
      
      taxData.income = income;
      taxData.withholdings = backupWithholding;
      
      addDebugInfo(`1099 extracted - Income: $${income}, Backup withholding: $${backupWithholding}`);
    }
    
    // Generic fallback - look for any monetary amounts
    else {
      addDebugInfo('Generic document - searching for any financial amounts');
      
      // Find all dollar amounts in the document
      const allAmounts = findAllDollarAmounts(ocrText);
      addDebugInfo(`Found ${allAmounts.length} dollar amounts: ${allAmounts.join(', ')}`);
      
      if (allAmounts.length > 0) {
        // Use the largest amount as potential income
        taxData.income = Math.max(...allAmounts);
        addDebugInfo(`Using largest amount as income: $${taxData.income}`);
      }
    }

    // Extract year
    const year = extractYearFromText(ocrText);
    if (year) {
      taxData.tax_year = year;
      addDebugInfo(`Extracted tax year: ${year}`);
    }

    addDebugInfo(`Final extracted data: ${JSON.stringify(taxData)}`);
    return taxData;
  };

  // Enhanced amount extraction
  const extractAmountFromText = (text, keywords) => {
    addDebugInfo(`Searching for keywords: ${keywords.join(', ')}`);
    
    const lines = text.split('\n');
    let foundAmounts = [];
    
    for (const keyword of keywords) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          addDebugInfo(`Found keyword "${keyword}" in line: ${line.trim()}`);
          
          // Look in current line and next few lines
          const searchLines = lines.slice(i, i + 3).join(' ');
          const amounts = findAllDollarAmounts(searchLines);
          
          if (amounts.length > 0) {
            foundAmounts.push(...amounts);
            addDebugInfo(`Found amounts for "${keyword}": ${amounts.join(', ')}`);
          }
        }
      }
    }
    
    if (foundAmounts.length > 0) {
      const maxAmount = Math.max(...foundAmounts);
      addDebugInfo(`Returning max amount: $${maxAmount}`);
      return maxAmount;
    }
    
    addDebugInfo('No amounts found for keywords');
    return 0;
  };

  // Helper to find all dollar amounts in text
  const findAllDollarAmounts = (text) => {
    // Look for various dollar amount patterns
    const patterns = [
      /\$[\d,]+\.?\d*/g,           // $1,234.56
      /[\d,]+\.?\d*\s*dollars?/gi, // 1234.56 dollars
      /USD\s*[\d,]+\.?\d*/gi,      // USD 1234.56
      /\b[\d,]+\.\d{2}\b/g,        // 1234.56 (with 2 decimal places)
      /\b[\d,]{4,}\b/g             // 1234 or larger (no decimals)
    ];
    
    let amounts = [];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      for (const match of matches) {
        const cleaned = match.replace(/[$,USD\s]/gi, '').replace(/dollars?/gi, '');
        const number = parseFloat(cleaned);
        
        // Only include reasonable amounts (between $1 and $10M)
        if (!isNaN(number) && number >= 1 && number <= 10000000) {
          amounts.push(number);
        }
      }
    }
    
    return amounts;
  };

  const extractYearFromText = (text) => {
    const yearMatch = text.match(/20(1[5-9]|2[0-5])/g); // Years 2015-2025
    if (yearMatch && yearMatch.length > 0) {
      const years = yearMatch.map(y => parseInt(y));
      return Math.max(...years);
    }
    return null;
  };

  const createAutoTaxReturn = async (extractedData) => {
    try {
      setProcessingDocument(true);
      addDebugInfo('Starting auto tax return creation...');
      
      console.log('Creating auto tax return with data:', extractedData);
      
      // Check if a tax return for this year already exists
      const existingReturn = taxReturns.find(tr => tr.tax_year === extractedData.tax_year);
      
      if (existingReturn) {
        addDebugInfo(`Found existing return for ${extractedData.tax_year}, updating...`);
        
        const updatedData = {
          ...existingReturn,
          income: (existingReturn.income || 0) + extractedData.income,
          withholdings: (existingReturn.withholdings || 0) + extractedData.withholdings,
          deductions: Math.max(existingReturn.deductions || 0, extractedData.deductions),
          updated_from_document: true
        };
        
        const response = await apiService.updateTaxReturn(existingReturn.id, updatedData);
        addDebugInfo('Successfully updated existing tax return');
        
        alert(`Tax return for ${extractedData.tax_year} updated!\nIncome: +$${extractedData.income.toLocaleString()}\nWithholdings: +$${extractedData.withholdings.toLocaleString()}`);
        
      } else {
        addDebugInfo(`Creating new return for ${extractedData.tax_year}...`);
        
        const newTaxReturn = {
          tax_year: extractedData.tax_year,
          income: extractedData.income,
          withholdings: extractedData.withholdings,
          deductions: Math.max(extractedData.deductions, 12550),
          filing_status: extractedData.filing_status,
          status: 'draft',
          auto_generated: true,
          source_document: extractedData.document_source
        };
        
        const response = await apiService.createTaxReturn(newTaxReturn);
        addDebugInfo('Successfully created new tax return');
        
        alert(`New tax return created for ${extractedData.tax_year}!\nIncome: $${extractedData.income.toLocaleString()}\nWithholdings: $${extractedData.withholdings.toLocaleString()}`);
      }
      
      await fetchTaxReturns();
      
    } catch (error) {
      console.error('Error creating auto tax return:', error);
      addDebugInfo(`Error creating tax return: ${error.message}`);
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
      addDebugInfo(`Uploading file: ${file.name} (${file.type})`);
      
      const uploadResponse = await apiService.uploadDocument(formData);
      addDebugInfo(`Upload successful. Response: ${JSON.stringify(uploadResponse, null, 2)}`);
      
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      
      await fetchDocuments();
      
      if (autoFilingEnabled) {
        addDebugInfo('Auto filing enabled - processing document...');
        
        // Wait for OCR processing
        setTimeout(async () => {
          try {
            // Get the uploaded document with OCR text
            const documents = await apiService.getDocuments();
            const latestDocument = documents[0]; // Assuming newest first
            
            addDebugInfo(`Latest document: ${JSON.stringify(latestDocument, null, 2)}`);
            
            if (latestDocument && latestDocument.ocr_text) {
              const extractedData = extractTaxDataFromDocument(latestDocument);
              
              if (extractedData && (extractedData.income > 0 || extractedData.withholdings > 0)) {
                const shouldAutoFile = window.confirm(
                  `Document analysis complete!\n\n` +
                  `Detected Income: $${extractedData.income.toLocaleString()}\n` +
                  `Detected Withholdings: $${extractedData.withholdings.toLocaleString()}\n` +
                  `Tax Year: ${extractedData.tax_year}\n\n` +
                  `Would you like to automatically create/update your tax return?\n\n` +
                  `(Check console for detailed extraction log)`
                );
                
                if (shouldAutoFile) {
                  await createAutoTaxReturn(extractedData);
                }
              } else {
                addDebugInfo('No significant tax data found');
                alert('No tax data could be extracted from this document. Please check the debug console for details.');
              }
            } else {
              addDebugInfo('No OCR text available');
              alert('Document uploaded but no text could be extracted. OCR processing may have failed.');
            }
          } catch (error) {
            addDebugInfo(`Error in processing: ${error.message}`);
            console.error('Error in auto filing process:', error);
          } finally {
            setProcessingDocument(false);
          }
        }, 3000); // Wait 3 seconds for OCR
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

  const processDocumentForTaxFiling = async (document) => {
    if (!document.ocr_text) {
      alert('This document has no OCR text available for processing.');
      return;
    }

    try {
      setProcessingDocument(true);
      addDebugInfo(`Manual processing of document: ${document.filename}`);
      
      const extractedData = extractTaxDataFromDocument(document);
      
      if (extractedData && (extractedData.income > 0 || extractedData.withholdings > 0)) {
        const shouldProcess = window.confirm(
          `Process this document for tax filing?\n\n` +
          `Detected Income: $${extractedData.income.toLocaleString()}\n` +
          `Detected Withholdings: $${extractedData.withholdings.toLocaleString()}\n` +
          `Tax Year: ${extractedData.tax_year}\n\n` +
          `Check console for detailed extraction log.`
        );
        
        if (shouldProcess) {
          await createAutoTaxReturn(extractedData);
        }
      } else {
        alert('No significant tax data found in this document. Check console for details.');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Failed to process document for tax filing.');
    } finally {
      setProcessingDocument(false);
    }
  };

  // Your existing downloadTaxReturn function...
  const downloadTaxReturn = async (taxReturn) => {
    // ... (keep your existing PDF function)
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
            <h3 className="text-white font-bold">🐛 Auto Filing Debug Console</h3>
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

        {/* Rest of your existing JSX... */}
        {/* Upload Form, Quick Actions, Documents, Tax Returns, etc. */}
        
      </div>
    </div>
  );
}

export default Dashboard;
