import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiKey, FiLock, FiShield, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [otpLocked, setOtpLocked] = useState(false);
  const navigate = useNavigate(); // ✅ Hook điều hướng
  // Gửi OTP
  const sendOtp = async () => {
    const res = await fetch('http://localhost:5230/api/Account/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);

    if (res.ok && data.isSuccess) {
      setOtpLocked(false);
      setStep(2);
    }
  };

  // Xác minh OTP
  // Xác minh OTP
  const verifyOtp = async () => {
    if (otpLocked) return;

    const res = await fetch('http://localhost:5230/api/Account/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    const remaining = data.data?.remainingAttempts ?? null;

    if (!res.ok || !data.isSuccess) {
      // Nếu còn thông tin số lần thử → hiển thị kèm trong message
      if (remaining !== null && remaining >= 0) {
        setMessage(`${data.message} (Còn ${remaining} lần thử)`);
      } else {
        setMessage(data.message);
      }

      if (remaining <= 0) {
        setOtpLocked(true);
      }
      return;
    }

    // Thành công → sang bước 3
    setMessage(data.message);
    setStep(3);
  };


  // Đặt lại mật khẩu
  const resetPassword = async () => {
    const res = await fetch('http://localhost:5230/api/Account/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    setMessage(data.message);

    if (res.ok && data.isSuccess) {
      navigate('/login');
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        {/* Brand icon */}
        <div className="forgot-brand-icon">
          <FiShield />
        </div>
        <h2>Quên mật khẩu?</h2>
        <p className="subtitle">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
        {message && <p className={`message ${otpLocked ? 'error' : ''}`}>{message}</p>}

        {step === 1 && (
          <>
            <div className="forgot-input-wrap">
              <span className="forgot-input-icon"><FiMail /></span>
              <input
                type="email"
                placeholder="Nhập địa chỉ Email của bạn"
                className="forgot-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button onClick={sendOtp}>
              Gửi mã OTP <FiArrowRight style={{ marginLeft: 6 }} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {!otpLocked ? (
              <>
                <div className="forgot-input-wrap">
                  <span className="forgot-input-icon"><FiKey /></span>
                  <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    className="forgot-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <button onClick={verifyOtp}>
                  Xác minh OTP <FiArrowRight style={{ marginLeft: 6 }} />
                </button>
              </>
            ) : (
              <div className="lock-box">
                <div className="lock-icon"><FiLock /></div>
                <h3>OTP đã bị khóa</h3>
                <p>Bạn đã nhập sai quá số lần, vui lòng gửi OTP mới để tiếp tục.</p>
                <div className="lock-actions">
                  <button onClick={sendOtp}>
                    <FiRefreshCw style={{ marginRight: 6 }} /> Gửi OTP mới
                  </button>
                  <button
                    className="link"
                    onClick={() => {
                      setStep(1);
                      setMessage("");
                      setOtp("");
                      setOtpLocked(false);
                    }}
                  >
                    Đổi email
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="forgot-input-wrap">
              <span className="forgot-input-icon"><FiLock /></span>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                className="forgot-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button onClick={resetPassword}>
              Đặt lại mật khẩu <FiArrowRight style={{ marginLeft: 6 }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
