import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing production database...')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dbPath: process.env.NODE_ENV === 'production' ? '/tmp/prod.db' : 'local'
    }

    // Test 1: Basic query
    try {
      const testQuery = db.query('SELECT 1 as test')
      results.basicQuery = 'SUCCESS'
      results.testResult = testQuery
    } catch (error: any) {
      results.basicQuery = `FAILED: ${error.message}`
    }

    // Test 2: Check if tables exist
    try {
      const tables = db.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `)
      results.tablesExist = 'SUCCESS'
      results.tablesList = tables.map((t: any) => t.name)
    } catch (error: any) {
      results.tablesExist = `FAILED: ${error.message}`
    }

    // Test 3: Check User table
    try {
      const userCount = db.query('SELECT COUNT(*) as count FROM User')[0]?.count
      results.userTable = 'SUCCESS'
      results.userCount = userCount
    } catch (error: any) {
      results.userTable = `FAILED: ${error.message}`
    }

    // Test 4: Check Website table  
    try {
      const websiteCount = db.query('SELECT COUNT(*) as count FROM Website')[0]?.count
      results.websiteTable = 'SUCCESS'
      results.websiteCount = websiteCount
    } catch (error: any) {
      results.websiteTable = `FAILED: ${error.message}`
    }

    // Test 5: Try to create a test user (if no users exist)
    try {
      const existingUsers = db.query('SELECT COUNT(*) as count FROM User')[0]?.count
      if (existingUsers === 0) {
        const testUserId = `test_${Date.now()}`
        db.execute(`
          INSERT INTO User (id, name, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [testUserId, 'Test User', 'test@example.com', 'hashedpassword', 'user'])
        results.testUserCreation = 'SUCCESS - Created test user'
      } else {
        results.testUserCreation = 'SKIPPED - Users already exist'
      }
    } catch (error: any) {
      results.testUserCreation = `FAILED: ${error.message}`
    }

    return NextResponse.json({
      success: true,
      message: 'Production database test completed',
      results
    })

  } catch (error: any) {
    console.error('Production DB test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database test failed', 
        message: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    )
  }
}
