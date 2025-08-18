import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createToken } from '../../../../lib/auth/tokens';
import { findUserByUsername } from '../../../../lib/auth/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) return NextResponse.json({ error: 'missing' }, { status: 400 });
    const user = await findUserByUsername(username);
    if (!user) return NextResponse.json({ error: 'invalid' }, { status: 401 });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'invalid' }, { status: 401 });
    const token = createToken({ username: user.username, role: user.role });
    const res = NextResponse.json({ ok: true, user: { username: user.username, role: user.role } });
    res.headers.set('Set-Cookie', `cant_token=${token}; HttpOnly; Path=/; Max-Age=28800`);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
