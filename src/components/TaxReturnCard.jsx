// src/components/TaxReturnCard.jsx
import React from 'react';

const TaxReturnCard = ({ taxReturn, onEdit, onView, onDelete }) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilingStatusIcon = (status) => {
    switch (status) {
      case 'single':
        return '👤';
      case 'married_jointly':
      case 'married_separately':
        return '👫';
      case 'head_of_household':
        return '🏠';
      case 'qualifying_widow':
        return '💐';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getFilingStatusIcon(taxReturn.filing_status)}</span>
              <h3 className="text-2xl font-bold">Tax Year {taxReturn.tax_year}</h3>
            </div>
            <p className="text-blue-100 text-sm">
              {getFilingStatusLabel(taxReturn.filing_status)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(taxReturn.status)}`}>
            {taxReturn.status?.charAt(0).toUpperCase() + taxReturn.status?.slice(1)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Income</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(taxReturn.income)}</p>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Deductions</p>
                <p className="text-xl font-bold text-blue-800">{formatCurrency(taxReturn.deductions)}</p>
              </div>
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Calculation Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Tax Calculation</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Owed:</span>
              <span className="font-medium">{formatCurrency(taxReturn.tax_owed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Withholdings:</span>
              <span className="font-medium">{formatCurrency(taxReturn.withholdings)}</span>
            </div>
          </div>
        </div>

        {/* Filing Status Specific Information */}
        <div className="space-y-4 mb-6">
          {/* Spouse Information */}
          {taxReturn.spouse_name && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-3">
                <span className="text-purple-600 mr-2">👫</span>
                <h4 className="font-semibold text-purple-800">Spouse Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name: </span>
                  <span className="font-medium text-gray-800">{taxReturn.spouse_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">SSN: </span>
                  <span className="font-medium text-gray-800">
                    {taxReturn.spouse_ssn ? '***-**-' + taxReturn.spouse_ssn.slice(-4) : 'Not provided'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {taxReturn.spouse_has_income && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                    Has Income
                  </span>
                )}
                {taxReturn.spouse_itemizes && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                    Itemizes Deductions
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Qualifying Person Information */}
          {taxReturn.qualifying_person_name && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-3">
                <span className="text-green-600 mr-2">🏠</span>
                <h4 className="font-semibold text-green-800">Qualifying Person</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name: </span>
                  <span className="font-medium text-gray-800">{taxReturn.qualifying_person_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Relationship: </span>
                  <span className="font-medium text-gray-800 capitalize">
                    {taxReturn.qualifying_person_relationship?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {taxReturn.lived_with_taxpayer && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                    ✓ Lived with taxpayer for more than half the year
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Result Summary */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            {taxReturn.refund_amount > 0 ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-600">Refund Due</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(taxReturn.refund_amount)}</p>
              </div>
            ) : taxReturn.amount_owed > 0 ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-2">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-600">Amount Owed</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(taxReturn.amount_owed)}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-2">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Balanced</p>
                <p className="text-2xl font-bold text-gray-800">$0.00</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              {onView && (
                <button
                  onClick={() => onView(taxReturn)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </button>
              )}
              
              {onEdit && taxReturn.status === 'draft' && (
                <button
                  onClick={() => onEdit(taxReturn)}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
              
              {onDelete && taxReturn.status === 'draft' && (
                <button
                  onClick={() => onDelete(taxReturn)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Dates */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span>Created: {formatDate(taxReturn.created_at)}</span>
              {taxReturn.submitted_at && (
                <span>Submitted: {formatDate(taxReturn.submitted_at)}</span>
              )}
            </div>
            <div className="text-right">
              <span className="font-medium">ID: {taxReturn.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxReturnCard;
