import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Esquema de validación: eliminamos la obligatoriedad de que los IDs vengan del cliente
const checklistSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.object({
    text: z.string(),
    isCompleted: z.boolean().default(false),
  })),
});

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    const checklists = await query(
      `SELECT
          n.id,
          n.title,
          n.type,
          n.created_at AS "createdAt",
          n.updated_at AS "updatedAt",
          COALESCE(json_agg(json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)) 
            FILTER (WHERE ci.id IS NOT NULL), '[]') as items
       FROM notes n
       LEFT JOIN checklist_items ci ON n.id = ci.note_id
       WHERE n.type = 'checklist' AND n.user_id = $1
       GROUP BY n.id
       ORDER BY n.created_at DESC`,
      [userId]
    );
    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const result = checklistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }

    const { title, items } = result.data;
    const newNoteId = uuidv4(); // Generamos el ID en el servidor
    const now = new Date();

    // 1. Insertar checklist
    const [checklist] = await query(
      `INSERT INTO notes (id, user_id, title, type, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, title, type, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [newNoteId, userId, title, 'checklist', now, now]
    );

    // 2. Insertar items asociados
    for (const item of items) {
      await query(
        `INSERT INTO checklist_items (id, note_id, text, is_completed) 
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), newNoteId, item.text, item.isCompleted]
      );
    }

    return NextResponse.json({ 
      ...(checklist as any),
      items 
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving checklist:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}