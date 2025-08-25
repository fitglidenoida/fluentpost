import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check if Twitter credentials are configured
    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET
    const accessToken = process.env.TWITTER_ACCESS_TOKEN
    const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json({
        success: false,
        error: 'Twitter credentials not configured. Please add TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET to your environment variables.'
      })
    }

    // Test Twitter API connection by making a real API call
    try {
      console.log('Testing Twitter connection with real API call...')
      
      // Make a real API call to verify credentials
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result.data) {
        console.log('Twitter API test successful:', result.data)
        
        // Store connection status in database
        const currentSettings = await prisma.appSettings.findFirst({
          where: { key: 'user_settings' }
        })

        let settings = currentSettings ? JSON.parse(currentSettings.value) : {
          notifications: { email: true, push: false, weeklyReports: true, viralAlerts: true },
          ai: { autoGenerate: false, costFreeMode: true, gptPlusWorkflow: true },
          content: { autoPublish: false, reviewBeforePublish: true, defaultPlatforms: ['twitter', 'linkedin'] },
          analytics: { trackUserBehavior: true, shareData: false, realTimeUpdates: true },
          socialMedia: {
            twitter: { connected: false },
            linkedin: { connected: false },
            facebook: { connected: false },
            instagram: { connected: false },
            tiktok: { connected: false },
            youtube: { connected: false }
          }
        }

        // Ensure socialMedia object exists
        if (!settings.socialMedia) {
          settings.socialMedia = {
            twitter: { connected: false },
            linkedin: { connected: false },
            facebook: { connected: false },
            instagram: { connected: false },
            tiktok: { connected: false },
            youtube: { connected: false }
          }
        }

        // Update Twitter connection with real user data
        settings.socialMedia.twitter = {
          connected: true,
          apiKey: apiKey,
          apiSecret: apiSecret,
          accessToken: accessToken,
          accessTokenSecret: accessTokenSecret,
          userId: result.data.id,
          username: result.data.username,
          name: result.data.name,
          connectedAt: new Date().toISOString()
        }

        // Save to database
        await prisma.appSettings.upsert({
          where: { key: 'user_settings' },
          update: { value: JSON.stringify(settings) },
          create: { key: 'user_settings', value: JSON.stringify(settings) }
        })

        return NextResponse.json({
          success: true,
          message: `Twitter connected successfully! Connected as @${result.data.username}`,
          user: {
            id: result.data.id,
            username: result.data.username,
            name: result.data.name
          },
          connectedAt: new Date().toISOString()
        })
      } else {
        console.error('Twitter API test failed:', result)
        return NextResponse.json({
          success: false,
          error: `Twitter API error: ${result.errors?.[0]?.message || 'Invalid credentials'}`
        })
      }

    } catch (apiError: any) {
      console.error('Twitter API test error:', apiError)
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Twitter API: ${apiError.message}`
      })
    }

  } catch (error: any) {
    console.error('Twitter connection test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while testing Twitter connection.'
    })
  }
}
