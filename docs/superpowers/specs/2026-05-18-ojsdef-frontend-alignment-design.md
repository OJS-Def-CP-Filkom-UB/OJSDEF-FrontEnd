# Design Doc: OJSDef Frontend — Alignment & Completion Plan
**Tanggal:** 2026-05-18  
**Status:** Approved  
**Timeline:** 2 minggu (deadline dekat)  
**Approach:** Demo-Critical First (Approach A)

---

## 1. Konteks & Motivasi

Analisis codebase `OJSDEF-FrontEnd` menunjukkan inkonsistensi kritis antara implementasi saat ini dan PRD v1.2 / SRS v1.2:

1. **Scope MVP dilanggar**: Halaman `/register` dan `/forgot-password` ada dan accessible, padahal PRD F-02 & F-06 secara eksplisit menyatakan keduanya post-MVP.
2. **Mock data domain salah**: `lib/mock-data.ts` berisi data generic cybersecurity tool (Node #144-39, Endpoint Fuzzing, Log4j RCE) — bukan data OJS scanner.
3. **Terminologi generic**: UI menggunakan bahasa tool umum ("Initialize Probe", "CHAOS_MODE", "Network Latency: EU-WEST-1") — tidak mencerminkan konteks OJS security.
4. **Fitur MVP P1 belum ada**: Domain Verification (F-08), Plugin Installation Guide (F-09), Plugin Connection Status (F-10, F-37), Action Plan List (F-36).
5. **RBAC tidak diimplementasikan di UI**: Sidebar dan konten tidak berubah berdasarkan role.
6. **Semua halaman `"use client"`**: Termasuk landing page statis, ini membuang performa RSC.

---

## 2. Tujuan

- Seluruh UI menggunakan terminologi & data dalam **Bahasa Indonesia** yang mencerminkan OJS security scanner
- Demo flow lengkap: Login → Dashboard → Tambah Target → Verifikasi Domain → Scan → Lihat Hasil → Action Plan
- Tidak ada halaman yang bertentangan dengan MVP spec
- Fitur P1 yang belum ada diimplementasikan sebagai UI dengan mock data

---

## 3. Out of Scope

- Integrasi API nyata (tetap mock)
- Scan scheduling (Fase 2 per PRD)
- Export PDF nyata (hanya UI placeholder)
- Multi-tenant management lengkap
- Notifikasi email/Telegram nyata

---

## 4. Perubahan pada Halaman yang Ada

### 4.1 Auth Pages — Scope Fix

**`app/(auth)/register/page.tsx`**  
Ubah isi menjadi pesan informatif, bukan form:
> "Pembuatan akun dilakukan oleh Administrator OJSDef. Hubungi admin Anda untuk mendapatkan akses."  
File tidak dihapus — dipertahankan untuk referensi Fase 2.

**`app/(auth)/forgot-password/page.tsx`**  
Ubah isi menjadi informasi:
> "Untuk reset password, hubungi SaaS Administrator OJSDef Anda."

**`app/(auth)/login/page.tsx`**  
- Hapus link "Don't have an account? Register Here"
- Hapus link "forgot password?"

### 4.2 Mock Data Rebuild (`lib/mock-data.ts`)

**Target OJS Fiktif (3 institusi):**

| ID | URL | Institusi | Status Plugin |
|---|---|---|---|
| target_01 | journal.ub.ac.id | Universitas Brawijaya | Terhubung |
| target_02 | ojs.fk.ui.ac.id | FKUI Jakarta | Terhubung |
| target_03 | jurnal.its.ac.id | Institut Teknologi Sepuluh Nopember | Terputus |

**Tipe Scan (sesuai F-49 PRD):**
- `internal` — Audit Internal via Plugin PHP
- `external` — Audit Eksternal via Bot Ofensif
- `full_audit` — Audit Lengkap (Internal + Eksternal)

**Kerentanan OJS-specific (dalam Bahasa Indonesia):**

| ID | Judul | Sumber | CVSS | Severity |
|---|---|---|---|---|
| vuln_01 | Konten judi online terdeteksi di 2 artikel | Internal | 9.8 | critical |
| vuln_02 | Sertifikat SSL kedaluwarsa dalam 3 hari | Eksternal | 8.6 | high |
| vuln_03 | Plugin Antivirus OJS versi lama (CVE-2023-4891) | Internal | 8.1 | high |
| vuln_04 | 3 akun admin menggunakan password default | Internal | 7.2 | high |
| vuln_05 | Direktori /backup/ dapat diakses publik | Eksternal | 7.5 | high |
| vuln_06 | Debug mode aktif di config.inc.php | Internal | 5.3 | medium |
| vuln_07 | OJS versi 3.3.0-15 (tersedia 3.4.0-7) | Internal | 4.2 | medium |

**Action plan per temuan:** ditulis dalam Bahasa Indonesia, langkah konkret.

### 4.3 Dashboard Overview Rebuild

Ganti 3 widget "Quick Insights" bawah yang tidak relevan:

| Widget Lama | Widget Baru |
|---|---|
| Engine Throughput: 18.4 MS | Status Plugin: X dari Y target terhubung |
| Vulnerability Database: STABLE | Database CVE: Diperbarui 2 jam lalu |
| Network Latency: 42 MS, EU-WEST-1 | Target OJS: X aktif, Y perlu perhatian |

Tabel "Live Engine Operations" → **"Scan Terbaru"**:
- Kolom: URL OJS, Jenis Audit, Tingkat Risiko, Temuan, Status

Label status pada score card menggunakan urutan sesuai PRD F-32:
**Kritis → Berbahaya → Perhatian → Aman**

### 4.4 Add Target Page Rebuild

- Judul halaman: **"Tambah Target OJS"** (dari "Initialize Probe")
- "Label Name" → "Nama Institusi / Label"
- "Endpoint URL" → "URL Instalasi OJS"
- Scan type cards (3 opsi, bukan 4):
  - **Audit Internal** — Pemindaian dari dalam via plugin (5–10 menit)
  - **Audit Eksternal** — Pemindaian dari luar via bot (10–15 menit)
  - **Audit Lengkap** — Internal + Eksternal bersamaan (15–20 menit)
- Setelah submit → arahkan ke alur Domain Verification
- Hapus keterangan "RSA-4096", "Security_Lead" yang tidak relevan

### 4.5 Landing Page Fix

- Perbaiki bug: pricing section menggunakan `FeatureCard` di tempat `PricingCard`
- Ubah copy hero: "Lindungi instalasi OJS Anda dari penyusupan konten ilegal, defacement, dan eksploitasi kerentanan"
- Feature cards relevan:
  1. Audit Dua Arah (Internal Plugin + Eksternal Bot)
  2. Risk Scoring Berbasis CVSS v3
  3. Laporan PDF & Panduan Perbaikan Bahasa Indonesia
- Hapus referensi "CI/CD pipelines", "enterprise infrastructure"

---

## 5. Halaman Baru

### 5.1 Daftar Target OJS (`/targets`)

Halaman menampilkan semua target OJS terdaftar:
- Card per target: URL, nama institusi, status plugin, skor risiko terakhir, tanggal scan terakhir
- Status badge: Terhubung / Terputus / Belum Diverifikasi
- Tombol: "Tambah Target", "Scan Sekarang", "Lihat Detail"

### 5.2 Domain Verification (`/targets/[id]/verify`)

Flow 3 langkah visual:
1. **Pilih Metode** — Upload File token ke root OJS, atau DNS TXT Record
2. **Instruksi** — Tampilkan instruksi spesifik per metode yang dipilih
3. **Verifikasi** — Tombol "Periksa Sekarang" → mock response: Berhasil / Gagal

Setelah berhasil → arahkan ke Plugin Installation Guide.

### 5.3 Plugin Installation Guide (`/targets/[id]/plugin-guide`)

Halaman step-by-step 4 langkah:
1. **Unduh Plugin** — Tombol download file plugin OJSDef (mock file)
2. **Upload ke OJS** — Instruksi: Admin OJS → Plugins → Upload Plugin
3. **Aktivasi & API Key** — Tampilkan API Key, instruksi masukkan ke plugin
4. **Verifikasi Koneksi** — Tombol "Periksa Koneksi" → mock: Terhubung / Tidak Terhubung

### 5.4 Action Plan di Vulnerability Report

Setiap baris di tabel vulnerability memiliki expandable accordion dengan:
- **Deskripsi singkat** masalah dalam Bahasa Indonesia sederhana
- **Langkah perbaikan** (numbered list, konkret)
- **Estimasi waktu** pengerjaan
- **Tingkat kesulitan**: Mudah / Menengah / Sulit
- **Referensi** (link mock ke dokumentasi OJS)

### 5.5 RBAC UI Dasar (Sidebar)

Tiga hardcoded users untuk testing per SRS 2.3:

| Email | Password | Role |
|---|---|---|
| `admin@ub.ac.id` | `admin123` | `admin_ojs` |
| `it@ub.ac.id` | `admin123` | `it_admin` |
| `admin@ojsdef.com` | `password123` | `saas_admin` |

Sidebar menyesuaikan per role:
- `admin_ojs`: Beranda, Scan, Laporan, Risk Scoring, Target OJS, Ekspor
- `it_admin`: semua admin_ojs + Log Teknis
- `saas_admin`: semua + Kelola Pengguna (halaman statis)

---

## 6. Arsitektur Teknis

### 6.1 Routing Structure

```
app/
├── (auth)/
│   ├── login/page.tsx               ← Fix: hapus link register/forgot-pw
│   ├── register/page.tsx            ← Ubah ke pesan info (jangan dihapus)
│   └── forgot-password/page.tsx     ← Ubah ke pesan info (jangan dihapus)
│
├── (dashboard)/
│   ├── dashboard/page.tsx           ← Rebuild: ganti widget + tabel
│   ├── add-target/page.tsx          ← DEPRECATED: redirect ke /targets/new
│   ├── targets/
│   │   ├── page.tsx                 ← BARU: Daftar Target OJS
│   │   ├── new/page.tsx             ← BARU: Tambah Target (menggantikan add-target)
│   │   └── [id]/
│   │       ├── verify/page.tsx      ← BARU: Domain Verification
│   │       └── plugin-guide/page.tsx ← BARU: Plugin Guide
│   ├── scanning/page.tsx
│   ├── vulnerability-report/page.tsx ← Tambah: Action Plan expandable
│   ├── risk-scoring/page.tsx
│   ├── scan-management/page.tsx
│   └── export/page.tsx
│
└── page.tsx                         ← Fix: bug pricing + copy OJS
```

> **Catatan:** `app/(dashboard)/add-target/` tidak dihapus tapi di-redirect ke `/targets/new` agar tidak ada broken URL. Update sidebar link dari `/add-target` ke `/targets/new` secara bersamaan.

### 6.2 TypeScript Types Baru (`types/ojsdef.ts`)

```typescript
type OJSScanType = "internal" | "external" | "full_audit"
type PluginStatus = "connected" | "disconnected" | "error" | "never_connected"
type RiskLevel = "critical" | "high" | "medium" | "low"
type UserRole = "admin_ojs" | "it_admin" | "saas_admin"

interface OJSTarget {
  id: string
  url: string
  institutionName: string
  ojsVersion: string | null
  pluginStatus: PluginStatus
  isVerified: boolean
  lastScanAt: string | null
  lastRiskScore: number | null
}

interface ActionPlanStep {
  step: number
  description: string   // Bahasa Indonesia
  estimatedTime: string
  difficulty: "mudah" | "menengah" | "sulit"
}

interface ScanFinding {
  id: string
  targetId: string
  title: string            // Bahasa Indonesia
  description: string      // Bahasa Indonesia
  cvssScore: number
  severity: RiskLevel
  sourceType: "internal" | "external"
  actionPlan: ActionPlanStep[]
  detectedAt: string
  status: "open" | "resolved"
  cveId?: string
}
```

### 6.3 RSC Optimization (Opsional, jika waktu memungkinkan)

- `app/page.tsx` (landing): hapus `"use client"`, pindahkan animasi Framer Motion ke sub-komponen client
- `app/(dashboard)/dashboard/page.tsx`: bisa menjadi RSC dengan chart sebagai client island
- Halaman form: tetap `"use client"`

---

## 7. Urutan Implementasi (Approach A)

### Week 1 (Hari 1–7)

| Hari | Task | Prioritas |
|---|---|---|
| 1 | Fix scope violations: register, forgot-pw, login links | Blocker |
| 1–2 | Rebuild `lib/mock-data.ts` + buat `types/ojsdef.ts` | Fondasi |
| 3–4 | Rebuild Dashboard page (widget + tabel + bahasa) | High |
| 5–6 | Rebuild Add Target page (scan types + routing + bahasa) | High |
| 7 | Fix landing page (bug pricing + copy OJS) | Medium |

### Week 2 (Hari 8–14)

| Hari | Task | Prioritas |
|---|---|---|
| 8–9 | Buat Domain Verification page | High (demo flow) |
| 10–11 | Buat Plugin Installation Guide page | High (demo flow) |
| 12 | Action Plan expandable di Vulnerability Report | Medium |
| 13 | RBAC UI dasar di sidebar + 3 hardcoded users | Medium |
| 14 | Buat halaman Daftar Target OJS + polish keseluruhan | Medium |

---

## 8. Risiko & Mitigasi

| Risiko | Kemungkinan | Mitigasi |
|---|---|---|
| Waktu tidak cukup untuk semua fitur | Sedang | Potong RBAC UI jika perlu — fokus demo flow dulu |
| Inkonsistensi desain saat rebuild | Rendah | Patuhi design system `AGENTS.md` — "Flat Deep Dark" |
| Routing add-target → targets/new memecah link | Rendah | Update sidebar + semua link secara bersamaan |
| Mock data kurang realistis untuk demo | Rendah | Review dengan anggota tim yang familiar domain OJS |

---

*Design doc ini merupakan output dari sesi brainstorming analisis konsistensi PRD/SRS v1.2 — OJSDef Frontend, 2026-05-18.*
