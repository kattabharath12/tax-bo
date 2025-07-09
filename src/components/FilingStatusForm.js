// src/components/FilingStatusForm.js
import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, User, Users, Home, Heart } from 'lucide-react';
import { apiService } from '../services/api';

const FilingStatusForm = ({ onSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    filing_status: 'single',
    spouse_name: '',
    spouse_ssn: '',
    spouse_has_income: false,
    spouse_itemizes: false,
    qualifying_person_name: '',
    qualifying_person_relationship: '',
    lived_with_taxpayer: false
  });

  const [errors, setErrors] = useState({});
  const [standardDeductions, setStandardDeductions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Filing status options with icons
  const filingStatusOptions = [
    {
      value: 'single',
      label: 'Single',
      icon: <User className="w-5 h-5" />,
      description: 'Check if you are unmarried or legally separated under a divorce or separate maintenance decree'
    },
    {
      value: 'married_jointly',
      label: 'Married Filing Jointly',
      icon: <Users className="w-5 h-5" />,
      description: 'Check if you are married and you and your spouse agree to file a joint return'
    },
    {
      value: 'married_separately',
      label: 'Married Filing Separately',
      icon: <Users className="w-5 h-5" />,
      description: 'Check if you are married but choose to file separate returns'
    },
    {
      value: 'head_of_household',
      label: 'Head of Household',
      icon: <Home className="w-5 h-5" />,
      description: 'Check if you are unmarried and paid more than half the cost of keeping up a home for a qualifying person'
    },
    {
      value: 'qualifying_widow',
      label: 'Qualifying Widow(er)',
      icon: <Heart className="w-5 h-5" />,
      description: 'Check if your spouse died in a prior tax year and you have a qualifying child'
    }
  ];

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        filing_status: initialData.filing_status || 'single',
        spouse_name: initialData.spouse_name || '',
        spouse_ssn: initialData.spouse_ssn || '',
        spouse_has_income: initialData.spouse_has_income || false,
        spouse_itemizes: initialData.spouse_itemizes || false,
        qualifying_person_name: initialData.qualifying_person_name || '',
        qualifying_person_relationship: initialData.qualifying_person_relationship || '',
        lived_with_taxpayer: initialData.lived_with_taxpayer || false
      });
    }
  }, [initialData]);

  // Fetch standard deductions
  useEffect(() => {
    const fetchStandardDeductions = async () => {
      try {
        const data = await apiService.getStandardDeductions();
        setStandardDeductions(data.standard_deductions);
      } catch (error) {
        console.error('Failed to fetch standard deductions:', error);
      }
    };
    fetchStandardDeductions();
  }, []);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle filing status change
  const handleFilingStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      filing_status: status,
      // Clear fields that don't apply to new status
      spouse_name: status.includes('married') ? prev.spouse_name : '',
      spouse_ssn: status.includes('married') ? prev.spouse_ssn : '',
      spouse_has_income: status.includes('married') ? prev.spouse_has_income : false,
      spouse_itemizes: status.includes('married') ? prev.spouse_itemizes : false,
      qualifying_person_name: status === 'head_of_household' ? prev.qualifying_person_name : '',
      qualifying_person_relationship: status === 'head_of_household' ? prev.qualifying_person_relationship : '',
      lived_with_taxpayer: status === 'head_of_household' ? prev.lived_with_taxpayer : false
    }));
    
    // Clear errors
    setErrors({});
  };

  // Format SSN input
  const formatSSN = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate married filing status
    if (formData.filing_status.includes('married')) {
      if (!formData.spouse_name.trim()) {
        newErrors.spouse_name = 'Spouse name is required';
      }
      if (!formData.spouse_ssn.trim()) {
        newErrors.spouse_ssn = 'Spouse SSN is required';
      } else if (formData.spouse_ssn.replace(/\D/g, '').length !== 9) {
        newErrors.spouse_ssn = 'SSN must be 9 digits';
      }
    }

    // Validate head of household
    if (formData.filing_status === 'head_of_household') {
      if (!formData.qualifying_person_name.trim()) {
        newErrors.qualifying_person_name = 'Qualifying person name is required';
      }
      if (!formData.qualifying_person_relationship.trim()) {
        newErrors.qualifying_person_relationship = 'Relationship is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Filing Status</h2>
          <p className="mt-1 text-sm text-gray-600">
            Select your filing status and provide required information
          </p>
        </div>

        {/* Filing Status Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose your filing status <span className="text-red-500">*</span>
          </label>
          
          {filingStatusOptions.map((option) => (
            <div key={option.value} className="relative">
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                formData.filing_status === option.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id={option.value}
                    name="filing_status"
                    value={option.value}
                    checked={formData.filing_status === option.value}
                    onChange={(e) => handleFilingStatusChange(e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor={option.value} className="flex items-center space-x-2 cursor-pointer">
                      {option.icon}
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {standardDeductions[option.value] && (
                        <span className="text-sm text-gray-500">
                          (Standard Deduction: ${standardDeductions[option.value].toLocaleString()})
                        </span>
                      )}
                    </label>
                    <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </div>

              {/* Spouse Information for Married Filing */}
              {formData.filing_status.includes('married') && formData.filing_status === option.value && (
                <div className="mt-4 ml-7 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium text-gray-900 mb-3">Spouse Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spouse's Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.spouse_name}
                        onChange={(e) => handleChange('spouse_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.spouse_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter spouse's full name"
                      />
                      {errors.spouse_name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.spouse_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spouse's SSN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.spouse_ssn}
                        onChange={(e) => handleChange('spouse_ssn', formatSSN(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.spouse_ssn ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="XXX-XX-XXXX"
                        maxLength="11"
                      />
                      {errors.spouse_ssn && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.spouse_ssn}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.spouse_has_income}
                        onChange={(e) => handleChange('spouse_has_income', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Spouse had income for the tax year</span>
                    </label>

                    {formData.filing_status === 'married_separately' && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.spouse_itemizes}
                          onChange={(e) => handleChange('spouse_itemizes', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Spouse itemizes deductions</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Qualifying Person Information for Head of Household */}
              {formData.filing_status === 'head_of_household' && formData.filing_status === option.value && (
                <div className="mt-4 ml-7 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-medium text-gray-900 mb-3">Qualifying Person Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualifying Person's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.qualifying_person_name}
                        onChange={(e) => handleChange('qualifying_person_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.qualifying_person_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter qualifying person's name"
                      />
                      {errors.qualifying_person_name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.qualifying_person_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship to You <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.qualifying_person_relationship}
                        onChange={(e) => handleChange('qualifying_person_relationship', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.qualifying_person_relationship ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Son, Daughter, Parent"
                      />
                      {errors.qualifying_person_relationship && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.qualifying_person_relationship}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.lived_with_taxpayer}
                        onChange={(e) => handleChange('lived_with_taxpayer', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        This person lived with you for more than half the year
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Standard Deduction Info */}
        {standardDeductions[formData.filing_status] && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Standard Deduction</h4>
            </div>
            <p className="mt-1 text-sm text-blue-800">
              Based on your filing status, your standard deduction is{' '}
              <span className="font-semibold">
                ${standardDeductions[formData.filing_status].toLocaleString()}
              </span>
            </p>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Important Notes</h4>
              <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                <li>• You can only select one filing status</li>
                <li>• Choose the status that gives you the lowest tax liability</li>
                <li>• If you're unsure which status to choose, consult IRS Publication 501 or a tax professional</li>
                <li>• All required fields must be completed before submission</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Filing Status' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilingStatusForm;
