
-- Create concept status enum
CREATE TYPE public.concept_status AS ENUM ('practicing', 'getting_there', 'solid');

-- Create concepts table
CREATE TABLE public.concepts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  topic_snippet TEXT NOT NULL,
  key_idea TEXT NOT NULL,
  source_content TEXT NOT NULL DEFAULT '',
  status concept_status NOT NULL DEFAULT 'practicing',
  next_practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_practiced DATE,
  practice_count INTEGER NOT NULL DEFAULT 0
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practiced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clarity INTEGER NOT NULL DEFAULT 0,
  example INTEGER NOT NULL DEFAULT 0,
  held_together INTEGER NOT NULL DEFAULT 0,
  what_worked TEXT NOT NULL DEFAULT '',
  work_on_next TEXT NOT NULL DEFAULT '',
  say_tomorrow TEXT NOT NULL DEFAULT ''
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  total_sessions INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for concepts
CREATE POLICY "Users can view own concepts" ON public.concepts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own concepts" ON public.concepts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own concepts" ON public.concepts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for sessions
CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for concepts (for library updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.concepts;
