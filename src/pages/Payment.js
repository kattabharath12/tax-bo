import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [taxReturn, setTaxReturn] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [loading, setLoading] = useState(false);
  const taxReturnId = searchParams.get('tax_return_id');

  useEffect(() => {
    if (taxReturnId) {
      fetchTaxReturn();
    }
  }, [taxReturnId]);

  const fetchTaxReturn = async () => {
    try {
      const response = await axios.get('/tax-returns');
      const returns = response.data;
      const currentReturn = returns.find(tr => tr.id === parseInt(taxReturnId));
      setTaxReturn(currentReturn);
    } catch (error) {
      console.error('Error fetching tax return:', error);
    }
  };

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/payments', {
        tax_return_id: parseInt(taxReturnId),
        amount: taxReturn.amount_owed
      });

      alert('Payment processed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!taxReturn) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Payment</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Payment Summary</h6>
                <div className="card bg-light">
                  <div className="card-body">
                    <p><strong>Tax Year:</strong> {taxReturn.tax_year}</p>
                    <p><strong>Amount Due:</strong> ${taxReturn.amount_owed.toFixed(2)}</p>
                    <p><strong>Due Date:</strong> April 15, {taxReturn.tax_year + 1}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h6>Payment Information</h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="cardholderName" className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cardholderName"
                      name="cardholderName"
                      value={paymentData.cardholderName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="cardNumber" className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          className="form-control"
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="cvv" className="form-label">CVV</label>
                        <input
                          type="text"
                          className="form-control"
                          id="cvv"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Pay $${taxReturn.amount_owed.toFixed(2)}`}
                  </button>
                </form>
              </div>
            </div>

            <div className="alert alert-info mt-3">
              <small>
                <i className="fas fa-info-circle me-2"></i>
                This is a demo payment system. No actual charges will be made.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;