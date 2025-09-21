import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { localStorageUtils } from '../../utils/localStorage.js';
import toast from 'react-hot-toast';
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
  HiStar,
  HiOutlineTrash,
  HiChevronDown,
  HiOutlineSearch
} from 'react-icons/hi';



const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCustomization, setShowCustomization] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // recent, price-low, price-high, name
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [removingFavorite, setRemovingFavorite] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Load favorites and cart from localStorage
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        const localFavorites = localStorageUtils.getFavorites();
        const localCart = localStorageUtils.getCart();

        setFavorites(localFavorites);
        setCart(localCart);
      } catch (error) {
        console.error('Error loading data:', error);
        setFavorites([]);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for storage updates
    const handleFavoritesUpdate = () => setFavorites(localStorageUtils.getFavorites());
    const handleCartUpdate = () => setCart(localStorageUtils.getCart());

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const addToCart = async (item, customizations = {}) => {
    try {
      setAddingToCart(item.id);

      const cartItem = {
        itemId: item.itemId,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        name: item.name,
        price: item.price,
        customizations,
        customizationPrice: Object.values(customizations).flat().reduce((total, option) => total + (option?.price || 0), 0),
        totalPrice: item.price + Object.values(customizations).flat().reduce((total, option) => total + (option?.price || 0), 0),
        image: item.image,
        quantity: 1
      };

      await localStorageUtils.addToCart(cartItem, !!user);
      setShowCustomization(null);
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const removeFromFavorites = async (favoriteId) => {
    try {
      setRemovingFavorite(favoriteId);
      const item = favorites.find(fav => fav.id === favoriteId);
      await localStorageUtils.removeFromFavorites(item.itemId, !!user);
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingFavorite(null);
    }
  };

  const clearAllFavorites = async () => {
    const confirmed = window.confirm('Are you sure you want to clear all favorites?');
    if (confirmed) {
      try {
        // Remove from API if user is logged in
        if (user) {
          const response = await userAPI.getFavorites();
          const apiFavorites = response.data.data.favorites;
          for (const favorite of apiFavorites) {
            await userAPI.removeFromFavorites(favorite.id);
          }
        }

        localStorage.removeItem('foodFavorites');
        setFavorites([]);
        toast.success('All favorites cleared');
      } catch (error) {
        console.error('Error clearing favorites:', error);
        toast.error('Failed to clear favorites');
      }
    }
  };

  const addAllToCart = async () => {
    const confirmed = window.confirm(`Add all ${favorites.length} favorite items to cart?`);
    if (confirmed) {
      try {
        let count = 0;
        for (const item of favorites) {
          if (!item.customizations || item.customizations.length === 0) {
            const cartItem = {
              itemId: item.itemId,
              restaurantId: item.restaurantId,
              restaurantName: item.restaurantName,
              name: item.name,
              price: item.price,
              customizations: {},
              customizationPrice: 0,
              totalPrice: item.price,
              image: item.image,
              quantity: 1
            };

            await localStorageUtils.addToCart(cartItem, !!user);
            count++;
          }
        }

        toast.success(`${count} items added to cart!`);
      } catch (error) {
        console.error('Error adding items to cart:', error);
        toast.error('Failed to add some items to cart');
      }
    }
  };


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
              <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {item.image && item.image.startsWith('http') ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center text-3xl" style={{display: item.image && item.image.startsWith('http') ? 'none' : 'flex'}}>
                  {item.image && !item.image.startsWith('http') ? item.image : '🍕'}
                </div>
              </div>
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
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${canAddToCart()
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
    <div className="min-h-screen w-[100vw] pt-16 bg-white flex">
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
              <h2 className="text-xl font-bold text-gray-900">My Favorites</h2>
              <p className="text-sm text-gray-600">
                {favorites.length} favorite item{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search favorites..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-md
                     font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h3>
            <div className="relative sort-dropdown">
              <div 
                className="w-full flex items-center space-x-2 text-red-500 cursor-pointer transition-colors duration-200 px-4 py-3 rounded-md bg-gray-50 hover:bg-white border border-gray-200"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-gray-500 font-medium">Sort by</span>
                  <span className="text-sm font-semibold flex items-center justify-between">
                    {sortBy === 'recent' ? 'Recently Added' : 
                     sortBy === 'name' ? 'Name A-Z' : 
                     sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                    <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </div>
              
              {/* Dropdown */}
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-md
                 shadow-lg border border-gray-200 py-2 z-50 w-full">
                  {[
                    { value: 'recent', label: 'Recently Added' },
                    { value: 'name', label: 'Name A-Z' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-red-50 transition-colors duration-200 ${
                        sortBy === option.value ? 'text-red-500 bg-red-50' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={addAllToCart}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md
               font-medium transition-colors duration-200"
              disabled={favorites.length === 0}
            >
              Add All to Cart
            </button>
            
            <button
              onClick={clearAllFavorites}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-500 hover:bg-red-50 border border-red-200 rounded-md
               transition-colors duration-200"
            >
              <HiOutlineTrash className="w-4 h-4" />
              <span className="font-medium">Clear All Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
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


            {/* Favorites List */}
            <div className="space-y-4">
              {sortedFavorites.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-xl overflow-hidden flex items-center justify-center">
                          {item.image && item.image.startsWith('http') ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-3xl" style={{display: item.image && item.image.startsWith('http') ? 'none' : 'flex'}}>
                            {item.image && !item.image.startsWith('http') ? item.image : '🍕'}
                          </div>
                        </div>

                        {/* Dietary Badge */}
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${item.dietaryType === 'Veg' ? 'border-green-600' : 'border-red-600'
                          }`}>
                          <div className={`w-3 h-3 rounded-full ${item.dietaryType === 'Veg' ? 'bg-green-600' : 'bg-red-600'
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
                                disabled={removingFavorite === item.id}
                                className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove from favorites"
                              >
                                {removingFavorite === item.id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                                ) : (
                                  <HiTrash className="w-5 h-5" />
                                )}
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
                                  className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-md font-medium transition-colors duration-200"
                                  title="View restaurant"
                                >
                                  View Menu
                                </button>

                                <button
                                  onClick={() => item.customizations && item.customizations.length > 0 ? setShowCustomization(item) : addToCart(item)}
                                  disabled={addingToCart === item.id}
                                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-2 rounded-md font-semibold transition-all duration-200 transform hover:-translate-y-0.5 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                  {addingToCart === item.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Adding...</span>
                                    </>
                                  ) : (
                                    <span>Add to Cart</span>
                                  )}
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
