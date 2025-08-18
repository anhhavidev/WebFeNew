import axios from 'axios';
const API = "http://localhost:5230/api/Order";
export async function GetAllOrder(pageNumber , pageSize , token){
    try {
    const respone = await axios.get(`${API}/all`,{
        params: {
        pageNumber,
        pageSize
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
export async function UpdateOrderStatus(orderId, status, token) {
  const res = await fetch(`http://localhost:5230/api/Order/update-status/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (!res.ok) {
    throw new Error("Không thể cập nhật trạng thái");
  }

  return await res.json();
}

