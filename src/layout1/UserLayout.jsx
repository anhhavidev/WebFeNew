import React, { useState, useEffect, useRef } from 'react';
import styles from "./UserLayout.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMessage } from '@fortawesome/free-solid-svg-icons';
import logo from "../Assets/img/pngtree-salon-logo-png-image_4004444-removebg-preview.png";
import Navitation from '../Components/Navitation';
import Footer from './Footer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';
import { useCart } from "../constants/CartContext";
import { getCartItems } from "../Service/cartApi"; // 👈 Thêm hàm gọi API
import { CartProvider } from "../constants/CartContext";
export default function UserLayout({ children }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user, logout, ensureTokenValid } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const { cartCount, setCartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef();

  // ⚡ Luôn chạy khi component mount (dù có user hay không)
  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = localCart.length;
    setCartCount(total); // Cập nhật cartCount luôn từ local
  }, []);

  // 🔁 Chạy lại khi user thay đổi (chỉ dùng cho người đăng nhập)
  useEffect(() => {
    const fetchCartFromServer = async () => {
      if (!user) return; // Không có user thì bỏ qua

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


  // 👇 Ẩn dropdown khi click ngoài
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
      page: 1,
      pageSize: 12,
      keyword: searchKeyword,
      category,
      minprice,
      maxprice,
    });

    navigate("/?" + params.toString());
  };

  return (
    <>
      <div className={styles.title}>
        <ul className={styles.theul}>
          <li><a href="">Blog</a></li>
          <li><a href="">Tải App</a></li>
          <li><a href="">Hàng hiệu giảm đến 50%</a></li>
        </ul>
        <ul className={styles.theul}>
          <li><a href="" style={{ color: 'yellow' }}>Tạo shop</a></li>
          <li className={styles.drop} ref={dropdownRef}>
            {user ? (
              <div>
                <span className={styles.droptogle} onClick={() => setShowDropdown(!showDropdown)}>
                  Xin chào : {user?.fullName || "USER"}
                </span>
                {showDropdown && (
                  <ul className={styles.dropdownmenu}>
                    <li>
                      <button className={styles.dropdownItem} onClick={() => navigate("/getinfor")}>
                        Thông tin tài khoản
                      </button>
                    </li>
                    <li>
                      <button className={styles.dropdownItem} onClick={() => navigate("/orders")}>
                        🧾 Đơn hàng của tôi
                      </button>
                    </li>
                    <li>
                      <button className={styles.dropdownItem} onClick={() => {
                        logout();
                        setShowDropdown(false);
                        setCartCount(0); // 👈 reset giỏ khi logout
                        navigate("/");   // 👈 chuyển về trang chủ
                      }}>
                        🔓 Đăng xuất
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <a href="/login" style={{ color: "yellow" }}>Tài khoản</a>
            )}
          </li>

          <li>
            <a href="/cart">
              Giỏ hàng{" "}
              {cartCount > 0 && (
                <span style={{ color: "red" }}>({cartCount})</span>
              )}
            </a>
          </li>
        </ul>
      </div>

      <div className={styles.header}>
        <div className={styles.hedaer3}>
          <div className={styles.left}>
            <img src={logo} width={150} alt="logo" />
          </div>

          <div className={styles.middle}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder='Tìm kiếm sản phẩm thương hiệu'
            />
            <button type="button" onClick={handleSearch}>
              <FontAwesomeIcon style={{ color: "white" }} icon={faSearch} />
            </button>
          </div>

          <div className={styles.right}>
            <div>
              <FontAwesomeIcon style={{ fontSize: 20 }} icon={faMessage} />
            </div>
            <div className={styles.right2}>
              <p>Hotline:<a href=""> 093.934.8888</a></p>
              <p>Hotline:<a href=""> 093.934.8888</a></p>
            </div>
          </div>
        </div>

        <Navitation />
      </div>

      <main className={styles.content}>
        {children}
      </main>

      <Footer />
    </>
  );
}
