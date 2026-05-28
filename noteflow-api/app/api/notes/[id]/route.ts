import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [note] = await query('SELECT * FROM notes WHERE id = $1', [params.id]);
  if (!note) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const [note] = await query('UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *', 
    [body.title, body.content, params.id]);
  return NextResponse.json(note);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await query('DELETE FROM notes WHERE id = $1', [params.id]);
  return new NextResponse(null, { status: 204 });
}