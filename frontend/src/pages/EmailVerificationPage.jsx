import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const EmailVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, resendVerification } = useAuth()

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      // Nếu không có email, quay về trang login
      navigate('/login')
    }
  }, [location.state, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!verificationCode.trim()) {
      setError('Vui lòng nhập mã xác thực')
      return
    }

    setLoading(true)
    
    try {
      await login(email, verificationCode)
      // Đăng nhập thành công, chuyển đến dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác thực không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    
    try {
      await resendVerification(email)
      alert('Mã xác thực mới đã được gửi về email!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã xác thực')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Xác thực email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Mã xác thực đã được gửi đến {email}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
              Mã xác thực
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Nhập mã 6 số"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              maxLength={6}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>
            
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Gửi lại mã
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationPage 