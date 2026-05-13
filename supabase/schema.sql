-- ============================================================
-- HomeBoard — Esquema inicial
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ── Tabla: hogares ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hogares (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre            TEXT        NOT NULL,
  codigo_invitacion TEXT        NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Tabla: perfiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.perfiles (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hogar_id   UUID        NOT NULL REFERENCES public.hogares(id) ON DELETE CASCADE,
  nombre     TEXT        NOT NULL,
  rol        TEXT        NOT NULL CHECK (rol IN ('admin', 'miembro')),
  avatar     TEXT,
  xp         INTEGER     DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, hogar_id)
);

-- ── Tabla: tareas ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tareas (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  hogar_id    UUID        NOT NULL REFERENCES public.hogares(id) ON DELETE CASCADE,
  titulo      TEXT        NOT NULL,
  descripcion TEXT,
  asignado_a  UUID        REFERENCES public.perfiles(id) ON DELETE SET NULL,
  completada  BOOLEAN     DEFAULT FALSE NOT NULL,
  xp_valor    INTEGER     DEFAULT 10 NOT NULL,
  color       TEXT        DEFAULT 'yellow',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.hogares  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas   ENABLE ROW LEVEL SECURITY;

-- ── Políticas: hogares ───────────────────────────────────────
CREATE POLICY "Miembros pueden ver su hogar"
  ON public.hogares FOR SELECT
  USING (
    id IN (
      SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin puede actualizar su hogar"
  ON public.hogares FOR UPDATE
  USING (
    id IN (
      SELECT hogar_id FROM public.perfiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );

-- ── Políticas: perfiles ──────────────────────────────────────
CREATE POLICY "Miembros pueden ver perfiles de su hogar"
  ON public.perfiles FOR SELECT
  USING (
    hogar_id IN (
      SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuario puede actualizar su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuario puede insertar su propio perfil"
  ON public.perfiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── Políticas: tareas ────────────────────────────────────────
CREATE POLICY "Miembros pueden ver tareas de su hogar"
  ON public.tareas FOR SELECT
  USING (
    hogar_id IN (
      SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Miembros pueden crear tareas en su hogar"
  ON public.tareas FOR INSERT
  WITH CHECK (
    hogar_id IN (
      SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Miembros pueden actualizar tareas de su hogar"
  ON public.tareas FOR UPDATE
  USING (
    hogar_id IN (
      SELECT hogar_id FROM public.perfiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin puede eliminar tareas de su hogar"
  ON public.tareas FOR DELETE
  USING (
    hogar_id IN (
      SELECT hogar_id FROM public.perfiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );

-- ── Función: crear hogar y perfil admin en una sola transacción ──
-- Se llama desde el cliente tras el registro con supabase.rpc(...)
-- Recibe el user_id explícitamente porque justo tras signUp() no hay
-- sesión activa aún (email pendiente de confirmar), por lo que auth.uid()
-- devolvería NULL dentro de la función.
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
