// Service Admin quản lý đơn hàng
import axios from 'axios';
const API = "http://localhost:5230/api/Admin";

// Lấy tất cả đơn hàng (phân trang + bộ lọc)
export async function GetAllOrder(pageNumber, pageSize, token, filters = {}) {
  try {
    const respone = await axios.get(`${API}/GetOrderAdmin`, {
      params: {
        pageNumber,
        pageSize,
        keyword: filters.keyword,
        status: filters.status,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      },
      headers: {
        Authorization: `Bearer ${token}` // ⚠️ token admin (nếu API yêu cầu)
      }
    });
    return respone.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    throw error;
  }
}
// Lấy chi tiết đơn hàng (ParentOrder) cho Admin
export async function GetOrderDetailAdmin(parentorderid, token) {
  try {
    const respone = await axios.get(`${API}/GetOrderAdmin/${parentorderid}`, {
      method: "GET",  // GET thay vì PUT
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return respone.data; // ✅ Trả về data luôn, dạng { isSuccess, message, data }
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    throw error;
  }
}
// Admin hủy đơn hàng
export async function CancelOrderAdmin(orderId, reason, token) {
  const res = await fetch(`http://localhost:5230/api/Order/cancel-admin/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(reason) // chỉ stringify chuỗi, không bọc thêm object
  });
  if (!res.ok) throw new Error("Hủy đơn thất bại");
  return await res.json();
}
