-- Seed Medications Database
-- Simple, flat structure - easy to debug and maintain
-- Contains 75 common medications with basic information

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE medications CASCADE;

-- Insert common medications
-- Format: name, barcode (optional), description, active_ingredients (JSON array), dosage_form, strength, manufacturer

INSERT INTO medications (name, barcode, description, active_ingredients, dosage_form, strength, manufacturer) VALUES
-- Pain Relievers & Fever Reducers
('Aspirin', NULL, 'Pain reliever and anti-inflammatory medication', '["Acetylsalicylic Acid"]'::jsonb, 'Tablet', '100mg', 'Bayer'),
('Aspirin', NULL, 'Pain reliever and anti-inflammatory medication', '["Acetylsalicylic Acid"]'::jsonb, 'Tablet', '325mg', 'Bayer'),
('Paracetamol', NULL, 'Pain reliever and fever reducer', '["Paracetamol", "Acetaminophen"]'::jsonb, 'Tablet', '500mg', 'Generic'),
('Ibuprofen', NULL, 'Nonsteroidal anti-inflammatory drug (NSAID)', '["Ibuprofen"]'::jsonb, 'Tablet', '200mg', 'Generic'),
('Ibuprofen', NULL, 'Nonsteroidal anti-inflammatory drug (NSAID)', '["Ibuprofen"]'::jsonb, 'Tablet', '400mg', 'Generic'),
('Acetaminophen', NULL, 'Pain reliever and fever reducer', '["Acetaminophen", "Paracetamol"]'::jsonb, 'Tablet', '500mg', 'Tylenol'),
('Panadol', NULL, 'Paracetamol-based pain reliever', '["Paracetamol"]'::jsonb, 'Tablet', '500mg', 'GlaxoSmithKline'),
('Tylenol', NULL, 'Acetaminophen pain reliever', '["Acetaminophen"]'::jsonb, 'Tablet', '500mg', 'Johnson & Johnson'),
('Advil', NULL, 'Ibuprofen pain reliever', '["Ibuprofen"]'::jsonb, 'Tablet', '200mg', 'Pfizer'),
('Motrin', NULL, 'Ibuprofen pain reliever', '["Ibuprofen"]'::jsonb, 'Tablet', '200mg', 'Johnson & Johnson'),

-- Antibiotics
('Amoxicillin', NULL, 'Penicillin antibiotic', '["Amoxicillin"]'::jsonb, 'Capsule', '250mg', 'Generic'),
('Amoxicillin', NULL, 'Penicillin antibiotic', '["Amoxicillin"]'::jsonb, 'Capsule', '500mg', 'Generic'),
('Penicillin V', NULL, 'Penicillin antibiotic', '["Penicillin V"]'::jsonb, 'Tablet', '250mg', 'Generic'),
('Ciprofloxacin', NULL, 'Fluoroquinolone antibiotic', '["Ciprofloxacin"]'::jsonb, 'Tablet', '250mg', 'Bayer'),
('Azithromycin', NULL, 'Macrolide antibiotic', '["Azithromycin"]'::jsonb, 'Tablet', '250mg', 'Pfizer'),
('Doxycycline', NULL, 'Tetracycline antibiotic', '["Doxycycline"]'::jsonb, 'Capsule', '100mg', 'Generic'),

-- Antihistamines & Allergy
('Loratadine', NULL, 'Antihistamine for allergies', '["Loratadine"]'::jsonb, 'Tablet', '10mg', 'Generic'),
('Cetirizine', NULL, 'Antihistamine for allergies', '["Cetirizine"]'::jsonb, 'Tablet', '10mg', 'Generic'),
('Diphenhydramine', NULL, 'Antihistamine and sleep aid', '["Diphenhydramine"]'::jsonb, 'Tablet', '25mg', 'Generic'),
('Benadryl', NULL, 'Diphenhydramine antihistamine', '["Diphenhydramine"]'::jsonb, 'Tablet', '25mg', 'Johnson & Johnson'),
('Claritin', NULL, 'Loratadine antihistamine', '["Loratadine"]'::jsonb, 'Tablet', '10mg', 'Bayer'),
('Zyrtec', NULL, 'Cetirizine antihistamine', '["Cetirizine"]'::jsonb, 'Tablet', '10mg', 'Johnson & Johnson'),

-- Antacids & Digestive
('Omeprazole', NULL, 'Proton pump inhibitor for acid reflux', '["Omeprazole"]'::jsonb, 'Capsule', '20mg', 'Generic'),
('Ranitidine', NULL, 'H2 blocker for acid reflux', '["Ranitidine"]'::jsonb, 'Tablet', '150mg', 'Generic'),
('Famotidine', NULL, 'H2 blocker for acid reflux', '["Famotidine"]'::jsonb, 'Tablet', '20mg', 'Generic'),
('Calcium Carbonate', NULL, 'Antacid for heartburn', '["Calcium Carbonate"]'::jsonb, 'Tablet', '500mg', 'Generic'),
('Tums', NULL, 'Calcium carbonate antacid', '["Calcium Carbonate"]'::jsonb, 'Tablet', '500mg', 'GlaxoSmithKline'),

-- Blood Pressure & Heart
('Lisinopril', NULL, 'ACE inhibitor for blood pressure', '["Lisinopril"]'::jsonb, 'Tablet', '10mg', 'Generic'),
('Atenolol', NULL, 'Beta blocker for blood pressure', '["Atenolol"]'::jsonb, 'Tablet', '50mg', 'Generic'),
('Metoprolol', NULL, 'Beta blocker for blood pressure', '["Metoprolol"]'::jsonb, 'Tablet', '50mg', 'Generic'),
('Amlodipine', NULL, 'Calcium channel blocker for blood pressure', '["Amlodipine"]'::jsonb, 'Tablet', '5mg', 'Generic'),

-- Cholesterol
('Atorvastatin', NULL, 'Statin for cholesterol', '["Atorvastatin"]'::jsonb, 'Tablet', '20mg', 'Pfizer'),
('Simvastatin', NULL, 'Statin for cholesterol', '["Simvastatin"]'::jsonb, 'Tablet', '20mg', 'Generic'),
('Lipitor', NULL, 'Atorvastatin for cholesterol', '["Atorvastatin"]'::jsonb, 'Tablet', '20mg', 'Pfizer'),

-- Diabetes
('Metformin', NULL, 'Biguanide for type 2 diabetes', '["Metformin"]'::jsonb, 'Tablet', '500mg', 'Generic'),
('Metformin', NULL, 'Biguanide for type 2 diabetes', '["Metformin"]'::jsonb, 'Tablet', '850mg', 'Generic'),
('Insulin Glargine', NULL, 'Long-acting insulin', '["Insulin Glargine"]'::jsonb, 'Injection', '100 units/ml', 'Sanofi'),

-- Mental Health
('Sertraline', NULL, 'SSRI antidepressant', '["Sertraline"]'::jsonb, 'Tablet', '50mg', 'Generic'),
('Fluoxetine', NULL, 'SSRI antidepressant', '["Fluoxetine"]'::jsonb, 'Capsule', '20mg', 'Generic'),
('Citalopram', NULL, 'SSRI antidepressant', '["Citalopram"]'::jsonb, 'Tablet', '20mg', 'Generic'),
('Zoloft', NULL, 'Sertraline antidepressant', '["Sertraline"]'::jsonb, 'Tablet', '50mg', 'Pfizer'),
('Prozac', NULL, 'Fluoxetine antidepressant', '["Fluoxetine"]'::jsonb, 'Capsule', '20mg', 'Eli Lilly'),

-- Sleep & Anxiety
('Melatonin', NULL, 'Natural sleep aid', '["Melatonin"]'::jsonb, 'Tablet', '3mg', 'Generic'),
('Diazepam', NULL, 'Benzodiazepine for anxiety', '["Diazepam"]'::jsonb, 'Tablet', '5mg', 'Generic'),
('Alprazolam', NULL, 'Benzodiazepine for anxiety', '["Alprazolam"]'::jsonb, 'Tablet', '0.5mg', 'Generic'),

-- Cough & Cold
('Dextromethorphan', NULL, 'Cough suppressant', '["Dextromethorphan"]'::jsonb, 'Syrup', '15mg/5ml', 'Generic'),
('Guaifenesin', NULL, 'Expectorant for cough', '["Guaifenesin"]'::jsonb, 'Tablet', '200mg', 'Generic'),
('Pseudoephedrine', NULL, 'Decongestant', '["Pseudoephedrine"]'::jsonb, 'Tablet', '30mg', 'Generic'),

-- Vitamins & Supplements
('Vitamin D3', NULL, 'Vitamin D supplement', '["Cholecalciferol"]'::jsonb, 'Capsule', '1000 IU', 'Generic'),
('Vitamin C', NULL, 'Vitamin C supplement', '["Ascorbic Acid"]'::jsonb, 'Tablet', '500mg', 'Generic'),
('Multivitamin', NULL, 'Daily multivitamin supplement', '["Multiple Vitamins"]'::jsonb, 'Tablet', 'Various', 'Generic'),
('Calcium', NULL, 'Calcium supplement', '["Calcium Carbonate"]'::jsonb, 'Tablet', '500mg', 'Generic'),
('Iron', NULL, 'Iron supplement', '["Ferrous Sulfate"]'::jsonb, 'Tablet', '65mg', 'Generic'),

-- Thyroid
('Levothyroxine', NULL, 'Thyroid hormone replacement', '["Levothyroxine"]'::jsonb, 'Tablet', '50mcg', 'Generic'),
('Synthroid', NULL, 'Levothyroxine for hypothyroidism', '["Levothyroxine"]'::jsonb, 'Tablet', '50mcg', 'AbbVie'),

-- Blood Thinners
('Warfarin', NULL, 'Anticoagulant blood thinner', '["Warfarin"]'::jsonb, 'Tablet', '5mg', 'Generic'),
('Aspirin', NULL, 'Low-dose aspirin for heart protection', '["Acetylsalicylic Acid"]'::jsonb, 'Tablet', '81mg', 'Generic'),

-- Muscle Relaxants
('Cyclobenzaprine', NULL, 'Muscle relaxant', '["Cyclobenzaprine"]'::jsonb, 'Tablet', '10mg', 'Generic'),
('Methocarbamol', NULL, 'Muscle relaxant', '["Methocarbamol"]'::jsonb, 'Tablet', '500mg', 'Generic'),

-- Topical
('Hydrocortisone', NULL, 'Topical corticosteroid', '["Hydrocortisone"]'::jsonb, 'Cream', '1%', 'Generic'),
('Neosporin', NULL, 'Topical antibiotic ointment', '["Neomycin", "Polymyxin B", "Bacitracin"]'::jsonb, 'Ointment', 'Various', 'Johnson & Johnson'),

-- Turkish Market Medications (Common equivalents)
('Parol', NULL, 'Turkish paracetamol brand', '["Paracetamol"]'::jsonb, 'Tablet', '500mg', 'Sanofi'),
('Calpol', NULL, 'Turkish paracetamol brand', '["Paracetamol"]'::jsonb, 'Syrup', '120mg/5ml', 'GlaxoSmithKline'),
('Apranax', NULL, 'Turkish naproxen brand', '["Naproxen"]'::jsonb, 'Tablet', '550mg', 'Abdi Ibrahim'),
('Majezik', NULL, 'Turkish pain reliever', '["Dexketoprofen"]'::jsonb, 'Tablet', '25mg', 'Sanofi'),
('Arveles', NULL, 'Turkish pain reliever', '["Dexketoprofen"]'::jsonb, 'Tablet', '25mg', 'Bilim Ilac'),

-- Additional Common Medications
('Naproxen', NULL, 'NSAID pain reliever', '["Naproxen"]'::jsonb, 'Tablet', '250mg', 'Generic'),
('Naproxen', NULL, 'NSAID pain reliever', '["Naproxen"]'::jsonb, 'Tablet', '500mg', 'Generic'),
('Aleve', NULL, 'Naproxen pain reliever', '["Naproxen"]'::jsonb, 'Tablet', '220mg', 'Bayer'),
('Tramadol', NULL, 'Opioid pain reliever', '["Tramadol"]'::jsonb, 'Capsule', '50mg', 'Generic'),
('Codeine', NULL, 'Opioid pain reliever', '["Codeine"]'::jsonb, 'Tablet', '30mg', 'Generic'),

-- Gastrointestinal
('Loperamide', NULL, 'Antidiarrheal medication', '["Loperamide"]'::jsonb, 'Capsule', '2mg', 'Generic'),
('Imodium', NULL, 'Loperamide antidiarrheal', '["Loperamide"]'::jsonb, 'Capsule', '2mg', 'Johnson & Johnson'),
('Bisacodyl', NULL, 'Laxative', '["Bisacodyl"]'::jsonb, 'Tablet', '5mg', 'Generic'),

-- Eye Drops
('Artificial Tears', NULL, 'Lubricating eye drops', '["Polyethylene Glycol"]'::jsonb, 'Drops', 'Various', 'Generic'),
('Visine', NULL, 'Eye redness relief', '["Tetrahydrozoline"]'::jsonb, 'Drops', '0.05%', 'Johnson & Johnson'),

-- Ear Drops
('Hydrogen Peroxide', NULL, 'Ear wax removal', '["Hydrogen Peroxide"]'::jsonb, 'Drops', '3%', 'Generic'),

-- Skin
('Benzoyl Peroxide', NULL, 'Acne treatment', '["Benzoyl Peroxide"]'::jsonb, 'Gel', '5%', 'Generic'),
('Salicylic Acid', NULL, 'Acne and wart treatment', '["Salicylic Acid"]'::jsonb, 'Gel', '2%', 'Generic');

-- Create index for faster name searches
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_name_lower ON medications(LOWER(name));

-- Add full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_medications_name_trgm ON medications USING gin(name gin_trgm_ops);

-- Note: If you get an error about gin_trgm_ops, you may need to enable the pg_trgm extension:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

