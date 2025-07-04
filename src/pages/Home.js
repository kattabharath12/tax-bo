import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="row">
      <div className="col-lg-8 mx-auto">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">Welcome to TaxBox.AI</h1>
          <p className="lead">
            Automated tax filing made simple. Upload your documents, let AI handle the calculations, 
            and file your taxes with confidence.
          </p>
        </div>

        {!currentUser ? (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">New User?</h5>
                  <p className="card-text">
                    Create your account and start filing your taxes in minutes.
                  </p>
                  <Link to="/register" className="btn btn-primary">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Returning User?</h5>
                  <p className="card-text">
                    Sign in to continue with your tax return.
                  </p>
                  <Link to="/login" className="btn btn-outline-primary">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3>Welcome back, {currentUser.full_name}!</h3>
            <p className="mb-4">Ready to continue with your tax return?</p>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          </div>
        )}

        <div className="row mt-5">
          <div className="col-md-4 text-center">
            <div className="mb-3">
              <i className="fas fa-upload fa-3x text-primary"></i>
            </div>
            <h5>Upload Documents</h5>
            <p>Securely upload your W-2s, 1099s, and other tax documents.</p>
          </div>
          <div className="col-md-4 text-center">
            <div className="mb-3">
              <i className="fas fa-calculator fa-3x text-primary"></i>
            </div>
            <h5>AI Calculations</h5>
            <p>Our AI automatically calculates your taxes and finds deductions.</p>
          </div>
          <div className="col-md-4 text-center">
            <div className="mb-3">
              <i className="fas fa-file-alt fa-3x text-primary"></i>
            </div>
            <h5>E-File</h5>
            <p>File your return electronically and track your refund status.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;