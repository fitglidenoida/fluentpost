import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/settings?error=twitter_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=twitter_no_code', request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`,
        code_verifier: state || 'challenge' // In production, use proper PKCE
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Twitter token exchange failed:', tokenData)
      return NextResponse.redirect(new URL('/settings?error=twitter_token_failed', request.url))
    }

    // Get user info with access token
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error('Twitter user info failed:', userData)
      return NextResponse.redirect(new URL('/settings?error=twitter_user_failed', request.url))
    }

    // Store Twitter credentials in database
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

    // Update Twitter connection
    settings.socialMedia.twitter = {
      connected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      userId: userData.data.id,
      username: userData.data.username,
      name: userData.data.name,
      connectedAt: new Date().toISOString()
    }

    // Save to database
    await prisma.appSettings.upsert({
      where: { key: 'user_settings' },
      update: { value: JSON.stringify(settings) },
      create: { key: 'user_settings', value: JSON.stringify(settings) }
    })

    // Redirect back to settings with success
    return NextResponse.redirect(new URL(`/settings?success=twitter_connected&username=${userData.data.username}`, request.url))

  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=twitter_callback_failed', request.url))
  }
}
