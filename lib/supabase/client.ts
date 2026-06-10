// Supabase Auth ha sido reemplazado por JWT + MongoDB.
// Este archivo se mantiene para no romper imports residuales,
// pero no debe usarse. Usa lib/auth-context.tsx en su lugar.
export function createClient(): never {
  throw new Error('Supabase Auth eliminado. Usa el sistema JWT (lib/auth-context.tsx).')
}
