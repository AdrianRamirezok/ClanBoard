-- Agrega columna color a tareas (necesaria para guardar el color elegido en el UI)
-- Ejecutar en SQL Editor de Supabase si ya creaste la tabla previamente.
ALTER TABLE public.tareas
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'yellow';
