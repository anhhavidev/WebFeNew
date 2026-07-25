// Service xử lý thanh toán (VNPay, COD...)
import axiosClient from "./axiosClient";

const ENDPOINT = "/Paymentest";

// Tạo yêu cầu thanh toán mới
export const createPayment = async (data) => {
  return await axiosClient.post(`${ENDPOINT}/create`, data);
};

// Xử lý kết quả trả về từ VNPay sau khi thanh toán
export const processVnpayReturn = async (params) => {
  return await axiosClient.get(`${ENDPOINT}/callback`, { params });
};

export const createPaymentUrl = async (orderId, method, token) => {
  const response = await axiosClient.post(`${ENDPOINT}/create`, { orderId, method });
  return response;
};
