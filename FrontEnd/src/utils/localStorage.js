import { userAPI } from '../services/api.js';

// localStorage utility functions for cart and favorites with API sync
export const localStorageUtils = {
  // Cart functions
  getCart: () => {
    try {
      const cart = localStorage.getItem('foodCart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart from localStorage:', error);
      return [];
    }
  },

  saveCart: (cart) => {
    try {
      localStorage.setItem('foodCart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  addToCart: async (item, syncWithAPI = true) => {
    const cart = localStorageUtils.getCart();
    const existingItem = cart.find(cartItem => 
      cartItem.itemId === item.itemId && 
      JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations)
    );

    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      cart.push({
        id: Date.now() + Math.random(),
        ...item,
        quantity: item.quantity || 1,
        addedAt: new Date().toISOString()
      });
    }

    localStorageUtils.saveCart(cart);
    
    // Sync with API if user is logged in
    if (syncWithAPI) {
      try {
        await userAPI.addToCart({
          menuItemId: item.itemId,
          quantity: item.quantity || 1,
          customizations: item.customizations || {}
        });
      } catch (error) {
        console.warn('Failed to sync cart with API:', error);
      }
    }
    
    return cart;
  },

  updateCartItem: (itemId, updates) => {
    const cart = localStorageUtils.getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      cart[itemIndex] = { ...cart[itemIndex], ...updates };
      localStorageUtils.saveCart(cart);
    }
    
    return cart;
  },

  removeFromCart: async (itemId, syncWithAPI = true) => {
    const cart = localStorageUtils.getCart().filter(item => item.id !== itemId);
    localStorageUtils.saveCart(cart);
    
    // Sync with API if user is logged in
    if (syncWithAPI) {
      try {
        await userAPI.removeFromCart(itemId);
      } catch (error) {
        console.warn('Failed to sync cart removal with API:', error);
      }
    }
    
    return cart;
  },

  clearCart: async (syncWithAPI = true) => {
    localStorage.removeItem('foodCart');
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Sync with API if user is logged in
    if (syncWithAPI) {
      try {
        await userAPI.clearCart();
      } catch (error) {
        console.warn('Failed to sync cart clear with API:', error);
      }
    }
  },

  // Favorites functions
  getFavorites: () => {
    try {
      const favorites = localStorage.getItem('foodFavorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites from localStorage:', error);
      return [];
    }
  },

  saveFavorites: (favorites) => {
    try {
      localStorage.setItem('foodFavorites', JSON.stringify(favorites));
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  },

  addToFavorites: async (item, syncWithAPI = true) => {
    const favorites = localStorageUtils.getFavorites();
    const exists = favorites.find(fav => fav.itemId === item.itemId);
    
    if (!exists) {
      favorites.push({
        id: Date.now() + Math.random(),
        ...item,
        addedAt: new Date().toISOString()
      });
      localStorageUtils.saveFavorites(favorites);
      
      // Sync with API if user is logged in
      if (syncWithAPI) {
        try {
          await userAPI.addToFavorites({
            menuItemId: item.itemId,
            type: 'MENU_ITEM'
          });
        } catch (error) {
          console.warn('Failed to sync favorite with API:', error);
        }
      }
    }
    
    return favorites;
  },

  removeFromFavorites: async (itemId, syncWithAPI = true) => {
    const favorites = localStorageUtils.getFavorites().filter(item => item.itemId !== itemId);
    localStorageUtils.saveFavorites(favorites);
    
    // Sync with API if user is logged in
    if (syncWithAPI) {
      try {
        // Find the favorite ID from API and remove it
        const response = await userAPI.getFavorites();
        const favorite = response.data.data.favorites.find(fav => fav.menuItemId === itemId);
        if (favorite) {
          await userAPI.removeFromFavorites(favorite.id);
        }
      } catch (error) {
        console.warn('Failed to sync favorite removal with API:', error);
      }
    }
    
    return favorites;
  },

  // Sync functions - only called when needed (cart page, checkout)
  syncCartWithDB: async (userAPI) => {
    try {
      const localCart = localStorageUtils.getCart();
      if (localCart.length === 0) return [];

      // Get fresh data from DB only for cart items
      const response = await userAPI.getCart();
      const dbCart = response.data.data.cartItems;
      
      // Merge local and DB data, prioritizing DB for accuracy
      const syncedCart = localCart.map(localItem => {
        const dbItem = dbCart.find(item => item.menuItem.id === localItem.itemId);
        if (dbItem) {
          return {
            ...localItem,
            price: dbItem.menuItem.price,
            name: dbItem.menuItem.name,
            image: dbItem.menuItem.image,
            restaurantName: dbItem.menuItem.category.restaurant.name
          };
        }
        return localItem;
      });

      return syncedCart;
    } catch (error) {
      console.error('Error syncing cart with DB:', error);
      return localStorageUtils.getCart();
    }
  },

  // Load data from API and merge with localStorage
  loadFromAPI: async () => {
    try {
      const [cartResponse, favoritesResponse] = await Promise.all([
        userAPI.getCart(),
        userAPI.getFavorites()
      ]);

      // Merge API data with localStorage
      const apiCart = cartResponse.data.data.cartItems || [];
      const apiFavorites = favoritesResponse.data.data.favorites || [];

      // Convert API format to localStorage format
      const localCart = apiCart.map(item => ({
        id: item.id,
        itemId: item.menuItemId,
        restaurantId: item.menuItem.category.restaurantId,
        restaurantName: item.menuItem.category.restaurant.name,
        name: item.menuItem.name,
        price: item.menuItem.price,
        customizations: item.customizations || {},
        customizationPrice: 0,
        totalPrice: item.menuItem.price,
        image: item.menuItem.image || '🍕',
        quantity: item.quantity
      }));

      const localFavorites = apiFavorites
        .filter(fav => fav.type === 'MENU_ITEM' && fav.menuItem)
        .map(fav => ({
          id: fav.id,
          itemId: fav.menuItemId,
          restaurantId: fav.menuItem.category.restaurantId,
          restaurantName: fav.menuItem.category.restaurant.name,
          name: fav.menuItem.name,
          price: fav.menuItem.price,
          description: fav.menuItem.description,
          image: fav.menuItem.image || '🍕',
          category: fav.menuItem.category.name,
          dietaryType: fav.menuItem.isVeg ? 'Veg' : 'Non-Veg',
          popular: fav.menuItem.isPopular,
          customizations: fav.menuItem.customizations || {},
          addedAt: fav.createdAt
        }));

      // Update localStorage
      localStorageUtils.saveCart(localCart);
      localStorageUtils.saveFavorites(localFavorites);

      return { cart: localCart, favorites: localFavorites };
    } catch (error) {
      console.warn('Failed to load data from API:', error);
      return {
        cart: localStorageUtils.getCart(),
        favorites: localStorageUtils.getFavorites()
      };
    }
  }
};