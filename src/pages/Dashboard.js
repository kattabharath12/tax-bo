import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [taxReturns, setTaxReturns] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [taxReturnsRes, documentsRes] = await Promise.all([
        axios.get('/tax-returns'),
        axios.get('/documents')
      ]);
      setTaxReturns(taxReturnsRes.data);
      setDocuments(documentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <div>
          <Link to="/tax-wizard" className="btn btn-primary">
            Start New Tax Return
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Tax Returns</h5>
            </div>
            <div className="card-body">
              {taxReturns.length === 0 ? (
                <div className="text-center py-4">
                  <p>No tax returns yet.</p>
                  <Link to="/tax-wizard" className="btn btn-primary">
                    Create Your First Tax Return
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tax Year</th>
                        <th>Income</th>
                        <th>Tax Owed</th>
                        <th>Refund</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxReturns.map((taxReturn) => (
                        <tr key={taxReturn.id}>
                          <td>{taxReturn.tax_year}</td>
                          <td>${taxReturn.income.toLocaleString()}</td>
                          <td>${taxReturn.tax_owed.toFixed(2)}</td>
                          <td>${taxReturn.refund_amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge bg-${taxReturn.status === 'draft' ? 'warning' : 'success'}`}>
                              {taxReturn.status}
                            </span>
                          </td>
                          <td>
                            {taxReturn.amount_owed > 0 && (
                              <Link 
                                to={`/payment?tax_return_id=${taxReturn.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Pay Now
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/documents" className="btn btn-outline-primary">
                  Upload Documents
                </Link>
                <Link to="/tax-wizard" className="btn btn-outline-primary">
                  Tax Wizard
                </Link>
                <Link to="/status" className="btn btn-outline-primary">
                  Check Status
                </Link>
                <Link to="/profile" className="btn btn-outline-secondary">
                  Profile Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="mb-0">Recent Documents</h5>
            </div>
            <div className="card-body">
              {documents.length === 0 ? (
                <p className="text-muted">No documents uploaded yet.</p>
              ) : (
                <ul className="list-unstyled">
                  {documents.slice(0, 5).map((doc) => (
                    <li key={doc.id} className="mb-2">
                      <small className="text-muted">
                        {doc.filename}
                        <br />
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;