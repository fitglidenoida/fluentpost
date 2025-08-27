import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import db from '@/lib/db'
import { z } from 'zod'

const generateRecommendationsSchema = z.object({
  websiteId: z.string().optional(),
  auditResults: z.any().optional()
})

const updateRecommendationSchema = z.object({
  recommendationId: z.string(),
  status: z.enum(['pending', 'implemented', 'ignored'])
})

export async function POST(request: NextRequest) {
  try {
    console.log('Recommendations API - POST request received')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId, auditResults } = generateRecommendationsSchema.parse(body)

    // If auditResults are provided, generate recommendations from them
    if (auditResults && auditResults.actionableItems) {
      console.log('Processing audit results:', auditResults.actionableItems.length, 'items')
      
      if (!websiteId) {
        return NextResponse.json({ 
          error: 'Website ID is required to create recommendations' 
        }, { status: 400 })
      }

      // Verify website ownership
      const website = db.queryFirst(
        'SELECT * FROM Website WHERE id = ? AND userId = ?',
        [websiteId, session.user.id]
      )

      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }

      // Clear existing recommendations for this website
      try {
        db.execute(
          'DELETE FROM SEORecommendation WHERE websiteId = ?',
          [websiteId]
        )
        console.log('Cleared existing recommendations for website:', websiteId)
      } catch (clearError: any) {
        console.error('Failed to clear recommendations:', clearError)
        return NextResponse.json(
          { error: 'Failed to clear existing recommendations', details: clearError.message }, 
          { status: 500 }
        )
      }

      // Create recommendations from actionable items using raw SQL
      const recommendations = auditResults.actionableItems.map((item: any) => ({
        websiteId: websiteId,
        type: item.category.toLowerCase().replace(' ', '_'),
        priority: item.priority,
        description: item.issue,
        action: `Estimated time: ${item.estimatedTime}, Impact: ${item.impact}`,
        status: 'pending'
      }))

      console.log('Creating recommendations:', recommendations.length, 'items')

      const createdRecommendations: any[] = []
      
      for (const rec of recommendations) {
        try {
          const recId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          db.execute(`
            INSERT INTO SEORecommendation (id, websiteId, type, priority, description, action, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [
            recId,
            rec.websiteId,
            rec.type,
            rec.priority,
            rec.description,
            rec.action,
            rec.status
          ])
          
          // Get the created record
          const created = db.queryFirst(`
            SELECT * FROM SEORecommendation 
            WHERE id = ?
          `, [recId])
          
          if (created) {
            createdRecommendations.push(created)
          }
        } catch (createError: any) {
          console.error('Failed to create recommendation:', createError)
        }
      }
      
      console.log('Recommendations created successfully:', createdRecommendations.length, 'items')
      
      return NextResponse.json({ 
        success: true, 
        message: `Generated ${createdRecommendations.length} recommendations`,
        recommendations: createdRecommendations
      })
    }

    // If no auditResults, return error
    return NextResponse.json({ 
      error: 'Audit results are required to generate recommendations' 
    }, { status: 400 })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: `Failed to generate recommendations: ${error.message}` }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Recommendations API - GET request received')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Session user ID:', session.user.id)

    // Test database connection
    try {
      const testQuery = db.query('SELECT 1 as test')
      console.log('Database connection test:', testQuery)
      
      // Test if SEO tables exist
      const tables = db.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('SEORecommendation', 'Website', 'PageAnalysis')
        ORDER BY name
      `)
      console.log('SEO tables found:', tables)
      
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message }, 
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    if (websiteId) {
      // Verify website ownership
      const website = db.queryFirst(
        'SELECT * FROM Website WHERE id = ? AND userId = ?',
        [websiteId, session.user.id]
      )
      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }
    }

    // Get recommendations using SQL
    let recommendations: any[] = []
    
    try {
      // Build the SQL query
      let sql = `
        SELECT r.*, w.name as website_name, w.url as website_url
        FROM SEORecommendation r
        LEFT JOIN Website w ON r.websiteId = w.id
        WHERE 1=1
      `
      
      const params: any[] = []
      
      if (websiteId) {
        sql += ` AND r.websiteId = ?`
        params.push(websiteId)
      } else {
        sql += ` AND r.websiteId IN (SELECT id FROM Website WHERE userId = ?)`
        params.push(session.user.id)
      }
      
      if (status) {
        sql += ` AND r.status = ?`
        params.push(status)
      }
      
      if (priority) {
        sql += ` AND r.priority = ?`
        params.push(priority)
      }
      
      sql += ` ORDER BY 
        CASE r.priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        r.createdAt DESC
      `
      
      console.log('SQL Query:', sql)
      console.log('SQL Params:', params)
      
      recommendations = db.query(sql, params)
      
      console.log('SQL recommendations found:', recommendations.length)
      
    } catch (sqlError: any) {
      console.error('SQL query failed:', sqlError)
      return NextResponse.json(
        { error: 'Failed to fetch recommendations', details: sqlError.message }, 
        { status: 500 }
      )
    }

    const recommendationsWithWebsite = recommendations.map((r: any) => ({
      ...r,
      website: r.website_name ? {
        id: r.websiteId,
        name: r.website_name,
        url: r.website_url
      } : null,
    }))

    console.log('Returning recommendations:', recommendationsWithWebsite.length, 'items')

    return NextResponse.json({ 
      success: true, 
      recommendations: recommendationsWithWebsite,
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recommendationId, status } = updateRecommendationSchema.parse(body)

    // Update recommendation status
    db.execute(
      'UPDATE SEORecommendation SET status = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      [status, recommendationId]
    )
    
    // Get the updated recommendation
    const recommendation = db.queryFirst(
      'SELECT * FROM SEORecommendation WHERE id = ?',
      [recommendationId]
    )

    return NextResponse.json({ 
      success: true, 
      recommendation 
    })

  } catch (error) {
    console.error('Update recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to update recommendation' }, 
      { status: 500 }
    )
  }
}
