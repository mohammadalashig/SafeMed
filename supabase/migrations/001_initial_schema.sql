-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  medical_conditions TEXT[],
  emergency_contact JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  barcode VARCHAR(50) UNIQUE,
  description TEXT,
  active_ingredients JSONB,
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- FDA Medications table
CREATE TABLE IF NOT EXISTS fda_medications (
  id SERIAL PRIMARY KEY,
  ndc_number VARCHAR(20) UNIQUE,
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  active_ingredients JSONB,
  inactive_ingredients JSONB,
  drug_class TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clinical Interactions table
CREATE TABLE IF NOT EXISTS clinical_interactions (
  id SERIAL PRIMARY KEY,
  medication1_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
  medication2_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
  interaction_type TEXT,
  severity TEXT,
  description TEXT,
  clinical_evidence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Medications table
CREATE TABLE IF NOT EXISTS user_medications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  dosage TEXT,
  frequency TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Drug Allergies table
CREATE TABLE IF NOT EXISTS drug_allergies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  reaction TEXT,
  severity TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medication Reminders table
CREATE TABLE IF NOT EXISTS medication_reminders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_medication_id INTEGER REFERENCES user_medications(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  days_of_week INTEGER[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id INTEGER,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  medication_reminders BOOLEAN DEFAULT true,
  interaction_alerts BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  camera_preference TEXT DEFAULT 'environment',
  scan_sound BOOLEAN DEFAULT true,
  scan_vibration BOOLEAN DEFAULT true,
  auto_scan BOOLEAN DEFAULT true,
  data_sharing BOOLEAN DEFAULT false,
  analytics_tracking BOOLEAN DEFAULT true,
  crash_reporting BOOLEAN DEFAULT true,
  default_units TEXT DEFAULT 'metric',
  show_generic_names BOOLEAN DEFAULT true,
  show_brand_names BOOLEAN DEFAULT true,
  show_prices BOOLEAN DEFAULT true,
  font_size TEXT DEFAULT 'medium',
  high_contrast BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Medications policies
CREATE POLICY "Users can view their own medications"
  ON user_medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON user_medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON user_medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON user_medications FOR DELETE
  USING (auth.uid() = user_id);

-- Drug Allergies policies
CREATE POLICY "Users can view their own allergies"
  ON drug_allergies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own allergies"
  ON drug_allergies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allergies"
  ON drug_allergies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allergies"
  ON drug_allergies FOR DELETE
  USING (auth.uid() = user_id);

-- Medication Reminders policies
CREATE POLICY "Users can view their own reminders"
  ON medication_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON medication_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON medication_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON medication_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- User Settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Audit Logs policies
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for medications and interactions
CREATE POLICY "Anyone can view medications"
  ON medications FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view FDA medications"
  ON fda_medications FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view clinical interactions"
  ON clinical_interactions FOR SELECT
  TO authenticated, anon
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_medications_user_id ON user_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_medications_medication_id ON user_medications(medication_id);
CREATE INDEX IF NOT EXISTS idx_medications_barcode ON medications(barcode);
CREATE INDEX IF NOT EXISTS idx_clinical_interactions_medication1 ON clinical_interactions(medication1_id);
CREATE INDEX IF NOT EXISTS idx_clinical_interactions_medication2 ON clinical_interactions(medication2_id);
CREATE INDEX IF NOT EXISTS idx_drug_allergies_user_id ON drug_allergies(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_user_id ON medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

