const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { deleteImage } = require('../config/cloudinary');

// Regular user registration
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, phone, name, password, role = 'CUSTOMER' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: phone || undefined }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email or phone' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        name,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

// Regular user login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Generate token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

// Restaurant owner registration
const registerRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        const filesToDelete = Object.values(req.files).flat();
        for (const file of filesToDelete) {
          if (file.public_id) {
            try {
              await deleteImage(file.public_id);
            } catch (deleteError) {
              console.error('Error deleting uploaded file:', deleteError);
            }
          }
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      // User data
      name,
      email,
      phone,
      password,
      
      // Restaurant data
      restaurantName,
      description,
      cuisine,
      address,
      city,
      pincode,
      openTime,
      closeTime,
      deliveryFee,
      minOrder,
      deliveryTime
    } = req.body;

    // Parse cuisine array
    let cuisineArray = cuisine;
    if (typeof cuisine === 'string') {
      try {
        cuisineArray = JSON.parse(cuisine);
      } catch (e) {
        cuisineArray = cuisine.split(',').map(c => c.trim());
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      // Clean up uploaded files
      if (req.files) {
        const filesToDelete = Object.values(req.files).flat();
        for (const file of filesToDelete) {
          if (file.public_id) {
            try {
              await deleteImage(file.public_id);
            } catch (deleteError) {
              console.error('Error deleting uploaded file:', deleteError);
            }
          }
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get uploaded file URLs
    const restaurantImage = req.files?.image?.[0]?.path || null;
    const bannerImage = req.files?.banner?.[0]?.path || null;

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user first
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: 'RESTAURANT_OWNER'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true
        }
      });

      // Create restaurant with owner relation
      const newRestaurant = await prisma.restaurant.create({
        data: {
          name: restaurantName,
          description,
          cuisine: cuisineArray,
          image: restaurantImage,
          banner: bannerImage,
          address,
          city,
          pincode,
          openTime,
          closeTime,
          deliveryFee: parseFloat(deliveryFee) || 0,
          minOrder: parseFloat(minOrder) || 0,
          deliveryTime,
          ownerId: newUser.id  // Link restaurant to user
        },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          banner: true,
          cuisine: true,
          address: true,
          city: true,
          pincode: true,
          openTime: true,
          closeTime: true,
          deliveryFee: true,
          minOrder: true,
          deliveryTime: true,
          isActive: true,
          createdAt: true,
          ownerId: true
        }
      });

      return { user: newUser, restaurant: newRestaurant };
    });

    // Generate token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      restaurantId: result.restaurant.id
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant registered successfully',
      data: {
        user: result.user,
        restaurant: result.restaurant,
        token
      }
    });

  } catch (error) {
    console.error('Restaurant registration error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      const filesToDelete = Object.values(req.files).flat();
      for (const file of filesToDelete) {
        if (file.public_id) {
          try {
            await deleteImage(file.public_id);
          } catch (deleteError) {
            console.error('Error deleting uploaded file:', deleteError);
          }
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Restaurant owner login - UPDATED
const loginRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with their owned restaurants
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedRestaurants: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            banner: true,
            cuisine: true,
            address: true,
            city: true,
            pincode: true,
            openTime: true,
            closeTime: true,
            deliveryFee: true,
            minOrder: true,
            deliveryTime: true,
            isActive: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is a restaurant owner
    if (user.role !== 'RESTAURANT_OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a restaurant owner account.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get the main restaurant (assuming one restaurant per owner for now)
    const restaurant = user.ownedRestaurants[0] || null;

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: restaurant?.id || null
    });

    // Remove password from response
    const { password: _, ownedRestaurants, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        restaurant,
        restaurants: user.ownedRestaurants, // Include all owned restaurants
        token
      }
    });

  } catch (error) {
    console.error('Restaurant login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// ... (keep all other existing functions) ...


// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Restaurant registration validation
const restaurantRegistrationValidation = [
  // User validation
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  // Restaurant validation
  body('restaurantName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
    
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
    
  body('cuisine')
    .custom((value) => {
      let cuisineArray = value;
      if (typeof value === 'string') {
        try {
          cuisineArray = JSON.parse(value);
        } catch (e) {
          cuisineArray = value.split(',').map(c => c.trim());
        }
      }
      if (!Array.isArray(cuisineArray) || cuisineArray.length === 0) {
        throw new Error('At least one cuisine type is required');
      }
      return true;
    }),
    
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
    
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
    
  body('pincode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Pincode must be between 5 and 10 characters'),
    
  body('openTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid opening time (HH:MM)'),
    
  body('closeTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid closing time (HH:MM)'),
    
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
    
  body('minOrder')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number'),
    
  body('deliveryTime')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Delivery time must be between 3 and 50 characters')
];

module.exports = {
  register,
  login,
  registerRestaurant,
  loginRestaurant,
  registerValidation,
  loginValidation,
  restaurantRegistrationValidation
};
