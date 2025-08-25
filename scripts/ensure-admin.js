const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function ensureAdmin() {
  try {
    console.log('🔍 Checking for admin users...')
    
    // Check for existing admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' }
    })
    
    console.log(`Found ${adminUsers.length} admin user(s):`)
    adminUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`)
    })
    
    // Check if our target admin exists
    const targetAdmin = await prisma.user.findUnique({
      where: { email: 'admin@fluentpost.in' }
    })
    
    if (targetAdmin) {
      console.log('✅ Target admin (admin@fluentpost.in) already exists')
      
      // Update role to admin if not already
      if (targetAdmin.role !== 'admin') {
        await prisma.user.update({
          where: { email: 'admin@fluentpost.in' },
          data: { role: 'admin' }
        })
        console.log('✅ Updated role to admin')
      }
      
      // Update password to known value
      const hashedPassword = await bcrypt.hash('Admin@123', 12)
      await prisma.user.update({
        where: { email: 'admin@fluentpost.in' },
        data: { password: hashedPassword }
      })
      console.log('✅ Updated password to Admin@123')
      
    } else {
      console.log('👤 Creating new super admin user...')
      
      // Create new admin user
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
    }
    
    console.log('\n🎯 Login Credentials:')
    console.log('Email: admin@fluentpost.in')
    console.log('Password: Admin@123')
    console.log('⚠️  Please change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error ensuring admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

ensureAdmin()
