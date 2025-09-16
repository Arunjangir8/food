import AnimatedFoodAuth from './pages/login.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AnimatedFoodAuth />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
