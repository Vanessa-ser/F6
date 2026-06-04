import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: false, message: 'DATABASE_URL not set' }, { status: 503 });
    }

    // Consulta ligera para validar conexión a la BD
    await query('SELECT 1');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
