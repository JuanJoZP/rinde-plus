-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 7 AND 12),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 7 AND 12),
  display_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content_path TEXT NOT NULL,
  quiz_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz_progress table
CREATE TABLE public.quiz_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, topic_id, completed_at)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for subjects (readable by all authenticated users)
CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for topics (readable by all authenticated users)
CREATE POLICY "Authenticated users can view topics"
  ON public.topics FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for quiz_progress
CREATE POLICY "Users can view their own progress"
  ON public.quiz_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.quiz_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, grade)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'grade')::INTEGER, 9)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample subjects for grade 9
INSERT INTO public.subjects (name, grade, display_order, icon) VALUES
  ('Matemáticas', 9, 1, '📐'),
  ('Ciencias Naturales', 9, 2, '🔬'),
  ('Lenguaje', 9, 3, '📚'),
  ('Historia', 9, 4, '🏛️'),
  ('Inglés', 9, 5, '🌍');

-- Insert sample topics for Matemáticas
INSERT INTO public.topics (subject_id, name, content_path, quiz_path, display_order)
SELECT 
  id,
  'Ecuaciones de Primer Grado',
  'grado_9/matematicas/ecuaciones_primer_grado/contenido.md',
  'grado_9/matematicas/ecuaciones_primer_grado/cuestionario.txt',
  1
FROM public.subjects WHERE name = 'Matemáticas' AND grade = 9;

INSERT INTO public.topics (subject_id, name, content_path, quiz_path, display_order)
SELECT 
  id,
  'Funciones Trigonométricas',
  'grado_9/matematicas/funciones_trigonometricas/contenido.md',
  'grado_9/matematicas/funciones_trigonometricas/cuestionario.txt',
  2
FROM public.subjects WHERE name = 'Matemáticas' AND grade = 9;