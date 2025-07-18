import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      newSocket.on('connect', () => {
        console.log('🔌 Connected to socket server')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from socket server')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error)
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      // Disconnect if user is not authenticated
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [user])

  const joinBoard = (boardId) => {
    if (socket && connected) {
      socket.emit('join-board', boardId)
    }
  }

  const leaveBoard = (boardId) => {
    if (socket && connected) {
      socket.emit('leave-board', boardId)
    }
  }

  const onCardUpdate = (callback) => {
    if (socket) {
      socket.on('card-updated', callback)
      return () => socket.off('card-updated', callback)
    }
  }

  const onTaskMove = (callback) => {
    if (socket) {
      socket.on('task-moved', callback)
      return () => socket.off('task-moved', callback)
    }
  }

  const emitCardUpdate = (data) => {
    if (socket && connected) {
      socket.emit('card-updated', data)
    }
  }

  const emitTaskMove = (data) => {
    if (socket && connected) {
      socket.emit('task-moved', data)
    }
  }

  const value = {
    socket,
    connected,
    joinBoard,
    leaveBoard,
    onCardUpdate,
    onTaskMove,
    emitCardUpdate,
    emitTaskMove
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
} 