import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./AdminDashboard.css"; // Reuse shared dashboard styles
import { FiPieChart, FiTruck, FiChevronDown, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import useAuth from '../Hooks/useAuth';

export default function ShipperDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const titleMap = {
    "/shipper/dashboard": "Tổng quan Giao Hàng",
    "/shipper/dashboard/orders": "Đơn hàng đảm nhận",
  };

  const getTitle = () => {
    const path = location.pathname;
    const matchedKey = Object.keys(titleMap)
      .sort((a, b) => b.length - a.length)
      .find(key => path.startsWith(key));
    return titleMap[matchedKey] || "Bảng điều khiển";
  };

  return (
    <div className="admin-layout" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: "260px", position: "fixed", height: "100vh", overflowY: "auto", borderRight: "1px solid #e5e7eb", background: "#ffffff" }}>
        <div className="sidebar-header" style={{ padding: "24px", borderBottom: "1px solid #f3f4f6" }}>
            <h2 className="text-xl font-bold text-gray-900 m-0" style={{ color: "#111827", fontWeight: 700, fontSize: "1.25rem" }}>Cổng Shipper</h2>
        </div>

        <nav className="sidebar-nav" style={{ padding: "24px 16px" }}>
            <div className="nav-section-title" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px", paddingLeft: "12px" }}>Nhiệm vụ</div>
            
            <Link to="/shipper/dashboard" className={`nav-link-item ${location.pathname === "/shipper/dashboard" ? "active" : ""}`} style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: "8px", color: location.pathname === "/shipper/dashboard" ? "#2563eb" : "#4b5563", background: location.pathname === "/shipper/dashboard" ? "#eff6ff" : "transparent", textDecoration: "none", marginBottom: "4px", fontWeight: 500 }}>
                <FiPieChart style={{ marginRight: "12px", fontSize: "18px" }} />
                Tổng quan
            </Link>
            
            <Link to="/shipper/dashboard/orders" className={`nav-link-item ${location.pathname.includes("/shipper/dashboard/orders") ? "active" : ""}`} style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: "8px", color: location.pathname.includes("/shipper/dashboard/orders") ? "#2563eb" : "#4b5563", background: location.pathname.includes("/shipper/dashboard/orders") ? "#eff6ff" : "transparent", textDecoration: "none", marginBottom: "4px", fontWeight: 500 }}>
                <FiTruck style={{ marginRight: "12px", fontSize: "18px" }} />
                Đơn hàng giao
            </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main flex-grow-1" style={{ marginLeft: "260px", background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* Header Navigation */}
        <header className="admin-header d-flex justify-content-between align-items-center" style={{ height: "72px", padding: "0 32px", background: "#ffffff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 10 }}>
          <h1 className="h5 mb-0 fw-bold" style={{ color: "#111827" }}>{getTitle()}</h1>
          
          <div className="header-actions">
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center rounded-pill border-0 px-3 py-2 bg-light shadow-none"
                id="shipperDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              >
                <img
                  src="https://ui-avatars.com/api/?name=Shipper+Express&background=10b981&color=fff"
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: "32px", height: "32px", marginRight: "10px", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 0 0 1px #e5e7eb" }}
                />
                <div className="d-flex flex-column align-items-start me-2">
                    <span className="fw-medium text-dark lh-1 mb-1" style={{ fontSize: "0.875rem" }}>{user?.hoTen || 'Anh Shipper'}</span>
                    <span className="text-muted lh-1" style={{ fontSize: "0.75rem" }}>Giao hàng nhanh</span>
                </div>
                <FiChevronDown color="#6b7280" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 rounded-3" aria-labelledby="shipperDropdown" style={{ minWidth: "200px" }}>
                <li><Link className="dropdown-item py-2 d-flex align-items-center text-secondary" to="/shipper/profile"><FiUser className="me-2" /> Hồ sơ cá nhân</Link></li>
                <li><Link className="dropdown-item py-2 d-flex align-items-center text-secondary" to="/shipper/settings"><FiSettings className="me-2" /> Cài đặt tuyến</Link></li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li><Link className="dropdown-item py-2 d-flex align-items-center text-danger" to="/login" onClick={(e) => { e.preventDefault(); logout(); }}><FiLogOut className="me-2" /> Đăng xuất</Link></li>
              </ul>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="admin-content" style={{ padding: "32px", flexGrow: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
