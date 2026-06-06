
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

interface NoteResponse {
  id: string;
  title: string;
  type: 'note' | 'checklist' | 'idea';
  content?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  items?: any[];
}

const noteSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  items: z.array(z.object({
    text: z.string(),
    isCompleted: z.boolean().optional().default(false)
  })).optional(),
});

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    
    const notes = await query(
      `SELECT
          n.id,
          n.title,
          n.type,
          n.content,
          n.color,
          n.created_at AS "createdAt",
          n.updated_at AS "updatedAt",
          COALESCE(ci.items, '[]'::jsonb) AS items,
          COALESCE(nt.tags, '[]'::jsonb) AS tags
        FROM notes n
        LEFT JOIN LATERAL (
          SELECT jsonb_agg(jsonb_build_object('id', i.id, 'text', i.text, 'isCompleted', i.is_completed)) as items
          FROM checklist_items i WHERE i.note_id = n.id
        ) ci ON true
        LEFT JOIN LATERAL (
          SELECT jsonb_agg(t.tag) as tags
          FROM note_tags t WHERE t.note_id = n.id
        ) nt ON true
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC`,
      [userId]
    );
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }
    
    const { id, title, type, content, color, tags, items, createdAt, updatedAt } = result.data;

    // Ejecutamos la consulta y obtenemos el array de resultados
    const results = await query<NoteResponse[]>(
      `INSERT INTO notes (id, user_id, title, type, content, color, created_at, updated_at)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, type, content, color, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [id ?? null, userId, title, type, content ?? null, color ?? null, createdAt ?? null, updatedAt ?? null]
    );

    // Accedemos al primer elemento de forma segura
    const note = results[0];
    const createdNoteId = note.id;
    // 2. Insertar etiquetas
    if (tags?.length) {
      for (const tag of tags) {
        await query('INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)', [note.id, tag]);
      }
    }

    // 3. Insertar ítems de checklist
    if (type === 'checklist' && items?.length) {
      for (const item of items) {
        await query(
          'INSERT INTO checklist_items (note_id, text, is_completed) VALUES ($1, $2, $3)', 
          [createdNoteId, item.text, item.isCompleted]
        );
      }
    }

    // Retornamos el objeto completo incluyendo los datos relacionados
    return NextResponse.json({ ...note, items, tags }, { status: 201 });
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json({ error: 'Error interno al guardar la nota' }, { status: 500 });
  }
}