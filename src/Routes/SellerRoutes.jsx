import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerDashboard from "../Admin/SellerDashboard";
import ManagerDonHang from "../Admin/ManagerDonHang";
import ProductManagement from "../Admin/ProductManagement";
import PrivateSeller from "./PrivateSeller"
import ProductManagerSeller from "../Seller/ProductManagerSeller";
import OrderManagerSeller from "../Seller/OrderManagerSeller";
import SellerDashboardChart from "../Seller/SellerDashboardChar";
import UserProfile from "../Admin/UserProfile";

const SellerRoutes = () => {
  return (
       
            <Routes>
                {/* Seller routes */}
                <Route path="/seller/dashboard" element={<PrivateSeller><SellerDashboard/></PrivateSeller>}>
                    <Route index element={<SellerDashboardChart/>} />
                    <Route path="products" element={<ProductManagerSeller />} />
                    <Route path="orders" element={<OrderManagerSeller />} />
                    <Route path="profile" element={<UserProfile />} />
                </Route>
            </Routes>
       
    );
}
export default SellerRoutes
