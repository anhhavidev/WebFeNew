// Axios client dùng chung cho toàn bộ ứng dụng
// Tự động gắn token JWT vào header, xử lý lỗi 401 và refresh token
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5230/api";

// Tạo instance axios với base URL và header mặc định
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor request: tự động gắn Bearer token từ localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: trả về data, xử lý lỗi 401 (logout + redirect)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
