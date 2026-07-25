import React from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routePaths";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

export default PrivateRoute;
