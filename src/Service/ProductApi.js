// Service xử lý các API liên quan đến sản phẩm
import axiosClient from "./axiosClient";

const ENDPOINT = "/Product";

// Lấy danh sách tất cả sản phẩm (có params lọc/phân trang)
export const getAllProducts = async (params) => {
  return await axiosClient.get(`${ENDPOINT}/paging`, { params });
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id) => {
  return await axiosClient.get(`${ENDPOINT}/${id}`);
};

// Tạo sản phẩm mới
export const createProduct = async (data) => {
  return await axiosClient.post(`${ENDPOINT}/add`, data);
};

// Cập nhật thông tin sản phẩm
export const updateProduct = async (id, data) => {
  return await axiosClient.put(`${ENDPOINT}/update/${id}`, data);
};

// Xóa sản phẩm (soft delete)
export const deleteProduct = async (id) => {
  return await axiosClient.delete(`${ENDPOINT}/${id}`);
};

export const getPaginatedProducts = async (filter) => {
  return await axiosClient.get(`${ENDPOINT}/paging`, { params: filter });
};

export const getProductsByCategory = async (categoryId) => {
  return await axiosClient.get(`${ENDPOINT}/paging`, { params: { CategoryId: categoryId } });
};

export const getPaginatedProductSeller = async (filter) => {
  return await axiosClient.get(`${ENDPOINT}/Seller/paging`, { params: filter });
};

export const getPaginatedProductAdmin = async (filter) => {
  return await axiosClient.get(`${ENDPOINT}/Admin/paging`, { params: filter });
};

export const addProduct = async (data) => {
  return await axiosClient.post(`${ENDPOINT}/add`, data);
};

export const toggleProductStatus = async (id) => {
  return await axiosClient.put(`${ENDPOINT}/toggle-status/${id}`);
};
