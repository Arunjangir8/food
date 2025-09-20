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
  deleteAddress
} = require('../controllers/user.controller');

const router = express.Router();

// All routes require authentication
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

// Address routes
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

module.exports = router;