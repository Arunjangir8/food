import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Cart utility functions (same as before)
const cartUtils = {
  getCart: () => {
    try {
      const cart = localStorage.getItem('foodCart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart from localStorage:', error);
      return [];
    }
  },

  saveCart: (cart) => {
    try {
      localStorage.setItem('foodCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  updateQuantity: (cartItemId, change) => {
    const cart = cartUtils.getCart();
    const updatedCart = cart.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    );
    cartUtils.saveCart(updatedCart);
    return updatedCart;
  },

  removeFromCart: (cartItemId) => {
    const cart = cartUtils.getCart();
    const updatedCart = cart.filter(item => item.id !== cartItemId);
    cartUtils.saveCart(updatedCart);
    return updatedCart;
  },

  clearCart: () => {
    cartUtils.saveCart([]);
    return [];
  },

  getCartTotal: () => {
    const cart = cartUtils.getCart();
    return cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  },

  getCartItemsCount: () => {
    const cart = cartUtils.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  groupCartByRestaurant: () => {
    const cart = cartUtils.getCart();
    const grouped = cart.reduce((acc, item) => {
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
    return grouped;
  }
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Mock delivery info
  const deliveryInfo = {
    fee: 25,
    estimatedTime: '25-35 mins',
    address: '123 Main Street, Apartment 4B, Delhi - 110001'
  };

  // Mock promo codes
  const promoCodes = {
    'SAVE10': { discount: 10, type: 'percentage', minOrder: 200 },
    'FLAT50': { discount: 50, type: 'fixed', minOrder: 300 },
    'FIRST20': { discount: 20, type: 'percentage', minOrder: 150 }
  };

  // Load cart from localStorage on component mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCart = cartUtils.getCart();
      setCart(savedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = (cartItemId, change) => {
    const updatedCart = cartUtils.updateQuantity(cartItemId, change);
    setCart(updatedCart);
  };

  const removeFromCart = (cartItemId) => {
    const updatedCart = cartUtils.removeFromCart(cartItemId);
    setCart(updatedCart);
  };

  const clearAllItems = () => {
    const updatedCart = cartUtils.clearCart();
    setCart(updatedCart);
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
        alert(`Promo code applied! You saved ₹${Math.min(discountAmount, subtotal)}`);
      } else {
        alert(`Minimum order of ₹${promo.minOrder} required for this promo code`);
      }
    } else {
      alert('Invalid promo code');
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const finalTotal = cartTotal + deliveryInfo.fee - discount;
  const groupedCart = cartUtils.groupCartByRestaurant();

  const handlePayment = (amount) => {
    alert(`Proceeding to payment of ₹${amount}`);
    clearAllItems();
    navigate('/my-orders')
  }

  const ClearConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <HiOutlineTrash className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart?</h3>
          <p className="text-gray-600">Are you sure you want to remove all items from your cart?</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={clearAllItems}
            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
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
    <div className="min-h-screen w-[100vw] pt-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
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
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <HiOutlineShoppingCart className="w-6 h-6" />
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
                  className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg"
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
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <HiOutlineLocationMarker className="w-5 h-5 text-red-500" />
                  <span>Delivery Address</span>
                </h3>
                <p className="text-gray-600 mb-2">{deliveryInfo.address}</p>
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

              {/* Cart Items grouped by restaurant */}
              {Object.entries(groupedCart).map(([restaurantId, restaurant]) => (
                <div key={restaurantId} className="bg-white rounded-2xl shadow-lg mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{restaurant.restaurantName}</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {restaurant.items.map(cartItem => (
                        <div key={cartItem.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-xl flex items-center justify-center text-2xl">
                            {cartItem.image}
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-red-300 hover:text-red-500 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Add more items</span>
                </button>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
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
                    <span>Taxes & Fees</span>
                    <span>₹{Math.round(cartTotal * 0.05)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-bold text-xl text-gray-900">
                    <span>Total</span>
                    <span>₹{finalTotal + Math.round(cartTotal * 0.05)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    handlePayment(finalTotal + Math.round(cartTotal * 0.05));
                  }}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <HiOutlineCreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && <ClearConfirmModal />}
    </div>
  );
};

export default CartPage;