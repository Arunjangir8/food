import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCreditCard,
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineClock,
  HiOutlineGift,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineLockClosed,
  HiOutlineStar,
  HiStar,
  HiOutlineQuestionMarkCircle,
  HiOutlineChat,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePhotograph,
  HiTrash,
  HiPlus
} from 'react-icons/hi';

// Profile utilities for localStorage management
const profileUtils = {
  getProfile: () => {
    try {
      const profile = localStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting profile from localStorage:', error);
      return null;
    }
  },

  saveProfile: (profile) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  },

  getOrderHistory: () => {
    try {
      const orders = localStorage.getItem('orderHistory');
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error getting order history from localStorage:', error);
      return [];
    }
  },

  getAddresses: () => {
    try {
      const addresses = localStorage.getItem('userAddresses');
      return addresses ? JSON.parse(addresses) : [
        {
          id: 1,
          type: 'Home',
          address: '123 Main Street, Apartment 4B',
          city: 'Delhi',
          pincode: '110001',
          isDefault: true
        },
        {
          id: 2,
          type: 'Office',
          address: '456 Business District, Floor 12',
          city: 'Delhi',
          pincode: '110019',
          isDefault: false
        }
      ];
    } catch (error) {
      console.error('Error getting addresses from localStorage:', error);
      return [];
    }
  },

  saveAddresses: (addresses) => {
    try {
      localStorage.setItem('userAddresses', JSON.stringify(addresses));
    } catch (error) {
      console.error('Error saving addresses to localStorage:', error);
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : {
        notifications: {
          orderUpdates: true,
          promotions: true,
          newRestaurants: false,
          weeklyDigest: true
        },
        privacy: {
          profileVisibility: 'private',
          locationSharing: true,
          activityTracking: true
        },
        preferences: {
          language: 'en',
          currency: 'INR',
          theme: 'light'
        }
      };
    } catch (error) {
      console.error('Error getting settings from localStorage:', error);
      return {};
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  },

  addToCart: (items) => {
    try {
      const existingCart = localStorage.getItem('foodCart');
      const cart = existingCart ? JSON.parse(existingCart) : [];
      
      items.forEach(item => {
        const cartItem = {
          id: Date.now() + Math.random(),
          itemId: item.id || Date.now(),
          restaurantId: 1, // Default restaurant ID
          restaurantName: item.restaurantName || 'Restaurant',
          name: item.name,
          price: item.price,
          customizationPrice: 0,
          totalPrice: item.price,
          quantity: 1,
          customizations: {},
          image: '🍕', // Default emoji
          addedAt: new Date().toISOString()
        };
        cart.push(cartItem);
      });

      localStorage.setItem('foodCart', JSON.stringify(cart));
      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return [];
    }
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    avatar: null,
    dateJoined: '2024-01-15',
    totalOrders: 42,
    favoriteRestaurants: 8,
    points: 2480
  });

  // Editing state
  const [editProfile, setEditProfile] = useState(profile);
  
  // Addresses state
  const [addresses, setAddresses] = useState([]);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    address: '',
    city: 'Delhi',
    pincode: '',
    isDefault: false
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: true,
      newRestaurants: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'private',
      locationSharing: true,
      activityTracking: true
    },
    preferences: {
      language: 'en',
      currency: 'INR',
      theme: 'light'
    }
  });

  // Order history state
  const [orderHistory] = useState([
    {
      id: 'ORD-001',
      restaurantName: 'Pizza Palace',
      items: [
        { id: 1, name: 'Margherita Pizza', price: 450, quantity: 1 },
        { id: 2, name: 'Garlic Bread', price: 200, quantity: 1 }
      ],
      total: 650,
      date: '2024-09-15',
      status: 'Delivered',
      rating: 5,
      deliveryAddress: '123 Main Street, Apartment 4B, Delhi - 110001',
      paymentMethod: 'Online',
      deliveryTime: '25 mins'
    },
    {
      id: 'ORD-002',
      restaurantName: 'Burger Junction',
      items: [
        { id: 3, name: 'Classic Burger', price: 320, quantity: 1 },
        { id: 4, name: 'Fries', price: 80, quantity: 1 },
        { id: 5, name: 'Cola', price: 20, quantity: 1 }
      ],
      total: 420,
      date: '2024-09-12',
      status: 'Delivered',
      rating: 4,
      deliveryAddress: '456 Business District, Floor 12, Delhi - 110019',
      paymentMethod: 'Cash on Delivery',
      deliveryTime: '30 mins'
    },
    {
      id: 'ORD-003',
      restaurantName: 'Sushi Zen',
      items: [
        { id: 6, name: 'California Roll', price: 650, quantity: 1 },
        { id: 7, name: 'Miso Soup', price: 200, quantity: 1 }
      ],
      total: 850,
      date: '2024-09-10',
      status: 'Delivered',
      rating: 5,
      deliveryAddress: '123 Main Street, Apartment 4B, Delhi - 110001',
      paymentMethod: 'Online',
      deliveryTime: '35 mins'
    }
  ]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load data on component mount
  useEffect(() => {
    const savedProfile = profileUtils.getProfile();
    const savedSettings = profileUtils.getSettings();
    const savedAddresses = profileUtils.getAddresses();
    
    if (savedProfile) {
      setProfile(savedProfile);
      setEditProfile(savedProfile);
    }
    setSettings(savedSettings);
    setAddresses(savedAddresses);
  }, []);

  // Address management functions
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: 'Home',
      address: '',
      city: 'Delhi',
      pincode: '',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (addressId) => {
    const confirmed = window.confirm('Are you sure you want to delete this address?');
    if (confirmed) {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      profileUtils.saveAddresses(updatedAddresses);
      alert('Address deleted successfully!');
    }
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
    profileUtils.saveAddresses(updatedAddresses);
    alert('Default address updated successfully!');
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    
    if (!addressForm.address.trim() || !addressForm.pincode.trim()) {
      alert('Please fill in all required fields!');
      return;
    }

    let updatedAddresses;
    
    if (editingAddress) {
      // Update existing address
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : addr
      );
    } else {
      // Add new address
      const newAddress = {
        ...addressForm,
        id: Date.now()
      };
      updatedAddresses = [...addresses, newAddress];
    }

    // If this address is set as default, remove default from others
    if (addressForm.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === (editingAddress?.id || Date.now())
      }));
    }

    setAddresses(updatedAddresses);
    profileUtils.saveAddresses(updatedAddresses);
    setShowAddressModal(false);
    alert(`Address ${editingAddress ? 'updated' : 'added'} successfully!`);
  };

  // Order management functions
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleReorder = (order) => {
    const confirmed = window.confirm(`Reorder ${order.items.length} items from ${order.restaurantName}?`);
    if (confirmed) {
      const reorderItems = order.items.map(item => ({
        ...item,
        restaurantName: order.restaurantName
      }));
      
      profileUtils.addToCart(reorderItems);
      alert(`${order.items.length} items added to cart!`);
      
      // Optional: Navigate to cart
      // navigate('/cart');
    }
  };

  // Save profile changes
  const handleSaveProfile = () => {
    setProfile(editProfile);
    profileUtils.saveProfile(editProfile);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  // Cancel profile editing
  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  // Handle settings change
  const handleSettingsChange = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
    profileUtils.saveSettings(newSettings);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    // In a real app, you would validate current password and update
    alert('Password changed successfully!');
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newProfile = { ...editProfile, avatar: e.target.result };
        setEditProfile(newProfile);
        if (!isEditing) {
          setProfile(newProfile);
          profileUtils.saveProfile(newProfile);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Logout function
  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      // Clear user data
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userSettings');
      // Redirect to login page
      navigate('/login');
    }
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-red-500 text-white shadow-lg'
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // Address Modal Component
  const AddressModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={() => setShowAddressModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Type</label>
              <select
                value={addressForm.type}
                onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address *</label>
              <textarea
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                placeholder="Enter complete address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <select
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                placeholder="Enter pincode"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="w-4 h-4 text-red-500 focus:ring-red-500 focus:ring-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Order Details Modal Component
  const OrderDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <button
              onClick={() => setShowOrderDetailsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{selectedOrder.restaurantName}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Order #{selectedOrder.id}</p>
                <p className="text-sm text-gray-600">{new Date(selectedOrder.date).toLocaleDateString()}</p>
              </div>

              {/* Order Items */}
              <div>
                <h5 className="font-bold text-gray-900 mb-3">Items Ordered</h5>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.price}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between py-3 border-t-2 border-gray-200 mt-3">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-lg font-bold text-red-500">₹{selectedOrder.total}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                  <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Payment Method</p>
                  <p className="text-sm text-gray-600">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Delivery Time</p>
                  <p className="text-sm text-gray-600">{selectedOrder.deliveryTime}</p>
                </div>
                {selectedOrder.rating && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Your Rating</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(selectedOrder.rating)].map((_, i) => (
                        <HiStar key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowOrderDetailsModal(false);
                    handleReorder(selectedOrder);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200"
                >
                  Reorder
                </button>
                <button
                  onClick={() => setShowOrderDetailsModal(false)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <HiOutlineArrowLeft className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and preferences</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200"
            >
              <HiOutlineLogout className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <HiOutlineUser className="w-16 h-16 text-white" />
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200">
                <HiOutlinePhotograph className="w-5 h-5 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
              <p className="text-gray-600 mb-4">{profile.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500">
                <span>Member since {new Date(profile.dateJoined).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <HiOutlineStar className="w-4 h-4 text-yellow-500" />
                  <span>{profile.points} points</span>
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{profile.totalOrders}</p>
                <p className="text-sm text-red-500">Orders</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-orange-600">{profile.favoriteRestaurants}</p>
                <p className="text-sm text-orange-500">Favorites</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{profile.points}</p>
                <p className="text-sm text-yellow-500">Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton
            id="profile"
            label="Profile"
            icon={<HiOutlineUser className="w-5 h-5" />}
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
          <TabButton
            id="orders"
            label="Orders"
            icon={<HiOutlineShoppingCart className="w-5 h-5" />}
            isActive={activeTab === 'orders'}
            onClick={setActiveTab}
          />
          <TabButton
            id="addresses"
            label="Addresses"
            icon={<HiOutlineLocationMarker className="w-5 h-5" />}
            isActive={activeTab === 'addresses'}
            onClick={setActiveTab}
          />
          <TabButton
            id="settings"
            label="Settings"
            icon={<HiOutlineCog className="w-5 h-5" />}
            isActive={activeTab === 'settings'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200"
                    >
                      <HiOutlineCheck className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200"
                    >
                      <HiOutlineX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                    {new Date(profile.dateJoined).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-gray-900">Security</h4>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
                  >
                    Change Password
                  </button>
                </div>

                {showChangePassword && (
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.current ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.new ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order History</h3>
              
              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <HiOutlineShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h4>
                  <p className="text-gray-500">Start ordering from your favorite restaurants!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map(order => (
                    <div key={order.id} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{order.restaurantName}</h4>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-700 mb-2">{order.items.map(item => item.name).join(', ')}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                            {order.rating && (
                              <div className="flex items-center space-x-1">
                                {[...Array(order.rating)].map((_, i) => (
                                  <HiStar key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleReorder(order)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200"
                          >
                            Reorder
                          </button>
                          <button 
                            onClick={() => handleViewOrderDetails(order)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Saved Addresses</h3>
                <button 
                  onClick={handleAddAddress}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Add New Address</span>
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <HiOutlineLocationMarker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-2">No addresses saved</h4>
                  <p className="text-gray-500">Add your first address for faster checkout!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map(address => (
                    <div key={address.id} className="bg-gray-50 rounded-2xl p-6 relative">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Default
                        </span>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{address.type}</h4>
                        <p className="text-gray-700 mb-1">{address.address}</p>
                        <p className="text-gray-600">{address.city} - {address.pincode}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleEditAddress(address)}
                          className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(address.id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200"
                        >
                          Delete
                        </button>
                        {!address.isDefault && (
                          <button 
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors duration-200"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">Settings</h3>
              
              {/* Notifications */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <HiOutlineBell className="w-6 h-6" />
                  <span>Notifications</span>
                </h4>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleSettingsChange('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <HiOutlineLockClosed className="w-6 h-6" />
                  <span>Privacy</span>
                </h4>
                
                <div className="space-y-4">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      {key === 'profileVisibility' ? (
                        <select
                          value={value}
                          onChange={(e) => handleSettingsChange('privacy', key, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="private">Private</option>
                          <option value="friends">Friends Only</option>
                          <option value="public">Public</option>
                        </select>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingsChange('privacy', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <HiOutlineCog className="w-6 h-6" />
                  <span>Preferences</span>
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Language</span>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => handleSettingsChange('preferences', 'language', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Currency</span>
                    <select
                      value={settings.preferences.currency}
                      onChange={(e) => handleSettingsChange('preferences', 'currency', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Theme</span>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => handleSettingsChange('preferences', 'theme', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Support Links */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Support & Legal</h4>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-xl transition-colors duration-200">
                    <HiOutlineQuestionMarkCircle className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Help Center</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-xl transition-colors duration-200">
                    <HiOutlineChat className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Contact Support</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-xl transition-colors duration-200">
                    <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Terms & Conditions</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-xl transition-colors duration-200">
                    <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Privacy Policy</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddressModal && <AddressModal />}
      {showOrderDetailsModal && <OrderDetailsModal />}
    </div>
  );
};

export default ProfilePage;
