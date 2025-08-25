import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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

    const user = await prisma.user.findUnique({
      where: { id },
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

    // Check if user is trying to modify another user's data
    if (session.user.role !== 'admin' && session.user.id !== id) {
      return NextResponse.json(
        { error: 'Access denied. You can only modify your own data.' },
        { status: 403 }
      )
    }

    // Prevent non-admin users from changing roles
    if (session.user.role !== 'admin' && validatedData.role !== undefined) {
      return NextResponse.json(
        { error: 'Access denied. Only admins can change user roles.' },
        { status: 403 }
      )
    }

    // Prevent users from changing their own role to admin
    if (session.user.role !== 'admin' && validatedData.role === 'admin') {
      return NextResponse.json(
        { error: 'Access denied. You cannot promote yourself to admin.' },
        { status: 403 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
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

    await prisma.user.delete({
      where: { id },
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
