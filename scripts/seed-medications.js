/**
 * Medication Database Seeder
 * Simple, maintainable script to seed medications
 * 
 * Usage: node scripts/seed-medications.js
 * 
 * This script:
 * 1. Reads medication data from a simple JSON file
 * 2. Inserts medications into Supabase
 * 3. Handles errors gracefully
 * 4. Shows progress and results
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Medication data - simple, flat structure
const medications = [
  // Pain Relievers
  { name: 'Aspirin', active_ingredients: ['Acetylsalicylic Acid'], dosage_form: 'Tablet', strength: '100mg', manufacturer: 'Bayer' },
  { name: 'Aspirin', active_ingredients: ['Acetylsalicylic Acid'], dosage_form: 'Tablet', strength: '325mg', manufacturer: 'Bayer' },
  { name: 'Paracetamol', active_ingredients: ['Paracetamol', 'Acetaminophen'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Ibuprofen', active_ingredients: ['Ibuprofen'], dosage_form: 'Tablet', strength: '200mg', manufacturer: 'Generic' },
  { name: 'Ibuprofen', active_ingredients: ['Ibuprofen'], dosage_form: 'Tablet', strength: '400mg', manufacturer: 'Generic' },
  { name: 'Acetaminophen', active_ingredients: ['Acetaminophen', 'Paracetamol'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Tylenol' },
  { name: 'Panadol', active_ingredients: ['Paracetamol'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'GlaxoSmithKline' },
  { name: 'Tylenol', active_ingredients: ['Acetaminophen'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Johnson & Johnson' },
  { name: 'Advil', active_ingredients: ['Ibuprofen'], dosage_form: 'Tablet', strength: '200mg', manufacturer: 'Pfizer' },
  { name: 'Motrin', active_ingredients: ['Ibuprofen'], dosage_form: 'Tablet', strength: '200mg', manufacturer: 'Johnson & Johnson' },
  
  // Antibiotics
  { name: 'Amoxicillin', active_ingredients: ['Amoxicillin'], dosage_form: 'Capsule', strength: '250mg', manufacturer: 'Generic' },
  { name: 'Amoxicillin', active_ingredients: ['Amoxicillin'], dosage_form: 'Capsule', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Penicillin V', active_ingredients: ['Penicillin V'], dosage_form: 'Tablet', strength: '250mg', manufacturer: 'Generic' },
  { name: 'Ciprofloxacin', active_ingredients: ['Ciprofloxacin'], dosage_form: 'Tablet', strength: '250mg', manufacturer: 'Bayer' },
  { name: 'Azithromycin', active_ingredients: ['Azithromycin'], dosage_form: 'Tablet', strength: '250mg', manufacturer: 'Pfizer' },
  { name: 'Doxycycline', active_ingredients: ['Doxycycline'], dosage_form: 'Capsule', strength: '100mg', manufacturer: 'Generic' },
  
  // Antihistamines
  { name: 'Loratadine', active_ingredients: ['Loratadine'], dosage_form: 'Tablet', strength: '10mg', manufacturer: 'Generic' },
  { name: 'Cetirizine', active_ingredients: ['Cetirizine'], dosage_form: 'Tablet', strength: '10mg', manufacturer: 'Generic' },
  { name: 'Diphenhydramine', active_ingredients: ['Diphenhydramine'], dosage_form: 'Tablet', strength: '25mg', manufacturer: 'Generic' },
  { name: 'Benadryl', active_ingredients: ['Diphenhydramine'], dosage_form: 'Tablet', strength: '25mg', manufacturer: 'Johnson & Johnson' },
  { name: 'Claritin', active_ingredients: ['Loratadine'], dosage_form: 'Tablet', strength: '10mg', manufacturer: 'Bayer' },
  { name: 'Zyrtec', active_ingredients: ['Cetirizine'], dosage_form: 'Tablet', strength: '10mg', manufacturer: 'Johnson & Johnson' },
  
  // Antacids
  { name: 'Omeprazole', active_ingredients: ['Omeprazole'], dosage_form: 'Capsule', strength: '20mg', manufacturer: 'Generic' },
  { name: 'Ranitidine', active_ingredients: ['Ranitidine'], dosage_form: 'Tablet', strength: '150mg', manufacturer: 'Generic' },
  { name: 'Famotidine', active_ingredients: ['Famotidine'], dosage_form: 'Tablet', strength: '20mg', manufacturer: 'Generic' },
  { name: 'Calcium Carbonate', active_ingredients: ['Calcium Carbonate'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Tums', active_ingredients: ['Calcium Carbonate'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'GlaxoSmithKline' },
  
  // Blood Pressure
  { name: 'Lisinopril', active_ingredients: ['Lisinopril'], dosage_form: 'Tablet', strength: '10mg', manufacturer: 'Generic' },
  { name: 'Atenolol', active_ingredients: ['Atenolol'], dosage_form: 'Tablet', strength: '50mg', manufacturer: 'Generic' },
  { name: 'Metoprolol', active_ingredients: ['Metoprolol'], dosage_form: 'Tablet', strength: '50mg', manufacturer: 'Generic' },
  { name: 'Amlodipine', active_ingredients: ['Amlodipine'], dosage_form: 'Tablet', strength: '5mg', manufacturer: 'Generic' },
  
  // Cholesterol
  { name: 'Atorvastatin', active_ingredients: ['Atorvastatin'], dosage_form: 'Tablet', strength: '20mg', manufacturer: 'Pfizer' },
  { name: 'Simvastatin', active_ingredients: ['Simvastatin'], dosage_form: 'Tablet', strength: '20mg', manufacturer: 'Generic' },
  { name: 'Lipitor', active_ingredients: ['Atorvastatin'], dosage_form: 'Tablet', strength: '20mg', manufacturer: 'Pfizer' },
  
  // Diabetes
  { name: 'Metformin', active_ingredients: ['Metformin'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Metformin', active_ingredients: ['Metformin'], dosage_form: 'Tablet', strength: '850mg', manufacturer: 'Generic' },
  
  // Mental Health
  { name: 'Sertraline', active_ingredients: ['Sertraline'], dosage_form: 'Tablet', strength: '50mg', manufacturer: 'Generic' },
  { name: 'Fluoxetine', active_ingredients: ['Fluoxetine'], dosage_form: 'Capsule', strength: '20mg', manufacturer: 'Generic' },
  { name: 'Citalopram', active_ingredients: ['Citalopram'], dosage_form: 'Tablet', strength: '20mg', manufacturer: 'Generic' },
  { name: 'Zoloft', active_ingredients: ['Sertraline'], dosage_form: 'Tablet', strength: '50mg', manufacturer: 'Pfizer' },
  { name: 'Prozac', active_ingredients: ['Fluoxetine'], dosage_form: 'Capsule', strength: '20mg', manufacturer: 'Eli Lilly' },
  
  // Sleep & Anxiety
  { name: 'Melatonin', active_ingredients: ['Melatonin'], dosage_form: 'Tablet', strength: '3mg', manufacturer: 'Generic' },
  { name: 'Diazepam', active_ingredients: ['Diazepam'], dosage_form: 'Tablet', strength: '5mg', manufacturer: 'Generic' },
  { name: 'Alprazolam', active_ingredients: ['Alprazolam'], dosage_form: 'Tablet', strength: '0.5mg', manufacturer: 'Generic' },
  
  // Cough & Cold
  { name: 'Dextromethorphan', active_ingredients: ['Dextromethorphan'], dosage_form: 'Syrup', strength: '15mg/5ml', manufacturer: 'Generic' },
  { name: 'Guaifenesin', active_ingredients: ['Guaifenesin'], dosage_form: 'Tablet', strength: '200mg', manufacturer: 'Generic' },
  { name: 'Pseudoephedrine', active_ingredients: ['Pseudoephedrine'], dosage_form: 'Tablet', strength: '30mg', manufacturer: 'Generic' },
  
  // Vitamins
  { name: 'Vitamin D3', active_ingredients: ['Cholecalciferol'], dosage_form: 'Capsule', strength: '1000 IU', manufacturer: 'Generic' },
  { name: 'Vitamin C', active_ingredients: ['Ascorbic Acid'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Multivitamin', active_ingredients: ['Multiple Vitamins'], dosage_form: 'Tablet', strength: 'Various', manufacturer: 'Generic' },
  { name: 'Calcium', active_ingredients: ['Calcium Carbonate'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Iron', active_ingredients: ['Ferrous Sulfate'], dosage_form: 'Tablet', strength: '65mg', manufacturer: 'Generic' },
  
  // Thyroid
  { name: 'Levothyroxine', active_ingredients: ['Levothyroxine'], dosage_form: 'Tablet', strength: '50mcg', manufacturer: 'Generic' },
  { name: 'Synthroid', active_ingredients: ['Levothyroxine'], dosage_form: 'Tablet', strength: '50mcg', manufacturer: 'AbbVie' },
  
  // Blood Thinners
  { name: 'Warfarin', active_ingredients: ['Warfarin'], dosage_form: 'Tablet', strength: '5mg', manufacturer: 'Generic' },
  { name: 'Aspirin', active_ingredients: ['Acetylsalicylic Acid'], dosage_form: 'Tablet', strength: '81mg', manufacturer: 'Generic', description: 'Low-dose aspirin for heart protection' },
  
  // Muscle Relaxants
  { name: 'Cyclobenzaprine', active_ingredients: ['Cyclobenzaprine'], dosage_form: 'Tablet', strength: '10mg', manufacturer: 'Generic' },
  { name: 'Methocarbamol', active_ingredients: ['Methocarbamol'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  
  // Topical
  { name: 'Hydrocortisone', active_ingredients: ['Hydrocortisone'], dosage_form: 'Cream', strength: '1%', manufacturer: 'Generic' },
  { name: 'Neosporin', active_ingredients: ['Neomycin', 'Polymyxin B', 'Bacitracin'], dosage_form: 'Ointment', strength: 'Various', manufacturer: 'Johnson & Johnson' },
  
  // Turkish Market Medications
  { name: 'Parol', active_ingredients: ['Paracetamol'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Sanofi', description: 'Turkish paracetamol brand' },
  { name: 'Calpol', active_ingredients: ['Paracetamol'], dosage_form: 'Syrup', strength: '120mg/5ml', manufacturer: 'GlaxoSmithKline', description: 'Turkish paracetamol brand' },
  { name: 'Apranax', active_ingredients: ['Naproxen'], dosage_form: 'Tablet', strength: '550mg', manufacturer: 'Abdi Ibrahim', description: 'Turkish naproxen brand' },
  { name: 'Majezik', active_ingredients: ['Dexketoprofen'], dosage_form: 'Tablet', strength: '25mg', manufacturer: 'Sanofi', description: 'Turkish pain reliever' },
  { name: 'Arveles', active_ingredients: ['Dexketoprofen'], dosage_form: 'Tablet', strength: '25mg', manufacturer: 'Bilim Ilac', description: 'Turkish pain reliever' },
  
  // Additional Common
  { name: 'Naproxen', active_ingredients: ['Naproxen'], dosage_form: 'Tablet', strength: '250mg', manufacturer: 'Generic' },
  { name: 'Naproxen', active_ingredients: ['Naproxen'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Aleve', active_ingredients: ['Naproxen'], dosage_form: 'Tablet', strength: '220mg', manufacturer: 'Bayer' },
  { name: 'Tramadol', active_ingredients: ['Tramadol'], dosage_form: 'Capsule', strength: '50mg', manufacturer: 'Generic' },
  { name: 'Codeine', active_ingredients: ['Codeine'], dosage_form: 'Tablet', strength: '30mg', manufacturer: 'Generic' },
  
  // Gastrointestinal
  { name: 'Loperamide', active_ingredients: ['Loperamide'], dosage_form: 'Capsule', strength: '2mg', manufacturer: 'Generic' },
  { name: 'Imodium', active_ingredients: ['Loperamide'], dosage_form: 'Capsule', strength: '2mg', manufacturer: 'Johnson & Johnson' },
  { name: 'Bisacodyl', active_ingredients: ['Bisacodyl'], dosage_form: 'Tablet', strength: '5mg', manufacturer: 'Generic' },
  
  // Eye & Ear
  { name: 'Artificial Tears', active_ingredients: ['Polyethylene Glycol'], dosage_form: 'Drops', strength: 'Various', manufacturer: 'Generic' },
  { name: 'Visine', active_ingredients: ['Tetrahydrozoline'], dosage_form: 'Drops', strength: '0.05%', manufacturer: 'Johnson & Johnson' },
  { name: 'Hydrogen Peroxide', active_ingredients: ['Hydrogen Peroxide'], dosage_form: 'Drops', strength: '3%', manufacturer: 'Generic', description: 'Ear wax removal' },
  
  // Skin
  { name: 'Benzoyl Peroxide', active_ingredients: ['Benzoyl Peroxide'], dosage_form: 'Gel', strength: '5%', manufacturer: 'Generic', description: 'Acne treatment' },
  { name: 'Salicylic Acid', active_ingredients: ['Salicylic Acid'], dosage_form: 'Gel', strength: '2%', manufacturer: 'Generic', description: 'Acne and wart treatment' },
]

async function seedMedications() {
  console.log('🌱 Starting medication database seeding...\n')
  console.log(`📊 Total medications to insert: ${medications.length}\n`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  // Insert medications in batches of 10 for better error handling
  const batchSize = 10
  for (let i = 0; i < medications.length; i += batchSize) {
    const batch = medications.slice(i, i + batchSize)
    
    try {
      // Prepare batch data
      const batchData = batch.map(med => ({
        name: med.name,
        barcode: med.barcode || null,
        description: med.description || null,
        active_ingredients: med.active_ingredients,
        dosage_form: med.dosage_form || null,
        strength: med.strength || null,
        manufacturer: med.manufacturer || null,
        image_url: null,
      }))

      // Insert batch
      const { data, error } = await supabase
        .from('medications')
        .insert(batchData)
        .select()

      if (error) {
        // Handle individual errors in batch
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        errorCount += batch.length
        errors.push({ batch: i, error: error.message })
      } else {
        successCount += data.length
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data.length} medications`)
      }
    } catch (err) {
      console.error(`❌ Unexpected error in batch ${Math.floor(i / batchSize) + 1}:`, err.message)
      errorCount += batch.length
      errors.push({ batch: i, error: err.message })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📈 Seeding Summary:')
  console.log(`✅ Successfully inserted: ${successCount} medications`)
  console.log(`❌ Failed: ${errorCount} medications`)
  console.log(`📊 Total processed: ${medications.length} medications`)
  console.log('='.repeat(50))

  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:')
    errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. Batch ${err.batch}: ${err.error}`)
    })
    console.log('\n💡 Tip: Some medications may already exist in the database.')
    console.log('   This is normal - duplicates are prevented by unique constraints.')
  }

  if (successCount > 0) {
    console.log('\n✨ Database seeding completed successfully!')
    console.log(`   You now have ${successCount} medications in your database.`)
  }
}

// Run the seeder
seedMedications()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

