import React, { useState } from 'react';
import { 
  HiOutlineSearch, 
  HiOutlineLocationMarker,
  HiPlay,
  HiStar,
  HiOutlineClock,
  HiOutlineTruck
} from 'react-icons/hi';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    
      <section className="min-h-[100vh] relative px-10 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500"></div>
        </div>
        
        <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-none min-h-[80vh]">
            
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8 lg:pr-8">
              
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Discover the 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600"> Best Food </span>
                  & Dishes
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Explore restaurants, cuisines, and dishes from around your neighborhood. 
                  Fast delivery, fresh ingredients, unforgettable taste.
                </p>
              </div>

              {/* Search Section */}
              <div className="bg-white rounded-lg shadow-2xl p-2 max-w-2xl mx-auto lg:mx-0 border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-0">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for restaurant, cuisine or dish"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <HiOutlineSearch className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="w-full sm:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                  <HiOutlineTruck className="w-5 h-5" />
                  <span>Order Now</span>
                </button>
                
                <button className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-500 font-semibold rounded-md transition-all duration-200 flex items-center justify-center space-x-2 group">
                  <HiPlay className="w-5 h-5 group-hover:text-red-500" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Restaurants</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">50k+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">30min</div>
                  <div className="text-sm text-gray-600">Avg. Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Content - Food Images */}
            <div className="relative lg:pl-8">
              
              {/* Main Food Image Container */}
              <div className="relative">
                
                {/* Primary Food Image */}
                <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center">
                    <div className="text-6xl">🍕</div>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute -top-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-1 shadow-lg">
                    <HiStar className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-sm">4.8</span>
                  </div>
                  {/* Delivery Time Badge */}
                  <div className="absolute -bottom-4 -right-4 bg-white text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg border border-gray-100">
                    <HiOutlineClock className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-sm">25 mins</span>
                  </div>
                </div>

                {/* Secondary Food Images */}
                <div className="absolute -top-8 -right-8 z-0 bg-white rounded-2xl shadow-xl p-4 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-xl flex items-center justify-center">
                    <div className="text-2xl">🍔</div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 z-0 bg-white rounded-2xl shadow-xl p-4 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl flex items-center justify-center">
                    <div className="text-2xl">🍰</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 -left-12 animate-bounce">
                  <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <HiOutlineTruck className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute top-3/4 -right-12 animate-bounce delay-1000">
                  <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <HiStar className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
   
  );
};

export default Hero;