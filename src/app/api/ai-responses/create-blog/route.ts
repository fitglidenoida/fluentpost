import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const createBlogSchema = z.object({
  aiResponseId: z.string(),
  topicId: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { aiResponseId, topicId } = createBlogSchema.parse(body)

    // Get the AI response (mock response since table doesn't exist)
    const aiResponse = null

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'AI response not found' },
        { status: 404 }
      )
    }

    // Mock blog post creation since BlogPost table doesn't exist
    const blogPost = {
      id: `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Generated Blog Post',
      content: 'Mock blog post content',
      status: 'draft',
      userId: 'cmerb0ul10000v37n3jqqjoq4',
      topicId: topicId || null,
      topic: null
    }

    return NextResponse.json(blogPost, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating blog from AI response:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}