import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../Pages/Common/Home";
import Login from "../Pages/Common/Login";
import Register from "../Pages/Common/Register";
import ForgotPassword from "../Pages/Common/ForgotPassword";
import ActivateAccount from "../Pages/Common/ActivateAccount";
import ProductDetail from "../Pages/Common/ProductDetail";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default PublicRoutes;
