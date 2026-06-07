import { NextResponse } from 'next/server';
import { compareSync } from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/db';
import { signJwt } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.format() }, { status: 400 });
  }

  const { email, password } = result.data;
  const [user] = (await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email])) as any;

  if (!user || !compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
  }

  const token = signJwt({ userId: user.id, email: user.email });
  return NextResponse.json({ token, user: { id: user.id, email: user.email } });
}
