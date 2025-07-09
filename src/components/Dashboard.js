// src/components/Dashboard.js - Updated to handle missing endpoints
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [taxReturns, setTaxReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTaxReturns();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch tax returns
      const returns = await apiService.getTaxReturns();
      setTaxReturns(returns);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
      
      // Check if it's a CORS or network error
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setError('Unable to connect to server. Please try again later.');
      } else if (error.response?.status === 500) {
        setError('Tax returns feature is not available yet.');
      } else {
        setError('Error loading tax returns: ' + (error.response?.data?.message || error.message));
      }
      
      // Set empty array so dashboard still works
      setTaxReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilingStatusLabel = (status) => {
    const labels = {
      'single': 'Single',
      'married_jointly': 'Married Filing Jointly',
      'married_separately': 'Married Filing Separately',
      'head_of_household': 'Head of Household',
      'qualifying_widow': 'Qualifying Widow(er)'
    };
    return labels[status] || status;
  };

  const handleNewFilingStatus = () => {
    window.history.pushState(null, '', '/filing-status');
    window.location.reload();
  };

  const handleNewTaxReturn = () => {
    // For now, just show that filing status should be completed first
    const filingStatusData = localStorage.getItem('filingStatusData');
    if (!filingStatusData) {
      alert('Please complete your filing status first before creating a tax return.');
      handleNewFilingStatus();
      return;
    }
    
    alert('Tax return creation will be available soon! Your filing status is saved.');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="space-x-2">
          <button 
            onClick={handleNewFilingStatus}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            New Filing Status
          </button>
          <button 
            onClick={handleNewTaxReturn}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Tax Return
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filing Status Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filing Status</h2>
        {(() => {
          const filingStatusData = localStorage.getItem('filingStatusData');
          if (filingStatusData) {
            const data = JSON.parse(filingStatusData);
            return (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">
                  <span className="font-medium">Status:</span> {getFilingStatusLabel(data.filing_status)}
                </p>
                <p className="text-green-800">
                  <span className="font-medium">Tax Year:</span> {data.tax_year}
                </p>
                {data.dependents && data.dependents.length > 0 && (
                  <p className="text-green-800">
                    <span className="font-medium">Dependents:</span> {data.dependents.length}
                  </p>
                )}
              </div>
            );
          } else {
            return (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-600">No filing status completed yet.</p>
                <button 
                  onClick={handleNewFilingStatus}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Complete Filing Status
                </button>
              </div>
            );
          }
        })()}
      </div>

      {/* Tax Returns Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tax Returns</h2>
        
        {taxReturns.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-gray-600">No tax returns found.</p>
            <p className="text-sm text-gray-500 mt-1">
              Complete your filing status first, then you can create tax returns.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {taxReturns.map((taxReturn) => (
              <div key={taxReturn.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Tax Return #{taxReturn.id}</h3>
                    <p className="text-sm text-gray-600">
                      Filing Status: {getFilingStatusLabel(taxReturn.filing_status)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tax Year: {taxReturn.tax_year}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button 
                      onClick={() => {
                        window.history.pushState(null, '', `/filing-status/${taxReturn.id}`);
                        window.location.reload();
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
