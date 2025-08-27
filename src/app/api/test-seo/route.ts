import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Test SEO API - GET request received')
    
    const results: any = {}
    
    // Test basic database connection
    try {
      const testQuery = await prisma.$queryRaw`SELECT 1 as test`
      results.dbConnection = 'Working'
      console.log('Database connection test:', testQuery)
    } catch (error: any) {
      results.dbConnection = `Failed: ${error.message}`
      console.error('Database connection failed:', error)
    }
    
    // Check if SEO tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('SEORecommendation', 'Website', 'PageAnalysis')
        ORDER BY name
      `
      results.seoTables = tables
      console.log('SEO tables found:', tables)
    } catch (error: any) {
      results.seoTables = `Failed: ${error.message}`
      console.error('SEO tables check failed:', error)
    }
    
    // Test Prisma client models
    try {
      results.prismaClient = {
        type: typeof prisma,
        hasSeORecommendation: typeof prisma?.seORecommendation,
        hasWebsite: typeof prisma?.website,
        hasPageAnalysis: typeof prisma?.pageAnalysis
      }
    } catch (error: any) {
      results.prismaClient = `Failed: ${error.message}`
    }
    
    // Count records in each table
    try {
      const websiteCount = await prisma.website.count()
      results.websiteCount = websiteCount
    } catch (error: any) {
      results.websiteCount = `Failed: ${error.message}`
    }
    
    try {
      const recommendationCount = await prisma.seORecommendation.count()
      results.recommendationCount = recommendationCount
    } catch (error: any) {
      results.recommendationCount = `Failed: ${error.message}`
    }
    
    try {
      const pageAnalysisCount = await prisma.pageAnalysis.count()
      results.pageAnalysisCount = pageAnalysisCount
    } catch (error: any) {
      results.pageAnalysisCount = `Failed: ${error.message}`
    }
    
    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error: any) {
    console.error('Test SEO API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
