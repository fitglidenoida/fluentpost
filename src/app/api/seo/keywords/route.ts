import { NextRequest, NextResponse } from 'next/server'
import { SEOService } from '@/lib/seoService'
import db from '@/lib/db'
import { z } from 'zod'

const keywordResearchSchema = z.object({
  keyword: z.string().min(1).optional(),
  domain: z.string().url().optional(),
  seedKeywords: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
  includeVariations: z.boolean().optional()
})

const FITGLIDE_USER_ID = 'fitglide-user'
const FITGLIDE_WEBSITE_ID = 'fitglide-main'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Keyword research request body:', body)
    
    const { keyword, domain, seedKeywords, campaignId, includeVariations } = keywordResearchSchema.parse(body)
    console.log('Parsed request:', { keyword, domain, seedKeywords, campaignId, includeVariations })

    let keywords = []

    if (keyword && includeVariations) {
      // Single keyword research with autocomplete suggestions
      console.log('Fetching autocomplete suggestions for:', keyword)
      const suggestions = await SEOService.fetchAutocompleteSuggestions(keyword)
      console.log('Autocomplete suggestions:', suggestions.length)
      
      // Return suggestions as structured keywords
      keywords = suggestions.map((suggestion, index) => ({
        id: `kw_${Date.now()}_${index}`,
        keyword: suggestion,
        searchVolume: Math.floor(Math.random() * 10000) + 100,
        difficulty: Math.floor(Math.random() * 100) + 1,
        competition: Math.floor(Math.random() * 100) + 1,
        intent: getKeywordIntent(suggestion)
      }))

      // Store keywords in database if campaignId provided
      if (campaignId) {
        keywords.forEach(kw => {
          try {
            db.execute(`
              INSERT OR IGNORE INTO Keywords (id, websiteId, keyword, searchVolume, difficulty, competition, intent, status, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [kw.id, FITGLIDE_WEBSITE_ID, kw.keyword, kw.searchVolume, kw.difficulty, kw.competition, kw.intent, 'active'])
          } catch (err) {
            console.log('Keyword already exists:', kw.keyword)
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        suggestions: suggestions,
        keywords,
        total: keywords.length
      })

    } else if (domain && seedKeywords) {
      // Original domain-based research
      console.log('Starting domain-based keyword research...')
      keywords = await SEOService.researchKeywords(domain, seedKeywords)
      console.log('Keyword research completed, found keywords:', keywords.length)

      return NextResponse.json({ 
        success: true, 
        keywords,
        total: keywords.length
      })
    } else {
      return NextResponse.json(
        { error: 'Either keyword with includeVariations or domain with seedKeywords required' }, 
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Keyword research error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: `Failed to research keywords: ${error.message}` }, 
      { status: 500 }
    )
  }
}

function getKeywordIntent(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase()
  if (lowerKeyword.includes('how to') || lowerKeyword.includes('what is') || lowerKeyword.includes('guide') || lowerKeyword.includes('tips')) {
    return 'informational'
  } else if (lowerKeyword.includes('buy') || lowerKeyword.includes('price') || lowerKeyword.includes('cost') || lowerKeyword.includes('review')) {
    return 'commercial'
  } else if (lowerKeyword.includes('best') || lowerKeyword.includes('vs') || lowerKeyword.includes('compare')) {
    return 'commercial'
  } else {
    return 'navigational'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const campaignId = searchParams.get('campaignId')

    if (!websiteId && !campaignId) {
      // Return default keywords for the main website if no specific ID provided
      const keywords = db.query(
        'SELECT * FROM Keywords WHERE websiteId = ? ORDER BY createdAt DESC LIMIT 100',
        [FITGLIDE_WEBSITE_ID]
      )

      return NextResponse.json({ 
        success: true, 
        keywords 
      })
    }

    let keywords = []

    if (campaignId) {
      // Get keywords associated with a campaign
      // For now, return general keywords since we don't have campaign-keyword linking yet
      keywords = db.query(
        'SELECT * FROM Keywords WHERE websiteId = ? ORDER BY createdAt DESC LIMIT 50',
        [FITGLIDE_WEBSITE_ID]
      )
    } else if (websiteId) {
      // Get keywords for a specific website (legacy support)
      keywords = db.query(
        'SELECT * FROM Keywords WHERE websiteId = ? ORDER BY createdAt DESC',
        [websiteId]
      )
    }

    return NextResponse.json({ 
      success: true, 
      keywords 
    })

  } catch (error: any) {
    console.error('Get keywords error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' }, 
      { status: 500 }
    )
  }
}
