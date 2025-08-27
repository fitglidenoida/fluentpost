import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SEOService } from '@/lib/seoService'
import db from '@/lib/db'
import { z } from 'zod'

const keywordResearchSchema = z.object({
  domain: z.string().url(),
  seedKeywords: z.array(z.string()).min(1).max(10)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { domain, seedKeywords } = keywordResearchSchema.parse(body)

    // Research keywords using SEO service
    const keywords = await SEOService.researchKeywords(domain, seedKeywords)

    return NextResponse.json({ 
      success: true, 
      keywords,
      total: keywords.length
    })

  } catch (error) {
    console.error('Keyword research error:', error)
    return NextResponse.json(
      { error: 'Failed to research keywords' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
