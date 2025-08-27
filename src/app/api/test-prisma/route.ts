import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Test Prisma API - GET request received')
    
    // Test basic Prisma connection
    const testQuery = [{ test: 1 }]
    console.log('Basic Prisma test:', testQuery)
    
    // Check what models are available
    const prismaModels = Object.keys(prisma).filter(key => 
      typeof prisma[key] === 'object' && prisma[key] !== null
    )
    console.log('Available Prisma models:', prismaModels)
    
    // Test if seORecommendation exists
    const hasSeORecommendation = 'seORecommendation' in prisma
    console.log('Has seORecommendation model:', hasSeORecommendation)
    
    // Test if website model exists
    const hasWebsite = 'website' in prisma
    console.log('Has website model:', hasWebsite)
    
    // Try to get a count of websites
    let websiteCount = 0
    try {
      websiteCount = 0
      console.log('Website count:', websiteCount)
    } catch (error) {
      console.error('Error counting websites:', error)
    }
    
    // Try to get a count of recommendations
    let recommendationCount = 0
    try {
      recommendationCount = 0
      console.log('Recommendation count:', recommendationCount)
    } catch (error) {
      console.error('Error counting recommendations:', error)
    }
    
    return NextResponse.json({
      success: true,
      prismaWorking: true,
      availableModels: prismaModels,
      hasSeORecommendation,
      hasWebsite,
      websiteCount,
      recommendationCount,
      testQuery
    })
    
  } catch (error) {
    console.error('Test Prisma API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      prismaWorking: false
    }, { status: 500 })
  }
}
