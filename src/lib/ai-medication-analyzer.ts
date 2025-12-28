export interface MedicationAnalysis {
  scanned_medication: {
    name: string
    barcode: string
    active_ingredients: string[]
    chemical_formulas: string[]
  }
  turkish_equivalents: {
    exact_matches: Array<{
      medication: {
        ticari_adi: string
        etken_madde: string
        firma: string
        fiyat_sgk: number
        fiyat_eczane: number
        recete_tipi: 'Yeşil' | 'Kırmızı' | 'Mor' | 'Turuncu'
        bulunabilirlik: string[]
      }
      similarity_score: number
    }>
    similar_formulations: Array<{
      medication: {
        ticari_adi: string
        etken_madde: string
        firma: string
        fiyat_sgk: number
        fiyat_eczane: number
        recete_tipi: 'Yeşil' | 'Kırmızı' | 'Mor' | 'Turuncu'
        bulunabilirlik: string[]
      }
      similarity_score: number
    }>
  }
}

export async function analyzeMedication(barcode: string, medicationName?: string): Promise<MedicationAnalysis> {
  const response = await fetch('/api/analyze-medication', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ barcode, medicationName }),
  })

  if (!response.ok) {
    // Try to extract error message from response
    let errorMessage = 'Failed to analyze medication'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
      if (errorData.details && process.env.NODE_ENV === 'development') {
        console.error('API error details:', errorData.details)
      }
    } catch (e) {
      // If response isn't JSON, use status text
      errorMessage = response.statusText || errorMessage
    }
    
    console.error('AI analysis failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
    })
    
    throw new Error(errorMessage)
  }

  return response.json()
}

