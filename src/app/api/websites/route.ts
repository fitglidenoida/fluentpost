import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/db'
import { z } from 'zod'

// FitGlide constants - no multi-tenant complexity
const FITGLIDE_WEBSITE_ID = 'fitglide-main'
const FITGLIDE_USER_ID = 'fitglide-user'

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
    console.log('FitGlide Website POST - Start')
    
    const body = await request.json()
    console.log('FitGlide Website POST - Request body:', body)
    
    const { name, url } = createWebsiteSchema.parse(body)
    console.log('FitGlide Website POST - Parsed data:', { name, url })

    // Check if FitGlide website already exists
    console.log('FitGlide Website POST - Checking existing FitGlide website')
    const existingWebsite = dbHelpers.queryFirst(
      'SELECT id FROM Website WHERE id = ?',
      [FITGLIDE_WEBSITE_ID]
    )
    console.log('FitGlide Website POST - Existing website check result:', existingWebsite)

    if (existingWebsite) {
      return NextResponse.json(
        { error: 'FitGlide website already exists' }, 
        { status: 400 }
      )
    }

    // Create FitGlide website
    console.log('FitGlide Website POST - Creating FitGlide website')
    
    dbHelpers.execute(
      `INSERT INTO Website (id, name, url, userId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [FITGLIDE_WEBSITE_ID, name, url, FITGLIDE_USER_ID, 'active']
    )
    console.log('FitGlide Website POST - FitGlide website created successfully')

    // Fetch the created website
    const website = dbHelpers.queryFirst(
      'SELECT * FROM Website WHERE id = ?',
      [FITGLIDE_WEBSITE_ID]
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
    console.log('FitGlide Website GET - Start')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build SQL query with optional status filter for FitGlide
    let query = 'SELECT * FROM Website WHERE userId = ?'
    const params = [FITGLIDE_USER_ID]
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY createdAt DESC'

    // Get FitGlide websites
    const websites = dbHelpers.query(query, params)

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
    console.log('FitGlide Website PUT - Start')

    const body = await request.json()
    const { id, ...updateData } = updateWebsiteSchema.parse(body)

    // Only allow updating FitGlide website
    if (id !== FITGLIDE_WEBSITE_ID) {
      return NextResponse.json({ error: 'Can only update FitGlide website' }, { status: 403 })
    }

    // Verify FitGlide website exists
    const website = dbHelpers.queryFirst(
      'SELECT * FROM Website WHERE id = ?',
      [FITGLIDE_WEBSITE_ID]
    )

    if (!website) {
      return NextResponse.json({ error: 'FitGlide website not found' }, { status: 404 })
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
    
    setClause.push('updatedAt = datetime(\'now\')')
    params.push(id)

    // Update website
    dbHelpers.execute(
      `UPDATE Website SET ${setClause.join(', ')} WHERE id = ?`,
      params
    )

    // Fetch updated website
    const updatedWebsite = dbHelpers.queryFirst(
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
    console.log('FitGlide Website DELETE - Start')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Only allow deleting FitGlide website
    if (id !== FITGLIDE_WEBSITE_ID) {
      return NextResponse.json({ error: 'Can only delete FitGlide website' }, { status: 403 })
    }

    // Verify FitGlide website exists
    const website = dbHelpers.queryFirst(
      'SELECT * FROM Website WHERE id = ?',
      [FITGLIDE_WEBSITE_ID]
    )

    if (!website) {
      return NextResponse.json({ error: 'FitGlide website not found' }, { status: 404 })
    }

    // Delete FitGlide website (foreign key constraints will handle related data)
    dbHelpers.execute('DELETE FROM Website WHERE id = ?', [id])

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
