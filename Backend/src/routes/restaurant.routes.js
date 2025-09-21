const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadRestaurantImages } = require('../config/cloudinary');
const {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  getMyRestaurant,
  getCuisines,
  uploadImages
} = require('../controllers/restaurant.controller');

const router = express.Router();


router.get('/', getAllRestaurants);

router.get('/cuisines/all', getCuisines);

router.get('/my-restaurant',
  authenticate,
  getMyRestaurant
);

router.get('/:id', getRestaurantById);

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


router.post('/:id/upload-images',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  uploadRestaurantImages.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  uploadImages
);

module.exports = router;