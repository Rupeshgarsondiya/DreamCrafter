import React, { useState } from 'react';
import { Moon, Cloud, Star, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthService from '../../services/auth';

const LoginPage = ({ setCurrentPage, onAuthChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const credentials = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    };

    try {
      console.log('Attempting login...');
      const result = await AuthService.login(credentials);
      
      if (result.success) {
        console.log('Login successful:', result.data);
        setSuccessMessage(result.message);
        
        // Clear form
        setFormData({
          email: '',
          password: ''
        });
        
        // Notify parent component about auth change
        if (onAuthChange) {
          onAuthChange(true);
        }
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 1500);
        
      } else {
        console.log('Login failed:', result.error);
        setError(result.message);
        
        // Handle specific error cases
        if (result.error) {
          if (result.error.email) {
            setError(Array.isArray(result.error.email) ? result.error.email[0] : result.error.email);
          } else if (result.error.password) {
            setError(Array.isArray(result.error.password) ? result.error.password[0] : result.error.password);
          } else if (result.error.non_field_errors) {
            setError(Array.isArray(result.error.non_field_errors) ? result.error.non_field_errors[0] : result.error.non_field_errors);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <Moon className="absolute top-10 left-10 w-8 h-8 text-yellow-200 opacity-70 animate-pulse" />
        <Cloud className="absolute top-20 right-20 w-12 h-12 text-white opacity-50 animate-float" />
        <Star className="absolute bottom-20 left-20 w-6 h-6 text-yellow-300 opacity-80 animate-twinkle" />
        <Star className="absolute top-1/3 right-1/3 w-4 h-4 text-purple-200 opacity-60 animate-twinkle" />
        <Star className="absolute bottom-1/3 left-1/4 w-5 h-5 text-blue-200 opacity-70 animate-twinkle" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sign in to explore</h1>
            <p className="text-purple-200">your inner world</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-lg text-green-200 text-center flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-200 text-center flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white focus:outline-none disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-purple-200">
                <input 
                  type="checkbox" 
                  className="mr-2 rounded focus:ring-purple-500 bg-white/10 border-purple-300"
                  disabled={loading}
                />
                Remember me
              </label>
              <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-purple-200">
              New to the dream world?{' '}
              <button 
                onClick={() => setCurrentPage('signup')}
                className="text-purple-400 hover:text-purple-300 font-medium underline focus:outline-none disabled:opacity-50"
                disabled={loading}
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
