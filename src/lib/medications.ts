import { createClientComponentClient } from './supabase'

export interface Medication {
  id: number
  name: string
  barcode: string | null
  description: string | null
  active_ingredients: any
  dosage_form: string | null
  strength: string | null
  manufacturer: string | null
  image_url: string | null
  created_at: string
}

export interface UserMedication {
  id: number
  user_id: string
  medication_id: number
  start_date: string | null
  end_date: string | null
  dosage: string | null
  frequency: string | null
  is_active: boolean
  created_at: string
  medication?: Medication
}

export async function getMedicationByBarcode(barcode: string): Promise<Medication | null> {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

  // 404 and 406 errors are expected when medication is not found - return null
  if (error) {
    // Log only unexpected errors (not 404/406)
    if (error.code !== 'PGRST116' && error.code !== '406') {
      console.warn('Unexpected error fetching medication:', error)
    }
    return null
  }

  return data || null
}

export async function getUserMedications(userId: string): Promise<UserMedication[]> {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('user_medications')
    .select('*, medication:medications(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function addUserMedication(
  userId: string,
  medicationId: number,
  dosage?: string,
  frequency?: string
): Promise<UserMedication> {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('user_medications')
    .insert({
      user_id: userId,
      medication_id: medicationId,
      dosage,
      frequency,
      is_active: true,
    })
    .select('*, medication:medications(*)')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function removeUserMedication(userMedicationId: number): Promise<void> {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('user_medications')
    .delete()
    .eq('id', userMedicationId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function searchMedicationsByName(searchQuery: string, limit: number = 10): Promise<Medication[]> {
  const supabase = createClientComponentClient()
  
  if (!searchQuery || searchQuery.trim().length < 2) {
    return []
  }

  const query = searchQuery.trim()

  // Search in medications table - use ilike for case-insensitive partial matching
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .or(`name.ilike.%${query}%,manufacturer.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.warn('Error searching medications:', error)
    return []
  }

  return data || []
}

export async function checkDrugInteractions(medicationIds: number[]): Promise<any[]> {
  const supabase = createClientComponentClient()
  
  if (medicationIds.length < 2) {
    return []
  }

  const { data, error } = await supabase
    .from('clinical_interactions')
    .select('*')
    .in('medication1_id', medicationIds)
    .in('medication2_id', medicationIds)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

