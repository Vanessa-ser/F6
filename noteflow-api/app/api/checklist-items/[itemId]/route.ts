import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// DELETE: Para borrar un ítem individual
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ itemId: string }> } // params ahora es una Promesa
) {
  try {
    const userId = getUserIdFromRequest(request);
    // Unwrapeamos la promesa aquí
    const { itemId } = await params; 

    await query(
      `DELETE FROM checklist_items 
       WHERE id = $1 
       AND EXISTS (
         SELECT 1 FROM notes 
         WHERE notes.id = checklist_items.note_id 
         AND notes.user_id = $2
       )`,
      [itemId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ error: 'Error al eliminar el ítem' }, { status: 500 });
  }
}

// PATCH: Para actualizar texto o estado de un ítem individual
export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ itemId: string }> } // params ahora es una Promesa
) {
  try {
    const userId = getUserIdFromRequest(request);
    // Unwrapeamos la promesa aquí
    const { itemId } = await params;
    const body = await request.json();
    
    const updates = [];
    const values = [];
    let i = 1;

    if (body.text !== undefined) {
      updates.push(`text = $${i++}`);
      values.push(body.text);
    }
    if (body.isCompleted !== undefined) {
      updates.push(`is_completed = $${i++}`);
      values.push(body.isCompleted);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron datos para actualizar' }, { status: 400 });
    }

    values.push(itemId, userId);
    
    await query(
      `UPDATE checklist_items 
       SET ${updates.join(', ')} 
       WHERE id = $${i++} 
       AND EXISTS (
         SELECT 1 FROM notes 
         WHERE notes.id = checklist_items.note_id 
         AND notes.user_id = $${i}
       )`,
      values
    );

    // Recuperamos el ítem actualizado para devolver su estado al cliente
    const rows = await query(
      `SELECT id, text, is_completed FROM checklist_items WHERE id = $1 AND EXISTS (
         SELECT 1 FROM notes WHERE notes.id = checklist_items.note_id AND notes.user_id = $2
       )`,
      [itemId, userId]
    );

    const row: any = rows[0];
    if (!row) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ id: row.id, text: row.text, isCompleted: Boolean(row.is_completed) });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}