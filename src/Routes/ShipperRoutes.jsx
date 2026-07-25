import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateShipper from "./PrivateShipper";   // bảo vệ Shipper
import ShipperDonHang from "../Admin/ShipperDashboard"; // giao diện Shipper
import OrderManagerShipper from "../Shipper/OrderManagerShipper";
import ShipperDashboard from "../Admin/ShipperDashboard";
import ShipperDashboardChart from "../Shipper/ShipperDashboardChar";
import UserProfile from "../Admin/UserProfile";

const ShipperRoutes = () => {
  return (
    <Routes>

      <Route path="/shipper/dashboard/" element={<  PrivateShipper><ShipperDashboard /></PrivateShipper>}>
        <Route index element={<ShipperDashboardChart></ShipperDashboardChart>} />
        {/* <Route path="products" element={<P />} /> */}
        <Route path="orders" element={<OrderManagerShipper />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default ShipperRoutes;
