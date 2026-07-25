// Service Shipper quản lý đơn hàng vận chuyển
import axios from "axios";

const API = "http://localhost:5230/api/Shipper";

// Phân công shipper cho đơn hàng (Admin thực hiện)
export async function AssignShipperToOrder(orderId, shipperId, token) {
  try {
    const res = await axios.post(`${API}/assign`, null, {
      params: { orderId, shipperId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi phân công shipper:", error);
    throw error;
  }
}

// Lấy danh sách đơn hàng được gán cho shipper
export async function GetOrdersForShipper(token, pageNumber = 1, pageSize = 10, filters = {}) {
  try {
    const res = await axios.get(`${API}/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { 
        pageNumber, 
        pageSize,
        keyword: filters.keyword,
        status: filters.status
      } // 🔹 Gửi kèm query string
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đơn shipper:", error);
    throw error;
  }
}


// Bắt đầu quá trình giao hàng
export async function StartShipping(orderId, token) {
  try {
    const res = await axios.post(`${API}/start-shipping/${orderId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi bắt đầu giao hàng:", error);
    throw error;
  }
}

// Cập nhật kết quả giao hàng (thành công hoặc thất bại)
export async function UpdateDeliveryStatus(orderId, success, failReason, token) {
  try {
    const res = await axios.post(
      `${API}/update-delivery-status`,
      { orderId, success, failReason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái giao hàng:", error);
    throw error;
  }
}

// Lấy dữ liệu thống kê dashboard cho shipper
export async function GetShipperDashboard(from, to, token) {
  try {
    const res = await axios.get(`${API}/dashboard`, {
      params: { from, to },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy dashboard shipper:", error);
    throw error;
  }
}

// Lấy danh sách shipper đang sẵn sàng nhận đơn
export async function GetAvailableShippers(token) {
  try {
    const res = await axios.get(`${API}/available`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách shipper khả dụng:", error);
    throw error;
  }
}
