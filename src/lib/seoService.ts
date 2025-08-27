import db from '@/lib/db'

export interface KeywordData {
  keyword: string
  searchVolume?: number
  difficulty?: number
  suggestions?: string[]
  relatedKeywords?: string[]
}

export interface WebsiteAnalysis {
  url: string
  title?: string
  metaDescription?: string
  headings?: string[]
  content?: string
  seoScore?: number
  issues?: string[]
  suggestions?: string[]
}

export interface SEORecommendation {
  type: 'meta' | 'content' | 'technical' | 'schema'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  action?: string
}

export class SEOService {
  // Keyword Research using free tools
  static async researchKeywords(domain: string, seedKeywords: string[]): Promise<KeywordData[]> {
    const keywords: KeywordData[] = []
    
    try {
      console.log('SEO Service: Starting keyword research for domain:', domain, 'with seeds:', seedKeywords)
      
      // 1. Google Trends analysis (simplified)
      console.log('SEO Service: Getting trends data...')
      const trendsData = await this.getGoogleTrendsData(seedKeywords)
      console.log('SEO Service: Got trends data:', trendsData.length, 'keywords')
      
      // 2. Competitor keyword extraction (simplified)
      console.log('SEO Service: Getting competitor keywords...')
      const competitorKeywords = await this.extractCompetitorKeywords(domain)
      console.log('SEO Service: Got competitor keywords:', competitorKeywords.length, 'keywords')
      
      // 3. Wikipedia/Reddit long-tail discovery (simplified)
      console.log('SEO Service: Getting long-tail keywords...')
      const longTailKeywords = await this.discoverLongTailKeywords(seedKeywords)
      console.log('SEO Service: Got long-tail keywords:', longTailKeywords.length, 'keywords')
      
      // 4. Combine and analyze
      const allKeywords = [...trendsData, ...competitorKeywords, ...longTailKeywords]
      console.log('SEO Service: Combined keywords:', allKeywords.length)
      
      // 5. Remove duplicates and rank by potential
      const uniqueKeywords = this.removeDuplicateKeywords(allKeywords)
      console.log('SEO Service: Unique keywords after deduplication:', uniqueKeywords.length)
      
      // 6. Estimate search volume and difficulty (simplified)
      console.log('SEO Service: Enriching keyword data...')
      for (const keyword of uniqueKeywords.slice(0, 50)) { // Limit to 50 for performance
        try {
          const enriched = await this.enrichKeywordData(keyword)
          keywords.push(enriched)
        } catch (enrichError) {
          console.warn('SEO Service: Failed to enrich keyword:', keyword.keyword, enrichError)
          // Add the keyword without enrichment
          keywords.push(keyword)
        }
      }
      
      console.log('SEO Service: Final keywords count:', keywords.length)
      return keywords.slice(0, 50) // Return top 50 keywords
    } catch (error) {
      console.error('SEO Service: Keyword research error:', error)
      // Return basic keywords based on seeds to avoid complete failure
      return this.generateBasicKeywords(seedKeywords)
    }
  }

  // Extract keywords from competitor websites
  static async extractCompetitorKeywords(domain: string): Promise<KeywordData[]> {
    const keywords: KeywordData[] = []
    
    try {
      // Find competitors in the same niche
      const competitors = await this.findCompetitors(domain)
      
      for (const competitor of competitors) {
        try {
          const competitorKeywords = await this.scrapeWebsiteKeywords(competitor)
          keywords.push(...competitorKeywords)
        } catch (competitorError) {
          console.warn('Failed to extract keywords from competitor:', competitor, competitorError)
          // Continue with other competitors
        }
      }
      
      return keywords
    } catch (error) {
      console.error('Competitor keyword extraction error:', error)
      return []
    }
  }

  // Website analysis and SEO audit
  static async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    try {
      const analysis: WebsiteAnalysis = {
        url,
        issues: [],
        suggestions: []
      }
      
      // 1. Basic page analysis
      const pageData = await this.scrapePage(url)
      analysis.title = pageData.title
      analysis.metaDescription = pageData.metaDescription
      analysis.headings = pageData.headings
      analysis.content = pageData.content
      
      // 2. SEO scoring
      analysis.seoScore = this.calculateSEOScore(pageData)
      
      // 3. Identify issues
      analysis.issues = this.identifySEOIssues(pageData)
      
      // 4. Generate suggestions
      analysis.suggestions = this.generateSuggestions(pageData)
      
      return analysis
    } catch (error) {
      console.error('Website analysis error:', error)
      throw error
    }
  }

  // Comprehensive website audit
  static async performWebsiteAudit(url: string): Promise<any> {
    try {
      const audit = {
        url,
        scannedAt: new Date(),
        currentState: {
          seoScore: 0,
          technicalIssues: [],
          contentIssues: [],
          performanceIssues: [],
          mobileIssues: []
        },
        expectedState: {
          targetSeoScore: 90,
          targetLoadTime: 3,
          targetMobileScore: 90,
          targetAccessibilityScore: 90
        },
        actionableItems: [],
        recommendations: [],
        priority: 'high' as 'low' | 'medium' | 'high'
      }

      // 1. Technical SEO Analysis
      const technicalAnalysis = await this.analyzeTechnicalSEO(url)
      audit.currentState.technicalIssues = technicalAnalysis.issues
      audit.currentState.seoScore = technicalAnalysis.score

      // 2. Content Analysis
      const contentAnalysis = await this.analyzeContent(url)
      audit.currentState.contentIssues = contentAnalysis.issues

      // 3. Performance Analysis
      const performanceAnalysis = await this.analyzePerformance(url)
      audit.currentState.performanceIssues = performanceAnalysis.issues

      // 4. Mobile Analysis
      const mobileAnalysis = await this.analyzeMobile(url)
      audit.currentState.mobileIssues = mobileAnalysis.issues

      // 5. Generate actionable items
      audit.actionableItems = this.generateActionableItems(audit.currentState, audit.expectedState)

      // 6. Set priority based on issues
      audit.priority = this.calculatePriority(audit.currentState)

      return audit
    } catch (error) {
      console.error('Website audit error:', error)
      throw error
    }
  }

  // Generate SEO recommendations
  static async generateRecommendations(websiteId: string): Promise<SEORecommendation[]> {
    const recommendations: SEORecommendation[] = []
    
    try {
      const website = db.queryFirst(
        'SELECT * FROM Website WHERE id = ?',
        [websiteId]
      )
      
      if (!website) throw new Error('Website not found')
      
      // Get page analyses for this website
      const pageAnalyses = db.query(
        'SELECT * FROM PageAnalysis WHERE websiteId = ?',
        [websiteId]
      )
      
      // Analyze each page and generate recommendations
      for (const page of pageAnalyses) {
        const pageRecommendations = await this.analyzePageForRecommendations(page)
        recommendations.push(...pageRecommendations)
      }
      
      // Add website-level recommendations
      const websiteRecommendations = await this.generateWebsiteRecommendations(website)
      recommendations.push(...websiteRecommendations)
      
      return recommendations
    } catch (error) {
      console.error('Recommendation generation error:', error)
      return []
    }
  }

  // Fallback method for basic keyword generation
  private static generateBasicKeywords(seedKeywords: string[]): KeywordData[] {
    const basicKeywords: KeywordData[] = []
    
    // Generate basic variations for each seed keyword
    for (const seed of seedKeywords) {
      // Add the seed keyword itself
      basicKeywords.push({
        keyword: seed,
        searchVolume: Math.floor(Math.random() * 5000) + 500,
        difficulty: Math.floor(Math.random() * 60) + 20
      })
      
      // Add common variations
      const variations = [
        `${seed} tool`,
        `${seed} software`,
        `best ${seed}`,
        `${seed} guide`,
        `${seed} tips`,
        `how to ${seed}`,
        `${seed} for beginners`,
        `${seed} tutorial`,
        `${seed} platform`,
        `${seed} service`
      ]
      
      variations.forEach(variation => {
        basicKeywords.push({
          keyword: variation,
          searchVolume: Math.floor(Math.random() * 3000) + 100,
          difficulty: Math.floor(Math.random() * 50) + 10
        })
      })
    }
    
    return basicKeywords.slice(0, 50)
  }

  // Helper methods
  private static async getGoogleTrendsData(keywords: string[]): Promise<KeywordData[]> {
    try {
      // Mock implementation - in real implementation, use Google Trends API
      return keywords.map(keyword => ({
        keyword,
        searchVolume: Math.floor(Math.random() * 10000) + 100,
        difficulty: Math.floor(Math.random() * 100) + 1
      }))
    } catch (error) {
      console.warn('Failed to get Google Trends data:', error)
      return []
    }
  }

  private static async findCompetitors(domain: string): Promise<string[]> {
    try {
      // Mock implementation - in real implementation, use competitor analysis tools
      return [
        'competitor1.com',
        'competitor2.com',
        'competitor3.com'
      ]
    } catch (error) {
      console.warn('Failed to find competitors for:', domain, error)
      return []
    }
  }

  private static async scrapeWebsiteKeywords(url: string): Promise<KeywordData[]> {
    try {
      // Mock implementation - in real implementation, use web scraping
      return [
        { keyword: 'marketing automation', searchVolume: 5000, difficulty: 45 },
        { keyword: 'social media management', searchVolume: 3000, difficulty: 35 },
        { keyword: 'content generation', searchVolume: 2000, difficulty: 25 }
      ]
    } catch (error) {
      console.warn('Failed to scrape keywords from:', url, error)
      return []
    }
  }

  private static async discoverLongTailKeywords(seedKeywords: string[]): Promise<KeywordData[]> {
    try {
      // Mock implementation - in real implementation, use Wikipedia/Reddit APIs
      const longTailKeywords: KeywordData[] = []
      
      for (const seed of seedKeywords) {
        longTailKeywords.push(
          { keyword: `${seed} for small business`, searchVolume: 500, difficulty: 20 },
          { keyword: `${seed} India`, searchVolume: 300, difficulty: 15 },
          { keyword: `best ${seed} tool`, searchVolume: 800, difficulty: 30 },
          { keyword: `${seed} vs competitors`, searchVolume: 400, difficulty: 25 },
          { keyword: `${seed} pricing`, searchVolume: 600, difficulty: 35 },
          { keyword: `${seed} reviews`, searchVolume: 700, difficulty: 30 }
        )
      }
      
      return longTailKeywords
    } catch (error) {
      console.warn('Failed to discover long-tail keywords:', error)
      return []
    }
  }

  private static removeDuplicateKeywords(keywords: KeywordData[]): KeywordData[] {
    const seen = new Set<string>()
    return keywords.filter(keyword => {
      const normalized = keyword.keyword.toLowerCase().trim()
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
  }

  private static async enrichKeywordData(keyword: KeywordData): Promise<KeywordData> {
    try {
      // Mock implementation - in real implementation, use keyword research APIs
      return {
        ...keyword,
        suggestions: [
          `${keyword.keyword} tool`,
          `${keyword.keyword} software`,
          `${keyword.keyword} platform`
        ],
        relatedKeywords: [
          `${keyword.keyword} guide`,
          `${keyword.keyword} tutorial`,
          `${keyword.keyword} tips`
        ]
      }
    } catch (error) {
      console.warn('Failed to enrich keyword data for:', keyword.keyword, error)
      return keyword // Return original keyword if enrichment fails
    }
  }

  private static async scrapePage(url: string): Promise<any> {
    // Mock implementation - in real implementation, use Puppeteer/Cheerio
    // Simulate realistic SEO issues for testing
    const randomIssues = Math.floor(Math.random() * 4) // 0-3 issues
    
    let title = 'Sample Page Title'
    let metaDescription = 'Sample meta description'
    let headings = ['H1: Main Title', 'H2: Subtitle', 'H3: Section']
    let content = 'Sample page content with sufficient length to pass basic content checks...'
    
    // Randomly introduce issues for testing
    if (randomIssues === 0) {
      title = '' // Missing title
    } else if (randomIssues === 1) {
      metaDescription = '' // Missing meta description
    } else if (randomIssues === 2) {
      headings = [] // No headings
    } else if (randomIssues === 3) {
      content = 'Short' // Insufficient content
    }
    
    return {
      title,
      metaDescription,
      headings,
      content,
      images: [],
      links: []
    }
  }

  private static calculateSEOScore(pageData: any): number {
    let score = 100
    
    // Deduct points for missing elements
    if (!pageData.title) score -= 20
    if (!pageData.metaDescription) score -= 15
    if (pageData.headings.length === 0) score -= 10
    if (!pageData.content) score -= 25
    
    return Math.max(0, score)
  }

  private static identifySEOIssues(pageData: any): string[] {
    const issues: string[] = []
    
    if (!pageData.title) issues.push('Missing page title')
    if (!pageData.metaDescription) issues.push('Missing meta description')
    if (pageData.headings.length === 0) issues.push('No heading structure')
    if (!pageData.content) issues.push('No content found')
    
    return issues
  }

  private static generateSuggestions(pageData: any): string[] {
    const suggestions: string[] = []
    
    if (!pageData.title) suggestions.push('Add a compelling page title (50-60 characters)')
    if (!pageData.metaDescription) suggestions.push('Add a meta description (150-160 characters)')
    if (pageData.headings.length === 0) suggestions.push('Add heading structure (H1, H2, H3)')
    if (!pageData.content) suggestions.push('Add relevant content for better SEO')
    
    return suggestions
  }

  private static async analyzePageForRecommendations(page: any): Promise<SEORecommendation[]> {
    const recommendations: SEORecommendation[] = []
    
    if (!page.title) {
      recommendations.push({
        type: 'meta',
        priority: 'critical',
        description: 'Add a compelling page title',
        action: 'Update page title to include target keywords'
      })
    }
    
    if (!page.metaDescription) {
      recommendations.push({
        type: 'meta',
        priority: 'high',
        description: 'Add meta description',
        action: 'Create a compelling meta description (150-160 characters)'
      })
    }
    
    return recommendations
  }

  private static async generateWebsiteRecommendations(website: any): Promise<SEORecommendation[]> {
    return [
      {
        type: 'technical',
        priority: 'medium',
        description: 'Create XML sitemap',
        action: 'Generate and submit sitemap to search engines'
      },
      {
        type: 'technical',
        priority: 'medium',
        description: 'Add schema markup',
        action: 'Implement structured data for better search results'
      }
    ]
  }

  // Technical SEO Analysis
  private static async analyzeTechnicalSEO(url: string): Promise<any> {
    const issues: string[] = []
    let score = 100

    try {
      const pageData = await this.scrapePage(url)
      console.log('Technical SEO Analysis - Page Data:', pageData)
      
      // Check meta tags
      if (!pageData.title) {
        issues.push('Missing page title')
        score -= 20
      } else if (pageData.title.length < 30 || pageData.title.length > 60) {
        issues.push('Page title length should be between 30-60 characters')
        score -= 10
      }

      if (!pageData.metaDescription) {
        issues.push('Missing meta description')
        score -= 15
      } else if (pageData.metaDescription.length < 120 || pageData.metaDescription.length > 160) {
        issues.push('Meta description length should be between 120-160 characters')
        score -= 10
      }

      // Check headings structure
      if (!pageData.headings || pageData.headings.length === 0) {
        issues.push('No heading structure found')
        score -= 15
      } else {
        const h1Count = pageData.headings.filter((h: string) => h.startsWith('H1')).length
        if (h1Count === 0) {
          issues.push('Missing H1 heading')
          score -= 10
        } else if (h1Count > 1) {
          issues.push('Multiple H1 headings found')
          score -= 5
        }
      }

      // Check content
      if (!pageData.content || pageData.content.length < 300) {
        issues.push('Insufficient content (less than 300 characters)')
        score -= 20
      }

      console.log('Technical SEO Analysis - Issues found:', issues, 'Score:', score)
      return { issues, score: Math.max(0, score) }
    } catch (error) {
      issues.push('Failed to analyze technical SEO')
      return { issues, score: 0 }
    }
  }

  // Content Analysis
  private static async analyzeContent(url: string): Promise<any> {
    const issues: string[] = []

    try {
      const pageData = await this.scrapePage(url)
      console.log('Content Analysis - Page Data:', pageData)
      
      if (!pageData.content) {
        issues.push('No content found on page')
        return { issues }
      }

      // Check content length
      if (pageData.content.length < 500) {
        issues.push('Content is too short for good SEO')
      }

      // Check for images without alt text (mock)
      issues.push('Some images may be missing alt text')

      // Check for internal links
      if (!pageData.links || pageData.links.length === 0) {
        issues.push('No internal links found')
      }

      console.log('Content Analysis - Issues found:', issues)
      return { issues }
    } catch (error) {
      issues.push('Failed to analyze content')
      return { issues }
    }
  }

  // Performance Analysis
  private static async analyzePerformance(url: string): Promise<any> {
    const issues: string[] = []

    try {
      // Mock performance analysis
      const loadTime = Math.random() * 5 + 1 // 1-6 seconds
      
      if (loadTime > 3) {
        issues.push(`Page load time is ${loadTime.toFixed(1)}s (should be under 3s)`)
      }

      // Check for large images
      issues.push('Some images may be too large for optimal performance')

      // Check for minification
      issues.push('CSS and JS files should be minified')

      console.log('Performance Analysis - Issues found:', issues, 'Load time:', loadTime)
      return { issues, loadTime }
    } catch (error) {
      issues.push('Failed to analyze performance')
      return { issues }
    }
  }

  // Mobile Analysis
  private static async analyzeMobile(url: string): Promise<any> {
    const issues: string[] = []

    try {
      // Mock mobile analysis
      const mobileScore = Math.floor(Math.random() * 30) + 70 // 70-100
      
      if (mobileScore < 90) {
        issues.push('Mobile optimization needs improvement')
      }

      issues.push('Check viewport meta tag')
      issues.push('Ensure touch targets are large enough')

      return { issues, mobileScore }
    } catch (error) {
      issues.push('Failed to analyze mobile optimization')
      return { issues }
    }
  }

  // Generate Actionable Items
  private static generateActionableItems(currentState: any, expectedState: any): any[] {
    const items = []

    console.log('Generating actionable items from:', {
      technicalIssues: currentState.technicalIssues,
      contentIssues: currentState.contentIssues,
      performanceIssues: currentState.performanceIssues,
      mobileIssues: currentState.mobileIssues
    })

    // Technical SEO items
    if (currentState.technicalIssues.length > 0) {
      currentState.technicalIssues.forEach((issue: string) => {
        items.push({
          category: 'Technical SEO',
          issue,
          priority: 'high',
          estimatedTime: '30 minutes',
          impact: 'High'
        })
      })
    }

    // Content items
    if (currentState.contentIssues.length > 0) {
      currentState.contentIssues.forEach((issue: string) => {
        items.push({
          category: 'Content',
          issue,
          priority: 'medium',
          estimatedTime: '1 hour',
          impact: 'Medium'
        })
      })
    }

    // Performance items
    if (currentState.performanceIssues.length > 0) {
      currentState.performanceIssues.forEach((issue: string) => {
        items.push({
          category: 'Performance',
          issue,
          priority: 'high',
          estimatedTime: '2 hours',
          impact: 'High'
        })
      })
    }

    // Mobile items
    if (currentState.mobileIssues.length > 0) {
      currentState.mobileIssues.forEach((issue: string) => {
        items.push({
          category: 'Mobile',
          issue,
          priority: 'medium',
          estimatedTime: '1 hour',
          impact: 'Medium'
        })
      })
    }

    console.log('Generated actionable items:', items)
    return items
  }

  // Calculate Priority
  private static calculatePriority(currentState: any): 'low' | 'medium' | 'high' {
    const totalIssues = currentState.technicalIssues.length + 
                       currentState.contentIssues.length + 
                       currentState.performanceIssues.length + 
                       currentState.mobileIssues.length

    if (totalIssues > 10) return 'high'
    if (totalIssues > 5) return 'medium'
    return 'low'
  }
}
