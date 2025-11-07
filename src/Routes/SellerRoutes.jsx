import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerDashboard from "../Admin/SellerDashboard";
import ManagerDonHang from "../Admin/ManagerDonHang";
import ProductManagement from "../Admin/ProductManagement";
import PrivateSeller from "./PrivateSeller"
import ProductManagerSeller from "../Seller/ProductManagerSeller";
import OrderManagerSeller from "../Seller/OrderManagerSeller";
import SellerDashboardChar from "../Seller/SellerDashboardChar";
const SellerRoutes = () => {
  return (
       
            <Routes>
                {/* Seller routes */}
                <Route path="/seller/dashboard" element={<PrivateSeller><SellerDashboard/></PrivateSeller>}>
                    <Route index element={<SellerDashboardChar/>} />
                    <Route path="products" element={<ProductManagerSeller />} />
                    <Route path="orders" element={<OrderManagerSeller />} />
                </Route>
            </Routes>
       
    );
}
export default SellerRoutes
