import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaxForm from './TaxForm';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';

function Dashboard() {
  const { user, logout } = useAuth();
  const [taxReturns, setTaxReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchTaxReturns();
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
      await apiService.uploadDocument(formData);
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

 const downloadTaxReturn = async (taxReturn) => {
  try {
    // Debug: Log the complete tax return data
    console.log('=== DEBUG: Tax Return Data ===');
    console.log('Full taxReturn object:', taxReturn);
    console.log('taxReturn keys:', Object.keys(taxReturn || {}));
    console.log('taxReturn.tax_year:', taxReturn?.tax_year);
    console.log('taxReturn.income:', taxReturn?.income);
    console.log('taxReturn.deductions:', taxReturn?.deductions);
    console.log('taxReturn.tax_owed:', taxReturn?.tax_owed);
    console.log('taxReturn.withholdings:', taxReturn?.withholdings);
    console.log('taxReturn.refund_amount:', taxReturn?.refund_amount);
    console.log('taxReturn.amount_owed:', taxReturn?.amount_owed);
    console.log('taxReturn.status:', taxReturn?.status);
    console.log('taxReturn.id:', taxReturn?.id);
    console.log('=== END DEBUG ===');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TAX RETURN SUMMARY', 105, 30, { align: 'center' });
    
    // Add debug info to PDF
    doc.setFontSize(10);
    doc.text(`DEBUG - Data Keys: ${Object.keys(taxReturn || {}).join(', ')}`, 20, 50);
    
    // Add tax year
    doc.setFontSize(16);
    doc.text(`Tax Year: ${taxReturn?.tax_year || 'N/A'}`, 20, 70);
    
    // Add taxpayer info
    doc.setFontSize(12);
    let yPosition = 90;
    
    doc.text(`Taxpayer: ${user?.full_name || 'N/A'}`, 20, yPosition);
    yPosition += 10;
    
    if (taxReturn?.filing_status) {
      const filingStatus = String(taxReturn.filing_status).replace(/_/g, ' ').toUpperCase();
      doc.text(`Filing Status: ${filingStatus}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Add section header
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('INCOME INFORMATION', 20, yPosition);
    yPosition += 15;
    
    // Income details
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    const income = Number(taxReturn?.income) || 0;
    const deductions = Number(taxReturn?.deductions) || 0;
    const taxOwed = Number(taxReturn?.tax_owed) || 0;
    const withholdings = Number(taxReturn?.withholdings) || 0;
    const refundAmount = Number(taxReturn?.refund_amount) || 0;
    const amountOwed = Number(taxReturn?.amount_owed) || 0;
    
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
    
    // Result section
    yPosition += 20;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    
    if (refundAmount > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text(`REFUND AMOUNT: $${refundAmount.toFixed(2)}`, 20, yPosition);
    } else {
      doc.setTextColor(128, 0, 0);
      doc.text(`AMOUNT OWED: $${amountOwed.toFixed(2)}`, 20, yPosition);
    }
    
    // Reset color
    doc.setTextColor(0, 0, 0);
    
    // Footer
    yPosition += 30;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Status: ${(taxReturn?.status || 'N/A').toUpperCase()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    
    // Add raw data for debugging
    yPosition += 20;
    doc.setFontSize(8);
    doc.text(`Raw Data: ${JSON.stringify(taxReturn || {}).substring(0, 100)}...`, 20, yPosition);
    
    // Save the PDF
    const filename = `debug_tax_return_${Date.now()}.pdf`;
    doc.save(filename);
    
    alert('Debug PDF downloaded! Check console for data details.');
    
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
              <p className="text-gray-600 mt-1">Ready to manage your taxes with advanced filing status support?</p>
            </div>
            <div className="flex gap-3 flex-wrap">
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
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">File New Return</h3>
              <p className="text-gray-600 mb-4">Start your tax return for 2024 with filing status support</p>
              <button 
                onClick={navigateToCreateTaxReturn} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Start Filing
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-gray-600 mb-4">Upload W-2, 1099, and other forms with OCR processing</p>
              <button 
                onClick={() => setShowUploadForm(true)} 
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Upload Files
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition duration-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Returns</h3>
              <p className="text-gray-600 mb-4">See all your tax returns with filing status details</p>
              <button 
                onClick={navigateToTaxReturns} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                View Returns
              </button>
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
                <p className="text-gray-600 mb-4">Start your first return with our advanced filing status support!</p>
                <button 
                  onClick={navigateToCreateTaxReturn} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  File Your First Return
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {taxReturns.slice(0, 4).map((taxReturn) => (
                  <div key={taxReturn.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Tax Year: {taxReturn.tax_year}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        taxReturn.status === 'draft' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {taxReturn.status.toUpperCase()}
                      </span>
                    </div>

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
                        onClick={() => downloadTaxReturn(taxReturn.id)}
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
                <h3 className="text-lg font-semibold text-purple-900">Avg. Refund</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${taxReturns.length > 0 ? 
                    (taxReturns.reduce((sum, tr) => sum + (tr.refund_amount || 0), 0) / taxReturns.length).toFixed(2) : 
                    '0.00'
                  }
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
