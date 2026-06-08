# Design: Telegram Bot Notification System
**Tanggal:** 2026-06-06  
**Status:** Approved — Siap Implementasi  
**Scope:** Backend (FastAPI + Celery) + Frontend (Next.js 16)  
**Fitur terkait:** FR-AUTH-06, FR-REPORT-04, FR-REPORT-05

---

## 1. Ringkasan

Sistem notifikasi Telegram untuk OJSDef menggunakan **Telegram Bot Webhook** yang diintegrasikan langsung ke FastAPI. Fokus pada tiga jenis notifikasi untuk role `admin_ojs`:

1. **Welcome** — dikirim saat user berhasil menghubungkan akun Telegram
2. **Critical Alert** — dikirim otomatis saat scan menemukan temuan Kritis
3. **Scan Completed** — ringkasan hasil scan setelah setiap scan selesai

Telegram dipilih sebagai **satu-satunya channel** notifikasi yang wajib dikonfigurasi untuk `admin_ojs`. Email tetap ada di model tapi tidak diwajibkan.

---

## 2. Arsitektur & Alur Utama

### 2.1 Pembuatan Akun Baru (`admin_ojs`)

```
Admin isi form:
  email, nama, role=admin_ojs, @telegram_username, [tenant]
  ↓
POST /api/v1/admin/users
  → User dibuat (must_change_password=True)
  → telegram_link_token di-generate (UUID, TTL 7 hari)
  → telegram_link_token_expires di-set = now + 7 days
  ↓
Response: credentials + telegram_bot_deeplink
  (t.me/<TELEGRAM_BOT_USERNAME>?start=<token>)
  ↓
Admin tampilkan CredentialBox kepada user:
  - Password sementara
  - Link bot Telegram (copyable)
  ↓
User klik deep link → Telegram buka bot → kirim /start <token>
  ↓
POST /telegram/webhook (dari Telegram)
  → Validasi X-Telegram-Bot-Api-Secret-Token header
  → Cari user by telegram_link_token
  → Cek token belum expired
  → user.telegram_chat_id = message.from.id
  → user.notif_telegram = True
  → telegram_link_token = NULL (invalidate)
  → Enqueue: send_welcome.delay(user_id) via Celery
  → Bot balas: "✅ Berhasil terhubung!"
```

### 2.2 Existing User Tanpa Telegram (Mandatory Gate)

```
User login → POST /api/v1/auth/login
  ↓
Response: { access_token, must_change_password }
+ Frontend derive: must_link_telegram = (role === 'admin_ojs' && telegram_chat_id === null)
  ↓
Login page redirect priority:
  1. must_change_password → /change-password
  2. must_link_telegram   → /setup/telegram
  3. Normal               → /dashboard
  ↓
AppShell.tsx enforce gate:
  Jika admin_ojs dan telegram_chat_id null → redirect /setup/telegram
  (kecuali sudah di /setup/telegram atau /change-password)
  ↓
/setup/telegram:
  - Fetch deep link: GET /api/v1/auth/telegram-link
  - Tampil guide 3 langkah + tombol "Buka Bot Telegram"
  - Poll GET /api/v1/auth/me setiap 3 detik
  - Saat telegram_chat_id terisi → refreshUser() → redirect /dashboard
```

### 2.3 Notifikasi Scan

```
Scan selesai (status = completed):
  Scoring Worker
    ├─ Selalu: send_scan_completed.delay(job_id) → queue: notifications
    └─ Jika ada Critical finding: send_critical_alert.delay(job_id, finding_ids)

Celery notify worker:
  send_scan_completed → query job + target + semua user tenant (notif_telegram=True, chat_id≠null)
                      → _telegram(chat_id, ringkasan_scan)
                      → INSERT notifications (job_id, channel=telegram, type=scan_completed)

  send_critical_alert → query job + target + critical findings + users
                      → _telegram(chat_id, alert_kritis)
                      → INSERT notifications (job_id, channel=telegram, type=critical_alert)

  send_welcome        → query user by user_id
                      → _telegram(chat_id, pesan_welcome)
                      → INSERT notifications (job_id=NULL, channel=telegram, type=welcome)
```

---

## 3. Backend Changes

### 3.1 Database Migration 005

```sql
-- Tambah ke tabel users:
ALTER TABLE users
  ADD COLUMN telegram_username           VARCHAR(100),
  ADD COLUMN telegram_link_token         VARCHAR(64) UNIQUE,
  ADD COLUMN telegram_link_token_expires TIMESTAMPTZ;

-- Buat job_id nullable di tabel notifications:
-- (welcome notification tidak punya scan job)
ALTER TABLE notifications
  ALTER COLUMN job_id DROP NOT NULL;
```

File: `migrations/versions/005_telegram_notification.py`

### 3.2 Model User (`app/models/user.py`)

Tambah 3 field:

```python
telegram_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
telegram_link_token: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
telegram_link_token_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

### 3.3 Model Notification (`app/models/notification.py`)

`job_id` diubah menjadi nullable:

```python
job_id: Mapped[uuid.UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("scan_jobs.id"), nullable=True)
```

### 3.4 Endpoint Baru & Perubahan

| Method | Path | Perubahan |
|---|---|---|
| `POST` | `/api/v1/admin/users` | `CreateUserRequest` +`telegram_username`; auto-generate token; response +`telegram_bot_deeplink` |
| `GET` | `/api/v1/auth/telegram-link` | **Baru** — return/regenerate deep link untuk user yang sedang login |
| `POST` | `/telegram/webhook` | **Baru** — terima update dari Telegram Bot API |

#### `POST /api/v1/admin/users` — Perubahan Schema

```python
class CreateUserRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    tenant_id: str | None = None
    new_tenant_name: str | None = None
    telegram_username: str | None = None  # wajib untuk admin_ojs (enforced di router)

class CreateUserResponse(UserResponse):
    temp_password: str
    telegram_bot_deeplink: str  # t.me/<bot>?start=<token>
```

Logic di router: generate token `secrets.token_urlsafe(32)`, set expires `now + timedelta(days=7)`,
build deeplink dari `settings.telegram_bot_username`.

#### `GET /api/v1/auth/telegram-link`

```python
# Requires: authenticated user (any role)
# Returns:
{ "deeplink": "https://t.me/<bot>?start=<token>", "expires_at": "<iso>" }

# Logic:
# - Generate token baru (invalidate yang lama jika ada)
# - Simpan ke user.telegram_link_token + expires
# - Return deeplink
```

#### `POST /telegram/webhook` — Router Baru (`app/routers/telegram_bot.py`)

```python
# Header validation: X-Telegram-Bot-Api-Secret-Token == settings.telegram_webhook_secret
# Body: Telegram Update object

# Proses /start <token>:
#   1. Parse token dari message.text ("/start <token>")
#   2. SELECT user WHERE telegram_link_token = token AND expires > now
#   3. Jika tidak ditemukan/expired → bot reply pesan "Token tidak valid"
#   4. Update: telegram_chat_id = message.from.id, notif_telegram = True
#              telegram_link_token = NULL, telegram_link_token_expires = NULL
#   5. send_welcome.delay(str(user.id))
#   6. Bot reply: "✅ Akun berhasil terhubung ke OJSDef!"

# /start tanpa token → reply pesan panduan singkat
```

### 3.5 Celery Workers (`app/workers/notify.py`)

#### Task Baru: `send_welcome`

```python
@celery_app.task(name="app.workers.notify.send_welcome",
                 bind=True, max_retries=3, autoretry_for=(Exception,), default_retry_delay=60)
def send_welcome(self, user_id: str):
    # Query user, kirim pesan welcome ke user.telegram_chat_id
    # INSERT notifications (job_id=NULL, type="welcome", channel="telegram")
```

#### Task Baru: `send_scan_completed`

```python
@celery_app.task(name="app.workers.notify.send_scan_completed",
                 bind=True, max_retries=3, autoretry_for=(Exception,), default_retry_delay=60)
def send_scan_completed(self, job_id: str):
    # Query job + target + users (notif_telegram=True, chat_id tidak null)
    # Kirim ringkasan scan ke semua user tenant
    # INSERT notifications per user
```

#### Perubahan `send_critical_alert`

Tambah guard: `if job.status != "completed": return` untuk menghindari alert dari scan partial.

### 3.6 Scoring Worker (`app/workers/scoring.py`)

Tambah 1 baris setelah `job.status = "completed"` di-commit:

```python
send_scan_completed.apply_async((str(job.id),), queue="notifications")
# (existing critical alert logic tetap di bawahnya)
```

### 3.7 Startup Webhook Registration (`app/main.py`)

```python
@app.on_event("startup")
async def register_telegram_webhook():
    if not settings.telegram_bot_token:
        return
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
```

### 3.8 Environment Variables Baru (`.env`)

```env
TELEGRAM_WEBHOOK_SECRET=<random-32-char-hex>
TELEGRAM_BOT_USERNAME=<nama_bot_tanpa_@>
FRONTEND_BASE_URL=https://ojsdef.zentaza.online
```

`TELEGRAM_BOT_TOKEN` sudah ada di `.env`.

### 3.9 Ringkasan File Backend

| File | Jenis | Perubahan |
|---|---|---|
| `migrations/versions/005_telegram_notification.py` | **Baru** | +3 kolom di users, job_id nullable di notifications |
| `app/models/user.py` | Edit | +3 field (telegram_username, telegram_link_token, expires) |
| `app/models/notification.py` | Edit | job_id → nullable |
| `app/schemas/admin.py` | Edit | CreateUserRequest +telegram_username; CreateUserResponse +telegram_bot_deeplink |
| `app/schemas/auth.py` | Edit | UserResponse +telegram_username |
| `app/routers/admin.py` | Edit | Generate token + deeplink saat create user |
| `app/routers/auth.py` | Edit | +GET /telegram-link endpoint |
| `app/routers/telegram_bot.py` | **Baru** | Webhook handler + /start processing |
| `app/workers/notify.py` | Edit | +send_welcome, +send_scan_completed; fix send_critical_alert |
| `app/workers/scoring.py` | Edit | +enqueue send_scan_completed setelah scan completed |
| `app/main.py` | Edit | Register router + startup webhook registration |
| `.env` | Edit | +TELEGRAM_WEBHOOK_SECRET, +TELEGRAM_BOT_USERNAME, +FRONTEND_BASE_URL |

---

## 4. Frontend Changes

### 4.1 Types (`types/api.ts`)

```typescript
// UserProfile: tambah 1 field
telegram_username: string | null

// CreateUserRequest: tambah 1 field
telegram_username?: string

// CreateUserResponse: tambah 1 field
telegram_bot_deeplink: string
```

### 4.2 Auth Context (`lib/auth-context.tsx`)

```typescript
interface AuthContextValue {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{
    must_change_password: boolean
    must_link_telegram: boolean   // derived: role=admin_ojs && !telegram_chat_id
  }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>  // GET /api/v1/auth/me → update user state
  isLoading: boolean
}
```

### 4.3 AppShell Gate (`components/layout/AppShell.tsx`)

```typescript
const pathname = usePathname()

useEffect(() => {
  if (!isLoading && !user) { router.replace('/login'); return }
  if (!isLoading && user?.role === 'admin_ojs' && !user.telegram_chat_id) {
    const exempt = ['/setup/telegram', '/change-password']
    if (!exempt.includes(pathname)) router.replace('/setup/telegram')
  }
}, [isLoading, user, router, pathname])
```

### 4.4 Login Page (`app/(auth)/login/page.tsx`)

```typescript
const result = await login(email, password)
if (result.must_change_password) {
  router.push('/change-password')
} else if (result.must_link_telegram) {
  router.push('/setup/telegram')
} else {
  router.push('/dashboard')
}
```

### 4.5 Halaman Setup Telegram — Baru

**Path:** `app/(dashboard)/setup/telegram/page.tsx`

UI: AppShell (sidebar + topbar) dengan konten centered card max-w-lg.

```
┌─────────────────────────────────────────────────────┐
│  🔔  Hubungkan Akun Telegram Anda                   │
│      Diperlukan sebelum menggunakan dashboard        │
│                                                     │
│  Langkah-langkah:                                   │
│  1. Klik tombol di bawah                            │
│     Telegram akan terbuka otomatis                  │
│  2. Tekan tombol START di bot                       │
│     Tidak perlu ketik apapun                        │
│  3. Kembali ke halaman ini                          │
│     Halaman ini otomatis berlanjut                  │
│                                                     │
│  Akun Telegram: @{telegram_username}                │
│  (konfirmasi dengan admin jika salah)               │
│                                                     │
│  [ Buka Bot Telegram OJSDef ]  ← new tab            │
│                                                     │
│  ⏳  Menunggu konfirmasi...  (spin)                  │
│      Otomatis berlanjut setelah terhubung           │
└─────────────────────────────────────────────────────┘
```

Setelah terhubung: `✅ Telegram Berhasil Terhubung! Mengarahkan...`

Polling: `setInterval(3000)` → `refreshUser()` → jika `user.telegram_chat_id !== null` → redirect `/dashboard`.

### 4.6 Form Tambah Pengguna (`app/(dashboard)/users/page.tsx`)

- Field `telegram_username` muncul saat `role === 'admin_ojs'`; required untuk role tersebut
- `CredentialBox` tambah section link bot: URL deep link + tombol Salin + info "valid 7 hari"

### 4.7 Hook Baru (`hooks/use-auth.ts`)

```typescript
export function useGetTelegramLink() {
  return useQuery({
    queryKey: ['auth', 'telegram-link'],
    queryFn: () =>
      api.get<{ deeplink: string; expires_at: string }>('/api/v1/auth/telegram-link')
         .then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}
```

### 4.8 Ringkasan File Frontend

| File | Jenis | Perubahan |
|---|---|---|
| `types/api.ts` | Edit | +3 field |
| `lib/auth-context.tsx` | Edit | +`refreshUser()`, `login()` return `must_link_telegram` |
| `components/layout/AppShell.tsx` | Edit | +gate redirect |
| `app/(auth)/login/page.tsx` | Edit | +redirect chain |
| `app/(dashboard)/setup/telegram/page.tsx` | **Baru** | Setup guide + polling |
| `app/(dashboard)/users/page.tsx` | Edit | +telegram_username field, +deeplink di CredentialBox |
| `hooks/use-auth.ts` | Edit | +`useGetTelegramLink()` |

---

## 5. Telegram Message Templates

### 5.1 Welcome
```
🎉 Selamat datang di OJSDef!

Akun Anda telah berhasil terhubung ke Telegram.

📧 Email: {email}
🔑 Password sementara dikirimkan oleh admin Anda.

⚠️ Wajib mengganti password saat pertama login!

🌐 Login di: {frontend_base_url}/login

Bot ini akan mengirimkan notifikasi keamanan OJS Anda
secara otomatis. Tidak perlu membalas pesan ini.
```

### 5.2 Critical Alert
```
🚨 ANCAMAN KRITIS TERDETEKSI

Target: {target_name}
URL: {target_url}
Skor Risiko: {overall_score}/100 — KRITIS

Temuan Kritis ({count} temuan):
• {finding_1_title}
• {finding_2_title}
[maks 5 temuan]

⏱ SLA Perbaikan: 24 jam
🔗 Lihat Detail: {frontend_base_url}/vulnerability-report

Segera tindaklanjuti sebelum sistem Anda dieksploitasi.
```

### 5.3 Scan Completed
```
✅ Scan Selesai — {target_name}

Jenis Scan : {scan_type_label}
Skor Risiko: {overall_score}/100 — {risk_level_label}
Waktu Scan : {created_at} WIB

Ringkasan Temuan:
🔴 Kritis   : {critical_count}
🟠 Berbahaya: {high_count}
🟡 Perhatian: {medium_count}
🟢 Aman     : {low_count}

🔗 Lihat Laporan: {frontend_base_url}/vulnerability-report
```

**Label mapping:**

| Nilai DB | Label Pesan |
|---|---|
| `internal` | Audit Internal |
| `external` | Scan Eksternal |
| `full` | Audit Penuh |
| `critical` | KRITIS |
| `high` | BERBAHAYA |
| `medium` | PERHATIAN |
| `low` | AMAN |

### 5.4 Token Tidak Valid (balasan bot)
```
⚠️ Link tidak valid atau sudah kadaluarsa.

Minta link baru kepada Administrator OJSDef Anda,
atau login ke dashboard dan buka halaman
"Setup Telegram" untuk mendapatkan link baru.

🌐 {frontend_base_url}/setup/telegram
```

---

## 6. Error Handling & Edge Cases

| Kasus | Handling |
|---|---|
| Token expired (>7 hari) | Bot balas 5.4; setup page generate token baru tiap load |
| Token dipakai ulang | Setelah sukses token di-NULL; /start kedua dapat pesan 5.4 |
| Telegram API timeout | Celery retry max 3x delay 60s; `is_sent=False` + `error_log` di notifications |
| `send_welcome` gagal 3x | User tetap bisa login; gate cek `telegram_chat_id`, bukan pengiriman pesan |
| Scan `status=failed` | `send_scan_completed` tidak dipanggil; guard di scoring worker |
| User tanpa `telegram_chat_id` saat scan selesai | Dilewati di loop user notify worker |
| Webhook startup gagal | Non-fatal; logged as warning; app tetap jalan |
| `must_change_password` + `must_link_telegram` keduanya true | Change password prioritas 1; Telegram gate aktif setelah password diubah |
| User ganti akun Telegram | `GET /telegram-link` generate token baru; `/start` baru update `telegram_chat_id` |
