# Panduan Deployment OJSDef Frontend ke Vercel

## Arsitektur Auth

Frontend menggunakan **custom auth** berbasis httpOnly cookie — **bukan NextAuth**. Alurnya:

```
Login   → POST /api/auth/login (Next.js proxy) → Backend FastAPI
        ← access_token (in-memory via setAccessToken) + refresh_token (httpOnly cookie)

Refresh → POST /api/auth/refresh (otomatis saat mount, baca dari cookie)
Logout  → POST /api/auth/logout (hapus cookie di server)
```

Tidak ada `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, atau dependency NextAuth yang perlu dikonfigurasi.

---

## Prasyarat

- Akun Vercel (https://vercel.com)
- Repository Git (GitHub/GitLab/Bitbucket)
- Backend OJSDef sudah running dan accessible publik

---

## Environment Variables

Hanya **satu** environment variable yang wajib:

| Variable | Contoh Value | Keterangan |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://api.ojsdef.example.com` | URL backend FastAPI — digunakan sebagai target rewrite `/api/v1/*` |

Tambahkan di: Vercel Dashboard → Project → Settings → Environment Variables.

---

## Konfigurasi `next.config.ts`

File ini sudah terkonfigurasi untuk mem-proxy semua request `/api/v1/*` ke backend:

```typescript
import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-ojsdef.zentaza.online'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ]
  },
};

export default nextConfig;
```

Semua `axios.get('/api/v1/targets')` dari frontend akan di-forward ke `${BACKEND_URL}/api/v1/targets` secara transparan — tidak ada CORS issue karena request keluar dari server Vercel, bukan dari browser.

---

## Langkah Deploy

### 1. Pastikan build lokal bersih

```bash
cd OJSDEF-FrontEnd
npx tsc --noEmit   # zero TypeScript errors
npm run build      # build sukses
```

### 2. Push ke repository Git

```bash
git push origin main
```

### 3. Import ke Vercel

1. Buka https://vercel.com → **Add New... → Project**
2. **Import Git Repository** → pilih repo frontend
3. Framework Preset: **Next.js** (terdeteksi otomatis)
4. Tambahkan environment variable: `NEXT_PUBLIC_API_URL` = URL backend production
5. Klik **Deploy**

Build berlangsung ~2–3 menit. Setelah selesai mendapat URL seperti `https://ojsdef-frontend.vercel.app`.

### 4. Set Custom Domain (opsional)

Project Settings → **Domains** → Add domain → ikuti instruksi DNS.

---

## CORS di Backend

Setelah deploy, tambahkan domain Vercel ke `ALLOWED_ORIGINS` di `.env` backend:

```env
ALLOWED_ORIGINS=https://ojsdef-frontend.vercel.app,https://ojsdef.example.com
```

Restart FastAPI:
```bash
docker compose up -d fastapi
```

---

## Automatic Deployments

| Trigger | Hasil |
|---------|-------|
| Push ke `main` | Auto-deploy ke production |
| Buka PR | Preview URL terpisah |
| Dashboard → Deployments | Rollback ke commit mana pun |

---

## Troubleshooting

### Build gagal

```bash
npx tsc --noEmit   # cek TypeScript errors
npm run lint       # cek ESLint errors
npm run build      # cek build errors
```

Push fix, Vercel otomatis re-deploy.

### API calls gagal (Network Error)

1. Cek `NEXT_PUBLIC_API_URL` sudah benar di Vercel env vars
2. Cek backend accessible: `curl https://api.ojsdef.example.com/health`
3. Cek `ALLOWED_ORIGINS` di backend sudah include domain Vercel
4. DevTools → Network → cek request `/api/v1/...` diteruskan dengan benar

### Login gagal / session tidak persist

1. Backend harus dapat diakses dari internet (bukan hanya lokal)
2. Cek cookie `ojsdef_refresh` ada di browser: DevTools → Application → Cookies
3. Backend harus set cookie dengan `SameSite=Lax; Secure; HttpOnly` agar diterima Vercel

---

## Lokal Development

```bash
# Buat .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
# Buka http://localhost:3000
```

---

## Monitoring

```bash
npm install -g vercel
vercel login
vercel logs --follow   # stream logs production
```

Atau: Vercel Dashboard → Project → **Logs** tab.
