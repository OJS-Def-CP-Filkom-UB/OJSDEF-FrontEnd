# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## OJSDef — OJS Integrated Security Scanner (SaaS)

---

| Atribut | Nilai |
|---|---|
| Versi Dokumen | 1.0 |
| Status | Draft for Review |
| Tanggal | April 2026 |
| Topik | G2 — OJS Integrated Security Scanner |
| Mitra | Seclab Indonesia |
| Institusi | Universitas Brawijaya — Fakultas Ilmu Komputer |
| Tim | Kelompok 3 |
| Klasifikasi | CONFIDENTIAL |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Permasalahan](#2-latar-belakang--permasalahan)
3. [Visi & Tujuan Produk](#3-visi--tujuan-produk)
4. [Stakeholder & Pengguna](#4-stakeholder--pengguna)
5. [Arsitektur Produk](#5-arsitektur-produk)
6. [Fitur Produk](#6-fitur-produk)
7. [Kebutuhan Non-Fungsional](#7-kebutuhan-non-fungsional)
8. [User Stories](#8-user-stories)
9. [Rekomendasi Technology Stack](#9-rekomendasi-technology-stack)
10. [Analisis Risiko & Mitigasi](#10-analisis-risiko--mitigasi)
11. [Roadmap Pengembangan](#11-roadmap-pengembangan)
12. [Batasan & Di Luar Scope](#12-batasan--di-luar-scope)
13. [Glosarium](#13-glosarium)
14. [Riwayat Revisi Dokumen](#14-riwayat-revisi-dokumen)

---

## 1. Ringkasan Eksekutif

**OJSDef** adalah platform keamanan berbasis SaaS (Software as a Service) yang dirancang khusus untuk melindungi instalasi Open Journal Systems (OJS) dari ancaman siber, termasuk penyusupan konten ilegal, defacement, eksploitasi kerentanan, dan pencurian data.

Platform ini bekerja dari **dua arah secara simultan**:

| Pendekatan Internal | Pendekatan Eksternal | Output Terpusat |
|---|---|---|
| Plugin OJS yang di-install di server target. Membaca konfigurasi, plugin aktif, user role, dan file integrity dari dalam sistem. | Bot Ofensif eksternal yang mensimulasikan serangan dari luar. Melakukan crawling, fingerprinting, SSL/TLS check, dan uji kerentanan. | Dashboard terpusat: risk scoring, laporan PDF, rekomendasi mitigasi, dan notifikasi real-time untuk ancaman kritis. |

Latar belakang pengembangan berasal dari temuan lapangan bahwa banyak pengelola jurnal berbasis OJS tidak memiliki mekanisme keamanan yang terstruktur. Akibatnya, platform jurnal ilmiah rentan disisipi konten ilegal seperti judi online, atau mengalami defacement yang merusak reputasi institusi.

OJSDef hadir sebagai solusi end-to-end yang menggabungkan deteksi, penilaian risiko, pelaporan, dan panduan mitigasi dalam satu dashboard terpusat yang mudah digunakan, bahkan oleh pengguna tanpa latar belakang keamanan siber.

---

## 2. Latar Belakang & Permasalahan

### 2.1 Konteks Masalah

Open Journal Systems (OJS) adalah platform manajemen jurnal ilmiah open-source yang digunakan secara luas oleh perguruan tinggi dan lembaga penelitian. Namun, tingkat keamanan OJS di berbagai institusi masih sangat rendah.

Berdasarkan hasil **Focus Group Discussion (FGD)** dengan mitra Seclab Indonesia, ditemukan bahwa:

- Tidak ada mekanisme pengecekan keamanan yang terstruktur pada sebagian besar instansi pengelola OJS.
- Telah terjadi insiden penyusupan berupa perubahan konten tanpa izin (sisipan konten judi online), kemunculan akun tidak dikenal, dan ditemukannya file asing di direktori server.
- Audit keamanan dilakukan secara manual, tidak terjadwal, dan tidak terintegrasi.
- Pengelola jurnal tidak memiliki visibilitas terhadap postur keamanan sistem yang mereka kelola.
- Tidak ada tools yang mudah digunakan untuk audit keamanan OJS secara menyeluruh dari perspektif internal maupun eksternal.

### 2.2 Akar Masalah (Root Cause Analysis)

| Akar Masalah | Dampak | Solusi OJSDef |
|---|---|---|
| Tidak ada audit keamanan internal | Celah konfigurasi tidak terdeteksi; plugin usang dieksploitasi | Internal Plugin Scanner |
| Tidak ada pemindaian dari perspektif penyerang | Celah yang terlihat dari luar tidak diketahui pengelola | External Offensive Bot |
| Tidak ada risk scoring yang terukur | Pengelola tidak tahu mana kerentanan yang harus diprioritaskan | Risk Scoring Engine |
| Tidak ada dashboard monitoring terpusat | Pengelola tidak mendapat gambaran kondisi keamanan secara holistik | Unified Dashboard |

### 2.3 Temuan Focus Group Discussion (FGD)

| No | Pertanyaan | Jawaban / Temuan |
|---|---|---|
| 1 | Tantangan terbesar menjaga keamanan OJS? | Tidak ada mekanisme pengecekan yang terstruktur |
| 2 | Pernah terjadi indikasi penyusupan? | Ya — perubahan konten, akun tidak dikenal, file asing di direktori |
| 3 | Alat bantu audit keamanan yang tersedia? | Hanya plugin komunitas terbatas, tidak terintegrasi |
| 4 | Informasi keamanan paling dibutuhkan? | Status versi/plugin OJS, notifikasi aktivitas mencurigakan, ringkasan kondisi |
| 5 | Fitur yang paling diprioritaskan? | Dashboard + Internal Audit |
| 6 | Mode scan yang diinginkan? | On-demand sudah cukup (tidak harus otomatis) |
| 7 | Format laporan yang diharapkan? | Dashboard visual + export laporan |
| 8 | Kemampuan pengguna membaca hasil? | Dashboard yang bisa dipahami tanpa latar belakang SecOps |

---

## 3. Visi & Tujuan Produk

### 3.1 Visi Produk

> *"Menjadi platform keamanan OJS paling komprehensif di Indonesia yang memungkinkan setiap pengelola jurnal — tanpa latar belakang keamanan siber sekalipun — dapat memantau, mengaudit, dan merespons ancaman keamanan secara proaktif."*

### 3.2 Tujuan Produk

1. Menyediakan audit keamanan dua arah: internal (plugin) dan eksternal (bot ofensif) dalam satu platform terintegrasi.
2. Mengotomatiskan proses deteksi kerentanan yang sebelumnya dilakukan secara manual dan tidak terstruktur.
3. Menghasilkan risk scoring berbasis CVSS/OWASP yang dapat dipahami oleh pengelola non-teknis.
4. Menyajikan laporan keamanan yang dapat diekspor dan digunakan sebagai bahan audit institusional.
5. Membangun ekosistem SaaS yang scalable untuk mendukung banyak institusi secara bersamaan.

### 3.3 Metrik Keberhasilan (Success Metrics)

| Metrik | Target | Cara Pengukuran |
|---|---|---|
| Akurasi deteksi kerentanan Internal | >= 90% | Bandingkan temuan vs manual audit |
| False positive rate External Scanner | <= 10% | Validasi manual sampling hasil scan |
| Waktu respons dashboard | < 3 detik | Load test dengan Lighthouse / k6 |
| User comprehension skor risiko | >= 80% paham | User testing dengan pengguna non-teknis |
| Uptime platform SaaS | >= 99.5% | Monitoring uptime (UptimeRobot) |
| Waktu onboarding institusi baru | < 30 menit | Observasi langsung proses setup |

---

## 4. Stakeholder & Pengguna

OJSDef memiliki beberapa segmen pengguna dengan kebutuhan dan tingkat akses yang berbeda.

| Stakeholder | Peran | Kebutuhan Utama | Hak Akses |
|---|---|---|---|
| **Admin OJS** | Primary User | Dashboard risiko, action plan perbaikan, notifikasi ancaman | Full — Scan, laporan, konfigurasi target |
| **Tim IT / DevOps** | Primary User | Log teknis detail, jadwal scan off-peak, patch guidance level server | Full — Termasuk jadwal scan & log sistem |
| **SaaS Provider Admin** | Platform Admin | Update CVE database, manajemen tenant, enkripsi data klien | Super Admin — Kelola semua tenant |
| **Editor & Reviewer** | End User OJS | Keamanan akun (weak password, role misconfiguration) | Baca saja — Notifikasi terkait akun |
| **Author (Penulis)** | End User OJS | Integritas naskah, bebas dari malware pada file yang diunduh | Tidak langsung — Dilindungi sistem |
| **Pembaca (Publik)** | End User OJS | Aman dari defacement dan malware pada PDF unduhan | Tidak langsung — Dilindungi sistem |
| **Pimpinan Institusi** | Regulator | Executive summary, kepatuhan keamanan siber, laporan manajerial | **MVP:** Tidak memiliki akses login langsung ke sistem. Laporan executive summary (PDF) disiapkan oleh Admin OJS dan diserahkan secara manual. **Post-MVP (Fase 2):** Dipertimbangkan role `read_only` dengan akses terbatas ke executive report & summary tanpa bisa trigger scan. |

---

## 5. Arsitektur Produk

### 5.1 Konsep Dua Arah (Dual-Direction Security)

Pendekatan utama OJSDef adalah **dual-direction scanning**: sistem melakukan inspeksi keamanan secara bersamaan dari dalam (internal) dan dari luar (eksternal) instalasi OJS target.

| | Arah 1: Internal (Plugin-Based) | Arah 2: Eksternal (Bot Ofensif) |
|---|---|---|
| **Mekanisme** | Plugin PHP ter-install di dalam OJS target | Bot Python berjalan di server OJSDef |
| **Akses** | Langsung ke config, database, file system | Hanya melalui HTTP/HTTPS public |
| **Temuan** | Konfigurasi lemah, file termodifikasi, konten ilegal, credential lemah | Kerentanan publik (SQLi/XSS), SSL, headers, open directories |
| **Keunggulan** | Akses langsung ke data internal tanpa limitasi network | Mensimulasikan perspektif penyerang nyata |

### 5.2 Layer Arsitektur Sistem

#### Layer 1 — Client Layer
Admin OJS dan Tim IT mengakses sistem melalui **Web UI Dashboard** berbasis browser (Next.js). Dashboard adalah single entry point untuk semua interaksi pengguna.

#### Layer 2 — Application Layer

| Komponen | Fungsi |
|---|---|
| **API Gateway** (FastAPI) | Menerima request dari Web UI, autentikasi JWT, rate limiting, routing |
| **Task Queue** (Redis + Celery) | Antrian proses scanning agar sistem stabil saat banyak request bersamaan |
| **Internal Bot Worker** | Menerima data audit dari plugin OJS via API callback, memproses temuan internal |
| **External Bot Worker** | Menjalankan scanning ofensif eksternal dari server OJSDef ke URL target |
| **Scoring Engine** | Kalkulasi CVSS v3, menentukan overall risk score dan action plan |
| **Report Generator** | Menyusun laporan PDF, JSON, HTML dari data scoring |
| **Notification Service** | Mengirimkan alert real-time via Email/Telegram untuk ancaman Critical |

#### Layer 3 — Database Layer
- **Main Database** (PostgreSQL): Data pengguna, hasil scan, skor risiko, riwayat scan
- **Cache/Log Storage** (Redis): Session login, message broker Celery, caching dashboard, audit trail

#### Layer 4 — Infrastructure & Security Layer
- **Docker/VM**: Lingkungan server terisolasi per container
- **Authentication & RBAC**: JWT-based authentication dengan role-based access control

#### Layer 5 — Integrasi Pihak Ketiga
- **OJS Plugin**: Jembatan antara Internal Bot Worker dengan instalasi OJS target
- **CVE Feed (NVD/MITRE)**: Referensi kerentanan terkini untuk External Scanner
- **Notification Services**: Email (SMTP) + Telegram Bot API

### 5.3 Keterkaitan Solusi dengan Akar Masalah

| Akar Masalah | Komponen Solusi |
|---|---|
| Tidak ada dashboard monitoring postur keamanan | Dashboard monitoring terpusat dengan visualisasi hasil scanning |
| Tidak ada sistem risk scoring yang terukur | Risk Scoring Engine dengan klasifikasi Low/Medium/High/Critical |
| Tidak ada pemetaan attack surface | Attack Surface Mapping Engine yang mengkompilasi temuan internal dan eksternal |
| Minimnya visibilitas postur keamanan | Dashboard dengan indikator visual berbasis warna (merah/kuning/hijau) real-time |
| Kebutuhan fleksibilitas pemindaian | Mode on-demand (MVP). Scan terjadwal otomatis pada jam off-peak diimplementasikan pada **Fase 2** (deferred dari MVP). |

---

## 6. Fitur Produk

### 6.1 Modul Manajemen Pengguna

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-01 | Login | User dapat masuk ke sistem dengan email dan password | P1 |
| F-02 | Pembuatan Akun oleh SaaS Admin | Akun user dibuat oleh SaaS Admin (tidak ada self-register pada MVP). SaaS Admin mengisi email, password sementara, nama, dan role saat membuat akun baru. | P1 |
| F-03 | JWT Authentication | Autentikasi stateless dengan token yang dapat di-refresh | P1 |
| F-04 | Role-Based Access Control | Tiga role: Admin OJS, Tim IT, SaaS Admin dengan hak akses berbeda | P1 |
| F-05 | Multi-User Support | Mendukung banyak user dengan role berbeda dalam satu sistem | P1 |
| F-06 | Manajemen Profil | User kelola profil, ganti password, atur preferensi notifikasi. Reset password dilakukan oleh SaaS Admin pada MVP (fitur "forgot password" mandiri diimplementasikan post-MVP). | P2 |

### 6.2 Modul Manajemen Target OJS

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-07 | Add Target OJS | User menambahkan URL OJS yang ingin dianalisis | P1 |
| F-08 | Verifikasi Kepemilikan | Wajib verifikasi domain sebelum scan (file upload / DNS TXT) | P1 |
| F-09 | Plugin Installation Guide | Panduan interaktif instalasi plugin OJSDef di OJS target | P1 |
| F-10 | Status Koneksi Plugin | Indikator real-time Connected/Disconnected/Error | P1 |
| F-11 | Multi-Target Management | Satu akun kelola lebih dari satu instalasi OJS. Batasan kuota per subscription plan (Free/Pro/Enterprise) diimplementasikan saat komersialisasi pada **Fase 3**. **[DEFERRED dari MVP — tidak ada batasan kuota hard pada MVP.]** | P2 |

### 6.3 Modul Internal Security Scan (Plugin-Based)

Plugin PHP yang ter-install di OJS target berkomunikasi dengan API Gateway OJSDef via HTTPS.

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-12 | OJS Fingerprinting (Internal) | Deteksi versi OJS, tema aktif, semua plugin terinstall vs latest release | P1 |
| F-13 | Configuration Scanner | Audit config.inc.php: debug mode, error reporting, secret key strength | P1 |
| F-14 | Plugin Audit | Deteksi plugin outdated, plugin dengan CVE aktif, plugin disabled-but-installed | P1 |
| F-15 | RBAC Auditor | Audit user roles: privilege berlebih, akun tidak aktif dengan role tinggi | P1 |
| F-16 | File Integrity Checker | Bandingkan SHA-256 hash file OJS vs checksums resmi dari OJS GitHub release | P1 |
| F-17 | Content Injection Detector | Deteksi konten ilegal di DB OJS: URL judi, iframe tersembunyi, script redirect | P1 |
| F-18 | Database Security Check | Cek credential lemah, backup .sql exposed, konfigurasi DB tidak aman | P2 |
| F-19 | Weak Credentials Detector | Deteksi password lemah pada akun admin OJS | P2 |

### 6.4 Modul External Security Scan (Bot Ofensif)

Bot berjalan sepenuhnya dari server OJSDef, passive/read-only, rate limit 10 req/detik.

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-20 | OJS Fingerprinting (Eksternal) | Deteksi versi OJS dari HTTP headers, meta tags, URL patterns | P1 |
| F-21 | Attack Surface Mapping | Crawling endpoint publik OJS: login, API, upload forms, admin paths | P1 |
| F-22 | SSL/TLS Analysis | Validity, expiry, cipher suites, TLS version, HSTS configuration | P1 |
| F-23 | HTTP Security Headers | Audit CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy | P1 |
| F-24 | Vulnerability Scanner (Passive) | Passive OWASP Top 10: reflected XSS, SQL injection, path traversal, CSRF | P1 |
| F-25 | Open Directory Detection | Deteksi direktori/file sensitif public tanpa autentikasi | P1 |
| F-26 | CVE Matching | Match versi OJS + plugin vs NVD CVE database | P1 |
| F-27 | API Security Testing | Audit endpoint API publik OJS: unauthenticated access, data leakage | P2 |

### 6.5 Modul Risk Scoring Engine

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-28 | Risk Scoring Engine | Kalkulasi CVSS v3 base score per temuan | P1 |
| F-29 | Risk Classification | Klasifikasi Low/Medium/High/Critical per temuan | P1 |
| F-30 | Overall Security Score | Skor keseluruhan 0–100 dengan pembobotan per severity | P1 |
| F-31 | Prioritized Action Plan | Daftar perbaikan terurut berdasarkan severity + ease of remediation | P1 |

**Tabel Klasifikasi Risiko:**

| Level | CVSS Score | Kriteria Contoh | SLA Perbaikan |
|---|---|---|---|
| 🔴 Critical | 9.0 – 10.0 | File core termodifikasi, konten judi terdeteksi, RCE, RBAC bypass | Notifikasi langsung + patching 24 jam |
| 🟠 High | 7.0 – 8.9 | SQL injection, CVE aktif, SSL expired, default admin password | Patching 7 hari kerja |
| 🟡 Medium | 4.0 – 6.9 | Plugin outdated tanpa CVE, header CSP hilang, debug mode aktif | Action plan, patching 30 hari |
| 🟢 Low | 0.1 – 3.9 | Versi OJS terekspos di headers, minor config best practice | Perbaiki saat maintenance rutin |

### 6.6 Modul Dashboard Monitoring

| # | Widget/Komponen | Deskripsi | Prioritas |
|---|---|---|---|
| F-32 | Security Score Card | Skor 0–100 + indikator warna + label (Kritis/Berbahaya/Perhatian/Aman) — urutan dari tinggi ke rendah agar pengguna segera mengetahui masalah paling berbahaya | P1 |
| F-33 | Vulnerability Summary | Chart jumlah temuan per severity, clickable untuk drill-down | P1 |
| F-34 | Attack Surface Map | Visualisasi endpoint teridentifikasi, plugin aktif, area berisiko | P1 |
| F-35 | Scan History Timeline | Timeline hasil scan terbaru: timestamp, type, status, skor | P1 |
| F-36 | Action Plan List | Prioritas perbaikan step-by-step per temuan dalam Bahasa Indonesia | P1 |
| F-37 | Plugin Connection Status | Real-time status koneksi plugin + waktu terakhir terhubung | P1 |
| F-38 | Compliance Checklist | Visual kepatuhan terhadap OWASP Top 10 dan security baseline | P2 |
| F-39 | Scan Progress Indicator | Progress bar real-time saat scan berjalan | P2 |

### 6.7 Modul Report & Notifikasi

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-40 | Report Generator PDF | Laporan scan lengkap PDF via WeasyPrint: executive summary, tabel findings, action plan | P1 |
| F-41 | Executive Summary | Laporan 1–2 halaman manajerial tanpa istilah teknis untuk Pimpinan Institusi | P2 |
| F-42 | Technical Report JSON | Export data scan dalam format JSON untuk integrasi SIEM atau dokumentasi teknis. Format HTML tidak termasuk dalam scope MVP. | P2 |
| F-43 | Critical Alert Notification | Email + Telegram dalam < 5 menit setelah kerentanan Critical terdeteksi | P1 |
| F-44 | Scan Completion Notification | Email ringkasan hasil scan setelah selesai | P2 |
| F-45 | Scan Scheduling | Jadwal scan otomatis (cron) pada jam off-peak. **[DEFERRED — Tidak termasuk MVP. Dijadwalkan untuk Fase 2.]** | P2 |

### 6.8 Modul Sistem (Support Features)

| # | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F-46 | Log & Monitoring System | Simpan dan tampilkan log aktivitas scanning | P1 |
| F-47 | OJS Plugin Integration | Integrasi langsung dengan OJS via plugin untuk akses data internal | P1 |
| F-48 | CVE Feed Auto-Update | Perbarui database kerentanan otomatis dari NVD harian | P1 |
| F-49 | Scan Mode Selection | Pilih jenis scan: Internal, External, atau Full Audit | P1 |

---

## 7. Kebutuhan Non-Fungsional

### 7.1 Keamanan

| No | Aspek | Kebutuhan | Kriteria Penerimaan |
|---|---|---|---|
| NFR-01 | Autentikasi | JWT dengan TTL 1 jam; refresh token 30 hari | Semua endpoint terproteksi middleware auth |
| NFR-02 | Enkripsi data | Data scan terenkripsi at-rest dan in-transit | AES-256 at-rest; HTTPS/TLS 1.3 in-transit |
| NFR-03 | RBAC | Role-based access control untuk semua fitur | Akses tidak sah → 403 Forbidden |
| NFR-04 | Plugin security | HMAC-SHA256 signing untuk komunikasi plugin | Signature tidak valid → request ditolak |
| NFR-05 | Domain verification | Scan hanya dilakukan pada domain yang terverifikasi | is_verified flag wajib sebelum scan |
| NFR-06 | Rate limiting | Batasi request API per tenant dan per IP | 100 req/menit per IP; 10 req/detik ke target |

### 7.2 Performa

| No | Aspek | Kebutuhan | Target |
|---|---|---|---|
| NFR-07 | Waktu respons UI | Dashboard initial load | < 3 detik pada koneksi normal |
| NFR-08 | Waktu respons API | Semua API endpoint | P95 < 500ms |
| NFR-09 | Durasi Internal Scan | Selesai untuk OJS standar | < 5 menit |
| NFR-10 | Durasi External Scan | Selesai untuk target normal | < 15 menit |
| NFR-11 | Anti-DoS target | Rate limit external bot | Maks 10 req/detik ke server target |
| NFR-12 | Concurrent scans | Scan bersamaan | 20 scan job tanpa degradasi performa |

### 7.3 Usability

| No | Aspek | Kebutuhan |
|---|---|---|
| NFR-13 | Non-teknis | 80% pengguna non-teknis dapat membaca dan memahami risk score tanpa panduan tambahan |
| NFR-14 | Bahasa mitigasi | Rekomendasi perbaikan ditulis dalam Bahasa Indonesia yang sederhana |
| NFR-15 | Onboarding | Pengguna baru dapat menjalankan scan pertama dalam < 30 menit |
| NFR-15b | Mobile | Dashboard responsive dan dapat diakses di mobile browser (best effort — memanfaatkan Tailwind CSS + shadcn/ui responsive utilities, tanpa testing khusus mobile pada MVP) |

### 7.4 Ketersediaan & Skalabilitas

| No | Aspek | Kebutuhan |
|---|---|---|
| NFR-16 | Uptime SLA | 99.5% per bulan (maks downtime 3.6 jam/bulan) |
| NFR-17 | On-demand access | Platform dapat diakses 24/7 tanpa maintenance window |
| NFR-18 | Concurrent users | Mendukung 20+ concurrent user tanpa degradasi performa (MVP). Target 100+ pada Fase 2. |
| NFR-18b | Multi-tenant | 50+ tenant aktif bersamaan dengan isolasi data penuh |
| NFR-19 | CVE update | Database CVE diperbarui otomatis harian dari NVD API |

### 7.5 Kompatibilitas

| No | Aspek | Kebutuhan |
|---|---|---|
| NFR-20 | OJS version | OJS 3.3.x dan 3.4.x |
| NFR-21 | PHP version | PHP 7.4+, PHP 8.0, PHP 8.1, PHP 8.2 |
| NFR-22 | Browser support | Chrome 100+, Firefox 100+, Edge 100+, Safari 15+ |
| NFR-23 | Server OS | Ubuntu 22.04+ untuk server OJSDef |

---

## 8. User Stories

### 8.1 Admin OJS

| ID | User Story | Kriteria Penerimaan |
|---|---|---|
| US-01 | Sebagai Admin OJS, saya ingin menambahkan URL OJS saya agar dapat diaudit keamanannya. | Sistem validasi URL, ping konektivitas, tampilkan status "Ready to Scan". |
| US-02 | Sebagai Admin OJS, saya ingin menginstall plugin OJSDef agar audit internal dapat dilakukan. | Sistem sediakan file plugin, API Key, dan panduan instalasi step-by-step. |
| US-03 | Sebagai Admin OJS, saya ingin menjalankan scan on-demand kapan saja. | Tombol "Run Scan" tersedia; scan dimulai dalam < 10 detik; status tampil real-time. |
| US-04 | Sebagai Admin OJS, saya ingin melihat skor risiko dalam tampilan yang mudah dipahami. | Dashboard tampilkan skor 0–100 dengan indikator warna dan label teks. |
| US-05 | Sebagai Admin OJS, saya ingin mendapatkan panduan perbaikan step-by-step. | Setiap temuan memiliki action plan: langkah konkrit, estimasi waktu perbaikan. |
| US-06 | Sebagai Admin OJS, saya ingin mengunduh laporan PDF untuk dilaporkan ke atasan. | Tombol "Export PDF" menghasilkan laporan dalam < 30 detik siap cetak. |
| US-07 | Sebagai Admin OJS, saya ingin notifikasi langsung jika ada ancaman kritis. | Notifikasi email/Telegram terkirim dalam < 5 menit setelah Critical terdeteksi. |

### 8.2 Tim IT

| ID | User Story | Kriteria Penerimaan |
|---|---|---|
| US-08 | Sebagai Tim IT, saya ingin melihat log teknis detail agar dapat melakukan patching di level server. | Log menampilkan: nama file/endpoint rentan, jenis vulnerability (OWASP), CVSS score, CVE ID. |
| US-09 | Sebagai Tim IT, saya ingin menjadwalkan scan pada jam rendah trafik. | Fitur scheduling tersedia; scan berjalan sesuai jadwal tanpa intervensi manual. |
| US-10 | Sebagai Tim IT, saya ingin laporan teknis dalam format JSON/HTML untuk diintegrasikan ke sistem monitoring. | Export JSON menghasilkan data terstruktur; format terdokumentasi. |

### 8.3 SaaS Admin

| ID | User Story | Kriteria Penerimaan |
|---|---|---|
| US-11 | Sebagai SaaS Admin, saya ingin memastikan database CVE selalu ter-update. | Sync otomatis harian dari NVD; alert jika sync gagal > 48 jam. |
| US-12 | Sebagai SaaS Admin, saya ingin mengelola tenant: create, suspend, delete. | Tenant suspended tidak dapat login; delete dengan konfirmasi; data ter-cascade. |

### 8.4 Pimpinan Institusi

| ID | User Story | Kriteria Penerimaan |
|---|---|---|
| US-13 | Sebagai Pimpinan Institusi, saya ingin laporan manajerial kondisi keamanan jurnal kami. | Executive summary 1–2 halaman: kondisi keamanan tanpa istilah teknis, rekomendasi prioritas. **MVP:** Laporan diunduh oleh Admin OJS (FR-REPORT-02) dan diteruskan secara manual — Pimpinan tidak login langsung ke sistem pada MVP. |

---

## 9. Rekomendasi Technology Stack

### 9.1 Stack Lengkap

| Layer | Teknologi | Justifikasi |
|---|---|---|
| **Frontend** | Next.js 14 (App Router + RSC) | Ekosistem matang; SSR optimal; App Router untuk performa |
| **UI Components** | shadcn/ui + Radix UI | Accessible; customizable; tidak lock-in |
| **Data Fetching** | TanStack Query v5 | Server state management terbaik untuk React |
| **Global State** | Zustand | Lightweight; tidak boilerplate; cocok untuk auth state |
| **Visualisasi** | Recharts | Library chart React yang mature dan customizable |
| **Backend** | FastAPI 0.110 + Uvicorn | Async Python native; auto OpenAPI docs; Pydantic v2 |
| **ORM** | SQLAlchemy 2.0 (async) | Mature; production-ready; native async support |
| **Migrations** | Alembic | Standard migration tool untuk SQLAlchemy |
| **Auth** | python-jose + passlib[bcrypt] | JWT generation; bcrypt cost=12 untuk password |
| **Database** | PostgreSQL 16 | RLS untuk multi-tenancy; JSONB; ACID compliance |
| **Broker** | Redis 7 | Dual purpose: Celery broker + cache + session store |
| **Task Queue** | Celery 5 | De-facto standard Python async tasks; retry logic |
| **PDF Generator** | WeasyPrint + Jinja2 | HTML/CSS → PDF; mudah dikustomisasi template |
| **Object Storage** | MinIO (S3-compatible) | Self-hosted; tidak bergantung cloud; Docker-friendly |
| **OJS Plugin** | PHP (native OJS Plugin API) | Wajib PHP agar kompatibel dengan arsitektur OJS |
| **Reverse Proxy** | Nginx 1.25 | Industry standard; SSL termination; rate limiting |
| **Container** | Docker 24 + Docker Compose v2 | Reproducible environment; production deployment standard |
| **Monitoring** | Prometheus + Grafana | Open source monitoring stack terbaik |
| **Error Tracking** | Sentry | Real-time error monitoring; free tier memadai |
| **Celery Monitor** | Flower | Real-time monitoring untuk Celery workers dan queues |

### 9.2 Scanner Libraries (Python)

| Library | Kegunaan |
|---|---|
| `requests` + `httpx` | HTTP scanner requests |
| `BeautifulSoup4` + `lxml` | HTML parsing untuk fingerprinting |
| `ssl` + `pyopenssl` | TLS/SSL certificate analysis |
| `cryptography` | Inspeksi detail sertifikat |
| `nvdlib` | CVE lookup dari NVD API |
| `dnspython` | DNS TXT record verification |
| `re` + `validators` | Pattern matching dan URL validation |

---

## 10. Analisis Risiko & Mitigasi

| ID | Risiko | Probabilitas | Dampak | Strategi Mitigasi |
|---|---|---|---|---|
| R-01 | External Bot menyebabkan DoS tidak sengaja ke server target | Sedang | Tinggi | Rate limit ketat (10 req/s); delay antar request; mode "gentle scan" default |
| R-02 | Plugin Internal disalahgunakan sebagai backdoor | Rendah | Kritis | Plugin hanya terima dari IP OJSDef; HMAC signing wajib; code audit berkala |
| R-03 | Data hasil scan klien bocor (breach di OJSDef) | Rendah | Kritis | Enkripsi AES-256 at-rest; RLS PostgreSQL; pentest rutin platform OJSDef |
| R-04 | False positive tinggi → alarm fatigue | Tinggi | Sedang | Validasi multi-layer; mekanisme mark as false positive; feedback loop user |
| R-05 | Unauthorized scanning (domain orang lain) | Sedang | Tinggi | Verifikasi kepemilikan domain wajib; TOS ketat; audit log semua scan |
| R-06 | CVE database tidak update → kerentanan baru tidak terdeteksi | Sedang | Sedang | Daily sync NVD API; alert ke SaaS admin jika sync gagal > 48 jam |
| R-07 | Plugin tidak kompatibel beberapa versi OJS/PHP | Tinggi | Sedang | Test matrix OJS 3.3.x + 3.4.x × PHP 7.4/8.0/8.1/8.2; graceful fallback |
| R-08 | NVD API rate limit terlampaui | Sedang | Rendah | Cache CVE data Redis; batch request; exponential backoff retry |

---

## 11. Roadmap Pengembangan

### Fase 1 — MVP (Bulan 1–3)
**Target: Platform fungsional yang dapat digunakan untuk audit dasar**

- Sistem autentikasi: login, JWT, RBAC *(akun dibuat oleh SaaS Admin — tidak ada self-register pada MVP)*
- Manajemen target OJS + verifikasi kepemilikan domain
- OJS Plugin v1: Fingerprinting, Config Scanner, Plugin Audit, RBAC Auditor
- External Bot v1: SSL/TLS Analysis, HTTP Headers Check, Open Directory Detection
- Risk Scoring Engine (basic CVSS v3)
- Dashboard: Security Score Card + Vulnerability Summary
- Export PDF basic + notifikasi email untuk Critical
- Minimal audit log endpoint untuk kebutuhan debugging

> **Catatan Scope MVP:** Fitur berikut **tidak termasuk** dalam MVP dan dijadwalkan untuk fase berikutnya:
> - **Scan Scheduling / Celery Beat** → Fase 2
> - **Self-register & Email Verification** → Fase 2
> - **Forgot Password mandiri** → Fase 2 (reset dilakukan SaaS Admin pada MVP)
> - **Multi-target subscription tiers (Free/Pro/Enterprise)** → Fase 3
> - **Export format HTML** → Fase 2

### Fase 2 — Enrichment (Bulan 4–6)
**Target: Memperkuat kemampuan deteksi dan meningkatkan UX**

- OJS Plugin v2: File Integrity Checker, Content Injection Detector, Database Security Check
- External Bot v2: Vulnerability Scanner (SQLi/XSS passive), Fingerprinting lanjutan, CVE Matching
- Attack Surface Map visualization pada dashboard
- Action Plan (Remediation Recommendation) step-by-step
- Integrasi Telegram Bot untuk notifikasi
- Scan Scheduling (cron job) + Executive Summary Report

### Fase 3 — Advanced (Bulan 7–12)
**Target: Fitur lanjutan dan persiapan komersialisasi**

- External Bot v3: API Security Testing, multi-target concurrent scan
- SIEM Integration (export ke format standar SIEM)
- Machine Learning-based anomaly detection untuk Content Injection
- Automated patching guidance (one-click mitigation untuk beberapa issue)
- Pricing & subscription model (Free / Pro / Enterprise)
- Submission ke OJS Plugin Gallery publik

---

## 12. Batasan & Di Luar Scope

### 12.1 Dalam Scope

- Audit keamanan instalasi OJS versi 3.x melalui dua pendekatan (internal plugin + external bot)
- Dashboard monitoring berbasis web yang dapat diakses melalui browser
- Risk scoring berbasis CVSS dan OWASP Top 10
- Generasi laporan PDF untuk keperluan audit internal institusi
- Notifikasi via email dan Telegram untuk ancaman kritis
- Scanning on-demand dan terjadwal (scheduling)
- Multi-tenant support untuk banyak institusi

### 12.2 Di Luar Scope (Out of Scope)

- Penetration testing aktif/destruktif yang merusak data di server target
- Scanning platform CMS selain OJS (WordPress, Drupal, dll)
- Perbaikan/patching otomatis pada server target tanpa konfirmasi eksplisit dari admin
- Aplikasi mobile native (Android/iOS) — platform web-only pada fase awal
- OJS versi 2.x (End of Life)
- Monitoring performa server (CPU, RAM, disk)
- Layanan konsultasi keamanan secara langsung

---

## 13. Glosarium

| Istilah | Definisi |
|---|---|
| **OJS** | Open Journal Systems — platform manajemen jurnal ilmiah open-source (PKP) |
| **Attack Surface** | Keseluruhan titik sistem yang berpotensi menjadi vektor serangan |
| **Attack Surface Mapping** | Proses mengidentifikasi dan memetakan semua komponen yang dapat dieksploitasi |
| **CVE** | Common Vulnerabilities and Exposures — penomoran standar kerentanan publik |
| **CVSS v3** | Common Vulnerability Scoring System v3 — standar penilaian keparahan (0.0–10.0) |
| **OWASP Top 10** | Daftar 10 kerentanan aplikasi web paling kritis menurut OWASP |
| **Defacement** | Serangan yang mengubah tampilan website secara tidak sah |
| **File Integrity Check** | Verifikasi file sistem tidak berubah dengan membandingkan hash SHA-256 |
| **False Positive** | Kondisi di mana sistem melaporkan kerentanan yang sebenarnya tidak ada |
| **RBAC** | Role-Based Access Control — kontrol akses berdasarkan peran pengguna |
| **JWT** | JSON Web Token — standar token autentikasi stateless |
| **SaaS** | Software as a Service — software berbasis cloud, diakses melalui browser |
| **Multi-tenant** | Arsitektur satu instance aplikasi melayani banyak pelanggan secara terisolasi |
| **On-demand Scanning** | Scanning yang dijalankan manual oleh pengguna sesuai kebutuhan |
| **Content Injection** | Penyisipan konten ilegal (judi, malware, spam) ke dalam konten website |
| **RLS** | Row-Level Security — fitur PostgreSQL untuk isolasi data antar tenant |
| **HMAC** | Hash-based Message Authentication Code — verifikasi integritas dan autentikasi pesan |
| **MinIO** | Object storage S3-compatible yang dapat dijalankan secara self-hosted |
| **WeasyPrint** | Library Python untuk konversi HTML/CSS menjadi PDF |
| **Tenant** | Institusi/organisasi pengguna dalam sistem multi-tenant |

---

## 14. Riwayat Revisi Dokumen

| Versi | Tanggal | Penulis | Deskripsi Perubahan |
|---|---|---|---|
| 1.0 | April 2026 | Kelompok 3 — Topik G2 | Versi awal PRD berdasarkan Laporan Lembar Kerja 2, diperluas dengan detail arsitektur dua arah (internal plugin + external bot), user stories, risk matrix, technology stack, dan roadmap 3 fase. |
| 1.1 | Mei 2026 | Kelompok 3 — Topik G2 | Revisi scope MVP berdasarkan diskusi konsistensi PRD-SRS: (1) Ubah F-02 Register menjadi SaaS Admin create account — tidak ada self-register pada MVP; (2) F-06 reset password oleh SaaS Admin pada MVP; (3) F-42 dibatasi JSON only — HTML deferred; (4) F-45 Scan Scheduling di-defer ke Fase 2; (5) F-11 subscription tiers di-defer ke Fase 3; (6) Tambah catatan scope MVP di Roadmap Fase 1. |
| 1.2 | Mei 2026 | Kelompok 3 — Topik G2 | Penyelarasan minor issues PRD-SRS: (1) F-32 label dashboard diubah urutan Kritis→Berbahaya→Perhatian→Aman; (2) Stakeholder Pimpinan Institusi diklarifikasi — tidak ada system role pada MVP, laporan diserahkan manual via admin_ojs, role `read_only` dipertimbangkan Fase 2; (3) US-13 ditambah catatan mekanisme penyerahan PDF via admin_ojs; (4) NFR mobile (NFR-15b) ditambahkan — best effort via Tailwind + shadcn/ui; (5) NFR concurrent users ditambahkan — 20+ untuk MVP, 100+ target Fase 2; (6) Section 5.3 ditambah catatan scheduling deferred dari MVP. |

---

## Komposisi Tim Pengembang

| No | Nama | NIM | Program Studi | Peran | Kontribusi Utama |
|---|---|---|---|---|---|
| 1 | Dama Saputra Ganatha | 235150407111024 | Sistem Informasi | Quality Assurance | Project management, risk management, performance testing, bug management |
| 2 | Muhammad Habib | 235150407111040 | Sistem Informasi | Quality Assurance | Project management, risk management, stakeholder management, bug management |
| 3 | Faris Dian Pradipta | 235150200111068 | Teknik Informatika | Front End | UI/UX design, client-side logic, API integration, responsive design |
| 4 | Muchammad Ryan Afif | 235150301111008 | Teknik Komputer | Back End | API development, database management, business logic, security |
| 5 | M. Alfian Taftazani | 225150300111007 | Teknik Komputer | DevOps | CI/CD pipeline, infrastructure, containerization, monitoring & logging |
| 6 | Fiony Safa Ananda | 235150701111053 | Teknologi Informasi | Front End | UI/UX design, client-side logic, API integration, performance web |
| 7 | Eriza Dinda Febriana | 235150707111047 | Teknologi Informasi | Front End | UI/UX design, cross-browser compatibility, API integration |
| 8 | Muhammad Zulfikar Raditya W | 235150201111034 | Teknik Informatika | Back End | API development, database management, third-party integration, optimization |

---

*Dokumen ini merupakan bagian dari deliverable Capstone Project Kelompok 3 — Topik G2, Fakultas Ilmu Komputer, Universitas Brawijaya, 2026. Dilarang mendistribusikan tanpa izin tertulis dari tim pengembang dan mitra Seclab Indonesia.*
