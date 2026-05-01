import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/pages/auth/Login"
import StaffDashboard from "@/pages/dashboard/StaffDashboard"
import Dashboard from "@/pages/dashboard/Dashboard"
import { ProtectedRoute } from "@/pages/auth/components/ProtectedRoute"
import { useAuthStore } from "@/pages/auth/stores/authStore"
import MainLayout from "@/layouts/MainLayout"
import { CategoriesList } from "@/pages/categories/components"

import { ProductsList } from "@/pages/products/components"
import Users from "@/pages/users/Users"
import OrdersPage from "@/pages/orders/index"
import RevenuesPage from "@/pages/revenues/index"

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<CategoriesList />} />

          <Route path="products" element={<ProductsList />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="revenues" element={<RevenuesPage />} />
        </Route>

        {/* STAFF only */}
        <Route
          path="/StaffDashboard"
          element={
            <ProtectedRoute roles={["STAFF"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffDashboard />} />
        </Route>

        <Route path="/unauthorized" element={<div>Không có quyền truy cập</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
