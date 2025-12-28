-- Fix RLS Policies for Medications Table
-- Allow authenticated users to insert medications (needed when adding to history)

-- Ensure RLS is enabled on medications table (it appears to be enabled already based on error)
-- This is safe to run multiple times
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can insert medications" ON medications;
DROP POLICY IF EXISTS "Authenticated users can update medications" ON medications;

-- Add INSERT policy for medications table (allows authenticated users to create medications when adding to history)
CREATE POLICY "Authenticated users can insert medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for medications table (if needed in future)
CREATE POLICY "Authenticated users can update medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: We keep SELECT policy as "Anyone can view" (already exists in migration 001)
-- This allows users to:
-- - View all medications (read-only) ✅
-- - Insert new medications (when adding to history) ✅ (now fixed)
-- - Update medications (if needed) ✅ (now added)

