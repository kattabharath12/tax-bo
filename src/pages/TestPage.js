import React from 'react';

function TestPage() {
  return (
    <div className="container">
      <div className="text-center mb-6">
        <h1 className="text-2xl mb-4">🎯 TaxBox.AI</h1>
        <p className="text-lg">Your Smart Tax Filing Assistant</p>
      </div>
      
      {/* Navigation */}
      <div className="card text-center mb-6">
        <h3 className="text-lg mb-4">Get Started</h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" className="btn btn-primary">Create Account</a>
          <a href="/login" className="btn btn-secondary">Login</a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <h3 className="text-lg mb-4">📋 Easy Filing</h3>
          <p>Simple step-by-step tax filing process</p>
          <a href="/register" className="btn btn-primary">Get Started</a>
        </div>
        
        <div className="card text-center">
          <h3 className="text-lg mb-4">🔒 Secure</h3>
          <p>Bank-level security for your data</p>
          <button className="btn btn-secondary">Learn More</button>
        </div>
        
        <div className="card text-center">
          <h3 className="text-lg mb-4">💰 Save Money</h3>
          <p>Maximize your refund with AI</p>
          <a href="/register" className="btn btn-primary">Calculate</a>
        </div>
      </div>
    </div>
  );
}

export default TestPage;