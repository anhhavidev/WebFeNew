// Hook quản lý xác thực người dùng (login, register, logout, refresh token)
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../Service/axiosClient";

// Biến toàn cục chống gọi refresh token trùng lặp
let isRefreshing = false;
let refreshSubscribers = [];

// Thông báo token mới cho tất cả request đang chờ
function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// Đăng ký callback chờ token mới
function addSubscriber(callback) {
  refreshSubscribers.push(callback);
}

export default function useAuth() {
  const [user, setUser] = useState(null);

  // Đăng xuất: xóa token và thông tin người dùng khỏi localStorage
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("chatSessionId");
    setUser(null);
    console.warn("🚪 Đã logout vì token hết hạn hoặc lỗi.");
  };

  // Lấy thông tin hồ sơ người dùng từ API
  const getProfile = async (token) => {
    try {
      const result = await axiosClient.get("/Account/profile");

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

  // Đăng nhập với email và mật khẩu
  const login = async (email, password) => {
    try {
      const data = await axiosClient.post("/Account/signin", { email, password, method: "normal" });

      if (!data.isSuccess) {
        throw new Error(data.message || "Tài khoản hoặc mật khẩu không đúng!");
      }

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

  // Đăng ký tài khoản mới
  const register = async ({ email, password, confirmPassWord, fullName }) => {
  try {
    await axiosClient.post("/Account/signup", { email, password, confirmPassWord, fullName });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

  // Làm mới token JWT khi sắp hết hạn
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
      const data = await axiosClient.post("/Account/refresh-token", { token: oldToken, refreshToken });
      const tokens = data.data || data;
      localStorage.setItem("token", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      onRefreshed(tokens.accessToken);

      return tokens.accessToken;
    } catch (err) {
      console.error("❌ Không thể refresh token:", err);
      logout();
      return null;
    } finally {
      isRefreshing = false;
    }
  };

  // Kiểm tra token còn hạn không, tự động refresh nếu cần
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
