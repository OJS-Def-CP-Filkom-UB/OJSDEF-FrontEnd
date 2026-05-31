'use client'

import { useAdminUsers, useCreateUser, useUpdateUser } from '@/hooks/use-admin'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { ROLE_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { CheckCircle, Copy, Check, AlertTriangle, X } from 'lucide-react'
import type { CreateUserResponse, UserRole } from '@/types/api'

const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['saas_admin', 'admin_ojs', 'viewer']),
})
type CreateUserForm = z.infer<typeof createUserSchema>

// ─── Komponen tampilkan password sementara ────────────────────────────────────
function CredentialBox({
  result,
  onClose,
}: {
  result: CreateUserResponse
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(result.temp_password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="glass-dark rounded-xl border border-green-500/20 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
          <div>
            <p className="text-white font-semibold">Pengguna berhasil dibuat</p>
            <p className="text-slate-400 text-sm mt-0.5">
              {result.full_name} &mdash; {ROLE_LABELS[result.role as UserRole]}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Password box */}
      <div className="bg-slate-900/70 border border-white/10 rounded-lg p-4 space-y-2">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Password Sementara
        </p>
        <div className="flex items-center gap-3">
          <code className="text-lg font-mono text-cyan-300 tracking-widest flex-1 select-all">
            {result.temp_password}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 text-slate-400 hover:text-white hover:bg-white/5"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-1.5 text-xs">{copied ? 'Disalin!' : 'Salin'}</span>
          </Button>
        </div>
      </div>

      {/* Peringatan */}
      <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-300/90 text-sm leading-relaxed">
          <strong>Password ini hanya ditampilkan sekali.</strong> Simpan dan kirimkan kepada{' '}
          <strong>{result.email}</strong>. Pengguna wajib mengganti password saat pertama login.
        </p>
      </div>
    </div>
  )
}

// ─── Form tambah pengguna ─────────────────────────────────────────────────────
function CreateUserForm({ onCreated }: { onCreated: (result: CreateUserResponse) => void }) {
  const createUser = useCreateUser()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', full_name: '', role: 'admin_ojs' },
  })

  async function onSubmit(data: CreateUserForm) {
    setError(null)
    try {
      const result = await createUser.mutateAsync(data)
      form.reset()
      onCreated(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pengguna')
    }
  }

  return (
    <div className="glass-dark rounded-xl border border-white/5 p-6 space-y-4">
      <h2 className="text-white font-semibold">Tambah Pengguna</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Email</FormLabel>
                <FormControl>
                  <Input className="bg-slate-900/60 border-white/10 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Nama Lengkap</FormLabel>
                <FormControl>
                  <Input className="bg-slate-900/60 border-white/10 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-slate-900/60 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin_ojs">Admin OJS</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="saas_admin">SaaS Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sm:col-span-3 flex items-center gap-3">
            {error && <p className="text-red-400 text-sm flex-1">{error}</p>}
            <Button
              type="submit"
              disabled={createUser.isPending}
              className="bg-primary hover:bg-primary/90 ml-auto"
            >
              {createUser.isPending ? 'Menyimpan...' : 'Tambah Pengguna'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// ─── Halaman utama ─────────────────────────────────────────────────────────────
function UsersContent() {
  const { data: users, isLoading } = useAdminUsers()
  const updateUser = useUpdateUser()
  const [showForm, setShowForm] = useState(false)
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null)

  function handleCreated(result: CreateUserResponse) {
    setShowForm(false)
    setCreatedUser(result)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Pengguna</h1>
          <p className="text-slate-400 mt-1 text-sm">Manajemen akun pengguna platform OJSDef</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setCreatedUser(null)
          }}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? 'Tutup Form' : 'Tambah Pengguna'}
        </Button>
      </div>

      {/* Form tambah pengguna */}
      {showForm && (
        <CreateUserForm onCreated={handleCreated} />
      )}

      {/* Kotak kredensial — muncul setelah create berhasil, dismissable */}
      {createdUser && (
        <CredentialBox
          result={createdUser}
          onClose={() => setCreatedUser(null)}
        />
      )}

      {/* Tabel daftar pengguna */}
      <div className="glass-dark rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !users?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada pengguna terdaftar.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3 text-slate-300">{user.email}</td>
                    <td className="px-6 py-3 text-slate-400">{ROLE_LABELS[user.role as UserRole]}</td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={user.is_active ? 'default' : 'secondary'}
                        className={user.is_active ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-slate-700 text-slate-400'}
                      >
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-white"
                        onClick={() => updateUser.mutate({ id: user.id, data: { is_active: !user.is_active } })}
                        disabled={updateUser.isPending}
                      >
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={['saas_admin']}>
      <UsersContent />
    </RoleGuard>
  )
}
