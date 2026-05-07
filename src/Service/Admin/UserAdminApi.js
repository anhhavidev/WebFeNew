// src/Service/Admin/UserAdminApi.js

const BASE_URL = "http://localhost:5230/api/Admin"; // sửa theo URL backend của bạn

// ✅ Lấy danh sách user (có phân trang)
export const getAllUsers = async (token, pageIndex = 1, pageSize = 100) => {
  const response = await fetch(`${BASE_URL}/get-all?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách user");
  return response.json();
};

// ✅ Lấy danh sách roles
export const getRoles = async (token) => {
  const response = await fetch(`${BASE_URL}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách roles");
  return response.json();
};

// ✅ Tạo user mới
export const createUser = async (userData, token) => {
  const response = await fetch(`${BASE_URL}/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error("Tạo user thất bại");
  return response.json();
};

// ✅ Cập nhật user
export const updateUser = async (id, userData, token) => {
  const payload = { ...userData, id: id };
  const response = await fetch(`${BASE_URL}/update-user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Cập nhật user thất bại");
  return response.json();
};

// ✅ Xóa user
export const deleteUser = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/delete-user/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Xóa user thất bại");
  return response.json();
};

// ✅ Gán role cho user
export const assignRole = async (userId, roleName, token) => {
  const response = await fetch(`${BASE_URL}/assign-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId, roleName })
  });
  if (!response.ok) throw new Error("Gán quyền thất bại");
  return response.json();
};

// ✅ Lấy user theo Id
export const getUserById = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/get-user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Lấy thông tin user thất bại");
  return response.json();
};
