import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiStar,
  HiOutlineTruck,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

const RestaurantRegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // User fields (Restaurant Owner)
    name: '',
    email: '',
    phone: '',
    password: '',
    
    // Restaurant fields
    restaurantName: '',
    description: '',
    cuisine: [],
    image: null,
    banner: null,
    
    // Location
    address: '',
    city: '',
    pincode: '',
    
    // Timing
    openTime: '',
    closeTime: '',
    
    // Delivery
    deliveryFee: 0,
    minOrder: 0,
    deliveryTime: ''
  });

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental',
    'South Indian', 'North Indian', 'Fast Food', 'Desserts', 'Beverages'
  ];

  const steps = [
    { 
      number: 1, 
      title: 'Owner Details', 
      description: 'Personal information',
      icon: HiOutlineUser,
      fields: ['name', 'email', 'phone', 'password']
    },
    { 
      number: 2, 
      title: 'Restaurant Info', 
      description: 'Basic restaurant details',
      icon: HiOutlineOfficeBuilding,
      fields: ['restaurantName', 'description', 'cuisine', 'image', 'banner']
    },
    { 
      number: 3, 
      title: 'Location', 
      description: 'Address and location',
      icon: HiOutlineLocationMarker,
      fields: ['address', 'city', 'pincode']
    },
    { 
      number: 4, 
      title: 'Operating Hours', 
      description: 'Business timing',
      icon: HiOutlineClock,
      fields: ['openTime', 'closeTime']
    },
    { 
      number: 5, 
      title: 'Delivery Settings', 
      description: 'Delivery preferences',
      icon: HiOutlineTruck,
      fields: ['deliveryFee', 'minOrder', 'deliveryTime']
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCuisineToggle = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const currentStepFields = steps[step - 1].fields;
    
    currentStepFields.forEach(field => {
      if (field === 'cuisine') {
        if (formData.cuisine.length === 0) {
          newErrors.cuisine = 'Select at least one cuisine';
        }
      } else if (field === 'email') {
        if (!formData[field]) {
          newErrors[field] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData[field])) {
          newErrors[field] = 'Invalid email format';
        }
      } else if (field === 'password') {
        if (!formData[field]) {
          newErrors[field] = 'Password is required';
        } else if (formData[field].length < 6) {
          newErrors[field] = 'Password must be at least 6 characters';
        }
      } else if (field === 'phone') {
        if (!formData[field]) {
          newErrors[field] = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData[field])) {
          newErrors[field] = 'Phone number must be 10 digits';
        }
      } else if (['image', 'banner'].includes(field)) {
        // Optional fields, no validation needed
      } else if (!formData[field] && formData[field] !== 0) {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(steps.length)) return;
    
    setIsLoading(true);
    try {
      // Transform data to match your Prisma schema
      const registrationData = {
        user: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'RESTAURANT_OWNER'
        },
        restaurant: {
          name: formData.restaurantName,
          description: formData.description,
          cuisine: formData.cuisine,
          image: formData.image,
          banner: formData.banner,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          deliveryFee: parseFloat(formData.deliveryFee) || 0,
          minOrder: parseFloat(formData.minOrder) || 0,
          deliveryTime: formData.deliveryTime
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registration Data:', registrationData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.restaurantName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter restaurant name"
              />
              {errors.restaurantName && <p className="text-sm text-red-500 mt-1">{errors.restaurantName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your restaurant"
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Types *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {cuisineOptions.map((cuisine) => (
                  <label key={cuisine} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.cuisine.includes(cuisine)}
                      onChange={() => handleCuisineToggle(cuisine)}
                      className="mr-2 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">{cuisine}</span>
                  </label>
                ))}
              </div>
              {errors.cuisine && <p className="text-sm text-red-500 mt-1">{errors.cuisine}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="hidden"
                    id="restaurant-image"
                  />
                  <label htmlFor="restaurant-image" className="cursor-pointer">
                    <HiOutlinePhotograph className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">Upload Image</p>
                  </label>
                  {formData.image && (
                    <p className="text-xs text-green-600 mt-1">{formData.image.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    className="hidden"
                    id="banner-image"
                  />
                  <label htmlFor="banner-image" className="cursor-pointer">
                    <HiOutlinePhotograph className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">Upload Banner</p>
                  </label>
                  {formData.banner && (
                    <p className="text-xs text-green-600 mt-1">{formData.banner.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address *
              </label>
              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete address"
                />
              </div>
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
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
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
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
                {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Time *
                </label>
                <div className="relative">
                  <HiOutlineClock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    name="openTime"
                    value={formData.openTime}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.openTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.openTime && <p className="text-sm text-red-500 mt-1">{errors.openTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Time *
                </label>
                <div className="relative">
                  <HiOutlineClock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    name="closeTime"
                    value={formData.closeTime}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.closeTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.closeTime && <p className="text-sm text-red-500 mt-1">{errors.closeTime}</p>}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (₹)
                </label>
                <div className="relative">
                  <HiOutlineCurrencyDollar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order (₹)
                </label>
                <div className="relative">
                  <HiOutlineCurrencyDollar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time *
              </label>
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
              {errors.deliveryTime && <p className="text-sm text-red-500 mt-1">{errors.deliveryTime}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold  mb-2 text-red-600">Restaurant Registration</h1>
          <p className="text-gray-600 text-sm">Complete all steps to register your restaurant</p>
        </div>

        {/* Steps */}
        <div className="px-6 pb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="relative">
                <div
                  onClick={() =>{}}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-red-50 border-2 border-red-500' 
                      : isCompleted 
                        ? 'bg-green-50 border-2 border-green-500' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive 
                      ? 'bg-red-500 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <HiOutlineCheck className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-medium ${
                      isActive ? 'text-red-700' : isCompleted ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-4 ml-9 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-red-500 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>

            <form onSubmit={currentStep === steps.length ? handleSubmit : (e) => e.preventDefault()}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Registering...' : 'Register Restaurant'}
                  </button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={()=>navigate('/restaurant/login')}
                  className="text-red-500 font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegisterPage;
