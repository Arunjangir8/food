import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { orderAPI, restaurantAPI } from '../../services/api.js';
import {
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const RestaurantOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const orderStatuses = {
    ALL: { label: 'All Orders', color: 'gray' },
    PENDING: { label: 'Pending', color: 'yellow' },
    CONFIRMED: { label: 'Confirmed', color: 'blue' },
    PREPARING: { label: 'Preparing', color: 'orange' },
    READY_FOR_PICKUP: { label: 'Ready', color: 'purple' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'indigo' },
    DELIVERED: { label: 'Delivered', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' }
  };

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        // Get my restaurant
        const restaurantRes = await restaurantAPI.getMyRestaurant();
        const userRestaurant = restaurantRes.data.data.restaurant;
        
        setRestaurant(userRestaurant);

        // Get restaurant orders
        const ordersRes = await orderAPI.getRestaurantOrders();
        const restaurantOrders = ordersRes.data.data.orders || [];
        
        setOrders(restaurantOrders);
      } catch (error) {
        console.error('Error fetching orders data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrdersData();
    }
  }, [user]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${orderStatuses[newStatus].label}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-orange-100 text-orange-800',
      READY_FOR_PICKUP: 'bg-purple-100 text-purple-800',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY_FOR_PICKUP',
      READY_FOR_PICKUP: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERED'
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pt-24 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">
            Manage orders for {restaurant?.name || 'your restaurant'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(orderStatuses).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {config.label}
                {status !== 'ALL' && (
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {orders.filter(order => order.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {filterStatus === 'ALL' ? 'No orders found' : `No ${orderStatuses[filterStatus].label.toLowerCase()} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{order.total}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {orderStatuses[order.status].label}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.menuItem?.name} x {item.quantity}</span>
                        <span>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <HiOutlineLocationMarker className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{order.address?.type}</p>
                      <p className="text-gray-600 text-sm">
                        {order.address?.address}, {order.address?.city} - {order.address?.pincode}
                      </p>
                    </div>
                  </div>
                  {order.deliveryInstructions && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Instructions:</strong> {order.deliveryInstructions}
                    </div>
                  )}
                </div>

                {/* Order Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <HiOutlineClock className="w-4 h-4" />
                    <span>Est. {order.estimatedTime}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                        >
                          <HiExclamationCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                        >
                          <HiCheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                      </>
                    )}
                    
                    {getNextStatus(order.status) && order.status !== 'PENDING' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Mark as {orderStatuses[getNextStatus(order.status)].label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;