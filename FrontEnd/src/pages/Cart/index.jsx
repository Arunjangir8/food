import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, userAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { localStorageUtils } from '../../utils/localStorage.js';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiPlus,
  HiMinus,
  HiOutlineX,
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineHeart,
  HiOutlineCreditCard
} from 'react-icons/hi';



const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState({
    fee: 25,
    estimatedTime: '25-35 mins'
  });

  const [userAddress, setUserAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  console.log(user)

  // Load user's default address
  useEffect(() => {
    const loadUserAddress = async () => {
      if (user) {
        try {
          const response = await userAPI.getProfile();
          const userProfile = response.data.data.user;
          const defaultAddress = userProfile?.addresses?.find(addr => addr.isDefault) || userProfile?.addresses?.[0];

          if (defaultAddress) {
            setUserAddress(defaultAddress);
          } else {
            // Fallback address if no address found
            setUserAddress({
              id: 'default',
              type: 'Home',
              address: '123 Main Street, Apartment 4B',
              city: 'Delhi',
              pincode: '110001',
              isDefault: true
            });
          }
        } catch (error) {
          console.error('Error loading user address:', error);
          // Fallback address on error
          setUserAddress({
            id: 'default',
            type: 'Home',
            address: '123 Main Street, Apartment 4B',
            city: 'Delhi',
            pincode: '110001',
            isDefault: true
          });
        }
      }
    };

    loadUserAddress();
  }, [user]);

  // Mock promo codes
  const promoCodes = {
    'SAVE10': { discount: 10, type: 'percentage', minOrder: 200 },
    'FLAT50': { discount: 50, type: 'fixed', minOrder: 300 },
    'FIRST20': { discount: 20, type: 'percentage', minOrder: 150 }
  };

  // Load cart from localStorage and sync with DB for accurate pricing
  useEffect(() => {
    const loadAndSyncCart = async () => {
      setIsLoading(true);
      try {
        // Get cart from localStorage first
        const localCart = localStorageUtils.getCart();
        setCart(localCart);

        // Sync with DB for accurate pricing and availability
        if (user && localCart.length > 0) {
          const response = await userAPI.getCart();
          const dbCart = response.data.data.cartItems;

          if (dbCart.length > 0) {
            // Get restaurant info for delivery details
            const restaurant = dbCart[0].menuItem.category.restaurant;
            setDeliveryInfo({
              fee: restaurant.deliveryFee,
              estimatedTime: restaurant.deliveryTime
            });

            // Convert API format to local format
            const syncedCart = dbCart.map(item => ({
              id: item.id,
              itemId: item.menuItemId,
              restaurantId: item.menuItem.category.restaurantId,
              restaurantName: item.menuItem.category.restaurant.name,
              name: item.menuItem.name,
              price: item.menuItem.price,
              customizations: item.customizations || {},
              customizationPrice: 0,
              totalPrice: item.menuItem.price,
              image: item.menuItem.image || '🍕',
              quantity: item.quantity
            }));

            setCart(syncedCart);
            localStorageUtils.saveCart(syncedCart);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage data
        setCart(localStorageUtils.getCart());
      } finally {
        setIsLoading(false);
      }
    };

    loadAndSyncCart();
  }, [user]);

  const updateQuantity = (cartItemId, change) => {
    const currentItem = cart.find(item => item.id === cartItemId);
    const newQuantity = Math.max(1, currentItem.quantity + change);

    const updatedCart = localStorageUtils.updateCartItem(cartItemId, { quantity: newQuantity });
    setCart(updatedCart);
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const updatedCart = await localStorageUtils.removeFromCart(cartItemId, !!user);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearAllItems = async () => {
    await localStorageUtils.clearCart(!!user);
    setCart([]);
    setShowClearConfirm(false);
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase();
    if (promoCodes[code]) {
      const promo = promoCodes[code];
      const subtotal = cartTotal;

      if (subtotal >= promo.minOrder) {
        const discountAmount = promo.type === 'percentage'
          ? (subtotal * promo.discount) / 100
          : promo.discount;
        setDiscount(Math.min(discountAmount, subtotal));
        toast.success(`Promo code applied! You saved ₹${Math.min(discountAmount, subtotal)}`);
      } else {
        toast.error(`Minimum order of ₹${promo.minOrder} required for this promo code`);
      }
    } else {
      toast.error('Invalid promo code');
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const taxAmount = Math.round(cartTotal * 0.08); // 8% tax
  const finalTotal = cartTotal + deliveryInfo.fee + taxAmount - discount;

  const groupedCart = cart.reduce((acc, item) => {
    const restaurantId = item.restaurantId || 'unknown';
    if (!acc[restaurantId]) {
      acc[restaurantId] = {
        restaurantName: item.restaurantName || 'Unknown Restaurant',
        items: []
      };
    }
    acc[restaurantId].items.push(item);
    return acc;
  }, {});

  const handlePayment = async () => {
    try {
      setIsPlacingOrder(true);

      // Check if user is logged in
      if (!user) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Check if user has addresses and a default address
      if (!user.addresses || user.addresses.length === 0 || !user.addresses.some(addr => addr.isDefault)) {
        setShowAddressModal(true);
        setIsPlacingOrder(false);
        return;
      }

      // Get the default address from user.addresses array
      const defaultAddress = user.addresses.find(addr => addr.isDefault);

      // Rest of the function remains the same...
      // Group cart items by restaurant
      const restaurantGroups = cart.reduce((groups, item) => {
        const restaurantId = item.restaurantId;
        if (!groups[restaurantId]) {
          groups[restaurantId] = [];
        }
        groups[restaurantId].push({
          menuItemId: item.itemId,
          quantity: item.quantity,
          customizations: item.customizations
        });
        return groups;
      }, {});

      // Create orders for each restaurant
      const orderPromises = Object.entries(restaurantGroups).map(([restaurantId, items]) => {
        return orderAPI.create({
          restaurantId,
          addressId: defaultAddress.id,
          items,
          paymentMethod: 'Online Payment',
          deliveryInstructions: ''
        });
      });

      await Promise.all(orderPromises);

      toast.success('Order placed successfully!');
      await clearAllItems();
      navigate('/my-orders/current');
    } catch (error) {
      console.error('Order creation failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const ClearConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <HiOutlineTrash className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart?</h3>
          <p className="text-gray-600">Are you sure you want to remove all items from your cart?</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={clearAllItems}
            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[100vw] pt-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
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
                  <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <span>Your Cart</span>
                  </h1>
                  {cart.length > 0 && (
                    <p className="text-sm text-gray-600">{cartItemsCount} items</p>
                  )}
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  <span className="text-sm font-medium">Clear Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart */
          <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet. Explore our restaurants and find something delicious!</p>

              <button
                onClick={() => navigate('/restaurants')}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg"
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 py-6">
            {/* Left Side - Cart Items */}
            <div className="flex-1">
              {/* Delivery Address */}
              {userAddress && (
                <div className="bg-white rounded-md shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <HiOutlineLocationMarker className="w-5 h-5 text-red-500" />
                    <span>Delivery Address</span>
                  </h3>
                  <div className="mb-3">
                    <p className="font-medium text-gray-900">{userAddress.type}</p>
                    <p className="text-gray-600">{userAddress.address}</p>
                    <p className="text-gray-600">{userAddress.city} - {userAddress.pincode}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <HiOutlineClock className="w-4 h-4" />
                      <span>{deliveryInfo.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiOutlineTruck className="w-4 h-4" />
                      <span>₹{deliveryInfo.fee} delivery fee</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items grouped by restaurant */}
              {Object.entries(groupedCart).map(([restaurantId, restaurant]) => (
                <div key={restaurantId} className="bg-white rounded-md shadow-lg mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{restaurant.restaurantName}</h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {restaurant.items.map(cartItem => (
                        <div key={cartItem.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-md">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-md flex items-center justify-center text-2xl overflow-hidden">
                            {cartItem.image && cartItem.image.startsWith('http') ? (
                              <img
                                src={cartItem.image}
                                alt={cartItem.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center text-2xl" style={{ display: cartItem.image && cartItem.image.startsWith('http') ? 'none' : 'flex' }}>
                              {cartItem.image && !cartItem.image.startsWith('http') ? cartItem.image : '🍕'}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{cartItem.name}</h4>

                            {/* Customizations Display */}
                            {Object.entries(cartItem.customizations).length > 0 && (
                              <div className="mb-2">
                                {Object.entries(cartItem.customizations).map(([customizationName, options]) => (
                                  <div key={customizationName} className="text-xs text-gray-600">
                                    <span className="font-medium">{customizationName}: </span>
                                    {Array.isArray(options)
                                      ? options.map(opt => opt.name).join(', ')
                                      : options.name
                                    }
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => updateQuantity(cartItem.id, -1)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                  <HiMinus className="w-4 h-4" />
                                </button>
                                <span className="font-medium text-lg min-w-[2rem] text-center">{cartItem.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(cartItem.id, 1)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                  <HiPlus className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 text-lg">
                                    ₹{cartItem.totalPrice * cartItem.quantity}
                                  </p>
                                  {cartItem.customizationPrice > 0 && (
                                    <p className="text-xs text-gray-500">
                                      Base: ₹{cartItem.price} + Extras: ₹{cartItem.customizationPrice}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeFromCart(cartItem.id)}
                                  className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-colors duration-200"
                                >
                                  <HiOutlineX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add More Items */}
              <div className="bg-white rounded-md shadow-lg p-6">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-red-300 hover:text-red-500 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Add more items</span>
                </button>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-md shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Order Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItemsCount} items)</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryInfo.fee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Fees (8%)</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-bold text-xl text-gray-900">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handlePayment}
                  disabled={isPlacingOrder}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineCreditCard className="w-5 h-5" />
                      <span>Proceed to Payment</span>
                    </>
                  )}
                </button>

                {/* Payment Methods */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">We accept</p>
                  <div className="flex items-center justify-center space-x-2 text-2xl">
                    💳 🏧 📱 💰
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add Delivery Address</h3>
              <p className="text-gray-600 mb-6">
                Please add a delivery address to continue with your order.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    navigate('/profile');
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-colors duration-200"
                >
                  Add Address
                </button>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-md font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && <ClearConfirmModal />}
    </div>
  );
};

export default CartPage;