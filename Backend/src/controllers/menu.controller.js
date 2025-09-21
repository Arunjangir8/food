const prisma = require('../utils/prisma');
const { validationResult } = require('express-validator');

const getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const menuCategories = await prisma.menuCategory.findMany({
      where: { 
        restaurantId,
        isActive: true 
      },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { isPopular: 'desc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: { menuCategories }
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { categoryId, name, description, price, isVeg = true, customizations } = req.body;

    // Verify category belongs to user's restaurant
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: { restaurant: true }
    });

    if (!category || category.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const menuItemData = {
      categoryId,
      name,
      description,
      price: parseFloat(price),
      isVeg: typeof isVeg === 'string' ? isVeg === 'true' : isVeg,
      customizations: typeof customizations === 'string' ? JSON.parse(customizations || '{}') : (customizations || {})
    };

    // Add image URL if uploaded
    if (req.file) {
      menuItemData.image = req.file.path;
    }

    const menuItem = await prisma.menuItem.create({
      data: menuItemData
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { menuItem }
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verify item belongs to user's restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: {
          include: { restaurant: true }
        }
      }
    });

    if (!menuItem || menuItem.category.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Convert data types from FormData strings
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.isVeg) updateData.isVeg = updateData.isVeg === 'true';
    if (updateData.isAvailable) updateData.isAvailable = updateData.isAvailable === 'true';
    if (updateData.customizations) {
      try {
        updateData.customizations = JSON.parse(updateData.customizations);
      } catch (e) {
        updateData.customizations = {};
      }
    }

    // Add new image URL if uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem: updatedItem }
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem
};