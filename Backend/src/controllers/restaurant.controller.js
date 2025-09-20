const prisma = require('../utils/prisma');
const { validationResult } = require('express-validator');

const getAllRestaurants = async (req, res) => {
  try {
    const { city, cuisine, search, isActive } = req.query;
    
    const where = {
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(cuisine && cuisine !== 'All' && { cuisine: { has: cuisine } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    console.log('Restaurant query where clause:', JSON.stringify(where, null, 2));

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        owner: {
          select: { name: true, email: true }
        }
      },
      orderBy: { rating: 'desc' }
    });

    console.log(`Found ${restaurants.length} restaurants`);

    res.json({
      success: true,
      data: { restaurants }
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        menuItems: {
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { name: 'asc' }
            }
          },
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if restaurant belongs to user
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: { restaurant: updatedRestaurant }
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant
};