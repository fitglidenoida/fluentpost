import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    
    const where = type ? { type } : {}
    
    const audits = await prisma.securityAudit.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })
    
    return NextResponse.json({
      success: true,
      audits: audits.map(audit => ({
        ...audit,
        details: JSON.parse(audit.details)
      }))
    })
    
  } catch (error: any) {
    console.error('Error fetching security audits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security audits' },
      { status: 500 }
    )
  }
}
