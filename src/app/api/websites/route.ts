import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createWebsiteSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url()
})

const updateWebsiteSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, url } = createWebsiteSchema.parse(body)

    // Check if website already exists for this user
    const existingWebsite = await prisma.website.findFirst({
      where: { 
        url,
        userId: session.user.id 
      }
    })

    if (existingWebsite) {
      return NextResponse.json(
        { error: 'Website already exists' }, 
        { status: 400 }
      )
    }

    // Create new website
    const website = await prisma.website.create({
      data: {
        name,
        url,
        userId: session.user.id,
        status: 'active'
      }
    })

    return NextResponse.json({ 
      success: true, 
      website 
    })

  } catch (error) {
    console.error('Create website error:', error)
    return NextResponse.json(
      { error: 'Failed to create website' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build where clause
    const where: any = { userId: session.user.id }
    if (status) where.status = status

    // Get websites with basic stats
    const websites = await prisma.website.findMany({
      where,
      include: {
        _count: {
          select: {
            pageAnalyses: true,
            keywordResearches: true,
            seoRecommendations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      websites 
    })

  } catch (error) {
    console.error('Get websites error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = updateWebsiteSchema.parse(body)

    // Verify website ownership
    const website = await prisma.website.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Update website
    const updatedWebsite = await prisma.website.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      website: updatedWebsite 
    })

  } catch (error) {
    console.error('Update website error:', error)
    return NextResponse.json(
      { error: 'Failed to update website' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Verify website ownership
    const website = await prisma.website.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Delete website (cascade will handle related data)
    await prisma.website.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Website deleted successfully' 
    })

  } catch (error) {
    console.error('Delete website error:', error)
    return NextResponse.json(
      { error: 'Failed to delete website' }, 
      { status: 500 }
    )
  }
}
