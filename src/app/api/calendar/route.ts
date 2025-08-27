import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || String(new Date().getMonth() + 1)
    const year = searchParams.get('year') || String(new Date().getFullYear())

    // Get the start and end of the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0)

    // Fetch scheduled social posts
    const socialPosts = []
      },
      include: {
        blogPost: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    // Fetch blog posts with published dates
    const blogPosts = []
      },
      orderBy: {
        publishedAt: 'asc'
      }
    })

    // Fetch campaigns with start dates
    const campaigns = []
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Transform data into calendar events
    const events: any[] = []

    // Add social posts
    socialPosts.forEach((post: any) => {
      events.push({
        id: `social-${post.id}`,
        title: post.blogPost ? `Social: ${post.blogPost.title}` : `Social: ${post.content.substring(0, 30)}...`,
        type: 'social',
        date: post.scheduledAt.toISOString().split('T')[0],
        time: post.scheduledAt.toTimeString().split(' ')[0].substring(0, 5),
        status: post.status,
        platform: post.platform,
        content: post.content,
        socialPostId: post.id,
        blogPostId: post.blogPostId
      })
    })

    // Add blog posts
    blogPosts.forEach((post: any) => {
      events.push({
        id: `blog-${post.id}`,
        title: `Blog: ${post.title}`,
        type: 'blog',
        date: post.publishedAt.toISOString().split('T')[0],
        time: post.publishedAt.toTimeString().split(' ')[0].substring(0, 5),
        status: post.status,
        slug: post.slug,
        blogPostId: post.id
      })
    })

    // Add campaigns
    campaigns.forEach((campaign: any) => {
      events.push({
        id: `campaign-${campaign.id}`,
        title: `Campaign: ${campaign.name}`,
        type: 'campaign',
        date: campaign.startDate.toISOString().split('T')[0],
        time: campaign.startDate.toTimeString().split(' ')[0].substring(0, 5),
        status: campaign.status,
        description: campaign.description,
        campaignId: campaign.id
      })
    })

    // Sort events by date and time
    events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

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
    const { type, title, content, date, time, platform, status, description, goal, targetAudience, budget } = body

    // Validate required fields
    if (!type || !title || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, date, time' },
        { status: 400 }
      )
    }

    // Combine date and time
    const scheduledDate = new Date(`${date}T${time}`)
    
    // Default user ID (you might want to get this from authentication)
    const userId = 'cmerb0ul10000v37n3jqqjoq4'

    let result

    switch (type) {
      case 'social':
        result = { id: `mock_${Date.now()}` }
        })
        break

      case 'blog':
        result = { id: `mock_${Date.now()}` }
        })
        break

      case 'campaign':
        result = { id: `mock_${Date.now()}` }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid event type. Must be social, blog, or campaign' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true, 
      event: result,
      message: `${type} event created successfully` 
    })

  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
