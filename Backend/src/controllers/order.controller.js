const prisma = require('../utils/prisma');
const { validationResult } = require('express-validator');

const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { restaurantId, addressId, items, paymentMethod, deliveryInstructions } = req.body;

    console.log('Order creation request:', { restaurantId, addressId, items, paymentMethod });

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: `Restaurant ${restaurantId} not found`
      });
    }

    // Verify address exists and belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${item.menuItemId} not found`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        customizations: item.customizations || {}
      });
    }

    const deliveryFee = restaurant.deliveryFee;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        restaurantId,
        addressId,
        orderNumber,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod,
        deliveryInstructions,
        estimatedTime: restaurant.deliveryTime,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        address: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status })
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        address: true,
        review: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        address: true,
        review: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is restaurant owner
    if (order.userId !== req.user.id && order.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { restaurant: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only restaurant owner can update order status
    if (order.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { status };

    // Set timestamps based on status
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'PREPARING') updateData.preparedAt = new Date();
    if (status === 'OUT_FOR_DELIVERY') updateData.pickedUpAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus
};