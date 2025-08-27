import db from './db'

interface PostContent {
  text: string
  imageUrl?: string
  link?: string
  platform: string
}

interface PostResult {
  success: boolean
  platform: string
  postId?: string
  error?: string
  url?: string
}

export class SocialMediaPostingService {
  
  // Facebook/Instagram Posting
  async postToFacebook(content: PostContent): Promise<PostResult> {
    try {
      const accessToken = await this.getFacebookAccessToken()
      
      if (!accessToken) {
        return {
          success: false,
          platform: 'facebook',
          error: 'Facebook not connected. Please connect your Facebook account in Settings.'
        }
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.text,
          link: content.link,
          access_token: accessToken
        })
      })

      const result = await response.json()

      if (result.error) {
        return {
          success: false,
          platform: 'facebook',
          error: result.error.message
        }
      }

      return {
        success: true,
        platform: 'facebook',
        postId: result.id,
        url: `https://facebook.com/${result.id}`
      }

    } catch (error: any) {
      return {
        success: false,
        platform: 'facebook',
        error: error.message
      }
    }
  }

  // Twitter/X Posting
  async postToTwitter(content: PostContent): Promise<PostResult> {
    try {
      const credentials = await this.getTwitterCredentials()
      
      if (!credentials) {
        return {
          success: false,
          platform: 'twitter',
          error: 'Twitter not connected. Please connect your Twitter account in Settings.'
        }
      }

      // Twitter API v2 implementation with OAuth 2.0 Bearer token
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text
        })
      })

      const result = await response.json()

      if (result.errors) {
        return {
          success: false,
          platform: 'twitter',
          error: result.errors[0].message
        }
      }

      return {
        success: true,
        platform: 'twitter',
        postId: result.data.id,
        url: `https://twitter.com/user/status/${result.data.id}`
      }

    } catch (error: any) {
      return {
        success: false,
        platform: 'twitter',
        error: error.message
      }
    }
  }

  // LinkedIn Posting
  async postToLinkedIn(content: PostContent): Promise<PostResult> {
    try {
      const accessToken = await this.getLinkedInAccessToken()
      
      if (!accessToken) {
        return {
          success: false,
          platform: 'linkedin',
          error: 'LinkedIn not connected. Please connect your LinkedIn account in Settings.'
        }
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: `urn:li:person:${await this.getLinkedInPersonId(accessToken)}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content.text
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      })

      const result = await response.json()

      if (result.error) {
        return {
          success: false,
          platform: 'linkedin',
          error: result.error.message
        }
      }

      return {
        success: true,
        platform: 'linkedin',
        postId: result.id,
        url: `https://linkedin.com/feed/update/${result.id}`
      }

    } catch (error: any) {
      return {
        success: false,
        platform: 'linkedin',
        error: error.message
      }
    }
  }

  // Instagram Posting (via Facebook Graph API)
  async postToInstagram(content: PostContent): Promise<PostResult> {
    try {
      const accessToken = await this.getInstagramAccessToken()
      
      if (!accessToken) {
        return {
          success: false,
          platform: 'instagram',
          error: 'Instagram not connected. Please connect your Instagram account in Settings.'
        }
      }

      // Instagram requires media, so we'll create a text post via Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.text,
          access_token: accessToken
        })
      })

      const result = await response.json()

      if (result.error) {
        return {
          success: false,
          platform: 'instagram',
          error: result.error.message
        }
      }

      return {
        success: true,
        platform: 'instagram',
        postId: result.id,
        url: `https://instagram.com/p/${result.id}`
      }

    } catch (error: any) {
      return {
        success: false,
        platform: 'instagram',
        error: error.message
      }
    }
  }

  // Multi-platform posting
  async postToMultiplePlatforms(content: PostContent, platforms: string[]): Promise<PostResult[]> {
    const results: PostResult[] = []
    
    for (const platform of platforms) {
      let result: PostResult
      
      switch (platform.toLowerCase()) {
        case 'facebook':
          result = await this.postToFacebook(content)
          break
        case 'twitter':
          result = await this.postToTwitter(content)
          break
        case 'linkedin':
          result = await this.postToLinkedIn(content)
          break
        case 'instagram':
          result = await this.postToInstagram(content)
          break
        default:
          result = {
            success: false,
            platform,
            error: `Platform ${platform} not supported`
          }
      }
      
      results.push(result)
    }
    
    return results
  }

  // Helper methods to get credentials from database
  private async getFacebookAccessToken(): Promise<string | null> {
    const db = (await import('@/lib/db')).default
    const settings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )
    
    if (!settings) return null
    
    const userSettings = JSON.parse(settings.value)
    return userSettings.socialMedia?.facebook?.accessToken || null
  }

  private async getTwitterCredentials(): Promise<{ accessToken: string } | null> {
    const db = (await import('@/lib/db')).default
    const settings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )
    
    if (!settings) return null
    
    const userSettings = JSON.parse(settings.value)
    const twitterSettings = userSettings.socialMedia?.twitter
    
    console.log('Twitter settings from database:', {
      connected: twitterSettings?.connected,
      hasAccessToken: !!twitterSettings?.accessToken,
      username: twitterSettings?.username
    })
    
    if (!twitterSettings?.connected || !twitterSettings?.accessToken) {
      console.log('Twitter not properly connected')
      return null
    }
    
    return {
      accessToken: twitterSettings.accessToken
    }
  }

  private async getLinkedInAccessToken(): Promise<string | null> {
    const db = (await import('@/lib/db')).default
    const settings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )
    
    if (!settings) return null
    
    const userSettings = JSON.parse(settings.value)
    return userSettings.socialMedia?.linkedin?.accessToken || null
  }

  private async getInstagramAccessToken(): Promise<string | null> {
    const db = (await import('@/lib/db')).default
    const settings = db.queryFirst(
      'SELECT * FROM AppSettings WHERE key = ?',
      ['user_settings']
    )
    
    if (!settings) return null
    
    const userSettings = JSON.parse(settings.value)
    return userSettings.socialMedia?.instagram?.accessToken || null
  }

  private async getLinkedInPersonId(accessToken: string): Promise<string> {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    const result = await response.json()
    return result.id
  }
}
