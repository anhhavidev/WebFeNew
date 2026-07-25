// Service xử lý các API liên quan đến giỏ hàng
import axiosClient from "./axiosClient";

const ENDPOINT = "/Cart";

// Lấy danh sách sản phẩm trong giỏ hàng
export const getCart = async () => {
  return await axiosClient.get(`${ENDPOINT}/user`);
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (data) => {
  return await axiosClient.post(`${ENDPOINT}/add-to-cart`, data);
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (id, data) => {
  return await axiosClient.put(`${ENDPOINT}/update`, data);
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = async (id) => {
  return await axiosClient.delete(`${ENDPOINT}/remove/${id}`);
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
  return await axiosClient.delete(`${ENDPOINT}/clear`);
};

export const getCartItems = async (token) => {
  return await axiosClient.get(`${ENDPOINT}/user`);
};

export const addProductToCart = async (productId, quantity, token) => {
  return await axiosClient.post(`${ENDPOINT}/add-to-cart`, { productId, quantity });
};

export const removeFromCart = async (itemId, token) => {
  return await axiosClient.delete(`${ENDPOINT}/remove/${itemId}`);
};

export const syncCartToServer = async (items, token) => {
  return await axiosClient.post(`${ENDPOINT}/sync`, items);
};
