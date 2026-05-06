ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS sections jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS selected_section_indices jsonb DEFAULT NULL;