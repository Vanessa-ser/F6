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

    await query(
      `UPDATE notes SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
      [body.title, id, userId]
    );

    return NextResponse.json({ success: true });
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