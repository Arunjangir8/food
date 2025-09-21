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


router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);


router.post(
  '/restaurant/register',
  uploadRestaurantImages.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  restaurantRegistrationValidation,
  registerRestaurant
);


router.post('/restaurant/login', loginValidation, loginRestaurant);

module.exports = router;
