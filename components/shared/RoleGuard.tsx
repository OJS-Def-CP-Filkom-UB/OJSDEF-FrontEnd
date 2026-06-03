'use client'

import type { UserRole } from '@/types/api'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: Props) {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <p className="text-sm text-muted-foreground/60 p-8">Akses Ditolak</p>
    )
  }
  return <>{children}</>
}
