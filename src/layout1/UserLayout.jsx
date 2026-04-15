import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import logo from "../Assets/img/pngtree-salon-logo-png-image_4004444-removebg-preview.png";
import Navitation from '../Components/Navitation';
import Footer from './Footer';
import AiChatbot from '../Components/Chatbot/AiChatbot';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';
import { useCart } from "../constants/CartContext";
import { getCartItems } from "../Service/cartApi";
import '../Pages/Common/CustomerPages.css';

export default function UserLayout({ children }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user, logout, ensureTokenValid } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const { cartCount, setCartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef();

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = localCart.length;
    setCartCount(total);
  }, []);

  useEffect(() => {
    const fetchCartFromServer = async () => {
      if (!user) return;
      const token = await ensureTokenValid();
      if (!token) return;
      try {
        const res = await getCartItems(token);
        const items = res.data?.cartItems || [];
        const total = items.reduce((sum, item) => sum + item.soLuong, 0);
        setCartCount(total);
      } catch (err) {
        console.warn("Không thể lấy giỏ hàng từ server:", err.message);
      }
    };
    fetchCartFromServer();
  }, [user]);

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
    navigate("/?" + params.toString());
  };

  return (
    <>
      {/* Top Bar */}
      <div className="cp-topbar">
        <div className="cp-topbar-inner">
          <div className="cp-topbar-left">
            <span>📞 Hotline: 093.934.8888</span>
            <a href="#">📝 Blog</a>
            <a href="#">📱 Tải App</a>
            <a href="#">🔥 Hàng hiệu giảm đến 50%</a>
          </div>
          <div className="cp-topbar-right">
            <a href="#">Tạo shop</a>

            <div className="cp-user-dropdown" ref={dropdownRef}>
              {user ? (
                <>
                  <span className="cp-user-toggle" onClick={() => setShowDropdown(!showDropdown)}>
                    Xin chào, {user?.fullName || "USER"}
                  </span>
                  {showDropdown && (
                    <ul className="cp-dropdown-menu">
                      <li>
                        <button className="cp-dropdown-item" onClick={() => { navigate("/getinfor"); setShowDropdown(false); }}>
                          👤 Thông tin tài khoản
                        </button>
                      </li>
                      <li>
                        <button className="cp-dropdown-item" onClick={() => navigate("/orders")}>
                          🧾 Đơn hàng của tôi
                        </button>
                      </li>
                      <li>
                        <button className="cp-dropdown-item" onClick={() => { logout(); setShowDropdown(false); setCartCount(0); navigate("/"); }}>
                          🔓 Đăng xuất
                        </button>
                      </li>
                    </ul>
                  )}
                </>
              ) : (
                <a href="/login">Tài khoản</a>
              )}
            </div>

            <a href="/cart" className="cp-cart-link">
              🛒 Giỏ hàng
              {cartCount > 0 && <span className="cp-cart-badge">{cartCount}</span>}
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="cp-header">
        <div className="cp-header-inner">
          <a href="/" className="cp-logo">
            <img src={logo} alt="Logo" />
          </a>

          <div className="cp-search-box">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            />
            <button className="cp-search-btn" onClick={handleSearch}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          <div className="cp-header-actions">
            <button title="Thông báo">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <a href="/cart" title="Giỏ hàng">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartCount > 0 && <span className="cp-header-cart-badge">{cartCount}</span>}
            </a>
          </div>
        </div>

        <Navitation />
      </header>

      {/* Main Content */}
      <main className="cp-main">
        {children}
      </main>

      <Footer />
      <AiChatbot />
    </>
  );
}
