import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('ojsdef_refresh')?.value

  if (!refreshToken) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 })
  }

  const backendRes = await fetch(`${API}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!backendRes.ok) {
    const res = NextResponse.json({ detail: 'Refresh failed' }, { status: 401 })
    res.cookies.delete('ojsdef_refresh')
    return res
  }

  const data = await backendRes.json()

  const meRes = await fetch(`${API}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const user = meRes.ok ? await meRes.json() : null

  const res = NextResponse.json({ access_token: data.access_token, user })

  if (data.refresh_token) {
    res.cookies.set('ojsdef_refresh', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return res
}
