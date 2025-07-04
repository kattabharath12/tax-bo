import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import TestPage from './pages/TestPage';

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

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
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