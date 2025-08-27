import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userCount = 0
    
    // Get all users (limited to 10 for safety) - mock data
    const users = []
    
    console.log('Users found:', users.length)
    
    return NextResponse.json({
      userCount,
      users
    })
  } catch (error) {
    console.error('Test Users API error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}