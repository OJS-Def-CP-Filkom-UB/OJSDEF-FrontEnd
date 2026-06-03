import { useMutation } from '@tanstack/react-query'
import { useAuthContext } from '@/lib/auth-context'
import { api } from '@/lib/api'

export function useAuth() {
  return useAuthContext()
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      api.put('/api/v1/auth/change-password', data).then(() => undefined),
  })
}
