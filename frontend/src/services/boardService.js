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

export const boardService = {
  // Get all boards for current user
  async getBoards() {
    return await api.get('/boards')
  },

  // Get board by ID
  async getBoard(id) {
    return await api.get(`/boards/${id}`)
  },

  // Create new board
  async createBoard(data) {
    return await api.post('/boards', data)
  },

  // Update board
  async updateBoard(id, data) {
    return await api.put(`/boards/${id}`, data)
  },

  // Delete board
  async deleteBoard(id) {
    return await api.delete(`/boards/${id}`)
  },

  // Invite member to board
  async inviteMember(boardId, data) {
    return await api.post(`/boards/${boardId}/invite`, data)
  },

  // Get board invitations
  async getInvitations(boardId) {
    return await api.get(`/boards/${boardId}/invitations`)
  },

  // Archive/Unarchive board
  async archiveBoard(id) {
    return await api.post(`/boards/${id}/archive`)
  },
} 