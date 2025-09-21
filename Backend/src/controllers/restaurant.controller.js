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
    const updateData = { ...req.body };


    if (updateData.deliveryFee !== undefined) {
      updateData.deliveryFee = parseFloat(updateData.deliveryFee);
    }
    if (updateData.minOrder !== undefined) {
      updateData.minOrder = parseFloat(updateData.minOrder);
    }
    if (updateData.latitude !== undefined && updateData.latitude !== null) {
      updateData.latitude = parseFloat(updateData.latitude);
    }
    if (updateData.longitude !== undefined && updateData.longitude !== null) {
      updateData.longitude = parseFloat(updateData.longitude);
    }


    delete updateData.id;
    delete updateData.ownerId;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.owner;
    delete updateData.rating;
    delete updateData.totalRating;
    delete updateData.ratingCount;


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

const getMyRestaurant = async (req, res) => {
  try {
    let restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: req.user.id },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    });


    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst({
        where: {
          owner: {
            email: req.user.email
          }
        },
        include: {
          owner: {
            select: { name: true, email: true }
          }
        }
      });
      

      if (restaurant) {
        restaurant = await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: { ownerId: req.user.id },
          include: {
            owner: {
              select: { name: true, email: true }
            }
          }
        });
      }
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this account. Please contact support.'
      });
    }

    res.json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    console.error('Get my restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getCuisines = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: { cuisine: true },
      where: { isActive: true }
    });

    const allCuisines = restaurants.flatMap(r => r.cuisine);
    const uniqueCuisines = [...new Set(allCuisines)].sort();

    res.json({
      success: true,
      data: { cuisines: uniqueCuisines }
    });
  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    

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

    const updateData = {};
    

    if (req.files && req.files.image && req.files.image[0]) {
      updateData.image = req.files.image[0].path;
    }
    

    if (req.files && req.files.banner && req.files.banner[0]) {
      updateData.banner = req.files.banner[0].path;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { restaurant: updatedRestaurant }
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  getMyRestaurant,
  getCuisines,
  uploadImages
};