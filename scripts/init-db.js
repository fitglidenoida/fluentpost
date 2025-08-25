const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...')
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...')
    const { execSync } = require('child_process')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Run migrations
    console.log('🔄 Running database migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // Check if admin already exists
    console.log('🔍 Checking for existing admin user...')
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

    // Create some default settings
    console.log('⚙️ Creating default settings...')
    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        theme: 'light',
        notifications: true,
        socialMedia: {
          twitter: { connected: false },
          facebook: { connected: false },
          instagram: { connected: false }
        }
      }
    })

    console.log('✅ Database initialization complete!')

  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initializeDatabase()
