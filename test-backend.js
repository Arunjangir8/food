const axios = require('axios');

const testBackend = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test restaurants endpoint
    const restaurantsResponse = await axios.get('http://localhost:5000/api/restaurants');
    console.log('✅ Restaurants endpoint:', restaurantsResponse.data);
    
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  }
};

testBackend();