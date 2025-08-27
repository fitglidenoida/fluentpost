import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing session structure...')
    
    const session = await getServerSession(authOptions) as any
    
    return NextResponse.json({
      success: true,
      message: 'Session test completed',
      results: {
        hasSession: !!session,
        sessionKeys: session ? Object.keys(session) : [],
        user: session?.user ? {
          hasUser: true,
          userKeys: Object.keys(session.user),
          email: session.user.email,
          id: session.user.id,
          name: session.user.name
        } : null,
        fullSession: session
      }
    })

  } catch (error: any) {
    console.error('Session test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Session test failed', 
        message: error.message
      }, 
      { status: 500 }
    )
  }
}
