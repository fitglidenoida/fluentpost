import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import * as z from 'zod'

const topicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  keywords: z.string().min(1, 'Keywords are required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status

    // Mock data since topic table doesn't exist in our current schema
    const topics: any[] = []
    const total = 0

    return NextResponse.json({
      topics,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = topicSchema.parse(body)

    // Mock topic creation since topic table doesn't exist in our current schema
    const topic = {
      id: `topic_${Date.now()}`,
      ...validatedData,
      userId: 'cmerb0ul10000v37n3jqqjoq4',
      viralScore: 0,
      status: 'researching',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(topic, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
