import React, { useState } from 'react';
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineArrowLeft
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const LoginRestaurantPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password too short';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authAPI.loginRestaurant(formData);
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        navigate('/restaurant/my-profile');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br flex items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/select-login')}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 shadow-lg"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
            <HiOutlineUser className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Restaurant Login</h1>
          <p className="text-red-100 text-sm">Welcome back, owner!</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              {errors.general && <p className="text-xs text-red-500 mt-1">{errors.general}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <HiOutlineEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center">
            <a href="#" className="text-xs text-red-500 hover:underline">Forgot password?</a>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={()=>navigate('/restaurant/create')}
                className="text-red-500 font-medium hover:underline"
              >
                Register Restaurant
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRestaurantPage;
