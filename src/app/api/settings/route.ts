import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    weeklyReports: z.boolean(),
    viralAlerts: z.boolean()
  }),
  ai: z.object({
    autoGenerate: z.boolean(),
    costFreeMode: z.boolean(),
    gptPlusWorkflow: z.boolean()
  }),
  content: z.object({
    autoPublish: z.boolean(),
    reviewBeforePublish: z.boolean(),
    defaultPlatforms: z.array(z.string())
  }),
  analytics: z.object({
    trackUserBehavior: z.boolean(),
    shareData: z.boolean(),
    realTimeUpdates: z.boolean()
  }),
  socialMedia: z.object({
    twitter: z.object({
      connected: z.boolean(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      accessToken: z.string().optional(),
      accessTokenSecret: z.string().optional()
    }),
    linkedin: z.object({
      connected: z.boolean(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      accessToken: z.string().optional()
    }),
    facebook: z.object({
      connected: z.boolean(),
      appId: z.string().optional(),
      appSecret: z.string().optional(),
      accessToken: z.string().optional()
    }),
    instagram: z.object({
      connected: z.boolean(),
      accessToken: z.string().optional()
    }),
    tiktok: z.object({
      connected: z.boolean(),
      accessToken: z.string().optional()
    }),
    youtube: z.object({
      connected: z.boolean(),
      apiKey: z.string().optional(),
      channelId: z.string().optional()
    })
  })
})

export async function GET() {
  try {
    // For now, we'll get settings from the AppSettings table
    // In a real app, you'd get the user ID from the session
    const settings = await prisma.appSettings.findFirst({
      where: {
        key: 'user_settings'
      }
    })

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        notifications: {
          email: true,
          push: false,
          weeklyReports: true,
          viralAlerts: true
        },
        ai: {
          autoGenerate: false,
          costFreeMode: true,
          gptPlusWorkflow: true
        },
        content: {
          autoPublish: false,
          reviewBeforePublish: true,
          defaultPlatforms: ['twitter', 'linkedin']
        },
        analytics: {
          trackUserBehavior: true,
          shareData: false,
          realTimeUpdates: true
        },
        socialMedia: {
          twitter: {
            connected: false,
            apiKey: '',
            apiSecret: '',
            accessToken: '',
            accessTokenSecret: ''
          },
          linkedin: {
            connected: false,
            clientId: '',
            clientSecret: '',
            accessToken: ''
          },
          facebook: {
            connected: false,
            appId: '',
            appSecret: '',
            accessToken: ''
          },
          instagram: {
            connected: false,
            accessToken: ''
          },
          tiktok: {
            connected: false,
            accessToken: ''
          },
          youtube: {
            connected: false,
            apiKey: '',
            channelId: ''
          }
        }
      }

      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ 
      settings: JSON.parse(settings.value) 
    })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    // For now, we'll save to AppSettings table
    // In a real app, you'd associate this with a specific user
    const settings = await prisma.appSettings.upsert({
      where: {
        key: 'user_settings'
      },
      update: {
        value: JSON.stringify(validatedData),
        updatedAt: new Date()
      },
      create: {
        key: 'user_settings',
        value: JSON.stringify(validatedData)
      }
    })

    return NextResponse.json({ 
      success: true, 
      settings: JSON.parse(settings.value) 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
