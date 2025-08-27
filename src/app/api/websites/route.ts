import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import db from '@/lib/db'
import { z } from 'zod'

const createWebsiteSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url()
})

const updateWebsiteSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

export async function POST(request: NextRequest) {
  try {
    console.log('Website POST - Start')
    
    const session = await getServerSession(authOptions) as any
    console.log('Website POST - Session:', session?.user?.email, session?.user?.id)
    
    if (!session?.user?.email) {
      console.log('Website POST - No session/email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Website POST - Request body:', body)
    
    const { name, url } = createWebsiteSchema.parse(body)
    console.log('Website POST - Parsed data:', { name, url })

    // Check if website already exists for this user
    console.log('Website POST - Checking existing website for user:', session.user.id)
    const existingWebsite = db.queryFirst(
      'SELECT id FROM Website WHERE url = ? AND userId = ?',
      [url, session.user.id]
    )
    console.log('Website POST - Existing website check result:', existingWebsite)

    if (existingWebsite) {
      return NextResponse.json(
        { error: 'Website already exists' }, 
        { status: 400 }
      )
    }

    // Generate unique ID
    const websiteId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    // Create new website
    console.log('Website POST - Creating website with ID:', websiteId)
    console.log('Website POST - Insert params:', [websiteId, name, url, session.user.id, 'active', now, now])
    
    db.execute(
      `INSERT INTO Website (id, name, url, userId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [websiteId, name, url, session.user.id, 'active', now, now]
    )
    console.log('Website POST - Website created successfully')

    // Fetch the created website
    const website = db.queryFirst(
      'SELECT * FROM Website WHERE id = ?',
      [websiteId]
    )

    return NextResponse.json({ 
      success: true, 
      website 
    })

  } catch (error: any) {
    console.error('Create website error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Handle different types of errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create website', 
        details: error.message,
        type: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build SQL query with optional status filter
    let query = 'SELECT * FROM Website WHERE userId = ?'
    const params = [session.user.id]
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY createdAt DESC'

    // Get websites
    const websites = db.query(query, params)

    return NextResponse.json({ 
      success: true, 
      websites 
    })

  } catch (error) {
    console.error('Get websites error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = updateWebsiteSchema.parse(body)

    // Verify website ownership
    const website = db.queryFirst(
      'SELECT * FROM Website WHERE id = ? AND userId = ?',
      [id, session.user.id]
    )

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Build update query dynamically
    const setClause = []
    const params = []
    
    if (updateData.name) {
      setClause.push('name = ?')
      params.push(updateData.name)
    }
    
    if (updateData.status) {
      setClause.push('status = ?')
      params.push(updateData.status)
    }
    
    setClause.push('updatedAt = ?')
    params.push(new Date().toISOString())
    params.push(id)

    // Update website
    db.execute(
      `UPDATE Website SET ${setClause.join(', ')} WHERE id = ?`,
      params
    )

    // Fetch updated website
    const updatedWebsite = db.queryFirst(
      'SELECT * FROM Website WHERE id = ?',
      [id]
    )

    return NextResponse.json({ 
      success: true, 
      website: updatedWebsite 
    })

  } catch (error) {
    console.error('Update website error:', error)
    return NextResponse.json(
      { error: 'Failed to update website' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Verify website ownership
    const website = db.queryFirst(
      'SELECT * FROM Website WHERE id = ? AND userId = ?',
      [id, session.user.id]
    )

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Delete website (foreign key constraints will handle related data)
    db.execute('DELETE FROM Website WHERE id = ?', [id])

    return NextResponse.json({ 
      success: true, 
      message: 'Website deleted successfully' 
    })

  } catch (error) {
    console.error('Delete website error:', error)
    return NextResponse.json(
      { error: 'Failed to delete website' }, 
      { status: 500 }
    )
  }
}
