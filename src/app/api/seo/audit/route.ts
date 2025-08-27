import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SEOService } from '@/lib/seoService'
import db from '@/lib/db'
import { z } from 'zod'

const auditWebsiteSchema = z.object({
  websiteId: z.string(),
  url: z.string().url()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId, url } = auditWebsiteSchema.parse(body)

    // Verify website ownership
    const website = db.queryFirst(
      'SELECT * FROM Website WHERE id = ? AND userId = ?',
      [websiteId, session.user.id]
    )

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Perform comprehensive audit
    console.log('Starting website audit for:', url)
    const audit = await SEOService.performWebsiteAudit(url)
    console.log('Audit completed, saving to database...')

    // Save audit to database (upsert to handle duplicates)
    const existingAudit = db.queryFirst(
      'SELECT id FROM PageAnalysis WHERE websiteId = ? AND url = ?',
      [websiteId, audit.url]
    )

    const issuesJson = JSON.stringify({
      technical: audit.currentState.technicalIssues,
      content: audit.currentState.contentIssues,
      performance: audit.currentState.performanceIssues,
      mobile: audit.currentState.mobileIssues
    })
    const suggestionsJson = JSON.stringify(audit.actionableItems)

    let savedAudit: any
    if (existingAudit) {
      // Update existing audit
      db.execute(`
        UPDATE PageAnalysis 
        SET title = ?, seoScore = ?, issues = ?, suggestions = ?, scannedAt = ?
        WHERE id = ?
      `, [
        'Website Audit',
        audit.currentState.seoScore,
        issuesJson,
        suggestionsJson,
        audit.scannedAt.toISOString(),
        existingAudit.id
      ])
      savedAudit = { id: existingAudit.id }
    } else {
      // Create new audit
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      db.execute(`
        INSERT INTO PageAnalysis (id, websiteId, url, title, seoScore, issues, suggestions, scannedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        auditId,
        websiteId,
        audit.url,
        'Website Audit',
        audit.currentState.seoScore,
        issuesJson,
        suggestionsJson,
        audit.scannedAt.toISOString()
      ])
      savedAudit = { id: auditId }
    }
    console.log('Audit saved, creating recommendations...')

    // Create SEO recommendations
    console.log('Audit actionable items:', audit.actionableItems)
    
    const recommendations = audit.actionableItems.map((item: any) => ({
      websiteId,
      type: item.category.toLowerCase().replace(' ', '_'),
      priority: item.priority,
      description: item.issue,
      action: `Estimated time: ${item.estimatedTime}, Impact: ${item.impact}`
    }))
    
    console.log('Generated recommendations:', recommendations)

    try {
      // Clear existing recommendations for this website
      db.execute(
        'DELETE FROM SEORecommendation WHERE websiteId = ?',
        [websiteId]
      )
      console.log('Cleared existing recommendations for website:', websiteId)
      
      // Create new recommendations
      console.log('Creating recommendations:', recommendations.length, 'items')
      for (const rec of recommendations) {
        const recId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        db.execute(`
          INSERT INTO SEORecommendation (id, websiteId, type, priority, description, action, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
        `, [
          recId,
          rec.websiteId,
          rec.type,
          rec.priority,
          rec.description,
          rec.action
        ])
      }
      console.log('Recommendations created successfully:', recommendations.length, 'items')
    } catch (recError: any) {
      console.error('Error creating recommendations:', recError)
      console.error('Error details:', {
        message: recError.message,
        stack: recError.stack,
        name: recError.name
      })
      // Continue without recommendations if they fail
    }

    return NextResponse.json({ 
      success: true, 
      audit: {
        ...audit,
        auditId: savedAudit.id
      }
    })

  } catch (error) {
    console.error('Website audit error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: `Failed to perform website audit: ${error.message}` }, 
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

    if (websiteId) {
      // If specific website requested, verify ownership
      const website = db.queryFirst(
        'SELECT * FROM Website WHERE id = ? AND userId = ?',
        [websiteId, session.user.id]
      )
      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }
    }

    // Get audit history with website info
    let audits: any[]
    if (websiteId) {
      audits = db.query(`
        SELECT p.*, w.name as website_name, w.url as website_url
        FROM PageAnalysis p
        LEFT JOIN Website w ON p.websiteId = w.id
        WHERE p.websiteId = ?
        ORDER BY p.scannedAt DESC
      `, [websiteId])
    } else {
      audits = db.query(`
        SELECT p.*, w.name as website_name, w.url as website_url
        FROM PageAnalysis p
        LEFT JOIN Website w ON p.websiteId = w.id
        WHERE p.websiteId IN (SELECT id FROM Website WHERE userId = ?)
        ORDER BY p.scannedAt DESC
      `, [session.user.id])
    }

    // Format audits with website info
    const formattedAudits = audits.map((audit: any) => ({
      ...audit,
      website: {
        id: audit.websiteId,
        name: audit.website_name,
        url: audit.website_url
      }
    }))

    return NextResponse.json({ 
      success: true, 
      audits: formattedAudits 
    })

  } catch (error) {
    console.error('Get audit history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit history' }, 
      { status: 500 }
    )
  }
}
