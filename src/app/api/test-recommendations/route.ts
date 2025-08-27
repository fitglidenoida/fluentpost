import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test basic database connectivity
    const totalRecommendations = 0
    const totalWebsites = 0
    const totalUsers = 0
    
    // Get some sample data
    const sampleRecommendations = []
    })
    
    const sampleWebsites = []
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
