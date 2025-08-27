import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// Simple password hashing function
function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    console.log('Emergency create user API - POST request received')
    
    const body = await request.json()
    const { email } = body
    
    // Create user with provided email or default
    const userEmail = email || 'admin@fitglide.com'
    const userName = email ? email.split('@')[0] : 'Admin User'
    
    const defaultUser = {
      name: userName,
      email: userEmail,
      password: simpleHash('admin123'),
      role: 'admin'
    }

    // Check if user already exists
    const existingUser = db.queryFirst(
      'SELECT * FROM User WHERE email = ?',
      [defaultUser.email]
    )

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
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    db.execute(`
      INSERT INTO User (id, name, email, password, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [userId, defaultUser.name, defaultUser.email, defaultUser.password, defaultUser.role])

    const user = db.queryFirst('SELECT * FROM User WHERE id = ?', [userId])

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
