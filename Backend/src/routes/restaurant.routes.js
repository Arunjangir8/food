const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant
} = require('../controllers/restaurant.controller');

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes
router.put('/:id', 
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 500 }),
    body('deliveryFee').optional().isFloat({ min: 0 }),
    body('minOrder').optional().isFloat({ min: 0 })
  ],
  updateRestaurant
);

module.exports = router;