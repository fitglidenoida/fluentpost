import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Mock security audit data since SecurityAudit table doesn't exist
    const audits = []
    
    return NextResponse.json({
      success: true,
      audits: audits.map((audit: any) => ({
        ...audit,
        details: JSON.parse(audit.details || '{}')
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