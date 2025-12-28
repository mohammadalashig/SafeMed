// Medication scheduling utilities with AI-powered suggestions

export interface DosageSuggestion {
  dosage: string
  frequency: string
  timing: string[]
  notes?: string
}

export interface ScheduleSuggestion {
  times: string[] // Times in HH:MM format
  days: number[] // Days of week (0=Sunday, 6=Saturday)
  frequency: string
  dosage: string
  notes?: string
}

// Simple rule-based AI suggestions (perfect for graduation project)
// Uses medication type/name to suggest common dosages
export function getDosageSuggestion(medicationName: string, medicationType?: string): DosageSuggestion {
  const name = medicationName.toLowerCase()
  
  // Pain relievers
  if (name.includes('paracetamol') || name.includes('acetaminophen') || name.includes('panadol') || name.includes('tylenol')) {
    return {
      dosage: '500mg',
      frequency: 'Every 4-6 hours as needed',
      timing: ['08:00', '14:00', '20:00'],
      notes: 'Maximum 4 doses per day. Take with food if stomach upset occurs.'
    }
  }
  
  if (name.includes('ibuprofen') || name.includes('advil') || name.includes('motrin')) {
    return {
      dosage: '200-400mg',
      frequency: 'Every 6-8 hours as needed',
      timing: ['08:00', '14:00', '20:00'],
      notes: 'Take with food or milk to reduce stomach irritation. Maximum 3 doses per day.'
    }
  }
  
  if (name.includes('aspirin')) {
    return {
      dosage: '100-325mg',
      frequency: 'Once daily or as directed',
      timing: ['08:00'],
      notes: 'Low-dose aspirin (81mg) for heart protection. Take with food.'
    }
  }
  
  // Antibiotics
  if (name.includes('amoxicillin')) {
    return {
      dosage: '250-500mg',
      frequency: 'Three times daily',
      timing: ['08:00', '14:00', '20:00'],
      notes: 'Take with food. Complete full course even if you feel better.'
    }
  }
  
  // Blood pressure
  if (name.includes('lisinopril')) {
    return {
      dosage: '10mg',
      frequency: 'Once daily',
      timing: ['09:00'],
      notes: 'Take at the same time each day. May cause dizziness initially.'
    }
  }
  
  // Diabetes
  if (name.includes('metformin')) {
    return {
      dosage: '500-850mg',
      frequency: 'Twice daily with meals',
      timing: ['08:00', '20:00'],
      notes: 'Take with meals to reduce stomach upset. Start with lower dose.'
    }
  }
  
  // Cholesterol
  if (name.includes('atorvastatin') || name.includes('simvastatin') || name.includes('lipitor')) {
    return {
      dosage: '10-20mg',
      frequency: 'Once daily',
      timing: ['20:00'],
      notes: 'Best taken in the evening. May take 2-4 weeks to show effects.'
    }
  }
  
  // Antihistamines
  if (name.includes('loratadine') || name.includes('cetirizine') || name.includes('claritin') || name.includes('zyrtec')) {
    return {
      dosage: '10mg',
      frequency: 'Once daily',
      timing: ['08:00'],
      notes: 'Non-drowsy antihistamine. Take with or without food.'
    }
  }
  
  // Vitamins
  if (name.includes('vitamin d') || name.includes('vitamin d3')) {
    return {
      dosage: '1000-2000 IU',
      frequency: 'Once daily',
      timing: ['09:00'],
      notes: 'Best taken with food containing fat for better absorption.'
    }
  }
  
  if (name.includes('vitamin c')) {
    return {
      dosage: '500-1000mg',
      frequency: 'Once daily',
      timing: ['08:00'],
      notes: 'Take with water. May cause mild stomach upset if taken on empty stomach.'
    }
  }
  
  // Default suggestion for unknown medications
  return {
    dosage: 'As directed by doctor',
    frequency: 'Follow prescription instructions',
    timing: ['09:00', '21:00'],
    notes: 'Please consult your doctor or pharmacist for specific dosage instructions.'
  }
}

// Suggest schedule times based on frequency
export function getScheduleSuggestion(
  medicationName: string,
  frequency: string
): ScheduleSuggestion {
  const suggestion = getDosageSuggestion(medicationName)
  
  let times: string[] = []
  const days = [0, 1, 2, 3, 4, 5, 6] // All days by default
  
  // Normalize frequency to lowercase for case-insensitive matching
  const normalizedFrequency = frequency.toLowerCase()
  
  if (normalizedFrequency.includes('once daily') || normalizedFrequency.includes('once a day')) {
    times = [suggestion.timing[0] || '09:00']
  } else if (normalizedFrequency.includes('twice daily') || normalizedFrequency.includes('twice a day') || normalizedFrequency.includes('2 times')) {
    times = [suggestion.timing[0] || '09:00', suggestion.timing[2] || '21:00']
  } else if (normalizedFrequency.includes('three times') || normalizedFrequency.includes('3 times')) {
    times = suggestion.timing.length >= 3 ? suggestion.timing : ['08:00', '14:00', '20:00']
  } else if (normalizedFrequency.includes('every 4') || normalizedFrequency.includes('4 hours')) {
    times = ['08:00', '12:00', '16:00', '20:00']
  } else if (normalizedFrequency.includes('every 6') || normalizedFrequency.includes('6 hours')) {
    times = ['08:00', '14:00', '20:00']
  } else {
    // Default to twice daily
    times = ['09:00', '21:00']
  }
  
  return {
    times,
    days,
    frequency: suggestion.frequency,
    dosage: suggestion.dosage,
    notes: suggestion.notes
  }
}

