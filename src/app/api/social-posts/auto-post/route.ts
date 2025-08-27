import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'
import { SocialMediaPostingService } from '@/lib/socialMediaPosting'

const autoPostSchema = z.object({
  blogPostId: z.string().optional(),
  socialPostId: z.string().optional(),
  platforms: z.array(z.string()).default(['twitter', 'facebook']),
  customMessage: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { blogPostId, socialPostId, platforms, customMessage } = autoPostSchema.parse(body)

    let blogPost = null
    let existingSocialPost = null

    if (blogPostId) {
      // Mock blog post data since BlogPost table doesn't exist in current schema
      blogPost = {
        id: blogPostId,
        title: 'Sample Blog Post',
        excerpt: 'This is a sample blog post for social media posting.',
        slug: 'sample-blog-post',
        topic: null
      }
    } else if (socialPostId) {
      // Mock social post data since SocialPost table doesn't exist in current schema
      existingSocialPost = {
        id: socialPostId,
        content: 'Sample social media post content',
        platform: platforms.join(','),
        status: 'draft',
        blogPost: null,
        publishedAt: null as Date | null,
      }
    } else {
      return NextResponse.json(
        { error: 'Either blogPostId or socialPostId is required' },
        { status: 400 }
      )
    }

    // Get social media settings
    const settings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )

    if (!settings) {
      return NextResponse.json(
        { error: 'Social media settings not configured' },
        { status: 400 }
      )
    }

    const allSettings = JSON.parse(settings.value)
    const socialMediaSettings = allSettings.socialMedia
    const postingService = new SocialMediaPostingService()
    const results = []

    // Determine content and create/update social post record
    let postContent = ''
    let socialPostRecord = null

    if (blogPost) {
      postContent = customMessage || `${blogPost.title}\n\n${blogPost.excerpt}\n\nRead more: https://fitglide.in/blog/${blogPost.slug}`
      
      // Mock social post record since SocialPost table doesn't exist
      socialPostRecord = {
        id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: postContent,
        platform: platforms.join(','),
        status: 'scheduled',
        userId: 'cmerb0ul10000v37n3jqqjoq4',
        blogPostId: blogPost.id,
        publishedAt: null as Date | null,
      }
    } else if (existingSocialPost) {
      postContent = existingSocialPost.content
      socialPostRecord = existingSocialPost
      
      // Mock update of social post status
      existingSocialPost.status = 'scheduled'
    }

    // Post to each platform
    for (const platform of platforms) {
      try {
        const platformSettings = socialMediaSettings[platform]
        
        if (!platformSettings?.connected) {
          results.push({
            platform,
            success: false,
            error: `${platform} not connected`,
          })
          continue
        }

        let platformContent = postContent

        // Platform-specific formatting
        if (blogPost) {
          switch (platform) {
            case 'twitter':
              platformContent = postContent.substring(0, 280) // Twitter character limit
              break
            case 'facebook':
              platformContent = `${blogPost.title}\n\n${blogPost.excerpt}\n\n#FitGlide #Fitness #Health`
              break
            case 'linkedin':
              platformContent = `${blogPost.title}\n\n${blogPost.excerpt}\n\nRead the full article on our blog. #FitGlide #Fitness #ProfessionalDevelopment`
              break
          }
        }

        const postResults = await postingService.postToMultiplePlatforms({
          text: platformContent,
          platform: platform,
          link: blogPost ? `https://fitglide.in/blog/${blogPost.slug}` : undefined,
        }, [platform])

        const postResult = postResults[0] // Get the first (and only) result

        results.push({
          platform,
          success: postResult.success,
          error: postResult.error,
          postId: postResult.postId,
        })

        // Mock update of social post status
        if (postResult.success && socialPostRecord) {
          socialPostRecord.status = 'published'
          socialPostRecord.publishedAt = new Date()
        }

      } catch (error: any) {
        results.push({
          platform,
          success: false,
          error: error.message,
        })
      }
    }

    // Mock update of blog post analytics (BlogPost table doesn't exist)
    if (blogPostId) {
      console.log(`Mock: Incremented shares for blog post ${blogPostId}`)
    }

    return NextResponse.json({
      success: true,
      socialPostId: socialPostRecord?.id,
      results,
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error auto-posting to social media:', error)
    return NextResponse.json(
      { error: 'Failed to post to social media' },
      { status: 500 }
    )
  }
}
