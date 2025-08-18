import React from "react";
import { Routes, Route } from "react-router-dom";


import Home from "../Pages/Common/Home";
import Login from "../Pages/Common/Login";
import Register from "../Pages/Common/Resgister";
import ForgotPassword from "../Pages/Common/ForgotPassword";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Trang mặc định */}
      <Route path="/" element= {<Home/>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

    </Routes>
  );
};

export default PublicRoutes;
