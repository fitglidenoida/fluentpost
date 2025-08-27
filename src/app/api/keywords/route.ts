import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import db from '@/lib/db'
import * as z from 'zod'

const keywordSchema = z.object({
  websiteId: z.string(),
  keyword: z.string().min(1, 'Keyword is required'),
  searchVolume: z.number().optional(),
  difficulty: z.number().optional(),
  competition: z.number().optional(),
  intent: z.enum(['informational', 'commercial', 'transactional', 'navigational']).default('informational'),
})

const saveKeywordsSchema = z.object({
  websiteId: z.string(),
  keywords: z.array(z.object({
    keyword: z.string(),
    searchVolume: z.number().optional(),
    difficulty: z.number().optional(),
    competition: z.number().optional(),
    intent: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
  })),
  groupName: z.string().optional(), // If provided, create/add to group
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const groupId = searchParams.get('groupId')
    const status = searchParams.get('status') || 'active'

    // Get user's websites
    const websites = db.query(
      'SELECT id FROM Website WHERE userId = ?',
      [session.user.id]
    )
    
    const websiteIds = websites.map(w => w.id)
    
    if (websiteId && !websiteIds.includes(websiteId)) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Build query
    let whereClause = `WHERE k.websiteId IN (${websiteIds.map(() => '?').join(',')})`
    let params = [...websiteIds]
    
    if (websiteId) {
      whereClause = 'WHERE k.websiteId = ?'
      params = [websiteId]
    }
    
    if (status) {
      whereClause += ` AND k.status = ?`
      params.push(status)
    }

    if (groupId) {
      whereClause += ` AND kgm.groupId = ?`
      params.push(groupId)
    }

    // Get keywords with group information
    const keywords = db.query(`
      SELECT DISTINCT
        k.*,
        GROUP_CONCAT(kg.name) as groupNames,
        GROUP_CONCAT(kg.id) as groupIds
      FROM Keywords k
      LEFT JOIN KeywordGroupMappings kgm ON k.id = kgm.keywordId
      LEFT JOIN KeywordGroups kg ON kgm.groupId = kg.id
      ${whereClause}
      GROUP BY k.id
      ORDER BY k.createdAt DESC
    `, params)

    return NextResponse.json({
      success: true,
      keywords: keywords.map(kw => ({
        ...kw,
        groups: kw.groupNames ? kw.groupNames.split(',').map((name: string, index: number) => ({
          id: kw.groupIds.split(',')[index],
          name: name
        })) : []
      }))
    })
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Check if it's single keyword or bulk save
    if (body.keywords && Array.isArray(body.keywords)) {
      // Bulk save keywords from research
      const validatedData = saveKeywordsSchema.parse(body)
      
      // Verify website ownership
      const website = db.queryFirst(
        'SELECT * FROM Website WHERE id = ? AND userId = ?',
        [validatedData.websiteId, session.user.id]
      )

      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }

      const savedKeywords = []
      let groupId = null

      // Create group if specified
      if (validatedData.groupName) {
        groupId = `kg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        db.execute(`
          INSERT INTO KeywordGroups (id, websiteId, name, description)
          VALUES (?, ?, ?, ?)
        `, [groupId, validatedData.websiteId, validatedData.groupName, `Keywords from research session`])
      }

      // Save each keyword
      for (const keywordData of validatedData.keywords) {
        // Check if keyword already exists
        let keyword = db.queryFirst(
          'SELECT id FROM Keywords WHERE websiteId = ? AND keyword = ?',
          [validatedData.websiteId, keywordData.keyword]
        )

        if (!keyword) {
          const keywordId = `kw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          db.execute(`
            INSERT INTO Keywords (
              id, websiteId, keyword, searchVolume, difficulty, competition, intent, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
          `, [
            keywordId,
            validatedData.websiteId,
            keywordData.keyword,
            keywordData.searchVolume || null,
            keywordData.difficulty || null,
            keywordData.competition || null,
            keywordData.intent || 'informational'
          ])
          
          keyword = { id: keywordId }
        }

        // Add to group if specified
        if (groupId) {
          const mappingId = `kgm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          try {
            db.execute(`
              INSERT INTO KeywordGroupMappings (id, keywordId, groupId)
              VALUES (?, ?, ?)
            `, [mappingId, keyword.id, groupId])
          } catch (error) {
            // Ignore duplicate mapping errors
          }
        }

        savedKeywords.push(keyword.id)
      }

      return NextResponse.json({
        success: true,
        savedCount: savedKeywords.length,
        groupId,
        keywords: savedKeywords
      }, { status: 201 })
    } else {
      // Single keyword creation
      const validatedData = keywordSchema.parse(body)
      
      // Verify website ownership
      const website = db.queryFirst(
        'SELECT * FROM Website WHERE id = ? AND userId = ?',
        [validatedData.websiteId, session.user.id]
      )

      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }

      // Check if keyword already exists
      const existingKeyword = db.queryFirst(
        'SELECT id FROM Keywords WHERE websiteId = ? AND keyword = ?',
        [validatedData.websiteId, validatedData.keyword]
      )

      if (existingKeyword) {
        return NextResponse.json(
          { error: 'Keyword already exists' },
          { status: 400 }
        )
      }

      const keywordId = `kw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      db.execute(`
        INSERT INTO Keywords (
          id, websiteId, keyword, searchVolume, difficulty, competition, intent, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        keywordId,
        validatedData.websiteId,
        validatedData.keyword,
        validatedData.searchVolume || null,
        validatedData.difficulty || null,
        validatedData.competition || null,
        validatedData.intent
      ])

      const createdKeyword = db.queryFirst(
        'SELECT * FROM Keywords WHERE id = ?',
        [keywordId]
      )

      return NextResponse.json(createdKeyword, { status: 201 })
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating keyword:', error)
    return NextResponse.json(
      { error: 'Failed to create keyword' },
      { status: 500 }
    )
  }
}
