import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ActivateAccount = () => {
  const [message, setMessage] = useState("Đang kích hoạt...");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (!code) {
      setMessage("Link kích hoạt không hợp lệ.");
      return;
    }

    const activate = async () => {
      try {
        const res = await fetch(`http://localhost:5230/api/account/activate?code=${code}`);
        const data = await res.json();
        if (data.isSuccess) {
          setMessage("✅ Kích hoạt thành công! Bạn sẽ được chuyển hướng tới trang đăng nhập...");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setMessage(data.message || "Kích hoạt thất bại.");
        }
      } catch (err) {
        setMessage("Có lỗi xảy ra, vui lòng thử lại.");
      }
    };

    activate();
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Kích hoạt tài khoản</h2>
      <p>{message}</p>
    </div>
  );
};

export default ActivateAccount;
