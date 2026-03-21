
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Meeting',
  meeting_type text NOT NULL DEFAULT 'meeting',
  status text NOT NULL DEFAULT 'recording',
  transcript text DEFAULT '',
  summary text DEFAULT '',
  action_items jsonb DEFAULT '[]'::jsonb,
  key_learnings jsonb DEFAULT '[]'::jsonb,
  speaker_labels jsonb DEFAULT '{}'::jsonb,
  duration_seconds integer DEFAULT 0,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own meetings" ON public.meetings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE TO authenticated USING (auth.uid() = user_id);
