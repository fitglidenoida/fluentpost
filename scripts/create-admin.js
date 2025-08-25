const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
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

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
