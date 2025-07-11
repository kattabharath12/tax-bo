// src/pages/TaxReturns.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import TaxReturnCard from '../components/TaxReturnCard';

const TaxReturns = () => {
  const [taxReturns, setTaxReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTaxReturns();
  }, []);

  const loadTaxReturns = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTaxReturns();
      setTaxReturns(data);
    } catch (error) {
      console.error('Error loading tax returns:', error);
      setError('Failed to load tax returns');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (taxReturn) => {
    window.location.href = `/tax-returns/view/${taxReturn.id}`;
  };

  const handleEdit = (taxReturn) => {
    window.location.href = `/tax-returns/edit/${taxReturn.id}`;
  };

  const handleCreate = () => {
    window.location.href = '/tax-returns/create';
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card">
          <h2 className="text-2xl">Loading Tax Returns...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center">
        <div className="card">
          <h2 className="text-2xl text-red-600">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadTaxReturns}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={handleBackToDashboard}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tax Returns</h1>
            <p className="text-gray-600">Manage your tax returns and filing status</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create New Tax Return
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {taxReturns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-600 text-sm font-medium">Total Returns</p>
              <p className="text-2xl font-bold text-blue-800">{taxReturns.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-600 text-sm font-medium">Refunds Due</p>
              <p className="text-2xl font-bold text-green-800">
                {taxReturns.filter(tr => tr.refund_amount > 0).length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-600 text-sm font-medium">Amounts Owed</p>
              <p className="text-2xl font-bold text-red-800">
                {taxReturns.filter(tr => tr.amount_owed > 0).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-600 text-sm font-medium">Draft Returns</p>
              <p className="text-2xl font-bold text-yellow-800">
                {taxReturns.filter(tr => tr.status === 'draft').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tax Returns Grid */}
      {taxReturns.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tax returns found</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first tax return. Our system supports all filing statuses and provides accurate tax calculations.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleCreate}
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Your First Tax Return
              </button>
              <button
                onClick={() => window.location.href = '/filing-status-guide'}
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                Learn About Filing Status
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {taxReturns.map((taxReturn) => (
            <TaxReturnCard
              key={taxReturn.id}
              taxReturn={taxReturn}
              onView={handleView}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-blue-600 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Filing Status Guide</h4>
            <p className="text-sm text-gray-600 mb-2">Learn about different filing statuses</p>
            <button
              onClick={() => window.location.href = '/filing-status-guide'}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              View Guide →
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-green-600 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Tax Calculator</h4>
            <p className="text-sm text-gray-600 mb-2">Estimate your taxes before filing</p>
            <button
              onClick={handleCreate}
              className="text-green-600 text-sm hover:text-green-800"
            >
              Calculate Now →
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-purple-600 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M11 7L9 9l4 4" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Upload Documents</h4>
            <p className="text-sm text-gray-600 mb-2">Automatically extract tax information</p>
            <button
              onClick={() => window.location.href = '/documents'}
              className="text-purple-600 text-sm hover:text-purple-800"
            >
              Upload Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxReturns;
