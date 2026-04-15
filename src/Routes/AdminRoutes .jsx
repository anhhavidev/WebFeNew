import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./PrivateAdmin";
import Dashboard from "../layout1/Dashboard";
import PrivateAdmin from "./PrivateAdmin";
import Overview from "../Admin/Overview";
import ManagerDonHang from "../Admin/ManagerDonHang";
import ProductManagement from "../Admin/ProductManagement";
import AdminOrderDetail from "../Admin/AdminOrderDetail";
import UserManagement from "../Admin/UserManagement";
import ManagerCategory from "../Admin/ManagerCategory";
import AiInsights from "../Admin/AiInsights";
import UserProfile from "../Admin/UserProfile";
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/dashboard" element={<PrivateAdmin><Dashboard /></PrivateAdmin>}> // routes cha 
        <Route index element={<Overview />} />                      // Mặc định khi vao 
        <Route path="products" element={<ProductManagement />} />         // /admin/dashboard/products
        <Route path="orders" element={<ManagerDonHang />} />           
        <Route path="order/:orderId" element={<AdminOrderDetail />} />
        <Route path="users" element={<UserManagement></UserManagement>}></Route>
         <Route path="category" element={<ManagerCategory></ManagerCategory>}></Route>
         <Route path="ai-insights" element={<AiInsights />} />
         <Route path="profile" element={<UserProfile />} />
      </Route>
      <Route path="/admin/profile" element={<Navigate to="/admin/dashboard/profile" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
