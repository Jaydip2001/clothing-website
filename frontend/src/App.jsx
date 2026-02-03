import { Routes, Route } from "react-router-dom"

// user pages
import Home from "./pages/Home"
import Products from "./pages/Products"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminCategories from "./admin/AdminCategories"
// admin pages
import AdminLogin from "./admin/AdminLogin"
import AdminRegister from "./admin/AdminRegister"
import AdminDashboard from "./admin/AdminDashboard"
import AdminProducts from "./admin/AdminProducts"
import AdminOrders from "./admin/AdminOrders"
import AdminReviews from "./admin/AdminReviews"

function App() {
  return (
    <Routes>
      {/* USER ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/orders" element={<AdminOrders />} />

<Route path="/admin/reviews" element={<AdminReviews />} />

    </Routes>
  )
}

export default App
