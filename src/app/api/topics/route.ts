import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import db from '@/lib/db'
import * as z from 'zod'
import { CustomSession } from '@/types/session'

const topicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  keywords: z.string().min(1, 'Keywords are required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  contentType: z.enum(['blog', 'video', 'social', 'guide']).default('blog'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedWordCount: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's websites to filter topics
    const websites = db.query(
      'SELECT id FROM Website WHERE userId = ?',
      [session.user.id]
    )
    
    if (websites.length === 0) {
      return NextResponse.json({
        topics: [],
        pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
      })
    }

    const websiteIds = websites.map(w => w.id)
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query with filters
    let whereClause = `WHERE t.websiteId IN (${websiteIds.map(() => '?').join(',')})`
    let params = [...websiteIds]
    
    if (categoryId) {
      whereClause += ' AND t.categoryId = ?'
      params.push(categoryId)
    }
    if (status) {
      whereClause += ' AND t.status = ?'
      params.push(status)
    }

    // Get topics with category information
    const topics = db.query(`
      SELECT 
        t.*,
        tc.name as categoryName,
        tc.color as categoryColor,
        COUNT(tk.keywordId) as keywordCount
      FROM TopicIdeas t
      LEFT JOIN TopicCategories tc ON t.categoryId = tc.id
      LEFT JOIN TopicKeywords tk ON t.id = tk.topicId
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.createdAt DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])

    // Get total count
    const totalResult = db.queryFirst(`
      SELECT COUNT(*) as total
      FROM TopicIdeas t
      ${whereClause}
    `, params)
    
    const total = totalResult?.total || 0

    // Format topics for frontend compatibility
    const formattedTopics = topics.map(topic => ({
      ...topic,
      category: topic.categoryName || 'uncategorized',
      keywords: '', // We'll populate this separately if needed
      keywordCount: topic.keywordCount || 0
    }))

    return NextResponse.json({
      topics: formattedTopics,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = topicSchema.parse(body)

    // Get user's first website (for now, we'll use the first one)
    const website = db.queryFirst(
      'SELECT id FROM Website WHERE userId = ? ORDER BY createdAt DESC LIMIT 1',
      [session.user.id]
    )

    if (!website) {
      return NextResponse.json(
        { error: 'No website found. Please add a website first.' },
        { status: 400 }
      )
    }

    // Create the topic
    const topicId = `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    db.execute(`
      INSERT INTO TopicIdeas (
        id, websiteId, categoryId, title, description, contentType, 
        priority, difficulty, estimatedWordCount, status, aiGenerated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'idea', FALSE)
    `, [
      topicId,
      website.id,
      validatedData.categoryId || null,
      validatedData.title,
      validatedData.description || null,
      validatedData.contentType,
      validatedData.priority,
      validatedData.difficulty,
      validatedData.estimatedWordCount || null
    ])

    // Parse and save keywords if provided
    if (validatedData.keywords) {
      const keywordsList = validatedData.keywords.split(',').map(k => k.trim()).filter(k => k)
      
      for (const keywordText of keywordsList) {
        // Check if keyword already exists
        let keyword = db.queryFirst(
          'SELECT id FROM Keywords WHERE websiteId = ? AND keyword = ?',
          [website.id, keywordText]
        )

        if (!keyword) {
          // Create new keyword
          const keywordId = `kw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          db.execute(`
            INSERT INTO Keywords (id, websiteId, keyword, intent, status)
            VALUES (?, ?, ?, 'informational', 'active')
          `, [keywordId, website.id, keywordText])
          
          keyword = { id: keywordId }
        }

        // Link keyword to topic
        const tkId = `tk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        db.execute(`
          INSERT INTO TopicKeywords (id, topicId, keywordId, usage)
          VALUES (?, ?, ?, 'secondary')
        `, [tkId, topicId, keyword.id])
      }
    }

    // Fetch the created topic with category info
    const createdTopic = db.queryFirst(`
      SELECT 
        t.*,
        tc.name as categoryName,
        tc.color as categoryColor
      FROM TopicIdeas t
      LEFT JOIN TopicCategories tc ON t.categoryId = tc.id
      WHERE t.id = ?
    `, [topicId])

    const formattedTopic = {
      ...createdTopic,
      category: createdTopic.categoryName || 'uncategorized',
      keywords: validatedData.keywords,
      viralScore: createdTopic.viralScore || 0.0
    }

    return NextResponse.json(formattedTopic, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
