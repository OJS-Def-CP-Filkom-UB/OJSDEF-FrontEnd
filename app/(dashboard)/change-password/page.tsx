'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth, useChangePassword } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { AlertCircle, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react'

const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Password lama wajib diisi'),
    new_password: z
      .string()
      .min(8, 'Password baru minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus mengandung minimal 1 huruf kapital')
      .regex(/[0-9]/, 'Harus mengandung minimal 1 angka'),
    confirm_password: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Password baru dan konfirmasi tidak cocok',
    path: ['confirm_password'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

// ─── Input password dengan toggle show/hide ────────────────────────────────
function PasswordInput({
  field,
  placeholder,
}: {
  field: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        {...field}
        type={show ? 'text' : 'password'}
        placeholder={placeholder ?? '••••••••'}
        className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500 pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ─── Halaman utama ─────────────────────────────────────────────────────────
export default function ChangePasswordPage() {
  const router = useRouter()
  const { user } = useAuth()
  const changePassword = useChangePassword()
  const [success, setSuccess] = useState(false)

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: '', new_password: '', confirm_password: '' },
  })

  async function onSubmit(data: ChangePasswordForm) {
    try {
      await changePassword.mutateAsync({
        old_password: data.old_password,
        new_password: data.new_password,
      })
      setSuccess(true)
      // Backend mencabut semua refresh token — redirect ke dashboard setelah 2 detik.
      // Access token di memori masih valid (TTL 1 jam) sehingga dashboard bisa diakses.
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      // Error sudah diekspos via changePassword.error
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="glass-dark rounded-xl border border-green-500/20 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Password Berhasil Diubah</h2>
            <p className="text-slate-400 text-sm mt-1">
              Sesi di perangkat lain telah dicabut. Mengarahkan ke beranda…
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Banner — hanya muncul saat must_change_password = true */}
      {user?.must_change_password && (
        <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300/90 text-sm leading-relaxed">
            Anda menggunakan <strong>password sementara</strong>. Ubah sekarang sebelum
            melanjutkan ke dashboard.
          </p>
        </div>
      )}

      <div className="glass-dark rounded-xl border border-white/5 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Ganti Password</h1>
            <p className="text-slate-400 text-sm">
              {user?.must_change_password
                ? 'Buat password baru untuk akun Anda'
                : 'Perbarui password akun Anda'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Password lama / sementara */}
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">
                    {user?.must_change_password ? 'Password Sementara' : 'Password Saat Ini'}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password baru */}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Password Baru</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} />
                  </FormControl>
                  <p className="text-slate-500 text-xs mt-1">
                    Minimal 8 karakter, mengandung huruf kapital dan angka
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Konfirmasi password baru */}
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error dari API */}
            {changePassword.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{changePassword.error.message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              {/* Tombol batal hanya untuk perubahan sukarela (bukan forced) */}
              {!user?.must_change_password && (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-white border border-white/5"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
              )}
              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {changePassword.isPending ? 'Menyimpan...' : 'Simpan Password'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
