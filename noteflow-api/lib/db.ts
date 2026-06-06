import { neon } from '@neondatabase/serverless';

// Inicializamos el cliente
const sql = neon(process.env.DATABASE_URL!);

// Ajustamos la función para usar sql.query() correctamente
export async function query<T = unknown>(text: string, params?: any[]): Promise<T[]> {
  // CORRECCIÓN AQUÍ: usamos .query en lugar de llamar a sql directamente
  const result = await sql.query(text, params as any); 
  return result as T[];
}