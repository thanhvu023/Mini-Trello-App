import axios from 'axios'

const API_URL = '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(error.response?.data?.message || 'Có lỗi xảy ra')
  }
)

export const authService = {
  // Register new user
  async register(email) {
    return await api.post('/auth/signup', { email })
  },

  // Login with email and verification code
  async login(email, verificationCode) {
    return await api.post('/auth/signin', { email, verificationCode })
  },

  // Get current user profile
  async getProfile() {
    return await api.get('/auth/me')
  },

  // Resend verification code
  async resendVerification(email) {
    return await api.post('/auth/resend-verification', { email })
  },

  // Verify email with code
  async verifyEmail(email, verificationCode) {
    return await api.post('/auth/verify-email', { email, verificationCode })
  },
} 