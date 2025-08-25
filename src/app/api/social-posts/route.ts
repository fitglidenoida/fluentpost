import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    const socialPosts = await prisma.socialPost.findMany({
      orderBy: { createdAt: 'desc' },
    })

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

    const socialPost = await prisma.socialPost.create({
      data,
    })

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
