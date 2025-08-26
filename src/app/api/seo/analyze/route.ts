import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SEOService } from '@/lib/seoService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const analyzeWebsiteSchema = z.object({
  url: z.string().url(),
  websiteName: z.string().min(1).max(100)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, websiteName } = analyzeWebsiteSchema.parse(body)

    // Get or create website record
    let website = await prisma.website.findFirst({
      where: { 
        url,
        userId: session.user.id 
      }
    })

    if (!website) {
      website = await prisma.website.create({
        data: {
          name: websiteName,
          url,
          userId: session.user.id,
          status: 'scanning'
        }
      })
    }

    // Analyze the website
    const analysis = await SEOService.analyzeWebsite(url)

    // Save page analysis
    const pageAnalysis = await prisma.pageAnalysis.create({
      data: {
        websiteId: website.id,
        url: analysis.url,
        title: analysis.title,
        metaDescription: analysis.metaDescription,
        headings: analysis.headings ? JSON.stringify(analysis.headings) : null,
        content: analysis.content,
        seoScore: analysis.seoScore,
        issues: analysis.issues ? JSON.stringify(analysis.issues) : null,
        suggestions: analysis.suggestions ? JSON.stringify(analysis.suggestions) : null
      }
    })

    // Update website status
    await prisma.website.update({
      where: { id: website.id },
      data: { 
        status: 'active',
        lastScanned: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      website,
      analysis: {
        ...analysis,
        pageAnalysisId: pageAnalysis.id
      }
    })

  } catch (error) {
    console.error('Website analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze website' }, 
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

    // Get website with all analyses
    const website = await prisma.website.findFirst({
      where: { 
        id: websiteId,
        userId: session.user.id 
      },
      include: {
        pageAnalyses: {
          orderBy: { scannedAt: 'desc' }
        }
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      website 
    })

  } catch (error) {
    console.error('Get website analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch website analysis' }, 
      { status: 500 }
    )
  }
}
