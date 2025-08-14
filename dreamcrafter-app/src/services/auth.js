import axiosInstance from '../utils/axios';

class AuthService {
  // User Registration
  async register(userData) {
    try {
      console.log('Attempting registration with:', userData);
      const response = await axiosInstance.post('auth/register/', userData);
      
      console.log('Registration response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Registration successful! Please check your email for verification.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorData = error.response?.data || { error: 'Registration failed' };
      
      return {
        success: false,
        error: errorData,
        message: this.extractErrorMessage(errorData)
      };
    }
  }

  // User Login
  async login(credentials) {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await axiosInstance.post('auth/login/', credentials);
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        // Store token and user data with DreamCrafter prefix
        localStorage.setItem('dreamcraft_token', response.data.token);
        localStorage.setItem('dreamcraft_user', JSON.stringify(response.data.user));
        
        console.log('Token stored successfully');
      }
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Welcome back to DreamCrafter!'
      };
    } catch (error) {
      console.error('Login error:', error);
      
      const errorData = error.response?.data || { error: 'Login failed' };
      
      return {
        success: false,
        error: errorData,
        message: this.extractErrorMessage(errorData)
      };
    }
  }

  // User Logout
  async logout() {
    try {
      await axiosInstance.post('auth/logout/');
      
      // Clear local storage
      localStorage.removeItem('dreamcraft_token');
      localStorage.removeItem('dreamcraft_user');
      
      console.log('Logout successful');
      
      return {
        success: true,
        message: 'Logged out successfully. Sweet dreams!'
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear local storage even if API call fails
      localStorage.removeItem('dreamcraft_token');
      localStorage.removeItem('dreamcraft_user');
      
      return {
        success: false,
        error: error.response?.data || { error: 'Logout failed' },
        message: 'Logged out locally due to error'
      };
    }
  }

  // Get Current User Profile
  async getProfile() {
    try {
      const response = await axiosInstance.get('auth/profile/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data || { error: 'Failed to get profile' }
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('dreamcraft_token');
    return !!token;
  }

  // Get current user data
  getCurrentUser() {
    const userStr = localStorage.getItem('dreamcraft_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('dreamcraft_token');
  }

  // Extract meaningful error message from API response
  extractErrorMessage(errorData) {
    if (typeof errorData === 'string') {
      return errorData;
    }

    if (errorData.error) {
      return errorData.error;
    }

    if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors[0] 
        : errorData.non_field_errors;
    }

    // Check for field-specific errors
    const fieldErrors = [];
    ['email', 'password', 'username', 'first_name', 'last_name'].forEach(field => {
      if (errorData[field]) {
        const error = Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field];
        fieldErrors.push(`${field}: ${error}`);
      }
    });

    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ');
    }

    return 'An unexpected error occurred. Please try again.';
  }
}

const authInstance = new AuthService();
export default authInstance;
