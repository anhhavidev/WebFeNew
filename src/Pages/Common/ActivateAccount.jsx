import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

const ActivateAccount = () => {
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Đang xác thực mã kích hoạt...");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    
    if (!code) {
      setStatus("error");
      setMessage("Mã kích hoạt không tồn tại hoặc không hợp lệ.");
      return;
    }

    const activate = async () => {
      try {
        // Gọi API Backend (đã sửa route thành api/Account)
        const res = await fetch(`http://localhost:5230/api/Account/activate?code=${code}`);
        const data = await res.json();
        
        if (data.isSuccess) {
          setStatus("success");
          setMessage("Tài khoản của bạn đã được kích hoạt thành công!");
          
          Swal.fire({
            title: 'Kích hoạt thành công!',
            text: 'Bây giờ bạn có thể đăng nhập vào hệ thống.',
            icon: 'success',
            confirmButtonText: 'Đăng nhập ngay',
            confirmButtonColor: '#4f46e5',
            background: '#1e1e2d',
            color: '#fff',
          }).then(() => {
            navigate("/login");
          });
        } else {
          setStatus("error");
          setMessage(data.message || "Kích hoạt thất bại. Mã có thể đã hết hạn.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    };

    // Delay một chút để hiệu ứng loading trông thật hơn
    const timer = setTimeout(() => {
      activate();
    }, 1500);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      color: "#fff",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          {status === "loading" && (
            <FiLoader style={{ fontSize: "60px", color: "#4f46e5", animation: "spin 2s linear infinite" }} />
          )}
          {status === "success" && (
            <FiCheckCircle style={{ fontSize: "60px", color: "#10b981" }} />
          )}
          {status === "error" && (
            <FiXCircle style={{ fontSize: "60px", color: "#ef4444" }} />
          )}
        </div>
        
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>
          {status === "loading" ? "Đang xử lý..." : status === "success" ? "Tuyệt vời!" : "Rất tiếc!"}
        </h2>
        
        <p style={{ color: "rgba(255, 255, 255, 0.6)", lineHeight: "1.6" }}>
          {message}
        </p>

        {status === "error" && (
          <button 
            onClick={() => navigate("/register")}
            style={{
              marginTop: "25px",
              padding: "10px 25px",
              background: "#4f46e5",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Quay lại đăng ký
          </button>
        )}

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ActivateAccount;
