import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().min(1),
  targetAudience: z.string().optional(),
  budget: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
})

export async function GET() {
  try {
    const campaigns = []

    return NextResponse.json({ campaigns })
  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = campaignSchema.parse(body)

    // Mock campaign creation since Campaign table doesn't exist
    const campaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'draft',
      userId: 'cmerb0ul10000v37n3jqqjoq4',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json(campaign, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}