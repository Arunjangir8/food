const prisma = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { validationResult } = require('express-validator');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        addresses: true
      }
    });


    const [cartCount, favoritesCount] = await Promise.all([
      prisma.cartItem.count({ where: { userId: req.user.id } }),
      prisma.favorite.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      success: true,
      data: { 
        user: {
          ...user,
          cartCount,
          favoritesCount
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone } = req.body;
    const avatar = req.file ? req.file.path : undefined;

    const updateData = { name, phone };
    if (avatar) {
      updateData.avatar = avatar;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const { type, address, city, pincode, latitude, longitude, isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        type,
        address,
        city,
        pincode,
        latitude,
        longitude,
        isDefault
      }
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: newAddress }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, address, city, pincode, latitude, longitude, isDefault } = req.body;


    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { type, address, city, pincode, latitude, longitude, isDefault }
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address: updatedAddress }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await prisma.address.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        menuItem: {
          include: {
            category: {
              include: {
                restaurant: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: { cartItems }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity = 1, customizations = {} } = req.body;

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        menuItemId,
        quantity,
        customizations
      },
      include: {
        menuItem: {
          include: {
            category: {
              include: {
                restaurant: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: { cartItem }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        menuItem: {
          include: {
            category: {
              include: {
                restaurant: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      data: { cartItem: updatedCartItem }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        restaurant: true,
        menuItem: {
          include: {
            category: {
              include: {
                restaurant: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: { favorites }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { restaurantId, menuItemId, type } = req.body;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        restaurantId,
        menuItemId,
        type
      },
      include: {
        restaurant: true,
        menuItem: {
          include: {
            category: {
              include: {
                restaurant: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: { favorite }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { id }
    });

    if (!favorite || favorite.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await prisma.favorite.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getFavorites,
  addToFavorites,
  removeFromFavorites
};