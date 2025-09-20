# Quick Setup Guide

## Issues Fixed:
1. ✅ **API Port Mismatch**: Changed from 3001 to 5000
2. ✅ **Restaurant Loading**: Now shows mock data by default, API optional
3. ✅ **Address Issue**: Added mock address fallback for testing

## To Start the Application:

### 1. Backend Setup (Optional - Frontend works with mock data)
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your database URL and API keys
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### 2. Frontend Setup
```bash
cd FrontEnd
npm install
npm run dev
```

## Current Status:
- **Frontend**: ✅ Working with mock data
- **Restaurants Page**: ✅ Shows mock restaurants
- **Cart**: ✅ Works with mock address
- **Backend**: ⚠️ Optional (frontend has fallbacks)

## Test Credentials (if backend is running):
- **Customer**: customer@example.com / password123
- **Restaurant Owner**: owner@pizzapalace.com / password123

## Quick Test:
1. Open http://localhost:5173
2. Go to Restaurants page - should show mock restaurants
3. Add items to cart
4. Proceed to checkout - should work with mock address

The app now works even without the backend running!