import { NextRequest, NextResponse } from 'next/server'
import { SEOService } from '@/lib/seoService'
import db from '@/lib/db'
import { z } from 'zod'

const analyzeWebsiteSchema = z.object({
  url: z.string().url(),
  websiteName: z.string().min(1).max(100)
})

const FITGLIDE_USER_ID = 'fitglide-user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, websiteName } = analyzeWebsiteSchema.parse(body)

    // Get or create website record (for personal FitGlide tool)
    let website = db.queryFirst(
      'SELECT * FROM Website WHERE url = ? AND userId = ?',
      [url, FITGLIDE_USER_ID]
    )

    if (!website) {
      const websiteId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      db.execute(
        'INSERT INTO Website (id, name, url, userId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
        [websiteId, websiteName, url, FITGLIDE_USER_ID, 'scanning']
      )
      website = db.queryFirst('SELECT * FROM Website WHERE id = ?', [websiteId])
    }

    // Analyze the website
    const analysis = await SEOService.analyzeWebsite(url)

    // Save page analysis
    const pageAnalysisId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    db.execute(
      `INSERT INTO PageAnalysis (id, websiteId, url, title, metaDescription, headings, content, seoScore, issues, suggestions, scannedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        pageAnalysisId,
        website.id,
        analysis.url,
        analysis.title,
        analysis.metaDescription,
        analysis.headings ? JSON.stringify(analysis.headings) : null,
        analysis.content,
        analysis.seoScore,
        analysis.issues ? JSON.stringify(analysis.issues) : null,
        analysis.suggestions ? JSON.stringify(analysis.suggestions) : null
      ]
    )

    const pageAnalysis = db.queryFirst('SELECT * FROM PageAnalysis WHERE id = ?', [pageAnalysisId])

    // Update website status
    db.execute(
      'UPDATE Website SET status = ?, lastScanned = datetime(\'now\'), updatedAt = datetime(\'now\') WHERE id = ?',
      ['active', website.id]
    )

    return NextResponse.json({ 
      success: true, 
      website,
      analysis: {
        ...analysis,
        pageAnalysisId: pageAnalysis.id
      }
    })

  } catch (error) {
    console.error('Website analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze website' }, 
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

    // Get website with all analyses (for personal FitGlide tool)
    const website = db.queryFirst(
      'SELECT * FROM Website WHERE id = ? AND userId = ?',
      [websiteId, FITGLIDE_USER_ID]
    )

    if (website) {
      const pageAnalyses = db.query(
        'SELECT * FROM PageAnalysis WHERE websiteId = ? ORDER BY scannedAt DESC',
        [websiteId]
      )
      website.pageAnalyses = pageAnalyses
    }

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      website 
    })

  } catch (error) {
    console.error('Get website analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch website analysis' }, 
      { status: 500 }
    )
  }
}
