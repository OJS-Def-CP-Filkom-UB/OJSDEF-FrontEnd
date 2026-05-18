import type { OJSTarget, ScanFinding, ScanSession, RiskLevel, OJSScanType } from "@/types/ojsdef"

export type { RiskLevel, OJSScanType }

// ─── OJS Targets ────────────────────────────────────────────────────────────

export const MOCK_OJS_TARGETS: OJSTarget[] = [
  {
    id: "target_01",
    url: "journal.ub.ac.id",
    institutionName: "Universitas Brawijaya",
    ojsVersion: "3.3.0-16",
    pluginStatus: "connected",
    isVerified: true,
    lastScanAt: "2026-05-16 14:30",
    lastRiskScore: 72,
  },
  {
    id: "target_02",
    url: "ojs.fk.ui.ac.id",
    institutionName: "FKUI Jakarta",
    ojsVersion: "3.4.0-3",
    pluginStatus: "connected",
    isVerified: true,
    lastScanAt: "2026-05-17 09:15",
    lastRiskScore: 45,
  },
  {
    id: "target_03",
    url: "jurnal.its.ac.id",
    institutionName: "Institut Teknologi Sepuluh Nopember",
    ojsVersion: "3.3.0-15",
    pluginStatus: "disconnected",
    isVerified: true,
    lastScanAt: "2026-05-10 11:00",
    lastRiskScore: 88,
  },
]

// ─── Findings / Vulnerabilities ──────────────────────────────────────────────

export const MOCK_FINDINGS: ScanFinding[] = [
  {
    id: "vuln_01",
    targetId: "target_01",
    title: "Konten judi online terdeteksi di 2 artikel",
    description:
      "Dua artikel pada jurnal mengandung tautan dan konten yang mengarah ke situs perjudian online. Ini merupakan indikasi kuat adanya kompromi atau injeksi konten oleh pihak tidak bertanggung jawab.",
    cvssScore: 9.8,
    severity: "critical",
    sourceType: "internal",
    detectedAt: "2026-05-16 14:30",
    status: "open",
    actionPlan: [
      { step: 1, description: "Login ke panel admin OJS sebagai Administrator", estimatedTime: "2 menit", difficulty: "mudah" },
      { step: 2, description: "Buka Submissions → All Submissions, cari artikel ID yang dicurigai", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 3, description: "Hapus atau unpublish artikel yang terkontaminasi", estimatedTime: "10 menit", difficulty: "mudah" },
      { step: 4, description: "Ubah password semua akun admin dan author terkait", estimatedTime: "15 menit", difficulty: "mudah" },
      { step: 5, description: "Aktifkan Two-Factor Authentication di pengaturan OJS", estimatedTime: "10 menit", difficulty: "menengah" },
    ],
  },
  {
    id: "vuln_02",
    targetId: "target_01",
    title: "Sertifikat SSL kedaluwarsa dalam 3 hari",
    description:
      "Sertifikat SSL/TLS untuk domain journal.ub.ac.id akan kedaluwarsa dalam 3 hari. Pengunjung akan mendapat peringatan keamanan dari browser setelah tanggal kedaluwarsa.",
    cvssScore: 8.6,
    severity: "high",
    sourceType: "external",
    detectedAt: "2026-05-16 14:31",
    status: "open",
    actionPlan: [
      { step: 1, description: "Hubungi tim IT/hosting untuk perpanjangan sertifikat SSL segera", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 2, description: "Jika menggunakan Let's Encrypt, jalankan: sudo certbot renew di server", estimatedTime: "10 menit", difficulty: "menengah" },
      { step: 3, description: "Verifikasi pembaruan dengan membuka URL di browser", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 4, description: "Atur notifikasi otomatis pembaruan sertifikat 30 hari sebelum kedaluwarsa", estimatedTime: "15 menit", difficulty: "menengah" },
    ],
  },
  {
    id: "vuln_03",
    targetId: "target_03",
    title: "Plugin Antivirus OJS versi lama (CVE-2023-4891)",
    description:
      "Plugin Antivirus OJS yang terpasang adalah versi 1.0.1, rentan terhadap CVE-2023-4891 yang memungkinkan bypass pemindaian file berbahaya saat upload submission.",
    cvssScore: 8.1,
    severity: "high",
    sourceType: "internal",
    detectedAt: "2026-05-10 11:02",
    status: "open",
    cveId: "CVE-2023-4891",
    actionPlan: [
      { step: 1, description: "Login ke panel admin OJS → Settings → Plugins → Plugin Gallery", estimatedTime: "2 menit", difficulty: "mudah" },
      { step: 2, description: "Cari plugin 'Anti-Virus Plugin' dan klik Update ke versi terbaru", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 3, description: "Verifikasi versi plugin sudah ≥ 1.0.2 setelah pembaruan", estimatedTime: "3 menit", difficulty: "mudah" },
      { step: 4, description: "Uji fungsionalitas upload submission setelah pembaruan", estimatedTime: "10 menit", difficulty: "mudah" },
    ],
  },
  {
    id: "vuln_04",
    targetId: "target_01",
    title: "3 akun admin menggunakan password default",
    description:
      "Pemindaian internal menemukan 3 akun administrator masih menggunakan password default. Password default sangat mudah ditebak oleh penyerang.",
    cvssScore: 7.2,
    severity: "high",
    sourceType: "internal",
    detectedAt: "2026-05-16 14:32",
    status: "open",
    actionPlan: [
      { step: 1, description: "Login sebagai super-admin OJS, buka Users → All Users", estimatedTime: "2 menit", difficulty: "mudah" },
      { step: 2, description: "Filter pengguna berperan 'Journal Manager' dan 'Administrator'", estimatedTime: "3 menit", difficulty: "mudah" },
      { step: 3, description: "Kirim email reset password ke semua akun admin yang teridentifikasi", estimatedTime: "10 menit", difficulty: "mudah" },
      { step: 4, description: "Aktifkan kebijakan password minimum 12 karakter di pengaturan OJS", estimatedTime: "5 menit", difficulty: "mudah" },
    ],
  },
  {
    id: "vuln_05",
    targetId: "target_03",
    title: "Direktori /backup/ dapat diakses publik",
    description:
      "URL https://jurnal.its.ac.id/backup/ dapat diakses tanpa autentikasi, menampilkan file backup yang berisi konfigurasi database dan data sensitif.",
    cvssScore: 7.5,
    severity: "high",
    sourceType: "external",
    detectedAt: "2026-05-10 11:05",
    status: "open",
    actionPlan: [
      { step: 1, description: "Hubungi admin server untuk menutup akses direktori /backup/ via konfigurasi web server", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 2, description: "Tambahkan rule di .htaccess: 'Deny from all' di dalam folder /backup/", estimatedTime: "10 menit", difficulty: "menengah" },
      { step: 3, description: "Pindahkan file backup ke direktori di luar document root server", estimatedTime: "20 menit", difficulty: "sulit" },
      { step: 4, description: "Verifikasi dengan membuka URL di browser — harus mendapat 403 Forbidden", estimatedTime: "5 menit", difficulty: "mudah" },
    ],
  },
  {
    id: "vuln_06",
    targetId: "target_02",
    title: "Debug mode aktif di config.inc.php",
    description:
      "File konfigurasi OJS menunjukkan debug mode masih aktif (show_stacktrace = On). Ini dapat mengekspos informasi teknis sensitif kepada pengguna tidak sah.",
    cvssScore: 5.3,
    severity: "medium",
    sourceType: "internal",
    detectedAt: "2026-05-17 09:17",
    status: "open",
    actionPlan: [
      { step: 1, description: "Akses file config.inc.php di server melalui SSH atau panel hosting", estimatedTime: "5 menit", difficulty: "menengah" },
      { step: 2, description: "Ubah baris 'show_stacktrace = On' menjadi 'show_stacktrace = Off'", estimatedTime: "5 menit", difficulty: "mudah" },
      { step: 3, description: "Ubah 'display_errors_on = On' menjadi 'display_errors_on = Off' jika ada", estimatedTime: "3 menit", difficulty: "mudah" },
      { step: 4, description: "Restart web server untuk menerapkan perubahan", estimatedTime: "5 menit", difficulty: "menengah" },
    ],
  },
  {
    id: "vuln_07",
    targetId: "target_03",
    title: "OJS versi 3.3.0-15 (tersedia pembaruan 3.4.0-7)",
    description:
      "Instalasi OJS menggunakan versi 3.3.0-15 yang sudah tertinggal. Versi terbaru 3.4.0-7 mencakup perbaikan keamanan kritis.",
    cvssScore: 4.2,
    severity: "medium",
    sourceType: "internal",
    detectedAt: "2026-05-10 11:10",
    status: "open",
    actionPlan: [
      { step: 1, description: "Buat backup lengkap database dan file OJS sebelum melakukan pembaruan", estimatedTime: "30 menit", difficulty: "menengah" },
      { step: 2, description: "Unduh paket pembaruan OJS 3.4.0-7 dari situs resmi PKP", estimatedTime: "10 menit", difficulty: "mudah" },
      { step: 3, description: "Ikuti panduan upgrade resmi OJS di docs.pkp.sfu.ca/admin-guide/en/upgrading-ojs", estimatedTime: "60 menit", difficulty: "sulit" },
      { step: 4, description: "Verifikasi semua plugin masih berfungsi setelah upgrade", estimatedTime: "30 menit", difficulty: "menengah" },
    ],
  },
]

// ─── Legacy-compatible types for existing pages ──────────────────────────────

export type ScanStatus = "Completed" | "In Progress" | "Failed"

export interface ScanRow {
  id: string
  url: string
  institutionName: string
  scanType: string
  risk: RiskLevel
  date: string
  status: ScanStatus
  vulnerabilities: number
}

export const MOCK_SCANS: ScanRow[] = [
  { id: "sc_01", url: "journal.ub.ac.id", institutionName: "Universitas Brawijaya", scanType: "Audit Lengkap", risk: "critical", date: "2026-05-16 14:22", status: "Completed", vulnerabilities: 4 },
  { id: "sc_02", url: "ojs.fk.ui.ac.id", institutionName: "FKUI Jakarta", scanType: "Audit Eksternal", risk: "medium", date: "2026-05-17 09:15", status: "Completed", vulnerabilities: 1 },
  { id: "sc_03", url: "jurnal.its.ac.id", institutionName: "ITS Surabaya", scanType: "Audit Internal", risk: "high", date: "2026-05-10 11:00", status: "Completed", vulnerabilities: 3 },
  { id: "sc_04", url: "journal.ub.ac.id", institutionName: "Universitas Brawijaya", scanType: "Audit Eksternal", risk: "high", date: "2026-05-14 08:30", status: "In Progress", vulnerabilities: 2 },
]

export const VULN_STATS = [
  { label: "Kritis", value: 1, color: "var(--critical)", percentage: 14 },
  { label: "Berbahaya", value: 4, color: "var(--high)", percentage: 57 },
  { label: "Perhatian", value: 2, color: "var(--medium)", percentage: 29 },
  { label: "Aman", value: 0, color: "var(--low)", percentage: 0 },
]

export const SYSTEM_HEALTH = {
  score: 68,
  status: "Perlu Perhatian",
  lastUpdate: "2 jam lalu",
  vulnerabilitiesTotal: 7,
}

// Flattened view used by vulnerability-report page
export const MOCK_VULNERABILITIES = MOCK_FINDINGS.map((f) => ({
  id: f.id,
  name: f.title,
  severity: f.severity,
  score: f.cvssScore,
  component: f.targetId,
  status: f.status === "open" ? ("Open" as const) : ("Resolved" as const),
  recommendation: f.actionPlan[0]?.description ?? "",
  detectedAt: f.detectedAt,
  cveId: f.cveId,
  actionPlan: f.actionPlan,
  description: f.description,
  sourceType: f.sourceType,
  targetId: f.targetId,
}))

export interface RiskPriorityItem {
  id: string
  name: string
  asset: string
  risk: RiskLevel
  impact: string
  impactDots: number
  likelihood: string
  priority: "P1" | "P2" | "P3"
}

export const MOCK_RISK_ITEMS: RiskPriorityItem[] = [
  { id: "risk_01", name: "Konten judi online di artikel", asset: "JOURNAL.UB.AC.ID", risk: "critical", impact: "Ekstrem", impactDots: 3, likelihood: "Terkonfirmasi", priority: "P1" },
  { id: "risk_02", name: "SSL kedaluwarsa 3 hari lagi", asset: "JOURNAL.UB.AC.ID", risk: "high", impact: "Tinggi", impactDots: 2, likelihood: "Pasti Terjadi", priority: "P1" },
  { id: "risk_03", name: "Plugin Antivirus versi lama (CVE-2023-4891)", asset: "JURNAL.ITS.AC.ID", risk: "high", impact: "Tinggi", impactDots: 2, likelihood: "Kemungkinan Besar", priority: "P1" },
  { id: "risk_04", name: "Direktori /backup/ terbuka publik", asset: "JURNAL.ITS.AC.ID", risk: "high", impact: "Tinggi", impactDots: 2, likelihood: "Kemungkinan Besar", priority: "P1" },
  { id: "risk_05", name: "Debug mode aktif di config.inc.php", asset: "OJS.FK.UI.AC.ID", risk: "medium", impact: "Menengah", impactDots: 2, likelihood: "Mungkin", priority: "P2" },
  { id: "risk_06", name: "OJS versi 3.3.0-15 — perlu update", asset: "JURNAL.ITS.AC.ID", risk: "medium", impact: "Menengah", impactDots: 2, likelihood: "Mungkin", priority: "P2" },
]

export const MOCK_SCAN_LOGS = [
  { type: "INFO", msg: "Menginisialisasi lingkungan pemindai OJSDef..." },
  { type: "INFO", msg: "Menghubungkan ke target: journal.ub.ac.id" },
  { type: "DONE", msg: "Koneksi berhasil. Target dapat dijangkau." },
  { type: "TASK", msg: "Menjalankan pemindaian internal via Plugin OJSDef..." },
  { type: "DONE", msg: "Koneksi plugin berhasil. Menginisialisasi audit internal." },
  { type: "TASK", msg: "Memindai konten artikel dari injeksi konten ilegal..." },
  { type: "EXEC", msg: "Menganalisis 148 artikel yang dipublikasikan..." },
  { type: "WARN", msg: "Konten mencurigakan terdeteksi di artikel ID 0142 dan ID 0276" },
  { type: "EXEC", msg: "Memeriksa versi OJS dan plugin yang terinstal..." },
  { type: "EXEC", msg: "Memverifikasi konfigurasi keamanan di config.inc.php..." },
  { type: "INFO", msg: "Menjalankan pemindaian eksternal via OJSDef Bot..." },
  { type: "EXEC", msg: "Memeriksa sertifikat SSL/TLS..." },
  { type: "WARN", msg: "Sertifikat SSL kedaluwarsa dalam 3 hari!" },
  { type: "EXEC", msg: "Memindai direktori publik yang tidak seharusnya terbuka..." },
  { type: "INFO", msg: "Pemindaian selesai. Membuat laporan keamanan..." },
]

export const MOCK_ACTIVE_SCANS: ScanSession[] = [
  {
    id: "SCAN-77291-B",
    targetId: "target_01",
    targetUrl: "journal.ub.ac.id",
    institutionName: "Universitas Brawijaya",
    scanType: "full_audit",
    riskLevel: null,
    findingsCount: 0,
    progress: 65,
    status: "in-progress",
    startTime: "2026-05-18 14:20",
  },
]

export const MOCK_SCAN_HISTORY: ScanSession[] = [
  {
    id: "SCAN-66120-P",
    targetId: "target_01",
    targetUrl: "journal.ub.ac.id",
    institutionName: "Universitas Brawijaya",
    scanType: "full_audit",
    riskLevel: "critical",
    findingsCount: 4,
    progress: 100,
    status: "completed",
    startTime: "2026-05-16 14:00",
    duration: "32m 18s",
  },
  {
    id: "SCAN-55902-L",
    targetId: "target_02",
    targetUrl: "ojs.fk.ui.ac.id",
    institutionName: "FKUI Jakarta",
    scanType: "external",
    riskLevel: "medium",
    findingsCount: 1,
    progress: 100,
    status: "completed",
    startTime: "2026-05-17 09:00",
    duration: "12m 45s",
  },
  {
    id: "SCAN-44321-F",
    targetId: "target_03",
    targetUrl: "jurnal.its.ac.id",
    institutionName: "ITS Surabaya",
    scanType: "internal",
    riskLevel: "high",
    findingsCount: 3,
    progress: 100,
    status: "completed",
    startTime: "2026-05-10 10:45",
    duration: "18m 10s",
  },
]
