import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await query('SELECT * FROM checklist_items WHERE note_id = $1', [params.id]);
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { text } = await request.json();
  const [item] = await query('INSERT INTO checklist_items (note_id, text) VALUES ($1, $2) RETURNING *', 
    [params.id, text]);
  return NextResponse.json(item, { status: 201 });
}