import React from 'react';
import TaxReturnForm from '../components/TaxReturnForm';
import { useNavigate } from 'react-router-dom';

const CreateTaxReturn = () => {
  const navigate = useNavigate();

  const handleSuccess = (taxReturn) => {
    console.log('Tax return created:', taxReturn);
    // Navigate to tax returns list or show success message
    navigate('/tax-returns');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <TaxReturnForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateTaxReturn;
