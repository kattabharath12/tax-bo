import React, { useState } from 'react';
import api from '../services/api';

function TaxForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    tax_year: 2024,
    income: '',
    deductions: '',
    withholdings: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculation, setCalculation] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTax = () => {
    const income = parseFloat(formData.income) || 0;
    const deductions = parseFloat(formData.deductions) || 12550; // Standard deduction
    const withholdings = parseFloat(formData.withholdings) || 0;

    const taxableIncome = Math.max(0, income - deductions);
    
    let taxOwed = 0;
    if (taxableIncome <= 10275) {
      taxOwed = taxableIncome * 0.10;
    } else if (taxableIncome <= 41775) {
      taxOwed = 1027.50 + (taxableIncome - 10275) * 0.12;
    } else {
      taxOwed = 4807.50 + (taxableIncome - 41775) * 0.22;
    }

    const refundAmount = Math.max(0, withholdings - taxOwed);
    const amountOwed = Math.max(0, taxOwed - withholdings);

    setCalculation({
      taxableIncome,
      taxOwed,
      refundAmount,
      amountOwed,
      deductions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/tax-returns', {
        tax_year: parseInt(formData.tax_year),
        income: parseFloat(formData.income),
        deductions: parseFloat(formData.deductions) || undefined,
        withholdings: parseFloat(formData.withholdings)
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      setError('Failed to create tax return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl mb-6">File Your Tax Return</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>Tax Year:</label>
            <select
              name="tax_year"
              className="input"
              value={formData.tax_year}
              onChange={handleInputChange}
              required
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>

          <div>
            <label>Annual Income ($):</label>
            <input
              type="number"
              name="income"
              className="input"
              value={formData.income}
              onChange={handleInputChange}
              onBlur={calculateTax}
              placeholder="75000"
              required
            />
          </div>

          <div>
            <label>Deductions ($) - Optional:</label>
            <input
              type="number"
              name="deductions"
              className="input"
              value={formData.deductions}
              onChange={handleInputChange}
              onBlur={calculateTax}
              placeholder="12550 (Standard Deduction)"
            />
          </div>

          <div>
            <label>Tax Withholdings ($):</label>
            <input
              type="number"
              name="withholdings"
              className="input"
              value={formData.withholdings}
              onChange={handleInputChange}
              onBlur={calculateTax}
              placeholder="8000"
              required
            />
          </div>
        </div>

        {calculation && (
          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f8fafc' }}>
            <h3 className="text-lg mb-4">Tax Calculation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Taxable Income:</strong> ${calculation.taxableIncome.toLocaleString()}</p>
                <p><strong>Tax Owed:</strong> ${calculation.taxOwed.toFixed(2)}</p>
              </div>
              <div>
                <p><strong>Refund Amount:</strong> <span style={{ color: 'green' }}>${calculation.refundAmount.toFixed(2)}</span></p>
                <p><strong>Amount Owed:</strong> <span style={{ color: 'red' }}>${calculation.amountOwed.toFixed(2)}</span></p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Filing...' : 'File Tax Return'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaxForm;
