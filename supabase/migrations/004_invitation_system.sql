-- ============================================================
-- Invitation system
-- Pegar en SQL Editor de Supabase y ejecutar
-- ============================================================

-- Unirse a un hogar por código de invitación
CREATE OR REPLACE FUNCTION public.unirse_al_hogar(
  p_user_id       UUID,
  p_codigo        TEXT,
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
  SELECT id INTO v_hogar_id
  FROM public.hogares
  WHERE LOWER(codigo_invitacion) = LOWER(TRIM(p_codigo));

  IF v_hogar_id IS NULL THEN
    RAISE EXCEPTION 'Código de invitación inválido';
  END IF;

  IF EXISTS (SELECT 1 FROM public.perfiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Ya perteneces a un hogar';
  END IF;

  INSERT INTO public.perfiles (user_id, hogar_id, nombre, rol)
  VALUES (p_user_id, v_hogar_id, p_nombre_perfil, 'miembro');

  RETURN v_hogar_id;
END;
$$;

-- Regenerar código de invitación (solo admin)
CREATE OR REPLACE FUNCTION public.regenerar_codigo_invitacion(p_hogar_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_code TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE user_id = auth.uid() AND hogar_id = p_hogar_id AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo el administrador puede regenerar el código';
  END IF;

  LOOP
    v_new_code := substring(md5(random()::text || clock_timestamp()::text), 1, 8);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.hogares WHERE codigo_invitacion = v_new_code
    );
  END LOOP;

  UPDATE public.hogares SET codigo_invitacion = v_new_code WHERE id = p_hogar_id;

  RETURN v_new_code;
END;
$$;
