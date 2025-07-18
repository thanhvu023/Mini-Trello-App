import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Chỉ hiển thị trang login */}
          <Route path="/login" element={<LoginPage />} />
          {/* Redirect tất cả route khác về login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App 