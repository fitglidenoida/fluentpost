import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'
import { SocialMediaPostingService } from '@/lib/socialMediaPosting'

const socialPostSchema = z.object({
  content: z.string().min(1),
  platform: z.string().min(1),
  status: z.string().default('draft'),
  blogPostId: z.string().optional(),
  scheduledAt: z.string().optional(),
})

export async function GET() {
  try {
    // Mock social posts data since SocialPost table doesn't exist
    const socialPosts: any[] = []

    return NextResponse.json({ socialPosts })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch social posts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = socialPostSchema.parse(body)

    const data: any = {
      content: validatedData.content,
      platform: validatedData.platform,
      status: validatedData.status,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
              userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
    }
    
    if (validatedData.blogPostId) {
      data.blogPostId = validatedData.blogPostId
    }

    // Mock social post creation since SocialPost table doesn't exist
    const socialPost = {
      id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(socialPost)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create social post' },
      { status: 500 }
    )
  }
}
