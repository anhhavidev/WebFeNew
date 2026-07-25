// Service Admin quản lý người dùng (CRUD + phân quyền)
const BASE_URL = "http://localhost:5230/api/Admin";

// Lấy danh sách người dùng (có phân trang)
export const getAllUsers = async (token, pageIndex = 1, pageSize = 100) => {
  const response = await fetch(`${BASE_URL}/get-all?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách user");
  return response.json();
};

// Lấy danh sách roles (vai trò)
export const getRoles = async (token) => {
  const response = await fetch(`${BASE_URL}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách roles");
  return response.json();
};

// Tạo người dùng mới
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

// Cập nhật thông tin người dùng
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

// Xóa người dùng
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

// Gán vai trò (role) cho người dùng
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

// Lấy thông tin người dùng theo ID
export const getUserById = async (userId, token) => {
  const response = await fetch(`${BASE_URL}/get-user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Lấy thông tin user thất bại");
  return response.json();
};
