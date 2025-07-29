import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  Grid,
  Calendar,
  Users,
  Star
} from 'lucide-react'

const DashboardPage = () => {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Load boards
    loadBoards()
  }, [user, navigate])

  const loadBoards = async () => {
    try {
      // TODO: Call API to get boards
      // const response = await boardService.getBoards()
      // setBoards(response.data)
      
      // Mock data for now
      setBoards([
        {
          id: 1,
          name: 'Project Alpha',
          description: 'Main project board',
          members: 5,
          tasks: 12,
          color: 'bg-blue-500',
          lastActivity: '2 hours ago'
        },
        {
          id: 2,
          name: 'Marketing Campaign',
          description: 'Q4 marketing activities',
          members: 3,
          tasks: 8,
          color: 'bg-green-500',
          lastActivity: '1 day ago'
        },
        {
          id: 3,
          name: 'Bug Fixes',
          description: 'Critical bug fixes',
          members: 2,
          tasks: 15,
          color: 'bg-red-500',
          lastActivity: '3 hours ago'
        }
      ])
    } catch (error) {
      console.error('Error loading boards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Trello Mini</span>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bảng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block">{user?.name || user?.email}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bảng của tôi</h1>
          <p className="mt-2 text-gray-600">Quản lý và tổ chức công việc của bạn</p>
        </div>

        {/* Create Board Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tạo bảng mới
          </button>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div className={`h-3 ${board.color} rounded-t-lg`}></div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{board.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{board.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{board.members}</span>
                    </div>
                    <div className="flex items-center">
                      <Grid className="h-4 w-4 mr-1" />
                      <span>{board.tasks}</span>
                    </div>
                  </div>
                  <span className="text-xs">{board.lastActivity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBoards.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bảng nào</h3>
            <p className="text-gray-600 mb-4">Tạo bảng đầu tiên để bắt đầu quản lý công việc</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tạo bảng mới
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal - TODO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tạo bảng mới</h2>
            <p className="text-gray-600 mb-4">Tính năng này sẽ được thêm sau</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage 