import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const checklistSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCompleted: z.boolean(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export async function GET() {
  try {
    const checklists = await query(
      `SELECT n.*, 
              json_agg(json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)) 
              FILTER (WHERE ci.id IS NOT NULL) as items
       FROM notes n
       LEFT JOIN checklist_items ci ON n.id = ci.note_id
       WHERE n.type = 'checklist'
       GROUP BY n.id
       ORDER BY n.created_at DESC`
    );
    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = checklistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }

    const { id, title, items, createdAt, updatedAt } = result.data;

    // Insertar checklist en la tabla notes con type='checklist'
    const [checklist] = await query(
      `INSERT INTO notes (id, title, type, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, title, 'checklist', new Date(createdAt), new Date(updatedAt)]
    );

    // Insertar items en la tabla checklist_items
    for (const item of items) {
      await query(
        `INSERT INTO checklist_items (id, note_id, text, is_completed) 
         VALUES ($1, $2, $3, $4)`,
        [item.id, id, item.text, item.isCompleted]
      );
    }

    return NextResponse.json({ 
      ...checklist, 
      items 
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving checklist:', error);
    return NextResponse.json(
      { error: 'Failed to save checklist' },
      { status: 500 }
    );
  }
}
