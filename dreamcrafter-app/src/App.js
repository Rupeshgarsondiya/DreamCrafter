import React, { useState, useEffect } from 'react';
import './App.css';

// Import layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Import page components
import LandingPage from './components/pages/LandingPage'; // NEW: Combined landing page
import HomePage from './components/pages/HomePage';       // Only shown after login
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignUpPage';
import Dashboard from './components/pages/Dashboard';

// Import AuthService
import AuthService from './services/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // Changed from 'home'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      // If authenticated and on login/signup, go to dashboard
      if (authStatus && (currentPage === 'login' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      }
      // If authenticated and on landing, go to home
      else if (authStatus && currentPage === 'landing') {
        setCurrentPage('home');
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
      setCurrentPage('home'); // Go to actual HomePage after login
    } else {
      setCurrentPage('landing'); // Go back to landing if logged out
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage setCurrentPage={setCurrentPage} />;
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} onAuthChange={handleAuthChange} />;
      case 'signup':
        return <SignupPage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      default:
        return <LandingPage setCurrentPage={setCurrentPage} />;
    }
  };

  // Don't show Navbar/Footer on login/signup pages
  const showNavFooter = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="App">
      {showNavFooter && (
        <Navbar 
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          isAuthenticated={isAuthenticated}
        />
      )}
      
      <main>
        {renderPage()}
      </main>
      
      {showNavFooter && (
        <Footer setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
