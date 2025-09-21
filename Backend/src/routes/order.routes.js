const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getRestaurantOrders
} = require('../controllers/order.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/',
  [
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('addressId').notEmpty().withMessage('Address ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required')
  ],
  createOrder
);

router.get('/', getUserOrders);
router.get('/restaurant/orders',
  authorize('RESTAURANT_OWNER'),
  getRestaurantOrders
);
router.get('/:id', getOrderById);

// Restaurant owner only
router.put('/:id/status',
  authorize('RESTAURANT_OWNER'),
  [
    body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
  ],
  updateOrderStatus
);

module.exports = router;