import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'overview'

    if (type === 'overview') {
      // Mock analytics data since blog/social post tables don't exist in our current schema
      const blogPosts = 0
      const socialPosts = 0
      const totalViews = { _sum: { views: 0 } }
      const totalShares = { _sum: { shares: 0 } }
      const totalLikes = { _sum: { likes: 0 } }
      const recentBlogPosts: any[] = []
      const recentSocialPosts: any[] = []

      // Calculate viral coefficient (simplified)
      const viralCoefficient = totalViews._sum.views && totalShares._sum.shares 
        ? (totalShares._sum.shares / totalViews._sum.views * 100).toFixed(2)
        : '0.00'

      // Create top performing content
      const topContent = recentBlogPosts.map((post: any) => ({
        title: post.title,
        views: post.views || 0,
        shares: post.shares || 0,
        likes: post.likes || 0,
        viralScore: post.viralScore || 0
      }))

      // Create recent activity
      const recentActivity = [
        ...recentBlogPosts.map((post: any) => ({
          type: 'blog_published',
          title: post.title,
          time: new Date(post.createdAt).toLocaleDateString()
        })),
        ...recentSocialPosts.map((post: any) => ({
          type: 'social_posted',
          platform: post.platform,
          time: new Date(post.createdAt).toLocaleDateString()
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

      return NextResponse.json({
        totalUsers: 1250, // Mock data for now
        viralCoefficient,
        totalViews: totalViews._sum.views || 0,
        totalShares: totalShares._sum.shares || 0,
        totalLikes: totalLikes._sum.likes || 0,
        topContent,
        recentActivity,
        blogPostsCount: blogPosts,
        socialPostsCount: socialPosts
      })
    }

    return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.type || !body.metric || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: type, metric, value' },
        { status: 400 }
      )
    }

    const analytics = await prisma.analytics.create({
      data: {
        type: body.type,
        metric: body.metric,
        value: body.value,
        date: body.date ? new Date(body.date) : new Date(),
        source: body.source || 'manual',
        userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
        blogPostId: body.blogPostId,
        socialPostId: body.socialPostId,
        campaignId: body.campaignId,
      },
    })

    return NextResponse.json({
      success: true,
      data: analytics,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating analytics entry:', error)
    return NextResponse.json(
      { error: 'Failed to create analytics entry' },
      { status: 500 }
    )
  }
}
