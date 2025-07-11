import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import FilingStatus from './pages/FilingStatus';
import TestPage from './pages/TestPage';

// New Tax Return Components
import TaxReturns from './pages/TaxReturns';
import CreateTaxReturn from './pages/CreateTaxReturn';

// Add the FilingStatusHelper import back
import FilingStatusHelper from './components/FilingStatusHelper';

function AppContent() {
  const { user, loading } = useAuth();
  const currentPath = window.location.pathname;
  
  if (loading) {
    return (
      <div className="container text-center">
        <div className="card">
          <h2 className="text-2xl">Loading...</h2>
        </div>
      </div>
    );
  }
  
  // If user is logged in, show appropriate authenticated page
  if (user) {
    // Tax Returns Routes
    if (currentPath === '/tax-returns') {
      return <TaxReturns />;
    } else if (currentPath === '/tax-returns/create') {
      return <CreateTaxReturn />;
    } else if (currentPath.startsWith('/tax-returns/edit/')) {
      // Handle editing existing tax return (e.g., /tax-returns/edit/123)
      const taxReturnId = currentPath.split('/').pop();
      return <CreateTaxReturn taxReturnId={taxReturnId} isEditing={true} />;
    } else if (currentPath.startsWith('/tax-returns/view/')) {
      // Handle viewing specific tax return (e.g., /tax-returns/view/123)
      const taxReturnId = currentPath.split('/').pop();
      return <TaxReturnDetails taxReturnId={taxReturnId} />;
    }
    
    // Filing Status Routes
    else if (currentPath === '/filing-status') {
      return <FilingStatus />;
    } else if (currentPath === '/filing-status-guide') {
      // Now use the actual FilingStatusHelper component
      return <FilingStatusHelper />;
    } else if (currentPath.startsWith('/filing-status/')) {
      // Handle editing existing filing status (e.g., /filing-status/123)
      return <FilingStatus />;
    }
    
    // Default Dashboard
    else {
      return <Dashboard />;
    }
  }
  
  // If not logged in, show appropriate page based on URL
  if (currentPath === '/login') {
    return <LoginForm />;
  } else if (currentPath === '/register') {
    return <RegisterForm />;
  } else {
    return <TestPage />;
  }
}

// Simple Tax Return Details Component (you can create a full one later)
function TaxReturnDetails({ taxReturnId }) {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Load tax return details
    const loadTaxReturn = async () => {
      try {
        // You'll need to add this method to your API service
        // const data = await apiService.getTaxReturn(taxReturnId);
        console.log('Loading tax return:', taxReturnId);
      } catch (error) {
        console.error('Error loading tax return:', error);
      } finally {
        setLoading(false);
      }
    };

    if (taxReturnId) {
      loadTaxReturn();
    }
  }, [taxReturnId]);

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card">
          <h2 className="text-2xl">Loading Tax Return...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-2xl mb-4">Tax Return Details</h2>
        <p>Tax Return ID: {taxReturnId}</p>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Tax Returns
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
