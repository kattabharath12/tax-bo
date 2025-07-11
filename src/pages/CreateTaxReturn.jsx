// src/pages/CreateTaxReturn.jsx
import React from 'react';
import TaxReturnForm from '../components/TaxReturnForm';

const CreateTaxReturn = ({ taxReturnId, isEditing = false }) => {
  const handleSuccess = (taxReturn) => {
    console.log('Tax return created/updated:', taxReturn);
    
    // Show success message
    alert(`Tax return ${isEditing ? 'updated' : 'created'} successfully!`);
    
    // Navigate back to tax returns list
    window.location.href = '/tax-returns';
  };

  const handleCancel = () => {
    // Navigate back to tax returns list
    window.location.href = '/tax-returns';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Tax Return' : 'Create New Tax Return'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing 
                  ? 'Update your tax return information' 
                  : 'Fill out your tax information to calculate your taxes'
                }
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back to Tax Returns
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                  1
                </div>
                <span className="font-medium text-blue-600">Tax Information</span>
              </div>
              
              <div className="flex-1 h-1 bg-gray-200 mx-4">
                <div className="h-full bg-blue-600 rounded" style={{width: '33%'}}></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <span className="text-gray-400">Review</span>
              </div>
              
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-medium">
                  3
                </div>
                <span className="text-gray-400">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Tips */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Helpful Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your filing status affects your standard deduction and tax brackets</li>
                    <li>If you're married, you'll need your spouse's information</li>
                    <li>Head of Household requires a qualifying person who lived with you</li>
                    <li>You can save your progress and come back later</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Return Form */}
        <TaxReturnForm 
          onSuccess={handleSuccess}
          taxReturnId={taxReturnId}
          isEditing={isEditing}
        />

        {/* Additional Resources */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Additional Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-blue-600 mb-2">
                  <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-medium mb-2">Filing Status Guide</h4>
                <p className="text-sm text-gray-600 mb-3">Learn about different filing statuses and which one is right for you</p>
                <button
                  onClick={() => window.location.href = '/filing-status-guide'}
                  className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                >
                  View Guide →
                </button>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-green-600 mb-2">
                  <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M11 7L9 9l4 4" />
                  </svg>
                </div>
                <h4 className="font-medium mb-2">Upload Documents</h4>
                <p className="text-sm text-gray-600 mb-3">Upload your tax documents to automatically extract information</p>
                <button
                  onClick={() => window.location.href = '/documents'}
                  className="text-green-600 text-sm hover:text-green-800 font-medium"
                >
                  Upload Documents →
                </button>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-purple-600 mb-2">
                  <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium mb-2">Tax Help</h4>
                <p className="text-sm text-gray-600 mb-3">Get answers to common tax questions and find additional resources</p>
                <button
                  onClick={() => window.location.href = '/help'}
                  className="text-purple-600 text-sm hover:text-purple-800 font-medium"
                >
                  Get Help →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaxReturn;
