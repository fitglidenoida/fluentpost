import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/settings?error=facebook_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=no_authorization_code', request.url))
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!)
    tokenUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/auth/facebook/callback`)
    tokenUrl.searchParams.set('code', code)

    const response = await fetch(tokenUrl.toString())
    const tokenData = await response.json()

    if (tokenData.error) {
      console.error('Facebook token exchange error:', tokenData)
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url))
    }

    // Store the access token in database
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

    // Update Facebook connection
    settings.socialMedia.facebook = {
      connected: true,
      accessToken: tokenData.access_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }

    // Save to database
    await prisma.appSettings.upsert({
      where: { key: 'user_settings' },
      update: { value: JSON.stringify(settings) },
      create: { key: 'user_settings', value: JSON.stringify(settings) }
    })

    return NextResponse.redirect(new URL('/settings?success=facebook_connected', request.url))

  } catch (error) {
    console.error('Facebook callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url))
  }
}
