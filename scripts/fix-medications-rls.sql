-- Quick Fix for Medications RLS Policy
-- Run this in Supabase SQL Editor to fix the "row-level security policy" error

-- Step 1: Enable RLS on medications table (if not already enabled)
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can insert medications" ON medications;
DROP POLICY IF EXISTS "Authenticated users can update medications" ON medications;

-- Step 3: Create INSERT policy - allows authenticated users to insert medications
CREATE POLICY "Authenticated users can insert medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 4: Create UPDATE policy - allows authenticated users to update medications
CREATE POLICY "Authenticated users can update medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Done! Now authenticated users can insert and update medications.

