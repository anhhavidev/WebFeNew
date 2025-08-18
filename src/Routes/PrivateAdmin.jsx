import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateAdmin = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    
    if (role !== "Admin") {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return <Navigate to="/login" replace />;
  }
};

export default PrivateAdmin;
