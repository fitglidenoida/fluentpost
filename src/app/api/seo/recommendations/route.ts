import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SEOService } from '@/lib/seoService'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const generateRecommendationsSchema = z.object({
  websiteId: z.string()
})

const updateRecommendationSchema = z.object({
  recommendationId: z.string(),
  status: z.enum(['pending', 'implemented', 'ignored'])
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId } = generateRecommendationsSchema.parse(body)

    // Verify website ownership
    const website = await prisma.website.findFirst({
      where: { 
        id: websiteId,
        userId: session.user.id 
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Generate recommendations
    const recommendations = await SEOService.generateRecommendations(websiteId)

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      recommendations.map(rec => 
        prisma.seORecommendation.create({
          data: {
            websiteId,
            type: rec.type,
            priority: rec.priority,
            description: rec.description,
            action: rec.action
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      recommendations: savedRecommendations,
      total: savedRecommendations.length
    })

  } catch (error) {
    console.error('Generate recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build where clause - get all recommendations for user's websites
    const where: any = {}
    
    if (websiteId) {
      // If specific website requested, verify ownership
      const website = await prisma.website.findFirst({
        where: { 
          id: websiteId,
          userId: session.user.id 
        }
      })
      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }
      where.websiteId = websiteId
    } else {
      // Get all recommendations for user's websites
      const userWebsites = await prisma.website.findMany({
        where: { userId: session.user.id },
        select: { id: true }
      })
      where.websiteId = { in: userWebsites.map(w => w.id) }
    }

    if (status) where.status = status
    if (priority) where.priority = priority

    // Get recommendations with website info
    const recommendations = await prisma.seORecommendation.findMany({
      where,
      include: {
        website: {
          select: {
            id: true,
            name: true,
            url: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      recommendations 
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recommendationId, status } = updateRecommendationSchema.parse(body)

    // Update recommendation status
    const recommendation = await prisma.seORecommendation.update({
      where: { id: recommendationId },
      data: { status }
    })

    return NextResponse.json({ 
      success: true, 
      recommendation 
    })

  } catch (error) {
    console.error('Update recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to update recommendation' }, 
      { status: 500 }
    )
  }
}
