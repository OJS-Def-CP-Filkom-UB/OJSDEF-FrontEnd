// lib/diagnostics.ts — mirror app/workers/diagnostics.py (BackEnd)
// Panduan perbaikan internal scan gagal, Bahasa Indonesia.

export interface DiagnosticGuide {
  title: string
  steps: string[]
}

export const DIAGNOSTIC_GUIDES: Record<string, DiagnosticGuide> = {
  PLUGIN_UNREACHABLE: {
    title: 'Plugin OJS tidak dapat dijangkau',
    steps: [
      'Pastikan instalasi OJS sedang online dan dapat diakses dari internet.',
      'Pastikan plugin OJSDef sudah diaktifkan di OJS (Website Settings → Plugins).',
      'Jika OJS berada di balik firewall, aktifkan Mode Heartbeat pada pengaturan target.',
      'Tunggu plugin mengirim heartbeat minimal sekali, lalu coba scan lagi.',
    ],
  },
  PROBE_HTTP_500: {
    title: 'Plugin OJS mengalami error internal',
    steps: [
      'Pastikan plugin OJSDef versi terbaru sudah ter-install dan aktif.',
      'Periksa PHP error log di server OJS untuk pesan fatal.',
      'Reinstall plugin OJSDef bila perlu, lalu coba scan lagi.',
    ],
  },
  HMAC_MISMATCH: {
    title: 'API Key tidak cocok',
    steps: [
      'Buka halaman Panduan Plugin target ini untuk menyalin ulang API Key.',
      'Tempel API Key ke Settings plugin OJSDef di OJS (Backend URL, API Key, Target ID).',
      'Simpan pengaturan, lalu coba scan lagi.',
    ],
  },
  CHALLENGE_MISMATCH: {
    title: 'Plugin tidak merespons dengan benar',
    steps: [
      'Plugin terpasang tetapi tidak meng-echo verifikasi dengan benar.',
      'Reinstall plugin OJSDef versi terbaru.',
      'Coba scan lagi setelah plugin aktif.',
    ],
  },
  TRIGGER_REJECTED: {
    title: 'Plugin menolak permintaan scan',
    steps: [
      'Pastikan Target ID di Settings plugin OJS sama persis dengan dashboard.',
      'Pastikan API Key benar dan plugin dalam keadaan aktif.',
      'Coba scan lagi.',
    ],
  },
  CALLBACK_TIMEOUT: {
    title: 'Scan dimulai tetapi tidak selesai',
    steps: [
      'Plugin menerima permintaan tetapi tidak mengirim hasil dalam 5 menit.',
      'Periksa max_execution_time dan memory_limit pada PHP server OJS.',
      'Untuk instalasi besar, naikkan batas tersebut, lalu coba scan lagi.',
    ],
  },
}

export function getDiagnosticGuide(code: string | null | undefined): DiagnosticGuide | null {
  if (!code) return null
  return DIAGNOSTIC_GUIDES[code] ?? null
}
