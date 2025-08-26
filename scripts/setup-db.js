// Set environment variables
process.env.DATABASE_URL = "file:./dev.db"
process.env.NEXTAUTH_URL = process.env.NODE_ENV === 'production' ? "https://fluentpost.in" : "http://localhost:3001"
process.env.NEXTAUTH_SECRET = "fitglide-marketing-dev-secret-key-2024"
process.env.NODE_ENV = process.env.NODE_ENV || "development"

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...')
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env })
    
    // Push schema to create tables
    console.log('🔄 Creating database tables...')
    execSync('npx prisma db push', { stdio: 'inherit', env: process.env })
    
    // Check if admin exists
    console.log('🔍 Checking for admin user...')
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    console.log('👤 Creating super admin user...')
    const hashedPassword = await bcrypt.hash('Admin@123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@fluentpost.in',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date()
      }
    })

    console.log('✅ Super Admin created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Password: Admin@123')
    console.log('⚠️  Please change the password after first login!')

    console.log('✅ Database setup complete!')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
