import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['social_post', 'blog_post', 'campaign']),
  date: z.string(),
  description: z.string().optional(),
  platform: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Mock calendar data since related tables don't exist
    const socialPosts = []
    const blogPosts = []
    const campaigns = []

    // Create calendar events
    const events = [
      ...socialPosts.map((post: any) => ({
        id: post.id,
        title: post.content?.substring(0, 50) + '...',
        type: 'social_post',
        date: post.scheduledAt || post.createdAt,
        status: post.status,
        platform: post.platform,
        blogPost: post.blogPost
      })),
      ...blogPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        type: 'blog_post',
        date: post.publishedAt || post.createdAt,
        status: post.status,
        excerpt: post.excerpt
      })),
      ...campaigns.map((campaign: any) => ({
        id: campaign.id,
        title: campaign.name,
        type: 'campaign',
        date: campaign.startDate,
        status: campaign.status,
        description: campaign.description
      }))
    ]

    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // Create calendar event based on type
    let result
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    switch (validatedData.type) {
      case 'social_post':
        // Mock social post creation
        result = {
          id: eventId,
          content: validatedData.title,
          platform: validatedData.platform || 'twitter',
          status: 'scheduled',
          scheduledAt: validatedData.date,
          userId: 'cmerb0ul10000v37n3jqqjoq4'
        }
        break
        
      case 'blog_post':
        // Mock blog post creation
        result = {
          id: eventId,
          title: validatedData.title,
          status: 'scheduled',
          publishedAt: validatedData.date,
          userId: 'cmerb0ul10000v37n3jqqjoq4'
        }
        break
        
      case 'campaign':
        // Mock campaign creation
        result = {
          id: eventId,
          name: validatedData.title,
          description: validatedData.description,
          status: 'scheduled',
          startDate: validatedData.date,
          userId: 'cmerb0ul10000v37n3jqqjoq4'
        }
        break
    }

    return NextResponse.json({
      success: true,
      event: result
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}