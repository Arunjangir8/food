import Login from './pages/Login/login.jsx'
import UserTypeSelection from './pages/Login/userTypeSelection.jsx'
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


import LoginRestaurantPage from './pages/Login/restaurantLogin.jsx'
import RestaurantSignupPage from './pages/Login/restaurantSignup.jsx'
import RestaurantProfilePage from './pages/Profile/ProfileRestaurant.jsx'


import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Layout component for pages with Navbar
const Layout = () => {
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
        <Routes>
          {/* Public routes - only accessible when NOT logged in */}
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
          {/* Protected routes - only accessible when logged in */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* User ROutes */}
            <Route index element={<Dashboard />} /> 
            <Route path="home" element={<Dashboard />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="restaurants/:id" element={<RestaurantDetailsPage />} />
            <Route path="my-orders/current" element={<OrdersPage/>} />
            <Route path="cart" element={<CartPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Restaurant Routes */}
            <Route path="restaurant/my-profile" element={<RestaurantProfilePage />} />
          </Route>
          
          {/* Catch all route - redirect to user type selection */}
          <Route path="*" element={
            <PublicRoute>
              <UserTypeSelection />
            </PublicRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
