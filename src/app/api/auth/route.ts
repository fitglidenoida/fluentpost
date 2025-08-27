import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './[...nextauth]/route'
import db from '@/lib/db'
import { z } from 'zod'

// Utility function for simple password hashing
const simpleHash = (password: string): string => {
  return Buffer.from(password).toString('base64')
}

const simpleCompare = (password: string, hash: string): boolean => {
  return simpleHash(password) === hash
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
})

const resetPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional()
})

const checkUserSchema = z.object({
  email: z.string().email('Valid email is required')
})

/**
 * Centralized Authentication API
 * 
 * POST /api/auth?action=register - Register new user
 * POST /api/auth?action=login - Login user  
 * POST /api/auth?action=reset-password - Reset user password
 * POST /api/auth?action=check-user - Check if user exists
 * POST /api/auth?action=emergency-create - Emergency user creation
 * GET /api/auth?action=profile - Get current user profile
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }

    const body = await request.json()

    switch (action) {
      case 'register':
        return handleRegister(body)
      
      case 'login':
        return handleLogin(body)
      
      case 'reset-password':
        return handleResetPassword(body)
      
      case 'check-user':
        return handleCheckUser(body)
      
      case 'emergency-create':
        return handleEmergencyCreate(body)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'profile') {
      return handleGetProfile()
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    )
  }
}

// Handler functions
async function handleRegister(body: any) {
  const { email, password, name } = registerSchema.parse(body)

  // Check if user already exists
  const existingUser = db.queryFirst(
    'SELECT id FROM User WHERE email = ?',
    [email]
  )

  if (existingUser) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 400 }
    )
  }

  // Create new user
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const hashedPassword = simpleHash(password)
  const now = new Date().toISOString()

  db.execute(
    `INSERT INTO User (id, email, password, name, role, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, email, hashedPassword, name || null, 'user', now, now]
  )

  // Return user info (without password)
  const user = db.queryFirst(
    'SELECT id, email, name, role, createdAt FROM User WHERE id = ?',
    [userId]
  )

  return NextResponse.json({
    success: true,
    message: 'User created successfully',
    user
  })
}

async function handleLogin(body: any) {
  const { email, password } = loginSchema.parse(body)

  // Find user
  const user = db.queryFirst(
    'SELECT * FROM User WHERE email = ?',
    [email]
  ) as any

  if (!user || !user.password) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Verify password
  const isValid = simpleCompare(password, user.password)

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Return user info (without password)
  const { password: _, ...userWithoutPassword } = user

  return NextResponse.json({
    success: true,
    message: 'Login successful',
    user: userWithoutPassword
  })
}

async function handleResetPassword(body: any) {
  const { email, newPassword } = resetPasswordSchema.parse(body)

  // Find user
  const user = db.queryFirst(
    'SELECT id FROM User WHERE email = ?',
    [email]
  )

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (newPassword) {
    // Update password
    const hashedPassword = simpleHash(newPassword)
    
    db.execute(
      'UPDATE User SET password = ?, updatedAt = ? WHERE email = ?',
      [hashedPassword, new Date().toISOString(), email]
    )

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } else {
    // Just confirm user exists for password reset flow
    return NextResponse.json({
      success: true,
      message: 'User found',
      email
    })
  }
}

async function handleCheckUser(body: any) {
  const { email } = checkUserSchema.parse(body)

  const user = db.queryFirst(
    'SELECT id, email, name FROM User WHERE email = ?',
    [email]
  )

  return NextResponse.json({
    success: true,
    exists: !!user,
    user: user || null
  })
}

async function handleEmergencyCreate(body: any) {
  const { email } = body

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  // Check if user exists
  let user = db.queryFirst(
    'SELECT * FROM User WHERE email = ?',
    [email]
  ) as any

  if (!user) {
    // Create emergency user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const tempPassword = 'temp123456'
    const hashedPassword = simpleHash(tempPassword)
    const now = new Date().toISOString()

    db.execute(
      `INSERT INTO User (id, email, password, name, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, 'Emergency User', 'admin', now, now]
    )

    user = {
      id: userId,
      email,
      password: tempPassword,
      name: 'Emergency User',
      role: 'admin'
    }
  } else {
    // Reset existing user password
    const tempPassword = 'temp123456'
    const hashedPassword = simpleHash(tempPassword)
    
    db.execute(
      'UPDATE User SET password = ?, updatedAt = ? WHERE email = ?',
      [hashedPassword, new Date().toISOString(), email]
    )

    user.password = tempPassword
  }

  return NextResponse.json({
    success: true,
    message: 'Emergency access created',
    credentials: {
      email: user.email,
      password: user.password
    }
  })
}

async function handleGetProfile() {
  const session = await getServerSession(authOptions) as any

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = db.queryFirst(
    'SELECT id, email, name, role, createdAt FROM User WHERE email = ?',
    [session.user.email]
  )

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    user
  })
}
