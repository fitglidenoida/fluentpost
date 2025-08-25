import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createBlogSchema = z.object({
  aiResponseId: z.string(),
  topicId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { aiResponseId, topicId } = createBlogSchema.parse(body)

    // Get the AI response
    const aiResponse = await prisma.aIResponse.findUnique({
      where: { id: aiResponseId },
    })

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'AI response not found' },
        { status: 404 }
      )
    }

    // Parse the response to get blog data
    const responseData = JSON.parse(aiResponse.response)
    
    // Generate slug from title
    const slug = responseData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create the blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title: responseData.title,
        slug,
        content: aiResponse.content, // Use the cleaned content
        excerpt: responseData.excerpt || '',
        seoTitle: responseData.seoTitle || responseData.title,
        seoDescription: responseData.seoDescription || '',
        metaKeywords: responseData.metaKeywords || '',
        status: 'draft',
        userId: 'cmepgmh280000v37z3o18yro8', // Default user ID
        topicId: topicId || null,
        viralScore: 0,
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

    // Update AI response status to 'used'
    await prisma.aIResponse.update({
      where: { id: aiResponseId },
      data: { status: 'used' },
    })

    return NextResponse.json(blogPost, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating blog post from AI response:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
