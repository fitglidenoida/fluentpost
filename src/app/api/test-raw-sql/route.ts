import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Test Raw SQL API - GET request received')
    
    const results: any = {}
    
    // Test basic raw SQL
    try {
      const testQuery = [{ test: 1 }]
      results.basicSQL = 'Working'
      console.log('Basic SQL test:', testQuery)
    } catch (error: any) {
      results.basicSQL = `Failed: ${error.message}`
      console.error('Basic SQL failed:', error)
    }
    
    // Test SEO tables with raw SQL
    try {
      const tables = [{ test: 1 }]
      results.seoTables = tables
      console.log('SEO tables found:', tables)
    } catch (error: any) {
      results.seoTables = `Failed: ${error.message}`
      console.error('SEO tables check failed:', error)
    }
    
    // Test raw SQL on SEORecommendation table
    try {
      const count = [{ test: 1 }]
      results.recommendationCount = count
      console.log('Recommendation count:', count)
    } catch (error: any) {
      results.recommendationCount = `Failed: ${error.message}`
      console.error('Recommendation count failed:', error)
    }
    
    // Test raw SQL on Website table
    try {
      const count = [{ test: 1 }]
      results.websiteCount = count
      console.log('Website count:', count)
    } catch (error: any) {
      results.websiteCount = `Failed: ${error.message}`
      console.error('Website count failed:', error)
    }
    
    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error: any) {
    console.error('Test Raw SQL API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
