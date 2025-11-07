import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function ShipperDashboard() {
  const location = useLocation();

  const titleMap = {
    "/shipper/dashboard": "Tổng quan",
    // "/seller/dashboard/products": "Quản lý sản phẩm",
    "/shipper/dashboard/orders": "Đơn hàng của tôi",
  };

  const getTitle = () => {
    const path = location.pathname;
    const matchedKey = Object.keys(titleMap)
      .sort((a, b) => b.length - a.length)
      .find(key => path.startsWith(key));
    return titleMap[matchedKey] || "Bảng điều khiển";
  };

  return (
    <div className="wrapper d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white p-3" 
           style={{ width: "250px", position: "fixed", height: "100%", overflowY: "auto" }}>
            
        <h4 className="mb-4"></h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/shipper/dashboard">📊 Tổng quan</Link>
          </li>
          {/* <li className="nav-item">
            <Link className="nav-link text-white" to="/seller/dashboard/products">📦 Quản lý sản phẩm</Link>
          </li> */}
          <li className="nav-item">
            <Link className="nav-link text-white" to="/shipper/dashboard/orders">🧾 Đơn hàng</Link>
          </li>
        </ul>
      </div>

      {/* Nội dung chính */}
      <div className="content flex-grow-1" style={{ marginLeft: "250px", padding: "20px", overflowX: "auto" }}>
        {/* Navbar */}
        <nav className="navbar navbar-expand navbar-light bg-light px-4 d-flex justify-content-between">
          <span className="navbar-brand mb-0 h5">{getTitle()}</span>
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle d-flex align-items-center"
              id="sellerDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src="https://i.pravatar.cc/40?u=seller"
                alt="avatar"
                className="rounded-circle me-2"
                style={{ width: "32px", height: "32px" }}
              />
              <span>Seller</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="sellerDropdown">
              <li><Link className="dropdown-item" to="/seller/profile">👤 Thông tin cá nhân</Link></li>
              <li><Link className="dropdown-item" to="/seller/settings">⚙️ Cài đặt</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item text-danger" to="/login">🚪 Đăng xuất</Link></li>
            </ul>
          </div>
        </nav>

        {/* Nội dung route con */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
