import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Test successful',
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  })
}
