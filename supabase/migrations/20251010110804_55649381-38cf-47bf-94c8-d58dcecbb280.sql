-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  education_level TEXT,
  interests TEXT[],
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create colleges table
CREATE TABLE public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'engineering', 'medical', 'arts', etc.
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  fees_per_year NUMERIC,
  ranking INTEGER,
  admission_criteria TEXT,
  contact_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scholarships table
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  eligibility_criteria TEXT NOT NULL,
  deadline DATE NOT NULL,
  application_link TEXT,
  category TEXT NOT NULL, -- 'merit', 'need-based', 'minority', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career_paths table
CREATE TABLE public.career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_education TEXT NOT NULL,
  average_salary NUMERIC,
  job_outlook TEXT,
  skills_required TEXT[],
  related_courses TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_progress table (for quest system)
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_type TEXT NOT NULL, -- 'profile', 'scholarship', 'college_research', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  points INTEGER DEFAULT 0,
  metadata JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_type)
);

-- Create user_saved_items table (for bookmarks)
CREATE TABLE public.user_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL, -- 'college', 'scholarship', 'career'
  item_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for colleges (public read)
CREATE POLICY "Anyone can view colleges"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for scholarships (public read)
CREATE POLICY "Anyone can view active scholarships"
  ON public.scholarships FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for career_paths (public read)
CREATE POLICY "Anyone can view career paths"
  ON public.career_paths FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_saved_items
CREATE POLICY "Users can view their own saved items"
  ON public.user_saved_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items"
  ON public.user_saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items"
  ON public.user_saved_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_conversations
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_progress
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX idx_scholarships_category ON public.scholarships(category);
CREATE INDEX idx_colleges_type ON public.colleges(type);
CREATE INDEX idx_colleges_state ON public.colleges(state);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_saved_items_user_id ON public.user_saved_items(user_id);

-- Insert sample colleges
INSERT INTO public.colleges (name, type, location, state, fees_per_year, ranking, admission_criteria) VALUES
('IIT Delhi', 'engineering', 'New Delhi', 'Delhi', 200000, 1, 'JEE Advanced, rank-based admission'),
('AIIMS Delhi', 'medical', 'New Delhi', 'Delhi', 25000, 1, 'NEET score 650+, counseling-based'),
('NIT Trichy', 'engineering', 'Tiruchirappalli', 'Tamil Nadu', 150000, 2, 'JEE Main rank-based admission'),
('JIPMER Puducherry', 'medical', 'Puducherry', 'Puducherry', 30000, 2, 'NEET score 640+, merit-based'),
('IIT Bombay', 'engineering', 'Mumbai', 'Maharashtra', 200000, 1, 'JEE Advanced, top ranks only');

-- Insert sample scholarships
INSERT INTO public.scholarships (title, description, amount, eligibility_criteria, deadline, category, application_link) VALUES
('National Merit Scholarship', 'Merit-based scholarship for students with exceptional academic performance', 50000, '90%+ marks in 12th grade, family income less than ₹8 lakh', '2026-03-31', 'merit', 'https://scholarships.gov.in'),
('SC/ST Pre-Matric Scholarship', 'Financial assistance for SC/ST students', 25000, 'SC/ST category, family income less than ₹2.5 lakh', '2025-12-31', 'minority', 'https://scholarships.gov.in'),
('Central Sector Scholarship Scheme', 'Need-based scholarship for economically weaker students', 100000, 'Family income less than ₹4.5 lakh, 80%+ in 12th', '2026-03-15', 'need-based', 'https://scholarships.gov.in'),
('Begum Hazrat Mahal Scholarship', 'Scholarship for minority girl students', 60000, 'Minority community, girl students, 50%+ marks', '2026-02-28', 'minority', 'https://scholarships.gov.in');

-- Insert sample career paths
INSERT INTO public.career_paths (title, description, required_education, average_salary, job_outlook, skills_required, related_courses) VALUES
('Software Engineer', 'Design and develop software applications and systems', 'B.Tech/B.E. in Computer Science or related field', 800000, 'Excellent growth, high demand in tech industry', ARRAY['Programming', 'Problem Solving', 'Data Structures', 'Algorithms'], ARRAY['Computer Science', 'Information Technology']),
('Doctor', 'Diagnose and treat patients in various medical specialties', 'MBBS + MD/MS specialization', 1200000, 'Stable demand, respect in society', ARRAY['Medical Knowledge', 'Empathy', 'Decision Making', 'Communication'], ARRAY['Medicine', 'Surgery', 'Pediatrics']),
('Civil Services Officer', 'Administrative roles in government at various levels', 'Any bachelor degree + UPSC exam', 900000, 'Prestigious, job security, opportunity to serve nation', ARRAY['Leadership', 'Policy Making', 'Communication', 'Problem Solving'], ARRAY['Public Administration', 'Political Science', 'Economics']),
('Data Scientist', 'Analyze complex data to help organizations make decisions', 'B.Tech/M.Tech in CS/Stats or related field', 1000000, 'Rapidly growing field with high demand', ARRAY['Statistics', 'Machine Learning', 'Programming', 'Data Visualization'], ARRAY['Computer Science', 'Statistics', 'Mathematics']);
