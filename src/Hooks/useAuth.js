import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Biến toàn cục chống gọi trùng
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

export default function useAuth() {
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("chatSessionId");
    setUser(null);
    console.warn("🚪 Đã logout vì token hết hạn hoặc lỗi.");
  };

  const getProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:5230/api/Account/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("❌ Lấy thông tin người dùng thất bại.");
        return;
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        const decoded = jwtDecode(token);
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUser({ ...result.data, role, token });
      } else {
        console.warn("⚠️ Phản hồi không hợp lệ từ server.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi gọi API lấy profile:", error.message);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.warn("⏰ Token đã hết hạn");
          logout();
        } else {
          await getProfile(token);
        }
      } catch (error) {
        console.error("❌ Token lỗi, logout");
        logout();
      }
    };

    checkToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5230/api/Account/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, method: "normal" }), // thêm đây 
      });

      if (!response.ok) {
      const errorData = await response.json(); // lấy thông báo lỗi trả về từ backend
      throw new Error(errorData.message || "Đăng nhập thất bại");
    }

      const data = await response.json();
      
      // ✅ Kiểm tra backend trả về success hay không (ResponeDTO.IsSuccess)
      if (!data.isSuccess) {
        throw new Error(data.message || "Tài khoản hoặc mật khẩu không đúng!");
      }

      // ✅ Đảm bảo data.data không null mới truy cập accessToken/refreshToken
      if (!data.data) {
         throw new Error("Không nhận được dữ liệu từ hệ thống. Thử lại sau!");
      }

      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      await getProfile(data.data.accessToken);

      const decoded = jwtDecode(data.data.accessToken);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      return { success: true, token: data.data.accessToken, role };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async ({ email, password, confirmPassWord, fullName }) => {
  try {
    const response = await fetch("http://localhost:5230/api/Account/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, confirmPassWord, fullName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Đăng ký thất bại");
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

  const refreshAccessToken = async () => {
    if (isRefreshing) {
      // Nếu đang refresh, chờ token mới rồi trả lại
      return new Promise((resolve) => {
        addSubscriber(resolve);
      });
    }

    isRefreshing = true;

    const oldToken = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      const res = await fetch("http://localhost:5230/api/Account/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: oldToken, refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh thất bại");

      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      onRefreshed(data.accessToken); // Thông báo token mới cho tất cả request đang chờ

      return data.accessToken;
    } catch (err) {
      console.error("❌ Không thể refresh token:", err);
      logout();
      return null;
    } finally {
      isRefreshing = false;
    }
  };

  const ensureTokenValid = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      // Nếu còn < 60s là coi như sắp hết hạn
      if (decoded.exp - now < 60) {
        console.log("🔁 Token sắp hết, đang làm mới...");
        const newToken = await refreshAccessToken();
        if (newToken) {
          await getProfile(newToken);
          return newToken;
        } else {
          logout();
          return null;
        }
      }

      return token;
    } catch (err) {
      logout();
      return null;
    }
  };

  return {
    user,
    login,
    logout,
    register,
    getProfile,
    refreshAccessToken,
    ensureTokenValid,
  };
}
