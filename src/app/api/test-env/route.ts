import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    twitterApiKey: process.env.TWITTER_API_KEY ? '***configured***' : 'missing',
    twitterApiSecret: process.env.TWITTER_API_SECRET ? '***configured***' : 'missing',
    twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN ? '***configured***' : 'missing',
    twitterAccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ? '***configured***' : 'missing',
    facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? '***configured***' : 'missing',
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('TWITTER') || key.includes('FACEBOOK'))
  })
}
