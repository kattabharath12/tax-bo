import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaxWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tax_year: new Date().getFullYear() - 1,
    income: '',
    withholdings: '',
    deductions: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/tax-returns', {
        tax_year: parseInt(formData.tax_year),
        income: parseFloat(formData.income),
        withholdings: parseFloat(formData.withholdings),
        deductions: formData.deductions ? parseFloat(formData.deductions) : null
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating tax return:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h4>Basic Information</h4>
            <div className="mb-3">
              <label htmlFor="tax_year" className="form-label">Tax Year</label>
              <select
                className="form-select"
                id="tax_year"
                name="tax_year"
                value={formData.tax_year}
                onChange={handleChange}
              >
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
                <option value={2021}>2021</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h4>Income Information</h4>
            <div className="mb-3">
              <label htmlFor="income" className="form-label">Total Income</label>
              <input
                type="number"
                className="form-control"
                id="income"
                name="income"
                value={formData.income}
                onChange={handleChange}
                placeholder="Enter your total income"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="withholdings" className="form-label">Tax Withholdings</label>
              <input
                type="number"
                className="form-control"
                id="withholdings"
                name="withholdings"
                value={formData.withholdings}
                onChange={handleChange}
                placeholder="Enter tax withholdings from W-2"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h4>Deductions</h4>
            <div className="mb-3">
              <label htmlFor="deductions" className="form-label">
                Additional Deductions (Optional)
              </label>
              <input
                type="number"
                className="form-control"
                id="deductions"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                placeholder="Enter additional deductions (leave blank for standard deduction)"
              />
              <div className="form-text">
                Leave blank to use standard deduction ($12,550 for 2023)
              </div>
            </div>
          </div>
        );

      case 4:
        const income = parseFloat(formData.income) || 0;
        const withholdings = parseFloat(formData.withholdings) || 0;
        const deductions = parseFloat(formData.deductions) || 12550;
        const taxableIncome = Math.max(0, income - deductions);

        let taxOwed = 0;
        if (taxableIncome <= 10275) {
          taxOwed = taxableIncome * 0.10;
        } else if (taxableIncome <= 41775) {
          taxOwed = 1027.50 + (taxableIncome - 10275) * 0.12;
        } else {
          taxOwed = 4807.50 + (taxableIncome - 41775) * 0.22;
        }

        const refund = Math.max(0, withholdings - taxOwed);
        const owed = Math.max(0, taxOwed - withholdings);

        return (
          <div>
            <h4>Review & Submit</h4>
            <div className="card">
              <div className="card-body">
                <h5>Tax Calculation Summary</h5>
                <div className="row">
                  <div className="col-6">
                    <p><strong>Tax Year:</strong> {formData.tax_year}</p>
                    <p><strong>Total Income:</strong> ${income.toLocaleString()}</p>
                    <p><strong>Deductions:</strong> ${deductions.toLocaleString()}</p>
                    <p><strong>Taxable Income:</strong> ${taxableIncome.toLocaleString()}</p>
                  </div>
                  <div className="col-6">
                    <p><strong>Tax Owed:</strong> ${taxOwed.toFixed(2)}</p>
                    <p><strong>Withholdings:</strong> ${withholdings.toLocaleString()}</p>
                    {refund > 0 ? (
                      <p className="text-success"><strong>Refund:</strong> ${refund.toFixed(2)}</p>
                    ) : (
                      <p className="text-danger"><strong>Amount Owed:</strong> ${owed.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tax Wizard</h5>
              <span className="badge bg-primary">Step {step} of 4</span>
            </div>
            <div className="progress mt-2" style={{height: '4px'}}>
              <div 
                className="progress-bar" 
                style={{width: `${(step / 4) * 100}%`}}
              ></div>
            </div>
          </div>
          <div className="card-body">
            {renderStep()}

            <div className="d-flex justify-content-between mt-4">
              <button 
                className="btn btn-outline-secondary"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </button>

              {step < 4 ? (
                <button 
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={
                    (step === 2 && (!formData.income || !formData.withholdings))
                  }
                >
                  Next
                </button>
              ) : (
                <button 
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Tax Return'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxWizard;