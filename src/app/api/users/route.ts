import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build where clause for filtering
    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Note: The User model doesn't have a status field, so we'll use role instead
    // or you can add a status field to the User model if needed
    if (status !== 'all') {
      whereClause.role = status
    }

    const users = await prisma.user.findMany({
      where: whereClause,
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
            views: true,
            shares: true,
            likes: true,
            viralScore: true
          }
        },
        socialPosts: {
          select: {
            views: true,
            shares: true,
            likes: true,
            viralScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the expected format
    const transformedUsers = users.map((user: any) => {
      // Calculate viral score from blog posts and social posts
      const totalViralScore = [
        ...user.blogPosts.map((post: any) => post.viralScore),
        ...user.socialPosts.map((post: any) => post.viralScore)
      ].reduce((sum, score) => sum + score, 0)
      
      const totalPosts = user.blogPosts.length + user.socialPosts.length
      const averageViralScore = totalPosts > 0 ? totalViralScore / totalPosts : 0

      // Calculate total engagement
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

      return {
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email,
        status: user.role === 'admin' ? 'active' : (user.role === 'user' ? 'active' : 'inactive'),
        joinDate: user.createdAt.toISOString().split('T')[0],
        lastActive: user.updatedAt.toISOString().split('T')[0],
        source: 'direct', // Default source since we don't track this
        viralScore: parseFloat(averageViralScore.toFixed(1)),
        role: user.role,
        totalPosts: totalPosts,
        totalViews,
        totalShares,
        totalLikes,
        blogPostsCount: user._count.blogPosts,
        socialPostsCount: user._count.socialPosts,
        campaignsCount: user._count.campaigns,
        topicsCount: user._count.topics
      }
    })

    return NextResponse.json({ users: transformedUsers })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
