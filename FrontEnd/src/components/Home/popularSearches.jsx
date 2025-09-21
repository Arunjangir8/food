import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineLocationMarker,
  HiStar,
  HiOutlineClock,
  HiOutlineFire,
  HiChevronRight,
  HiOutlineTruck,
  HiOutlineHeart,
  HiOutlineSparkles,
  HiOutlineLightBulb
} from 'react-icons/hi';

const PopularSearches = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('Mumbai');
  const [animatedCards, setAnimatedCards] = useState([]);

  // Sample locations
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'
  ];

  // Food categories data based on location
  const foodCategories = {
    Mumbai: [
      {
        id: 1,
        name: 'Vada Pav',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
        description: 'Mumbai\'s signature street food',
        restaurants: 45,
        avgDelivery: '15-20 mins',
        rating: 4.6,
        trending: true
      },
      {
        id: 2,
        name: 'Pav Bhaji',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&h=200&fit=crop',
        description: 'Spicy vegetable curry with bread',
        restaurants: 38,
        avgDelivery: '20-25 mins',
        rating: 4.5,
        trending: true
      },
      {
        id: 3,
        name: 'Biryani',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d51b?w=300&h=200&fit=crop',
        description: 'Aromatic rice dish with spices',
        restaurants: 52,
        avgDelivery: '25-30 mins',
        rating: 4.7,
        trending: false
      },
      {
        id: 4,
        name: 'Chinese',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=200&fit=crop',
        description: 'Indo-Chinese fusion cuisine',
        restaurants: 29,
        avgDelivery: '20-25 mins',
        rating: 4.4,
        trending: false
      },
      {
        id: 5,
        name: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        description: 'Italian classic with Indian twist',
        restaurants: 35,
        avgDelivery: '25-30 mins',
        rating: 4.5,
        trending: false
      },
      {
        id: 6,
        name: 'South Indian',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
        description: 'Dosa, Idli and more',
        restaurants: 41,
        avgDelivery: '15-20 mins',
        rating: 4.6,
        trending: false
      }
    ],
    Delhi: [
      {
        id: 1,
        name: 'Chole Bhature',
        image: 'https://images.unsplash.com/photo-1626132647523-66f0bf380027?w=300&h=200&fit=crop',
        description: 'Delhi\'s favorite breakfast',
        restaurants: 42,
        avgDelivery: '18-22 mins',
        rating: 4.7,
        trending: true
      },
      {
        id: 2,
        name: 'Butter Chicken',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop',
        description: 'Creamy chicken curry',
        restaurants: 56,
        avgDelivery: '25-30 mins',
        rating: 4.8,
        trending: true
      },
      {
        id: 3,
        name: 'Kebabs',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop',
        description: 'Grilled meat delicacies',
        restaurants: 33,
        avgDelivery: '20-25 mins',
        rating: 4.5,
        trending: false
      },
      {
        id: 4,
        name: 'Momos',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=200&fit=crop',
        description: 'Steamed dumplings',
        restaurants: 28,
        avgDelivery: '15-20 mins',
        rating: 4.4,
        trending: false
      },
      {
        id: 5,
        name: 'Kulfi',
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=200&fit=crop',
        description: 'Traditional Indian ice cream',
        restaurants: 18,
        avgDelivery: '20-25 mins',
        rating: 4.6,
        trending: false
      },
      {
        id: 6,
        name: 'Paratha',
        image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=300&h=200&fit=crop',
        description: 'Stuffed Indian bread',
        restaurants: 39,
        avgDelivery: '18-22 mins',
        rating: 4.5,
        trending: false
      }
    ],
    Bangalore: [
      {
        id: 1,
        name: 'Masala Dosa',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
        description: 'Crispy rice pancake',
        restaurants: 48,
        avgDelivery: '15-20 mins',
        rating: 4.7,
        trending: true
      },
      {
        id: 2,
        name: 'Filter Coffee',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop',
        description: 'South Indian coffee',
        restaurants: 34,
        avgDelivery: '10-15 mins',
        rating: 4.8,
        trending: true
      }
    ]
  };

  // Animation effect for cards
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedCards(foodCategories[selectedLocation]?.map(item => item.id) || []);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedLocation]);

  const handleCategoryClick = (category) => {
    // Navigate to cuisines section with the selected category
    navigate('/home#cuisines', { state: { selectedCuisine: category.name } });
  };

  const currentCategories = foodCategories[selectedLocation] || [];

  return (
    <section className="w-full bg-white-to-br lg:px-10 from-red-50 via-white-50 to-yellow-50 pt-24 lg:min-h-screen relative overflow-hidden" id="popular-searches">
      {/* Floating Animated Icons - Better positioned */}
      <div className="absolute top-16 left-10 animate-bounce">
        <div className="bg-orange-500 text-white p-3 rounded-full shadow-lg">
          <HiOutlineTruck className="w-5 h-5" />
        </div>
      </div>
      
      <div className="absolute top-32 right-16 animate-bounce delay-700">
        <div className="bg-pink-500 text-white p-3 rounded-full shadow-lg">
          <HiOutlineHeart className="w-5 h-5" />
        </div>
      </div>
      
      {/* <div className="absolute bottom-36 left-24 animate-bounce delay-1000">
        <div className="bg-purple-500 text-white p-3 rounded-full shadow-lg">
          <HiOutlineSparkles className="w-5 h-5" />
        </div>
      </div> */}
      
      <div className="absolute bottom-60 right-12 animate-bounce delay-500">
        <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
          <HiOutlineLightBulb className="w-4 h-4" />
        </div>
      </div>

      <div className="h-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-16">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-6">
            Popular Dishes in 
            <span className="text-red-600"> {selectedLocation}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Discover the most loved local delicacies and trending cuisines in your area
          </p>

          {/* Location Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedLocation === location
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:shadow-md hover:bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HiOutlineLocationMarker className="w-5 h-5" />
                  <span>{location}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Food Categories Grid - Horizontal Cards */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {currentCategories.map((category, index) => (
              <div
                key={category.id}
                className={`relative group cursor-pointer transform transition-all duration-500 hover:-translate-y-1 ${
                  animatedCards.includes(category.id) 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onClick={() => handleCategoryClick(category)}
              >
                {/* Horizontal Card Layout */}
                <div className="relative bg-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-row h-40 border border-gray-100">
                  
                  {/* Left Side - Image */}
                  <div className="relative w-40 h-full flex-shrink-0">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-l-md"
                    />
                    
                    {/* Trending Badge */}
                    {category.trending && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-2 py-1 flex items-center space-x-1 text-xs font-medium">
                        <HiOutlineFire className="w-3 h-3" />
                        <span>Hot</span>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    {/* Category Name and Description */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <HiStar className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-800">{parseFloat(category.rating).toFixed(1)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-gray-500">
                          <HiOutlineClock className="w-4 h-4" />
                          <span>{category.avgDelivery}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-gray-500 text-xs block">Restaurants</span>
                        <span className="font-bold text-red-600">{category.restaurants}+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/home#cuisines')}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 inline-flex items-center"
          >
            <span className="text-lg">Explore All Cuisines</span>
            <HiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularSearches;
