import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6, "Password must be at least 6 characters long")
})

// Simple password hashing function (for development only)
function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    console.log('Reset password API - POST request received')
    
    const body = await request.json()
    const { email, newPassword } = resetPasswordSchema.parse(body)

    console.log('Looking for user with email:', email)

    // Find user by email
    const user = db.queryFirst(
      'SELECT * FROM User WHERE email = ?',
      [email]
    )

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    console.log('User found:', user.id)

    // Hash the new password (simple hash for now)
    const hashedPassword = simpleHash(newPassword)

    // Update user's password
    db.execute(
      'UPDATE User SET password = ?, updatedAt = datetime(\'now\') WHERE email = ?',
      [hashedPassword, email]
    )

    console.log('Password reset successful for user:', email)

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const validationErrors = error.errors.map((err: any) => err.message).join(', ')
      return NextResponse.json(
        { error: `Validation error: ${validationErrors}` }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to reset password: ${error.message}` }, 
      { status: 500 }
    )
  }
}
