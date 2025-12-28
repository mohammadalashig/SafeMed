import { NextRequest, NextResponse } from 'next/server'
import type { MedicationAnalysis } from '@/lib/ai-medication-analyzer'
import { rateLimit, getUserIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { getAuthenticatedUser } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - apply BEFORE processing the request
    const user = await getAuthenticatedUser(request)
    const identifier = user 
      ? `user:${user.id}` 
      : getUserIdentifier(request)

    const rateLimitResult = await rateLimit({
      identifier,
      ...RATE_LIMITS.AI_ANALYSIS,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitResult.error || 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.AI_ANALYSIS.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
          },
        }
      )
    }

    const { barcode, medicationName } = await request.json()

    if (!barcode && !medicationName) {
      return NextResponse.json(
        { error: 'Barcode or medication name is required' },
        { status: 400 }
      )
    }

    console.log('Analyzing medication:', { barcode, medicationName, userId: user?.id || 'anonymous' })

    // Check which AI provider is available
    const openaiKey = process.env.OPENAI_API_KEY
    const googleKey = process.env.GOOGLE_AI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !googleKey && !anthropicKey) {
      console.error('No AI provider configured')
      return NextResponse.json(
        { error: 'No AI provider configured. Please set OPENAI_API_KEY, GOOGLE_AI_API_KEY, or ANTHROPIC_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    let aiResponse: MedicationAnalysis

    // Try OpenAI first, then Google, then Anthropic
    if (openaiKey) {
      console.log('Using OpenAI for analysis')
      aiResponse = await analyzeWithOpenAI(barcode, medicationName, openaiKey)
    } else if (googleKey) {
      console.log('Using Google AI for analysis')
      aiResponse = await analyzeWithGoogle(barcode, medicationName, googleKey)
    } else if (anthropicKey) {
      console.log('Using Anthropic for analysis')
      aiResponse = await analyzeWithAnthropic(barcode, medicationName, anthropicKey)
    } else {
      return NextResponse.json(
        { error: 'No AI provider configured' },
        { status: 500 }
      )
    }

    console.log('Analysis complete:', { hasMatches: aiResponse.turkish_equivalents.exact_matches.length > 0 })
    
    // Return response with rate limit headers
    return NextResponse.json(aiResponse, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.AI_ANALYSIS.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error analyzing medication:', {
      message: error.message,
      stack: error.stack,
      error,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze medication',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

async function analyzeWithOpenAI(barcode: string, medicationName: string | undefined, apiKey: string): Promise<MedicationAnalysis> {
  const prompt = `You are a medical expert specializing in medication analysis and Turkish pharmaceutical market knowledge.

Analyze this medication barcode and identify the medication. If you recognize the barcode or can identify the medication, provide detailed information including Turkish equivalents.

Barcode: ${barcode}
${medicationName ? `Known Name: ${medicationName}` : 'Name: Unknown (identify from barcode if possible)'}

Important: If this is a common medication like Panadol (Paracetamol/Acetaminophen), provide accurate information about Turkish equivalents.

CRITICAL PRICING REQUIREMENT - TURKISH LIRA (TL/₺) ONLY:
All prices must be in Turkish Lira (TL) as of December 2025. Use realistic market prices:
- Common OTC medications (Paracetamol, Ibuprofen, Aspirin): Pharmacy prices typically 25-50 TL, SGK prices 15-35 TL
- Prescription medications: Pharmacy prices typically 50-500+ TL depending on medication type, SGK prices 30-70% of pharmacy price
- Antibiotics: Pharmacy prices typically 40-150 TL, SGK prices 20-100 TL
- Chronic medications: Pharmacy prices vary widely, SGK typically covers 50-80% of cost
- Do NOT use unrealistic prices like 8.5 TL for Paracetamol - this is too low. Realistic Paracetamol prices are 25-45 TL in pharmacies, 15-30 TL with SGK coverage
- Always provide prices that reflect actual Turkish pharmaceutical market conditions in December 2025
- fiyat_sgk = SGK reimbursement price in TL (what patient pays with insurance)
- fiyat_eczane = Full pharmacy retail price in TL (without insurance)

Provide a JSON response with this structure:
{
  "scanned_medication": {
    "name": "medication name",
    "barcode": "${barcode}",
    "active_ingredients": ["ingredient1", "ingredient2"],
    "chemical_formulas": ["formula1", "formula2"]
  },
  "turkish_equivalents": {
    "exact_matches": [{
      "medication": {
        "ticari_adi": "Turkish brand name",
        "etken_madde": "active ingredient",
        "firma": "manufacturer",
        "fiyat_sgk": <realistic SGK price in Turkish Lira, typically 30-70% of pharmacy price>,
        "fiyat_eczane": <realistic pharmacy retail price in Turkish Lira - OTC: 25-50 TL, Prescription: 50-500+ TL>,
        "recete_tipi": "Yeşil",
        "bulunabilirlik": ["pharmacy1", "pharmacy2"]
      },
      "similarity_score": 0.95
    }],
    "similar_formulations": []
  }
}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Use gpt-4o-mini which is more available and cost-effective
      messages: [
        {
          role: 'system',
          content: 'You are a medical expert specializing in medication analysis and Turkish pharmaceutical market knowledge. Always respond with valid JSON. When providing pricing information, use realistic current December 2025 market prices in Turkish Lira (TL) from Turkey. Common OTC medications like Paracetamol should be priced 25-45 TL (pharmacy) and 15-30 TL (SGK), NOT unrealistically low prices like 8.5 TL. Prescription medications vary but are typically 50-500+ TL. Always use realistic, market-accurate prices in Turkish Lira.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    console.error('OpenAI API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    })
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText} (Status: ${response.status})`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from OpenAI API')
  }

  try {
    const content = data.choices[0].message.content
    const parsed = JSON.parse(content)
    return parsed
  } catch (parseError: any) {
    console.error('Failed to parse OpenAI response:', {
      content: data.choices[0].message.content,
      error: parseError,
    })
    throw new Error(`Failed to parse AI response: ${parseError.message}`)
  }
}

async function analyzeWithGoogle(barcode: string, medicationName: string | undefined, apiKey: string): Promise<MedicationAnalysis> {
  const prompt = `You are a medical expert specializing in medication analysis and Turkish pharmaceutical market knowledge.

Analyze this medication barcode and identify the medication. If you recognize the barcode or can identify the medication (e.g., Panadol/Paracetamol), provide detailed information including Turkish equivalents, pricing, and availability.

Barcode: ${barcode}
${medicationName ? `Known Name: ${medicationName}` : 'Name: Unknown (identify from barcode if possible)'}

CRITICAL PRICING REQUIREMENT - TURKISH LIRA (TL/₺) ONLY:
All prices must be in Turkish Lira (TL) as of December 2025. Use realistic market prices:
- Common OTC medications (Paracetamol, Ibuprofen, Aspirin): Pharmacy prices typically 25-50 TL, SGK prices 15-35 TL
- Prescription medications: Pharmacy prices typically 50-500+ TL depending on medication type, SGK prices 30-70% of pharmacy price
- Antibiotics: Pharmacy prices typically 40-150 TL, SGK prices 20-100 TL
- Do NOT use unrealistic prices like 8.5 TL for Paracetamol - this is too low. Realistic Paracetamol prices are 25-45 TL in pharmacies, 15-30 TL with SGK coverage
- Always provide prices that reflect actual Turkish pharmaceutical market conditions in December 2025
- fiyat_sgk = SGK reimbursement price in TL (what patient pays with insurance)
- fiyat_eczane = Full pharmacy retail price in TL (without insurance)

Provide a JSON response with medication analysis including Turkish equivalents, current December 2025 pricing, and availability. The response must follow this structure:
{
  "scanned_medication": {
    "name": "medication name",
    "barcode": "${barcode}",
    "active_ingredients": ["ingredient1", "ingredient2"],
    "chemical_formulas": ["formula1", "formula2"]
  },
  "turkish_equivalents": {
    "exact_matches": [{
      "medication": {
        "ticari_adi": "Turkish brand name",
        "etken_madde": "active ingredient",
        "firma": "manufacturer",
        "fiyat_sgk": <realistic SGK price in Turkish Lira, typically 30-70% of pharmacy price>,
        "fiyat_eczane": <realistic pharmacy retail price in Turkish Lira - OTC: 25-50 TL, Prescription: 50-500+ TL>,
        "recete_tipi": "Yeşil" | "Kırmızı" | "Mor" | "Turuncu",
        "bulunabilirlik": ["pharmacy1", "pharmacy2"]
      },
      "similarity_score": 0.95
    }],
    "similar_formulations": []
  }
}`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
    }),
  })

  if (!response.ok) {
    throw new Error('Google AI API error')
  }

  const data = await response.json()
  const content = data.candidates[0].content.parts[0].text
  return JSON.parse(content)
}

async function analyzeWithAnthropic(barcode: string, medicationName: string | undefined, apiKey: string): Promise<MedicationAnalysis> {
  const prompt = `You are a medical expert specializing in medication analysis and Turkish pharmaceutical market knowledge.

Analyze this medication barcode and identify the medication. If you recognize the barcode or can identify the medication (e.g., Panadol/Paracetamol), provide detailed information including Turkish equivalents, pricing, and availability.

Barcode: ${barcode}
${medicationName ? `Known Name: ${medicationName}` : 'Name: Unknown (identify from barcode if possible)'}

CRITICAL PRICING REQUIREMENT - TURKISH LIRA (TL/₺) ONLY:
All prices must be in Turkish Lira (TL) as of December 2025. Use realistic market prices:
- Common OTC medications (Paracetamol, Ibuprofen, Aspirin): Pharmacy prices typically 25-50 TL, SGK prices 15-35 TL
- Prescription medications: Pharmacy prices typically 50-500+ TL depending on medication type, SGK prices 30-70% of pharmacy price
- Antibiotics: Pharmacy prices typically 40-150 TL, SGK prices 20-100 TL
- Do NOT use unrealistic prices like 8.5 TL for Paracetamol - this is too low. Realistic Paracetamol prices are 25-45 TL in pharmacies, 15-30 TL with SGK coverage
- Always provide prices that reflect actual Turkish pharmaceutical market conditions in December 2025
- fiyat_sgk = SGK reimbursement price in TL (what patient pays with insurance)
- fiyat_eczane = Full pharmacy retail price in TL (without insurance)

Provide a JSON response with medication analysis including Turkish equivalents, current December 2025 pricing, and availability. The response must follow this structure:
{
  "scanned_medication": {
    "name": "medication name",
    "barcode": "${barcode}",
    "active_ingredients": ["ingredient1", "ingredient2"],
    "chemical_formulas": ["formula1", "formula2"]
  },
  "turkish_equivalents": {
    "exact_matches": [{
      "medication": {
        "ticari_adi": "Turkish brand name",
        "etken_madde": "active ingredient",
        "firma": "manufacturer",
        "fiyat_sgk": <realistic SGK price in Turkish Lira, typically 30-70% of pharmacy price>,
        "fiyat_eczane": <realistic pharmacy retail price in Turkish Lira - OTC: 25-50 TL, Prescription: 50-500+ TL>,
        "recete_tipi": "Yeşil" | "Kırmızı" | "Mor" | "Turuncu",
        "bulunabilirlik": ["pharmacy1", "pharmacy2"]
      },
      "similarity_score": 0.95
    }],
    "similar_formulations": []
  }
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    }),
  })

  if (!response.ok) {
    throw new Error('Anthropic API error')
  }

  const data = await response.json()
  const content = data.content[0].text
  return JSON.parse(content)
}

