'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import axios from 'axios'
import type { UserProfile } from '@/types/api'
import { api, setAccessToken } from '@/lib/api'

interface AuthContextValue {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{ must_change_password: boolean; must_link_telegram: boolean }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session silently on mount using httpOnly cookie
  useEffect(() => {
    axios
      .post<{ access_token: string; user: UserProfile }>('/api/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.access_token)
        setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await axios.post<{
      access_token: string
      user: UserProfile
      must_change_password: boolean
    }>('/api/auth/login', { email, password })
    setAccessToken(data.access_token)
    setUser(data.user)
    const must_link_telegram =
      data.user?.role === 'admin_ojs' && !data.user?.telegram_chat_id
    return { must_change_password: data.must_change_password, must_link_telegram }
  }, [])

  const logout = useCallback(async () => {
    await axios.post('/api/auth/logout').catch(() => {})
    setAccessToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<UserProfile>('/api/v1/auth/me')
      setUser(data)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('[refreshUser]', err)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
