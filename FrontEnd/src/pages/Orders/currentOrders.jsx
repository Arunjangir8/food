import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { orderAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineShoppingCart,
    HiOutlineClock,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineX,
    HiStar,
    HiOutlineStar,
    HiOutlineFilter,
    HiOutlineSearch,
    HiOutlineRefresh,
    HiCheckCircle,
    HiExclamationCircle,
    HiTruck,
    HiOutlineEye,
    HiChevronDown
} from 'react-icons/hi';

const API_BASE_URL = 'http://localhost:3001/api';

// Cart utility functions
const cartUtils = {
    addToCart: (items) => {
        try {
            const existingCart = localStorage.getItem('foodCart');
            const cart = existingCart ? JSON.parse(existingCart) : [];

            items.forEach(item => {
                const cartItem = {
                    id: Date.now() + Math.random(),
                    itemId: item.id || Date.now(),
                    restaurantId: item.restaurantId || 1,
                    restaurantName: item.restaurantName || 'Restaurant',
                    name: item.name,
                    price: item.price,
                    customizationPrice: item.customizationPrice || 0,
                    totalPrice: item.totalPrice || item.price,
                    quantity: item.quantity || 1,
                    customizations: item.customizations || {},
                    image: item.image || '🍕',
                    addedAt: new Date().toISOString()
                };
                cart.push(cartItem);
            });

            localStorage.setItem('foodCart', JSON.stringify(cart));

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('cartUpdated'));

            return cart;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return [];
        }
    }
};

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    // State management
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);

    // Order statuses with styling
    const orderStatuses = {
        ALL: { label: 'All Orders', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
        PENDING: { label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
        CONFIRMED: { label: 'Confirmed', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
        PREPARING: { label: 'Preparing', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
        READY_FOR_PICKUP: { label: 'Ready', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
        OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
        DELIVERED: { label: 'Delivered', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
        CANCELLED: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    };

    // Mock data with proper structure for cart integration
    const mockOrders = [
        {
            id: 'order_1',
            orderNumber: 'ORD-2024-001',
            status: 'DELIVERED',
            placedAt: '2024-09-15T14:30:00Z',
            deliveredAt: '2024-09-15T15:15:00Z',
            total: 850.00,
            subtotal: 750.00,
            deliveryFee: 50.00,
            tax: 50.00,
            discount: 0.00,
            paymentMethod: 'Online Payment',
            paymentStatus: 'SUCCESS',
            estimatedTime: '25-35 mins',
            actualTime: '28 mins',
            restaurant: {
                id: '1',
                name: 'Pizza Palace',
                image: '🍕',
                cuisine: ['Italian', 'Fast Food']
            },
            address: {
                type: 'Home',
                address: '123 Main Street, Apartment 4B',
                city: 'Delhi',
                pincode: '110001'
            },
            items: [
                {
                    id: '1',
                    menuItemId: 'menu_1',
                    quantity: 1,
                    unitPrice: 450.00,
                    customizationPrice: 100.00,
                    menuItem: {
                        name: 'Margherita Pizza',
                        image: '🍕',
                        isVeg: true
                    },
                    customizations: {
                        'Size': {
                            name: 'Medium (10")',
                            price: 100
                        },
                        'Crust': {
                            name: 'Thin Crust',
                            price: 0
                        }
                    }
                },
                {
                    id: '2',
                    menuItemId: 'menu_2',
                    quantity: 2,
                    unitPrice: 150.00,
                    customizationPrice: 0,
                    menuItem: {
                        name: 'Garlic Bread',
                        image: '🥖',
                        isVeg: true
                    },
                    customizations: {}
                }
            ],
            review: {
                rating: 5,
                comment: 'Excellent food and quick delivery!'
            }
        },
        {
            id: 'order_2',
            orderNumber: 'ORD-2024-002',
            status: 'OUT_FOR_DELIVERY',
            placedAt: '2024-09-19T12:00:00Z',
            total: 520.00,
            subtotal: 450.00,
            deliveryFee: 40.00,
            tax: 30.00,
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'PENDING',
            estimatedTime: '30-40 mins',
            restaurant: {
                id: '2',
                name: 'Burger Junction',
                image: '🍔',
                cuisine: ['American', 'Fast Food']
            },
            address: {
                type: 'Office',
                address: '456 Business District, Floor 12',
                city: 'Delhi',
                pincode: '110019'
            },
            items: [
                {
                    id: '3',
                    menuItemId: 'menu_3',
                    quantity: 1,
                    unitPrice: 320.00,
                    customizationPrice: 50.00,
                    menuItem: {
                        name: 'Classic Burger',
                        image: '🍔',
                        isVeg: false
                    },
                    customizations: {
                        'Add-ons': {
                            name: 'Extra Cheese',
                            price: 50
                        }
                    }
                },
                {
                    id: '4',
                    menuItemId: 'menu_4',
                    quantity: 1,
                    unitPrice: 80.00,
                    customizationPrice: 0,
                    menuItem: {
                        name: 'French Fries',
                        image: '🍟',
                        isVeg: true
                    },
                    customizations: {}
                },
                {
                    id: '5',
                    menuItemId: 'menu_5',
                    quantity: 1,
                    unitPrice: 50.00,
                    customizationPrice: 0,
                    menuItem: {
                        name: 'Cola',
                        image: '🥤',
                        isVeg: true
                    },
                    customizations: {}
                }
            ]
        }
    ];

    // Load orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await orderAPI.getUserOrders();
                setOrders(response.data.data.orders);
                setFilteredOrders(response.data.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Fallback to mock data
                setOrders(mockOrders);
                setFilteredOrders(mockOrders);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    // Filter orders based on status, search term, and date
    useEffect(() => {
        let filtered = orders;

        // Filter by status
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(order => order.status === filterStatus);
        }

        // Filter by search term (restaurant name or order number)
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by date
        if (dateFilter !== 'ALL') {
            const now = new Date();
            const filterDate = new Date(now);

            switch (dateFilter) {
                case 'TODAY':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(order => new Date(order.placedAt) >= filterDate);
                    break;
                case 'WEEK':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(order => new Date(order.placedAt) >= filterDate);
                    break;
                case 'MONTH':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(order => new Date(order.placedAt) >= filterDate);
                    break;
            }
        }

        setFilteredOrders(filtered);
    }, [orders, filterStatus, searchTerm, dateFilter]);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handleReorder = async (order) => {
        try {
            // Convert order items to cart format
            const cartItems = order.items.map(item => ({
                id: item.id,
                restaurantId: parseInt(order.restaurant.id),
                restaurantName: order.restaurant.name,
                name: item.menuItem.name,
                price: item.unitPrice,
                customizationPrice: item.customizationPrice || 0,
                totalPrice: item.unitPrice + (item.customizationPrice || 0),
                quantity: item.quantity,
                customizations: item.customizations || {},
                image: item.menuItem.image || '🍕'
            }));

            // Add items to cart using the utility function
            const updatedCart = cartUtils.addToCart(cartItems);

            if (updatedCart.length > 0) {
                toast.success(`${order.items.length} item${order.items.length > 1 ? 's' : ''} added to cart from ${order.restaurant.name}!`);
                navigate('/cart');
            } else {
                throw new Error('Failed to add items to cart');
            }
        } catch (error) {
            console.error('Error reordering:', error);
            const errorMessage = error.response?.data?.message || 'Failed to reorder. Please try again.';
            toast.error(errorMessage);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DELIVERED': return <HiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'OUT_FOR_DELIVERY': return <HiTruck className="w-5 h-5 text-blue-500" />;
            case 'CANCELLED': return <HiExclamationCircle className="w-5 h-5 text-red-500" />;
            default: return <HiOutlineClock className="w-5 h-5 text-orange-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-[100vw] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-[100vw] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
            {/* Header */}
            <div className="bg-white shadow-lg sticky top-0 z-40 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <HiOutlineArrowLeft className="w-6 h-6" />
                            </button>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                                <p className="text-sm text-gray-600">Track and manage your orders</p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200"
                        >
                            <HiOutlineRefresh className="w-5 h-5" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 w-full">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by restaurant name or order number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                        >
                            <HiOutlineFilter className="w-5 h-5" />
                            <span>Filters</span>
                            <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <span className="text-sm text-gray-600">
                            {filteredOrders.length} of {orders.length} orders
                        </span>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            {/* Status Filter */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(orderStatuses).map(([status, config]) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${filterStatus === status
                                                    ? 'bg-red-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Period</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: 'ALL', label: 'All Time' },
                                        { value: 'TODAY', label: 'Today' },
                                        { value: 'WEEK', label: 'Past Week' },
                                        { value: 'MONTH', label: 'Past Month' }
                                    ].map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => setDateFilter(value)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${dateFilter === value
                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center w-full">
                        <HiOutlineShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm || filterStatus !== 'ALL' ? 'No matching orders found' : 'No orders yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || filterStatus !== 'ALL'
                                ? 'Try adjusting your filters or search terms'
                                : 'Start ordering from your favorite restaurants!'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'ALL' && (
                            <button
                                onClick={() => navigate('/restaurants')}
                                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200"
                            >
                                Browse Restaurants
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 w-full">
                        {filteredOrders.map((order) => (
                            <div
  key={order.id}
  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden w-full"
>
  <div className="p-6">
    {/* Order Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{order.restaurant.image}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {order.restaurant.name}
          </h3>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">
          ₹{order.total.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(order.placedAt).toLocaleDateString()}
        </p>
      </div>
    </div>

    {/* Order Status */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        {getStatusIcon(order.status)}
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${orderStatuses[order.status].bgColor} ${orderStatuses[order.status].textColor}`}
        >
          {orderStatuses[order.status].label}
        </span>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <HiOutlineClock className="w-4 h-4" />
        <span>{order.actualTime || order.estimatedTime}</span>
      </div>
    </div>

    {/* Order Items Preview */}
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">
        {order.items.length} item{order.items.length > 1 ? "s" : ""}:
      </p>
      <div className="flex flex-wrap gap-2">
        {order.items.slice(0, 3).map((item, index) => (
          <span
            key={index}
            className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700"
          >
            {item.menuItem.name} x{item.quantity}
          </span>
        ))}
        {order.items.length > 3 && (
          <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-500">
            +{order.items.length - 3} more
          </span>
        )}
      </div>
    </div>

    {/* Order Actions */}
    <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
      <button
        onClick={() => handleOrderClick(order)}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200"
      >
        <HiOutlineEye className="w-4 h-4" />
        <span>View Details</span>
      </button>

      <button
        onClick={() => handleReorder(order)}
        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
      >
        Reorder
      </button>
    </div>
  </div>
</div>

                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                    <p className="text-sm text-gray-600">#{selectedOrder.orderNumber}</p>
                                </div>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <HiOutlineX className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Restaurant Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="text-3xl">{selectedOrder.restaurant.image}</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedOrder.restaurant.name}</h3>
                                    <p className="text-sm text-gray-600">{selectedOrder.restaurant.cuisine.join(', ')}</p>
                                </div>
                            </div>

                            {/* Order Status & Timeline */}
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">Order Status</h4>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${orderStatuses[selectedOrder.status].bgColor} ${orderStatuses[selectedOrder.status].textColor}`}>
                                        {orderStatuses[selectedOrder.status].label}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Placed:</strong> {new Date(selectedOrder.placedAt).toLocaleString()}</p>
                                    {selectedOrder.confirmedAt && (
                                        <p><strong>Confirmed:</strong> {new Date(selectedOrder.confirmedAt).toLocaleString()}</p>
                                    )}
                                    {selectedOrder.deliveredAt && (
                                        <p><strong>Delivered:</strong> {new Date(selectedOrder.deliveredAt).toLocaleString()}</p>
                                    )}
                                    <p><strong>Estimated Time:</strong> {selectedOrder.estimatedTime}</p>
                                    {selectedOrder.actualTime && (
                                        <p><strong>Actual Time:</strong> {selectedOrder.actualTime}</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Items Ordered</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-xl">{item.menuItem.image}</div>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{item.menuItem.name}</h5>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            <p>Customizations:</p>
                                                            {Object.entries(item.customizations).map(([key, value]) => (
                                                                <p key={key} className="ml-2">• {key}: {value.name} (+₹{value.price})</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₹{(item.unitPrice + (item.customizationPrice || 0)).toFixed(2)}</p>
                                                <p className="text-sm text-gray-500">per item</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Fee</span>
                                        <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes</span>
                                        <span>₹{selectedOrder.tax.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-2xl">
                                <HiOutlineLocationMarker className="w-5 h-5 text-red-500 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Delivery Address</h4>
                                    <p className="text-sm text-gray-700">{selectedOrder.address.type}</p>
                                    <p className="text-sm text-gray-600">
                                        {selectedOrder.address.address}, {selectedOrder.address.city} - {selectedOrder.address.pincode}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-2xl">
                                <HiOutlineCreditCard className="w-5 h-5 text-blue-500 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Payment Method</h4>
                                    <p className="text-sm text-gray-600">{selectedOrder.paymentMethod}</p>
                                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${selectedOrder.paymentStatus === 'SUCCESS'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Review */}
                            {selectedOrder.review && (
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <h4 className="font-semibold text-gray-900 mb-3">Your Review</h4>
                                    <div className="flex items-center space-x-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            i < selectedOrder.review.rating ? (
                                                <HiStar key={i} className="w-5 h-5 text-yellow-400" />
                                            ) : (
                                                <HiOutlineStar key={i} className="w-5 h-5 text-gray-300" />
                                            )
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {selectedOrder.review.rating}/5
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{selectedOrder.review.comment}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleReorder(selectedOrder)}
                                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200"
                                >
                                    Reorder
                                </button>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
