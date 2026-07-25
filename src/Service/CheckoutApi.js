// Service xử lý checkout / thanh toán đơn hàng
import axiosClient from "./axiosClient";

// Tiến hành checkout với dữ liệu giỏ hàng và token
export async function checkoutOrder(data, token) {
  return await axiosClient.post("/Checkout/checkout", data);
}
