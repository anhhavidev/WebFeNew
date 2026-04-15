import React from "react";
import { Routes, Route } from "react-router-dom";


import Home from "../Pages/Common/Home";
import Login from "../Pages/Common/Login";
import Register from "../Pages/Common/Resgister";
import ForgotPassword from "../Pages/Common/ForgotPassword";
import SellerOrders from "../Admin/SellerOrders";
import SellerProducts from "../Admin/SellerProducts";
import ActivateAccount from "../Pages/Common/ActivateAccount";
import ProductDetail from "../Pages/Common/ProductDetail";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Trang mặc định */}
      <Route path="/" element= {<Home/>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/seler" element={<SellerOrders />} />
         <Route path="/seler2" element={<SellerProducts />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  );
};

export default PublicRoutes;
