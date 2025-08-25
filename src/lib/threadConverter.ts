interface ThreadTweet {
  text: string
  order: number
}

interface ThreadResult {
  tweets: ThreadTweet[]
  totalTweets: number
  estimatedReadTime: number
  isBlueTickUser: boolean
  postingStrategy: 'single' | 'thread'
}

export class ThreadConverter {
  private readonly MAX_TWEET_LENGTH = 280
  private readonly THREAD_SEPARATOR = '\n\n---\n\n'

  /**
   * Convert AI-generated content into a Twitter thread or single post based on Blue tick status
   */
  async convertToThread(content: string, title?: string, accessToken?: string): Promise<ThreadResult> {
    try {
      // Check if user has Blue tick
      const isBlueTickUser = await this.checkBlueTickStatus(accessToken)
      
      // Clean the content
      const cleanedContent = this.cleanContent(content)
      
      if (isBlueTickUser) {
        // Blue tick user - create single long-form post
        return this.createSingleLongPost(cleanedContent, title)
      } else {
        // Free user - create thread
        return this.createThread(cleanedContent, title)
      }
      
    } catch (error) {
      console.error('Error converting content to thread:', error)
      throw new Error('Failed to convert content to Twitter thread')
    }
  }

  /**
   * Check if Twitter user has Blue tick subscription
   */
  private async checkBlueTickStatus(accessToken?: string): Promise<boolean> {
    if (!accessToken) {
      console.log('No access token provided, defaulting to thread mode')
      return false
    }

    try {
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=verified,protected', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('Twitter user data:', userData)
        
        // Check for Blue tick indicators
        const isBlueTick = userData.data?.verified || 
                          userData.data?.protected || 
                          userData.data?.subscription_status === 'blue'
        
        console.log('Blue tick status:', isBlueTick)
        return isBlueTick
      } else {
        console.log('Could not fetch user data, defaulting to thread mode')
        return false
      }
    } catch (error) {
      console.error('Error checking Blue tick status:', error)
      return false
    }
  }

  /**
   * Create single long-form post for Blue tick users
   */
  private createSingleLongPost(content: string, title?: string): ThreadResult {
    const MAX_BLUE_TICK_LENGTH = 25000
    
    let postContent = ''
    
    if (title) {
      postContent += `🧵 ${title}\n\n`
    }
    
    postContent += content
    
    // Add call-to-action
    postContent += `\n\n💡 Found this helpful? Follow @fit_glide for more fitness tips and app updates!\n\n#FitGlide #FitnessTips #HealthAndWellness`
    
    // Truncate if too long
    if (postContent.length > MAX_BLUE_TICK_LENGTH) {
      postContent = postContent.substring(0, MAX_BLUE_TICK_LENGTH - 100) + '...\n\n[Content truncated due to length]'
    }
    
    return {
      tweets: [{
        text: postContent,
        order: 1
      }],
      totalTweets: 1,
      estimatedReadTime: Math.ceil(postContent.split(' ').length / 200),
      isBlueTickUser: true,
      postingStrategy: 'single'
    }
  }

  /**
   * Create thread for free users
   */
  private createThread(content: string, title?: string): ThreadResult {
    // Split content into logical sections
    const sections = this.splitIntoSections(content)
    
    // Convert sections into tweets
    const tweets: ThreadTweet[] = []
    
    // Add title tweet if provided
    if (title) {
      tweets.push({
        text: this.formatTitleTweet(title),
        order: 1
      })
    }
    
    // Convert each section into tweets
    let tweetOrder = title ? 2 : 1
    for (const section of sections) {
      const sectionTweets = this.convertSectionToTweets(section, tweetOrder)
      tweets.push(...sectionTweets)
      tweetOrder += sectionTweets.length
    }
    
    // Add call-to-action tweet at the end
    tweets.push({
      text: this.createCallToActionTweet(),
      order: tweets.length + 1
    })
    
    return {
      tweets,
      totalTweets: tweets.length,
      estimatedReadTime: this.calculateReadTime(tweets),
      isBlueTickUser: false,
      postingStrategy: 'thread'
    }
  }

  /**
   * Clean and format the content
   */
  private cleanContent(content: string): string {
    return content
      .replace(/\n\n+/g, '\n\n') // Remove excessive line breaks
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/`(.*?)`/g, '$1') // Remove code blocks
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
      .trim()
  }

  /**
   * Split content into logical sections
   */
  private splitIntoSections(content: string): string[] {
    // Split by headers, bullet points, or natural breaks
    const sections = content.split(/(?=^[#\-\*•]\s|^[A-Z][^.!?]*[.!?]$)/gm)
      .filter(section => section.trim().length > 0)
      .map(section => section.trim())
    
    // If no clear sections, split by paragraphs
    if (sections.length <= 1) {
      return content.split(/\n\n+/).filter(section => section.trim().length > 0)
    }
    
    return sections
  }

  /**
   * Convert a section into one or more tweets
   */
  private convertSectionToTweets(section: string, startOrder: number): ThreadTweet[] {
    const tweets: ThreadTweet[] = []
    
    // If section is short enough, make it one tweet
    if (section.length <= this.MAX_TWEET_LENGTH) {
      tweets.push({
        text: this.formatTweet(section),
        order: startOrder
      })
      return tweets
    }
    
    // Split long section into multiple tweets
    const sentences = section.split(/(?<=[.!?])\s+/)
    let currentTweet = ''
    let tweetOrder = startOrder
    
    for (const sentence of sentences) {
      const potentialTweet = currentTweet + (currentTweet ? ' ' : '') + sentence
      
      if (potentialTweet.length <= this.MAX_TWEET_LENGTH) {
        currentTweet = potentialTweet
      } else {
        if (currentTweet) {
          tweets.push({
            text: this.formatTweet(currentTweet),
            order: tweetOrder++
          })
        }
        currentTweet = sentence
      }
    }
    
    // Add remaining content
    if (currentTweet) {
      tweets.push({
        text: this.formatTweet(currentTweet),
        order: tweetOrder
      })
    }
    
    return tweets
  }

  /**
   * Format a tweet with proper spacing and hashtags
   */
  private formatTweet(text: string): string {
    return text
      .replace(/\n+/g, ' ') // Replace line breaks with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
  }

  /**
   * Format title tweet
   */
  private formatTitleTweet(title: string): string {
    const hashtags = this.extractHashtags(title)
    const cleanTitle = title.replace(/#\w+/g, '').trim()
    
    let tweet = `🧵 ${cleanTitle}`
    
    // Add hashtags if there's space
    if (hashtags.length > 0 && tweet.length + hashtags.join(' ').length + 1 <= this.MAX_TWEET_LENGTH) {
      tweet += `\n\n${hashtags.join(' ')}`
    }
    
    return tweet
  }

  /**
   * Create call-to-action tweet
   */
  private createCallToActionTweet(): string {
    return `💡 Found this helpful? Follow @fit_glide for more fitness tips and app updates!\n\n#FitGlide #FitnessTips #HealthAndWellness`
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#\w+/g
    return text.match(hashtagRegex) || []
  }

  /**
   * Calculate estimated read time
   */
  private calculateReadTime(tweets: ThreadTweet[]): number {
    const wordsPerMinute = 200
    const totalWords = tweets.reduce((sum, tweet) => {
      return sum + tweet.text.split(' ').length
    }, 0)
    
    return Math.ceil(totalWords / wordsPerMinute)
  }
}
