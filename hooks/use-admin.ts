import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdminUserListItem,
  AdminPlatformStats,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  Tenant,
  CreateTenantRequest,
} from '@/types/api'

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () =>
      api.get<AdminUserListItem[]>('/api/v1/admin/users').then((r) => r.data),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      api.post<CreateUserResponse>('/api/v1/admin/users', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      api
        .patch<AdminUserListItem>(`/api/v1/admin/users/${id}`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminTenants() {
  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => api.get<Tenant[]>('/api/v1/admin/tenants').then((r) => r.data),
  })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenantRequest) =>
      api.post<Tenant>('/api/v1/admin/tenants', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tenants'] }),
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      api.get<AdminPlatformStats>('/api/v1/admin/stats').then((r) => r.data),
    staleTime: 30_000,
  })
}
