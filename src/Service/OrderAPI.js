import axios from "axios";
export async function OrderApi(pageNumber = 1, pageSize = 10) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5230/api/Order/my-orders?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Không thể tải đơn hàng");

        const data = await res.json();

        // Trả toàn bộ data để dùng được phân trang
        return data.data; // gồm: items, pageNumber, totalPages, ...
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getOrderDetail(orderId, token) {
  try {
    const response = await fetch(
      `http://localhost:5230/api/Order/detail/user/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Không thể tải đơn hàng");

    const dulieu = await response.json();
    return dulieu.data; // Chứa order: { orderDate, namePayment, items: [...] }
  } catch (ex) {
    throw new Error(ex.message);
  }
}

export async function CancelOrderUser(orderId) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5230/api/Order/cancel/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Không thể hủy đơn hàng");
    return await res.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function createVnpayUrl(orderId, token) {
        const res = await fetch(`http://localhost:5230/api/payment/create-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: orderId,
                orderType: "other" // đúng theo BE yêu cầu
            })
        });

        const data = await res.json();
        return data.paymentUrl;
    }
// export async function HandelCancelOrder(token,orderId){
//   const fetchdata = fetch()
// }
export async function ConfirmReceivedOrder(orderId) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5230/api/Order/user-confirm/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.isSuccess) {
      throw new Error(data.message || "Không thể xác nhận đã nhận hàng");
    }

    return data; // Trả về { isSuccess, message, data }
  } catch (err) {
    throw new Error(err.message);
  }
}
