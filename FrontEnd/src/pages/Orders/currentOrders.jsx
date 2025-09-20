import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { orderAPI } from '../../services/api.js';
import { localStorageUtils } from '../../utils/localStorage.js';
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



const OrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

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
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);

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
                setOrders();
                setFilteredOrders();
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
            for (const item of cartItems) {
                await localStorageUtils.addToCart(item, !!user);
            }

            toast.success(`${order.items.length} item${order.items.length > 1 ? 's' : ''} added to cart from ${order.restaurant.name}!`);
            navigate('/cart');
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
        <div className="min-h-screen w-[100vw] pt-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex">
            {/* Left Sidebar */}
            <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <HiOutlineArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-sm text-gray-600">
                                {filteredOrders.length} of {orders.length} orders
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md     focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Status Filter */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Status</h3>
                        <div className="relative">
                            <div 
                                className="w-full flex items-center space-x-2 text-red-500 cursor-pointer transition-colors duration-200 px-4 py-3 rounded-md bg-gray-50 hover:bg-white border border-gray-200"
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            >
                                <div className="flex flex-col flex-1">
                                    <span className="text-xs text-gray-500 font-medium">Status</span>
                                    <span className="text-sm font-semibold flex items-center justify-between">
                                        {orderStatuses[filterStatus].label}
                                        <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                    </span>
                                </div>
                            </div>
                            
                            {showStatusDropdown && (
                                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50 w-full">
                                    {Object.entries(orderStatuses).map(([status, config]) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setFilterStatus(status);
                                                setShowStatusDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-red-50 transition-colors duration-200 ${
                                                filterStatus === status ? 'text-red-500 bg-red-50' : 'text-gray-700'
                                            }`}
                                        >
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Time Period</h3>
                        <div className="relative">
                            <div 
                                className="w-full flex items-center space-x-2 text-red-500 cursor-pointer transition-colors duration-200 px-4 py-3 rounded-md bg-gray-50 hover:bg-white border border-gray-200"
                                onClick={() => setShowDateDropdown(!showDateDropdown)}
                            >
                                <div className="flex flex-col flex-1">
                                    <span className="text-xs text-gray-500 font-medium">Period</span>
                                    <span className="text-sm font-semibold flex items-center justify-between">
                                        {dateFilter === 'ALL' ? 'All Time' : 
                                         dateFilter === 'TODAY' ? 'Today' : 
                                         dateFilter === 'WEEK' ? 'Past Week' : 'Past Month'}
                                        <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDateDropdown ? 'rotate-180' : ''}`} />
                                    </span>
                                </div>
                            </div>
                            
                            {showDateDropdown && (
                                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50 w-full">
                                    {[
                                        { value: 'ALL', label: 'All Time' },
                                        { value: 'TODAY', label: 'Today' },
                                        { value: 'WEEK', label: 'Past Week' },
                                        { value: 'MONTH', label: 'Past Month' }
                                    ].map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => {
                                                setDateFilter(value);
                                                setShowDateDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-red-50 transition-colors duration-200 ${
                                                dateFilter === value ? 'text-red-500 bg-red-50' : 'text-gray-700'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                        >
                            <HiOutlineRefresh className="w-4 h-4" />
                            <span className="font-medium">Refresh Orders</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
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
                    <div className="space-y-4">
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
                                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold transition-colors duration-200"
                                        >
                                            <HiOutlineEye className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>

                                        <button
                                            onClick={() => handleReorder(order)}
                                            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold transition-colors duration-200"
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
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold transition-colors duration-200"
                            >
                                Reorder
                            </button>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold transition-colors duration-200"
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
