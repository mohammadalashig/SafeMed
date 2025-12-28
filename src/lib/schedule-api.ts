// API functions for medication scheduling

import { createClientComponentClient } from './supabase'
import { getScheduleSuggestion } from './medication-schedule'

export interface MedicationReminder {
  id: number
  user_id: string
  user_medication_id: number
  reminder_time: string
  days_of_week: number[]
  is_active: boolean
  created_at: string
}

export async function getMedicationReminders(userId: string, userMedicationId?: number): Promise<MedicationReminder[]> {
  const supabase = createClientComponentClient()
  
  let query = supabase
    .from('medication_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('reminder_time', { ascending: true })
  
  if (userMedicationId) {
    query = query.eq('user_medication_id', userMedicationId)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export async function createMedicationReminder(
  userId: string,
  userMedicationId: number,
  reminderTime: string,
  daysOfWeek: number[],
  isActive: boolean = true
): Promise<MedicationReminder> {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('medication_reminders')
    .insert({
      user_id: userId,
      user_medication_id: userMedicationId,
      reminder_time: reminderTime,
      days_of_week: daysOfWeek,
      is_active: isActive,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateUserMedicationDosage(
  userMedicationId: number,
  dosage: string,
  frequency: string
): Promise<void> {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase
    .from('user_medications')
    .update({
      dosage,
      frequency,
    })
    .eq('id', userMedicationId)
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getAIScheduleSuggestion(medicationName: string): Promise<{
  times: string[]
  days: number[]
  frequency: string
  dosage: string
  notes?: string
}> {
  // Use simple rule-based AI (perfect for graduation project)
  // Returns suggestions based on medication type
  return getScheduleSuggestion(medicationName, '')
}

