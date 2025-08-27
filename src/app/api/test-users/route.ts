import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Test Users API - GET request received')
    
    // Count all users
    const userCount = await prisma.user.count()
    console.log('Total users in database:', userCount)
    
    // Get all users (limited to 10 for safety)
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('Users found:', users.length)
    
    return NextResponse.json({
      success: true,
      userCount,
      users
    })
    
  } catch (error) {
    console.error('Test Users API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
