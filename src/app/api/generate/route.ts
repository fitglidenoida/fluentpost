import { NextRequest, NextResponse } from 'next/server'
import { CostFreeAIService } from '@/lib/ai'

const generateSchema = {
  type: 'object',
  properties: {
    contentType: { type: 'string', enum: ['blog', 'social', 'topic'] },
    topic: { type: 'string' },
    platform: { type: 'string', enum: ['twitter', 'facebook', 'linkedin', 'instagram'] },
    tone: { type: 'string', enum: ['professional', 'casual', 'enthusiastic', 'educational'] },
    length: { type: 'string', enum: ['short', 'medium', 'long'] },
  },
  required: ['contentType'],
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.contentType || !['blog', 'social', 'topic'].includes(body.contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be blog, social, or topic' },
        { status: 400 }
      )
    }

    // Use cost-free AI service
    const aiPrompt = {
      type: body.contentType as 'blog' | 'social' | 'topic',
      topic: body.topic || 'fitness and wellness',
      platform: body.platform,
      tone: body.tone,
      length: body.length,
    }

    const result = await CostFreeAIService.generateContent(aiPrompt)
    
    // If we have a stored response, return it
    if (!result._promptId) {
      return NextResponse.json({
        success: true,
        content: result,
        generatedAt: new Date().toISOString(),
        model: 'gpt-plus-manual',
      })
    }

    // Otherwise, return instructions for manual processing
    return NextResponse.json({
      success: true,
      content: result,
      instructions: `📝 Copy the prompt above and paste it into GPT Plus, then store the response`,
      generatedAt: new Date().toISOString(),
      model: 'gpt-plus-manual',
    })

    // This is handled by the CostFreeAIService above
    // No additional implementation needed

  } catch (error: any) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('type')
    
    if (!contentType || !['blog', 'social', 'topic'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be blog, social, or topic' },
        { status: 400 }
      )
    }

    // Use cost-free AI service for GET requests too
    const aiPrompt = {
      type: contentType as 'blog' | 'social' | 'topic',
      topic: 'fitness and wellness',
    }

    const result = await CostFreeAIService.generateContent(aiPrompt)
    
    return NextResponse.json({
      success: true,
      content: result,
      generatedAt: new Date().toISOString(),
      model: 'gpt-plus-manual',
    })

  } catch (error: any) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
