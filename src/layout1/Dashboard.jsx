import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../Admin/AdminDashboard.css';
import {
  FiGrid, FiPackage, FiShoppingCart, FiUsers, FiLayers,
  FiSearch, FiBell, FiUser, FiChevronDown
} from "react-icons/fi";
import useAuth from '../Hooks/useAuth';

export default function Dashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: <FiGrid />, exact: true },
    { path: "/admin/dashboard/products", label: "Sản phẩm", icon: <FiPackage /> },
    { path: "/admin/dashboard/orders", label: "Đơn hàng", icon: <FiShoppingCart /> },
    { path: "/admin/dashboard/users", label: "Người dùng", icon: <FiUsers /> },
    { path: "/admin/dashboard/category", label: "Quản lý loại", icon: <FiLayers /> },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h1>Admin<span>Pro</span></h1>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-search">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm..." />
          </div>

          <div className="header-actions">
            <button className="header-notification">
              <FiBell />
              <span className="notification-badge"></span>
            </button>

            <div className="header-divider"></div>

            <div className="dropdown">
              <button
                className="header-user"
                id="adminDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="header-user-info">
                  <p className="header-user-name">{user?.hoTen || 'Admin'}</p>
                  <p className="header-user-role">Quản trị viên</p>
                </div>
                <div className="header-avatar">
                  <FiUser />
                </div>
                <FiChevronDown style={{ color: '#6b7280', fontSize: '0.8rem' }} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
                <li><Link className="dropdown-item" to="/admin/profile">👤 Thông tin cá nhân</Link></li>
                <li><Link className="dropdown-item" to="/admin/settings">⚙️ Cài đặt tài khoản</Link></li>
                <li><Link className="dropdown-item" to="/admin/switch-role">🔄 Chuyển vai trò</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item text-danger" to="/login" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Đăng xuất</Link></li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
