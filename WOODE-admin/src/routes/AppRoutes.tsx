import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "@/pages/auth/Login"
import { ProtectedRoute } from "@/pages/auth/components"
import StaffDashboard from "@/pages/dashboard/StaffDashboard"
import { CategoriesList } from "@/pages/categories/components"

import { ProductsList } from "@/pages/products/components"
import MainLayout from "@/layouts/MainLayout"
import Users from "@/pages/users/Users"
import OrdersPage from "@/pages/orders/index"
import RevenuesPage from "@/pages/revenues/index"
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
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
          {/* <Route index element={<Dashboard />} /> */}
          <Route path="categories" element={<CategoriesList />} />

          <Route path="products" element={<ProductsList />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="revenues" element={<RevenuesPage />} />
        </Route>

        {/* STAFF routes */}
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
      </Routes>
    </BrowserRouter>
  )
}