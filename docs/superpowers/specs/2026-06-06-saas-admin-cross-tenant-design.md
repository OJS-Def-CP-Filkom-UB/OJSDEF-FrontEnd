# Desain: saas_admin Cross-Tenant Access (Hybrid Read-Only ERP)

**Tanggal:** 2026-06-06  
**Status:** Draft — menunggu review  
**Scope:** OJSDEF-BackEnd + OJSDEF-FrontEnd  

---

## 1. Konteks & Masalah

### Bug saat ini

`saas_admin` login → mendapat JWT `{ role: "saas_admin", tenant_id: "<platform_tenant>" }`.
Semua endpoint list (targets, scans, reports, dashboard) memfilter data secara eksplisit di Python:

```python
tid = uuid.UUID(current["tenant_id"])
select(OJSTarget).where(OJSTarget.tenant_id == tid)
```

`saas_admin` tidak punya target terdaftar di tenant-nya sendiri → halaman tampil kosong meski RLS DB-level sudah bypass-correct. Bug ini ada di **semua** endpoint list: `targets.py`, `scans.py`, `reports.py`, `dashboard.py`.

### Kebutuhan desain yang lebih besar

`saas_admin` bukan sekadar `admin_ojs` dengan akses lebih banyak — ia adalah **administrator platform** yang perlu melihat seluruh ekosistem multi-tenant dari sudut pandang ERP/monitoring. Desain yang dipilih: **Hybrid Read-Only**.

---

## 2. Goals & Non-Goals

### Goals

- `saas_admin` dapat melihat data semua tenant (targets, scans, findings, reports, dashboard stats)
- `saas_admin` dapat memfilter tampilan per tenant via Tenant Selector
- `saas_admin` mendapatkan platform-level stats aggregated (total tenant, target, scan, temuan)
- Semua akses data oleh `saas_admin` tercatat di audit_log
- Perubahan backend minimal — endpoint existing dimodifikasi, bukan digandakan

### Non-Goals

- `saas_admin` TIDAK dapat memulai scan (`POST /api/v1/scans` → 403)
- `saas_admin` TIDAK dapat menambah / menghapus target OJS
- `saas_admin` TIDAK dapat menandai false positive pada finding
- `saas_admin` TIDAK dapat membatalkan scan (`POST /api/v1/scans/{id}/cancel` → 403)
- Tidak ada perubahan pada alur `admin_ojs` atau `viewer` yang sudah ada

---

## 3. Matriks Izin

| Aksi | viewer | admin_ojs | saas_admin |
|------|--------|-----------|------------|
| Lihat targets (tenant sendiri) | ✓ | ✓ | — |
| Lihat targets (semua tenant) | ✗ | ✗ | ✓ |
| Tambah / hapus target | ✗ | ✓ | ✗ |
| Lihat scans / findings | ✓ | ✓ | ✓ (semua tenant) |
| Mulai scan | ✗ | ✓ | ✗ |
| Batalkan scan | ✗ | ✓ | ✗ |
| Tandai false positive | ✗ | ✓ | ✗ |
| Lihat reports / download PDF | ✓ | ✓ | ✓ (semua tenant) |
| Lihat platform stats aggregated | ✗ | ✗ | ✓ |
| Kelola pengguna (CRUD) | ✗ | ✗ | ✓ |
| Lihat audit log | ✗ | ✗ | ✓ |

---

## 4. Arsitektur

```
saas_admin browser
     │
     ├─ Tenant Selector (UI) → selectedTenantId state (null = semua)
     │
     └─ Hooks: useTargets()        ← baca selectedTenantId dari TenantContext
               useScans()          ← baca selectedTenantId dari TenantContext
               useReports()        ← baca selectedTenantId dari TenantContext
               useDashboardStats() ← jika saas_admin → useAdminStats()
               useAdminTenants()   → GET /api/v1/admin/tenants (sudah ada)
               useAdminStats()     → GET /api/v1/admin/stats   (baru)
                    │
                    │  GET /api/v1/targets?tenant_id=X   (optional)
                    │  GET /api/v1/scans?tenant_id=X     (optional)
                    │  GET /api/v1/reports?tenant_id=X   (optional)
                    │  GET /api/v1/admin/stats            (baru, saas_admin only)
                    ▼
              FastAPI Backend
                    │
                    ├─ Helper: resolve_tenant_filter(current, tenant_id_param)
                    │   → saas_admin + param  : filter by param
                    │   → saas_admin + no param: no tenant filter (semua)
                    │   → other roles         : filter by own tenant_id (unchanged)
                    │
                    └─ RLS bypass saas_admin sudah correct di migration 006 ✓
```

**Prinsip kunci:**
- Tidak ada endpoint baru untuk targets/scans/reports — modifikasi minimal di endpoint yang sudah ada
- `selectedTenantId` state hidup di `TenantContext`, di-consume oleh semua hooks secara internal
- Halaman tidak perlu tahu tentang tenant — hooks yang handle
- Pemetaan `tenant_id → tenant_name` dilakukan di frontend menggunakan data dari `useAdminTenants()` (tidak perlu join di backend)

---

## 5. Backend Changes

### 5.1 Helper Baru — `app/routers/_tenant_helper.py`

File baru, diimport oleh semua router yang butuh tenant filter.

```python
import uuid

def resolve_tenant_filter(current: dict, tenant_id_param: str | None) -> uuid.UUID | None:
    """
    Return tenant UUID to filter by, or None (no filter = semua tenant).
    Non-saas_admin selalu filter ke tenant sendiri.
    saas_admin tanpa param → None, dengan param → filter ke param.
    """
    if current["role"] == "saas_admin":
        if tenant_id_param:
            try:
                return uuid.UUID(tenant_id_param)
            except ValueError:
                return None
        return None
    return uuid.UUID(current["tenant_id"])
```

### 5.2 `app/routers/targets.py`

**`GET /api/v1/targets`** — tambah optional `tenant_id` query param:

```python
@router.get("", response_model=list[TargetResponse])
async def list_targets(
    tenant_id: str | None = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = resolve_tenant_filter(current, tenant_id)
    q = select(OJSTarget)
    if tid:
        q = q.where(OJSTarget.tenant_id == tid)
    result = await db.execute(q)
    return [_to_response(t) for t in result.scalars()]
```

**`GET /api/v1/targets/{target_id}`** — saas_admin boleh akses target tenant manapun:

```python
q = select(OJSTarget).where(OJSTarget.id == target_id)
if current["role"] != "saas_admin":
    q = q.where(OJSTarget.tenant_id == uuid.UUID(current["tenant_id"]))
```

**`POST /api/v1/targets`**, **`DELETE /api/v1/targets/{id}`**, **`POST /api/v1/targets/{id}/verify`**, **`POST /api/v1/targets/{id}/regenerate-key`** — tambah guard di awal handler:

```python
if current["role"] == "saas_admin":
    raise HTTPException(403, "saas_admin tidak dapat mengelola target")
```

### 5.3 `app/routers/scans.py`

**`POST /api/v1/scans`** — tambah guard di awal handler:

```python
if current["role"] == "saas_admin":
    raise HTTPException(403, "saas_admin tidak dapat memulai scan")
```

**`GET /api/v1/scans`** — tambah optional `tenant_id` query param:

```python
@router.get("", response_model=list[ScanResponse])
async def list_scans(
    tenant_id: str | None = None,
    target_id: str | None = None,
    status: str | None = None,
    limit: int = 20,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = resolve_tenant_filter(current, tenant_id)
    q = select(ScanJob).order_by(ScanJob.created_at.desc()).limit(limit)
    if tid:
        q = q.where(ScanJob.tenant_id == tid)
    if target_id:
        q = q.where(ScanJob.target_id == target_id)
    if status:
        q = q.where(ScanJob.status == status)
    result = await db.execute(q)
    return [_to_response(j) for j in result.scalars()]
```

**`GET /api/v1/scans/{job_id}`** — saas_admin skip tenant filter:

```python
q = select(ScanJob).where(ScanJob.id == job_id)
if current["role"] != "saas_admin":
    q = q.where(ScanJob.tenant_id == uuid.UUID(current["tenant_id"]))
job = (await db.execute(q)).scalar_one_or_none()
if not job:
    raise HTTPException(404, "Scan tidak ditemukan")
```

**`GET /api/v1/scans/{job_id}/findings`** — pola sama seperti `get_scan`: skip tenant filter untuk saas_admin.

**`PATCH /api/v1/scans/{job_id}/findings/{finding_id}`** (mark false positive) — hapus `"saas_admin"` dari `require_role`:

```python
current: dict = Depends(require_role("admin_ojs"))  # saas_admin dihapus
```

**`POST /api/v1/scans/{job_id}/cancel`** — tambah guard 403 untuk saas_admin.

### 5.4 `app/routers/reports.py`

**`GET /api/v1/reports`** — tambah optional `tenant_id` param, pola sama dengan targets.

**`GET /api/v1/reports/{report_id}/pdf`** — saas_admin skip tenant filter (boleh download PDF tenant manapun).

### 5.5 `app/routers/dashboard.py`

Tambah fungsi `_build_platform_stats(db)` yang mengagregasi tanpa `WHERE tenant_id`:

```python
async def _build_platform_stats(db: AsyncSession) -> dict:
    from app.models import Tenant
    total_tenants = (await db.execute(
        select(func.count()).select_from(Tenant)
    )).scalar()
    total_targets = (await db.execute(
        select(func.count()).select_from(OJSTarget)
    )).scalar()
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    scans_result = await db.execute(
        select(ScanJob).where(ScanJob.created_at >= month_ago)
    )
    scans = scans_result.scalars().all()
    completed = [s for s in scans if s.status == "completed"]
    avg_score = (
        sum(s.overall_score for s in completed if s.overall_score) / len(completed)
        if completed else None
    )
    return {
        "platform": {
            "total_tenants": total_tenants,
            "total_targets": total_targets,
        },
        "scans": {
            "last_30_days": len(scans),
            "completed": len(completed),
            "failed": sum(1 for s in scans if s.status == "failed"),
        },
        "security_posture": {
            "average_score": round(avg_score, 1) if avg_score else None,
        },
        "findings_summary": {
            "critical": sum(s.critical_count for s in completed),
            "high": sum(s.high_count for s in completed),
        },
    }
```

Update `GET /api/v1/dashboard/stats` handler — tambah optional `tenant_id` param:

```python
@router.get("/stats")
async def dashboard_stats(
    tenant_id: str | None = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current["role"] == "saas_admin" and not tenant_id:
        cache_key = "dashboard_stats:platform"
        # ... cache check, lalu return _build_platform_stats(db)
    else:
        effective_tid = resolve_tenant_filter(current, tenant_id)
        cache_key = f"dashboard_stats:{effective_tid}"
        # ... cache check, lalu return _build_stats(db, str(effective_tid))
```

Cache key platform-wide: `"dashboard_stats:platform"`, TTL 30 detik.

### 5.6 `app/routers/admin.py` — Endpoint Baru

```python
@router.get("/stats", dependencies=[_saas])
async def platform_overview_stats(db: AsyncSession = Depends(get_db)):
    """Platform-wide aggregated stats untuk saas_admin dashboard widget."""
    from app.models import Tenant
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    threshold_15m = now - timedelta(minutes=15)
    month_ago = now - timedelta(days=30)

    total_tenants = (await db.execute(select(func.count()).select_from(Tenant))).scalar()
    total_targets = (await db.execute(select(func.count()).select_from(OJSTarget))).scalar()
    active_targets = (await db.execute(
        select(func.count()).select_from(OJSTarget)
        .where(OJSTarget.plugin_last_seen >= threshold_15m)
    )).scalar()
    scans_30d = (await db.execute(
        select(func.count()).select_from(ScanJob)
        .where(ScanJob.created_at >= month_ago)
    )).scalar()
    critical_findings = (await db.execute(
        select(func.count()).select_from(ScanJob)
        .where(ScanJob.critical_count > 0, ScanJob.status == "completed")
    )).scalar()

    return {
        "total_tenants": total_tenants,
        "total_targets": total_targets,
        "active_targets": active_targets,
        "scans_last_30_days": scans_30d,
        "scans_with_critical_findings": critical_findings,
    }
```

---

## 6. Frontend Changes

### 6.1 `lib/tenant-context.tsx` (file baru)

```tsx
'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'

interface TenantContextValue {
  selectedTenantId: string | null  // null = semua tenant
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
```

Wrap `TenantProvider` di `app/(dashboard)/layout.tsx` — di dalam `AuthProvider`.

### 6.2 `components/shared/TenantSelector.tsx` (file baru)

- Render hanya jika `user?.role === "saas_admin"`
- Fetch daftar tenant dari `useAdminTenants()` (hook di `hooks/use-admin.ts`)
- ShadCN `Select` component
- Opsi pertama: `{ value: null, label: "Semua Tenant" }`
- Opsi selanjutnya: tenant dari DB
- On change: `setSelectedTenantId(value)`

Posisi di `Sidebar.tsx`: di bawah blok nama user ("SaaS Administrator / admin@ojsdef.com"), sebelum divider logout.

### 6.3 Hook Updates

**Pola umum** — semua hook list baca `selectedTenantId` dari TenantContext:

```ts
// hooks/use-targets.ts
export function useTargets() {
  const { selectedTenantId } = useTenantContext()
  return useQuery({
    queryKey: ['targets', selectedTenantId],
    queryFn: () =>
      api.get<OJSTarget[]>('/api/v1/targets', {
        params: selectedTenantId ? { tenant_id: selectedTenantId } : {},
      }).then(r => r.data),
  })
}
```

Hook yang diupdate:
- `hooks/use-targets.ts` — `useTargets()`
- `hooks/use-scans.ts` — `useScans()`
- `hooks/use-reports.ts` — `useReports()`
- `hooks/use-dashboard.ts` — `useDashboardStats()`: jika saas_admin kirim `tenant_id` param (atau tidak kirim jika null → platform stats)

**Hook baru** di `hooks/use-admin.ts` (tambah ke file yang sudah ada):

```ts
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/api/v1/admin/stats').then(r => r.data),
    staleTime: 30_000,
  })
}

export function useAdminTenants() {
  return useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () =>
      api.get<{ id: string; name: string; slug: string }[]>('/api/v1/admin/tenants')
        .then(r => r.data),
    staleTime: 5 * 60_000,
  })
}
```

### 6.4 Perubahan Per Halaman

#### `app/(dashboard)/dashboard/page.tsx`
- Jika `saas_admin`: gunakan `useAdminStats()` untuk widget summary utama
- Tambah widget **"Total Tenant"** dan **"Tenant dengan Scan Kritis"** (dari `useAdminStats()`)
- Tabel "Scan Terbaru" tampilkan kolom **"Tenant"** jika saas_admin (map via `useAdminTenants()`)
- Jika bukan saas_admin: tidak ada perubahan

#### `app/(dashboard)/targets/page.tsx`
- Sembunyikan tombol **"Tambah Target"** jika `saas_admin`
- Sembunyikan tombol **hapus (Trash2)** per card jika `saas_admin`
- Tampilkan badge nama tenant di setiap card jika `saas_admin && !selectedTenantId`
- Nama tenant diambil dari `useAdminTenants()` → map `tenant_id → name`

#### `app/(dashboard)/scan-management/page.tsx`
- Sembunyikan tombol **"Mulai Scan Baru"** jika `saas_admin`
- Tampilkan kolom **"Tenant"** di tabel jika `saas_admin && !selectedTenantId`

#### `app/(dashboard)/scanning/page.tsx`
- Sembunyikan form trigger scan jika `saas_admin`
- Tampilkan banner info: "saas_admin hanya dapat memantau scan yang berjalan"

#### `app/(dashboard)/vulnerability-report/page.tsx`
- Sembunyikan tombol **"Tandai Positif Palsu"** jika `saas_admin`
- Tampilkan kolom **"Tenant"** jika `saas_admin && !selectedTenantId`

#### `app/(dashboard)/risk-scoring/page.tsx`
- Tidak ada aksi yang perlu disembunyikan (sudah read-only)
- Tampilkan kolom **"Tenant"** jika `saas_admin && !selectedTenantId`

#### `app/(dashboard)/export/page.tsx`
- Tidak ada perubahan — saas_admin boleh download PDF

#### `components/layout/Sidebar.tsx`
- Hapus "Mulai Scan" dari nav saas_admin (saat ini masih muncul di nav index 7)
- Tambah `<TenantSelector />` di bawah blok nama user

---

## 7. Audit Logging

Akses read (GET) oleh `saas_admin` tidak dicatat — sesuai praktik standar (audit log hanya untuk mutasi).

Mutasi yang tetap tercatat (bukan oleh saas_admin setelah fix ini):
- `target.created`, `target.deleted`, `target.verified` — `admin_ojs`
- `scan.started`, `scan.cancelled` — `admin_ojs`
- `finding.false_positive_toggled` — `admin_ojs`
- `user.created`, `user.updated`, `user.deleted` — `saas_admin` (sudah ada ✓)

---

## 8. Urutan Implementasi

### Backend (selesaikan dulu sebelum frontend)

1. Buat `app/routers/_tenant_helper.py` — fungsi `resolve_tenant_filter`
2. Update `app/routers/targets.py`:
   - `list_targets`: bypass tenant filter untuk saas_admin
   - `get_target`: bypass tenant filter untuk saas_admin
   - `add_target`, `delete_target`, `verify_target`, `regen_key`: guard 403 untuk saas_admin
3. Update `app/routers/scans.py`:
   - `start_scan`: guard 403 untuk saas_admin
   - `list_scans`: bypass tenant filter untuk saas_admin
   - `get_scan`, `get_findings`: bypass tenant filter untuk saas_admin
   - `mark_false_positive`: hapus `saas_admin` dari `require_role`
   - `cancel_scan`: guard 403 untuk saas_admin
4. Update `app/routers/reports.py`:
   - `list_reports`, `download_pdf`: bypass tenant filter untuk saas_admin
5. Update `app/routers/dashboard.py`:
   - Tambah `_build_platform_stats(db)`
   - Update `dashboard_stats` handler — tambah `tenant_id` param + branching saas_admin
6. Update `app/routers/admin.py`:
   - Tambah `GET /api/v1/admin/stats`

### Frontend

7. Buat `lib/tenant-context.tsx`
8. Update `app/(dashboard)/layout.tsx` — wrap `TenantProvider`
9. Tambah `useAdminStats()` dan `useAdminTenants()` ke `hooks/use-admin.ts`
10. Update hooks: `use-targets`, `use-scans`, `use-reports`, `use-dashboard`
11. Buat `components/shared/TenantSelector.tsx`
12. Update `components/layout/Sidebar.tsx` — TenantSelector + hapus "Mulai Scan" dari saas_admin nav
13. Update halaman: `dashboard`, `targets`, `scan-management`, `scanning`, `vulnerability-report`, `risk-scoring`

---

## 9. Asumsi & Risiko

| Item | Keterangan |
|------|-----------|
| RLS bypass sudah benar | Migration 006 sudah set policy — tidak perlu migration baru |
| `GET /api/v1/admin/tenants` sudah ada | Dipakai TenantSelector untuk fetch daftar tenant |
| Pemetaan tenant_id → name di frontend | `useAdminTenants()` dijadikan sumber data lokal; tidak perlu join di backend |
| Redis cache platform-wide | Cache key `"dashboard_stats:platform"`, TTL 30 detik |
| `saas_admin` tenant sendiri | Tetap ada `tenant_id` di JWT tapi tidak lagi dipakai untuk filter setelah fix |
| Tidak ada migration baru | Semua perubahan adalah logic-level, tidak ada schema DB baru |
