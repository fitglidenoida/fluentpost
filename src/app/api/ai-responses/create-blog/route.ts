import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
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
    const aiResponse = null,
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
    const blogPost = { id: `mock_${Date.now()}` },
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
    { id: `mock_${Date.now()}` },
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
