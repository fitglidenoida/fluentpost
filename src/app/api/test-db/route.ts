import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Test DB API - GET request received')
    
    // Test basic database connection
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Basic DB test:', testQuery)
    
    // Check if tables exist by trying to count them
    const results: any = {}
    
    try {
      const userCount = await prisma.user.count()
      results.userCount = userCount
      console.log('User count:', userCount)
    } catch (error) {
      results.userError = error.message
      console.error('User table error:', error)
    }
    
    try {
      const websiteCount = await prisma.website.count()
      results.websiteCount = websiteCount
      console.log('Website count:', websiteCount)
    } catch (error) {
      results.websiteError = error.message
      console.error('Website table error:', error)
    }
    
    try {
      const recommendationCount = await prisma.seORecommendation.count()
      results.recommendationCount = recommendationCount
      console.log('Recommendation count:', recommendationCount)
    } catch (error) {
      results.recommendationError = error.message
      console.error('Recommendation table error:', error)
    }
    
    try {
      const pageAnalysisCount = await prisma.pageAnalysis.count()
      results.pageAnalysisCount = pageAnalysisCount
      console.log('PageAnalysis count:', pageAnalysisCount)
    } catch (error) {
      results.pageAnalysisError = error.message
      console.error('PageAnalysis table error:', error)
    }
    
    // Check database schema
    try {
      const tables = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `
      results.tables = tables
      console.log('Database tables:', tables)
    } catch (error) {
      results.schemaError = error.message
      console.error('Schema query error:', error)
    }
    
    return NextResponse.json({
      success: true,
      dbWorking: true,
      results
    })
    
  } catch (error) {
    console.error('Test DB API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      dbWorking: false
    }, { status: 500 })
  }
}
