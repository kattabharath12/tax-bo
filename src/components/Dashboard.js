import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaxForm from './TaxForm';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';

function Dashboard() {
  const { user, logout } = useAuth();
  const [taxReturns, setTaxReturns] = useState([]);
  const [documents, setDocuments] = useState([]); // ADD THIS LINE
  const [loading, setLoading] = useState(true);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchTaxReturns();
    fetchDocuments(); // ADD THIS LINE
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

  // ADD THIS NEW FUNCTION
  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments(); // Using your apiService
      setDocuments(response);
      console.log('Documents fetched:', response);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Set empty array if API call fails
      setDocuments([]);
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

  // UPDATE THIS FUNCTION
  const handleUploadDocument = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiService.uploadDocument(formData);
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      
      // ADD THIS LINE - Refresh documents after upload
      await fetchDocuments();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  // ADD THIS NEW FUNCTION
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await apiService.deleteDocument(documentId); // You may need to add this to apiService
      alert('Document deleted successfully!');
      await fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  // Your existing downloadTaxReturn function stays the same...
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
        {/* All your existing JSX stays the same until Tax Returns History section */}
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {/* ... your existing header code ... */}
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

        {/* Quick Actions - keep your existing code */}
        
        {/* ADD THIS NEW DOCUMENTS SECTION - AFTER Quick Actions, BEFORE Tax Returns History */}
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
                <p className="text-gray-600 mb-4">Upload your tax documents to get started!</p>
                <button 
                  onClick={() => setShowUploadForm(true)} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
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
                    
                    <div className="flex gap-2">
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
            
            {/* Debug info - you can remove this later */}
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <strong>Debug:</strong> Found {documents.length} documents
            </div>
          </div>
        )}

        {/* Tax Returns History - keep your existing code */}
        {/* Summary Stats - keep your existing code */}
        
      </div>
    </div>
  );
}

export default Dashboard;
