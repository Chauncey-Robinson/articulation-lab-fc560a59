
-- User profiles for onboarding survey
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  profession text,
  degree text,
  interests text[] DEFAULT '{}',
  gender text,
  age_range text,
  onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Modules (uploaded content units)
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  source_content text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT 'text',
  status text NOT NULL DEFAULT 'new',
  lesson_count integer DEFAULT 0,
  completed_lessons integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own modules" ON public.modules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own modules" ON public.modules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own modules" ON public.modules FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own modules" ON public.modules FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Lessons (AI-generated mini-lectures within modules)
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  key_idea text NOT NULL,
  lesson_order integer NOT NULL DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lessons" ON public.lessons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lessons" ON public.lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lessons" ON public.lessons FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Quiz questions (AI-generated per lesson)
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'open',
  options jsonb,
  correct_answer text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questions" ON public.quiz_questions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questions" ON public.quiz_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Quiz attempts (user answers)
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_answer text NOT NULL,
  is_correct boolean,
  ai_feedback text,
  attempted_at timestamptz DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
