import React, { useState } from "react";
import styles from "./Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import { syncCartToServer, getCartItems } from "../../Service/cartApi";
import { getLocalCart, clearLocalCart } from "../../utils/cartStorage";
import { useCart } from "../../constants/CartContext"; // ✅ Nếu dùng context để đếm giỏ hàng
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import GoogleOneTap from "./GoogleOneTap"; // tuỳ theo đường dẫn
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, getProfile } = useAuth();
  const { setCartCount } = useCart(); // ✅ Nếu không dùng context thì bỏ dòng này
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // debugger
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      const token = result.token;
      const localCart = getLocalCart();

      try {
        // Nếu có local cart thì đồng bộ
        if (localCart.length > 0) {
          await syncCartToServer(localCart, token);
          clearLocalCart();
        }

        // Gọi lại API để cập nhật giỏ hàng
        const cartResult = await getCartItems(token);
        if (cartResult?.data?.cartItems) {
          const totalQuantity = cartResult.data.cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
          setCartCount(totalQuantity); // ✅ Gán tổng số lượng vào state/context
        }

      } catch (error) {
        console.error("❌ Đồng bộ giỏ hàng thất bại:", error);
      }

      // Điều hướng
      // navigate(result.role === "Admin" ? "/admin/dashboard" : "/");
      // Điều hướng
      if (result.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (result.role === "Shipper") {
        navigate("/shipper/dashboard");
      }
        else if (result.role === "Seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/"); // Customer hoặc role khác
      }

    } else {
      setError(result.message);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Gửi token.id_token về backend để xử lý
        const res = await fetch("http://localhost:5230/api/Acount/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ IdToken: tokenResponse.credential, method: "google" }), // credential = id_token
        });
        console.log("Google response:", tokenResponse);

        const data = await res.json();

        if (res.ok) {
          // Lưu token như login thường
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          await getProfile(data.accessToken); // gọi lại profile

          const decoded = jwtDecode(data.accessToken);
          const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

          // Đồng bộ giỏ hàng nếu cần
          const localCart = getLocalCart();
          if (localCart.length > 0) {
            await syncCartToServer(localCart, data.accessToken);
            clearLocalCart();
          }

          const cartResult = await getCartItems(data.accessToken);
          if (cartResult?.data?.cartItems) {
            const totalQuantity = cartResult.data.cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
            setCartCount(totalQuantity);
          }

          // navigate(role === "Admin" ? "/admin/dashboard" : "/");
          if (role === "Admin") {
            navigate("/admin/dashboard");
          } else if (role === "Shipper") {
            navigate("/shipper/dashboard/orders");
          } else {
            navigate("/");
          }

        } else {
          setError(data.message || "Đăng nhập Google thất bại");
        }
      } catch (err) {
        console.error("❌ Google login error:", err);
        setError("Google login failed");
      }
    },
    onError: () => {
      console.error("Google login canceled or failed");
      setError("Google login canceled or failed");
    },
    flow: "implicit", // hoặc 'auth-code' tùy loại ứng dụng
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign In</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className={styles.icon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className={styles.inputGroup}>
            <button type="submit" className={styles.button}>
              Login
            </button>
          </div>
        </form>
        <div className={styles.inputGroup}>
          {/* <button className={styles.googleButton} onClick={handleGoogleLogin}>
            <FcGoogle className={styles.googleIcon} /> Sign in with Google
          </button> */}
          <GoogleOneTap />

        </div>
        <div className={styles.textCenter}>
          <Link to="/forgot-password" className={styles.link}>
            Forgot Password?
          </Link>

        </div>
        <div className={styles.textCenter}>
          <Link to="/Register" className={styles.link}>
            Create an Account?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
