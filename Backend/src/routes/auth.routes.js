const express = require('express');
const { uploadRestaurantImages } = require('../config/cloudinary');
const {
  register,
  login,
  registerRestaurant,
  loginRestaurant,
  registerValidation,
  loginValidation,
  restaurantRegistrationValidation
} = require('../controllers/auth.controller');

const router = express.Router();

// Regular user registration and login
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Restaurant owner registration with file upload
router.post(
  '/restaurant/register',
  uploadRestaurantImages.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  restaurantRegistrationValidation,
  registerRestaurant
);

// Restaurant owner login
router.post('/restaurant/login', loginValidation, loginRestaurant);

module.exports = router;
