// Service Admin quản lý danh mục sản phẩm (CRUD)
import axiosClient from "../axiosClient";

const API = "/Category";

// Lấy tất cả danh mục (không yêu cầu token)
export async function GetAllCategory() {
  try {
    const response = await axiosClient.get(`${API}/all`);
    return response.data; // { isSuccess, message, data }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách category:", error);
    return { isSuccess: false, message: "Lỗi khi lấy category", data: [] };
  }
}

// Thêm danh mục mới (yêu cầu token admin)
export async function AddCategory(category, token) {
  try {
    const response = await axiosClient.post(`${API}`, category, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm category:", error);
    return { isSuccess: false, message: "Thêm thất bại", data: null };
  }
}

// Cập nhật thông tin danh mục (yêu cầu token admin)
export async function UpdateCategory(category, token) {
  try {
    const response = await axiosClient.put(`${API}/${category.id}`, category, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật category:", error);
    return { isSuccess: false, message: "Cập nhật thất bại", data: null };
  }
}

// Xóa danh mục (yêu cầu token admin)
export async function DeleteCategory(id, token) {
  try {
    const response = await axiosClient.delete(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa category:", error);
    return { isSuccess: false, message: "Xóa thất bại", data: null };
  }
}
