const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Restaurant images storage
const restaurantStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurants',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `${file.fieldname}_${timestamp}_${random}`;
    }
  }
});

// Banner images storage
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurants/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 400, crop: 'limit', quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `banner_${timestamp}_${random}`;
    }
  }
});

// Multer upload configuration
const uploadRestaurantImages = multer({
  storage: restaurantStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // max 2 files
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// User avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'users/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      return `avatar_${timestamp}_${random}`;
    }
  }
});

// Avatar upload configuration
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // max 1 file
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadRestaurantImages,
  uploadAvatar,
  deleteImage
};
