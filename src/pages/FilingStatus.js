// src/pages/FilingStatus.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FilingStatusForm from '../components/FilingStatusForm';
import { apiService } from '../services/api';

const FilingStatus = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [taxReturn, setTaxReturn] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load existing tax return if editing
  useEffect(() => {
    if (id) {
      loadTaxReturn();
    }
  }, [id]);

  const loadTaxReturn = async () => {
    try {
      setLoading(true);
      const taxReturns = await apiService.getTaxReturns();
      const foundTaxReturn = taxReturns.find(tr => tr.id === parseInt(id));
      setTaxReturn(foundTaxReturn);
    } catch (error) {
      console.error('Error loading tax return:', error);
      alert('Error loading tax return');
    } finally {
      setLoading(false);
    }
  };

  const handleFilingStatusSubmit = async (filingStatusData) => {
    try {
      if (id) {
        const updatedTaxReturn = await apiService.updateFilingStatus(id, filingStatusData);
        setTaxReturn(updatedTaxReturn);
        alert('Filing status updated successfully!');
        navigate('/dashboard');
      } else {
        localStorage.setItem('filingStatusData', JSON.stringify(filingStatusData));
        navigate('/tax-wizard');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving filing status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <FilingStatusForm
        onSubmit={handleFilingStatusSubmit}
        initialData={taxReturn}
        isEditing={!!id}
      />
    </div>
  );
};

export default FilingStatus;
