import React, { useState, useEffect } from 'react';

import './App.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import Dashboard from './components/pages/Dashboard';

import authService from './services/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);

      if (authStatus && (currentPage === 'login' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      }

      if (!authStatus && currentPage === 'dashboard') {
        setCurrentPage('landing');
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPage]);

  const handleAuthChange = (authStatus) => {
    setIsAuthenticated(authStatus);
    if (authStatus) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('landing');
    }
  };

  const handlePageChange = (page) => {
    if (page === 'dashboard' && !isAuthenticated) {
      alert('Please login to access the Dashboard.');
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

 // App.js
return (
  <>
    {currentPage === 'landing' && (
      <>
        <Navbar
          isAuthenticated={isAuthenticated}
          setCurrentPage={handlePageChange}
          currentPage={currentPage}
        />
        {/* Add the class for homepage content */}
        <div className="landing-main-content">
          <LandingPage />
        </div>
        <Footer />
      </>
    )}

    {currentPage === 'login' && (
      <div className="login-main-content">
        <LoginPage
          onAuthChange={handleAuthChange}
          setCurrentPage={handlePageChange}
        />
      </div>
    )}

    {currentPage === 'signup' && (
      <div className="signup-main-content">
        <SignUpPage
          onAuthChange={handleAuthChange}
          setCurrentPage={handlePageChange}
        />
      </div>
    )}

    {currentPage === 'dashboard' && isAuthenticated && <Dashboard onAuthChange={handleAuthChange} />}
  </>
);

}

export default App;
