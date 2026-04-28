import axios from "axios";

const API_URL = "http://localhost:5230/api/Account"; // 👈 Sửa lỗi chính tả Acount -> Account để khớp với Backend mới

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
