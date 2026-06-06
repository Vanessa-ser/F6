import { NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/db';
import { signJwt } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.format() }, { status: 400 });
  }

  const { email, password } = result.data;

  const [existingUser] = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser) {
    return NextResponse.json({ error: 'El correo ya está en uso' }, { status: 400 });
  }

  const passwordHash = hashSync(password, 10);
  const [user] = await query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  );

  const token = signJwt({ userId: user.id, email });

  return NextResponse.json({ token, user }, { status: 201 });
}
