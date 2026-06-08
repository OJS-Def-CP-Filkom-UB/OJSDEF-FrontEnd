# Telegram Bot Notification System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementasi sistem notifikasi Telegram bot end-to-end — linking akun, welcome message, critical alert, dan scan completion — dengan mandatory Telegram setup gate untuk role `admin_ojs`.

**Architecture:** FastAPI webhook endpoint (`POST /telegram/webhook`) menerima update dari Telegram Bot API. One-time token (TTL 7 hari) digunakan untuk linking akun. Frontend polling `GET /api/v1/auth/me` setiap 3 detik di setup page untuk deteksi linking berhasil. Celery notifications queue menangani pengiriman pesan secara async.

**Tech Stack:** FastAPI, SQLAlchemy async, Celery, httpx (Telegram API), Next.js 16, TanStack Query v5, Zod v4.

**Spec:** `docs/superpowers/specs/2026-06-06-telegram-notification-design.md`

---

## Execution Order (Parallel Phases)

```
Phase 1 ──── Task 1 (Backend Foundation)  ─┐
         └── Task 2 (Frontend Foundation) ─┘ PARALLEL

Phase 2 ──── Task 3 (Backend Routers)     ─┐ depends on Task 1
         └── Task 4 (Frontend Pages)      ─┘ depends on Task 2 — PARALLEL

Phase 3 ──── Task 5 (Workers + Main)      ─── depends on Task 3 (sequential)

Phase 4 ──── Task 6 (Tests + .env)        ─── depends on all above
```

---

## Task 1 — Backend Foundation (Config + Migration + Models + Schemas)

**Run in parallel with Task 2.**

**Files:**
- Modify: `OJSDEF-BackEnd/app/config.py`
- Modify: `OJSDEF-BackEnd/app/models/user.py`
- Modify: `OJSDEF-BackEnd/app/models/notification.py`
- Modify: `OJSDEF-BackEnd/app/schemas/admin.py`
- Modify: `OJSDEF-BackEnd/app/schemas/auth.py`
- Modify: `OJSDEF-BackEnd/app/routers/auth.py`
- Create: `OJSDEF-BackEnd/migrations/versions/005_telegram_notification.py`

**Working directory:** `OJSDEF-BackEnd`

---

- [ ] **Step 1.1 — Tambah 3 env vars ke `app/config.py`**

Tambah 3 field baru di class `Settings` setelah `telegram_bot_token`:

```python
# app/config.py — tambah setelah baris: telegram_bot_token: str = ""
telegram_webhook_secret: str = ""
telegram_bot_username: str = ""
frontend_base_url: str = "http://localhost:3000"
```

- [ ] **Step 1.2 — Tambah 3 field ke model User**

File: `app/models/user.py`. Tambah import `datetime` dan 3 field baru setelah `telegram_chat_id`:

```python
# Tambah ke bagian import:
from datetime import datetime

# Tambah setelah baris: telegram_chat_id: Mapped[str | None] = ...
telegram_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
telegram_link_token: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
telegram_link_token_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

Juga tambah `DateTime` ke sqlalchemy imports:
```python
from sqlalchemy import String, Boolean, ForeignKey, DateTime
```

- [ ] **Step 1.3 — Buat migration 005**

Buat file `migrations/versions/005_telegram_notification.py`:

```python
"""005_telegram_notification

Revision ID: 005
Revises: 004
Create Date: 2026-06-06
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('telegram_username', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('telegram_link_token', sa.String(64), nullable=True))
    op.create_unique_constraint('uq_users_telegram_link_token', 'users', ['telegram_link_token'])
    op.add_column('users', sa.Column(
        'telegram_link_token_expires',
        sa.DateTime(timezone=True),
        nullable=True,
    ))
    op.alter_column('notifications', 'job_id', nullable=True)


def downgrade() -> None:
    op.alter_column('notifications', 'job_id', nullable=False)
    op.drop_column('users', 'telegram_link_token_expires')
    op.drop_constraint('uq_users_telegram_link_token', 'users', type_='unique')
    op.drop_column('users', 'telegram_link_token')
    op.drop_column('users', 'telegram_username')
```

- [ ] **Step 1.4 — Jalankan migration**

```bash
alembic upgrade head
```

Expected output: `Running upgrade 004 -> 005, 005_telegram_notification`

- [ ] **Step 1.5 — Update `app/models/notification.py` — job_id nullable**

Ubah field `job_id` dari non-nullable ke nullable:

```python
# Ganti baris:
# job_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("scan_jobs.id"), nullable=False)
# Menjadi:
job_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("scan_jobs.id"), nullable=True)
```

- [ ] **Step 1.6 — Update `app/schemas/auth.py` — tambah `telegram_username` ke `UserResponse`**

```python
# Tambah 1 field ke class UserResponse (setelah telegram_chat_id):
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    must_change_password: bool
    notif_email: bool
    notif_telegram: bool
    telegram_chat_id: str | None
    telegram_username: str | None  # BARU
```

- [ ] **Step 1.7 — Update return UserResponse di `app/routers/auth.py`**

Ada 2 tempat yang return `UserResponse(...)`: di `GET /me` dan `PUT /me`. Tambah `telegram_username=user.telegram_username` ke keduanya:

```python
# Endpoint GET /me dan PUT /me:
return UserResponse(
    id=str(user.id), email=user.email, full_name=user.full_name,
    role=user.role, must_change_password=user.must_change_password,
    notif_email=user.notif_email, notif_telegram=user.notif_telegram,
    telegram_chat_id=user.telegram_chat_id,
    telegram_username=user.telegram_username,  # BARU
)
```

- [ ] **Step 1.8 — Update `app/schemas/admin.py` — tambah field ke request dan response**

```python
# app/schemas/admin.py — file lengkap setelah diubah:
from pydantic import BaseModel, EmailStr
from app.schemas.auth import UserResponse, UserRole


class CreateUserRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    tenant_id: str | None = None
    new_tenant_name: str | None = None
    telegram_username: str | None = None  # BARU


class CreateUserResponse(UserResponse):
    """Response untuk POST /admin/users — temp_password dan deeplink hanya muncul sekali."""
    temp_password: str
    telegram_bot_deeplink: str  # BARU


class PatchUserRequest(BaseModel):
    is_active: bool | None = None
    role: UserRole | None = None


class CreateTenantRequest(BaseModel):
    name: str
    slug: str


class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    is_active: bool
```

- [ ] **Step 1.9 — Syntax check semua file yang diubah**

```bash
python -c "
import ast, sys
files = [
    'app/config.py', 'app/models/user.py', 'app/models/notification.py',
    'app/schemas/auth.py', 'app/schemas/admin.py', 'app/routers/auth.py',
]
errors = []
for f in files:
    try:
        ast.parse(open(f).read())
    except SyntaxError as e:
        errors.append(f'{f}: {e}')
print('OK' if not errors else '\n'.join(errors))
"
```

Expected: `OK`

- [ ] **Step 1.10 — Commit Task 1**

```bash
git add app/config.py app/models/user.py app/models/notification.py \
        app/schemas/auth.py app/schemas/admin.py app/routers/auth.py \
        migrations/versions/005_telegram_notification.py
git commit -m "feat: add telegram linking fields to user model and update schemas (migration 005)"
```

---

## Task 2 — Frontend Foundation (Types + Auth Context + AppShell + Login)

**Run in parallel with Task 1.**

**Files:**
- Modify: `OJSDEF-FrontEnd/types/api.ts`
- Modify: `OJSDEF-FrontEnd/lib/auth-context.tsx`
- Modify: `OJSDEF-FrontEnd/components/layout/AppShell.tsx`
- Modify: `OJSDEF-FrontEnd/app/(auth)/login/page.tsx`

**Working directory:** `OJSDEF-FrontEnd`

---

- [ ] **Step 2.1 — Update `types/api.ts` — 3 field baru**

```typescript
// UserProfile: tambah telegram_username setelah telegram_chat_id
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  must_change_password: boolean
  notif_email: boolean
  notif_telegram: boolean
  telegram_chat_id: string | null
  telegram_username: string | null  // BARU
}

// CreateUserRequest: tambah telegram_username
export interface CreateUserRequest {
  email: string
  full_name: string
  role: UserRole
  tenant_id?: string
  new_tenant_name?: string
  telegram_username?: string  // BARU
}

// CreateUserResponse: tambah telegram_bot_deeplink
export interface CreateUserResponse extends UserProfile {
  temp_password: string
  telegram_bot_deeplink: string  // BARU
}
```

- [ ] **Step 2.2 — Update `lib/auth-context.tsx` — tambah `refreshUser` dan `must_link_telegram`**

Ganti file lengkap dengan versi berikut:

```typescript
'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import axios from 'axios'
import type { UserProfile } from '@/types/api'
import { setAccessToken, api } from '@/lib/api'

interface AuthContextValue {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{
    must_change_password: boolean
    must_link_telegram: boolean
  }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    const must_link_telegram =
      data.user?.role === 'admin_ojs' && !data.user?.telegram_chat_id
    return { must_change_password: data.must_change_password, must_link_telegram }
  }, [])

  const logout = useCallback(async () => {
    await axios.post('/api/auth/logout').catch(() => {})
    setAccessToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<UserProfile>('/api/v1/auth/me')
      setUser(data)
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2.3 — Update `components/layout/AppShell.tsx` — tambah Telegram gate**

```typescript
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/use-auth";

const TELEGRAM_EXEMPT_PATHS = ['/setup/telegram', '/change-password']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
      return
    }
    if (!isLoading && user?.role === 'admin_ojs' && !user.telegram_chat_id) {
      if (!TELEGRAM_EXEMPT_PATHS.includes(pathname)) {
        router.replace('/setup/telegram')
      }
    }
  }, [isLoading, user, router, pathname])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Memuat sesi...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
        <footer className="h-10 border-t border-white/5 bg-black/20 px-8 flex items-center justify-between pointer-events-none text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/30">
          <span>&copy; 2026 OJSDEF INTEGRATED SECURITY</span>
          <div className="flex items-center gap-4 tracking-widest text-muted-foreground/20">
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-secondary animate-pulse" />
              Engine: Active
            </span>
            <span>v1.0.0-STABLE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2.4 — Update `app/(auth)/login/page.tsx` — tambah redirect `must_link_telegram`**

Ganti blok `onSubmit` (mulai dari `const result = await login...`):

```typescript
async function onSubmit(data: LoginForm) {
  setError(null)
  try {
    const result = await login(data.email, data.password)
    if (result.must_change_password) {
      router.push('/change-password')
    } else if (result.must_link_telegram) {
      router.push('/setup/telegram')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login gagal')
  }
}
```

- [ ] **Step 2.5 — Pastikan TypeScript tidak error**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: tidak ada error terkait file yang baru diubah.

- [ ] **Step 2.6 — Commit Task 2**

```bash
git add types/api.ts lib/auth-context.tsx components/layout/AppShell.tsx \
        "app/(auth)/login/page.tsx"
git commit -m "feat: update types and auth context for telegram linking gate"
```

---

## Task 3 — Backend Routers (Setelah Task 1 selesai)

**Run in parallel with Task 4. Depends on Task 1.**

**Files:**
- Modify: `OJSDEF-BackEnd/app/routers/admin.py`
- Modify: `OJSDEF-BackEnd/app/routers/auth.py`
- Create: `OJSDEF-BackEnd/app/routers/telegram_bot.py`

**Working directory:** `OJSDEF-BackEnd`

---

- [ ] **Step 3.1 — Update `app/routers/admin.py` — generate token + deeplink saat create user**

File saat ini sudah import `secrets` di baris 3. Tambah imports berikut di bagian atas:

```python
from datetime import datetime, timedelta, timezone
from app.config import get_settings
settings = get_settings()
```

Ganti blok setelah `db.add(user)` di fungsi `create_user` (ganti dari `db.add(user)` hingga akhir fungsi):

```python
    # Generate telegram linking token (TTL 7 hari)
    link_token = secrets.token_urlsafe(32)
    link_expires = datetime.now(timezone.utc) + timedelta(days=7)
    user.telegram_username = body.telegram_username
    user.telegram_link_token = link_token
    user.telegram_link_token_expires = link_expires

    db.add(user)
    await db.commit()
    await db.refresh(user)
    await create_audit_log(
        db, user_id=None, user_email="saas_admin",
        tenant_id=str(tid), action="user.created",
        resource_type="user", resource_id=str(user.id),
        details={"email": user.email, "role": user.role},
    )
    deeplink = f"https://t.me/{settings.telegram_bot_username}?start={link_token}"
    return CreateUserResponse(
        id=str(user.id), email=user.email, full_name=user.full_name,
        role=user.role, must_change_password=user.must_change_password,
        notif_email=user.notif_email, notif_telegram=user.notif_telegram,
        telegram_chat_id=user.telegram_chat_id,
        telegram_username=user.telegram_username,
        temp_password=temp_password,
        telegram_bot_deeplink=deeplink,
    )
```

- [ ] **Step 3.2 — Tambah endpoint `GET /telegram-link` di `app/routers/auth.py`**

Tambah import di bagian atas (jika belum ada):
```python
import secrets
from datetime import datetime, timedelta, timezone
from app.config import get_settings
settings_auth = get_settings()
```

Tambah endpoint baru setelah `PUT /change-password`:

```python
@router.get("/telegram-link")
async def get_telegram_link(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current["sub"]))
    user = result.scalar_one()
    link_token = secrets.token_urlsafe(32)
    link_expires = datetime.now(timezone.utc) + timedelta(days=7)
    user.telegram_link_token = link_token
    user.telegram_link_token_expires = link_expires
    await db.commit()
    deeplink = f"https://t.me/{settings_auth.telegram_bot_username}?start={link_token}"
    return {"deeplink": deeplink, "expires_at": link_expires.isoformat()}
```

- [ ] **Step 3.3 — Buat `app/routers/telegram_bot.py`**

```python
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Header
from sqlalchemy import select
import httpx
from app.database import AsyncSessionLocal
from app.models import User
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["telegram"])
settings = get_settings()


async def _bot_reply(chat_id: int, text: str) -> None:
    if not settings.telegram_bot_token:
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(url, json={"chat_id": chat_id, "text": text})
    except Exception as e:
        logger.warning("bot_reply failed chat_id=%s: %s", chat_id, e)


@router.post("/telegram/webhook", status_code=200)
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
):
    if settings.telegram_webhook_secret:
        if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
            raise HTTPException(status_code=403, detail="Invalid webhook secret")

    body = await request.json()
    message = body.get("message") or body.get("edited_message")
    if not message:
        return {"ok": True}

    chat_id: int | None = message.get("from", {}).get("id")
    text: str = message.get("text", "").strip()

    if not chat_id or not text.startswith("/start"):
        return {"ok": True}

    parts = text.split(maxsplit=1)
    token = parts[1].strip() if len(parts) > 1 else None

    if not token:
        await _bot_reply(chat_id, (
            "Selamat datang di OJSDef Bot!\n\n"
            "Untuk menghubungkan akun, gunakan link yang diberikan oleh\n"
            "administrator OJSDef Anda, atau login ke dashboard dan\n"
            "buka halaman Setup Telegram."
        ))
        return {"ok": True}

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(
                User.telegram_link_token == token,
                User.telegram_link_token_expires > datetime.now(timezone.utc),
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            await _bot_reply(chat_id, (
                "⚠️ Link tidak valid atau sudah kadaluarsa.\n\n"
                "Minta link baru kepada Administrator OJSDef Anda,\n"
                "atau login ke dashboard dan buka halaman\n"
                '"Setup Telegram" untuk mendapatkan link baru.\n\n'
                f"🌐 {settings.frontend_base_url}/setup/telegram"
            ))
            return {"ok": True}

        user.telegram_chat_id = str(chat_id)
        user.notif_telegram = True
        user.telegram_link_token = None
        user.telegram_link_token_expires = None
        await session.commit()

        from app.workers.notify import send_welcome
        send_welcome.apply_async((str(user.id),), queue="notifications")

        await _bot_reply(chat_id, (
            "✅ Akun berhasil terhubung ke OJSDef!\n\n"
            "Anda akan menerima notifikasi keamanan OJS\n"
            "secara otomatis melalui bot ini."
        ))

    return {"ok": True}
```

- [ ] **Step 3.4 — Register router di `app/main.py` dan tambah startup webhook registration**

Tambah import telegram_bot_router di `app/main.py` (setelah import router lainnya):

```python
from app.routers import telegram_bot as telegram_bot_router
```

Tambah include_router (setelah `app.include_router(audit_logs_router.router)` atau sejenisnya):

```python
app.include_router(telegram_bot_router.router)
```

Tambah `import httpx` di bagian atas `app/main.py` jika belum ada.

Tambah webhook registration di dalam fungsi `lifespan`, tepat sebelum `yield`:

```python
    # Telegram webhook registration (non-fatal jika gagal)
    if settings.telegram_bot_token and settings.telegram_webhook_secret:
        webhook_url = f"{settings.app_base_url}/telegram/webhook"
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(
                    f"https://api.telegram.org/bot{settings.telegram_bot_token}/setWebhook",
                    json={"url": webhook_url, "secret_token": settings.telegram_webhook_secret},
                )
            logger.info("Telegram webhook registered: %s", webhook_url)
        except Exception as e:
            logger.warning("Telegram webhook registration failed (non-fatal): %s", e)
    yield
```

Pastikan ada `import logging; logger = logging.getLogger(__name__)` di `app/main.py`.

> **Catatan:** `settings.app_base_url` adalah field yang sudah ada di `config.py` (kemungkinan bernama `app_base_url` atau `base_url`). Jika belum ada, tambahkan: `app_base_url: str = "https://api-ojsdef.zentaza.online"` ke Settings.

- [ ] **Step 3.5 — Syntax check**

```bash
python -c "
import ast
files = [
    'app/routers/admin.py', 'app/routers/auth.py',
    'app/routers/telegram_bot.py', 'app/main.py',
]
errors = []
for f in files:
    try:
        ast.parse(open(f).read())
    except SyntaxError as e:
        errors.append(f'{f}: {e}')
print('OK' if not errors else '\n'.join(errors))
"
```

Expected: `OK`

- [ ] **Step 3.6 — Commit Task 3**

```bash
git add app/routers/admin.py app/routers/auth.py \
        app/routers/telegram_bot.py app/main.py
git commit -m "feat: add telegram webhook router, telegram-link endpoint, and deeplink generation on user create"
```

---

## Task 4 — Frontend Pages (Setelah Task 2 selesai)

**Run in parallel dengan Task 3. Depends on Task 2.**

**Files:**
- Modify: `OJSDEF-FrontEnd/hooks/use-auth.ts`
- Create: `OJSDEF-FrontEnd/app/(dashboard)/setup/telegram/page.tsx`
- Modify: `OJSDEF-FrontEnd/app/(dashboard)/users/page.tsx`

**Working directory:** `OJSDEF-FrontEnd`

---

- [ ] **Step 4.1 — Tambah `useGetTelegramLink` ke `hooks/use-auth.ts`**

```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
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

export function useGetTelegramLink() {
  return useQuery({
    queryKey: ['auth', 'telegram-link'],
    queryFn: () =>
      api
        .get<{ deeplink: string; expires_at: string }>('/api/v1/auth/telegram-link')
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })
}
```

- [ ] **Step 4.2 — Buat halaman `app/(dashboard)/setup/telegram/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useGetTelegramLink } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { MessageCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react'

const STEPS = [
  { n: 1, title: 'Klik tombol di bawah', desc: 'Telegram akan terbuka otomatis' },
  { n: 2, title: 'Tekan tombol START di bot', desc: 'Tidak perlu ketik apapun' },
  { n: 3, title: 'Kembali ke halaman ini', desc: 'Halaman ini otomatis berlanjut' },
]

export default function SetupTelegramPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { data: linkData } = useGetTelegramLink()
  const [linked, setLinked] = useState(false)

  useEffect(() => {
    if (user?.telegram_chat_id) {
      setLinked(true)
    }
  }, [user])

  useEffect(() => {
    if (!linked) return
    const timer = setTimeout(() => router.push('/dashboard'), 1500)
    return () => clearTimeout(timer)
  }, [linked, router])

  useEffect(() => {
    if (linked) return
    const interval = setInterval(async () => {
      await refreshUser()
    }, 3000)
    return () => clearInterval(interval)
  }, [linked, refreshUser])

  useEffect(() => {
    if (user?.telegram_chat_id && !linked) {
      setLinked(true)
    }
  }, [user?.telegram_chat_id, linked])

  if (linked) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="glass-dark rounded-xl border border-green-500/20 p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-white font-bold text-xl">Telegram Berhasil Terhubung!</h2>
          <p className="text-slate-400 text-sm">Mengarahkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="glass-dark rounded-xl border border-white/5 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Hubungkan Akun Telegram</h1>
            <p className="text-slate-400 text-sm">Diperlukan sebelum menggunakan dashboard</p>
          </div>
        </div>

        <div className="space-y-3">
          {STEPS.map(({ n, title, desc }) => (
            <div
              key={n}
              className="flex items-start gap-4 bg-slate-900/40 border border-white/5 rounded-lg px-4 py-3"
            >
              <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">{n}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {user?.telegram_username && (
          <div className="bg-slate-900/40 border border-white/5 rounded-lg px-4 py-3">
            <p className="text-slate-400 text-xs mb-1">Akun Telegram yang akan dihubungkan:</p>
            <p className="text-white font-mono text-sm">{user.telegram_username}</p>
            <p className="text-slate-500 text-xs mt-1">
              Konfirmasi dengan admin jika tidak sesuai
            </p>
          </div>
        )}

        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!linkData?.deeplink}
        >
          <a
            href={linkData?.deeplink ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Buka Bot Telegram OJSDef
          </a>
        </Button>

        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menunggu konfirmasi dari Telegram...</span>
          </div>
          <p className="text-center text-slate-600 text-xs">
            Halaman ini otomatis berlanjut setelah Anda menekan START di bot
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.3 — Update Zod schema di `app/(dashboard)/users/page.tsx`**

Ganti `createUserSchema` dengan versi berikut:

```typescript
const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['saas_admin', 'admin_ojs', 'viewer']),
  tenant_id: z.string().optional(),
  new_tenant_name: z.string().optional(),
  telegram_username: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'admin_ojs' && !data.tenant_id && !data.new_tenant_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pilih institusi atau buat institusi baru untuk admin_ojs',
      path: ['tenant_id'],
    })
  }
  if (data.role === 'admin_ojs' && !data.telegram_username?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Username Telegram wajib diisi untuk Admin OJS',
      path: ['telegram_username'],
    })
  }
})
type CreateUserForm = z.infer<typeof createUserSchema>
```

Tambah `telegram_username: ''` ke `defaultValues` di `useForm`.

- [ ] **Step 4.4 — Tambah field `telegram_username` di form**

Tambah `FormField` baru setelah field `role`, hanya tampil saat `role === 'admin_ojs'`:

```typescript
{form.watch('role') === 'admin_ojs' && (
  <FormField
    control={form.control}
    name="telegram_username"
    render={({ field }) => (
      <FormItem className="sm:col-span-3">
        <FormLabel className="text-slate-300">
          Username Telegram
          <span className="text-red-400 ml-1">*</span>
        </FormLabel>
        <FormControl>
          <Input
            {...field}
            placeholder="@nama_pengguna"
            className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
          />
        </FormControl>
        <p className="text-slate-500 text-xs mt-1">
          Pengguna akan mendapat panduan menghubungkan bot Telegram melalui link yang dikirim admin
        </p>
        <FormMessage />
      </FormItem>
    )}
  />
)}
```

- [ ] **Step 4.5 — Update `CredentialBox` — tambah section Telegram deep link**

Tambah blok berikut di dalam `CredentialBox`, setelah section password dan sebelum peringatan:

```typescript
{result.telegram_bot_deeplink && (
  <div className="bg-slate-900/70 border border-white/10 rounded-lg p-4 space-y-3">
    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
      Link Bot Telegram
    </p>
    <p className="text-slate-400 text-xs leading-relaxed">
      Kirimkan link berikut kepada{' '}
      <strong className="text-slate-300">{result.email}</strong>{' '}
      untuk menghubungkan akun Telegram mereka.
    </p>
    <div className="flex items-center gap-3">
      <code className="text-xs font-mono text-cyan-300 flex-1 break-all select-all">
        {result.telegram_bot_deeplink}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(result.telegram_bot_deeplink)
        }}
        className="shrink-0 text-slate-400 hover:text-white hover:bg-white/5"
      >
        <Copy className="h-4 w-4" />
        <span className="ml-1.5 text-xs">Salin</span>
      </Button>
    </div>
    <p className="text-slate-500 text-xs">
      Link valid 7 hari. Pengguna cukup klik link lalu tekan START di Telegram.
    </p>
  </div>
)}
```

- [ ] **Step 4.6 — TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: tidak ada error baru.

- [ ] **Step 4.7 — Commit Task 4**

```bash
git add hooks/use-auth.ts "app/(dashboard)/setup/telegram/page.tsx" \
        "app/(dashboard)/users/page.tsx"
git commit -m "feat: add setup telegram page, telegram_username field in user creation, and deep link in credential box"
```

---

## Task 5 — Backend Workers + Main (Setelah Task 3 selesai)

**Sequential setelah Task 3. Depends on Task 3.**

**Files:**
- Modify: `OJSDEF-BackEnd/app/workers/notify.py`
- Modify: `OJSDEF-BackEnd/app/workers/scoring.py`

**Working directory:** `OJSDEF-BackEnd`

---

- [ ] **Step 5.1 — Ganti seluruh `app/workers/notify.py`**

```python
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
import httpx
from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models import ScanJob, ScanFinding, OJSTarget, User, Notification
from app.config import get_settings

settings = get_settings()

_SCAN_TYPE_LABELS = {
    "internal": "Audit Internal",
    "external": "Scan Eksternal",
    "full": "Audit Penuh",
}
_RISK_LABELS = {
    "critical": "KRITIS",
    "high": "BERBAHAYA",
    "medium": "PERHATIAN",
    "low": "AMAN",
}


async def _telegram(chat_id: str, text: str) -> bool:
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(url, json={"chat_id": chat_id, "text": text[:4096]})
            return r.status_code == 200
    except Exception:
        return False


# ── Welcome ────────────────────────────────────────────────────────────────────

async def _run_send_welcome(user_id: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.telegram_chat_id:
            return

        text = (
            "🎉 Selamat datang di OJSDef!\n\n"
            "Akun Anda telah berhasil terhubung ke Telegram.\n\n"
            f"📧 Email: {user.email}\n"
            "🔑 Password sementara dikirimkan oleh admin Anda.\n\n"
            "⚠️ Wajib mengganti password saat pertama login!\n\n"
            f"🌐 Login di: {settings.frontend_base_url}/login\n\n"
            "Bot ini akan mengirimkan notifikasi keamanan OJS Anda\n"
            "secara otomatis. Tidak perlu membalas pesan ini."
        )
        sent = await _telegram(user.telegram_chat_id, text)
        session.add(Notification(
            id=uuid.uuid4(), tenant_id=user.tenant_id, job_id=None,
            user_id=user.id, channel="telegram", notif_type="welcome",
            is_sent=sent, error_log=None if sent else "Telegram API failed",
        ))
        await session.commit()


@celery_app.task(name="app.workers.notify.send_welcome",
                 bind=True, max_retries=3, autoretry_for=(Exception,), default_retry_delay=60)
def send_welcome(self, user_id: str):
    asyncio.run(_run_send_welcome(user_id))


# ── Scan Completed ─────────────────────────────────────────────────────────────

async def _run_send_scan_completed(job_id: str):
    async with AsyncSessionLocal() as session:
        job = (await session.execute(select(ScanJob).where(ScanJob.id == job_id))).scalar_one()
        if job.status != "completed":
            return

        target = (await session.execute(
            select(OJSTarget).where(OJSTarget.id == job.target_id)
        )).scalar_one()

        users = [
            u for u in (await session.execute(
                select(User).where(User.tenant_id == job.tenant_id, User.is_active == True)
            )).scalars()
            if u.notif_telegram and u.telegram_chat_id
        ]

        if not users:
            return

        scan_type_label = _SCAN_TYPE_LABELS.get(job.scan_type, job.scan_type)
        risk_label = _RISK_LABELS.get(job.risk_level or "", job.risk_level or "N/A")
        wib = timezone(timedelta(hours=7))
        created_wib = job.created_at.astimezone(wib).strftime("%d/%m/%Y %H:%M")

        text = (
            f"✅ Scan Selesai — {target.name}\n\n"
            f"Jenis Scan : {scan_type_label}\n"
            f"Skor Risiko: {job.overall_score}/100 — {risk_label}\n"
            f"Waktu Scan : {created_wib} WIB\n\n"
            "Ringkasan Temuan:\n"
            f"🔴 Kritis   : {job.critical_count}\n"
            f"🟠 Berbahaya: {job.high_count}\n"
            f"🟡 Perhatian: {job.medium_count}\n"
            f"🟢 Aman     : {job.low_count}\n\n"
            f"🔗 Lihat Laporan: {settings.frontend_base_url}/vulnerability-report"
        )

        for user in users:
            sent = await _telegram(user.telegram_chat_id, text)
            session.add(Notification(
                id=uuid.uuid4(), tenant_id=job.tenant_id, job_id=job.id,
                user_id=user.id, channel="telegram", notif_type="scan_completed",
                is_sent=sent, error_log=None if sent else "Telegram API failed",
            ))
        await session.commit()


@celery_app.task(name="app.workers.notify.send_scan_completed",
                 bind=True, max_retries=3, autoretry_for=(Exception,), default_retry_delay=60)
def send_scan_completed(self, job_id: str):
    asyncio.run(_run_send_scan_completed(job_id))


# ── Critical Alert ─────────────────────────────────────────────────────────────

async def _run_critical_alert(job_id: str, finding_ids: list[str]):
    async with AsyncSessionLocal() as session:
        job = (await session.execute(select(ScanJob).where(ScanJob.id == job_id))).scalar_one()
        if job.status != "completed":
            return
        target = (await session.execute(
            select(OJSTarget).where(OJSTarget.id == job.target_id)
        )).scalar_one()
        findings = (await session.execute(
            select(ScanFinding).where(
                ScanFinding.id.in_(finding_ids),
                ScanFinding.tenant_id == job.tenant_id,
            )
        )).scalars().all()
        users = [
            u for u in (await session.execute(
                select(User).where(User.tenant_id == job.tenant_id, User.is_active == True)
            )).scalars()
            if u.notif_telegram and u.telegram_chat_id
        ]

        if not users:
            return

        findings_list = "\n".join(f"• {f.title}" for f in findings[:5])
        count = len(findings)

        tg_text = (
            "🚨 ANCAMAN KRITIS TERDETEKSI\n\n"
            f"Target: {target.name}\n"
            f"URL: {target.url}\n"
            f"Skor Risiko: {job.overall_score}/100 — KRITIS\n\n"
            f"Temuan Kritis ({count} temuan):\n"
            f"{findings_list}\n\n"
            "⏱ SLA Perbaikan: 24 jam\n"
            f"🔗 Lihat Detail: {settings.frontend_base_url}/vulnerability-report\n\n"
            "Segera tindaklanjuti sebelum sistem Anda dieksploitasi."
        )

        for user in users:
            sent = await _telegram(user.telegram_chat_id, tg_text)
            session.add(Notification(
                id=uuid.uuid4(), tenant_id=job.tenant_id, job_id=job.id,
                user_id=user.id, channel="telegram", notif_type="critical_alert",
                is_sent=sent, error_log=None if sent else "Telegram API failed",
            ))
        await session.commit()


@celery_app.task(name="app.workers.notify.send_critical_alert",
                 bind=True, max_retries=3, autoretry_for=(Exception,), default_retry_delay=60)
def send_critical_alert(self, job_id: str, finding_ids: list[str]):
    asyncio.run(_run_critical_alert(job_id, finding_ids))
```

- [ ] **Step 5.2 — Update `app/workers/scoring.py` — enqueue `send_scan_completed`**

Tambah call `send_scan_completed` di fungsi `_run_scoring`, tepat setelah `await r.aclose()` dan sebelum blok `if counts["critical"] > 0`:

```python
    await r.aclose()

    # Kirim notifikasi scan selesai ke semua user tenant
    celery_app.send_task(
        "app.workers.notify.send_scan_completed",
        args=[job_id], queue="notifications",
    )

    if counts["critical"] > 0:
        celery_app.send_task(
            "app.workers.notify.send_critical_alert",
            args=[job_id, crit_ids], queue="notifications",
        )
```

- [ ] **Step 5.3 — Syntax check**

```bash
python -c "
import ast
files = ['app/workers/notify.py', 'app/workers/scoring.py']
errors = []
for f in files:
    try:
        ast.parse(open(f).read())
    except SyntaxError as e:
        errors.append(f'{f}: {e}')
print('OK' if not errors else '\n'.join(errors))
"
```

Expected: `OK`

- [ ] **Step 5.4 — Commit Task 5**

```bash
git add app/workers/notify.py app/workers/scoring.py
git commit -m "feat: add send_welcome and send_scan_completed celery tasks, enqueue scan_completed from scoring worker"
```

---

## Task 6 — Tests + Environment (Setelah semua task selesai)

**Sequential. Depends on Tasks 3, 4, 5.**

**Files:**
- Create: `OJSDEF-BackEnd/tests/test_telegram_webhook.py`
- Modify: `OJSDEF-BackEnd/.env.example`

**Working directory:** `OJSDEF-BackEnd`

---

- [ ] **Step 6.1 — Buat `tests/test_telegram_webhook.py`**

```python
"""Tests untuk Telegram webhook handler."""
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_webhook_invalid_secret(async_client: AsyncClient):
    """Webhook dengan secret salah harus return 403."""
    response = await async_client.post(
        "/telegram/webhook",
        json={"update_id": 1, "message": {}},
        headers={"X-Telegram-Bot-Api-Secret-Token": "wrongsecret"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_webhook_no_message(async_client: AsyncClient, valid_webhook_headers: dict):
    """Update tanpa message harus return 200 ok."""
    response = await async_client.post(
        "/telegram/webhook",
        json={"update_id": 1},
        headers=valid_webhook_headers,
    )
    assert response.status_code == 200
    assert response.json() == {"ok": True}


@pytest.mark.asyncio
async def test_webhook_start_no_token_replies(
    async_client: AsyncClient,
    valid_webhook_headers: dict,
):
    """'/start' tanpa token harus return 200 dan bot balas pesan panduan."""
    update = {
        "update_id": 124,
        "message": {
            "message_id": 2,
            "from": {"id": 111, "first_name": "Anon"},
            "chat": {"id": 111, "type": "private"},
            "text": "/start",
        },
    }
    with patch("app.routers.telegram_bot._bot_reply", new_callable=AsyncMock) as mock_reply:
        response = await async_client.post(
            "/telegram/webhook",
            json=update,
            headers=valid_webhook_headers,
        )
    assert response.status_code == 200
    mock_reply.assert_called_once()
    args = mock_reply.call_args[0]
    assert "OJSDef Bot" in args[1]


@pytest.mark.asyncio
async def test_webhook_invalid_token_replies(
    async_client: AsyncClient,
    valid_webhook_headers: dict,
):
    """Token tidak ditemukan → bot balas pesan error."""
    update = {
        "update_id": 125,
        "message": {
            "message_id": 3,
            "from": {"id": 222, "first_name": "Hacker"},
            "chat": {"id": 222, "type": "private"},
            "text": "/start invalidtoken999xyz",
        },
    }
    with patch("app.routers.telegram_bot._bot_reply", new_callable=AsyncMock) as mock_reply:
        response = await async_client.post(
            "/telegram/webhook",
            json=update,
            headers=valid_webhook_headers,
        )
    assert response.status_code == 200
    mock_reply.assert_called_once()
    args = mock_reply.call_args[0]
    assert "tidak valid" in args[1]


@pytest.mark.asyncio
async def test_telegram_link_endpoint_requires_auth(async_client: AsyncClient):
    """GET /api/v1/auth/telegram-link tanpa auth harus return 401."""
    response = await async_client.get("/api/v1/auth/telegram-link")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_telegram_link_endpoint_returns_deeplink(
    async_client: AsyncClient,
    auth_headers: dict,
):
    """GET /api/v1/auth/telegram-link harus return deeplink valid."""
    response = await async_client.get(
        "/api/v1/auth/telegram-link",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "deeplink" in data
    assert "t.me/" in data["deeplink"]
    assert "expires_at" in data
```

> **Catatan:** Test menggunakan fixtures `async_client`, `valid_webhook_headers`, dan `auth_headers` dari `tests/conftest.py`. `valid_webhook_headers` isinya `{"X-Telegram-Bot-Api-Secret-Token": settings.telegram_webhook_secret}`. Tambahkan fixture yang belum ada ke `conftest.py` mengikuti pola yang sudah ada.

- [ ] **Step 6.2 — Jalankan tests yang tidak butuh DB fixtures**

```bash
python -m pytest tests/test_telegram_webhook.py -v \
  -k "test_webhook_no_message or test_webhook_invalid_secret or test_webhook_start_no_token or test_webhook_invalid_token or test_telegram_link_requires_auth" \
  2>&1 | tail -20
```

Expected: test yang relevan pass (atau SKIP jika fixture belum ada).

- [ ] **Step 6.3 — Update `.env.example` — tambah 3 env vars baru**

Tambah di bagian Telegram section:

```env
# Telegram Bot (lihat @BotFather di Telegram)
TELEGRAM_BOT_TOKEN=<token_dari_botfather>
TELEGRAM_BOT_USERNAME=<nama_bot_tanpa_@>
TELEGRAM_WEBHOOK_SECRET=<random_32_char_hex>

# Frontend URL untuk link di pesan bot
FRONTEND_BASE_URL=https://ojsdef.zentaza.online
APP_BASE_URL=https://api-ojsdef.zentaza.online
```

- [ ] **Step 6.4 — Isi nilai nyata di `.env`** *(Manual step — jangan di-commit)*

```bash
# Generate webhook secret:
python -c "import secrets; print(secrets.token_hex(32))"
```

Isi `.env`:
```env
TELEGRAM_WEBHOOK_SECRET=<output dari command di atas>
TELEGRAM_BOT_USERNAME=<username bot dari BotFather>
FRONTEND_BASE_URL=https://ojsdef.zentaza.online
APP_BASE_URL=https://api-ojsdef.zentaza.online
```

- [ ] **Step 6.5 — Verifikasi webhook terdaftar setelah server restart**

```bash
# Setelah uvicorn restart, cek webhook info:
python -c "
import os, urllib.request, json
token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
url = f'https://api.telegram.org/bot{token}/getWebhookInfo'
data = json.loads(urllib.request.urlopen(url).read())
print(json.dumps(data, indent=2))
"
```

Expected: `"url": "https://api-ojsdef.zentaza.online/telegram/webhook"`

- [ ] **Step 6.6 — Commit Task 6**

```bash
git add tests/test_telegram_webhook.py .env.example
git commit -m "test: add telegram webhook tests and update .env.example"
```

---

## Checklist Verifikasi Manual (End-to-End)

Setelah semua task selesai, verifikasi alur berikut secara manual:

- [ ] **Alur 1 — Create User Baru:** Login sebagai `saas_admin` → Kelola Pengguna → Tambah Pengguna (role: Admin OJS) → Isi username Telegram → Submit → CredentialBox muncul dengan password AND Telegram deep link
- [ ] **Alur 2 — Linking Bot:** Klik deep link dari CredentialBox → Telegram terbuka → tekan START → bot balas "✅ Berhasil terhubung"
- [ ] **Alur 3 — Welcome Message:** Setelah tekan START → bot mengirim pesan welcome dengan info email dan URL login
- [ ] **Alur 4 — Mandatory Gate:** Login sebagai `admin_ojs` yang `telegram_chat_id = NULL` → otomatis redirect ke `/setup/telegram` → tidak bisa akses halaman lain
- [ ] **Alur 5 — Setup Page Flow:** Di `/setup/telegram` → klik "Buka Bot Telegram" → START di bot → halaman auto-redirect ke `/dashboard` dalam 3 detik
- [ ] **Alur 6 — Scan Completed:** Jalankan scan → setelah selesai → bot kirim ringkasan scan
- [ ] **Alur 7 — Critical Alert:** Scan dengan temuan Kritis → bot kirim alert kritis dalam <5 menit
