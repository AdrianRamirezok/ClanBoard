// Supabase Auth ha sido reemplazado por JWT + MongoDB.
// Este archivo se mantiene para no romper imports residuales,
// pero no debe usarse. Usa lib/auth-server.ts en su lugar.
export async function createClient(): Promise<never> {
  throw new Error('Supabase Auth eliminado. Usa lib/auth-server.ts (getAuthUser).')
}
