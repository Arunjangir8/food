const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../config/cloudinary');
const {
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
} = require('../controllers/user.controller');

const router = express.Router();


router.use(authenticate);

router.get('/profile', getProfile);

router.put('/profile',
  uploadAvatar.single('avatar'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().isMobilePhone()
  ],
  updateProfile
);

router.put('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  changePassword
);


router.post('/addresses',
  [
    body('type').notEmpty().withMessage('Address type is required'),
    body('address').trim().isLength({ min: 10 }).withMessage('Address is required'),
    body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
    body('pincode').trim().isLength({ min: 5 }).withMessage('Pincode is required')
  ],
  addAddress
);

router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);


router.get('/cart', getCart);
router.post('/cart', [
  body('menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], addToCart);
router.put('/cart/:id', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], updateCartItem);
router.delete('/cart/:id', removeFromCart);
router.delete('/cart', clearCart);


router.get('/favorites', getFavorites);
router.post('/favorites', [
  body('type').isIn(['RESTAURANT', 'MENU_ITEM']).withMessage('Type must be RESTAURANT or MENU_ITEM'),
  body('restaurantId').optional().notEmpty().withMessage('Restaurant ID required for restaurant favorites'),
  body('menuItemId').optional().notEmpty().withMessage('Menu item ID required for menu item favorites')
], addToFavorites);
router.delete('/favorites/:id', removeFromFavorites);

module.exports = router;