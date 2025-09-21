const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');


  const hashedPassword = await hashPassword('password123');

  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'John Doe',
      phone: '9876543210',
      password: hashedPassword,
      role: 'CUSTOMER'
    }
  });

  const restaurantOwner = await prisma.user.create({
    data: {
      email: 'owner@pizzapalace.com',
      name: 'Mario Rossi',
      phone: '9876543211',
      password: hashedPassword,
      role: 'RESTAURANT_OWNER'
    }
  });


  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Pizza Palace',
      description: 'Authentic wood-fired pizzas with fresh ingredients',
      cuisine: ['Italian', 'Fast Food'],
      address: '123 Food Street, Sector 15',
      city: 'Delhi',
      pincode: '110001',
      openTime: '10:00',
      closeTime: '23:00',
      deliveryFee: 30.0,
      minOrder: 200.0,
      deliveryTime: '25-35 mins',
      rating: 4.8,
      totalRating: 960,
      ratingCount: 200,
      ownerId: restaurantOwner.id
    }
  });


  const pizzaCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Pizza',
      description: 'Wood-fired pizzas with fresh toppings',
      sortOrder: 1
    }
  });

  const appetizersCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Appetizers',
      description: 'Start your meal with these delicious appetizers',
      sortOrder: 2
    }
  });

  const mainsCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Course',
      description: 'Hearty main dishes',
      sortOrder: 3
    }
  });

  const beveragesCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Beverages',
      description: 'Refreshing drinks',
      sortOrder: 4
    }
  });

  const dessertsCategory = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Desserts',
      description: 'Sweet endings',
      sortOrder: 5
    }
  });


  await prisma.menuItem.create({
    data: {
      categoryId: pizzaCategory.id,
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, basil, olive oil',
      price: 350.0,
      isVeg: true,
      isPopular: true,
      customizations: {
        size: {
          name: 'Size',
          type: 'radio',
          required: true,
          options: [
            { name: 'Small (8")', price: 0 },
            { name: 'Medium (10")', price: 100 },
            { name: 'Large (12")', price: 200 }
          ]
        },
        toppings: {
          name: 'Extra Toppings',
          type: 'checkbox',
          required: false,
          options: [
            { name: 'Extra Cheese', price: 50 },
            { name: 'Mushrooms', price: 40 },
            { name: 'Olives', price: 30 }
          ]
        }
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      categoryId: appetizersCategory.id,
      name: 'Garlic Bread',
      description: 'Fresh bread with garlic butter and herbs',
      price: 150.0,
      isVeg: true,
      customizations: {
        extras: {
          name: 'Add-ons',
          type: 'checkbox',
          required: false,
          options: [
            { name: 'Extra Garlic', price: 20 },
            { name: 'Cheese Stuffed', price: 50 }
          ]
        }
      }
    }
  });


  await prisma.address.create({
    data: {
      userId: customer.id,
      type: 'Home',
      address: '456 Customer Street, Apartment 4B',
      city: 'Delhi',
      pincode: '110002',
      isDefault: true
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Customer login: customer@example.com / password123');
  console.log('🏪 Restaurant owner login: owner@pizzapalace.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });