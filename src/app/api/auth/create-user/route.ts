import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
})

// Simple password hashing function (for development only)
function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    console.log('Create user API - POST request received')
    
    const body = await request.json()
    const { name, email, password } = createUserSchema.parse(body)

    console.log('Creating user with email:', email)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json({ 
        error: 'User already exists' 
      }, { status: 400 })
    }

    // Hash the password (simple hash for now)
    const hashedPassword = simpleHash(password)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user'
      }
    })

    console.log('User created successfully:', email)

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: `Failed to create user: ${error.message}` }, 
      { status: 500 }
    )
  }
}
