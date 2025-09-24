const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { deleteImage } = require('../config/cloudinary');
const { generateOTP, generateResetToken, sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');





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

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        name,
        password: hashedPassword,
        role,
        emailOtp: otp,
        otpExpiresAt: otpExpiry
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent to your email address.',
      data: {
        userId: user.id,
        email: user.email,
        requiresVerification: true
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

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false,
        message: 'Please verify your email address before logging in',
        requiresVerification: true,
        userId: user.id
      });
    }

    // Generate token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    const { password: _, emailOtp, otpExpiresAt, ...userWithoutPassword } = user;

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

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get uploaded file URLs
    const restaurantImage = req.files?.image?.[0]?.path || null;
    const bannerImage = req.files?.banner?.[0]?.path || null;

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (transactionPrisma) => {
      // Create user first
      const newUser = await transactionPrisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: 'RESTAURANT_OWNER',
          emailOtp: otp,
          otpExpiresAt: otpExpiry
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true
        }
      });

      // Create restaurant with owner relation
      const newRestaurant = await transactionPrisma.restaurant.create({
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
          ownerId: newUser.id
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

      // Create default menu categories inside the transaction
      const defaultCategories = [
        { name: 'Appetizers', description: 'Start your meal with these delicious appetizers', sortOrder: 1 },
        { name: 'Main Course', description: 'Hearty main dishes', sortOrder: 2 },
        { name: 'Beverages', description: 'Refreshing drinks', sortOrder: 3 },
        { name: 'Desserts', description: 'Sweet endings', sortOrder: 4 }
      ];

      for (const category of defaultCategories) {
        await transactionPrisma.menuCategory.create({
          data: {
            restaurantId: newRestaurant.id,
            ...category
          }
        });
      }

      return { user: newUser, restaurant: newRestaurant };
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: 'Restaurant registration successful. Please verify your email with the OTP sent to your email address.',
      data: {
        userId: result.user.id,
        email: result.user.email,
        restaurantId: result.restaurant.id,
        requiresVerification: true
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


const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Update user to mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        otpExpiresAt: null
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      restaurantId: user.ownedRestaurants[0]?.id || null
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: updatedUser,
        restaurant: user.ownedRestaurants[0] || null,
        token
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailOtp: otp,
        otpExpiresAt: otpExpiry
      }
    });

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: 'New OTP sent to your email address'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

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

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in',
        requiresVerification: true,
        userId: user.id
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
    const { password: _, ownedRestaurants, emailOtp, otpExpiresAt, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        restaurant,
        restaurants: user.ownedRestaurants,
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

const otpVerificationValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

const resendOtpValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
];

const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt: resetTokenExpiry
      }
    });

    await sendPasswordResetEmail(email, resetToken, user.name);

    res.json({
      success: true,
      message: 'Password reset link sent to your email address'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

module.exports = {
  register,
  login,
  registerRestaurant,
  loginRestaurant,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  registerValidation,
  loginValidation,
  restaurantRegistrationValidation,
  otpVerificationValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
