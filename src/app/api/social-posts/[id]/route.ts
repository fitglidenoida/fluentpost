import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const updateSocialPostSchema = z.object({
  content: z.string().min(1),
  platform: z.enum(['twitter', 'facebook', 'linkedin', 'instagram']),
  status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
  blogPostId: z.string().optional(),
  scheduledAt: z.string().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = updateSocialPostSchema.parse(body)

    // Mock social post update since SocialPost table doesn't exist
    const updatedSocialPost = {
      id,
      ...validatedData,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
      updatedAt: new Date(),
      blogPost: validatedData.blogPostId ? {
        id: validatedData.blogPostId,
        title: 'Sample Blog Post',
        slug: 'sample-blog-post'
      } : null
    }

    return NextResponse.json(updatedSocialPost)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating social post:', error)
    return NextResponse.json(
      { error: 'Failed to update social post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    // Mock social post deletion since SocialPost table doesn't exist
    console.log(`Mock: Deleted social post ${id}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting social post:', error)
    return NextResponse.json(
      { error: 'Failed to delete social post' },
      { status: 500 }
    )
  }
}
