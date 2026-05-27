import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  })

  if (!backendRes.ok) {
    const err = await backendRes.json()
    return NextResponse.json(err, { status: backendRes.status })
  }

  const data = await backendRes.json()

  // Fetch user profile using the new access_token
  const meRes = await fetch(`${API}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })
  const user = meRes.ok ? await meRes.json() : null

  const res = NextResponse.json({
    access_token: data.access_token,
    user,
    must_change_password: data.must_change_password ?? false,
  })

  res.cookies.set('ojsdef_refresh', data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
