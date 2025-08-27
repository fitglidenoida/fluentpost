import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().min(1),
  targetAudience: z.string().optional(),
  budget: z.number().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(['planning', 'active', 'paused', 'completed']).default('planning'),
})

export async function GET() {
  try {
    const campaigns = [],
      include: {
        analytics: {
          select: {
            id: true,
            type: true,
            metric: true,
            value: true,
          },
        },
      },
    })

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

    const campaign = { id: `mock_${Date.now()}` },
    })

    return NextResponse.json(campaign)
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
