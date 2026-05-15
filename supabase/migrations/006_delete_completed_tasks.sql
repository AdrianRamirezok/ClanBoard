-- ============================================================
-- Fix: la política tareas_delete solo permitía a admins borrar.
-- Ahora cualquier miembro puede eliminar tareas completadas
-- (ya están hechas, no hay riesgo de perder trabajo en curso).
-- Los admins siguen pudiendo borrar cualquier tarea.
-- ============================================================

DROP POLICY IF EXISTS "tareas_delete" ON public.tareas;

CREATE POLICY "tareas_delete"
  ON public.tareas FOR DELETE
  USING (
    hogar_id = public.get_my_hogar_id()
    AND (
      completada = true
      OR EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE user_id = auth.uid() AND rol = 'admin'
      )
    )
  );
