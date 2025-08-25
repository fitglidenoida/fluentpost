import { NextRequest, NextResponse } from 'next/server'
import { ThreadConverter } from '@/lib/threadConverter'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aiResponseId, title } = body

    if (!aiResponseId) {
      return NextResponse.json(
        { error: 'AI Response ID is required' },
        { status: 400 }
      )
    }

    // Get the AI response from database
    const aiResponse = await prisma.aIResponse.findUnique({
      where: { id: aiResponseId }
    })

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'AI Response not found' },
        { status: 404 }
      )
    }

    // Use the raw AI response content directly
    const content = aiResponse.response

    // Get Twitter access token for Blue tick detection
    const settings = await prisma.appSettings.findFirst({
      where: { key: 'user_settings' }
    })
    
    let accessToken = null
    if (settings) {
      const userSettings = JSON.parse(settings.value)
      accessToken = userSettings.socialMedia?.twitter?.accessToken
    }

    // Convert content to thread
    const threadConverter = new ThreadConverter()
    const threadResult = await threadConverter.convertToThread(content, title, accessToken)

    // Store the thread in database
    const thread = await prisma.socialPost.create({
      data: {
        content: JSON.stringify(threadResult),
        platform: 'twitter',
        type: 'thread',
        title: title || aiResponse.prompt,
        userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
        scheduledAt: new Date(),
        status: 'draft'
      }
    })

    return NextResponse.json({
      success: true,
      thread: {
        id: thread.id,
        tweets: threadResult.tweets,
        totalTweets: threadResult.totalTweets,
        estimatedReadTime: threadResult.estimatedReadTime,
        isBlueTickUser: threadResult.isBlueTickUser,
        postingStrategy: threadResult.postingStrategy
      }
    })

  } catch (error: any) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
