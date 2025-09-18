import AnimatedFoodAuth from './pages/Login/login.jsx'
import { Dashboard } from './pages/Home/dashboard.jsx'
import RestaurantsPage from './pages/Restaurants/restaurantsPage.jsx'
import RestaurantDetailsPage from './pages/Restaurants/restaurantDetails.jsx'
import CartPage from './pages/Cart/index.jsx'
import Navbar from './components/Navbar/header.jsx'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Layout component for pages with Navbar and Footer
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
      <Routes>
        {/* Login route without layout */}
        <Route path="/login" element={<AnimatedFoodAuth />} />
        
        {/* Routes with shared layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="home" element={<Dashboard />} />

          <Route path="restaurants" element={<RestaurantsPage/> } />
          <Route path="restaurants/:id" element={<RestaurantDetailsPage/>} />
          {/* Dynamic routes for specific items */}
          <Route path="cuisines" element={<></>} />
          <Route path="cuisines/:cuisineType" element={<></>} />
          
          <Route path="cart" element={<CartPage/> } />
          {/* Nested routes for restaurants with cuisine filter */}
          <Route path="restaurants/cuisine/:cuisineType" element={<></>} />
        </Route>
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Layout><Dashboard /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
