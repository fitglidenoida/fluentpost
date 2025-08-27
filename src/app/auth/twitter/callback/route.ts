import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/settings?error=twitter_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=no_authorization_code', request.url))
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/auth/twitter/callback`,
        code_verifier: 'challenge' // You should implement PKCE properly
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Twitter token exchange error:', tokenData)
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url))
    }

    // Store the access token in database
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
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
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

    return NextResponse.redirect(new URL('/settings?success=twitter_connected', request.url))

  } catch (error) {
    console.error('Twitter callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url))
  }
}
