import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    console.log('Reset password API - POST request received')
    
    const body = await request.json()
    const { email, newPassword } = resetPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log('Password reset successful for user:', email)

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' }, 
      { status: 500 }
    )
  }
}
