import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validatePassword, hashPassword } from '@/lib/passwordValidation'
import { emailSchema, nameSchema } from '@/lib/inputValidation'
import { SecurityAuditLogger, getClientIP, getUserAgent } from '@/lib/securityAudit'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()
    
    // Get client information for security audit
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)

    // Validate input using schemas
    const emailValidation = emailSchema.safeParse(email)
    const nameValidation = nameSchema.safeParse(name)
    
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: (emailValidation.error as any).errors[0].message },
        { status: 400 }
      )
    }
    
    if (!nameValidation.success) {
      return NextResponse.json(
        { error: (nameValidation.error as any).errors[0].message },
        { status: 400 }
      )
    }
    
    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: nameValidation.data,
        email: emailValidation.data,
        password: hashedPassword,
        role: role || 'user'
      }
    })

    // Log successful registration
    await SecurityAuditLogger.logRegistration(clientIP, userAgent, emailValidation.data, user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User created successfully'
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: `Failed to create user: ${error.message}` },
      { status: 500 }
    )
  }
}
