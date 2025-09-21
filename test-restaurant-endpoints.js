const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test restaurant-specific endpoints
async function testRestaurantEndpoints() {
  try {
    console.log('Testing restaurant-specific endpoints...\n');

    // You'll need to replace this with a valid restaurant owner token
    const token = 'YOUR_RESTAURANT_OWNER_TOKEN_HERE';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get my restaurant
    console.log('1. Testing GET /restaurants/my-restaurant');
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/my-restaurant`, { headers });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Get restaurant orders
    console.log('\n2. Testing GET /orders/restaurant/orders');
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/restaurant/orders`, { headers });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n✨ Testing complete!');
    console.log('\nTo test these endpoints properly:');
    console.log('1. Start your backend server: npm run dev');
    console.log('2. Login as a restaurant owner to get a valid token');
    console.log('3. Replace YOUR_RESTAURANT_OWNER_TOKEN_HERE with the actual token');
    console.log('4. Run this script again: node test-restaurant-endpoints.js');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRestaurantEndpoints();