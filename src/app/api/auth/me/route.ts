import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth/tokens';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const cookies = parse(cookie || '');
    const token = cookies['cant_token'];
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
    const payload = verifyToken(token as string);
    return NextResponse.json({ authenticated: true, user: payload }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
