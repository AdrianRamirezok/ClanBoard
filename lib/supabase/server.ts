// Supabase Auth ha sido reemplazado por Auth.js (NextAuth) + MongoDB.
// Este archivo se mantiene para no romper imports residuales,
// pero no debe usarse. Usa auth() de @/auth en su lugar.
export async function createClient(): Promise<never> {
  throw new Error('Supabase Auth eliminado. Usa auth() de @/auth.')
}
