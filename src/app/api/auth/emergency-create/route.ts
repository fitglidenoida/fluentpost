import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Simple password hashing function
function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    console.log('Emergency create user API - POST request received')
    
    // Create a default admin user
    const defaultUser = {
      name: 'Admin User',
      email: 'admin@fitglide.com',
      password: simpleHash('admin123'),
      role: 'admin'
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: defaultUser.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists',
        user: {
          email: existingUser.email,
          name: existingUser.name
        }
      })
    }

    // Create new admin user
    const user = await prisma.user.create({
      data: defaultUser
    })

    console.log('Emergency admin user created successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Emergency admin user created successfully',
      credentials: {
        email: 'admin@fitglide.com',
        password: 'admin123'
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Emergency create user error:', error)
    return NextResponse.json(
      { error: `Failed to create emergency user: ${error.message}` }, 
      { status: 500 }
    )
  }
}
