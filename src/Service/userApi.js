import axios from "axios";

const API_URL = "http://localhost:5230/api/Acount"; // 👈 thay đúng baseUrl backend của bạn

// Cập nhật thông tin user
export const updateProfile = async (token, data) => {
  return await axios.put(`${API_URL}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Đổi mật khẩu
export const changePassword = async (token, data) => {
  return await axios.post(`${API_URL}/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
