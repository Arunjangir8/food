import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, menuAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import { 
  HiOutlineArrowLeft,
  HiStar,
  HiOutlineClock,
  HiOutlineTruck,
  HiPlus,
  HiMinus,
  HiOutlineX,
  HiOutlineHeart,
  HiHeart,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineShoppingCart,
  HiTrash
} from 'react-icons/hi';

// Cart utility functions
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

  addToCart: (item, customizations = {}) => {
    const cart = cartUtils.getCart();
    const customizationPrice = Object.values(customizations).flat().reduce((total, option) => {
      return total + (option?.price || 0);
    }, 0);

    const cartItem = {
      id: Date.now(),
      itemId: item.id,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      name: item.name,
      price: item.price,
      customizationPrice,
      totalPrice: item.price + customizationPrice,
      quantity: 1,
      customizations,
      image: item.image,
      addedAt: new Date().toISOString()
    };

    const updatedCart = [...cart, cartItem];
    cartUtils.saveCart(updatedCart);
    return updatedCart;
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
  }
};

// Favorites utility functions
const favoritesUtils = {
  getFavorites: () => {
    try {
      const favorites = localStorage.getItem('foodFavorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites from localStorage:', error);
      return [];
    }
  },

  saveFavorites: (favorites) => {
    try {
      localStorage.setItem('foodFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  },

  addToFavorites: (item) => {
    const favorites = favoritesUtils.getFavorites();
    
    // Create favorite item without quantity - just essential details
    const favoriteItem = {
      id: item.id,
      itemId: item.id,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      category: item.category,
      dietaryType: item.dietaryType,
      popular: item.popular,
      customizations: item.customizations,
      addedAt: new Date().toISOString()
    };

    // Check if item already exists in favorites
    const existingIndex = favorites.findIndex(fav => fav.id === item.id);
    
    if (existingIndex === -1) {
      // Add to favorites
      const updatedFavorites = [...favorites, favoriteItem];
      favoritesUtils.saveFavorites(updatedFavorites);
      return { favorites: updatedFavorites, added: true };
    } else {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav.id !== item.id);
      favoritesUtils.saveFavorites(updatedFavorites);
      return { favorites: updatedFavorites, added: false };
    }
  },

  removeFromFavorites: (itemId) => {
    const favorites = favoritesUtils.getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
    favoritesUtils.saveFavorites(updatedFavorites);
    return updatedFavorites;
  },

  clearFavorites: () => {
    favoritesUtils.saveFavorites([]);
    return [];
  },

  isFavorite: (itemId) => {
    const favorites = favoritesUtils.getFavorites();
    return favorites.some(fav => fav.id === itemId);
  },

  getFavoritesCount: () => {
    const favorites = favoritesUtils.getFavorites();
    return favorites.length;
  }
};

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showCustomization, setShowCustomization] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart and favorites from localStorage on component mount
  useEffect(() => {
    const savedCart = cartUtils.getCart();
    const savedFavorites = favoritesUtils.getFavorites();
    setCart(savedCart);
    setFavorites(savedFavorites);
  }, []);

  // Mock restaurant data for fallback
  const mockRestaurant = {
    id: parseInt(id),
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.8,
    deliveryTime: 25,
    deliveryFee: 2.5,
    distance: 1.2,
    image: "🍕",
    isOpen: true,
    description: "Authentic wood-fired pizzas with fresh ingredients",
    address: "123 Food Street, Delhi",
    phone: "+91 98765 43210",
    dietaryType: "Both",
    minOrder: 200
  };

  // Mock menu data for fallback
  const mockMenuItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Fresh tomatoes, mozzarella, basil, olive oil",
      price: 350,
      image: "🍕",
      category: "Pizza",
      dietaryType: "Veg",
      popular: true,
      restaurantId: parseInt(id),
      restaurantName: "Pizza Palace",
      customizations: [
        {
          name: "Size",
          type: "radio",
          required: true,
          options: [
            { name: "Small (8\")", price: 0 },
            { name: "Medium (10\")", price: 100 },
            { name: "Large (12\")", price: 200 }
          ]
        },
        {
          name: "Extra Toppings",
          type: "checkbox",
          required: false,
          options: [
            { name: "Extra Cheese", price: 50 },
            { name: "Mushrooms", price: 40 },
            { name: "Olives", price: 30 },
            { name: "Bell Peppers", price: 35 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Chicken Supreme Pizza",
      description: "Grilled chicken, pepperoni, mushrooms, bell peppers",
      price: 450,
      image: "🍕",
      category: "Pizza",
      dietaryType: "Non-Veg",
      popular: true,
      restaurantId: parseInt(id),
      restaurantName: "Pizza Palace",
      customizations: [
        {
          name: "Size",
          type: "radio",
          required: true,
          options: [
            { name: "Small (8\")", price: 0 },
            { name: "Medium (10\")", price: 100 },
            { name: "Large (12\")", price: 200 }
          ]
        },
        {
          name: "Extra Toppings",
          type: "checkbox",
          required: false,
          options: [
            { name: "Extra Chicken", price: 80 },
            { name: "Extra Cheese", price: 50 },
            { name: "Jalapenos", price: 25 }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Caesar Salad",
      description: "Crisp romaine lettuce, parmesan, croutons, caesar dressing",
      price: 250,
      image: "🥗",
      category: "Salads",
      dietaryType: "Veg",
      popular: false,
      restaurantId: parseInt(id),
      restaurantName: "Pizza Palace",
      customizations: [
        {
          name: "Add Protein",
          type: "radio",
          required: false,
          options: [
            { name: "No Protein", price: 0 },
            { name: "Grilled Chicken", price: 100 },
            { name: "Paneer", price: 80 }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Garlic Bread",
      description: "Fresh bread with garlic butter and herbs",
      price: 150,
      image: "🥖",
      category: "Appetizers",
      dietaryType: "Veg",
      popular: false,
      restaurantId: parseInt(id),
      restaurantName: "Pizza Palace",
      customizations: [
        {
          name: "Extra Add-ons",
          type: "checkbox",
          required: false,
          options: [
            { name: "Extra Garlic", price: 20 },
            { name: "Cheese Stuffed", price: 50 }
          ]
        }
      ]
    },
    {
      id: 5,
      name: "Chocolate Brownie",
      description: "Rich chocolate brownie with vanilla ice cream",
      price: 180,
      image: "🍰",
      category: "Desserts",
      dietaryType: "Veg",
      popular: true,
      restaurantId: parseInt(id),
      restaurantName: "Pizza Palace",
      customizations: []
    }
  ];

  // Load restaurant and menu data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching restaurant data for ID:', id);
        
        const [restaurantRes, menuRes] = await Promise.all([
          restaurantAPI.getById(id),
          menuAPI.getByRestaurant(id)
        ]);
        
        console.log('Restaurant API response:', restaurantRes.data);
        console.log('Menu API response:', menuRes.data);
        
        const restaurantData = restaurantRes.data.data.restaurant;
        setRestaurant({
          ...restaurantData,
          // Add missing properties with defaults
          distance: 2.5,
          avgPrice: 300,
          priceRange: '₹200-400',
          image: restaurantData.image || '🍕',
          phone: '+91 98765 43210'
        });
        
        // Transform menu categories to flat menu items
        const items = [];
        if (menuRes.data.data.menuCategories && menuRes.data.data.menuCategories.length > 0) {
          menuRes.data.data.menuCategories.forEach(category => {
            if (category.items && category.items.length > 0) {
              category.items.forEach(item => {
                items.push({
                  ...item,
                  category: category.name,
                  restaurantId: restaurantData.id,
                  restaurantName: restaurantData.name,
                  image: item.image || '🍕',
                  dietaryType: item.isVeg ? 'Veg' : 'Non-Veg',
                  popular: item.isPopular || false
                });
              });
            }
          });
        }
        
        console.log('Processed menu items:', items);
        setMenuItems(items);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        console.error('Error details:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Failed to load restaurant data';
        toast.error(errorMessage);
        // Fallback to mock data
        setRestaurant({
          ...mockRestaurant,
          id: parseInt(id),
          name: `Restaurant ${id}`
        });
        setMenuItems(mockMenuItems.map(item => ({
          ...item,
          restaurantId: parseInt(id),
          restaurantName: `Restaurant ${id}`
        })));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);
    
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <button onClick={() => navigate('/restaurants')} className="bg-red-500 text-white px-6 py-3 rounded-xl">
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const addToCart = (item, customizations = {}) => {
    const updatedCart = cartUtils.addToCart(item, customizations);
    setCart(updatedCart);
    setShowCustomization(null);
    
    toast.success(`${item.name} added to cart!`);
  };

  const updateQuantity = (cartItemId, change) => {
    const updatedCart = cartUtils.updateQuantity(cartItemId, change);
    setCart(updatedCart);
  };

  const removeFromCart = (cartItemId) => {
    const updatedCart = cartUtils.removeFromCart(cartItemId);
    setCart(updatedCart);
  };

  const toggleFavorite = (item) => {
    const result = favoritesUtils.addToFavorites(item);
    setFavorites(result.favorites);
    
    // Show feedback message
    if (result.added) {
      toast.success(`${item.name} added to favorites!`);
    } else {
      toast.info(`${item.name} removed from favorites!`);
    }
  };

  const isFavorite = (itemId) => {
    return favoritesUtils.isFavorite(itemId);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const favoritesCount = favorites.length;

  const CustomizationModal = ({ item, onClose, onAdd }) => {
    const [selectedCustomizations, setSelectedCustomizations] = useState({});

    const handleCustomizationChange = (customizationName, option, type) => {
      setSelectedCustomizations(prev => {
        const newCustomizations = { ...prev };
        
        if (type === 'radio') {
          newCustomizations[customizationName] = option;
        } else if (type === 'checkbox') {
          if (!newCustomizations[customizationName]) {
            newCustomizations[customizationName] = [];
          }
          const currentOptions = newCustomizations[customizationName];
          const optionIndex = currentOptions.findIndex(opt => opt.name === option.name);
          
          if (optionIndex > -1) {
            currentOptions.splice(optionIndex, 1);
          } else {
            currentOptions.push(option);
          }
        }
        
        return newCustomizations;
      });
    };

    const calculateTotalPrice = () => {
      const customizationPrice = Object.values(selectedCustomizations).flat().reduce((total, option) => {
        return total + (option?.price || 0);
      }, 0);
      return item.price + customizationPrice;
    };

    const canAddToCart = () => {
      return item.customizations.every(customization => {
        if (customization.required) {
          return selectedCustomizations[customization.name];
        }
        return true;
      });
    };

    return (
      <div className="fixed inset-0 w-[100vw] bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="text-4xl mb-2 text-center">{item.image}</div>
              <p className="text-gray-600 text-sm">{item.description}</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">₹{item.price}</p>
            </div>

            {item.customizations.map(customization => (
              <div key={customization.name} className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {customization.name}
                  {customization.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                
                <div className="space-y-2">
                  {customization.options.map(option => (
                    <label key={option.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <input
                          type={customization.type}
                          name={customization.name}
                          onChange={() => handleCustomizationChange(customization.name, option, customization.type)}
                          className="w-4 h-4 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-gray-700">{option.name}</span>
                      </div>
                      {option.price > 0 && (
                        <span className="text-gray-600 font-medium">+₹{option.price}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total: ₹{calculateTotalPrice()}</span>
              </div>
              
              <button
                onClick={() => onAdd(item, selectedCustomizations)}
                disabled={!canAddToCart()}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  canAddToCart()
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen mt-16 w-[100vw] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white shadow-lg sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <HiOutlineArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <HiStar className="w-4 h-4 text-green-500 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HiOutlineClock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{restaurant.deliveryTime} mins</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HiOutlineTruck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">₹{restaurant.deliveryFee} delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Side - Menu Items */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {/* Restaurant Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-6xl">{restaurant.image}</div>
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">{restaurant.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <HiOutlineLocationMarker className="w-4 h-4" />
                      <span>{restaurant.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HiOutlinePhone className="w-4 h-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Minimum order: ₹{restaurant.minOrder}</p>
                </div>
              </div>
            </div>

            {/* Favorites Summary */}
            {favoritesCount > 0 && (
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HiHeart className="w-5 h-5 text-pink-500" />
                    <span className="text-pink-700 font-medium">
                      You have {favoritesCount} favorite item{favoritesCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/favorites')}
                    className="text-pink-600 hover:text-pink-700 font-semibold text-sm"
                  >
                    View Favorites
                  </button>
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items available</h3>
                  <p className="text-gray-600">This restaurant hasn't added any menu items yet.</p>
                </div>
              ) : (
                filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-xl flex items-center justify-center text-3xl">
                          {item.image}
                        </div>
                        
                        {/* Dietary Badge */}
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                          item.dietaryType === 'Veg' ? 'border-green-600' : 'border-red-600'
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            item.dietaryType === 'Veg' ? 'bg-green-600' : 'bg-red-600'
                          }`}></div>
                        </div>
                        
                        {/* Popular Badge */}
                        {item.popular && (
                          <div className="absolute -bottom-2 -left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Popular
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            <p className="text-xl font-bold text-red-500">₹{item.price}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFavorite(item)}
                              className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                                isFavorite(item.id) 
                                  ? 'bg-pink-100 hover:bg-pink-200' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {isFavorite(item.id) ? (
                                <HiHeart className="w-5 h-5 text-pink-500" />
                              ) : (
                                <HiOutlineHeart className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => item.customizations.length > 0 ? setShowCustomization(item) : addToCart(item)}
                              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Interactive Cart Preview */}
          <div className="w-96 bg-white shadow-2xl p-6 overflow-y-auto max-h-screen sticky top-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <HiOutlineShoppingCart className="w-6 h-6" />
                <span>Your Cart</span>
              </h2>
              
              {cart.length > 0 && (
                <button
                  onClick={() => navigate('/cart')}
                  className="text-red-500 hover:text-red-600 font-semibold text-sm"
                >
                  View Full Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-600">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-2">Add some delicious items to get started</p>
              </div>
            ) : (
              <>
                {/* Cart Items with Interactive Controls */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map(cartItem => (
                    <div key={cartItem.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{cartItem.image}</div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{cartItem.name}</h4>
                            <button
                              onClick={() => removeFromCart(cartItem.id)}
                              className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200 text-red-500"
                              title="Remove item"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Customizations Display */}
                          {Object.keys(cartItem.customizations || {}).length > 0 && (
                            <div className="mb-2">
                              {Object.entries(cartItem.customizations).map(([key, value]) => (
                                <div key={key} className="text-xs text-gray-600">
                                  <span className="font-medium">{key}:</span> {
                                    Array.isArray(value) 
                                      ? value.map(v => v.name).join(', ')
                                      : value.name
                                  }
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2 bg-white rounded-lg border">
                              <button
                                onClick={() => updateQuantity(cartItem.id, -1)}
                                disabled={cartItem.quantity <= 1}
                                className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <HiMinus className="w-4 h-4" />
                              </button>
                              
                              <span className="px-3 py-1 font-medium text-sm min-w-[2rem] text-center">
                                {cartItem.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(cartItem.id, 1)}
                                className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                              >
                                <HiPlus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <span className="font-bold text-gray-900 text-sm">
                              ₹{cartItem.totalPrice * cartItem.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total ({cartItemsCount} items)</span>
                    <span className="text-lg font-bold">₹{cartTotal}</span>
                  </div>

                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Proceed to Checkout
                  </button>
                  
                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        cartUtils.clearCart();
                        setCart([]);
                      }}
                      className="w-full mt-2 py-2 text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <CustomizationModal
          item={showCustomization}
          onClose={() => setShowCustomization(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  );
};

export default RestaurantDetailsPage;
