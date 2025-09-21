const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/bcrypt');

const prisma = new PrismaClient();

const restaurantData = [
  {
    "name": "Spice Junction",
    "city": "Delhi",
    "cuisine": "North Indian",
    "description": "Authentic Delhi-style curries, kebabs, and tandoori delights served in a cozy family atmosphere."
  },
  {
    "name": "The Curry Leaf",
    "city": "Delhi",
    "cuisine": "South Indian",
    "description": "Serving dosas, idlis, and flavorful sambars with a modern twist."
  },
  {
    "name": "Royal Biryani House",
    "city": "Delhi",
    "cuisine": "Mughlai",
    "description": "Rich biryanis and kebabs inspired by Old Delhi's royal kitchens."
  },
  {
    "name": "Urban Café",
    "city": "Delhi",
    "cuisine": "Cafe / Continental",
    "description": "Trendy spot offering sandwiches, pastas, and fresh-brewed coffee."
  },
  {
    "name": "Veggie Delight",
    "city": "Delhi",
    "cuisine": "Vegetarian",
    "description": "Pure veg restaurant specializing in thalis and seasonal Indian curries."
  },
  {
    "name": "Garden Greens",
    "city": "Bangalore",
    "cuisine": "Healthy / Organic",
    "description": "Farm-to-table concept with salads, smoothies, and organic bowls."
  },
  {
    "name": "Masala Street",
    "city": "Bangalore",
    "cuisine": "Street Food",
    "description": "Street-style chaats, pav bhaji, and golgappas in a modern setup."
  },
  {
    "name": "Coastal Waves",
    "city": "Bangalore",
    "cuisine": "Seafood",
    "description": "Fresh coastal delicacies inspired by Mangalorean and Goan flavors."
  },
  {
    "name": "Brew & Bite",
    "city": "Bangalore",
    "cuisine": "Cafe",
    "description": "Coffee house with artisanal brews, burgers, and desserts."
  },
  {
    "name": "Royal Tandoor",
    "city": "Bangalore",
    "cuisine": "North Indian",
    "description": "Signature kebabs and curries served in a regal ambience."
  },
  {
    "name": "Bombay Bistro",
    "city": "Mumbai",
    "cuisine": "Fusion",
    "description": "Fusion of Mumbai street food classics with global flavors."
  },
  {
    "name": "The Seafood Shack",
    "city": "Mumbai",
    "cuisine": "Seafood",
    "description": "Catch of the day, curries, and grills with a coastal Mumbai vibe."
  },
  {
    "name": "Bollywood Dhaba",
    "city": "Mumbai",
    "cuisine": "Punjabi",
    "description": "Dhaba-style butter chicken, lassi, and stuffed parathas."
  },
  {
    "name": "Cafe Marine",
    "city": "Mumbai",
    "cuisine": "Cafe",
    "description": "Seaside-inspired cafe with coffees, sandwiches, and quick bites."
  },
  {
    "name": "Veg Sutra",
    "city": "Mumbai",
    "cuisine": "Vegetarian",
    "description": "Vegetarian fine dining with Indian and continental dishes."
  },
  {
    "name": "Southern Spice",
    "city": "Chennai",
    "cuisine": "South Indian",
    "description": "Authentic Chettinad curries, dosas, and traditional meals."
  },
  {
    "name": "Bay View Grill",
    "city": "Chennai",
    "cuisine": "Seafood",
    "description": "Fresh seafood grills overlooking the Marina beachside."
  },
  {
    "name": "The Madras Café",
    "city": "Chennai",
    "cuisine": "Cafe",
    "description": "Classic Chennai filter coffee and snacks in a retro-themed cafe."
  },
  {
    "name": "Spice Route",
    "city": "Chennai",
    "cuisine": "Multi-cuisine",
    "description": "A mix of Indian, Chinese, and Continental dishes under one roof."
  },
  {
    "name": "Veg Paradise",
    "city": "Chennai",
    "cuisine": "Vegetarian",
    "description": "Popular for wholesome South Indian vegetarian meals and snacks."
  },
  {
    "name": "Bengal Bites",
    "city": "Kolkata",
    "cuisine": "Bengali",
    "description": "Traditional Bengali thalis, fish curries, and sweets like rasgulla."
  },
  {
    "name": "Park Street Café",
    "city": "Kolkata",
    "cuisine": "Cafe",
    "description": "Modern cafe with continental menu and live music evenings."
  },
  {
    "name": "Tangra Spice",
    "city": "Kolkata",
    "cuisine": "Chinese",
    "description": "Authentic Indo-Chinese dishes inspired by Tangra Chinatown."
  },
  {
    "name": "Kathi Roll Junction",
    "city": "Kolkata",
    "cuisine": "Street Food",
    "description": "Home of Kolkata's famous kathi rolls and quick bites."
  },
  {
    "name": "Royal Mishti House",
    "city": "Kolkata",
    "cuisine": "Sweets & Desserts",
    "description": "Serving traditional Bengali sweets and fusion desserts."
  }
];

async function main() {
  console.log('🌱 Starting restaurant seeding...');

  // Clear existing data
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany({ where: { role: 'RESTAURANT_OWNER' } });

  const hashedPassword = await hashPassword('arun9988');

  for (let i = 0; i < restaurantData.length; i++) {
    const restaurant = restaurantData[i];
    const email = `arun${i + 1}@gmail.com`;
    
    // Create restaurant owner
    const owner = await prisma.user.create({
      data: {
        email: email,
        name: `Owner ${i + 1}`,
        phone: `987654${String(i + 1).padStart(4, '0')}`,
        password: hashedPassword,
        role: 'RESTAURANT_OWNER'
      }
    });

    // Create restaurant
    const createdRestaurant = await prisma.restaurant.create({
      data: {
        name: restaurant.name,
        description: restaurant.description,
        cuisine: [restaurant.cuisine],
        address: `${restaurant.name} Street, Area ${i + 1}`,
        city: restaurant.city,
        pincode: `11000${i + 1}`,
        openTime: '10:00',
        closeTime: '23:00',
        deliveryFee: 30.0,
        minOrder: 200.0,
        deliveryTime: '25-35 mins',
        rating: 4.0 + Math.random(),
        totalRating: Math.floor(Math.random() * 500) + 100,
        ratingCount: Math.floor(Math.random() * 100) + 20,
        ownerId: owner.id
      }
    });

    // Create menu categories
    const categories = await Promise.all([
      prisma.menuCategory.create({
        data: {
          restaurantId: createdRestaurant.id,
          name: 'Main Course',
          description: 'Signature dishes',
          sortOrder: 1
        }
      }),
      prisma.menuCategory.create({
        data: {
          restaurantId: createdRestaurant.id,
          name: 'Appetizers',
          description: 'Start your meal',
          sortOrder: 2
        }
      }),
      prisma.menuCategory.create({
        data: {
          restaurantId: createdRestaurant.id,
          name: 'Beverages',
          description: 'Drinks and refreshments',
          sortOrder: 3
        }
      })
    ]);

    // Create menu items
    const menuItems = [
      { name: 'Special Curry', price: 250, category: 0, isVeg: true },
      { name: 'Grilled Chicken', price: 320, category: 0, isVeg: false },
      { name: 'Biryani Special', price: 280, category: 0, isVeg: false },
      { name: 'Paneer Tikka', price: 220, category: 1, isVeg: true },
      { name: 'Crispy Starter', price: 180, category: 1, isVeg: true },
      { name: 'Fresh Juice', price: 80, category: 2, isVeg: true },
      { name: 'Lassi', price: 60, category: 2, isVeg: true },
      { name: 'Chef Special', price: 350, category: 0, isVeg: false }
    ];

    await Promise.all(menuItems.map(item => 
      prisma.menuItem.create({
        data: {
          categoryId: categories[item.category].id,
          name: item.name,
          description: `Delicious ${item.name.toLowerCase()}`,
          price: item.price,
          isVeg: item.isVeg,
          isPopular: Math.random() > 0.7
        }
      })
    ));

    console.log(`✅ Created restaurant: ${restaurant.name} (${email})`);
  }

  console.log('✅ All restaurants seeded successfully!');
  console.log('🔑 All restaurant owners have password: arun9988');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });