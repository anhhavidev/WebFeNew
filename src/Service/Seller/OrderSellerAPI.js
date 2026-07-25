// Service Seller quản lý đơn hàng của shop
import axios from 'axios';

const API = "http://localhost:5230/api/Seller";

// Lấy danh sách đơn hàng của seller (phân trang + bộ lọc)
export async function GetAllOrderSeller(pageNumber, pageSize, token, filters = {}) {
  try {
    const respone = await axios.get(`${API}/Order-Seller`, {
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
// Cập nhật trạng thái đơn hàng (xác nhận, đóng gói, giao hàng...)
export async function UpdateOrderStatus(orderId, Status , token) {
  console.log(JSON.stringify({ Status }))
  const res = await fetch(`http://localhost:5230/api/Order/update-status/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ Status  })
  });

  if (!res.ok) {
    throw new Error("Không thể cập nhật trạng thái");
  }

  return await res.json();
}

// Lấy chi tiết đơn hàng cho seller
export async function getOrderDetaiSeller(orderId,token){
  const res = await fetch(`${API}/Order-Seller/${orderId}`, {
        method: "GET",  // GET thay vì PUT
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Lấy chi tiết đơn hàng thất bại");
    return await res.json();
}
// Lấy dữ liệu thống kê dashboard của seller
export async function GetSellerDashboard(filter, from, to, token) {
  try {
    const response = await axios.get(`${API}/dashboard`, {
      params: { filter, from, to },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dashboard seller:", error);
    throw error;
  }
}