require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    const dbUrl = process.env.DATABASE_URL || '';
    // Show connection string with password hidden
    const hiddenUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log('DATABASE_URL:', hiddenUrl);
    console.log('\nConnection string breakdown:');
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      console.log('  Username:', match[1]);
      console.log('  Password:', match[2].substring(0, 5) + '...' + (match[2].includes('%40') ? ' (URL-encoded)' : ''));
      console.log('  Host:', match[3]);
      console.log('  Port:', match[4]);
      console.log('  Database:', match[5]);
    }
    
    await prisma.$connect();
    console.log('\n✅ Connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n💡 This error usually means:');
      console.error('   1. The username/tenant format is incorrect');
      console.error('   2. The password is incorrect');
      console.error('   3. The connection string format is wrong');
      console.error('\n   Please verify your connection string from Supabase dashboard:');
      console.error('   Settings → Database → Connection string → Connection Pooling');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
