// src/components/TaxReturnForm.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TaxReturnForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    tax_year: 2024,
    income: '',
    deductions: '',
    withholdings: '',
    filing_status: 'single',
    spouse_name: '',
    spouse_ssn: '',
    spouse_has_income: false,
    spouse_itemizes: false,
    qualifying_person_name: '',
    qualifying_person_relationship: '',
    lived_with_taxpayer: false
  });

  const [filingStatusOptions, setFilingStatusOptions] = useState([]);
  const [standardDeductions, setStandardDeductions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFilingStatusData();
  }, []);

  const loadFilingStatusData = async () => {
    try {
      const [statusOptions, deductions] = await Promise.all([
        apiService.getFilingStatusOptions(),
        apiService.getStandardDeductions(formData.tax_year)
      ]);
      
      setFilingStatusOptions(statusOptions.filing_statuses);
      setStandardDeductions(deductions.standard_deductions);
    } catch (error) {
      console.error('Error loading filing status data:', error);
      setError('Failed to load filing status options');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const taxReturnData = {
        tax_year: parseInt(formData.tax_year),
        income: parseFloat(formData.income),
        deductions: formData.deductions ? parseFloat(formData.deductions) : null,
        withholdings: parseFloat(formData.withholdings),
        filing_status_info: {
          filing_status: formData.filing_status,
          spouse_name: formData.spouse_name || null,
          spouse_ssn: formData.spouse_ssn || null,
          spouse_has_income: formData.spouse_has_income,
          spouse_itemizes: formData.spouse_itemizes,
          qualifying_person_name: formData.qualifying_person_name || null,
          qualifying_person_relationship: formData.qualifying_person_relationship || null,
          lived_with_taxpayer: formData.lived_with_taxpayer
        }
      };

      const result = await apiService.createTaxReturn(taxReturnData);
      console.log('Tax return created:', result);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset form
      setFormData({
        tax_year: 2024,
        income: '',
        deductions: '',
        withholdings: '',
        filing_status: 'single',
        spouse_name: '',
        spouse_ssn: '',
        spouse_has_income: false,
        spouse_itemizes: false,
        qualifying_person_name: '',
        qualifying_person_relationship: '',
        lived_with_taxpayer: false
      });
      
    } catch (error) {
      console.error('Error creating tax return:', error);
      setError(error.message || 'Failed to create tax return');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isMarried = formData.filing_status === 'married_jointly' || formData.filing_status === 'married_separately';
  const isHeadOfHousehold = formData.filing_status === 'head_of_household';
  const currentStandardDeduction = standardDeductions[formData.filing_status];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Tax Return</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Year</label>
              <input
                type="number"
                name="tax_year"
                value={formData.tax_year}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50000"
                required
              />
            </div>
          </div>
        </div>

        {/* Filing Status */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Filing Status</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Filing Status</label>
            <select
              name="filing_status"
              value={formData.filing_status}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {filingStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {filingStatusOptions.find(opt => opt.value === formData.filing_status)?.description && (
              <p className="text-sm text-gray-600 mt-2 p-3 bg-blue-100 rounded">
                {filingStatusOptions.find(opt => opt.value === formData.filing_status).description}
              </p>
            )}
          </div>
          
          {currentStandardDeduction && (
            <div className="p-3 bg-green-100 rounded">
              <p className="text-sm font-medium text-green-800">
                Standard Deduction for {formData.filing_status.replace('_', ' ')}: ${currentStandardDeduction.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Spouse Information */}
        {isMarried && (
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Spouse Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Full Name *</label>
                <input
                  type="text"
                  name="spouse_name"
                  value={formData.spouse_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={isMarried}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spouse SSN *</label>
                <input
                  type="text"
                  name="spouse_ssn"
                  value={formData.spouse_ssn}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXX-XX-XXXX"
                  required={isMarried}
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="spouse_has_income"
                  checked={formData.spouse_has_income}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Spouse has income</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="spouse_itemizes"
                  checked={formData.spouse_itemizes}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Spouse itemizes deductions</span>
              </label>
            </div>
          </div>
        )}

        {/* Head of Household Information */}
        {isHeadOfHousehold && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Qualifying Person Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualifying Person Name *</label>
                <input
                  type="text"
                  name="qualifying_person_name"
                  value={formData.qualifying_person_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={isHeadOfHousehold}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                <select
                  name="qualifying_person_relationship"
                  value={formData.qualifying_person_relationship}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={isHeadOfHousehold}
                >
                  <option value="">Select relationship</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="other">Other qualifying relative</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="lived_with_taxpayer"
                  checked={formData.lived_with_taxpayer}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Qualifying person lived with you for more than half the year
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tax Information */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Tax Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deductions (optional)
              </label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Leave blank for standard deduction (${currentStandardDeduction ? '$' + currentStandardDeduction.toLocaleString() : 'TBD'})`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use standard deduction
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Withholdings</label>
              <input
                type="number"
                name="withholdings"
                value={formData.withholdings}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5000"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Creating Tax Return...' : 'Create Tax Return'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaxReturnForm;
