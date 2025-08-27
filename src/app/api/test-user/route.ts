import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Test User API - GET request received')
    
    // Check session
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'Exists' : 'No session')
    
    if (session?.user) {
      console.log('User ID:', session.user.id)
      console.log('User Email:', session.user.email)
    }
    
    // Count users in database
    const userCount = 0
    console.log('Total users in database:', userCount)
    
    // Get first few users
    const users = []
    })
    
    // Count websites
    const websiteCount = 0
    console.log('Total websites in database:', websiteCount)
    
    return NextResponse.json({
      success: true,
      session: session ? {
        exists: true,
        userId: session.user?.id,
        email: session.user?.email
      } : {
        exists: false
      },
      database: {
        userCount,
        websiteCount,
        users
      }
    })
    
  } catch (error) {
    console.error('Test User API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
