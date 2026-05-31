import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

// baseURL sengaja kosong — semua panggilan /api/v1/* diteruskan via Next.js rewrite proxy
// ke NEXT_PUBLIC_API_URL (lihat next.config.ts). Ini memastikan cookie dikirim dengan benar
// dan menghindari masalah CORS di development.
export const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config as RetryConfig
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true
      try {
        // Panggil internal proxy route (bukan backend langsung) agar httpOnly cookie dikirim
        const { data } = await axios.post<{ access_token: string }>('/api/auth/refresh')
        setAccessToken(data.access_token)
        config.headers.Authorization = `Bearer ${data.access_token}`
        return api(config)
      } catch {
        setAccessToken(null)
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    const detail = error.response?.data?.detail
    return Promise.reject(new Error(detail ?? 'Terjadi kesalahan'))
  }
)
