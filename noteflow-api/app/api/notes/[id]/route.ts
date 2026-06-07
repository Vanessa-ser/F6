import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth';

const noteUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET, PATCH y DELETE ahora esperan que params sea una Promesa
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Unwrapping de la promesa
    const userId = getUserIdFromRequest(request);
    
    const [note] = await query(
      `SELECT ... `, // (Tu consulta SQL original)
      [id, userId]
    );

    if (!note) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { id } = await params;

    // Actualizar campos simples en la tabla notes si vienen
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${idx++}`);
      values.push(body.title);
    }
    if (body.content !== undefined) {
      updates.push(`content = $${idx++}`);
      values.push(body.content);
    }
    if (body.color !== undefined) {
      updates.push(`color = $${idx++}`);
      values.push(body.color);
    }

    if (updates.length > 0) {
      // añadimos updated_at
      updates.push(`updated_at = NOW()`);
      values.push();
      // construimos la consulta
      values.push(id, userId);
      await query(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx}`,
        values
      );
    }

    // Reemplazar tags si vienen
    if (body.tags !== undefined) {
      await query('DELETE FROM note_tags WHERE note_id = $1', [id]);
      if (Array.isArray(body.tags) && body.tags.length) {
        for (const tag of body.tags) {
          await query('INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)', [id, tag]);
        }
      }
    }

    // Reemplazar items de checklist si vienen
    if (body.items !== undefined) {
      // Borramos los items existentes para esta nota y usuario
      await query(
        `DELETE FROM checklist_items WHERE note_id = $1 AND EXISTS (
           SELECT 1 FROM notes WHERE notes.id = $1 AND notes.user_id = $2
         )`,
        [id, userId]
      );

      if (Array.isArray(body.items) && body.items.length) {
        for (const item of body.items) {
          await query(
            `INSERT INTO checklist_items (id, note_id, text, is_completed) VALUES (gen_random_uuid(), $1, $2, $3)`,
            [id, item.text, Boolean(item.isCompleted)]
          );
        }
      }
    }

    // Devolvemos la nota actualizada incluyendo items y tags
    const [note] = await query(
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
        WHERE n.id = $1 AND n.user_id = $2
        LIMIT 1`,
      [id, userId]
    );

    if (!note) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error en PATCH:", error); // <-- MIRA ESTO EN LA TERMINAL DE TU BACKEND
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("Recibida petición DELETE para ID:", id); 
  
  try {
    const { id } = await params; 
    const userId = getUserIdFromRequest(request);
    
    const [deleted] = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId] // Usamos 'id' aquí
    );

    if (!deleted) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}