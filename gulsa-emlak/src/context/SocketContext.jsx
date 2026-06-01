import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const listenersRef = useRef({})

  useEffect(() => {
    const socket = io('http://localhost:3001', { reconnectionDelay: 1000, reconnectionAttempts: 10 })
    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    // Dinleyicileri yönlendir
    const events = ['property:created','property:updated','property:deleted','images:added','images:deleted']
    events.forEach(ev => {
      socket.on(ev, (data) => {
        const handlers = listenersRef.current[ev] || []
        handlers.forEach(fn => fn(data))
      })
    })

    return () => { socket.disconnect() }
  }, [])

  const on = (event, handler) => {
    if (!listenersRef.current[event]) listenersRef.current[event] = []
    listenersRef.current[event].push(handler)
    return () => {
      listenersRef.current[event] = (listenersRef.current[event] || []).filter(h => h !== handler)
    }
  }

  return (
    <SocketContext.Provider value={{ connected, on }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
