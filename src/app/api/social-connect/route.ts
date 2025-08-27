import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const socialConnectSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube']),
  credentials: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    accessTokenSecret: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    appId: z.string().optional(),
    appSecret: z.string().optional(),
    channelId: z.string().optional()
  })
})

class SocialMediaConnector {
  async validateFacebookCredentials(credentials: any): Promise<boolean> {
    if (!credentials.accessToken) return false
    
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${credentials.accessToken}`)
      const result = await response.json()
      return !result.error
    } catch {
      return false
    }
  }

  async validateTwitterCredentials(credentials: any): Promise<boolean> {
    if (!credentials.accessToken) return false
    
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      })
      const result = await response.json()
      return !result.errors
    } catch {
      return false
    }
  }

  async validateLinkedInCredentials(credentials: any): Promise<boolean> {
    if (!credentials.accessToken) return false
    
    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      })
      const result = await response.json()
      return !result.error
    } catch {
      return false
    }
  }

  async validateInstagramCredentials(credentials: any): Promise<boolean> {
    // Instagram uses Facebook Graph API
    return this.validateFacebookCredentials(credentials)
  }

  async storeCredentials(platform: string, credentials: any): Promise<void> {
    const db = (await import('@/lib/db')).default
    
    // Get current settings
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

    // Update the specific platform
    settings.socialMedia[platform] = {
      connected: true,
      ...credentials
    }

    // Save back to database (manual upsert)
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = socialConnectSchema.parse(body)

    const { platform, credentials } = validatedData
    const connector = new SocialMediaConnector()

    // Real API validation based on platform
    let isValid = false
    let error = ''

    try {
      switch (platform) {
        case 'facebook':
          isValid = await connector.validateFacebookCredentials(credentials)
          break
        case 'twitter':
          isValid = await connector.validateTwitterCredentials(credentials)
          break
        case 'linkedin':
          isValid = await connector.validateLinkedInCredentials(credentials)
          break
        case 'instagram':
          isValid = await connector.validateInstagramCredentials(credentials)
          break
        default:
          error = `Platform ${platform} not supported`
      }
    } catch (err: any) {
      error = err.message
    }

    if (!isValid) {
      return NextResponse.json(
        { error: error || 'Invalid credentials provided' },
        { status: 400 }
      )
    }

    // Store credentials in database
    await connector.storeCredentials(platform, credentials)

    // Return success response
    return NextResponse.json({
      success: true,
      platform,
      message: `${platform} account connected successfully`,
      connectedAt: new Date().toISOString()
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error connecting social media account:', error)
    return NextResponse.json(
      { error: 'Failed to connect social media account' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      )
    }

    // Get current settings
    const db = (await import('@/lib/db')).default
    const currentSettings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )

    if (!currentSettings) {
      return NextResponse.json({
        connected: false,
        platform
      })
    }

    const settings = JSON.parse(currentSettings.value)
    const platformSettings = settings.socialMedia?.[platform]

    return NextResponse.json({
      connected: platformSettings?.connected || false,
      platform,
      hasCredentials: !!(platformSettings?.accessToken || platformSettings?.apiKey)
    })

  } catch (error: any) {
    console.error('Error getting social media connection status:', error)
    return NextResponse.json(
      { error: 'Failed to get connection status' },
      { status: 500 }
    )
  }
}
