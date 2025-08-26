import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test basic database connectivity
    const totalRecommendations = await prisma.seORecommendation.count()
    const totalWebsites = await prisma.website.count()
    const totalUsers = await prisma.user.count()
    
    // Get some sample data
    const sampleRecommendations = await prisma.seORecommendation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    const sampleWebsites = await prisma.website.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      message: 'Recommendations test successful',
      counts: {
        recommendations: totalRecommendations,
        websites: totalWebsites,
        users: totalUsers
      },
      sampleData: {
        recommendations: sampleRecommendations,
        websites: sampleWebsites
      }
    })

  } catch (error) {
    console.error('Test recommendations error:', error)
    return NextResponse.json(
      { 
        error: 'Test recommendations failed', 
        details: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    )
  }
}
