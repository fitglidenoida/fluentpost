import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

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
    const { id } = await params

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
    const { id } = await params
    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

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
    const { id } = await params

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
