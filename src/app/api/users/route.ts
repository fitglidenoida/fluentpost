import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Filter by role/status
    if (status !== 'all') {
      whereClause.role = status
    }

    // For non-admin users, only show their own data
    if (session.user.role !== 'admin') {
      whereClause.id = session.user.id
    }

    // Get users from database with simpler query (related tables don't exist)
    let users = db.query('SELECT * FROM User ORDER BY createdAt DESC')
    
    // Apply search filter manually if needed
    if (search) {
      users = users.filter((user: any) => 
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply status filter manually if needed
    if (status !== 'all') {
      users = users.filter((user: any) => user.role === status)
    }
    
    // Add mock data for related tables that don't exist
    users = users.map((user: any) => ({
      ...user,
      _count: {
        blogPosts: 0,
        socialPosts: 0,
        campaigns: 0,
        topics: 0
      },
      blogPosts: [],
      socialPosts: []
    }))

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
