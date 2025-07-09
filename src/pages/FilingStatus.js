// src/pages/FilingStatus.js
import React, { useState, useEffect } from 'react';
import FilingStatusForm from '../components/FilingStatusForm';
import { apiService } from '../services/api';

const FilingStatus = () => {
  const [taxReturn, setTaxReturn] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get ID from URL path manually (since not using React Router)
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const id = pathParts[2]; // /filing-status/123 -> id = "123"

  useEffect(() => {
    if (id && id !== '') {
      loadTaxReturn();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (id && id !== '') {
        // Editing existing filing status
        const updatedTaxReturn = await apiService.updateFilingStatus(id, filingStatusData);
        setTaxReturn(updatedTaxReturn);
        alert('Filing status updated successfully!');
        // Navigate back to dashboard
        window.history.pushState(null, '', '/dashboard');
        window.location.reload();
      } else {
        // Creating new filing status
        localStorage.setItem('filingStatusData', JSON.stringify(filingStatusData));
        alert('Filing status saved! You can now create a tax return.');
        // Navigate back to dashboard
        window.history.pushState(null, '', '/dashboard');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving filing status');
    }
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    window.history.pushState(null, '', '/dashboard');
    window.location.reload();
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
        onCancel={handleCancel}
        initialData={taxReturn}
        isEditing={!!(id && id !== '')}
      />
    </div>
  );
};

export default FilingStatus;
