import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const campaignUpdateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().min(1),
  targetAudience: z.string().optional(),
  budget: z.number().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(['planning', 'active', 'paused', 'completed']).default('planning'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
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

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error: any) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = campaignUpdateSchema.parse(body)

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
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

    return NextResponse.json(campaign)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
