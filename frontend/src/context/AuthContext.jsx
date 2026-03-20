import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('fgs_token')
    const saved  = localStorage.getItem('fgs_user')
    if (token && saved) {
      try {
        const u = JSON.parse(saved)
        setUser(u)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('fgs_token', data.token)
    localStorage.setItem('fgs_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('fgs_token', data.token)
    localStorage.setItem('fgs_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fgs_token')
    localStorage.removeItem('fgs_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
