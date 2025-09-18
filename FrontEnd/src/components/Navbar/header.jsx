import React, { useState, useEffect } from 'react';
import { 
  HiOutlineMenuAlt3, 
  HiX, 
  HiOutlineLocationMarker,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineHeart,
  HiChevronDown
} from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Restaurants', href: '#restaurants' },
    { name: 'Cuisines', href: '#cuisines' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <div>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mb-8 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white'
      }`}>
        
        {/* Container with max width for large screens */}
        <div className="max-w-[100%] mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-16 lg:h-20">
            
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl lg:text-3xl font-bold text-red-500 hover:text-red-600 transition-colors duration-200">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  FoodieZone
                </span>
              </div>
            </div>

            {/* Desktop Center Section - Location */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-700 hover:text-red-500 cursor-pointer transition-colors duration-200 px-6 py-3 rounded-lg hover:bg-red-50">
                <HiOutlineLocationMarker className="w-5 h-5 text-red-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Deliver to</span>
                  <span className="text-sm font-semibold flex items-center">
                    Current Location
                    <HiChevronDown className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-red-500 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <button className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 relative">
                  <HiOutlineHeart className="w-5 h-5" />
                </button>
                
                <button className="relative p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    2
                  </span>
                </button>
                
                <div className="w-px h-6 bg-gray-200 mx-3"></div>
                
                <button className="flex items-center space-x-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                  <HiOutlineUser className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden">
                <button
                  onClick={toggleMenu}
                  className="p-2.5 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <div className="relative w-6 h-6">
                    <HiOutlineMenuAlt3 
                      className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                        isOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                      }`} 
                    />
                    <HiX 
                      className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                        isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                      }`} 
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={toggleMenu}
        ></div>
        
        {/* Mobile Menu Panel */}
        <div className={`absolute top-16 left-0 right-0 bg-white shadow-2xl transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          
          {/* Location - Mobile */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3 text-gray-700">
              <HiOutlineLocationMarker className="w-5 h-5 text-red-500" />
              <div>
                <span className="text-xs text-gray-500 block">Deliver to</span>
                <span className="text-sm font-semibold text-red-500 flex items-center">
                  Current Location
                  <HiChevronDown className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Mobile */}
          <div className="py-2">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={toggleMenu}
                className={`flex items-center px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200 transform border-b border-gray-50 ${
                  isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <span className="font-medium text-base">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Action Buttons - Mobile */}
          <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50">
            <button className="flex items-center justify-center w-full space-x-3 px-4 py-4 border border-gray-200 rounded-xl hover:bg-white transition-all duration-200 font-medium">
              <HiOutlineHeart className="w-5 h-5 text-gray-600" />
              <span>Favorites</span>
            </button>
            <button className="flex items-center justify-center w-full space-x-3 px-4 py-4 border border-gray-200 rounded-xl hover:bg-white transition-all duration-200 font-medium">
              <HiOutlineShoppingCart className="w-5 h-5 text-gray-600" />
              <span>Cart</span>
              <span className="bg-red-500 text-white text-xs rounded-full px-2.5 py-1 font-semibold">2</span>
            </button>
            <button className="flex items-center justify-center w-full space-x-3 px-4 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-md">
              <HiOutlineUser className="w-5 h-5" />
              <span>Login / Sign Up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
