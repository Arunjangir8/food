const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Check all restaurants
    const allRestaurants = await prisma.restaurant.findMany();
    console.log(`Total restaurants in DB: ${allRestaurants.length}`);
    
    if (allRestaurants.length > 0) {
      console.log('Restaurant details:');
      allRestaurants.forEach(restaurant => {
        console.log(`- ${restaurant.name} (${restaurant.city}) - Active: ${restaurant.isActive}`);
      });
    }
    
    // Check restaurants in Delhi specifically
    const delhiRestaurants = await prisma.restaurant.findMany({
      where: {
        city: { contains: 'Delhi', mode: 'insensitive' }
      }
    });
    console.log(`\nRestaurants in Delhi: ${delhiRestaurants.length}`);
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();