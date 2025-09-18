const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  // Remove 'query' from the log array to hide SQL queries
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Connection optimization
async function connectWithRetry() {
  try {
    await prisma.$connect();
    console.log('📦 Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

module.exports = prisma;
