import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineOfficeBuilding } from 'react-icons/hi';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FoodieZone</h1>
          <p className="text-gray-600">Choose how you want to continue</p>
        </div>

        <div className="space-y-4">
          {/* Customer Login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border-2 border-transparent hover:border-red-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <HiOutlineUser className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">I'm a Customer</h3>
                <p className="text-gray-600 text-sm">Order food from restaurants</p>
              </div>
            </div>
          </button>

          {/* Restaurant Login */}
          <button
            onClick={() => navigate('/restaurant/login')}
            className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border-2 border-transparent hover:border-orange-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <HiOutlineOfficeBuilding className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">I'm a Restaurant Owner</h3>
                <p className="text-gray-600 text-sm">Manage my restaurant</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            New restaurant owner?{' '}
            <button
              onClick={() => navigate('/restaurant/create')}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Register your restaurant
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;