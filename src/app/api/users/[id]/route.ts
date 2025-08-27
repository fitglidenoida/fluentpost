import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get user from database (mock data since related tables don't exist)
    const user = db.queryFirst('SELECT * FROM User WHERE id = ?', [id])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Add mock counts and related data
    const enrichedUser = {
      ...user,
      _count: {
        blogPosts: 0,
        socialPosts: 0,
        campaigns: 0,
        topics: 0
      },
      blogPosts: [],
      socialPosts: []
    }

    return NextResponse.json(enrichedUser)
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Update user in database
    db.execute(
      'UPDATE User SET name = ?, email = ?, role = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      [validatedData.name, validatedData.email, validatedData.role, id]
    )

    const updatedUser = db.queryFirst('SELECT * FROM User WHERE id = ?', [id])

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const user = db.queryFirst('SELECT * FROM User WHERE id = ?', [id])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user from database
    db.execute('DELETE FROM User WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}