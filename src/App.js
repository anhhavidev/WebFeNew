// Root component - nơi khai báo layout chính và các route theo vai trò
import React from "react";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PublicRoutes from "./Routes/PublicRoutes";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import ShipperRoutes from "./Routes/ShipperRoutes";
import SellerRoutes from "./Routes/SellerRoutes";

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <PublicRoutes />
      <UserRoutes />
      <AdminRoutes />
      <ShipperRoutes/>
      <SellerRoutes/>
    </>
  );
}

export default App;
