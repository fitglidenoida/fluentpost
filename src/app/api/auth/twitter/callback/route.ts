import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Get the base URL dynamically from the request
    const baseUrl = process.env.NEXTAUTH_URL || 
                   `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host') || request.headers.get('host')}`
    
    console.log('Base URL for OAuth callback:', baseUrl)

    if (error) {
      return NextResponse.redirect(new URL('/settings?error=twitter_auth_failed', baseUrl))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=twitter_no_code', baseUrl))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}:${process.env.NEXT_PUBLIC_TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${baseUrl}/api/auth/twitter/callback`,
        code_verifier: state || 'challenge' // In production, use proper PKCE
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Twitter token exchange failed:', tokenData)
      return NextResponse.redirect(new URL('/settings?error=twitter_token_failed', baseUrl))
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
      return NextResponse.redirect(new URL('/settings?error=twitter_user_failed', baseUrl))
    }

    // Store Twitter credentials in database
    const currentSettings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )

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

    // Save to database (manual upsert)
    const settingsId = `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const existingSettings = db.queryFirst('SELECT id FROM AppSettings WHERE key = ?', ['user_settings'])
    
    if (existingSettings) {
      db.execute(
        'UPDATE AppSettings SET value = ?, updatedAt = datetime(\'now\') WHERE key = ?',
        [JSON.stringify(settings), 'user_settings']
      )
    } else {
      db.execute(
        'INSERT INTO AppSettings (id, key, value, createdAt, updatedAt) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
        [settingsId, 'user_settings', JSON.stringify(settings)]
      )
    }

    // Redirect back to settings with success
    return NextResponse.redirect(new URL(`/settings?success=twitter_connected&username=${userData.data.username}`, baseUrl))

  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    // Use a fallback URL if we can't determine the base URL
    const fallbackUrl = process.env.NEXTAUTH_URL || 'https://fluentpost.in'
    return NextResponse.redirect(new URL('/settings?error=twitter_callback_failed', fallbackUrl))
  }
}
