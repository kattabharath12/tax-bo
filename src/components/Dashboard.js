// src/components/FilingStatusForm.js
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const FilingStatusForm = ({ onSubmit, onCancel, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState({
    filing_status: 'single',
    tax_year: 2024,
    spouse_ssn: '',
    spouse_name: '',
    dependents: []
  });

  const [standardDeductions, setStandardDeductions] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        filing_status: initialData.filing_status || 'single',
        tax_year: initialData.tax_year || 2024,
        spouse_ssn: initialData.spouse_ssn || '',
        spouse_name: initialData.spouse_name || '',
        dependents: initialData.dependents || []
      });
    }
  }, [initialData]);

  useEffect(() => {
    loadStandardDeductions();
  }, [formData.tax_year]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStandardDeductions = async () => {
    try {
      const deductions = await apiService.getStandardDeductions(formData.tax_year);
      setStandardDeductions(deductions);
    } catch (error) {
      console.error('Error loading standard deductions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addDependent = () => {
    setFormData(prev => ({
      ...prev,
      dependents: [...prev.dependents, {
        name: '',
        ssn: '',
        relationship: '',
        birth_date: '',
        months_lived_with_you: 12
      }]
    }));
  };

  const removeDependent = (index) => {
    setFormData(prev => ({
      ...prev,
      dependents: prev.dependents.filter((_, i) => i !== index)
    }));
  };

  const updateDependent = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      dependents: prev.dependents.map((dep, i) => 
        i === index ? { ...dep, [field]: value } : dep
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.filing_status) {
      newErrors.filing_status = 'Filing status is required';
    }

    if ((formData.filing_status === 'married_jointly' || formData.filing_status === 'married_separately') && !formData.spouse_ssn) {
      newErrors.spouse_ssn = 'Spouse SSN is required for married filing status';
    }

    if ((formData.filing_status === 'married_jointly' || formData.filing_status === 'married_separately') && !formData.spouse_name) {
      newErrors.spouse_name = 'Spouse name is required for married filing status';
    }

    // Validate dependents
    formData.dependents.forEach((dependent, index) => {
      if (!dependent.name) {
        newErrors[`dependent_${index}_name`] = 'Dependent name is required';
      }
      if (!dependent.ssn) {
        newErrors[`dependent_${index}_ssn`] = 'Dependent SSN is required';
      }
      if (!dependent.relationship) {
        newErrors[`dependent_${index}_relationship`] = 'Relationship is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const filingStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married_jointly', label: 'Married Filing Jointly' },
    { value: 'married_separately', label: 'Married Filing Separately' },
    { value: 'head_of_household', label: 'Head of Household' },
    { value: 'qualifying_widow', label: 'Qualifying Widow(er)' }
  ];

  const relationshipOptions = [
    'Son', 'Daughter', 'Stepchild', 'Foster child', 'Brother', 'Sister', 
    'Half brother', 'Half sister', 'Stepbrother', 'Stepsister', 
    'Adopted child', 'Grandchild', 'Niece', 'Nephew', 'Other'
  ];

  return (
    // ADD THE SAME CONTAINER STRUCTURE AS DASHBOARD
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {isEditing ? 'Edit Filing Status' : 'Filing Status Information'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Year
                </label>
                <select
                  name="tax_year"
                  value={formData.tax_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filing Status *
                </label>
                <select
                  name="filing_status"
                  value={formData.filing_status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.filing_status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {filingStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.filing_status && (
                  <p className="mt-1 text-sm text-red-600">{errors.filing_status}</p>
                )}
              </div>
            </div>

            {/* Standard Deduction Display */}
            {standardDeductions[formData.filing_status] && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Standard Deduction Information
                </h3>
                <p className="text-blue-700">
                  For {filingStatusOptions.find(opt => opt.value === formData.filing_status)?.label} in {formData.tax_year}: 
                  <span className="font-semibold ml-2">
                    ${standardDeductions[formData.filing_status]?.toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {/* Spouse Information */}
            {(formData.filing_status === 'married_jointly' || formData.filing_status === 'married_separately') && (
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spouse Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse Full Name *
                    </label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.spouse_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter spouse's full name"
                    />
                    {errors.spouse_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.spouse_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse SSN *
                    </label>
                    <input
                      type="text"
                      name="spouse_ssn"
                      value={formData.spouse_ssn}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.spouse_ssn ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="XXX-XX-XXXX"
                    />
                    {errors.spouse_ssn && (
                      <p className="mt-1 text-sm text-red-600">{errors.spouse_ssn}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dependents Section */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Dependents</h3>
                <button
                  type="button"
                  onClick={addDependent}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Dependent
                </button>
              </div>

              {formData.dependents.length === 0 ? (
                <p className="text-gray-500">No dependents added yet.</p>
              ) : (
                <div className="space-y-6">
                  {formData.dependents.map((dependent, index) => (
                    <div key={index} className="border border-gray-100 rounded-md p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-gray-800">
                          Dependent {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeDependent(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={dependent.name}
                            onChange={(e) => updateDependent(index, 'name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`dependent_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter dependent's full name"
                          />
                          {errors[`dependent_${index}_name`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`dependent_${index}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SSN *
                          </label>
                          <input
                            type="text"
                            value={dependent.ssn}
                            onChange={(e) => updateDependent(index, 'ssn', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`dependent_${index}_ssn`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="XXX-XX-XXXX"
                          />
                          {errors[`dependent_${index}_ssn`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`dependent_${index}_ssn`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship *
                          </label>
                          <select
                            value={dependent.relationship}
                            onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`dependent_${index}_relationship`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select relationship</option>
                            {relationshipOptions.map(relation => (
                              <option key={relation} value={relation}>{relation}</option>
                            ))}
                          </select>
                          {errors[`dependent_${index}_relationship`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`dependent_${index}_relationship`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Birth Date
                          </label>
                          <input
                            type="date"
                            value={dependent.birth_date}
                            onChange={(e) => updateDependent(index, 'birth_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Months Lived With You
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={dependent.months_lived_with_you}
                            onChange={(e) => updateDependent(index, 'months_lived_with_you', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel || (() => window.history.back())}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Filing Status' : 'Save Filing Status')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FilingStatusForm;
