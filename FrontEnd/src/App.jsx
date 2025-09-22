import Login from './pages/Login/login.jsx'
import UserTypeSelection from './pages/Login/userTypeSelection.jsx'
import OTPVerification from './pages/Login/OTPVerification.jsx'
import { Dashboard } from './pages/Home/dashboard.jsx'
import RestaurantsPage from './pages/Restaurants/restaurantsPage.jsx'
import RestaurantDetailsPage from './pages/Restaurants/restaurantDetails.jsx'
import OrdersPage from './pages/Orders/currentOrders.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import CartPage from './pages/Cart/index.jsx'
import FavoritesPage from './pages/Favorites/index.jsx'
import Navbar from './components/Navbar/header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicRoute from './components/PublicRoute.jsx'
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx'

import LoginRestaurantPage from './pages/Login/restaurantLogin.jsx'
import RestaurantSignupPage from './pages/Login/restaurantSignup.jsx'
import RestaurantProfilePage from './pages/Restaurant/ProfileRestaurant.jsx'
import RestaurantDashboard from './pages/Restaurant/Dashboard.jsx'
import RestaurantOrders from './pages/Restaurant/Orders.jsx'
import RestaurantMenu from './pages/Restaurant/Menu.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useDataSync } from './hooks/useDataSync.js';


const Layout = () => {
  useDataSync();
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <Toaster position="bottom-right" />
        <Routes>

          <Route path="/select-login" element={
            <PublicRoute>
              <UserTypeSelection />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/restaurant/create" element={
            <PublicRoute>
              <RestaurantSignupPage />
            </PublicRoute>
          } />

          <Route path="/restaurant/login" element={
            <PublicRoute>
              <LoginRestaurantPage />
            </PublicRoute>
          } />
          <Route path="/verify-otp" element={
            <PublicRoute>
              <OTPVerification />
            </PublicRoute>
          } />

          <Route path="/" element={
            <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
              <Layout />
            </RoleProtectedRoute>
          }>
            <Route index element={<Dashboard />} /> 
            <Route path="home" element={<Dashboard />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="restaurants/:id" element={<RestaurantDetailsPage />} />
            <Route path="my-orders/current" element={<OrdersPage/>} />
            <Route path="cart" element={<CartPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>


          <Route path="/restaurant" element={
            <RoleProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
              <Layout />
            </RoleProtectedRoute>
          }>
            <Route path="dashboard" element={<RestaurantDashboard />} />
            <Route path="orders" element={<RestaurantOrders />} />
            <Route path="menu" element={<RestaurantMenu />} />
            <Route path="my-profile" element={<RestaurantProfilePage />} />
          </Route>
          

          <Route path="*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
