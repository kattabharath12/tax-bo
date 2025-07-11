// src/components/FilingStatusHelper.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const FilingStatusHelper = () => {
  const [filingStatusOptions, setFilingStatusOptions] = useState([]);
  const [standardDeductions, setStandardDeductions] = useState({});
  const [selectedYear, setSelectedYear] = useState(2024);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusOptions, deductions] = await Promise.all([
        apiService.getFilingStatusOptions(),
        apiService.getStandardDeductions(selectedYear)
      ]);
      
      setFilingStatusOptions(statusOptions.filing_statuses);
      setStandardDeductions(deductions.standard_deductions);
    } catch (error) {
      console.error('Error loading filing status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card">
          <h2 className="text-2xl">Loading Filing Status Guide...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Filing Status Guide</h2>
          <p className="text-gray-600">
            Choose the filing status that best describes your situation.
          </p>
        </div>

        {/* Tax Year Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>

        {/* Filing Status Options */}
        <div className="space-y-6 mb-8">
          {filingStatusOptions.map((option) => (
            <div key={option.value} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{option.label}</h3>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(standardDeductions[option.value])}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.href = '/tax-returns/create'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Tax Return
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilingStatusHelper;
