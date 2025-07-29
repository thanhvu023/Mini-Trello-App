import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import LoginPage from './pages/LoginPage'
import EmailVerificationPage from './pages/EmailVerificationPage'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Trang đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
          {/* Trang xác thực email */}
          <Route path="/verify" element={<EmailVerificationPage />} />
          {/* Redirect tất cả route khác về login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App 