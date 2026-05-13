-- ============================================================
-- Fix: las políticas RLS de perfiles eran recursivas.
-- La política SELECT consultaba la tabla perfiles desde dentro
-- de la propia política de perfiles → PostgreSQL devolvía 0 filas
-- para evitar un bucle infinito → "no se encontró tu perfil".
--
-- Solución: función SECURITY DEFINER que lee perfiles sin RLS
-- y se usa como base para todas las políticas de hogar.
-- ============================================================

-- ── Helper: hogar_id del usuario actual (sin activar RLS) ────
CREATE OR REPLACE FUNCTION public.get_my_hogar_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ── Perfiles ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Miembros pueden ver perfiles de su hogar" ON public.perfiles;

CREATE POLICY "Usuarios pueden ver perfiles de su hogar"
  ON public.perfiles FOR SELECT
  USING (
    user_id = auth.uid()                   -- siempre puede verse a sí mismo
    OR hogar_id = public.get_my_hogar_id() -- puede ver compañeros de hogar
  );

-- ── Hogares ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Miembros pueden ver su hogar" ON public.hogares;

CREATE POLICY "Miembros pueden ver su hogar"
  ON public.hogares FOR SELECT
  USING (id = public.get_my_hogar_id());

DROP POLICY IF EXISTS "Admin puede actualizar su hogar" ON public.hogares;

CREATE POLICY "Admin puede actualizar su hogar"
  ON public.hogares FOR UPDATE
  USING (
    id = public.get_my_hogar_id()
    AND EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );

-- ── Tareas ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Miembros pueden ver tareas de su hogar"      ON public.tareas;
DROP POLICY IF EXISTS "Miembros pueden crear tareas en su hogar"    ON public.tareas;
DROP POLICY IF EXISTS "Miembros pueden actualizar tareas de su hogar" ON public.tareas;
DROP POLICY IF EXISTS "Admin puede eliminar tareas de su hogar"     ON public.tareas;

CREATE POLICY "Miembros pueden ver tareas de su hogar"
  ON public.tareas FOR SELECT
  USING (hogar_id = public.get_my_hogar_id());

CREATE POLICY "Miembros pueden crear tareas en su hogar"
  ON public.tareas FOR INSERT
  WITH CHECK (hogar_id = public.get_my_hogar_id());

CREATE POLICY "Miembros pueden actualizar tareas de su hogar"
  ON public.tareas FOR UPDATE
  USING (hogar_id = public.get_my_hogar_id());

CREATE POLICY "Admin puede eliminar tareas de su hogar"
  ON public.tareas FOR DELETE
  USING (
    hogar_id = public.get_my_hogar_id()
    AND EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );
