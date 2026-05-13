-- ============================================================
-- HomeBoard — Fix completo: RLS + función crear_hogar_con_admin
-- Pegar TODO este bloque en SQL Editor de Supabase y ejecutar
-- ============================================================

-- ── 1. Función helper (evita recursión en políticas RLS) ─────
-- SECURITY DEFINER corre como postgres → bypass RLS → sin bucle
CREATE OR REPLACE FUNCTION public.get_my_hogar_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ── 2. Función crear hogar + perfil admin ────────────────────
CREATE OR REPLACE FUNCTION public.crear_hogar_con_admin(
  p_user_id       UUID,
  p_nombre_hogar  TEXT,
  p_nombre_perfil TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hogar_id UUID;
BEGIN
  INSERT INTO public.hogares (nombre)
  VALUES (p_nombre_hogar)
  RETURNING id INTO v_hogar_id;

  INSERT INTO public.perfiles (user_id, hogar_id, nombre, rol)
  VALUES (p_user_id, v_hogar_id, p_nombre_perfil, 'admin');

  RETURN v_hogar_id;
END;
$$;

-- ── 3. Borrar TODAS las políticas anteriores ─────────────────
DO $$ BEGIN
  -- perfiles
  DROP POLICY IF EXISTS "Miembros pueden ver perfiles de su hogar"   ON public.perfiles;
  DROP POLICY IF EXISTS "Usuarios pueden ver perfiles de su hogar"   ON public.perfiles;
  DROP POLICY IF EXISTS "Usuario puede actualizar su propio perfil"  ON public.perfiles;
  DROP POLICY IF EXISTS "Usuario puede insertar su propio perfil"    ON public.perfiles;
  DROP POLICY IF EXISTS "perfiles_select"  ON public.perfiles;
  DROP POLICY IF EXISTS "perfiles_insert"  ON public.perfiles;
  DROP POLICY IF EXISTS "perfiles_update"  ON public.perfiles;
  -- hogares
  DROP POLICY IF EXISTS "Miembros pueden ver su hogar"   ON public.hogares;
  DROP POLICY IF EXISTS "Admin puede actualizar su hogar" ON public.hogares;
  DROP POLICY IF EXISTS "hogares_select" ON public.hogares;
  DROP POLICY IF EXISTS "hogares_update" ON public.hogares;
  -- tareas
  DROP POLICY IF EXISTS "Miembros pueden ver tareas de su hogar"       ON public.tareas;
  DROP POLICY IF EXISTS "Miembros pueden crear tareas en su hogar"     ON public.tareas;
  DROP POLICY IF EXISTS "Miembros pueden actualizar tareas de su hogar" ON public.tareas;
  DROP POLICY IF EXISTS "Admin puede eliminar tareas de su hogar"      ON public.tareas;
  DROP POLICY IF EXISTS "tareas_select" ON public.tareas;
  DROP POLICY IF EXISTS "tareas_insert" ON public.tareas;
  DROP POLICY IF EXISTS "tareas_update" ON public.tareas;
  DROP POLICY IF EXISTS "tareas_delete" ON public.tareas;
END $$;

-- ── 4. Políticas perfiles (sin recursión) ────────────────────
CREATE POLICY "perfiles_select"
  ON public.perfiles FOR SELECT
  USING (
    user_id = auth.uid()                     -- ve su propio perfil (sin lookup)
    OR hogar_id = public.get_my_hogar_id()   -- ve compañeros de hogar
  );

CREATE POLICY "perfiles_insert"
  ON public.perfiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "perfiles_update"
  ON public.perfiles FOR UPDATE
  USING (user_id = auth.uid());

-- ── 5. Políticas hogares ──────────────────────────────────────
CREATE POLICY "hogares_select"
  ON public.hogares FOR SELECT
  USING (id = public.get_my_hogar_id());

CREATE POLICY "hogares_update"
  ON public.hogares FOR UPDATE
  USING (
    id = public.get_my_hogar_id()
    AND EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );

-- ── 6. Políticas tareas ───────────────────────────────────────
CREATE POLICY "tareas_select"
  ON public.tareas FOR SELECT
  USING (hogar_id = public.get_my_hogar_id());

CREATE POLICY "tareas_insert"
  ON public.tareas FOR INSERT
  WITH CHECK (hogar_id = public.get_my_hogar_id());

CREATE POLICY "tareas_update"
  ON public.tareas FOR UPDATE
  USING (hogar_id = public.get_my_hogar_id());

CREATE POLICY "tareas_delete"
  ON public.tareas FOR DELETE
  USING (
    hogar_id = public.get_my_hogar_id()
    AND EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );
