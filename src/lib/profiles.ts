import { createClientComponentClient } from './supabase'

export interface Profile {
  id: string
  full_name: string | null
  date_of_birth: string | null
  medical_conditions: string[] | null
  emergency_contact: {
    name?: string
    phone?: string
    relationship?: string
  } | null
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist, return null
      return null
    }
    throw new Error(error.message)
  }

  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<Profile> {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createProfile(
  userId: string,
  profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<Profile> {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

