import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const generateRecommendationsSchema = z.object({
  websiteId: z.string().optional(),
  auditResults: z.any().optional()
})

const updateRecommendationSchema = z.object({
  recommendationId: z.string(),
  status: z.enum(['pending', 'implemented', 'ignored'])
})

export async function POST(request: NextRequest) {
  try {
    console.log('Recommendations API - POST request received')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId, auditResults } = generateRecommendationsSchema.parse(body)

    // If auditResults are provided, generate recommendations from them
    if (auditResults && auditResults.actionableItems) {
      console.log('Processing audit results:', auditResults.actionableItems.length, 'items')
      
      if (!websiteId) {
        return NextResponse.json({ 
          error: 'Website ID is required to create recommendations' 
        }, { status: 400 })
      }

      // Verify website ownership (same pattern as audit API)
      const website = await prisma.website.findFirst({
        where: { 
          id: websiteId,
          userId: session.user.id 
        }
      })

      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }

      // Clear existing recommendations for this website
      await prisma.seORecommendation.deleteMany({
        where: { websiteId }
      })
      console.log('Cleared existing recommendations for website:', websiteId)

      // Create recommendations from actionable items
      const recommendations = auditResults.actionableItems.map((item: any) => ({
        websiteId: websiteId,
        type: item.category.toLowerCase().replace(' ', '_'),
        priority: item.priority,
        description: item.issue,
        action: `Estimated time: ${item.estimatedTime}, Impact: ${item.impact}`,
        status: 'pending'
      }))

      console.log('Creating recommendations:', recommendations.length, 'items')

      const createdRecommendations = await Promise.all(
        recommendations.map(rec => 
          prisma.seORecommendation.create({ data: rec })
        )
      )
      
      console.log('Recommendations created successfully:', createdRecommendations.length, 'items')
      
      return NextResponse.json({ 
        success: true, 
        message: `Generated ${createdRecommendations.length} recommendations`,
        recommendations: createdRecommendations
      })
    }

    // If no auditResults, return error
    return NextResponse.json({ 
      error: 'Audit results are required to generate recommendations' 
    }, { status: 400 })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: `Failed to generate recommendations: ${error.message}` }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Recommendations API - GET request received')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build where clause (same pattern as audit API)
    const where: any = {}
    
    if (websiteId) {
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

    // Get recommendations
    const recommendations = await prisma.seORecommendation.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Attach website info
    const websiteIds = Array.from(new Set(recommendations.map((r: any) => r.websiteId)))
    const websites = websiteIds.length
      ? await prisma.website.findMany({
          where: { id: { in: websiteIds } },
          select: { id: true, name: true, url: true }
        })
      : []
    const websiteById = new Map(websites.map((w: any) => [w.id, w]))

    const recommendationsWithWebsite = recommendations.map((r: any) => ({
      ...r,
      website: websiteById.get(r.websiteId) || null,
    }))

    console.log('Returning recommendations:', recommendationsWithWebsite.length, 'items')

    return NextResponse.json({ 
      success: true, 
      recommendations: recommendationsWithWebsite,
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message }, 
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
