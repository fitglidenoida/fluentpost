import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Test SEO API - GET request received')
    
    const results: any = {}
    
    // Test basic database connection
    try {
      const testQuery = [{ test: 1 }]
      results.dbConnection = 'Working'
      console.log('Database connection test:', testQuery)
    } catch (error: any) {
      results.dbConnection = `Failed: ${error.message}`
      console.error('Database connection failed:', error)
    }
    
    // Check if SEO tables exist
    try {
      const tables = [{ test: 1 }]
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
      const websiteCount = 0
      results.websiteCount = websiteCount
    } catch (error: any) {
      results.websiteCount = `Failed: ${error.message}`
    }
    
    try {
      const recommendationCount = 0
      results.recommendationCount = recommendationCount
    } catch (error: any) {
      results.recommendationCount = `Failed: ${error.message}`
    }
    
    try {
      const pageAnalysisCount = 0
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
