import React, { useState } from 'react';
import { Moon, Cloud, Star, Eye, EyeOff, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthService from '../../services/auth';

const SignupPage = ({ setCurrentPage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '', // Added username field required by Django
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear general error
    if (errors.general) {
      setErrors({
        ...errors,
        general: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Client-side validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password match validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Password strength validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Transform data to match Django API format
    const apiData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirmPassword
    };

    try {
      console.log('Submitting registration data...');
      const result = await AuthService.register(apiData);
      
      if (result.success) {
        setSuccessMessage(result.message);
        console.log('Registration successful!');
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          agreeToTerms: false
        });
        
        // Redirect to login after successful registration
        setTimeout(() => {
          setCurrentPage('login');
        }, 3000);
        
      } else {
        console.log('Registration failed:', result.error);
        
        // Handle backend validation errors
        if (result.error) {
          const backendErrors = {};
          
          // Map Django field names to React field names
          const fieldMapping = {
            'first_name': 'firstName',
            'last_name': 'lastName',
            'confirm_password': 'confirmPassword',
            'email': 'email',
            'username': 'username',
            'password': 'password'
          };
          
          Object.keys(result.error).forEach(key => {
            const frontendKey = fieldMapping[key] || key;
            
            if (Array.isArray(result.error[key])) {
              backendErrors[frontendKey] = result.error[key][0];
            } else {
              backendErrors[frontendKey] = result.error[key];
            }
          });
          
          // Handle non-field errors
          if (result.error.non_field_errors) {
            backendErrors.general = Array.isArray(result.error.non_field_errors) 
              ? result.error.non_field_errors[0] 
              : result.error.non_field_errors;
          }
          
          setErrors(backendErrors);
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (err) {
      console.error('Unexpected registration error:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
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
            <h1 className="text-3xl font-bold text-white mb-2">Begin your journey</h1>
            <p className="text-purple-200">into the dream dimension</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-lg text-green-200 text-center flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-200 text-center flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                      errors.firstName ? 'border-red-400' : 'border-purple-300/30'
                    } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-300 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                      errors.lastName ? 'border-red-400' : 'border-purple-300/30'
                    } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    required
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-300 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

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
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                    errors.email ? 'border-red-400' : 'border-purple-300/30'
                  } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                    errors.username ? 'border-red-400' : 'border-purple-300/30'
                  } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                />
              </div>
              {errors.username && (
                <p className="text-red-300 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.username}
                </p>
              )}
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
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${
                    errors.password ? 'border-red-400' : 'border-purple-300/30'
                  } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
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
              {errors.password && (
                <p className="text-red-300 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${
                    errors.confirmPassword ? 'border-red-400' : 'border-purple-300/30'
                  } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white focus:outline-none disabled:opacity-50"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                disabled={loading}
                className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                required
              />
              <label className="text-sm text-purple-200">
                I agree to the{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-300 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.agreeToTerms}
              </p>
            )}

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
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-purple-200">
              Already have a dream portal?{' '}
              <button 
                onClick={() => setCurrentPage('login')}
                className="text-purple-400 hover:text-purple-300 font-medium underline focus:outline-none disabled:opacity-50"
                disabled={loading}
              >
                Sign In
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

export default SignupPage;
