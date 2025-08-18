import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.redirect('/login');
  res.headers.set('Set-Cookie', 'cant_token=; HttpOnly; Path=/; Max-Age=0');
  return res;
}
