import React, { useState, useEffect } from 'react';
import './App.css';

// Import layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Import page components
import HomePage from './components/pages/HomePage';
import FeaturesPage from './components/pages/FeaturesPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignUpPage';
import Dashboard from './components/pages/Dashboard';

// Import AuthService to check authentication status
import AuthService from './services/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      // If user is authenticated and on login/signup, redirect to dashboard
      if (authStatus && (currentPage === 'login' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      }
    };

    checkAuth();
    
    // Check auth status periodically or on storage change
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPage]);

  // Function to handle authentication state changes
  const handleAuthChange = (authStatus) => {
    setIsAuthenticated(authStatus);
    if (authStatus) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'features':
        return <FeaturesPage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} onAuthChange={handleAuthChange} />;
      case 'signup':
        return <SignupPage setCurrentPage={setCurrentPage} onAuthChange={handleAuthChange} />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} onAuthChange={handleAuthChange} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  // Don't show navbar on dashboard - it has its own navigation
  const showNavbar = currentPage !== 'dashboard';
  const showFooter = currentPage !== 'dashboard' && currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="App">
      {/* Conditional Navbar */}
      {showNavbar && (
        <Navbar 
          setCurrentPage={setCurrentPage} 
          currentPage={currentPage}
          isAuthenticated={isAuthenticated}
        />
      )}
      
      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
      
      {/* Conditional Footer */}
      {showFooter && (
        <Footer setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
