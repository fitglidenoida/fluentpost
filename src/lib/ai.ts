// Cost-free AI integration using GPT Plus
// This system allows you to copy-paste prompts and responses without API costs

export interface AIPrompt {
  type: 'blog' | 'social' | 'topic' | 'app-feature'
  topic: string
  platform?: string
  tone?: string
  length?: string
  additionalContext?: string
  keywords?: string
  id?: string
}

export interface AIResponse {
  content: any
  prompt: string
  response: string
  timestamp: string
}

export class CostFreeAIService {
  private static prompts: AIPrompt[] = []
  private static responses: AIResponse[] = []

  // Generate a prompt for GPT Plus
  static generatePrompt(prompt: AIPrompt): string {
    const basePrompts = {
      blog: `Create a viral blog post about "${prompt.topic}" for FitGlide fitness app. 
      
Topic Context: ${prompt.additionalContext || 'General fitness and wellness content'}
Keywords: ${prompt.keywords || 'fitness, health, wellness'}

IMPORTANT: This is about FitGlide app's FEATURES and FUNCTIONALITY, not generic fitness advice.

Requirements:
- Title that highlights the app's specific feature/functionality
- Engaging introduction that explains what the app feature does
- Content that showcases the app's capabilities and benefits
- Explain how users can use this feature in the FitGlide app
- Include practical examples of how the feature works
- SEO-optimized with meta description and keywords
- Tone: ${prompt.tone || 'professional yet friendly'}
- Length: ${prompt.length || 'medium'} (800-1200 words)
- Focus on the APP FEATURE, not generic health/fitness advice
- End with a call-to-action to download FitGlide app
- Make it clear this is about the app's functionality

Format the response as JSON with these fields:
{
  "title": "SEO-optimized title about the app feature",
  "content": "Full blog content explaining the app feature and how to use it",
  "excerpt": "Brief summary (150 characters max)",
  "seoTitle": "SEO title for search engines",
  "seoDescription": "Meta description (160 characters max)",
  "metaKeywords": "comma-separated keywords"
}`,

      'app-feature': `Create a viral blog post about FitGlide app's "${prompt.topic}" feature. 
      
Topic Context: ${prompt.additionalContext || 'App feature description'}
Keywords: ${prompt.keywords || 'app, feature, functionality'}

FOCUS: This is specifically about the FitGlide app's FEATURE and how users can use it.

Requirements:
- Title that clearly mentions the app feature
- Introduction that explains what this feature does in the FitGlide app
- Content that walks through how to use this feature step-by-step
- Explain the benefits and advantages of using this feature
- Include screenshots or UI descriptions if relevant
- Showcase the app's user interface and user experience
- SEO-optimized with meta description and keywords
- Tone: ${prompt.tone || 'professional yet friendly'}
- Length: ${prompt.length || 'medium'} (800-1200 words)
- Focus entirely on the APP FEATURE functionality
- End with a call-to-action to download FitGlide app
- Make it a feature showcase, not generic advice

Format the response as JSON with these fields:
{
  "title": "SEO-optimized title about the FitGlide app feature",
  "content": "Full blog content showcasing the app feature and how to use it",
  "excerpt": "Brief summary (150 characters max)",
  "seoTitle": "SEO title for search engines",
  "seoDescription": "Meta description (160 characters max)",
  "metaKeywords": "comma-separated keywords"
}`,

      social: `Create a viral social media post about "${prompt.topic}" for FitGlide fitness app.
      
Platform: ${prompt.platform || 'Twitter'}
Tone: ${prompt.tone || 'enthusiastic'}
Length: ${prompt.length || 'short'}

Requirements:
- Engaging hook in first line
- Use emojis appropriately
- Include fitness tips or workout ideas
- Add relevant hashtags
- Call-to-action to download FitGlide
- Platform-specific formatting

Format as JSON:
{
  "content": "Full social media post text",
  "platform": "${prompt.platform || 'twitter'}",
  "hashtags": ["fitness", "workout", "health"]
}`,

      topic: `Research and suggest viral topic ideas for FitGlide fitness app content.
      
Category: ${prompt.topic}
Focus: Fitness, workouts, health, nutrition, lifestyle

Requirements:
- 5 trending topic ideas
- Each with viral potential
- Include search volume estimates
- Difficulty level (easy/medium/hard)
- Target audience

Format as JSON:
{
  "topics": [
    {
      "title": "Topic title",
      "description": "Brief description",
      "category": "fitness",
      "keywords": "comma-separated keywords",
      "difficulty": "easy/medium/hard",
      "viralPotential": "high/medium/low"
    }
  ]
}`
    }

    return basePrompts[prompt.type] || basePrompts.blog
  }

  // Store a prompt for manual processing
  static queuePrompt(prompt: AIPrompt): string {
    const promptId = `prompt_${Date.now()}`
    this.prompts.push({ ...prompt, id: promptId })
    
    const generatedPrompt = this.generatePrompt(prompt)
    console.log(`📝 Prompt ready for GPT Plus (ID: ${promptId}):`)
    console.log('='.repeat(50))
    console.log(generatedPrompt)
    console.log('='.repeat(50))
    
    return promptId
  }

  // Store AI response (you'll paste this from GPT Plus)
  static async storeResponse(promptId: string, gptResponse: string): Promise<AIResponse> {
    try {
      const parsedResponse = JSON.parse(gptResponse)
      
      // Store in database
      const response = await fetch('/api/ai-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          promptType: this.prompts.find(p => p.id === promptId)?.type || 'unknown',
          promptData: JSON.stringify(this.prompts.find(p => p.id === promptId)),
          response: gptResponse,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to store response in database')
      }

      const storedResponse = await response.json()
      
      const aiResponse: AIResponse = {
        content: parsedResponse,
        prompt: this.prompts.find(p => p.id === promptId)?.type || 'unknown',
        response: gptResponse,
        timestamp: new Date().toISOString()
      }
      
      // Also keep in memory for immediate access
      this.responses.push(aiResponse)
      return aiResponse
    } catch (error) {
      throw new Error('Invalid JSON response from GPT Plus')
    }
  }

  // Get the latest response
  static getLatestResponse(): AIResponse | null {
    return this.responses[this.responses.length - 1] || null
  }

  // Get all responses
  static async getAllResponses(): Promise<AIResponse[]> {
    try {
      const response = await fetch('/api/ai-responses')
      if (response.ok) {
        const data = await response.json()
        return data.aiResponses.map((dbResponse: any) => ({
          content: JSON.parse(dbResponse.response),
          prompt: dbResponse.promptType,
          response: dbResponse.response,
          timestamp: dbResponse.createdAt
        }))
      }
    } catch (error) {
      console.error('Error loading responses from database:', error)
    }
    return this.responses
  }

  // Clear all data
  static clearData(): void {
    this.prompts = []
    this.responses = []
  }

  // Generate content using stored responses
  static async generateContent(prompt: AIPrompt): Promise<any> {
    const promptId = this.queuePrompt(prompt)
    
    // Return a placeholder with instructions
    return {
      _promptId: promptId,
      _instructions: `1. Copy the prompt above and paste it into GPT Plus
2. Copy the JSON response from GPT Plus
3. Call storeResponse('${promptId}', 'PASTE_GPT_RESPONSE_HERE')
4. Call generateContent again to get the actual content`,
      _prompt: this.generatePrompt(prompt)
    }
  }
}

// Helper function to easily store GPT Plus responses
export async function storeGPTResponse(promptId: string, gptResponse: string) {
  return await CostFreeAIService.storeResponse(promptId, gptResponse)
}

// Helper function to get latest content
export async function getLatestContent() {
  const responses = await CostFreeAIService.getAllResponses()
  return responses[responses.length - 1]?.content
}
