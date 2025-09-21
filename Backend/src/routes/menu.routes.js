const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadMenuItemImage } = require('../config/cloudinary');
const prisma = require('../utils/prisma');
const {
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem
} = require('../controllers/menu.controller');

const router = express.Router();


router.get('/restaurant/:restaurantId', getMenuByRestaurant);


router.post('/items',
  authenticate,
  authorize('RESTAURANT_OWNER'),
  (req, res, next) => {
    uploadMenuItemImage.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      next();
    });
  },
  [
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('isVeg').optional().isBoolean()
  ],
  createMenuItem
);

router.put('/items/:id',
  authenticate,
  authorize('RESTAURANT_OWNER'),
  (req, res, next) => {
    uploadMenuItemImage.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      next();
    });
  },
  updateMenuItem
);

router.delete('/items/:id',
  authenticate,
  authorize('RESTAURANT_OWNER'),
  async (req, res) => {
    try {
      const { id } = req.params;


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

      await prisma.menuItem.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;