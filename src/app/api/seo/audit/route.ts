import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { SEOService } from '@/lib/seoService'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const auditWebsiteSchema = z.object({
  websiteId: z.string(),
  url: z.string().url()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { websiteId, url } = auditWebsiteSchema.parse(body)

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

    // Perform comprehensive audit
    console.log('Starting website audit for:', url)
    const audit = await SEOService.performWebsiteAudit(url)
    console.log('Audit completed, saving to database...')

    // Save audit to database (upsert to handle duplicates)
    const savedAudit = await prisma.pageAnalysis.upsert({
      where: {
        websiteId_url: {
          websiteId,
          url: audit.url
        }
      },
      update: {
        title: 'Website Audit',
        seoScore: audit.currentState.seoScore,
        issues: JSON.stringify({
          technical: audit.currentState.technicalIssues,
          content: audit.currentState.contentIssues,
          performance: audit.currentState.performanceIssues,
          mobile: audit.currentState.mobileIssues
        }),
        suggestions: JSON.stringify(audit.actionableItems),
        scannedAt: audit.scannedAt
      },
      create: {
        websiteId,
        url: audit.url,
        title: 'Website Audit',
        seoScore: audit.currentState.seoScore,
        issues: JSON.stringify({
          technical: audit.currentState.technicalIssues,
          content: audit.currentState.contentIssues,
          performance: audit.currentState.performanceIssues,
          mobile: audit.currentState.mobileIssues
        }),
        suggestions: JSON.stringify(audit.actionableItems),
        scannedAt: audit.scannedAt
      }
    })
    console.log('Audit saved, creating recommendations...')

    // Create SEO recommendations
    const recommendations = audit.actionableItems.map((item: any) => ({
      websiteId,
      type: item.category.toLowerCase().replace(' ', '_'),
      priority: item.priority,
      description: item.issue,
      action: `Estimated time: ${item.estimatedTime}, Impact: ${item.impact}`
    }))

    try {
      // Clear existing recommendations for this website
      await prisma.seORecommendation.deleteMany({
        where: { websiteId }
      })
      
      // Create new recommendations
      await Promise.all(
        recommendations.map(rec => 
          prisma.seORecommendation.create({ data: rec })
        )
      )
      console.log('Recommendations created successfully')
    } catch (recError) {
      console.error('Error creating recommendations:', recError)
      // Continue without recommendations if they fail
    }

    return NextResponse.json({ 
      success: true, 
      audit: {
        ...audit,
        auditId: savedAudit.id
      }
    })

  } catch (error) {
    console.error('Website audit error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: `Failed to perform website audit: ${error.message}` }, 
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

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Get audit history for website
    const audits = await prisma.pageAnalysis.findMany({
      where: { websiteId },
      orderBy: { scannedAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      audits 
    })

  } catch (error) {
    console.error('Get audit history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit history' }, 
      { status: 500 }
    )
  }
}
