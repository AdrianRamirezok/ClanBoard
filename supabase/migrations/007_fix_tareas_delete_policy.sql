-- ============================================================
-- Fix: el DELETE de tareas fallaba silenciosamente para miembros
-- no-admin porque las políticas anteriores requerían rol=admin
-- o completada=true. Cualquier miembro del hogar debe poder
-- eliminar cualquier tarea de su hogar (la restricción visual
-- de "solo completadas" se maneja en el UI, no en RLS).
-- ============================================================

-- Borrar todas las variantes del nombre que pudieron haber quedado
-- de migraciones anteriores (002, 003, 006)
DROP POLICY IF EXISTS "Admin puede eliminar tareas de su hogar"  ON public.tareas;
DROP POLICY IF EXISTS "tareas_delete"                             ON public.tareas;

-- Nueva política: cualquier miembro puede borrar tareas de su hogar
CREATE POLICY "tareas_delete"
  ON public.tareas FOR DELETE
  USING (hogar_id = public.get_my_hogar_id());
