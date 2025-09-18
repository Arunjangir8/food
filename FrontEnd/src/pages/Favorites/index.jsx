import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft,
  HiHeart,
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiPlus,
  HiMinus,
  HiOutlineX,
  HiTrash,
  HiOutlineEmojiSad,
  HiOutlineSparkles,
  HiStar
} from 'react-icons/hi';

// Import the same utility functions from the restaurant page
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
      restaurantId: item.restaurantId || 1,
      restaurantName: item.restaurantName || "Pizza Palace",
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

  getCartItemsCount: () => {
    const cart = cartUtils.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
};

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

  removeFromFavorites: (itemId) => {
    const favorites = favoritesUtils.getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
    favoritesUtils.saveFavorites(updatedFavorites);
    return updatedFavorites;
  },

  clearFavorites: () => {
    favoritesUtils.saveFavorites([]);
    return [];
  }
};

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCustomization, setShowCustomization] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // recent, price-low, price-high, name

  // Load favorites and cart from localStorage on component mount
  useEffect(() => {
    const savedFavorites = favoritesUtils.getFavorites();
    const savedCart = cartUtils.getCart();
    setFavorites(savedFavorites);
    setCart(savedCart);
  }, []);

  // Get unique categories from favorites
  const categories = ['All', ...new Set(favorites.map(item => item.category))];

  // Filter favorites by category
  const filteredFavorites = selectedCategory === 'All' 
    ? favorites 
    : favorites.filter(item => item.category === selectedCategory);

  // Sort favorites
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
      default:
        return new Date(b.addedAt) - new Date(a.addedAt);
    }
  });

  const addToCart = (item, customizations = {}) => {
    const updatedCart = cartUtils.addToCart(item, customizations);
    setCart(updatedCart);
    setShowCustomization(null);
    
    // Show success notification
    alert(`${item.name} added to cart!`);
  };

  const removeFromFavorites = (itemId) => {
    const updatedFavorites = favoritesUtils.removeFromFavorites(itemId);
    setFavorites(updatedFavorites);
  };

  const clearAllFavorites = () => {
    const confirmed = window.confirm('Are you sure you want to clear all favorites?');
    if (confirmed) {
      const updatedFavorites = favoritesUtils.clearFavorites();
      setFavorites(updatedFavorites);
    }
  };

  const addAllToCart = () => {
    const confirmed = window.confirm(`Add all ${favorites.length} favorite items to cart?`);
    if (confirmed) {
      let count = 0;
      favorites.forEach(item => {
        // if (item.customizations && item.customizations.length > 0) {
        //   // Skip items with required customizations
        //   return;
        // }
        cartUtils.addToCart(item);
        count++;
      });
      
      const updatedCart = cartUtils.getCart();
      setCart(updatedCart);
      alert(`${count} items added to cart!`);
    }
  };

  const cartItemsCount = cartUtils.getCartItemsCount();

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

            {item.customizations && item.customizations.map(customization => (
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
    <div className="min-h-screen w-[100vw] bg-white">
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
                  <HiHeart className="w-8 h-8 text-pink-500" />
                  <span>My Favorites</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {favorites.length} favorite item{favorites.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Cart Icon */}
              <button 
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <HiOutlineShoppingCart className="w-8 h-8 text-gray-700" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {favorites.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-8xl mb-6">💔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring restaurants and add items to your favorites by clicking the heart icon!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <>
            {/* Filter and Sort Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Category Filter */}
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

                {/* Sort and Bulk Actions */}
                <div className="flex items-center space-x-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>

                  <button
                    onClick={addAllToCart}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
                    disabled={favorites.length === 0}
                  >
                    Add All to Cart
                  </button>

                  <button
                    onClick={clearAllFavorites}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200"
                    disabled={favorites.length === 0}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Favorites List */}
            <div className="space-y-4">
              {sortedFavorites.map(item => (
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
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-500 mb-1">{item.restaurantName}</p>
                                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                              </div>
                              
                              <button
                                onClick={() => removeFromFavorites(item.id)}
                                className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 text-red-500"
                                title="Remove from favorites"
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <p className="text-xl font-bold text-red-500">₹{item.price}</p>
                                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                                  {item.category}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Added {new Date(item.addedAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => navigate(`/restaurants/${item.restaurantId}`)}
                                  className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-medium transition-colors duration-200"
                                  title="View restaurant"
                                >
                                  View Menu
                                </button>
                                
                                <button
                                  onClick={() => item.customizations && item.customizations.length > 0 ? setShowCustomization(item) : addToCart(item)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            {filteredFavorites.length !== favorites.length && (
              <div className="text-center mt-8 text-gray-600">
                Showing {filteredFavorites.length} of {favorites.length} favorite items
              </div>
            )}
          </>
        )}
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

export default FavoritesPage;
