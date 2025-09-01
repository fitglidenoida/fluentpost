import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'SMO Trends API is working!',
      testData: [
        {
          trend: '30-Day Fitness Challenge',
          platform: 'instagram',
          engagement: '2.3M',
          growth: '+125%'
        }
      ]
    })
  } catch (error: any) {
    console.error('SMO Test API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test data', details: error.message },
      { status: 500 }
    )
  }
}
