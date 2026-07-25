// Service xử lý các API liên quan đến đơn hàng
import axiosClient from "./axiosClient";

const ENDPOINT = "/Order";

// Tạo đơn hàng mới (qua checkout)
export const createOrder = async (data) => {
  return await axiosClient.post(`/Checkout/checkout`, data);
};

// Lấy danh sách đơn hàng (có params lọc/phân trang)
export const getOrders = async (params) => {
  return await axiosClient.get(`${ENDPOINT}/my-orders`, { params });
};

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = async (id) => {
  return await axiosClient.get(`${ENDPOINT}/detail/user/${id}`);
};

// Hủy đơn hàng
export const cancelOrder = async (id) => {
  return await axiosClient.put(`${ENDPOINT}/cancel/${id}`);
};

export const OrderApi = async (pageNumber, pageSize, status) => {
  const params = { pageNumber, pageSize };
  if (status) params.status = status;
  return await getOrders(params);
};

export const getOrderDetail = async (id) => {
  return await getOrderById(id);
};

export const ConfirmReceivedOrder = async (orderId) => {
  return await axiosClient.put(`${ENDPOINT}/user-confirm/${orderId}`);
};
