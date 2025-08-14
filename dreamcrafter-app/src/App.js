import React, { useState, useEffect } from 'react';
import './App.css';

// Import layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Import page components
import LandingPage from './components/pages/LandingPage';
// ✅ REMOVED: HomePage and FeaturesPage since they're not used
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignUpPage';
import Dashboard from './components/pages/Dashboard';

// Import AuthService
import AuthService from './services/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      // If authenticated and on login/signup, go to dashboard
      if (authStatus && (currentPage === 'login' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      }
      // Keep users on landing page (which has all sections)
      else if (authStatus && currentPage === 'landing') {
        setCurrentPage('landing'); // ✅ STAY ON LANDING PAGE
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
      setCurrentPage('landing'); // ✅ STAY ON LANDING PAGE WHEN AUTHENTICATED
    } else {
      setCurrentPage('landing');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
      case 'home':      // ✅ REDIRECT TO LANDING
      case 'features':  // ✅ REDIRECT TO LANDING  
      case 'news':      // ✅ REDIRECT TO LANDING
        return <LandingPage setCurrentPage={setCurrentPage} isAuthenticated={isAuthenticated} />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} onAuthChange={handleAuthChange} />;
      case 'signup':
        return <SignupPage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      default:
        return <LandingPage setCurrentPage={setCurrentPage} isAuthenticated={isAuthenticated} />;
    }
  };

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
