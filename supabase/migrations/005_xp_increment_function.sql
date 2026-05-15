-- ============================================================
-- Fix: el UPDATE de xp en perfiles era bloqueado por RLS cuando
-- el usuario que completa la tarea no es el asignado a ella.
-- La política "perfiles_update" solo permite user_id = auth.uid(),
-- así que actualizar el xp de otro miembro del hogar falla silenciosamente.
--
-- Solución: función SECURITY DEFINER que corre como postgres (bypass RLS)
-- con su propia validación de seguridad (mismo hogar) y hace un
-- incremento atómico directo en la BD.
-- ============================================================

CREATE OR REPLACE FUNCTION public.incrementar_xp(
  p_perfil_id UUID,
  p_cantidad  INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el perfil objetivo pertenece al mismo hogar que el llamador
  IF NOT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = p_perfil_id
      AND hogar_id = public.get_my_hogar_id()
  ) THEN
    RAISE EXCEPTION 'No autorizado: el perfil no pertenece a tu hogar';
  END IF;

  UPDATE public.perfiles
  SET
    xp         = xp         + p_cantidad,
    xp_mensual = xp_mensual + p_cantidad
  WHERE id = p_perfil_id;
END;
$$;
