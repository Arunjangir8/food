import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { restaurantAPI, menuAPI } from '../../services/api.js';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineSave,
  HiOutlinePhotograph
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const RestaurantMenu = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    isVeg: true,
    isAvailable: true,
    customizations: {}
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Get my restaurant
        const restaurantRes = await restaurantAPI.getMyRestaurant();
        const userRestaurant = restaurantRes.data.data.restaurant;
        
        setRestaurant(userRestaurant);

        // Get menu
        const menuRes = await menuAPI.getByRestaurant(userRestaurant.id);
        setMenuCategories(menuRes.data.data.menuCategories || []);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        toast.error('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMenuData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'customizations') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      if (editingItem) {
        // Update existing item
        await menuAPI.updateItem(editingItem.id, submitData);
        toast.success('Menu item updated successfully');
      } else {
        // Create new item
        await menuAPI.createItem(submitData);
        toast.success('Menu item created successfully');
      }
      
      // Refresh menu data
      const menuRes = await menuAPI.getByRestaurant(restaurant.id);
      setMenuCategories(menuRes.data.data.menuCategories || []);
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        categoryId: '',
        name: '',
        description: '',
        price: '',
        isVeg: true,
        isAvailable: true,
        customizations: {}
      });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      customizations: item.customizations || {}
    });
    setImagePreview(item.image || null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await menuAPI.deleteItem(itemId);
      toast.success('Menu item deleted successfully');
      
      // Refresh menu data
      const menuRes = await menuAPI.getByRestaurant(restaurant.id);
      setMenuCategories(menuRes.data.data.menuCategories || []);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      categoryId: menuCategories[0]?.id || '',
      name: '',
      description: '',
      price: '',
      isVeg: true,
      isAvailable: true,
      customizations: {}
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pt-24 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
            <p className="text-gray-600 mt-2">
              Manage menu items for {restaurant?.name || 'your restaurant'}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>

        {menuCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No menu categories found. Please add categories first.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {menuCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  {category.description && (
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                
                <div className="p-6">
                  {category.items?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No items in this category</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items?.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <HiOutlinePencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Category</option>
                    {menuCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-gray-200"
                    >
                      <HiOutlinePhotograph className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-700">Choose Image</span>
                    </label>
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isVeg"
                      checked={formData.isVeg}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <HiOutlineSave className="w-4 h-4" />
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;