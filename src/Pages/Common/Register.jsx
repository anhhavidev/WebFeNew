import React, { useState } from "react";
import styles from "./Register.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiUser, FiMail, FiLock, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routePaths";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Họ và tên không được để trống");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Gọi API với payload đầy đủ
    const result = await register({ email, password, confirmPassWord: confirmPassword, fullName });
    if (result.success) {
      Swal.fire({
        title: 'Đăng ký thành công!',
        text: 'Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
        icon: 'success',
        confirmButtonText: 'Đến trang đăng nhập',
        confirmButtonColor: '#4f46e5',
        background: '#1e1e2d',
        color: '#fff',
        timer: 5000,
        timerProgressBar: true,
      }).then((result) => {
        navigate(ROUTES.LOGIN);
      });
    } else {
      setError(result.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Brand icon */}
        <div className={styles.brandIcon}>
          <FiShoppingBag />
        </div>
        <h2 className={styles.title}>Đăng ký tài khoản</h2>
        <p className={styles.subtitle}>Tạo tài khoản mới để bắt đầu mua sắm</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleRegister}>
          {/* Full Name field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><FiUser /></span>
            <input
              type="text"
              placeholder="Họ và tên"
              className={`${styles.input} ${styles.inputWithIcon}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          {/* Email field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><FiMail /></span>
            <input
              type="email"
              placeholder="Địa chỉ Email"
              className={`${styles.input} ${styles.inputWithIcon}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Password field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><FiLock /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className={`${styles.input} ${styles.inputWithIcon}`}
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
          
          {/* Confirm Password field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><FiLock /></span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              className={`${styles.input} ${styles.inputWithIcon}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className={styles.icon}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          {/* Submit Button */}
          <div className={styles.inputGroup} style={{ marginTop: '24px' }}>
            <button type="submit" className={styles.button}>
              Đăng ký <FiArrowRight style={{ marginLeft: 6 }} />
            </button>
          </div>
        </form>
        
        {/* Footer links */}
        <div className={styles.textCenter}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>Đã có tài khoản? </span>
          <Link to={ROUTES.LOGIN} className={styles.link}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
