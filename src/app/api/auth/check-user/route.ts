import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const checkUserSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    console.log('Check user API - POST request received')
    
    const body = await request.json()
    const { email } = checkUserSchema.parse(body)

    console.log('Checking if user exists with email:', email)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    console.log('User found:', user.id)

    return NextResponse.json({ 
      success: true, 
      message: 'User found',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Check user error:', error)
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ')
      return NextResponse.json(
        { error: `Validation error: ${validationErrors}` }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to check user: ${error.message}` }, 
      { status: 500 }
    )
  }
}
