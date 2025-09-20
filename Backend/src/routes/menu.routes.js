const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem
} = require('../controllers/menu.controller');

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getMenuByRestaurant);

// Protected routes
router.post('/items',
  authenticate,
  authorize('RESTAURANT_OWNER'),
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
  updateMenuItem
);

module.exports = router;