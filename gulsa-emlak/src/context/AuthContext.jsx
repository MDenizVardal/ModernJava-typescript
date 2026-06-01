import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ge_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('ge_token', data.token)
      localStorage.setItem('ge_user', JSON.stringify(data.user))
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Giriş başarısız' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ge_token')
    localStorage.removeItem('ge_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      const updated = { ...user, ...data }
      localStorage.setItem('ge_user', JSON.stringify(updated))
      setUser(updated)
    } catch { logout() }
  }, [user, logout])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
