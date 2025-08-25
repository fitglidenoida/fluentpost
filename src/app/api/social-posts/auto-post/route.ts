import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
      // Get the blog post
      blogPost = await prisma.blogPost.findUnique({
        where: { id: blogPostId },
        include: { topic: true },
      })

      if (!blogPost) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        )
      }
    } else if (socialPostId) {
      // Get the social post
      existingSocialPost = await prisma.socialPost.findUnique({
        where: { id: socialPostId },
        include: { blogPost: true },
      })

      if (!existingSocialPost) {
        return NextResponse.json(
          { error: 'Social post not found' },
          { status: 404 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Either blogPostId or socialPostId is required' },
        { status: 400 }
      )
    }

    // Get social media settings
    const settings = await prisma.appSettings.findFirst({
      where: { key: 'user_settings' },
    })

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
      
      socialPostRecord = await prisma.socialPost.create({
        data: {
          content: postContent,
          platform: platforms.join(','),
          status: 'scheduled',
          userId: 'cmepgmh280000v37z3o18yro8',
          blogPostId: blogPost.id,
        },
      })
    } else if (existingSocialPost) {
      postContent = existingSocialPost.content
      socialPostRecord = existingSocialPost
      
      // Update the existing social post status
      await prisma.socialPost.update({
        where: { id: existingSocialPost.id },
        data: { status: 'scheduled' },
      })
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

        // Update social post status
        if (postResult.success && socialPostRecord) {
          await prisma.socialPost.update({
            where: { id: socialPostRecord.id },
            data: { 
              status: 'published',
              publishedAt: new Date(),
            },
          })
        }

      } catch (error: any) {
        results.push({
          platform,
          success: false,
          error: error.message,
        })
      }
    }

    // Update blog post analytics if posting from a blog post
    if (blogPostId) {
      await prisma.blogPost.update({
        where: { id: blogPostId },
        data: {
          shares: { increment: 1 },
        },
      })
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
