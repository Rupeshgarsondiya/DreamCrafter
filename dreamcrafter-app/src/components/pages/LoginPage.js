import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sparkles, 
  Star, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Heart,
  Brain
} from 'lucide-react';
import AuthService from '../../services/auth';
import styles from './LoginPage.module.css';

const LoginPage = ({ setCurrentPage, onAuthChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ KEEP EXACT BACKEND CONNECTION CODE - NO CHANGES
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
  // ✅ END OF BACKEND CONNECTION CODE - UNCHANGED

  return (
    <div className={styles.loginPage}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingElement1}>
          <Brain className={styles.floatingIcon} />
        </div>
        <div className={styles.floatingElement2}>
          <Moon className={styles.floatingIcon} />
        </div>
        <div className={styles.floatingElement3}>
          <Star className={styles.floatingIcon} />
        </div>
        <div className={styles.floatingElement4}>
          <Sparkles className={styles.floatingIcon} />
        </div>
        <div className={styles.floatingElement5}>
          <Heart className={styles.floatingIcon} />
        </div>
      </div>

      {/* Animated Particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`${styles.particle} ${styles[`particle${i + 1}`]}`}
          ></div>
        ))}
      </div>

      {/* Back to Landing Button */}
      <button 
        className={styles.backButton}
        onClick={() => setCurrentPage('landing')}
        aria-label="Back to landing page"
      >
        <ArrowLeft className={styles.backIcon} />
        <span>Back to Landing</span>
      </button>

      {/* Main Login Container */}
      <div className={`${styles.loginContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoMain}>
              <div className={styles.logoIcon}>
                <Moon className={styles.moonIcon} />
                <div className={styles.logoSparkle}>
                  <Sparkles className={styles.sparkleIcon} />
                </div>
              </div>
              <div className={styles.logoGlow}></div>
            </div>
            <h1 className={styles.brandTitle}>
              <span className={styles.dream}>Dream</span>
              <span className={styles.crafter}>Crafter</span>
            </h1>
            <p className={styles.brandSubtitle}>A velvet lens on your inner world</p>
          </div>
        </div>

        {/* Login Form */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome Back, Dreamer</h2>
            <p className={styles.formSubtitle}>
              Step into your consciousness and unlock the mysteries within
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {/* Email Field */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <Mail className={styles.labelIcon} />
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your email address..."
                  required
                />
                <div className={styles.inputGlow}></div>
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <Lock className={styles.labelIcon} />
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your password..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
                <div className={styles.inputGlow}></div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle className={styles.messageIcon} />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                <CheckCircle2 className={styles.messageIcon} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
            >
              <span className={styles.buttonText}>
                {loading ? 'Entering Dream State...' : 'Enter Your Dreams'}
              </span>
              {loading && (
                <div className={styles.loadingSpinner}>
                  <Moon className={styles.spinnerIcon} />
                </div>
              )}
              <div className={styles.buttonGlow}></div>
            </button>

            {/* Forgot Password */}
            <div className={styles.forgotPassword}>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => {/* Add forgot password logic */}}
              >
                Forgotten your dreams? Recover them here
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className={styles.signupSection}>
            <p className={styles.signupText}>
              New to the dream world?{' '}
              <button
                className={styles.signupLink}
                onClick={() => setCurrentPage('signup')}
              >
                Create Your Dream Account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Velvet Overlay */}
      <div className={styles.velvetOverlay}></div>
    </div>
  );
};

export default LoginPage;
