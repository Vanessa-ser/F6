import { neon } from '@neondatabase/serverless';

// Inicializamos el cliente
const sql = neon(process.env.DATABASE_URL!);

// Ajustamos la función para usar sql.query() correctamente
export async function query<T = unknown>(text: string, params?: any[]): Promise<T[]> {
  // Ahora usamos el método .query tal como nos pedía el error
  const result = await sql.query(text, params);
  return result as T[];
}