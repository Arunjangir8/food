import React, { useState } from 'react';
import { 
  HiOutlinePencil, 
  HiOutlinePhotograph,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineTruck,
  HiOutlineStar,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCurrencyRupee,
  HiOutlineInformationCircle,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineUpload,
  HiOutlineMenu
} from 'react-icons/hi';

const RestaurantProfilePage = () => {
  const [activeSection, setActiveSection] = useState('basic_info');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample restaurant data - replace with actual API call
  const [restaurantData, setRestaurantData] = useState({
    id: "clx1234567890",
    name: "Delicious Bites Restaurant",
    description: "Authentic Indian cuisine with modern twist. We serve the finest North Indian delicacies prepared with fresh ingredients and traditional recipes.",
    image: "/images/restaurant-logo.jpg",
    banner: "/images/restaurant-banner.jpg",
    cuisine: ["Indian", "North Indian", "Vegetarian"],
    rating: 4.2,
    totalRating: 840,
    ratingCount: 200,
    isActive: true,
    isPromoted: false,
    address: "123 Food Street, Sector 15",
    city: "Gurgaon",
    pincode: "122001",
    latitude: 28.4595,
    longitude: 77.0266,
    openTime: "09:00",
    closeTime: "23:00",
    deliveryFee: 30.0,
    minOrder: 200.0,
    deliveryTime: "30-45 mins",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-03-10T14:20:00Z"
  });

  const [formData, setFormData] = useState({ ...restaurantData });
  const [cuisineInput, setCuisineInput] = useState('');

  const sidebarSections = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      icon: HiOutlineInformationCircle,
      color: 'text-blue-500'
    },
    {
      id: 'status_settings',
      title: 'Status & Settings',
      icon: HiOutlineCog,
      color: 'text-gray-500'
    },
    {
      id: 'location',
      title: 'Location Details',
      icon: HiOutlineLocationMarker,
      color: 'text-green-500'
    },
    {
      id: 'timing',
      title: 'Operating Hours',
      icon: HiOutlineClock,
      color: 'text-purple-500'
    },
    {
      id: 'delivery',
      title: 'Delivery Settings',
      icon: HiOutlineTruck,
      color: 'text-orange-500'
    },
    {
      id: 'stats',
      title: 'Restaurant Stats',
      icon: HiOutlineChartBar,
      color: 'text-yellow-500'
    },
    {
      id: 'media',
      title: 'Media & Photos',
      icon: HiOutlinePhotograph,
      color: 'text-pink-500'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCuisineAdd = (e) => {
    e.preventDefault();
    if (cuisineInput.trim() && !formData.cuisine.includes(cuisineInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cuisine: [...prev.cuisine, cuisineInput.trim()]
      }));
      setCuisineInput('');
    }
  };

  const handleCuisineRemove = (cuisineToRemove) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.filter(cuisine => cuisine !== cuisineToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.openTime) newErrors.openTime = 'Opening time is required';
    if (!formData.closeTime) newErrors.closeTime = 'Closing time is required';
    if (formData.deliveryFee < 0) newErrors.deliveryFee = 'Delivery fee cannot be negative';
    if (formData.minOrder < 0) newErrors.minOrder = 'Minimum order cannot be negative';
    if (!formData.deliveryTime.trim()) newErrors.deliveryTime = 'Delivery time is required';
    if (formData.cuisine.length === 0) newErrors.cuisine = 'At least one cuisine type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRestaurantData({ ...formData, updatedAt: new Date().toISOString() });
      setIsEditing(false);
      console.log('Restaurant updated:', formData);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...restaurantData });
    setErrors({});
    setIsEditing(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<HiOutlineStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<HiOutlineStar key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<HiOutlineStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const renderBasicInfo = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlineInformationCircle className="w-6 h-6 text-blue-500" />
        Basic Information
      </h2>
      
      <div className="space-y-6">
        {/* Restaurant Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter restaurant name"
            />
          ) : (
            <p className="text-gray-900 font-medium text-lg">{restaurantData.name}</p>
          )}
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter restaurant description"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{restaurantData.description}</p>
          )}
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Cuisine Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Types *</label>
          {isEditing ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.cuisine.map((cuisine, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm flex items-center gap-2"
                  >
                    {cuisine}
                    <button
                      onClick={() => handleCuisineRemove(cuisine)}
                      className="hover:bg-red-200 rounded-full p-0.5"
                    >
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cuisineInput}
                  onChange={(e) => setCuisineInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Add cuisine type"
                  onKeyDown={(e) => e.key === 'Enter' && handleCuisineAdd(e)}
                />
                <button
                  onClick={handleCuisineAdd}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {restaurantData.cuisine.map((cuisine, index) => (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-medium"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          )}
          {errors.cuisine && <p className="text-sm text-red-500 mt-1">{errors.cuisine}</p>}
        </div>
      </div>
    </div>
  );

  const renderStatusSettings = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlineCog className="w-6 h-6 text-gray-500" />
        Status & Settings
      </h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {restaurantData.isActive ? (
              <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <HiOutlineXCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">Restaurant Status</h3>
              <p className="text-sm text-gray-600">Control if your restaurant accepts orders</p>
            </div>
          </div>
          {isEditing ? (
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </label>
          ) : (
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              restaurantData.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurantData.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <HiOutlineStar className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-medium text-gray-900">Promoted Restaurant</h3>
              <p className="text-sm text-gray-600">Show restaurant in promoted listings</p>
            </div>
          </div>
          {isEditing ? (
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPromoted"
                checked={formData.isPromoted}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isPromoted ? 'bg-yellow-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.isPromoted ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </label>
          ) : (
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              restaurantData.isPromoted 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {restaurantData.isPromoted ? 'Promoted' : 'Standard'}
            </span>
          )}
        </div>

        {/* Quick Info */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurant ID</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {restaurantData.id.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">
                {new Date(restaurantData.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">
                {new Date(restaurantData.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlineLocationMarker className="w-6 h-6 text-green-500" />
        Location Details
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
          {isEditing ? (
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter complete address"
            />
          ) : (
            <p className="text-gray-900">{restaurantData.address}</p>
          )}
          {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
            ) : (
              <p className="text-gray-900">{restaurantData.city}</p>
            )}
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
            {isEditing ? (
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.pincode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter pincode"
              />
            ) : (
              <p className="text-gray-900">{restaurantData.pincode}</p>
            )}
            {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            {isEditing ? (
              <input
                type="number"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleInputChange}
                step="any"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="28.4595"
              />
            ) : (
              <p className="text-gray-900">{restaurantData.latitude || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            {isEditing ? (
              <input
                type="number"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleInputChange}
                step="any"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="77.0266"
              />
            ) : (
              <p className="text-gray-900">{restaurantData.longitude || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOperatingHours = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlineClock className="w-6 h-6 text-purple-500" />
        Operating Hours
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time *</label>
            {isEditing ? (
              <input
                type="time"
                name="openTime"
                value={formData.openTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.openTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            ) : (
              <p className="text-gray-900 text-lg font-medium">{restaurantData.openTime}</p>
            )}
            {errors.openTime && <p className="text-sm text-red-500 mt-1">{errors.openTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time *</label>
            {isEditing ? (
              <input
                type="time"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.closeTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            ) : (
              <p className="text-gray-900 text-lg font-medium">{restaurantData.closeTime}</p>
            )}
            {errors.closeTime && <p className="text-sm text-red-500 mt-1">{errors.closeTime}</p>}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-2">Current Status</h3>
          <p className="text-purple-700">
            Restaurant is currently {restaurantData.isActive ? 'accepting orders' : 'closed'}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            Operating hours: {restaurantData.openTime} - {restaurantData.closeTime}
          </p>
        </div>
      </div>
    </div>
  );

  const renderDeliverySettings = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlineTruck className="w-6 h-6 text-orange-500" />
        Delivery Settings
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (₹) *</label>
            {isEditing ? (
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.deliveryFee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            ) : (
              <p className="text-gray-900 text-lg font-medium">₹{restaurantData.deliveryFee}</p>
            )}
            {errors.deliveryFee && <p className="text-sm text-red-500 mt-1">{errors.deliveryFee}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order (₹) *</label>
            {isEditing ? (
              <input
                type="number"
                name="minOrder"
                value={formData.minOrder}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.minOrder ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            ) : (
              <p className="text-gray-900 text-lg font-medium">₹{restaurantData.minOrder}</p>
            )}
            {errors.minOrder && <p className="text-sm text-red-500 mt-1">{errors.minOrder}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time *</label>
          {isEditing ? (
            <input
              type="text"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.deliveryTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 30-45 mins"
            />
          ) : (
            <p className="text-gray-900 text-lg font-medium">{restaurantData.deliveryTime}</p>
          )}
          {errors.deliveryTime && <p className="text-sm text-red-500 mt-1">{errors.deliveryTime}</p>}
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-medium text-orange-900 mb-2">Delivery Summary</h3>
          <div className="space-y-1 text-sm text-orange-700">
            <p>• Minimum order value: ₹{restaurantData.minOrder}</p>
            <p>• Delivery charges: ₹{restaurantData.deliveryFee}</p>
            <p>• Estimated delivery time: {restaurantData.deliveryTime}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlineChartBar className="w-6 h-6 text-yellow-500" />
        Restaurant Stats
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex justify-center mb-2">{renderStars(restaurantData.rating)}</div>
            <p className="text-2xl font-bold text-yellow-600">{restaurantData.rating}</p>
            <p className="text-sm text-yellow-700">Overall Rating</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{restaurantData.ratingCount}</p>
            <p className="text-sm text-blue-700">Total Reviews</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{restaurantData.totalRating}</p>
            <p className="text-sm text-green-700">Rating Points</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-medium">{restaurantData.rating}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Satisfaction</span>
              <span className="font-medium">{Math.round((restaurantData.rating / 5) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Review Response Rate</span>
              <span className="font-medium">98%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMediaPhotos = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <HiOutlinePhotograph className="w-6 h-6 text-pink-500" />
        Media & Photos
      </h2>
      
      <div className="space-y-6">
        {/* Restaurant Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {restaurantData.image ? (
                <img src={restaurantData.image} alt="Restaurant Logo" className="w-full h-full object-cover" />
              ) : (
                <HiOutlinePhotograph className="w-8 h-8 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                <HiOutlineUpload className="w-4 h-4" />
                Upload Logo
              </button>
            )}
          </div>
        </div>

        {/* Restaurant Banner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Banner</label>
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {restaurantData.banner ? (
              <img src={restaurantData.banner} alt="Restaurant Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <HiOutlinePhotograph className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No banner uploaded</p>
              </div>
            )}
          </div>
          {isEditing && (
            <button className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
              <HiOutlineUpload className="w-4 h-4" />
              Upload Banner
            </button>
          )}
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <h3 className="font-medium text-pink-900 mb-2">Image Guidelines</h3>
          <ul className="text-sm text-pink-700 space-y-1">
            <li>• Logo should be square (1:1 ratio) and at least 400x400 pixels</li>
            <li>• Banner should be rectangular (16:9 ratio) and at least 1200x675 pixels</li>
            <li>• Use high-quality images that represent your restaurant well</li>
            <li>• File formats: JPG, PNG, WebP (max 5MB each)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'basic_info':
        return renderBasicInfo();
      case 'status_settings':
        return renderStatusSettings();
      case 'location':
        return renderLocationDetails();
      case 'timing':
        return renderOperatingHours();
      case 'delivery':
        return renderDeliverySettings();
      case 'stats':
        return renderStats();
      case 'media':
        return renderMediaPhotos();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="min-h-screen w-[100vw] pt-20 bg-gradient-to-br from-red-50 to-red-100">
      <div className="flex">
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
        >
          <HiOutlineMenu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out h-[90vh]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Restaurant Profile</h1>
                  <p className="text-red-100 text-sm">Manage your restaurant</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-white"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-red-100 text-red-700 border-l-4 border-red-500'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeSection === section.id ? 'text-red-500' : section.color}`} />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <HiOutlineSave className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 p-4 lg:p-4">
          <div className="max-w-[90vw] mx-auto">
            {renderActiveSection()}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RestaurantProfilePage;
