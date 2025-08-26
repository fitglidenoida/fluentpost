import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SEOService } from '@/lib/seoService'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Safe Prisma wrapper function
const createSafePrisma = () => {
  if (!prisma) {
    console.error('Prisma client is not available for safe wrapper')
    return null
  }
  
  return {
    user: {
      findUnique: async (params: any) => {
        try {
          return await prisma.user.findUnique(params)
        } catch (error) {
          console.error('Prisma user.findUnique error:', error)
          return null
        }
      }
    },
    website: {
      findFirst: async (params: any) => {
        try {
          return await prisma.website.findFirst(params)
        } catch (error) {
          console.error('Prisma website.findFirst error:', error)
          return null
        }
      },
      findMany: async (params: any) => {
        try {
          return await prisma.website.findMany(params)
        } catch (error) {
          console.error('Prisma website.findMany error:', error)
          return []
        }
      }
    },
    seORecommendation: {
      findMany: async (params: any) => {
        try {
          return await prisma.seORecommendation.findMany(params)
        } catch (error) {
          console.error('Prisma seORecommendation.findMany error:', error)
          return []
        }
      },
      create: async (params: any) => {
        try {
          return await prisma.seORecommendation.create(params)
        } catch (error) {
          console.error('Prisma seORecommendation.create error:', error)
          throw error
        }
      },
      update: async (params: any) => {
        try {
          return await prisma.seORecommendation.update(params)
        } catch (error) {
          console.error('Prisma seORecommendation.update error:', error)
          throw error
        }
      },
      deleteMany: async (params: any) => {
        try {
          return await prisma.seORecommendation.deleteMany(params)
        } catch (error) {
          console.error('Prisma seORecommendation.deleteMany error:', error)
          throw error
        }
      }
    }
  }
}

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
    
    // Check if Prisma is available and create safe wrapper
    if (!prisma) {
      console.error('Recommendations API - Prisma client is not available')
      return NextResponse.json(
        { error: 'Database connection not available' }, 
        { status: 500 }
      )
    }
    
    console.log('Recommendations API - Prisma client is available')
    
    // Create safe wrapper
    const safePrisma = createSafePrisma()
    if (!safePrisma) {
      console.error('Recommendations API - Failed to create safe Prisma wrapper')
      return NextResponse.json(
        { error: 'Database wrapper not available' }, 
        { status: 500 }
      )
    }
    
    console.log('Recommendations API - Safe Prisma wrapper created successfully')
    
    // Test Prisma connection
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Recommendations API - Prisma connection test successful')
    } catch (connectionError) {
      console.error('Recommendations API - Prisma connection test failed:', connectionError)
      return NextResponse.json(
        { error: 'Database connection test failed' }, 
        { status: 500 }
      )
    }
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('Recommendations API - Unauthorized: No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Recommendations API - User email:', session.user.email)

    const body = await request.json()
    console.log('Recommendations API - Request body:', { websiteId: body.websiteId, hasAuditResults: !!body.auditResults })
    
    const { websiteId, auditResults } = generateRecommendationsSchema.parse(body)

    // If auditResults are provided, generate recommendations from them
    if (auditResults && auditResults.actionableItems) {
      console.log('Recommendations API - Processing audit results')
      console.log('Recommendations API - Audit results structure:', {
        hasActionableItems: !!auditResults.actionableItems,
        actionableItemsLength: auditResults.actionableItems?.length,
        actionableItemsSample: auditResults.actionableItems?.slice(0, 2)
      })
      console.log('Generating recommendations from audit results:', auditResults.actionableItems.length, 'items')
      
      // Get user ID from database using email
      const user = await safePrisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Clear existing recommendations for this website if websiteId is provided
      if (websiteId) {
        try {
          await safePrisma.seORecommendation.deleteMany({
            where: { websiteId }
          })
          console.log('Cleared existing recommendations for website:', websiteId)
        } catch (deleteError) {
          console.error('Error clearing existing recommendations:', deleteError)
          // Continue anyway, don't fail the whole operation
        }
      }

      // Create recommendations from actionable items
      if (!websiteId) {
        console.log('Recommendations API - No websiteId provided, cannot create recommendations')
        return NextResponse.json({ 
          error: 'Website ID is required to create recommendations' 
        }, { status: 400 })
      }

      const recommendations = auditResults.actionableItems.map((item: any) => ({
        websiteId: websiteId,
        type: item.category.toLowerCase().replace(' ', '_'),
        priority: item.priority,
        description: item.issue,
        action: `Estimated time: ${item.estimatedTime}, Impact: ${item.impact}`,
        status: 'pending'
      }))

      console.log('Creating recommendations from audit results:', recommendations.length, 'items')

      try {
        console.log('Creating recommendations from audit results:', recommendations.length, 'items')
        
        const createdRecommendations = await Promise.all(
          recommendations.map(rec => 
            safePrisma.seORecommendation.create({ data: rec })
          )
        )
        
        console.log('Recommendations created successfully:', createdRecommendations.length, 'items')
        
        return NextResponse.json({ 
          success: true, 
          message: `Generated ${createdRecommendations.length} recommendations`,
          recommendations: createdRecommendations
        })
      } catch (error) {
        console.error('Error creating recommendations from audit results:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
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

    // Get user ID from database using email
    const user = await safePrisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify website ownership
    const website = await safePrisma.website.findFirst({
      where: { 
        id: websiteId,
        userId: user.id 
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
        safePrisma.seORecommendation.create({
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
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
    const user = await safePrisma.user.findUnique({
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

    // Build where clause - get all recommendations for user's websites
    const where: any = {}
    
    if (websiteId) {
      // If specific website requested, verify ownership
      const website = await safePrisma.website.findFirst({
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
      const userWebsites = await safePrisma.website.findMany({
        where: { userId: user.id },
        select: { id: true }
      })
      where.websiteId = { in: userWebsites.map(w => w.id) }
    }

    if (status) where.status = status
    if (priority) where.priority = priority

    // Get recommendations (without relying on Prisma relation includes)
    const recommendations = await safePrisma.seORecommendation.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('Recommendations API Debug:', {
      user: { id: user.id, email: session.user.email },
      where,
      recommendationsCount: recommendations.length,
      recommendations: recommendations.slice(0, 3) // First 3 for debugging
    })

    // Attach website info via a separate query
    const websiteIds = Array.from(new Set(recommendations.map((r: any) => r.websiteId)))
    const websites = websiteIds.length
      ? await safePrisma.website.findMany({
          where: { id: { in: websiteIds } },
          select: { id: true, name: true, url: true }
        })
      : []
    const websiteById = new Map(websites.map((w: any) => [w.id, w]))

    const recommendationsWithWebsite = recommendations.map((r: any) => ({
      ...r,
      website: websiteById.get(r.websiteId) || null,
    }))

    console.log('Final response:', {
      success: true,
      recommendationsCount: recommendationsWithWebsite.length,
      hasRecommendations: recommendationsWithWebsite.length > 0
    })

    return NextResponse.json({ 
      success: true, 
      recommendations: recommendationsWithWebsite,
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
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
    const recommendation = await safePrisma.seORecommendation.update({
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
