// Service xử lý các API liên quan đến tài khoản người dùng
import axiosClient from "./axiosClient";

const ENDPOINT = "/Account";

// Cập nhật thông tin hồ sơ người dùng
export const updateProfile = async (data) => {
  return await axiosClient.put(`${ENDPOINT}/profile`, data);
};

// Đổi mật khẩu
export const changePassword = async (data) => {
  return await axiosClient.post(`${ENDPOINT}/change-password`, data);
};
