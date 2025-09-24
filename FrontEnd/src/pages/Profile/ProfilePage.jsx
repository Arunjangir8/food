import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { userAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePhotograph,
  HiTrash,
  HiPlus
} from 'react-icons/hi';

// Profile utilities for localStorage management
const profileUtils = {
  getProfile: () => {
    try {
      const profile = localStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting profile from localStorage:', error);
      return null;
    }
  },

  saveProfile: (profile) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  },

  getAddresses: () => {
    try {
      const addresses = localStorage.getItem('userAddresses');
      return addresses ? JSON.parse(addresses) : [
        {
          id: 1,
          type: 'Home',
          address: '123 Main Street, Apartment 4B',
          city: 'Delhi',
          pincode: '110001',
          isDefault: true
        },
        {
          id: 2,
          type: 'Office',
          address: '456 Business District, Floor 12',
          city: 'Delhi',
          pincode: '110019',
          isDefault: false
        }
      ];
    } catch (error) {
      console.error('Error getting addresses from localStorage:', error);
      return [];
    }
  },

  saveAddresses: (addresses) => {
    try {
      localStorage.setItem('userAddresses', JSON.stringify(addresses));
    } catch (error) {
      console.error('Error saving addresses to localStorage:', error);
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : {
        notifications: {
          orderUpdates: true,
          promotions: true,
          newRestaurants: false,
          weeklyDigest: true
        },
        privacy: {
          profileVisibility: 'private',
          locationSharing: true,
          activityTracking: true
        },
        preferences: {
          language: 'en',
          currency: 'INR',
          theme: 'light'
        }
      };
    } catch (error) {
      console.error('Error getting settings from localStorage:', error);
      return {};
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || null,
    dateJoined: user?.createdAt || '2024-01-15',
    totalOrders: 0,
    favoriteRestaurants: 0,
    points: 0
  });

  const [editProfile, setEditProfile] = useState(profile);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    address: '',
    city: 'Delhi',
    pincode: '',
    isDefault: false
  });

  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: true,
      newRestaurants: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'private',
      locationSharing: true,
      activityTracking: true
    },
    preferences: {
      language: 'en',
      currency: 'INR',
      theme: 'light'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes] = await Promise.all([
          userAPI.getProfile()
        ]);
        
        const userProfile = {
          ...profileRes.data.data.user,
          dateJoined: profileRes.data.data.user.createdAt,
          totalOrders: 0,
          favoriteRestaurants: 0,
          points: 0
        };
        
        setProfile(userProfile);
        setEditProfile(userProfile);
        setAddresses(profileRes.data.data.user.addresses || []);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (user) {
          const userProfile = {
            name: user.name || 'User',
            email: user.email || '',
            phone: user.phone || '',
            avatar: user.avatar || null,
            dateJoined: user.createdAt || '2024-01-15',
            totalOrders: 0,
            favoriteRestaurants: 0,
            points: 0
          };
          setProfile(userProfile);
          setEditProfile(userProfile);
        }
        
        const savedAddresses = profileUtils.getAddresses();
        setAddresses(savedAddresses);
      }
    };
    
    const savedSettings = profileUtils.getSettings();
    setSettings(savedSettings);
    
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Address management functions
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: 'Home',
      address: '',
      city: 'Delhi',
      pincode: '',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm('Are you sure you want to delete this address?');
    if (confirmed) {
      try {
        await userAPI.deleteAddress(addressId);
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        setAddresses(updatedAddresses);
        toast.success('Address deleted successfully!');
      } catch (error) {
        console.error('Failed to delete address:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete address. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
    profileUtils.saveAddresses(updatedAddresses);
    toast.success('Default address updated successfully!');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    if (!addressForm.address.trim() || !addressForm.pincode.trim()) {
      toast.error('Please fill in all required fields!');
      return;
    }

    try {
      if (editingAddress) {
        const response = await userAPI.updateAddress(editingAddress.id, addressForm);
        const updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id ? response.data.data.address : addr
        );
        setAddresses(updatedAddresses);
      } else {
        const response = await userAPI.addAddress(addressForm);
        setAddresses([...addresses, response.data.data.address]);
      }
      
      setShowAddressModal(false);
      toast.success(`Address ${editingAddress ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Failed to save address:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save address. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('name', editProfile.name);
      formData.append('phone', editProfile.phone || '');
      
      if (editProfile.avatarFile) {
        formData.append('avatar', editProfile.avatarFile);
      }
      
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data.data.user;
      setProfile(updatedUser);
      setEditProfile(updatedUser);
      profileUtils.saveProfile(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleSettingsChange = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
    profileUtils.saveSettings(newSettings);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newProfile = { ...editProfile, avatar: e.target.result, avatarFile: file };
        setEditProfile(newProfile);
        if (!isEditing) {
          handleSaveAvatar(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('name', profile.name);
      formData.append('phone', profile.phone || '');
      
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data.data.user;
      setProfile(updatedUser);
      setEditProfile(updatedUser);
      profileUtils.saveProfile(updatedUser);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update avatar. Please try again.';
      toast.error(errorMessage);
    }
  };


  const SidebarButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md font-medium transition-all duration-200 text-left ${
        isActive
          ? 'bg-red-500 text-white shadow-md'
          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <HiOutlineArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-red-400 to-orange-400 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <HiOutlineUser className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-md shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-200">
                  <HiOutlinePhotograph className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                <p className="text-gray-600 mb-3">{profile.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">Member since {new Date(profile.dateJoined).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                  })}</span>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full">{profile.points} points</span>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:flex lg:justify-end">
              <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                <div className="text-center p-3 bg-red-50 rounded-md border border-red-100">
                  <div className="text-xl font-bold text-red-600">{profile.totalOrders}</div>
                  <div className="text-xs text-red-500">Orders</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-md border border-orange-100">
                  <div className="text-xl font-bold text-orange-600">{profile.favoriteRestaurants}</div>
                  <div className="text-xs text-orange-500">Favorites</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-md border border-yellow-100">
                  <div className="text-xl font-bold text-yellow-600">{profile.points}</div>
                  <div className="text-xs text-yellow-500">Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-4 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">Account</h3>
              <div className="space-y-2">
                <SidebarButton
                  id="profile"
                  label="Profile"
                  icon={<HiOutlineUser className="w-5 h-5" />}
                  isActive={activeTab === 'profile'}
                  onClick={setActiveTab}
                />
                <SidebarButton
                  id="addresses"
                  label="Addresses"
                  icon={<HiOutlineLocationMarker className="w-5 h-5" />}
                  isActive={activeTab === 'addresses'}
                  onClick={setActiveTab}
                />
                <SidebarButton
                  id="settings"
                  label="Settings"
                  icon={<HiOutlineCog className="w-5 h-5" />}
                  isActive={activeTab === 'settings'}
                  onClick={setActiveTab}
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={isEditing ? editProfile.name : profile.name}
                        onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={isEditing ? editProfile.email : profile.email}
                        onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={isEditing ? editProfile.phone : profile.phone}
                        onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                      <input
                        type="text"
                        value={new Date(profile.dateJoined).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center space-x-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineCheck className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium transition-colors duration-200"
                      >
                        <HiOutlineX className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Change Password Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <HiOutlineLockClosed className="w-5 h-5" />
                    <span>Change Password</span>
                  </button>

                  {showChangePassword && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-md">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isChangingPassword ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Updating...</span>
                              </>
                            ) : (
                              <span>Update Password</span>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowChangePassword(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                            }}
                            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Addresses Tab Content */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Delivery Addresses</h3>
                  <button
                    onClick={handleAddAddress}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                  >
                    <HiPlus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <HiOutlineLocationMarker className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{address.type}</h4>
                              {address.isDefault && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                            <p className="text-gray-500 text-sm">{address.city} - {address.pincode}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors duration-200"
                        >
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="flex-1 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab Content */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Settings</h3>
                
                <div className="space-y-6">
                  {/* Notifications Settings */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <HiOutlineBell className="w-5 h-5 mr-2 text-red-500" />
                      Notifications
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {key === 'orderUpdates' && 'Get notified about order status changes'}
                              {key === 'promotions' && 'Receive promotional offers and discounts'}
                              {key === 'newRestaurants' && 'Get notified when new restaurants join'}
                              {key === 'weeklyDigest' && 'Weekly summary of your orders and activity'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleSettingsChange('notifications', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <HiOutlineLockClosed className="w-5 h-5 mr-2 text-red-500" />
                      Privacy
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(settings.privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {key === 'profileVisibility' && 'Control who can see your profile information'}
                              {key === 'locationSharing' && 'Share location for better delivery experience'}
                              {key === 'activityTracking' && 'Allow tracking for personalized recommendations'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleSettingsChange('privacy', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <HiOutlineCog className="w-5 h-5 mr-2 text-red-500" />
                      Preferences
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) => handleSettingsChange('preferences', 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिन्दी</option>
                          <option value="ta">தமிழ்</option>
                          <option value="te">తెలుగు</option>
                        </select>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={settings.preferences.currency}
                          onChange={(e) => handleSettingsChange('preferences', 'currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="INR">₹ Indian Rupee</option>
                          <option value="USD">$ US Dollar</option>
                          <option value="EUR">€ Euro</option>
                        </select>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                          value={settings.preferences.theme}
                          onChange={(e) => handleSettingsChange('preferences', 'theme', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Type</label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                  placeholder="House/Flat/Office No., Street, Area"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-colors duration-200"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;