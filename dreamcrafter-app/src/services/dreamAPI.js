import axiosInstance from '../utils/axios';

class DreamAPI {
    /**
     * Upload and process EEG file - Main endpoint for Dashboard
     */
    async uploadAndProcessEEG(file, onUploadProgress = null) {
        try {
            const formData = new FormData();
            formData.append('eeg_file', file);

            console.log('Uploading EEG file:', file.name);

            const response = await axiosInstance.post('dreams/upload-process/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onUploadProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onUploadProgress(progress);
                    }
                },
                timeout: 300000, // 5 minutes timeout for processing
            });

            console.log('EEG processing response:', response.data);

            return {
                success: true,
                data: response.data,
                message: response.data.message || 'EEG file processed successfully!'
            };

        } catch (error) {
            console.error('EEG upload/process error:', error);
            
            const errorData = error.response?.data || { error: 'Upload failed' };
            
            return {
                success: false,
                error: errorData,
                message: this.extractErrorMessage(errorData)
            };
        }
    }

    /**
     * Get user's prediction history
     */
    async getUserPredictions(page = 1, limit = 10, status = null) {
        try {
            let url = `dreams/predictions/?page=${page}&limit=${limit}`;
            if (status) {
                url += `&status=${status}`;
            }

            const response = await axiosInstance.get(url);

            return {
                success: true,
                data: response.data,
            };

        } catch (error) {
            console.error('Get predictions error:', error);
            return {
                success: false,
                error: error.response?.data || { error: 'Failed to get predictions' },
                message: this.extractErrorMessage(error.response?.data)
            };
        }
    }

    /**
     * Get specific prediction status
     */
    async getPredictionStatus(predictionId) {
        try {
            const response = await axiosInstance.get(`dreams/predictions/${predictionId}/`);

            return {
                success: true,
                data: response.data,
            };

        } catch (error) {
            console.error('Get prediction status error:', error);
            return {
                success: false,
                error: error.response?.data || { error: 'Failed to get prediction status' }
            };
        }
    }

    /**
     * Get user profile with dream statistics
     */
    async getUserProfile() {
        try {
            const response = await axiosInstance.get('dreams/profile/');

            return {
                success: true,
                data: response.data,
            };

        } catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                error: error.response?.data || { error: 'Failed to get profile' }
            };
        }
    }

    /**
     * Delete a prediction
     */
    async deletePrediction(predictionId) {
        try {
            const response = await axiosInstance.delete(`dreams/predictions/${predictionId}/delete/`);

            return {
                success: true,
                data: response.data,
                message: 'Prediction deleted successfully'
            };

        } catch (error) {
            console.error('Delete prediction error:', error);
            return {
                success: false,
                error: error.response?.data || { error: 'Failed to delete prediction' },
                message: this.extractErrorMessage(error.response?.data)
            };
        }
    }

    /**
     * Check API health
     */
    async checkHealth() {
        try {
            const response = await axiosInstance.get('dreams/health/');

            return {
                success: true,
                data: response.data,
            };

        } catch (error) {
            console.error('Health check error:', error);
            return {
                success: false,
                error: error.response?.data || { error: 'Health check failed' }
            };
        }
    }

    /**
     * Extract meaningful error message from API response
     */
    extractErrorMessage(errorData) {
        if (typeof errorData === 'string') {
            return errorData;
        }

        if (errorData?.error) {
            return errorData.error;
        }

        if (errorData?.message) {
            return errorData.message;
        }

        if (errorData?.detail) {
            return errorData.detail;
        }

        // Check for field-specific errors
        const fieldErrors = [];
        ['eeg_file', 'file', 'non_field_errors'].forEach(field => {
            if (errorData?.[field]) {
                const error = Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field];
                fieldErrors.push(error);
            }
        });

        if (fieldErrors.length > 0) {
            return fieldErrors.join(', ');
        }

        return 'An unexpected error occurred. Please try again.';
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Validate EEG file before upload
     */
    validateEEGFile(file) {
        const errors = [];

        // Check file extension
        if (!file.name.toLowerCase().endsWith('.edf')) {
            errors.push('Only .edf files are supported');
        }

        // Check file size (max 200MB)
        const maxSize = 200 * 1024 * 1024; // 200MB
        if (file.size > maxSize) {
            errors.push(`File too large. Maximum size: ${this.formatFileSize(maxSize)}`);
        }

        // Check minimum file size
        if (file.size < 1024) { // 1KB
            errors.push('File too small. Please upload a valid EEG file');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

const dreamAPI = new DreamAPI();
export default dreamAPI;
