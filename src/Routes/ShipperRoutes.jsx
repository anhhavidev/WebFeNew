import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateShipper from "./PrivateShipper";   // bảo vệ Shipper
import ShipperDonHang from "../Admin/ShipperDashboard"; // giao diện Shipper
import OrderManagerShipper from "../Shipper/OrderManagerShipper";
import ShipperDashboard from "../Admin/ShipperDashboard";
import ShipperDashboardChar from "../Shipper/ShipperDashboardChar";

const ShipperRoutes = () => {
  return (
    <Routes>

      <Route path="/shipper/dashboard/" element={<  PrivateShipper><ShipperDashboard /></PrivateShipper>}>
        <Route index element={<ShipperDashboardChar></ShipperDashboardChar>} />
        {/* <Route path="products" element={<P />} /> */}
        <Route path="orders" element={<OrderManagerShipper />} />
      </Route>
    </Routes>
  );
};

export default ShipperRoutes;
