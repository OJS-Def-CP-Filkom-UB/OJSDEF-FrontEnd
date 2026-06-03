import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('ojsdef_refresh')?.value

  if (refreshToken) {
    await fetch(`${API}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {})
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ojsdef_refresh')
  return res
}
