import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../../services/api.js';
import {
    HiOutlineSearch,
    HiOutlineLocationMarker,
    HiStar,
    HiOutlineClock,
    HiOutlineTruck,
    HiOutlineHeart,
    HiHeart,
    HiOutlineFilter,
    HiOutlineAdjustments,
    HiChevronDown
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext.jsx';
import Footer from '../../components/Footer';

const RestaurantsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedLocation, setSelectedLocation, locations } = useLocation();
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    // const [favorites, setFavorites] = useState(new Set());
    const [sortBy, setSortBy] = useState('rating');

    // New filter states
    const [priceRange, setPriceRange] = useState([0, 1000]); // Min, Max price
    const [maxDistance, setMaxDistance] = useState(10); // Max distance in km
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const handleOrderNow = (restaurantId) => {
        navigate(`/restaurants/${restaurantId}`);
    };
    
    const [restaurants, setRestaurants] = useState([]);
    const [cuisines, setCuisines] = useState(['All']);
    const [loading, setLoading] = useState(true);
    
    // Close location dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showLocationDropdown && !event.target.closest('.location-dropdown')) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLocationDropdown]);

    // Load cuisines from API
    useEffect(() => {
        const fetchCuisines = async () => {
            try {
                const response = await restaurantAPI.getCuisines();
                setCuisines(['All', ...response.data.data.cuisines]);
            } catch (error) {
                console.error('Failed to fetch cuisines:', error);
            }
        };
        
        fetchCuisines();
    }, []);

    // Load restaurants from API
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await restaurantAPI.getAll({
                    city: selectedLocation,
                    cuisine: selectedCuisine !== 'All' ? selectedCuisine : undefined,
                    search: searchQuery
                });
                // Add missing properties to restaurant data
                const restaurantsWithDefaults = response.data.data.restaurants.map(restaurant => ({
                    ...restaurant,
                    distance: 2.5, // Default distance
                    avgPrice: 300, // Default average price
                    priceRange: '₹200-400' // Default price range
                }));
                setRestaurants(restaurantsWithDefaults);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
                setRestaurants([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchRestaurants();
    }, [selectedLocation, selectedCuisine, searchQuery]);

    // const cuisines = ['All', 'Italian', 'American', 'Japanese', 'Mexican', 'Indian', 'Continental'];

    // const toggleFavorite = (id) => {
    //     const newFavorites = new Set(favorites);
    //     if (newFavorites.has(id)) {
    //         newFavorites.delete(id);
    //     } else {
    //         newFavorites.add(id);
    //     }
    //     setFavorites(newFavorites);
    // };

    const filteredRestaurants = restaurants
        .filter(restaurant => {
            const matchesSearch = !searchQuery || 
                restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine.includes(selectedCuisine);
            const matchesPrice = restaurant.avgPrice >= priceRange[0] && restaurant.avgPrice <= priceRange[1];
            const matchesDistance = restaurant.distance <= maxDistance;

            return matchesSearch && matchesCuisine && matchesPrice && matchesDistance;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'deliveryTime':
                    return a.deliveryTime - b.deliveryTime;
                case 'distance':
                    return a.distance - b.distance;
                case 'price':
                    return a.avgPrice - b.avgPrice;
                default:
                    return 0;
            }
        });



    return (
        <div className="min-h-screen bg-gradient-to-br lg:pt-20 from-red-50 via-orange-50 to-yellow-50">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 mx-auto">
                        Discover
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600"> Restaurants </span>
                        Near You
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Find the best restaurants in {selectedLocation} with fast delivery and amazing food.
                    </p>
                </div>


                {/* Search and Filters Section */}
                <div className="mb-8 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-white rounded-md shadow-2xl p-2 w-full max-w-4xl mx-auto border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-2">
                            {/* Location Selector */}
                            <div className="relative location-dropdown">
                                <div 
                                    className="w-full lg:w-48 flex items-center space-x-2 text-gray-700 hover:text-red-500 cursor-pointer transition-colors duration-200 px-4 py-4 rounded-md bg-gray-50 hover:bg-white h-14"
                                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                                >
                                    <HiOutlineLocationMarker className="w-5 h-5 text-red-500" />
                                    <div className="flex flex-col flex-1">
                                        <span className="text-xs text-gray-500 font-medium">Deliver to</span>
                                        <span className="text-sm font-semibold flex items-center justify-between">
                                            {selectedLocation}
                                            <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`} />
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Dropdown */}
                                {showLocationDropdown && (
                                    <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50 w-full lg:w-48">
                                        {locations.map(location => (
                                            <button
                                                key={location}
                                                onClick={() => {
                                                    setSelectedLocation(location);
                                                    setShowLocationDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 hover:bg-red-50 transition-colors duration-200 ${
                                                    selectedLocation === location ? 'text-red-500 bg-red-50' : 'text-gray-700'
                                                }`}
                                            >
                                                {location}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="relative flex-1">
                                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search restaurants, cuisines, or dishes"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200 h-14"
                                />
                            </div>

                            {/* Advanced Filters Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-6 py-4 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 h-14 ${showFilters
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <HiOutlineAdjustments className="w-5 h-5" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    <div className='flex justify-center w-full'>
                        {showFilters && (
                            <div className="bg-white rounded-md shadow-xl p-6 border border-gray-100 animate-slideDown">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                                    <button
                                        onClick={() => {
                                            setPriceRange([0, 1000]);
                                            setMaxDistance(20);
                                            setSortBy('rating');
                                            setSelectedCuisine('All');
                                            setSearchQuery('');
                                        }}
                                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                    {/* Price Range Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Price Range (₹{priceRange[0]} - ₹{priceRange[1]})
                                        </label>
                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1000"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                                className="w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer slider-thumb"
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="1000"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                className="w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer slider-thumb"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>₹0</span>
                                                <span>₹1000+</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Distance Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Max Distance ({maxDistance} km)
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={maxDistance}
                                            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer slider-thumb"
                                        />
                                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                                            <span>1 km</span>
                                            <span>20+ km</span>
                                        </div>
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value="rating">Highest Rating</option>
                                            <option value="deliveryTime">Fastest Delivery</option>
                                            <option value="distance">Nearest First</option>
                                            <option value="price">Price: Low to High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Filter Pills */}
                    <div className="flex flex-wrap items-center w-full justify-center gap-4">
                        {/* Cuisine Filter */}
                        <div className="flex flex-wrap gap-2">
                            {cuisines.map(cuisine => (
                                <button
                                    key={cuisine}
                                    onClick={() => setSelectedCuisine(cuisine)}
                                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${selectedCuisine === cuisine
                                        ? 'bg-red-500 text-white shadow-lg transform -translate-y-0.5'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(priceRange[0] > 0 || priceRange[1] < 1000 || maxDistance < 20) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        ₹{priceRange[0]} - ₹{priceRange[1]}
                                    </span>
                                )}
                                {maxDistance < 20 && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Within {maxDistance}km
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Found <span className="font-semibold text-gray-900">{filteredRestaurants.length}</span> restaurants in {selectedLocation}
                    </p>
                </div>

                {/* Restaurant Grid */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading restaurants...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRestaurants.map((restaurant, index) => (
                        <div
                            key={restaurant.id}
                            className="bg-white rounded-md shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeInUp 0.6s ease-out forwards'
                            }}
                        >
                            {/* Restaurant Image Container */}
                            <div className="relative p-6 pb-4">
                                <div className="relative bg-gradient-to-br from-orange-200 to-red-200 rounded-md h-48 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                    {restaurant.image ? (
                                        <img 
                                            src={restaurant.image} 
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover rounded-md"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <div className="text-6xl" style={{display: restaurant.image ? 'none' : 'block'}}>🍕</div>



                                    {/* Promoted Badge */}
                                    {restaurant.promoted && (
                                        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                                            Promoted
                                        </div>
                                    )}

                                    {/* Offer Badge */}
                                    {restaurant.offer && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {restaurant.offer}
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${restaurant.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {restaurant.isActive ? 'Open' : 'Closed'}
                                    </div>

                                    {/* Favorite Button */}
                                    {/* <button
                                        onClick={() => toggleFavorite(restaurant.id)}
                                        className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                    >
                                        {favorites.has(restaurant.id) ? (
                                            <HiHeart className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <HiOutlineHeart className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button> */}
                                </div>
                            </div>

                            {/* Restaurant Info */}
                            <div className="px-6 pb-6">
                                <div className="mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-500 transition-colors duration-200">
                                        {restaurant.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">{restaurant.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full">{restaurant.cuisine.join(', ')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{restaurant.distance} km away</span>
                                        <span className="font-semibold text-gray-700">{restaurant.priceRange}</span>
                                    </div>
                                </div>

                                {/* Rating and Stats */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                                            <HiStar className="w-4 h-4 text-green-600 fill-current" />
                                            <span className="text-green-800 font-semibold text-sm">{parseFloat(restaurant.rating).toFixed(1)}</span>
                                        </div>

                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <HiOutlineClock className="w-4 h-4" />
                                            <span className="text-sm">{restaurant.deliveryTime} mins</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Delivery fee</div>
                                        <div className="font-semibold text-gray-900">₹{restaurant.deliveryFee}</div>
                                    </div>
                                </div>

                                {/* Order Button */}
                                <button
                                    disabled={!restaurant.isActive}
                                    onClick={() => restaurant.isActive && handleOrderNow(restaurant.id)}
                                    className={`w-full py-3 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${restaurant.isActive
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <HiOutlineTruck className="w-5 h-5" />
                                    <span>{restaurant.isActive ? 'Order Now' : 'Currently Closed'}</span>
                                </button>
                            </div>
                        </div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {filteredRestaurants.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCuisine('All');
                                setPriceRange([0, 1000]);
                                setMaxDistance(20);
                                setSortBy('rating');
                                setShowFilters(false);
                            }}
                            className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
            <Footer/>

            {/* Custom CSS for animations and sliders */}
            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
        </div>
    );
};

export default RestaurantsPage;
