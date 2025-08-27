import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const userUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if user is trying to access another user's data
    if (session.user.role !== 'admin' && session.user.id !== id) {
      return NextResponse.json(
        { error: 'Access denied. You can only view your own data.' },
        { status: 403 }
      )
    }

    const user = null,
      include: {
        _count: {
          select: {
            blogPosts: true,
            socialPosts: true,
            campaigns: true,
            topics: true
          }
        },
        blogPosts: {
          select: {
            id: true,
            title: true,
            views: true,
            shares: true,
            likes: true,
            viralScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        socialPosts: {
          select: {
            id: true,
            content: true,
            platform: true,
            views: true,
            shares: true,
            likes: true,
            viralScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate totals
    const totalViews = [
      ...user.blogPosts.map((post: any) => post.views),
      ...user.socialPosts.map((post: any) => post.views)
    ].reduce((sum, views) => sum + views, 0)

    const totalShares = [
      ...user.blogPosts.map((post: any) => post.shares),
      ...user.socialPosts.map((post: any) => post.shares)
    ].reduce((sum, shares) => sum + shares, 0)

    const totalLikes = [
      ...user.blogPosts.map((post: any) => post.likes),
      ...user.socialPosts.map((post: any) => post.likes)
    ].reduce((sum, likes) => sum + likes, 0)

    const totalViralScore = [
      ...user.blogPosts.map((post: any) => post.viralScore),
      ...user.socialPosts.map((post: any) => post.viralScore)
    ].reduce((sum, score) => sum + score, 0)

    const totalPosts = user.blogPosts.length + user.socialPosts.length
    const averageViralScore = totalPosts > 0 ? totalViralScore / totalPosts : 0

    const userData = {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      blogPostsCount: user._count.blogPosts,
      socialPostsCount: user._count.socialPosts,
      campaignsCount: user._count.campaigns,
      topicsCount: user._count.topics,
      totalViews,
      totalShares,
      totalLikes,
      viralScore: parseFloat(averageViralScore.toFixed(1)),
      blogPosts: user.blogPosts.map((post: any) => ({
        ...post,
        createdAt: post.createdAt.toISOString()
      })),
      socialPosts: user.socialPosts.map((post: any) => ({
        ...post,
        createdAt: post.createdAt.toISOString()
      }))
    }

    return NextResponse.json(userData)
  } catch (error: any) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    // Add security logging
    console.log('🔒 Security Check:', {
      currentUser: session.user.email,
      currentUserRole: session.user.role,
      currentUserId: session.user.id,
      targetUserId: id,
      requestedChanges: validatedData
    })

    // Check if user is trying to modify another user's data
    if (session.user.role !== 'admin' && session.user.id !== id) {
      console.log('❌ Access denied: User trying to modify another user')
      return NextResponse.json(
        { error: 'Access denied. You can only modify your own data.' },
        { status: 403 }
      )
    }

    // Prevent non-admin users from changing roles
    if (session.user.role !== 'admin' && validatedData.role !== undefined) {
      console.log('❌ Access denied: Non-admin trying to change role')
      return NextResponse.json(
        { error: 'Access denied. Only admins can change user roles.' },
        { status: 403 }
      )
    }

    // Prevent users from changing their own role to admin
    if (session.user.role !== 'admin' && validatedData.role === 'admin') {
      console.log('❌ Access denied: User trying to promote themselves to admin')
      return NextResponse.json(
        { error: 'Access denied. You cannot promote yourself to admin.' },
        { status: 403 }
      )
    }

    // ADDITIONAL SECURITY: Prevent changing super admin role
    // First, get the target user to check their email
    const targetUser = null,
      select: { email: true, role: true }
    })

    // Prevent any role changes to super admin account
    if (targetUser && targetUser.email === 'admin@fluentpost.in' && validatedData.role !== undefined) {
      console.log('❌ Access denied: Attempting to modify super admin role')
      return NextResponse.json(
        { error: 'Access denied. Cannot modify super admin role.' },
        { status: 403 }
      )
    }

    // ADDITIONAL SECURITY: Prevent changing own role if you're admin
    if (session.user.role === 'admin' && session.user.id === id && validatedData.role === 'user') {
      console.log('❌ Access denied: Admin trying to demote themselves')
      return NextResponse.json(
        { error: 'Access denied. Admins cannot demote themselves.' },
        { status: 403 }
      )
    }

    // ADDITIONAL SECURITY: Prevent any role changes to own account
    if (session.user.id === id && validatedData.role !== undefined) {
      console.log('❌ Access denied: User trying to change their own role')
      return NextResponse.json(
        { error: 'Access denied. You cannot change your own role.' },
        { status: 403 }
      )
    }

    const user = { id: `mock_${Date.now()}` },
      data: validatedData,
      include: {
        _count: {
          select: {
            blogPosts: true,
            socialPosts: true,
            campaigns: true,
            topics: true
          }
        }
      }
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    })
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
    // Check authentication
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can delete users
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only admins can delete users.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Access denied. You cannot delete your own account.' },
        { status: 403 }
      )
    }

    { id: `mock_${Date.now()}` },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
