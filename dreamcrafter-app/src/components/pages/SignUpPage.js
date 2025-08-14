import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sparkles, 
  Star, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Heart,
  Brain,
  Users,
  Shield
} from 'lucide-react';
import AuthService from '../../services/auth';
import styles from './SignUpPage.module.css';

const SignupPage = ({ setCurrentPage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ KEEP EXACT BACKEND CONNECTION CODE - NO CHANGES
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
  // ✅ END OF BACKEND CONNECTION CODE - UNCHANGED

  return (
    <div className={styles.signupPage}>
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
        <div className={styles.floatingElement6}>
          <Users className={styles.floatingIcon} />
        </div>
      </div>

      {/* Animated Particles */}
      <div className={styles.particles}>
        {[...Array(25)].map((_, i) => (
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

      {/* Main Signup Container */}
      <div className={`${styles.signupContainer} ${isVisible ? styles.visible : ''}`}>
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

        {/* Signup Form */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Begin Your Journey</h2>
            <p className={styles.formSubtitle}>
              Step into the dream dimension and unlock the mysteries of your subconscious mind
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.signupForm}>
            {/* Name Fields Row */}
            <div className={styles.nameRow}>
              {/* First Name Field */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <User className={styles.labelIcon} />
                  First Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                    placeholder="Your first name..."
                    required
                  />
                  <div className={styles.inputGlow}></div>
                </div>
                {errors.firstName && (
                  <div className={styles.fieldError}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>

              {/* Last Name Field */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <Users className={styles.labelIcon} />
                  Last Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                    placeholder="Your last name..."
                    required
                  />
                  <div className={styles.inputGlow}></div>
                </div>
                {errors.lastName && (
                  <div className={styles.fieldError}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

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
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Enter your email address..."
                  required
                />
                <div className={styles.inputGlow}></div>
              </div>
              {errors.email && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIcon} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Username Field */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <Shield className={styles.labelIcon} />
                Username
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                  placeholder="Choose a unique username..."
                  required
                />
                <div className={styles.inputGlow}></div>
              </div>
              {errors.username && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIcon} />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Password Fields Row */}
            <div className={styles.passwordRow}>
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
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Create a strong password..."
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
                {errors.password && (
                  <div className={styles.fieldError}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <Lock className={styles.labelIcon} />
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="Confirm your password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className={styles.eyeIcon} />
                    ) : (
                      <Eye className={styles.eyeIcon} />
                    )}
                  </button>
                  <div className={styles.inputGlow}></div>
                </div>
                {errors.confirmPassword && (
                  <div className={styles.fieldError}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className={styles.termsGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                  required
                />
                <div className={styles.checkboxCustom}>
                  {formData.agreeToTerms && (
                    <CheckCircle2 className={styles.checkIcon} />
                  )}
                </div>
                <span className={styles.termsText}>
                  I agree to the{' '}
                  <button type="button" className={styles.termsLink}>
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button type="button" className={styles.termsLink}>
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                <div className={styles.fieldError}>
                  <AlertCircle className={styles.errorIcon} />
                  <span>{errors.agreeToTerms}</span>
                </div>
              )}
            </div>

            {/* General Error/Success Messages */}
            {errors.general && (
              <div className={styles.errorMessage}>
                <AlertCircle className={styles.messageIcon} />
                <span>{errors.general}</span>
              </div>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                <CheckCircle2 className={styles.messageIcon} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className={`${styles.signupButton} ${loading ? styles.loading : ''}`}
            >
              <span className={styles.buttonText}>
                {loading ? 'Creating Your Dream Portal...' : 'Enter the Dream Dimension'}
              </span>
              {loading && (
                <div className={styles.loadingSpinner}>
                  <Moon className={styles.spinnerIcon} />
                </div>
              )}
              <div className={styles.buttonGlow}></div>
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.loginSection}>
            <p className={styles.loginText}>
              Already have a dream portal?{' '}
              <button
                className={styles.loginLink}
                onClick={() => setCurrentPage('login')}
              >
                Sign Into Your Dreams
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

export default SignupPage;
