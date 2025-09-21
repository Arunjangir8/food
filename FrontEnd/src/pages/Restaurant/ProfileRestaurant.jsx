import React, { useState, useEffect, useRef } from 'react';
import { 
  HiOutlinePencil, 
  HiOutlinePhotograph,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineTruck,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUpload,
  HiOutlineCamera,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { restaurantAPI } from '../../services/api.js';

const RestaurantProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [restaurantData, setRestaurantData] = useState(null);
  const [formData, setFormData] = useState({});
  const [cuisineInput, setCuisineInput] = useState('');
  
  const imageInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await restaurantAPI.getMyRestaurant();
        setRestaurantData(response.data.data.restaurant);
        setFormData(response.data.data.restaurant);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Failed to load restaurant data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRestaurantData();
    }
  }, [user]);

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

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append(type, file);

      const response = await restaurantAPI.uploadImages(restaurantData.id, uploadFormData);
      
      const updatedRestaurant = response.data.data.restaurant;
      setRestaurantData(updatedRestaurant);
      setFormData(updatedRestaurant);
      
      toast.success(`${type === 'image' ? 'Logo' : 'Banner'} uploaded successfully!`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload ${type === 'image' ? 'logo' : 'banner'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.openTime) newErrors.openTime = 'Opening time is required';
    if (!formData.closeTime) newErrors.closeTime = 'Closing time is required';
    if (formData.deliveryFee < 0) newErrors.deliveryFee = 'Delivery fee cannot be negative';
    if (formData.minOrder < 0) newErrors.minOrder = 'Minimum order cannot be negative';
    if (!formData.deliveryTime?.trim()) newErrors.deliveryTime = 'Delivery time is required';
    if (!formData.cuisine || formData.cuisine.length === 0) newErrors.cuisine = 'At least one cuisine type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await restaurantAPI.update(restaurantData.id, formData);
      
      setRestaurantData(response.data.data.restaurant);
      setIsEditing(false);
      toast.success('Restaurant profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update restaurant profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(restaurantData ? { ...restaurantData } : {});
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No restaurant found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-6xl mx-auto p-3 lg:p-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 lg:mb-8">
          {/* Banner Section */}
          <div className="relative h-32 sm:h-48 lg:h-64">
            {restaurantData.banner && (
              <img 
                src={restaurantData.banner} 
                alt="Restaurant Banner" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Banner Upload Button */}
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploading}
              className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 lg:p-3 rounded-full hover:bg-opacity-30 transition-all disabled:opacity-50"
            >
              <HiOutlineCamera className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
              className="hidden"
            />
          </div>

          {/* Profile Info */}
          <div className="relative px-4 lg:px-8 pb-4 lg:pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 lg:gap-6 -mt-8 sm:-mt-12 lg:-mt-16">
              
              {/* Restaurant Logo */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-lg overflow-hidden border-2 lg:border-4 border-white">
                  {restaurantData.image ? (
                    <img 
                      src={restaurantData.image} 
                      alt="Restaurant Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <HiOutlinePhotograph className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                >
                  <HiOutlineCamera className="w-4 h-4" />
                </button>
                
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'image')}
                  className="hidden"
                />
              </div>

              {/* Restaurant Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{restaurantData.name}</h1>
                    <p className="text-white mb-3">{restaurantData.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurantData.cuisine?.map((cuisine, index) => (
                        <span
                          key={index}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <HiOutlineStar className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{restaurantData.rating}</span>
                        <span>({restaurantData.ratingCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiOutlineClock className="w-4 h-4" />
                        <span>{restaurantData.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiOutlineTruck className="w-4 h-4" />
                        <span>₹{restaurantData.deliveryFee} delivery</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
                      restaurantData.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurantData.isActive ? 'Active' : 'Inactive'}
                    </div>
                    
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <HiOutlineSave className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <HiOutlineX className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <HiOutlineInformationCircle className="w-6 h-6 text-blue-500" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter restaurant name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{restaurantData.name}</p>
                )}
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter restaurant description"
                  />
                ) : (
                  <p className="text-gray-700">{restaurantData.description}</p>
                )}
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Types *</label>
                {isEditing ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.cuisine?.map((cuisine, index) => (
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
                    {restaurantData.cuisine?.map((cuisine, index) => (
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

          {/* Location & Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <HiOutlineLocationMarker className="w-6 h-6 text-green-500" />
              Location & Contact
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
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
                      value={formData.pincode || ''}
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
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <HiOutlineClock className="w-6 h-6 text-purple-500" />
              Operating Hours
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time *</label>
                  {isEditing ? (
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime || ''}
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
                      value={formData.closeTime || ''}
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

          {/* Delivery Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <HiOutlineTruck className="w-6 h-6 text-orange-500" />
              Delivery Settings
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (₹) *</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="deliveryFee"
                      value={formData.deliveryFee || ''}
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
                      value={formData.minOrder || ''}
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
                    value={formData.deliveryTime || ''}
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

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Restaurant Status</h3>
                  <p className="text-sm text-gray-600">Control if your restaurant accepts orders</p>
                </div>
                {isEditing ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive || false}
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
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-gray-700">Uploading image...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantProfilePage;