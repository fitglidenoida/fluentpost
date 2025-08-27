import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { SocialMediaPostingService } from '@/lib/socialMediaPosting'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { threadId } = body

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      )
    }

    // Get the thread from database
    const thread = await prisma.socialPost.findUnique({
      where: { id: threadId }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Parse the thread content
    const threadData = JSON.parse(thread.content)
    const { tweets, postingStrategy, isBlueTickUser } = threadData

    // Post based on strategy
    const postingService = new SocialMediaPostingService()
    const results = []

    if (postingStrategy === 'single' && isBlueTickUser) {
      // Single long-form post for Blue tick users
      try {
        const result = await postingService.postToTwitter({
          text: tweets[0].text,
          platform: 'twitter'
        })

        if (result.success) {
          results.push({
            tweetOrder: 1,
            success: true,
            tweetId: result.postId,
            url: result.url,
            type: 'single-long-form'
          })
        } else {
          results.push({
            tweetOrder: 1,
            success: false,
            error: result.error,
            type: 'single-long-form'
          })
        }
      } catch (error: any) {
        results.push({
          tweetOrder: 1,
          success: false,
          error: error.message,
          type: 'single-long-form'
        })
      }
    } else {
      // Thread posting for free users
      let previousTweetId = null

      for (const tweet of tweets) {
        try {
          // Add thread context if not the first tweet
          let tweetText = tweet.text
          if (previousTweetId) {
            tweetText += `\n\nReplying to previous tweet in thread...`
          }

          const result = await postingService.postToTwitter({
            text: tweetText,
            platform: 'twitter'
          })

          if (result.success) {
            results.push({
              tweetOrder: tweet.order,
              success: true,
              tweetId: result.postId,
              url: result.url,
              type: 'thread'
            })
            previousTweetId = result.postId
          } else {
            results.push({
              tweetOrder: tweet.order,
              success: false,
              error: result.error,
              type: 'thread'
            })
          }

          // Add delay between tweets to avoid rate limiting
          if (tweet.order < tweets.length) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }

        } catch (error: any) {
          results.push({
            tweetOrder: tweet.order,
            success: false,
            error: error.message,
            type: 'thread'
          })
        }
      }
    }

    // Update thread status
    const successCount = results.filter(r => r.success).length
    const status = successCount === tweets.length ? 'posted' : 
                   successCount > 0 ? 'partial' : 'failed'

    await prisma.socialPost.update({
      where: { id: threadId },
      data: {
        status,
        postedAt: new Date(),
        engagement: JSON.stringify(results)
      }
    })

    return NextResponse.json({
      success: true,
      results,
      status,
      totalTweets: tweets.length,
      successfulTweets: successCount
    })

  } catch (error: any) {
    console.error('Error posting thread:', error)
    return NextResponse.json(
      { error: 'Failed to post thread' },
      { status: 500 }
    )
  }
}
