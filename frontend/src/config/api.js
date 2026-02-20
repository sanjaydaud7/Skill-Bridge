import axios from 'axios';

// API Base URL - Update this when backend is ready
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
// Note: Token should be passed explicitly when making API calls
// since we're not storing credentials locally
api.interceptors.request.use(
    (config) => {
        // Token will be set manually in each request that requires authentication
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error codes
            if (error.response.status === 401) {
                // Unauthorized - redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API Endpoints Configuration
export const endpoints = {
    // Authentication
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        refreshToken: '/auth/refresh-token',
    },

    // Courses
    courses: {
        getAll: '/courses',
        getById: (id) => `/courses/${id}`,
        enroll: (id) => `/courses/${id}/enroll`,
        getEnrolled: '/courses/enrolled',
        getCurriculum: (id) => `/courses/${id}/curriculum`,
    },

    // Progress
    progress: {
        markVideoComplete: (courseId) => `/courses/${courseId}/progress/video`,
        getProgress: (courseId) => `/courses/${courseId}/progress`,
        updateProgress: (courseId) => `/courses/${courseId}/progress`,
    },

    // Tasks
    tasks: {
        submit: (courseId) => `/courses/${courseId}/tasks/submit`,
        getSubmissions: (courseId) => `/courses/${courseId}/tasks/submissions`,
        getById: (courseId, taskId) => `/courses/${courseId}/tasks/${taskId}`,
    },

    // Projects
    projects: {
        submit: (courseId) => `/courses/${courseId}/project/submit`,
        getSubmission: (courseId) => `/courses/${courseId}/project/submission`,
    },

    // Certificates
    certificates: {
        getAll: '/certificates',
        getById: (id) => `/certificates/${id}`,
        checkEligibility: (id) => `/certificates/${id}/eligibility`,
        initiatePayment: (id) => `/certificates/${id}/payment/initiate`,
        confirmPayment: (id) => `/certificates/${id}/payment/confirm`,
        download: (id) => `/certificates/${id}/download`,
        preview: (id) => `/certificates/${id}/preview`,
    },

    // Payments
    payments: {
        history: '/payments/history',
        getById: (id) => `/payments/${id}`,
    },
};