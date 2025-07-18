import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    if (token) {
      authService.getProfile()
        .then(userData => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, verificationCode) => {
    try {
      setError(null)
      const response = await authService.login(email, verificationCode)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const register = async (email, name) => {
    try {
      setError(null)
      const response = await authService.register(email, name)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setError(null)
  }

  const resendVerification = async (email) => {
    try {
      setError(null)
      await authService.resendVerification(email)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const verifyEmail = async (email, verificationCode) => {
    try {
      setError(null)
      await authService.verifyEmail(email, verificationCode)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resendVerification,
    verifyEmail,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 