# SafeMed - Presentation Code Documentation

**Purpose**: This document contains full code files and explanations organized to match the presentation flow.

---

## 📋 Table of Contents

1. [Application Introduction](#1-application-introduction)
2. [Medication Search System](#2-medication-search-system)
   - [Database Seeding](#database-seeding)
   - [Search Component & Connection](#search-component--connection)
   - [Challenges & Solutions](#challenges--solutions)
3. [AI Medication Analyzer](#3-ai-medication-analyzer)
   - [Environment Configuration](#environment-configuration)
   - [API Route & Implementation](#api-route--implementation)
   - [Client-Side Integration](#client-side-integration)

---

## 1. Application Introduction

**SafeMed** is a medication management application that helps users:
- Search medications in a database of 81 medications
- Analyze medications using AI to find Turkish pharmaceutical equivalents
- Get pricing information (SGK and pharmacy prices)
- Manage medication history and schedules

---

## 2. Medication Search System

### Overview
The medication search provides real-time search functionality that queries a Supabase PostgreSQL database containing 81 medications. The system uses debouncing to optimize performance and provides instant feedback as users type.

### Database Seeding

**File**: `scripts/seed-medications.js`

This script populates the database with 81 medications using Supabase's service role key.

```javascript
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
  { name: 'Paracetamol', active_ingredients: ['Paracetamol', 'Acetaminophen'], dosage_form: 'Tablet', strength: '500mg', manufacturer: 'Generic' },
  { name: 'Ibuprofen', active_ingredients: ['Ibuprofen'], dosage_form: 'Tablet', strength: '200mg', manufacturer: 'Generic' },
  // ... 81 total medications including:
  // - Antibiotics (Amoxicillin, Penicillin V, Ciprofloxacin, etc.)
  // - Antihistamines (Loratadine, Cetirizine, Benadryl, etc.)
  // - Antacids (Omeprazole, Ranitidine, Tums, etc.)
  // - Blood Pressure medications (Lisinopril, Atenolol, etc.)
  // - And many more categories
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
```

**Database Schema** (from SQL migrations):
- `medications` table with columns: `id`, `name`, `barcode`, `active_ingredients`, `dosage_form`, `strength`, `manufacturer`, `description`, `image_url`
- Indexes on `name` and `manufacturer` for fast searching
- Row Level Security (RLS) policies for data access

---

### Search Component & Connection

**Flow**: `MedicationSearch.tsx` → `searchMedicationsByName()` → Supabase Database

#### 1. Search Component

**File**: `src/components/medications/MedicationSearch.tsx`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, Pill } from 'lucide-react'
import { searchMedicationsByName, type Medication } from '@/lib/medications'
import { useDebounce } from '@/hooks/useDebounce'
import MedicationCard from './MedicationCard'

interface MedicationSearchProps {
  onSelectMedication?: (medication: Medication) => void
  onSearchResult?: (results: Medication[]) => void
}

export default function MedicationSearch({ onSelectMedication, onSearchResult }: MedicationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Medication[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const searchResults = await searchMedicationsByName(query, 10)
      setResults(searchResults)
      setShowResults(true)
      
      if (onSearchResult) {
        onSearchResult(searchResults)
      }
    } catch (error: any) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [onSearchResult])

  // Trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, performSearch])

  const handleSelect = (medication: Medication) => {
    if (onSelectMedication) {
      onSelectMedication(medication)
    }
    setSearchQuery('')
    setShowResults(false)
  }

  const handleClear = () => {
    setSearchQuery('')
    setResults([])
    setHasSearched(false)
    setShowResults(false)
  }

  return (
    <div className="w-full relative" style={{ zIndex: 1000 }}>
      <div className="relative" style={{ zIndex: 1000 }}>
        <div className="relative" style={{ zIndex: 1000 }}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications by name (e.g., Aspirin, Paracetamol)..."
            className="w-full bg-dark-700/50 border border-dark-600 rounded-xl pl-12 pr-12 py-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all"
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true)
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-medical-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute w-full mt-2 bg-dark-800/98 backdrop-blur-xl border border-dark-600 rounded-xl shadow-2xl max-h-96 overflow-y-auto" style={{ zIndex: 99999, position: 'absolute', top: '100%', left: 0, right: 0 }}>
            {isSearching ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-medical-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-400">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Found {results.length} medication{results.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-1">
                  {results.map((medication) => (
                    <button
                      key={medication.id}
                      onClick={() => handleSelect(medication)}
                      className="w-full text-left p-3 rounded-lg hover:bg-dark-700/50 transition-colors border border-transparent hover:border-medical-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-medical-500/10 rounded-lg">
                          <Pill className="w-5 h-5 text-medical-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-100 truncate">{medication.name}</h4>
                          {medication.manufacturer && (
                            <p className="text-sm text-slate-400 truncate">{medication.manufacturer}</p>
                          )}
                          {medication.strength && (
                            <p className="text-xs text-slate-500 mt-1">Strength: {medication.strength}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : hasSearched ? (
              <div className="p-8 text-center">
                <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-1">No medications found</p>
                <p className="text-xs text-slate-500">
                  Try searching with a different name or use AI analysis
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 2. Database Search Function

**File**: `src/lib/medications.ts`

```typescript
import { createClientComponentClient } from '@/lib/supabase'

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
```

#### 3. Dashboard Integration

**File**: `src/app/dashboard/page.tsx` (excerpt)

```typescript
const handleSelectMedication = async (medication: any) => {
  try {
    setIsLoading(true)
    setAnalysisResult(null)
    
    // Try AI analysis to get Turkish equivalents and more info
    toast.loading(`Analyzing ${medication.name}...`)
    try {
      const analysis = await analyzeMedication('', medication.name)
      setAnalysisResult(analysis)
      toast.dismiss()
      toast.success('Analysis complete!')
    } catch (aiError: any) {
      // If AI fails, still show what we found in database
      toast.dismiss()
      toast.success(`Found: ${medication.name}`)
      setAnalysisResult(null)
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to process medication')
  } finally {
    setIsLoading(false)
  }
}

// In JSX:
<MedicationSearch
  onSelectMedication={handleSelectMedication}
  onSearchResult={(results) => {
    // Handle search results if needed
  }}
/>
```

---

### Challenges & Solutions

**Problem 1: Supabase Client Initialization**
- **Issue**: Using the wrong Supabase client. The component needs `createClientComponentClient()` (for client-side) not `createClient()`.
- **Solution**: Imported `createClientComponentClient` from `@/lib/supabase` which handles cookie-based authentication properly in Next.js App Router.

**Problem 2: Type Mismatches**
- **Issue**: The `Medication` type from the database didn't match what the component expected.
- **Solution**: Created a shared `Medication` interface in `src/lib/medications.ts` that matches the database schema, ensuring type safety across components.

**Problem 3: Callback Prop Passing**
- **Issue**: The `onSelectMedication` callback wasn't being called properly due to async timing issues.
- **Solution**: Used `useCallback` to memoize the handler and ensured the callback is called synchronously before any async operations.

**Problem 4: Database Query Syntax**
- **Issue**: Initially used `.like()` which is case-sensitive, causing searches to miss results.
- **Solution**: Changed to `.ilike()` for case-insensitive matching and used `.or()` to search both `name` and `manufacturer` fields simultaneously.

**Problem 5: Debouncing Implementation**
- **Issue**: Without debouncing, every keystroke triggered a database query, causing performance issues.
- **Solution**: Created a `useDebounce` hook that waits 500ms after the user stops typing before triggering the search.

**Problem 6: Error Handling**
- **Issue**: Database errors weren't being handled gracefully, causing the UI to break.
- **Solution**: Added try-catch blocks and fallback to empty array on errors, with console warnings for debugging.

---

## 3. AI Medication Analyzer

### Overview
The AI Medication Analyzer uses OpenAI GPT-4o-mini to analyze medications, identify active ingredients, and find Turkish pharmaceutical equivalents with pricing information. Users can type symptoms (like "headache") or medication names to get detailed analysis.

### Environment Configuration

**File**: `.env.local`

```env
# OpenAI API Key for medication analysis
OPENAI_API_KEY=sk-...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: The API key is stored securely in environment variables and never exposed to the client-side code.

---

### API Route & Implementation

**File**: `src/app/api/analyze-medication/route.ts`

This is the main API endpoint that handles medication analysis requests.

```typescript
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
      ...RATE_LIMITS.AI_ANALYSIS, // 10 requests/hour
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

Analyze this medication and identify Turkish equivalents with pricing.

${medicationName ? `Medication Name: ${medicationName}` : `Barcode: ${barcode}`}

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
```

---

### Client-Side Integration

**File**: `src/lib/ai-medication-analyzer.ts`

```typescript
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
```

**Usage in Dashboard**:

```typescript
const handleSearchMedication = async (query: string) => {
  if (!query || query.trim().length < 2) return

  setIsLoading(true)
  setAnalysisResult(null)
  const normalizedQuery = query.trim()

  try {
    toast.loading(`Analyzing medication: ${normalizedQuery}...`)
    const analysis = await analyzeMedication('', normalizedQuery) // '' for barcode, query for medication name
    setAnalysisResult(analysis)
    toast.dismiss()
    toast.success('Analysis complete!')
  } catch (aiError: any) {
    console.error('AI analysis error:', aiError)
    toast.dismiss()
    
    if (aiError.message?.includes('No AI provider') || aiError.message?.includes('Failed to analyze')) {
      toast.error('AI analysis unavailable. Please configure an AI API key.')
    } else {
      toast.error(aiError.message || 'Failed to analyze medication. Please try again.')
    }
  } finally {
    setIsLoading(false)
  }
}
```

---

## 🎯 Key Features Summary

### Medication Search
- ✅ Real-time database search with 81 medications
- ✅ Debounced input (500ms delay)
- ✅ Case-insensitive partial matching
- ✅ Searches both name and manufacturer fields
- ✅ Instant dropdown results display

### AI Medication Analyzer
- ✅ OpenAI GPT-4o-mini integration
- ✅ Rate limiting (10 requests/hour per user)
- ✅ Structured JSON response parsing
- ✅ Turkish pharmaceutical market knowledge
- ✅ Realistic pricing in Turkish Lira (SGK and pharmacy prices)
- ✅ Handles both medication names and symptoms (e.g., "headache")

---

**End of Presentation Code Documentation**
