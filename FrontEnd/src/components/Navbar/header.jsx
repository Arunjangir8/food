import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // Import useAuth
import { 
  HiOutlineMenuAlt3, 
  HiX, 
  HiOutlineLocationMarker,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineHeart,
  HiChevronDown,
  HiOutlineLogout
} from 'react-icons/hi';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth(); // Use auth context
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

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

  // Load and listen to localStorage changes for cart and favorites
  useEffect(() => {
    const updateCounts = () => {
      try {
        // Update cart count
        const cart = JSON.parse(localStorage.getItem('foodCart') || '[]');
        const totalCartItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        setCartItemsCount(totalCartItems);

        // Update favorites count
        const favorites = JSON.parse(localStorage.getItem('foodFavorites') || '[]');
        setFavoritesCount(favorites.length);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        setCartItemsCount(0);
        setFavoritesCount(0);
      }
    };

    // Initial load
    updateCounts();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'foodCart' || e.key === 'foodFavorites') {
        updateCounts();
      }
    };

    // Listen for custom events for same-tab updates
    const handleCartUpdate = () => updateCounts();
    const handleFavoritesUpdate = () => updateCounts();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    // Alternative: Use a more frequent check (optional)
    const interval = setInterval(updateCounts, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
      clearInterval(interval);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/select-login');
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) return [];
    
    if (user?.role === 'CUSTOMER') {
      return [
        { name: 'Home', href: '/' },
        { name: 'Restaurants', href: '/restaurants' },
        { name: 'My Orders', href: '/my-orders/current' },
        { name: 'Profile', href: '/profile' }
      ];
    } else if (user?.role === 'RESTAURANT_OWNER') {
      return [
        { name: 'Dashboard', href: '/restaurant/dashboard' },
        { name: 'Orders', href: '/restaurant/orders' },
        { name: 'Menu', href: '/restaurant/menu' },
        { name: 'Profile', href: '/restaurant/my-profile' }
      ];
    }
    return [];
  };
  
  const navLinks = getNavLinks();

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
              <button 
                onClick={() => handleNavigation('/')}
                className="text-2xl lg:text-3xl font-bold text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  FoodieZone
                </span>
              </button>
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
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 relative group ${
                    location.pathname === link.href
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-700 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {link.name}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                {isAuthenticated && (
                  <>
                    {user?.role === 'CUSTOMER' && (
                      <>
                        <button 
                          onClick={() => handleNavigation('/favorites')}
                          className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 relative"
                          aria-label={`Favorites ${favoritesCount > 0 ? `(${favoritesCount} items)` : ''}`}
                        >
                          <HiOutlineHeart className="w-5 h-5" />
                          {favoritesCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                              {favoritesCount > 99 ? '99+' : favoritesCount}
                            </span>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => handleNavigation('/cart')}
                          className="relative p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                          aria-label={`Shopping cart ${cartItemsCount > 0 ? `(${cartItemsCount} items)` : ''}`}
                        >
                          <HiOutlineShoppingCart className="w-5 h-5" />
                          {cartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                              {cartItemsCount > 99 ? '99+' : cartItemsCount}
                            </span>
                          )}
                        </button>
                      </>
                    )}
                    
                    <div className="w-px h-6 bg-gray-200 mx-3"></div>
                  </>
                )}
                
                {/* User Profile / Login Section */}
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleNavigation(user?.role === 'CUSTOMER' ? '/profile' : '/restaurant/my-profile')}
                      className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                    >
                      <HiOutlineUser className="w-4 h-4" />
                      <span className="max-w-24 truncate">
                        {user?.name || 'Profile'}
                      </span>
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                      title="Logout"
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      <span className="hidden xl:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleNavigation('/select-login')}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <HiOutlineUser className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden">
                <button
                  onClick={toggleMenu}
                  className="p-2.5 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  aria-label="Toggle mobile menu"
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
          
          {/* User Info - Mobile */}
          {isAuthenticated && (
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
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
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className={`w-full text-left flex items-center px-6 py-4 hover:bg-red-50 hover:text-red-500 transition-all duration-200 transform border-b border-gray-50 ${
                  location.pathname === link.href
                    ? 'bg-red-50 text-red-500 font-semibold'
                    : 'text-gray-700'
                } ${
                  isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <span className="font-medium text-base">{link.name}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons - Mobile */}
          <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50">
            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <>
                    <button 
                      onClick={() => handleNavigation('/favorites')}
                      className="flex items-center justify-between w-full px-4 py-4 border border-gray-200 rounded-xl hover:bg-white transition-all duration-200 font-medium"
                    >
                      <div className="flex items-center space-x-3">
                        <HiOutlineHeart className="w-5 h-5 text-gray-600" />
                        <span>Favorites</span>
                      </div>
                      {favoritesCount > 0 && (
                        <span className="bg-pink-500 text-white text-xs rounded-full px-2.5 py-1 font-semibold">
                          {favoritesCount > 99 ? '99+' : favoritesCount}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => handleNavigation('/cart')}
                      className="flex items-center justify-between w-full px-4 py-4 border border-gray-200 rounded-xl hover:bg-white transition-all duration-200 font-medium"
                    >
                      <div className="flex items-center space-x-3">
                        <HiOutlineShoppingCart className="w-5 h-5 text-gray-600" />
                        <span>Cart</span>
                      </div>
                      {cartItemsCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2.5 py-1 font-semibold">
                          {cartItemsCount > 99 ? '99+' : cartItemsCount}
                        </span>
                      )}
                    </button>
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full space-x-3 px-4 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium shadow-md"
                >
                  <HiOutlineLogout className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleNavigation('/select-login')}
                className="flex items-center justify-center w-full space-x-3 px-4 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
              >
                <HiOutlineUser className="w-5 h-5" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
