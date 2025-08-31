import { NextRequest, NextResponse } from 'next/server'
import { SEOService } from '@/lib/seoService'
import db from '@/lib/db'
import { z } from 'zod'

const keywordResearchSchema = z.object({
  domain: z.string().url(),
  seedKeywords: z.array(z.string()).min(1).max(10)
})

const FITGLIDE_USER_ID = 'fitglide-user'

export async function POST(request: NextRequest) {
  try {

    const body = await request.json()
    console.log('Keyword research request body:', body)
    
    const { domain, seedKeywords } = keywordResearchSchema.parse(body)
    console.log('Parsed domain:', domain, 'seedKeywords:', seedKeywords)

    // Research keywords using SEO service
    console.log('Starting keyword research...')
    const keywords = await SEOService.researchKeywords(domain, seedKeywords)
    console.log('Keyword research completed, found keywords:', keywords.length)

    return NextResponse.json({ 
      success: true, 
      keywords,
      total: keywords.length
    })

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

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Get keywords for a specific website
    const keywords = db.query(
      'SELECT * FROM KeywordResearch WHERE websiteId = ? ORDER BY createdAt DESC',
      [websiteId]
    )

    return NextResponse.json({ 
      success: true, 
      keywords 
    })

  } catch (error) {
    console.error('Get keywords error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' }, 
      { status: 500 }
    )
  }
}
