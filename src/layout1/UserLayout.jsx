import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Navigation from "../Components/Navigation";
import Footer from "./Footer";
import AiChatbot from "../Components/Chatbot/AiChatbot";
import useAuth from "../Hooks/useAuth";
import { useCart } from "../constants/CartContext";
import { ROUTES } from "../constants/routePaths";
import { getCartItems } from "../Service/cartApi";
import "../Pages/Common/CustomerPages.css";

export default function UserLayout({ children }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user, logout, ensureTokenValid } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const { cartCount, setCartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(localCart.length);
  }, []);

  useEffect(() => {
    const fetchCartFromServer = async () => {
      if (!user) return;
      const token = await ensureTokenValid();
      if (!token) return;
      try {
        const res = await getCartItems(token);
        const sellerGroups = res.data?.sellerGroups || [];
        let total = 0;
        sellerGroups.forEach(group => {
          if (group.cartItems) {
            group.cartItems.forEach(item => { total += item.soLuong; });
          }
        });
        setCartCount(total);
      } catch (err) {
        console.warn("Không thể lấy giỏ hàng từ server:", err.message);
      }
    };
    fetchCartFromServer();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const category = searchParams.get("category") || "";
    const minprice = searchParams.get("minprice") || "";
    const maxprice = searchParams.get("maxprice") || "";
    const params = new URLSearchParams({
      page: 1, pageSize: 12, keyword: searchKeyword, category, minprice, maxprice,
    });
    navigate(ROUTES.HOME + "?" + params.toString());
  };

  return (
    <>
      <header className={`ed-header ${isScrolled ? "ed-header-scrolled" : ""}`}>
        {/* Top Banner */}
        {showTopBar && (
          <div className="ed-topbar">
            <div className="ed-topbar-inner">
              <span>
                SS/2026 Collection — Nhập mã <strong>AURA2026</strong> giảm 15% cho đơn từ 1.000.000₫.
              </span>
              <button className="ed-topbar-close" onClick={() => setShowTopBar(false)} aria-label="Đóng">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className="ed-navbar">
          <div className="ed-navbar-inner">
            {/* Mobile Menu Button */}
            <button
              className="ed-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

            {/* Logo */}
            <div className="ed-logo" onClick={() => navigate(ROUTES.HOME)}>
              <span className="ed-logo-text">AURA</span>
              <span className="ed-logo-tag">Editorial Studio</span>
            </div>

            {/* Desktop Nav */}
            <nav className="ed-nav">
              <button onClick={() => navigate(ROUTES.HOME)} className="ed-nav-link">Trang Chủ</button>
              <button onClick={() => navigate(ROUTES.HOME + "?page=1")} className="ed-nav-link">Bộ Sưu Tập</button>
              <div className="ed-nav-dropdown">
                <button className="ed-nav-link">Danh Mục</button>
                <div className="ed-nav-dropdown-menu">
                  <Navigation />
                </div>
              </div>
              <button onClick={() => navigate(ROUTES.HOME + "?page=1&category=1")} className="ed-nav-link">Thời Trang</button>
              <button onClick={() => navigate(ROUTES.HOME + "?page=1&category=2")} className="ed-nav-link">Thiết Bị</button>
            </nav>

            {/* Search */}
            <div className="ed-search">
              <div className="ed-search-box">
                <FontAwesomeIcon icon={faSearch} className="ed-search-icon" />
                <input
                  type="text"
                  placeholder="TÌM KIẾM SẢN PHẨM..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="ed-search-input"
                />
                {searchKeyword && (
                  <button className="ed-search-clear" onClick={() => setSearchKeyword("")}>✕</button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="ed-header-actions">
              {user ? (
                <div className="ed-user-dropdown" ref={dropdownRef}>
                  <button className="ed-user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                    {user?.fullName || "USER"}
                  </button>
                  {showDropdown && (
                    <ul className="ed-dropdown-menu">
                      <li><button className="ed-dropdown-item" onClick={() => { navigate(ROUTES.GETINFOR); setShowDropdown(false); }}>👤 Thông tin tài khoản</button></li>
                      <li><button className="ed-dropdown-item" onClick={() => { navigate(ROUTES.ORDERS); setShowDropdown(false); }}>🧾 Đơn hàng của tôi</button></li>
                      <li><button className="ed-dropdown-item" onClick={() => { logout(); setShowDropdown(false); setCartCount(0); navigate(ROUTES.HOME); }}>🔓 Đăng xuất</button></li>
                    </ul>
                  )}
                </div>
              ) : (
                <a href="/login" className="ed-header-link">Tài khoản</a>
              )}
              <a href="/wishlist" className="ed-header-link" aria-label="Yêu thích">♡</a>
              <a href="/cart" className="ed-cart-btn" aria-label="Giỏ hàng">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Giỏ ({cartCount})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="ed-mobile-drawer">
            <div className="ed-mobile-search">
              <input
                type="text"
                placeholder="TÌM KIẾM SẢN PHẨM..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { handleSearch(); setMobileMenuOpen(false); } }}
              />
            </div>
            <div className="ed-mobile-nav">
              <button className="ed-mobile-link" onClick={() => { navigate(ROUTES.HOME); setMobileMenuOpen(false); }}>Trang Chủ</button>
              <button className="ed-mobile-link" onClick={() => { navigate(ROUTES.HOME + "?page=1"); setMobileMenuOpen(false); }}>Tất Cả Sản Phẩm</button>
              <div className="ed-mobile-categories">
                <span className="ed-mobile-cat-label">Danh Mục</span>
                <Navigation />
              </div>
              {!user && (
                <button className="ed-mobile-link" onClick={() => { navigate(ROUTES.LOGIN); setMobileMenuOpen(false); }}>Đăng nhập</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="ed-header-spacer" />

      {/* Main */}
      <main className="cp-main">{children}</main>

      <Footer />
      <AiChatbot />
    </>
  );
}
