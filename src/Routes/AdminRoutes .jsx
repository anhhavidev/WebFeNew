import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "./PrivateAdmin";
import Dashboard from "../layout1/Dashboard";
import PrivateAdmin from "./PrivateAdmin";
import Overview from "../Admin/Overview";
import ManagerDonHang from "../Admin/ManagerDonHang";
import ProductManagement from "../Admin/ProductManagement";
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/dashboard" element={<PrivateAdmin><Dashboard /></PrivateAdmin>}>
        <Route index element={<Overview />} />                      // Mặc định
        <Route path="products" element={<ProductManagement />} />         // /admin/dashboard/products
        <Route path="orders" element={<ManagerDonHang />} />             // /admin/dashboard/orders
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
