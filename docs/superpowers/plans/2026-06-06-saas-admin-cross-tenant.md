# saas_admin Cross-Tenant Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perbaiki bug saas_admin tidak bisa lihat data tenant lain, dan implementasikan Hybrid Read-Only ERP view: saas_admin bisa lihat semua data lintas tenant via Tenant Selector, tapi tidak bisa trigger aksi (scan, tambah/hapus target, false positive).

**Architecture:** Backend menambahkan helper `resolve_tenant_filter()` yang dibagikan ke semua router list endpoint — saas_admin tanpa `tenant_id` param mendapat semua data, dengan param mendapat data tenant tertentu. Frontend menambahkan `TenantContext` + `TenantSelector` komponen yang di-consume semua hooks secara transparan.

**Tech Stack:** FastAPI + SQLAlchemy async (backend), Next.js 16 App Router + TanStack Query + ShadCN (frontend), pytest + unittest.mock (testing tanpa DB), TypeScript tsc (frontend type check).

**Constraint:** Tidak ada koneksi DB atau Docker. Semua test backend menggunakan mock DB (`AsyncMock`). Verifikasi frontend via `npx tsc --noEmit`.

---

## Parallelization Map

```
Wave 1 (sequential):
  └─ B1: _tenant_helper.py

Wave 2 (semua parallel setelah B1):
  ├─ B2: targets.py
  ├─ B3: scans.py
  ├─ B4: reports.py
  ├─ B5: dashboard.py
  ├─ B6: admin.py (stats endpoint baru)
  ├─ F1: types/api.ts + lib/tenant-context.tsx
  └─ F2: hooks/use-admin.ts

Wave 3 (parallel, setelah F1+F2):
  ├─ F3: layout.tsx + TenantSelector.tsx
  └─ F4: hooks use-targets, use-scans, use-reports, use-dashboard

Wave 4 (parallel, setelah F3+F4):
  ├─ F5: Sidebar.tsx
  └─ F6: Pages (dashboard, targets, scan-management, scanning, vulnerability-report)
```

---

## File Map

**Backend (OJSDEF-BackEnd):**
- Create: `app/routers/_tenant_helper.py`
- Modify: `app/routers/targets.py`
- Modify: `app/routers/scans.py`
- Modify: `app/routers/reports.py`
- Modify: `app/routers/dashboard.py`
- Modify: `app/routers/admin.py`
- Create: `tests/__init__.py`
- Create: `tests/test_tenant_helper.py`
- Create: `tests/test_targets_rbac.py`
- Create: `tests/test_scans_rbac.py`

**Frontend (OJSDEF-FrontEnd):**
- Modify: `types/api.ts`
- Create: `lib/tenant-context.tsx`
- Modify: `hooks/use-admin.ts`
- Modify: `app/(dashboard)/layout.tsx`
- Create: `components/shared/TenantSelector.tsx`
- Modify: `hooks/use-targets.ts`
- Modify: `hooks/use-scans.ts`
- Modify: `hooks/use-reports.ts`
- Modify: `hooks/use-dashboard.ts`
- Modify: `components/layout/Sidebar.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `app/(dashboard)/targets/page.tsx`
- Modify: `app/(dashboard)/scan-management/page.tsx`
- Modify: `app/(dashboard)/scanning/page.tsx`
- Modify: `app/(dashboard)/vulnerability-report/page.tsx`

---

## Task B1: Helper `resolve_tenant_filter` (Wave 1 — sequential)

**Files:**
- Create: `app/routers/_tenant_helper.py`
- Create: `tests/__init__.py`
- Create: `tests/test_tenant_helper.py`

- [ ] **Step 1: Buat file helper**

`app/routers/_tenant_helper.py`:
```python
import uuid


def resolve_tenant_filter(current: dict, tenant_id_param: str | None) -> uuid.UUID | None:
    """
    Return tenant UUID to filter by, or None (no filter = semua tenant).
    - Non-saas_admin: selalu filter ke tenant sendiri (dari JWT).
    - saas_admin tanpa param: None (semua tenant).
    - saas_admin dengan param valid: filter ke tenant yang diminta.
    - saas_admin dengan param UUID tidak valid: None (abaikan, return semua).
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

- [ ] **Step 2: Buat `tests/__init__.py`** (file kosong)

- [ ] **Step 3: Tulis test untuk helper**

`tests/test_tenant_helper.py`:
```python
import uuid
import pytest
from app.routers._tenant_helper import resolve_tenant_filter


SAAS_ADMIN = {"role": "saas_admin", "tenant_id": "00000000-0000-0000-0000-000000000001"}
ADMIN_OJS = {"role": "admin_ojs", "tenant_id": "00000000-0000-0000-0000-000000000002"}
VIEWER = {"role": "viewer", "tenant_id": "00000000-0000-0000-0000-000000000003"}


def test_non_saas_returns_own_tenant_admin_ojs():
    result = resolve_tenant_filter(ADMIN_OJS, None)
    assert result == uuid.UUID(ADMIN_OJS["tenant_id"])


def test_non_saas_returns_own_tenant_viewer():
    result = resolve_tenant_filter(VIEWER, None)
    assert result == uuid.UUID(VIEWER["tenant_id"])


def test_non_saas_ignores_tenant_id_param():
    other_tid = str(uuid.uuid4())
    result = resolve_tenant_filter(ADMIN_OJS, other_tid)
    assert result == uuid.UUID(ADMIN_OJS["tenant_id"])


def test_saas_no_param_returns_none():
    result = resolve_tenant_filter(SAAS_ADMIN, None)
    assert result is None


def test_saas_with_valid_param_returns_uuid():
    target_tid = str(uuid.uuid4())
    result = resolve_tenant_filter(SAAS_ADMIN, target_tid)
    assert result == uuid.UUID(target_tid)


def test_saas_with_invalid_uuid_param_returns_none():
    result = resolve_tenant_filter(SAAS_ADMIN, "bukan-uuid-valid")
    assert result is None


def test_saas_with_empty_string_param_returns_none():
    result = resolve_tenant_filter(SAAS_ADMIN, "")
    assert result is None
```

- [ ] **Step 4: Jalankan test (dari direktori OJSDEF-BackEnd)**

```
venv\Scripts\python -m pytest tests/test_tenant_helper.py -v
```

Expected:
```
PASSED tests/test_tenant_helper.py::test_non_saas_returns_own_tenant_admin_ojs
PASSED tests/test_tenant_helper.py::test_non_saas_returns_own_tenant_viewer
PASSED tests/test_tenant_helper.py::test_non_saas_ignores_tenant_id_param
PASSED tests/test_tenant_helper.py::test_saas_no_param_returns_none
PASSED tests/test_tenant_helper.py::test_saas_with_valid_param_returns_uuid
PASSED tests/test_tenant_helper.py::test_saas_with_invalid_uuid_param_returns_none
PASSED tests/test_tenant_helper.py::test_saas_with_empty_string_param_returns_none
7 passed
```

- [ ] **Step 5: Commit**

```
git -C OJSDEF-BackEnd add app/routers/_tenant_helper.py tests/__init__.py tests/test_tenant_helper.py
git -C OJSDEF-BackEnd commit -m "feat(rbac): add resolve_tenant_filter helper for saas_admin cross-tenant access"
```

---

## Task B2: Update `targets.py` (Wave 2 — parallel)

**Files:**
- Modify: `app/routers/targets.py`
- Create: `tests/test_targets_rbac.py`

- [ ] **Step 1: Tulis test 403 guards**

`tests/test_targets_rbac.py`:
```python
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth import get_current_user
from app.database import get_db


SAAS_ADMIN = {
    "role": "saas_admin",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "sub": "saas-admin-id",
    "email": "admin@ojsdef.com",
}
ADMIN_OJS = {
    "role": "admin_ojs",
    "tenant_id": "00000000-0000-0000-0000-000000000002",
    "sub": "ojs-admin-id",
    "email": "admin@ub.ac.id",
}


def make_mock_db():
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value = MagicMock(return_value=iter([]))
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalar.return_value = 0
    mock_session.execute.return_value = mock_result

    async def _db():
        yield mock_session

    return _db


@pytest.fixture
def client_saas():
    app.dependency_overrides[get_current_user] = lambda: SAAS_ADMIN
    app.dependency_overrides[get_db] = make_mock_db()
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def client_ojs():
    app.dependency_overrides[get_current_user] = lambda: ADMIN_OJS
    app.dependency_overrides[get_db] = make_mock_db()
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_saas_admin_cannot_create_target(client_saas):
    resp = client_saas.post("/api/v1/targets", json={"name": "Test", "url": "http://test.com"})
    assert resp.status_code == 403


def test_saas_admin_cannot_delete_target(client_saas):
    tid = str(uuid.uuid4())
    resp = client_saas.delete(f"/api/v1/targets/{tid}")
    assert resp.status_code == 403


def test_saas_admin_cannot_verify_target(client_saas):
    tid = str(uuid.uuid4())
    resp = client_saas.post(f"/api/v1/targets/{tid}/verify")
    assert resp.status_code == 403


def test_saas_admin_cannot_regenerate_key(client_saas):
    tid = str(uuid.uuid4())
    resp = client_saas.post(f"/api/v1/targets/{tid}/regenerate-key")
    assert resp.status_code == 403


def test_saas_admin_can_list_targets(client_saas):
    resp = client_saas.get("/api/v1/targets")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_admin_ojs_list_targets_returns_200(client_ojs):
    resp = client_ojs.get("/api/v1/targets")
    assert resp.status_code == 200
```

- [ ] **Step 2: Jalankan test — pastikan GAGAL (guards belum ada)**

```
venv\Scripts\python -m pytest tests/test_targets_rbac.py::test_saas_admin_cannot_create_target -v
```

Expected: `FAILED`

- [ ] **Step 3: Update `app/routers/targets.py`**

Tambahkan import setelah baris `from app.core.audit import create_audit_log`:
```python
from app.routers._tenant_helper import resolve_tenant_filter
```

Ganti `list_targets` (baris 57-66 di file asli):
```python
@router.get("", response_model=list[TargetResponse])
async def list_targets(
    tenant_id: str | None = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = resolve_tenant_filter(current, tenant_id)
    q = select(OJSTarget)
    if tid is not None:
        q = q.where(OJSTarget.tenant_id == tid)
    result = await db.execute(q)
    return [_to_response(t) for t in result.scalars()]
```

Ganti `get_target` (baris 85-100 di file asli):
```python
@router.get("/{target_id}", response_model=TargetResponse)
async def get_target(
    target_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(OJSTarget).where(OJSTarget.id == target_id)
    if current["role"] != "saas_admin":
        q = q.where(OJSTarget.tenant_id == uuid.UUID(current["tenant_id"]))
    target = (await db.execute(q)).scalar_one_or_none()
    if not target:
        raise HTTPException(404, "Target tidak ditemukan")
    return _to_response(target)
```

Tambahkan guard di awal body `add_target` (tepat setelah baris `db: AsyncSession = Depends(get_db),`):
```python
    if current["role"] == "saas_admin":
        raise HTTPException(403, "saas_admin tidak dapat mengelola target")
```

Tambahkan guard di awal body `delete_target` (tepat setelah dependencies):
```python
    if current["role"] == "saas_admin":
        raise HTTPException(403, "saas_admin tidak dapat mengelola target")
```

Tambahkan guard di awal body `verify_target` (tepat setelah dependencies):
```python
    if current["role"] == "saas_admin":
        raise HTTPException(403, "saas_admin tidak dapat mengelola target")
```

Tambahkan guard di awal body `regen_key` (tepat setelah dependencies):
```python
    if current["role"] == "saas_admin":
        raise HTTPException(403, "saas_admin tidak dapat mengelola target")
```

- [ ] **Step 4: Jalankan semua test targets**

```
venv\Scripts\python -m pytest tests/test_targets_rbac.py -v
```

Expected: semua 6 test PASSED

- [ ] **Step 5: Commit**

```
git -C OJSDEF-BackEnd add app/routers/targets.py tests/test_targets_rbac.py
git -C OJSDEF-BackEnd commit -m "feat(rbac): saas_admin cross-tenant list targets + guard mutating endpoints"
```

---

## Task B3: Update `scans.py` (Wave 2 — parallel)

**Files:**
- Modify: `app/routers/scans.py`
- Create: `tests/test_scans_rbac.py`

- [ ] **Step 1: Tulis test 403 guards**

`tests/test_scans_rbac.py`:
```python
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth import get_current_user
from app.database import get_db


SAAS_ADMIN = {
    "role": "saas_admin",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "sub": "saas-admin-id",
    "email": "admin@ojsdef.com",
}


def make_mock_db():
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value = MagicMock(return_value=iter([]))
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalar.return_value = 0
    mock_session.execute.return_value = mock_result

    async def _db():
        yield mock_session

    return _db


@pytest.fixture
def client_saas():
    app.dependency_overrides[get_current_user] = lambda: SAAS_ADMIN
    app.dependency_overrides[get_db] = make_mock_db()
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_saas_admin_cannot_start_scan(client_saas):
    resp = client_saas.post("/api/v1/scans", json={
        "target_id": str(uuid.uuid4()),
        "scan_type": "external",
    })
    assert resp.status_code == 403


def test_saas_admin_cannot_cancel_scan(client_saas):
    job_id = str(uuid.uuid4())
    resp = client_saas.post(f"/api/v1/scans/{job_id}/cancel")
    assert resp.status_code == 403


def test_saas_admin_can_list_scans(client_saas):
    resp = client_saas.get("/api/v1/scans")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
```

- [ ] **Step 2: Jalankan test — pastikan GAGAL**

```
venv\Scripts\python -m pytest tests/test_scans_rbac.py::test_saas_admin_cannot_start_scan -v
```

Expected: `FAILED`

- [ ] **Step 3: Update `app/routers/scans.py`**

Tambahkan import setelah imports yang ada:
```python
from app.routers._tenant_helper import resolve_tenant_filter
```

Tambahkan guard di awal body `start_scan` (baris 54-114), sebelum `tid = uuid.UUID(...)`:
```python
    if current["role"] == "saas_admin":
        raise HTTPException(403, "saas_admin tidak dapat memulai scan")
```

Ganti `list_scans` (baris 117-137):
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
    if tid is not None:
        q = q.where(ScanJob.tenant_id == tid)
    if target_id:
        q = q.where(ScanJob.target_id == target_id)
    if status:
        q = q.where(ScanJob.status == status)
    result = await db.execute(q)
    return [_to_response(j) for j in result.scalars()]
```

Ganti `get_scan` (baris 140-156):
```python
@router.get("/{job_id}", response_model=ScanResponse)
async def get_scan(
    job_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(ScanJob).where(ScanJob.id == job_id)
    if current["role"] != "saas_admin":
        q = q.where(ScanJob.tenant_id == uuid.UUID(current["tenant_id"]))
    job = (await db.execute(q)).scalar_one_or_none()
    if not job:
        raise HTTPException(404, "Scan tidak ditemukan")
    progress = await _get_progress(str(job_id))
    return _to_response(job, progress)
```

Ganti verifikasi ownership di awal `get_findings` (baris 159-195):
```python
    job_q = select(ScanJob).where(ScanJob.id == job_id)
    if current["role"] != "saas_admin":
        job_q = job_q.where(ScanJob.tenant_id == uuid.UUID(current["tenant_id"]))
    if not (await db.execute(job_q)).scalar_one_or_none():
        raise HTTPException(404, "Scan tidak ditemukan")
```

Pada `mark_false_positive` (baris 199), ubah `require_role` — hapus `"saas_admin"`:
```python
    current: dict = Depends(require_role("admin_ojs")),
```

Tambahkan guard di awal body `cancel_scan` (baris 239):
```python
    if current["role"] == "saas_admin":
        raise HTTPException(403, "saas_admin tidak dapat membatalkan scan")
```

- [ ] **Step 4: Jalankan semua test scans**

```
venv\Scripts\python -m pytest tests/test_scans_rbac.py -v
```

Expected: semua 3 test PASSED

- [ ] **Step 5: Commit**

```
git -C OJSDEF-BackEnd add app/routers/scans.py tests/test_scans_rbac.py
git -C OJSDEF-BackEnd commit -m "feat(rbac): saas_admin cross-tenant list scans + guard start/cancel/false-positive"
```

---

## Task B4: Update `reports.py` (Wave 2 — parallel)

**Files:**
- Modify: `app/routers/reports.py`

- [ ] **Step 1: Update `app/routers/reports.py`**

Tambahkan import setelah imports yang ada:
```python
from app.routers._tenant_helper import resolve_tenant_filter
```

Ganti `list_reports` (baris 28-41):
```python
@router.get("", response_model=list[ReportResponse])
async def list_reports(
    tenant_id: str | None = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = resolve_tenant_filter(current, tenant_id)
    q = select(Report).order_by(Report.created_at.desc())
    if tid is not None:
        q = q.where(Report.tenant_id == tid)
    result = await db.execute(q)
    return [
        ReportResponse(id=str(r.id), job_id=str(r.job_id), format=r.format,
                       file_size_bytes=r.file_size_bytes, created_at=r.created_at)
        for r in result.scalars()
    ]
```

Di `download_pdf` (baris 44-73), ubah query untuk skip tenant filter bagi saas_admin:
```python
    q = select(Report).where(Report.id == report_id, Report.format == "pdf")
    if current["role"] != "saas_admin":
        q = q.where(Report.tenant_id == uuid.UUID(current["tenant_id"]))
    result = await db.execute(q)
    report = result.scalar_one_or_none()
```

Di `download_json` (baris 77-119), ubah query untuk skip tenant filter bagi saas_admin:
```python
    q = select(Report).where(Report.id == report_id)
    if current["role"] != "saas_admin":
        q = q.where(Report.tenant_id == uuid.UUID(current["tenant_id"]))
    result = await db.execute(q)
    report = result.scalar_one_or_none()
```

- [ ] **Step 2: Syntax check**

```
cd OJSDEF-BackEnd && venv\Scripts\python -c "import ast; ast.parse(open('app/routers/reports.py').read()); print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git -C OJSDEF-BackEnd add app/routers/reports.py
git -C OJSDEF-BackEnd commit -m "feat(rbac): saas_admin cross-tenant list and download reports"
```

---

## Task B5: Update `dashboard.py` (Wave 2 — parallel)

**Files:**
- Modify: `app/routers/dashboard.py`

- [ ] **Step 1: Update `app/routers/dashboard.py`**

Tambahkan import di atas (tambahkan ke baris import yang ada):
```python
from app.models import Tenant
from app.routers._tenant_helper import resolve_tenant_filter
```

Tambahkan fungsi `_build_platform_stats` setelah fungsi `_build_stats` (setelah baris 58):
```python
async def _build_platform_stats(db: AsyncSession) -> dict:
    total_tenants = (await db.execute(
        select(func.count()).select_from(Tenant)
    )).scalar() or 0

    total_targets = (await db.execute(
        select(func.count()).select_from(OJSTarget)
    )).scalar() or 0

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
        "platform": {"total_tenants": total_tenants, "total_targets": total_targets},
        "targets": {"total": total_targets},
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

Ganti `dashboard_stats` handler (baris 61-77):
```python
@router.get("/stats")
async def dashboard_stats(
    tenant_id: str | None = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    r = aioredis.from_url(settings.redis_url, decode_responses=True)

    if current["role"] == "saas_admin" and not tenant_id:
        cache_key = "dashboard_stats:platform"
        cached = await r.get(cache_key)
        if cached:
            await r.aclose()
            return json.loads(cached)
        stats = await _build_platform_stats(db)
        await r.setex(cache_key, 30, json.dumps(stats))
        await r.aclose()
        return stats

    effective_tid = resolve_tenant_filter(current, tenant_id)
    tid_str = str(effective_tid) if effective_tid else current["tenant_id"]
    cache_key = f"dashboard_stats:{tid_str}"
    cached = await r.get(cache_key)
    if cached:
        await r.aclose()
        return json.loads(cached)

    stats = await _build_stats(db, tid_str)
    await r.setex(cache_key, 60, json.dumps(stats))
    await r.aclose()
    return stats
```

- [ ] **Step 2: Syntax check**

```
cd OJSDEF-BackEnd && venv\Scripts\python -c "import ast; ast.parse(open('app/routers/dashboard.py').read()); print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git -C OJSDEF-BackEnd add app/routers/dashboard.py
git -C OJSDEF-BackEnd commit -m "feat(rbac): saas_admin platform-wide dashboard stats with Redis cache"
```

---

## Task B6: Update `admin.py` — endpoint stats baru (Wave 2 — parallel)

**Files:**
- Modify: `app/routers/admin.py`

- [ ] **Step 1: Update `app/routers/admin.py`**

Tambahkan import yang dibutuhkan (tambahkan ke baris import yang ada):
```python
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from app.models import OJSTarget, ScanJob
```

Tambahkan endpoint baru di akhir file (setelah fungsi `list_tenants`):
```python
@router.get("/stats", dependencies=[_saas])
async def platform_overview_stats(db: AsyncSession = Depends(get_db)):
    """Aggregated stats lintas semua tenant untuk saas_admin dashboard."""
    now = datetime.now(timezone.utc)
    threshold_15m = now - timedelta(minutes=15)
    month_ago = now - timedelta(days=30)

    total_tenants = (await db.execute(
        select(func.count()).select_from(Tenant)
    )).scalar() or 0

    total_targets = (await db.execute(
        select(func.count()).select_from(OJSTarget)
    )).scalar() or 0

    active_targets = (await db.execute(
        select(func.count()).select_from(OJSTarget)
        .where(OJSTarget.plugin_last_seen >= threshold_15m)
    )).scalar() or 0

    scans_30d = (await db.execute(
        select(func.count()).select_from(ScanJob)
        .where(ScanJob.created_at >= month_ago)
    )).scalar() or 0

    scans_with_critical = (await db.execute(
        select(func.count()).select_from(ScanJob)
        .where(ScanJob.critical_count > 0, ScanJob.status == "completed")
    )).scalar() or 0

    return {
        "total_tenants": total_tenants,
        "total_targets": total_targets,
        "active_targets": active_targets,
        "scans_last_30_days": scans_30d,
        "scans_with_critical_findings": scans_with_critical,
    }
```

- [ ] **Step 2: Syntax check**

```
cd OJSDEF-BackEnd && venv\Scripts\python -c "import ast; ast.parse(open('app/routers/admin.py').read()); print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```
git -C OJSDEF-BackEnd add app/routers/admin.py
git -C OJSDEF-BackEnd commit -m "feat(rbac): add GET /api/v1/admin/stats platform overview endpoint"
```

---

## Task F1: `types/api.ts` + `lib/tenant-context.tsx` (Wave 2 — parallel)

**Files:**
- Modify: `types/api.ts`
- Create: `lib/tenant-context.tsx`

- [ ] **Step 1: Tambah type `AdminPlatformStats` ke `types/api.ts`**

Tambahkan setelah blok `// Dashboard` (setelah baris `export interface DashboardStats { ... }`):
```typescript
// Admin Platform Stats
export interface AdminPlatformStats {
  total_tenants: number
  total_targets: number
  active_targets: number
  scans_last_30_days: number
  scans_with_critical_findings: number
}
```

- [ ] **Step 2: Buat `lib/tenant-context.tsx`**

```tsx
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
```

- [ ] **Step 3: TypeScript check (dari direktori OJSDEF-FrontEnd)**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```
git -C OJSDEF-FrontEnd add types/api.ts lib/tenant-context.tsx
git -C OJSDEF-FrontEnd commit -m "feat(rbac): add AdminPlatformStats type + TenantContext for saas_admin cross-tenant"
```

---

## Task F2: Update `hooks/use-admin.ts` (Wave 2 — parallel)

**Files:**
- Modify: `hooks/use-admin.ts`

- [ ] **Step 1: Update `hooks/use-admin.ts`**

Tambahkan `AdminPlatformStats` ke import types di baris atas:
```typescript
import type {
  AdminUserListItem,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  Tenant,
  CreateTenantRequest,
  AdminPlatformStats,
} from '@/types/api'
```

Tambahkan fungsi `useAdminStats` di akhir file:
```typescript
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      api.get<AdminPlatformStats>('/api/v1/admin/stats').then((r) => r.data),
    staleTime: 30_000,
  })
}
```

- [ ] **Step 2: TypeScript check**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```
git -C OJSDEF-FrontEnd add hooks/use-admin.ts
git -C OJSDEF-FrontEnd commit -m "feat(rbac): add useAdminStats hook for saas_admin platform overview"
```

---

## Task F3: `layout.tsx` + `TenantSelector.tsx` (Wave 3 — parallel)

**Files:**
- Modify: `app/(dashboard)/layout.tsx`
- Create: `components/shared/TenantSelector.tsx`

- [ ] **Step 1: Buat `components/shared/TenantSelector.tsx`**

```tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useAdminTenants } from '@/hooks/use-admin'
import { useTenantContext } from '@/lib/tenant-context'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'

export function TenantSelector() {
  const { user } = useAuth()
  const { selectedTenantId, setSelectedTenantId } = useTenantContext()
  const { data: tenants } = useAdminTenants()

  if (user?.role !== 'saas_admin') return null

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Building2 className="h-3 w-3 text-slate-500" />
        <span className="text-slate-500 text-xs">Filter Tenant</span>
      </div>
      <Select
        value={selectedTenantId ?? 'all'}
        onValueChange={(v) => setSelectedTenantId(v === 'all' ? null : v)}
      >
        <SelectTrigger className="h-8 bg-slate-900/60 border-white/10 text-slate-300 text-xs">
          <SelectValue placeholder="Semua Tenant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Semua Tenant</SelectItem>
          {tenants?.map((t) => (
            <SelectItem key={t.id} value={t.id} className="text-xs">
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 2: Update `app/(dashboard)/layout.tsx`**

```tsx
"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { TenantProvider } from "@/lib/tenant-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <AppShell>
        {children}
      </AppShell>
    </TenantProvider>
  );
}
```

- [ ] **Step 3: TypeScript check**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```
git -C OJSDEF-FrontEnd add "app/(dashboard)/layout.tsx" components/shared/TenantSelector.tsx
git -C OJSDEF-FrontEnd commit -m "feat(rbac): TenantSelector component + TenantProvider in dashboard layout"
```

---

## Task F4: Update Hooks (Wave 3 — parallel)

**Files:**
- Modify: `hooks/use-targets.ts`
- Modify: `hooks/use-scans.ts`
- Modify: `hooks/use-reports.ts`
- Modify: `hooks/use-dashboard.ts`

- [ ] **Step 1: Update `hooks/use-targets.ts`**

Tambahkan import di atas (setelah imports yang ada):
```typescript
import { useTenantContext } from '@/lib/tenant-context'
```

Ganti fungsi `useTargets`:
```typescript
export function useTargets() {
  const { selectedTenantId } = useTenantContext()
  return useQuery({
    queryKey: ['targets', selectedTenantId],
    queryFn: () =>
      api.get<OJSTarget[]>('/api/v1/targets', {
        params: selectedTenantId ? { tenant_id: selectedTenantId } : {},
      }).then((r) => r.data),
  })
}
```

- [ ] **Step 2: Update `hooks/use-scans.ts`**

Tambahkan import:
```typescript
import { useTenantContext } from '@/lib/tenant-context'
```

Ganti fungsi `useScans`:
```typescript
export function useScans(params?: { limit?: number }) {
  const { selectedTenantId } = useTenantContext()
  const limit = params?.limit
  return useQuery({
    queryKey: ['scans', { limit, tenantId: selectedTenantId }],
    queryFn: () => {
      const queryParams: Record<string, string | number> = {}
      if (limit) queryParams.limit = limit
      if (selectedTenantId) queryParams.tenant_id = selectedTenantId
      return api.get<ScanJob[]>('/api/v1/scans', { params: queryParams }).then((r) => r.data)
    },
  })
}
```

- [ ] **Step 3: Update `hooks/use-reports.ts`**

Tambahkan import:
```typescript
import { useTenantContext } from '@/lib/tenant-context'
```

Ganti fungsi `useReports`:
```typescript
export function useReports() {
  const { selectedTenantId } = useTenantContext()
  return useQuery({
    queryKey: ['reports', selectedTenantId],
    queryFn: () =>
      api.get<Report[]>('/api/v1/reports', {
        params: selectedTenantId ? { tenant_id: selectedTenantId } : {},
      }).then((r) => r.data),
  })
}
```

- [ ] **Step 4: Update `hooks/use-dashboard.ts`**

Ganti seluruh isi file:
```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useTenantContext } from '@/lib/tenant-context'
import type { DashboardStats } from '@/types/api'

export function useDashboardStats() {
  const { selectedTenantId } = useTenantContext()
  return useQuery({
    queryKey: ['dashboard', selectedTenantId],
    queryFn: () =>
      api.get<DashboardStats>('/api/v1/dashboard/stats', {
        params: selectedTenantId ? { tenant_id: selectedTenantId } : {},
      }).then((r) => r.data),
  })
}
```

- [ ] **Step 5: TypeScript check**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```
git -C OJSDEF-FrontEnd add hooks/use-targets.ts hooks/use-scans.ts hooks/use-reports.ts hooks/use-dashboard.ts
git -C OJSDEF-FrontEnd commit -m "feat(rbac): all data hooks read selectedTenantId from TenantContext"
```

---

## Task F5: Update `Sidebar.tsx` (Wave 4 — parallel)

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Update `components/layout/Sidebar.tsx`**

Tambahkan import di atas (setelah imports yang ada):
```typescript
import { TenantSelector } from '@/components/shared/TenantSelector'
```

Ubah fungsi `getNavItems` — hapus `SCAN_NAV` dari nav saas_admin:
```typescript
function getNavItems(role: UserRole): NavItem[] {
  if (role === 'viewer') return BASE_NAV
  if (role === 'admin_ojs') return [...BASE_NAV, SCAN_NAV, LOG_NAV]
  // saas_admin: tidak dapat memulai scan, hapus SCAN_NAV
  return [...BASE_NAV, LOG_NAV, USERS_NAV, AUDIT_NAV]
}
```

Di dalam blok `{/* User info + aksi akun */}` (baris 96-119), tambahkan `<TenantSelector />` setelah div nama/email dan sebelum link "Ganti Password":
```tsx
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="px-3 py-2">
          <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
          <p className="text-slate-500 text-xs truncate">{user.email}</p>
        </div>
        <TenantSelector />
        <Link
          href="/change-password"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
            pathname === '/change-password'
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <KeyRound className={`h-4 w-4 ${pathname === '/change-password' ? 'text-primary' : 'text-slate-500'}`} />
          Ganti Password
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          Keluar
        </button>
      </div>
```

- [ ] **Step 2: TypeScript check**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```
git -C OJSDEF-FrontEnd add components/layout/Sidebar.tsx
git -C OJSDEF-FrontEnd commit -m "feat(rbac): sidebar — TenantSelector untuk saas_admin, hapus Mulai Scan dari nav saas_admin"
```

---

## Task F6: Update Pages (Wave 4 — parallel)

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `app/(dashboard)/targets/page.tsx`
- Modify: `app/(dashboard)/scan-management/page.tsx`
- Modify: `app/(dashboard)/scanning/page.tsx`
- Modify: `app/(dashboard)/vulnerability-report/page.tsx`

### F6a: `dashboard/page.tsx`

- [ ] **Step 1: Ganti seluruh isi `app/(dashboard)/dashboard/page.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { useAdminStats } from '@/hooks/use-admin'
import { useScans } from '@/hooks/use-scans'
import { useAuth } from '@/hooks/use-auth'
import { SCAN_STATUS_LABELS, SCAN_STATUS_COLORS, SCAN_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from '@/lib/utils'
import { ShieldCheck, Target, ScanLine, AlertTriangle, Info, Building2, Wifi } from 'lucide-react'

function StatCard({ icon, iconBg, label, value, sub }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="glass-dark rounded-xl p-5 border border-white/5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function SaasAdminDashboard() {
  const router = useRouter()
  const { data: adminStats, isLoading: adminLoading } = useAdminStats()
  const { data: recentScans, isLoading: scansLoading } = useScans({ limit: 5 })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Beranda Platform</h1>
        <p className="text-slate-400 mt-1 text-sm">Ringkasan postur keamanan seluruh tenant OJSDef</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {adminLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <StatCard
              icon={<Building2 className="h-5 w-5 text-purple-400" />}
              iconBg="bg-purple-400/10"
              label="Total Tenant"
              value={adminStats?.total_tenants ?? 0}
            />
            <StatCard
              icon={<Target className="h-5 w-5 text-cyan-400" />}
              iconBg="bg-cyan-400/10"
              label="Total Target"
              value={adminStats?.total_targets ?? 0}
            />
            <StatCard
              icon={<Wifi className="h-5 w-5 text-green-400" />}
              iconBg="bg-green-400/10"
              label="Plugin Aktif"
              value={adminStats?.active_targets ?? 0}
              sub="Heartbeat dalam 15 menit terakhir"
            />
            <StatCard
              icon={<ScanLine className="h-5 w-5 text-blue-400" />}
              iconBg="bg-blue-400/10"
              label="Scan (30 Hari)"
              value={adminStats?.scans_last_30_days ?? 0}
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
              iconBg="bg-red-400/10"
              label="Scan dengan Kritis"
              value={adminStats?.scans_with_critical_findings ?? 0}
              sub="Memiliki temuan kritis"
            />
          </>
        )}
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Scan Terbaru (Semua Tenant)</h2>
        </div>
        <div className="overflow-x-auto">
          {scansLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !recentScans?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada scan di platform.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Skor</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/scan-management/${scan.id}`)}
                  >
                    <td className="px-6 py-4 text-slate-400">{SCAN_TYPE_LABELS[scan.scan_type]}</td>
                    <td className="px-6 py-4">
                      <span className={SCAN_STATUS_COLORS[scan.status]}>
                        {SCAN_STATUS_LABELS[scan.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {scan.overall_score != null ? (
                        <span className={scan.risk_level ? SEVERITY_COLORS[scan.risk_level] : 'text-slate-400'}>
                          {scan.overall_score.toFixed(1)}
                          {scan.risk_level && ` — ${SEVERITY_LABELS[scan.risk_level]}`}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(scan.created_at).toLocaleDateString('id-ID')}
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

function TenantDashboard() {
  const router = useRouter()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentScans, isLoading: scansLoading } = useScans({ limit: 5 })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Beranda</h1>
        <p className="text-slate-400 mt-1 text-sm">Ringkasan postur keamanan instalasi OJS Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="h-5 w-5 text-cyan-400" />}
          iconBg="bg-cyan-400/10"
          label="Total Target"
          value={statsLoading ? '—' : (stats?.targets.total ?? 0)}
        />
        <StatCard
          icon={<ScanLine className="h-5 w-5 text-green-400" />}
          iconBg="bg-green-400/10"
          label="Scan (30 Hari)"
          value={statsLoading ? '—' : (stats?.scans.last_30_days ?? 0)}
        />
        <div className="glass-dark rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-400/10">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-slate-400 text-sm">Skor Rata-rata</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-white">
                {stats?.security_posture.average_score != null
                  ? stats.security_posture.average_score.toFixed(1)
                  : '—'}
              </p>
              <div
                className="flex items-center gap-1 text-slate-600 text-xs mt-1"
                title="Rata-rata dari semua sesi scan yang selesai dalam 30 hari terakhir."
              >
                <Info className="h-3 w-3 shrink-0" />
                <span>Rata-rata semua sesi scan (30 hari)</span>
              </div>
            </>
          )}
        </div>
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
          iconBg="bg-red-400/10"
          label="Temuan Kritis"
          value={statsLoading ? '—' : (stats?.findings_summary.critical ?? 0)}
          sub="Akumulasi dari semua scan aktif"
        />
      </div>

      <div className="glass-dark rounded-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Scan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          {scansLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : !recentScans?.length ? (
            <div className="p-8 text-center text-slate-500">Belum ada scan. Mulai scan pertama Anda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Target</th>
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Skor</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/scan-management/${scan.id}`)}
                  >
                    <td className="px-6 py-4 text-slate-300">{scan.target_id}</td>
                    <td className="px-6 py-4 text-slate-400">{SCAN_TYPE_LABELS[scan.scan_type]}</td>
                    <td className="px-6 py-4">
                      <span className={SCAN_STATUS_COLORS[scan.status]}>
                        {SCAN_STATUS_LABELS[scan.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {scan.overall_score != null ? (
                        <span className={scan.risk_level ? SEVERITY_COLORS[scan.risk_level] : 'text-slate-400'}>
                          {scan.overall_score.toFixed(1)}
                          {scan.risk_level && ` — ${SEVERITY_LABELS[scan.risk_level]}`}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(scan.created_at).toLocaleDateString('id-ID')}
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

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'saas_admin') return <SaasAdminDashboard />
  return <TenantDashboard />
}
```

### F6b: `targets/page.tsx`

- [ ] **Step 2: Update `app/(dashboard)/targets/page.tsx`**

Tambahkan import:
```typescript
import { useAuth } from '@/hooks/use-auth'
```

Di dalam `TargetsPage()`, tambahkan setelah hook calls:
```typescript
const { user } = useAuth()
const isSaasAdmin = user?.role === 'saas_admin'
```

Bungkus tombol "Tambah Target" di header dengan kondisi:
```tsx
{!isSaasAdmin && (
  <Link href="/targets/new">
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="h-4 w-4 mr-2" />
      Tambah Target
    </Button>
  </Link>
)}
```

Bungkus tombol Trash2 (hapus) dengan kondisi:
```tsx
{!isSaasAdmin && (
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-slate-600 hover:text-red-400 flex-shrink-0"
    onClick={() => {
      if (confirm(`Hapus target "${target.name}"?`)) {
        deleteTarget.mutate(target.id)
      }
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
)}
```

Di empty state, bungkus tombol "Tambah Target Pertama":
```tsx
{!isSaasAdmin && (
  <Link href="/targets/new">
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="h-4 w-4 mr-2" />
      Tambah Target Pertama
    </Button>
  </Link>
)}
```

Di action buttons card, bungkus "Verifikasi" dan "Pasang Plugin":
```tsx
{!isSaasAdmin && !target.is_verified && (
  <Link href={`/targets/${target.id}/verify`} className="flex-1">
    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
      Verifikasi
    </Button>
  </Link>
)}
{!isSaasAdmin && target.is_verified && !target.plugin_connected && (
  <Link href={`/targets/${target.id}/plugin-guide`} className="flex-1">
    <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-xs">
      Pasang Plugin
    </Button>
  </Link>
)}
```

### F6c: `scan-management/page.tsx`

- [ ] **Step 3: Update `app/(dashboard)/scan-management/page.tsx`**

Tambahkan import:
```typescript
import { useAuth } from '@/hooks/use-auth'
```

Di dalam `ScanManagementContent()`, tambahkan:
```typescript
const { user } = useAuth()
const isSaasAdmin = user?.role === 'saas_admin'
```

Cari tombol/link "Mulai Scan Baru" di header halaman dan bungkus dengan kondisi:
```tsx
{!isSaasAdmin && (
  <Link href="/scanning">
    <Button className="bg-primary hover:bg-primary/90">
      <ScanLine className="h-4 w-4 mr-2" />
      Mulai Scan Baru
    </Button>
  </Link>
)}
```

### F6d: `scanning/page.tsx`

- [ ] **Step 4: Update `app/(dashboard)/scanning/page.tsx`**

Tambahkan import:
```typescript
import { useAuth } from '@/hooks/use-auth'
```

Di komponen utama halaman (export default), tambahkan check role di awal render:
```tsx
export default function ScanningPage() {
  const { user } = useAuth()

  if (user?.role === 'saas_admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mulai Scan</h1>
        </div>
        <div className="glass-dark rounded-xl border border-amber-400/20 p-8 text-center">
          <p className="text-amber-400 font-medium mb-2">Akses Terbatas</p>
          <p className="text-slate-400 text-sm">
            SaaS Administrator tidak dapat memulai scan. Hanya Admin OJS dari masing-masing tenant yang dapat melakukan scan.
          </p>
        </div>
      </div>
    )
  }

  return <StartScanForm />
}
```

Catatan: `StartScanForm` adalah nama komponen form yang sudah ada di file ini (baris 14). Jika nama berbeda, sesuaikan.

### F6e: `vulnerability-report/page.tsx`

- [ ] **Step 5: Update `app/(dashboard)/vulnerability-report/page.tsx`**

Tambahkan import:
```typescript
import { useAuth } from '@/hooks/use-auth'
```

Di komponen utama, tambahkan:
```typescript
const { user } = useAuth()
const isSaasAdmin = user?.role === 'saas_admin'
```

Cari setiap tombol/elemen "Tandai Positif Palsu" (useToggleFalsePositive) dan bungkus dengan kondisi:
```tsx
{!isSaasAdmin && (
  <button
    onClick={() => toggleFalsePositive.mutate(finding.id)}
    className="..."
  >
    Tandai Positif Palsu
  </button>
)}
```

### Verifikasi TypeScript semua pages

- [ ] **Step 6: TypeScript check**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7: Commit**

```
git -C OJSDEF-FrontEnd add "app/(dashboard)/dashboard/page.tsx" "app/(dashboard)/targets/page.tsx" "app/(dashboard)/scan-management/page.tsx" "app/(dashboard)/scanning/page.tsx" "app/(dashboard)/vulnerability-report/page.tsx"
git -C OJSDEF-FrontEnd commit -m "feat(rbac): saas_admin read-only ERP views — platform dashboard + hide mutating actions"
```

---

## Verifikasi Akhir

- [ ] **Backend: jalankan semua test**

```
cd OJSDEF-BackEnd && venv\Scripts\python -m pytest tests/ -v
```

Expected:
```
tests/test_tenant_helper.py ... 7 passed
tests/test_targets_rbac.py  ... 6 passed
tests/test_scans_rbac.py    ... 3 passed
16 passed
```

- [ ] **Backend: syntax check semua file yang diubah**

```
cd OJSDEF-BackEnd && venv\Scripts\python -c "
import ast
files = [
    'app/routers/_tenant_helper.py',
    'app/routers/targets.py',
    'app/routers/scans.py',
    'app/routers/reports.py',
    'app/routers/dashboard.py',
    'app/routers/admin.py',
]
for f in files:
    ast.parse(open(f).read())
    print(f'{f} OK')
"
```

Expected: setiap file mencetak `OK`

- [ ] **Frontend: TypeScript full check**

```
cd OJSDEF-FrontEnd && npx tsc --noEmit
```

Expected: no errors
