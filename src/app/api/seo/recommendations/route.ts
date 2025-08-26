import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SEOService } from '@/lib/seoService'
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

      // Clear existing recommendations for this website
      try {
        await prisma.seORecommendation.deleteMany({
          where: { websiteId }
        })
        console.log('Cleared existing recommendations for website:', websiteId)
      } catch (deleteError) {
        console.error('Error clearing recommendations:', deleteError)
        // Continue anyway
      }

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

      try {
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
      } catch (error) {
        console.error('Error creating recommendations:', error)
        return NextResponse.json(
          { error: `Failed to create recommendations: ${error.message}` }, 
          { status: 500 }
        )
      }
    }

    // If no auditResults, proceed with website-based generation
    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required when no audit results provided' }, { status: 400 })
    }

    // Generate recommendations using SEOService
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
            action: rec.action,
            status: 'pending'
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
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: `Failed to generate recommendations: ${error.message}` }, 
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

    // Get user ID from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build where clause
    const where: any = {}
    
    if (websiteId) {
      // Verify website ownership
      const website = await prisma.website.findFirst({
        where: { 
          id: websiteId,
          userId: user.id 
        }
      })
      if (!website) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 })
      }
      where.websiteId = websiteId
    } else {
      // Get all recommendations for user's websites
      const userWebsites = await prisma.website.findMany({
        where: { userId: user.id },
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
