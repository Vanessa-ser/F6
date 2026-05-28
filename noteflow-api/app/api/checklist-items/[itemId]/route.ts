import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { itemId: string } }) {
  const { is_completed } = await request.json();
  const [item] = await query('UPDATE checklist_items SET is_completed = $1 WHERE id = $2 RETURNING *', 
    [is_completed, params.itemId]);
  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: { params: { itemId: string } }) {
  await query('DELETE FROM checklist_items WHERE id = $1', [params.itemId]);
  return new NextResponse(null, { status: 204 });
}