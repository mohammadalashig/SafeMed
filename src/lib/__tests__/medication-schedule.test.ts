import { getDosageSuggestion, getScheduleSuggestion } from '../medication-schedule'

describe('Medication Schedule AI Suggestions', () => {
  describe('getDosageSuggestion', () => {
    it('should suggest correct dosage for Paracetamol', () => {
      const suggestion = getDosageSuggestion('Paracetamol')
      
      expect(suggestion.dosage).toBe('500mg')
      expect(suggestion.frequency).toContain('4-6 hours')
      expect(suggestion.timing).toHaveLength(3)
      expect(suggestion.notes).toBeTruthy()
    })

    it('should suggest correct dosage for Ibuprofen', () => {
      const suggestion = getDosageSuggestion('Ibuprofen')
      
      expect(suggestion.dosage).toContain('200-400mg')
      expect(suggestion.frequency).toContain('6-8 hours')
      expect(suggestion.notes).toContain('food')
    })

    it('should suggest correct dosage for blood pressure medication', () => {
      const suggestion = getDosageSuggestion('Lisinopril')
      
      expect(suggestion.frequency).toContain('Once daily')
      expect(suggestion.timing).toHaveLength(1)
    })

    it('should provide default suggestion for unknown medication', () => {
      const suggestion = getDosageSuggestion('Unknown Medication XYZ')
      
      expect(suggestion.dosage).toBeTruthy()
      expect(suggestion.frequency).toBeTruthy()
      expect(suggestion.timing).toHaveLength(2) // Default times
    })

    it('should handle case-insensitive medication names', () => {
      const suggestion1 = getDosageSuggestion('paracetamol')
      const suggestion2 = getDosageSuggestion('PARACETAMOL')
      
      expect(suggestion1.dosage).toBe(suggestion2.dosage)
    })
  })

  describe('getScheduleSuggestion', () => {
    it('should suggest times for once daily frequency', () => {
      const suggestion = getScheduleSuggestion('Lisinopril', 'Once daily')
      
      expect(suggestion.times).toHaveLength(1)
      expect(suggestion.days).toHaveLength(7) // All days
    })

    it('should suggest times for twice daily frequency', () => {
      const suggestion = getScheduleSuggestion('Metformin', 'Twice daily')
      
      expect(suggestion.times.length).toBeGreaterThanOrEqual(1)
      expect(suggestion.days).toHaveLength(7)
    })

    it('should suggest times for three times daily', () => {
      const suggestion = getScheduleSuggestion('Amoxicillin', 'Three times daily')
      
      expect(suggestion.times.length).toBeGreaterThanOrEqual(2)
    })

    it('should include dosage and frequency in suggestion', () => {
      const suggestion = getScheduleSuggestion('Paracetamol', 'Three times daily')
      
      expect(suggestion.dosage).toBeTruthy()
      expect(suggestion.frequency).toBeTruthy()
    })
  })
})

