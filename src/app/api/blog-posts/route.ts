import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  topicId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const topicId = searchParams.get('topicId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) where.status = status
    if (topicId) where.topicId = topicId

    const blogPosts = await prisma.blogPost.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        _count: {
          select: {
            socialPosts: true,
          },
        },
      },
    })

    const total = await prisma.blogPost.count({ where })

    return NextResponse.json({
      blogPosts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = blogPostSchema.parse(body)

    // Generate slug from title
    const slug = generateSlug(validatedData.title)

    // Create the blog post with real data
    const blogPost = await prisma.blogPost.create({
      data: {
        ...validatedData,
        slug,
        userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
        viralScore: 0, // Will be calculated based on engagement
        views: 0,
        shares: 0,
        likes: 0,
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      })

    return NextResponse.json(blogPost, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
