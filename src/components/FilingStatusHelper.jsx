// src/components/FilingStatusHelper.jsx
import React from 'react';

const FilingStatusHelper = () => {
  return (
    <div className="container">
      <div className="card">
        <h2 className="text-2xl mb-4">Filing Status Guide</h2>
        <p>This is a placeholder for the filing status helper component.</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default FilingStatusHelper;
