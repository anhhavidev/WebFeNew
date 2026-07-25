// Service xử lý các API liên quan đến danh mục sản phẩm
import axiosClient from "./axiosClient";

const ENDPOINT = "/Category";

// Lấy danh sách danh mục (có hỗ trợ params lọc/phân trang)
export const getCategories = async (params) => {
  return await axiosClient.get(`${ENDPOINT}/all`, { params });
};

// Lấy chi tiết danh mục theo ID
export const getCategoryById = async (id) => {
  return await axiosClient.get(`${ENDPOINT}/${id}`);
};

// Tạo danh mục mới
export const createCategory = async (data) => {
  return await axiosClient.post(`${ENDPOINT}`, data);
};
export const addCategory = createCategory;
export const getAllCategories = getCategories;

// Cập nhật danh mục
export const updateCategory = async (id, data) => {
  return await axiosClient.put(`${ENDPOINT}/${id}`, data);
};

// Xóa danh mục (soft delete)
export const deleteCategory = async (id) => {
  return await axiosClient.delete(`${ENDPOINT}/${id}`);
};
