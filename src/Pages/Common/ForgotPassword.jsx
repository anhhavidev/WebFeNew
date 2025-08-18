import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';
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
    const res = await fetch('http://localhost:5230/api/Acount/forgot-password', {
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

    const res = await fetch('http://localhost:5230/api/Acount/verify-otp', {
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
    const res = await fetch('http://localhost:5230/api/Acount/reset-password', {
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
        <h2>🔐 Quên mật khẩu</h2>
        {message && <p className={`message ${otpLocked ? 'error' : ''}`}>{message}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="📧 Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp}>Gửi mã OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            {!otpLocked ? (
              <>
                <input
                  type="text"
                  placeholder="🔢 Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button onClick={verifyOtp}>Xác minh OTP</button>
              </>
            ) : (
              <div className="lock-box">
                <div className="lock-icon">🔒</div>
                <h3>OTP đã bị khóa</h3>
                <p>Bạn đã nhập sai quá số lần, vui lòng gửi OTP mới để tiếp tục.</p>
                <div className="lock-actions">
                  <button onClick={sendOtp}>Gửi OTP mới</button>
                  <button
                    className="link"
                    onClick={() => {
                      setStep(1);
                      setMessage("");      // ✅ Xóa thông báo lỗi cũ
                      setOtp("");          // ✅ Xóa mã OTP đang nhập
                      setOtpLocked(false); // ✅ Mở khóa OTP nếu bị khóa
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
            <input
              type="password"
              placeholder="🔑 Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={resetPassword}>Đặt lại mật khẩu</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
