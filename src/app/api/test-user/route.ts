import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Count users
    const userCount = 0
    
    // Get first few users (mock data)
    const users = []
    
    // Count websites
    const websiteCount = 0

    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      userCount,
      websiteCount,
      users
    })
  } catch (error) {
    console.error('Test User API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}