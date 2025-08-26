import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({ 
      message: 'SEO Test API working',
      session: {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id
      },
      database: {
        connected: !!prisma,
        userCount: await prisma.user.count(),
        websiteCount: await prisma.website.count(),
        recommendationCount: await prisma.seORecommendation.count()
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      }
    })

  } catch (error) {
    console.error('SEO Test API error:', error)
    return NextResponse.json(
      { 
        error: 'SEO Test API failed', 
        details: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    )
  }
}
