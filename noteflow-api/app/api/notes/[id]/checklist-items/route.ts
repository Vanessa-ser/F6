import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth';

const checklistItemSchema = z.object({
  text: z.string().min(1),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(request);
    const items = await query(
      `SELECT ci.id, ci.note_id, ci.text, ci.is_completed AS "isCompleted"
       FROM checklist_items ci
       JOIN notes n ON n.id = ci.note_id
       WHERE ci.note_id = $1 AND n.user_id = $2`,
      [id, userId]
    );
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return NextResponse.json({ error: 'No autorizado o error interno' }, { status: 401 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const result = checklistItemSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.format() }, { status: 400 });
  }

  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(request);
    const [note] = (await query('SELECT id FROM notes WHERE id = $1 AND user_id = $2', [id, userId])) as any;
    if (!note) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const [item] = (await query(
      'INSERT INTO checklist_items (note_id, text) VALUES ($1, $2) RETURNING id, note_id, text, is_completed AS "isCompleted"',
      [id, result.data.text]
    )) as any;
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error saving checklist item:', error);
    return NextResponse.json({ error: 'No autorizado o error interno' }, { status: 401 });
  }
}