import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  goal: z.string().min(1, 'Goal is required'),
  objectives: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  budget: z.number().optional(),
  duration: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  contentPillars: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  contentTypes: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  status: z.enum(['planning', 'active', 'paused', 'completed']).default('planning')
})

const FITGLIDE_USER_ID = 'fitglide-user'

export async function GET(request: NextRequest) {
  try {
    console.log('Campaigns API - GET request received')
    
    // Get all campaigns for FitGlide user
    const campaigns = db.query(`
      SELECT * FROM Campaign WHERE userId = ? ORDER BY createdAt DESC
    `, [FITGLIDE_USER_ID])

    // Parse JSON fields for each campaign
    const formattedCampaigns = campaigns.map((campaign: any) => ({
      ...campaign,
      objectives: campaign.objectives ? JSON.parse(campaign.objectives) : [],
      contentPillars: campaign.contentPillars ? JSON.parse(campaign.contentPillars) : [],
      keywords: campaign.keywords ? JSON.parse(campaign.keywords) : [],
      contentTypes: campaign.contentTypes ? JSON.parse(campaign.contentTypes) : [],
      platforms: campaign.platforms ? JSON.parse(campaign.platforms) : [],
      // Add KPI data (can be enhanced later with real analytics)
      kpis: [
        { name: 'Website Traffic', target: 50000, current: Math.floor(Math.random() * 30000), unit: 'visitors/month' },
        { name: 'Social Engagement', target: 5000, current: Math.floor(Math.random() * 3000), unit: 'interactions/month' },
        { name: 'Email Subscribers', target: 5000, current: Math.floor(Math.random() * 2000), unit: 'subscribers' },
        { name: 'Content Shares', target: 1000, current: Math.floor(Math.random() * 600), unit: 'shares/month' }
      ]
    }))

    return NextResponse.json({ 
      success: true, 
      campaigns: formattedCampaigns 
    })

  } catch (error: any) {
    console.error('Get campaigns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error.message }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Campaigns API - POST request received')
    
    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    // Create unique campaign ID
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Convert arrays to JSON strings for storage
    const objectives = validatedData.objectives ? JSON.stringify(validatedData.objectives) : null
    const contentPillars = validatedData.contentPillars ? JSON.stringify(validatedData.contentPillars) : null
    const keywords = validatedData.keywords ? JSON.stringify(validatedData.keywords) : null
    const contentTypes = validatedData.contentTypes ? JSON.stringify(validatedData.contentTypes) : null
    const platforms = validatedData.platforms ? JSON.stringify(validatedData.platforms) : null

    // Set default dates if not provided
    const startDate = validatedData.startDate || new Date().toISOString().split('T')[0]
    const endDate = validatedData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Insert campaign into database
    db.execute(`
      INSERT INTO Campaign (
        id, userId, name, description, goal, objectives, targetAudience, 
        budget, duration, startDate, endDate, contentPillars, keywords, 
        contentTypes, platforms, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      campaignId,
      FITGLIDE_USER_ID,
      validatedData.name,
      validatedData.description || '',
      validatedData.goal,
      objectives,
      validatedData.targetAudience || '',
      validatedData.budget || 0,
      validatedData.duration || '3 months',
      startDate,
      endDate,
      contentPillars,
      keywords,
      contentTypes,
      platforms,
      validatedData.status
    ])

    // Fetch the created campaign
    const createdCampaign = db.queryFirst('SELECT * FROM Campaign WHERE id = ?', [campaignId])

    return NextResponse.json({ 
      success: true, 
      campaign: {
        ...createdCampaign,
        objectives: objectives ? JSON.parse(objectives) : [],
        contentPillars: contentPillars ? JSON.parse(contentPillars) : [],
        keywords: keywords ? JSON.parse(keywords) : [],
        contentTypes: contentTypes ? JSON.parse(contentTypes) : [],
        platforms: platforms ? JSON.parse(platforms) : []
      }
    })

  } catch (error: any) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error.message }, 
      { status: 500 }
    )
  }
}