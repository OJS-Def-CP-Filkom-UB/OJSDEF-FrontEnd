'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import axios from 'axios'
import type { UserProfile } from '@/types/api'
import { setAccessToken } from '@/lib/api'

interface AuthContextValue {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{ must_change_password: boolean }>
  logout: () => Promise<void>
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
    return { must_change_password: data.must_change_password }
  }, [])

  const logout = useCallback(async () => {
    await axios.post('/api/auth/logout').catch(() => {})
    setAccessToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
