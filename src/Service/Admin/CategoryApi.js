import axios from "axios";

const API = "http://localhost:5230/api/Category";

// 🔹 Lấy tất cả Category (không cần token)
export async function GetAllCategory() {
  try {
    const response = await axios.get(`${API}/all`);
    return response.data; // { isSuccess, message, data }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách category:", error);
    return { isSuccess: false, message: "Lỗi khi lấy category", data: [] };
  }
}

// 🔹 Thêm Category (cần token)
export async function AddCategory(category, token) {
  try {
    const response = await axios.post(`${API}/Add-Category`, category, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm category:", error);
    return { isSuccess: false, message: "Thêm thất bại", data: null };
  }
}

// 🔹 Cập nhật Category (cần token)
export async function UpdateCategory(category, token) {
  try {
    const response = await axios.put(`${API}/Update`, category, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật category:", error);
    return { isSuccess: false, message: "Cập nhật thất bại", data: null };
  }
}

// 🔹 Xóa Category (cần token)
export async function DeleteCategory(id, token) {
  try {
    const response = await axios.delete(`${API}/Delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa category:", error);
    return { isSuccess: false, message: "Xóa thất bại", data: null };
  }
}
