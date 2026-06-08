'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface TenantContextValue {
  selectedTenantId: string | null   // null = semua tenant
  setSelectedTenantId: (id: string | null) => void
}

const TenantContext = createContext<TenantContextValue>({
  selectedTenantId: null,
  setSelectedTenantId: () => {},
})

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  return (
    <TenantContext.Provider value={{ selectedTenantId, setSelectedTenantId }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext() {
  return useContext(TenantContext)
}
