import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateBlogPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  topicId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = updateBlogPostSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        ...validatedData,
        slug,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedBlogPost)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
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
    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
