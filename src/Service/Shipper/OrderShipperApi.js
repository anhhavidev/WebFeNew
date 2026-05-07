import axios from "axios";

const API = "http://localhost:5230/api/Shipper";

/* --------------------------------------------
1️⃣ Phân công shipper cho đơn hàng (Admin)
POST /api/shipper/assign?orderId=1&shipperId=abc123
-------------------------------------------- */
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

/* --------------------------------------------
2️⃣ Lấy danh sách đơn của shipper
GET /api/shipper/my-orders
-------------------------------------------- */
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


/* --------------------------------------------
3️⃣ Bắt đầu giao hàng
POST /api/shipper/start-shipping/{orderId}
-------------------------------------------- */
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

/* --------------------------------------------
4️⃣ Cập nhật kết quả giao hàng
POST /api/shipper/update-delivery-status
-------------------------------------------- */
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

/* --------------------------------------------
5️⃣ Lấy dashboard cho shipper
GET /api/shipper/dashboard?from=2025-10-01&to=2025-10-10
-------------------------------------------- */
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

/* --------------------------------------------
6️⃣ Lấy danh sách shipper khả dụng (Admin/Seller)
GET /api/shipper/available
-------------------------------------------- */
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
