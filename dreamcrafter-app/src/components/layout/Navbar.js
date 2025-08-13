import React, { useState } from 'react';
import { Moon, Sparkles, LogIn, Home, Zap, User, LogOut } from 'lucide-react';
import AuthService from '../../services/auth';

const Navbar = ({ setCurrentPage, currentPage, isAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setCurrentPage('home');
      window.location.reload(); // Refresh to clear any cached state
    }
  };

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home,
      action: () => setCurrentPage('home')
    },
    { 
      id: 'features', 
      label: 'Features', 
      icon: Zap,
      action: () => setCurrentPage('features')
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative">
              <Moon className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
              <Sparkles className="w-4 h-4 text-pink-500 absolute -top-1 -right-1 group-hover:text-pink-600 transition-colors duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DreamCrafter
              </h1>
              <p className="text-xs text-gray-500 -mt-1">A velvet lens on your inner world</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              {navItems.map(({ id, label, icon: Icon, action }) => (
                <button
                  key={id}
                  onClick={action}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === id
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                  {currentPage === id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors duration-300 hover:bg-purple-50 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors duration-300 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentPage('login')}
                    className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 rounded-lg ${
                      currentPage === 'login'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage('signup')}
                    className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      currentPage === 'signup' ? 'scale-105 shadow-xl' : ''
                    }`}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-purple-50 transition-colors duration-300"
          >
            <div className="flex flex-col space-y-1">
              <div className={`w-5 h-0.5 bg-purple-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-5 h-0.5 bg-purple-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-purple-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2">
              {navItems.map(({ id, label, icon: Icon, action }) => (
                <button
                  key={id}
                  onClick={() => {
                    action();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    currentPage === id
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  {currentPage === id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full ml-auto animate-pulse" />
                  )}
                </button>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setCurrentPage('dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300 w-full"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setCurrentPage('login');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 w-full ${
                        currentPage === 'login'
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Login</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="mx-4 my-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-center font-medium shadow-lg"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
