import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import db from '@/lib/db'
import * as z from 'zod'
import { CustomSession } from '@/types/session'

const categorySchema = z.object({
  websiteId: z.string(),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  color: z.string().default('#10B981'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

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
    let whereClause = `WHERE websiteId IN (${websiteIds.map(() => '?').join(',')})`
    let params = [...websiteIds]
    
    if (websiteId) {
      whereClause = 'WHERE websiteId = ?'
      params = [websiteId]
    }

    // Get categories with topic count
    const categories = db.query(`
      SELECT 
        tc.*,
        COUNT(ti.id) as topicCount
      FROM TopicCategories tc
      LEFT JOIN TopicIdeas ti ON tc.id = ti.categoryId
      ${whereClause}
      GROUP BY tc.id
      ORDER BY tc.createdAt DESC
    `, params)

    return NextResponse.json({
      success: true,
      categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    const validatedData = categorySchema.parse(body)
    
    // Verify website ownership
    const website = db.queryFirst(
      'SELECT * FROM Website WHERE id = ? AND userId = ?',
      [validatedData.websiteId, session.user.id]
    )

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Check if category already exists
    const existingCategory = db.queryFirst(
      'SELECT id FROM TopicCategories WHERE websiteId = ? AND name = ?',
      [validatedData.websiteId, validatedData.name]
    )

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      )
    }

    const categoryId = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    db.execute(`
      INSERT INTO TopicCategories (id, websiteId, name, description, color)
      VALUES (?, ?, ?, ?, ?)
    `, [
      categoryId,
      validatedData.websiteId,
      validatedData.name,
      validatedData.description || null,
      validatedData.color
    ])

    const createdCategory = db.queryFirst(
      'SELECT * FROM TopicCategories WHERE id = ?',
      [categoryId]
    )

    return NextResponse.json(createdCategory, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Verify category ownership through website
    const category = db.queryFirst(`
      SELECT tc.* FROM TopicCategories tc
      JOIN Website w ON tc.websiteId = w.id
      WHERE tc.id = ? AND w.userId = ?
    `, [id, session.user.id])

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Update category
    const updateFields = []
    const params = []
    
    if (updateData.name) {
      updateFields.push('name = ?')
      params.push(updateData.name)
    }
    if (updateData.description !== undefined) {
      updateFields.push('description = ?')
      params.push(updateData.description)
    }
    if (updateData.color) {
      updateFields.push('color = ?')
      params.push(updateData.color)
    }
    
    updateFields.push('updatedAt = ?')
    params.push(new Date().toISOString())
    params.push(id)

    db.execute(`
      UPDATE TopicCategories 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, params)

    const updatedCategory = db.queryFirst(
      'SELECT * FROM TopicCategories WHERE id = ?',
      [id]
    )

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Verify category ownership through website
    const category = db.queryFirst(`
      SELECT tc.* FROM TopicCategories tc
      JOIN Website w ON tc.websiteId = w.id
      WHERE tc.id = ? AND w.userId = ?
    `, [id, session.user.id])

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has topics
    const topicCount = db.queryFirst(
      'SELECT COUNT(*) as count FROM TopicIdeas WHERE categoryId = ?',
      [id]
    )

    if (topicCount?.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing topics. Move topics to another category first.' },
        { status: 400 }
      )
    }

    // Delete category
    db.execute('DELETE FROM TopicCategories WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
