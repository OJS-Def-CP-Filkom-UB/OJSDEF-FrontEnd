'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTarget } from '@/hooks/use-targets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Nama institusi minimal 2 karakter'),
  url: z.string().url('URL tidak valid — contoh: https://jurnal.universitas.ac.id'),
})
type FormData = z.infer<typeof schema>

export default function NewTargetPage() {
  const router = useRouter()
  const createTarget = useCreateTarget()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', url: '' },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const target = await createTarget.mutateAsync(data)
      router.push(`/targets/${target.id}/verify`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah target')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/targets" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Target
        </Link>
        <h1 className="text-2xl font-bold text-white">Tambah Target OJS</h1>
        <p className="text-slate-400 mt-1 text-sm">Daftarkan instalasi OJS baru untuk dipantau</p>
      </div>

      <div className="glass-dark rounded-xl border border-white/5 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Nama Institusi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Universitas Brawijaya"
                      className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">URL OJS</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://jurnal.universitas.ac.id"
                      className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={createTarget.isPending}
            >
              {createTarget.isPending ? 'Mendaftarkan...' : 'Daftarkan Target'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
