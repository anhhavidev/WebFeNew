import React, { useEffect, useState } from "react";
import { GetOrdersForShipper, StartShipping, UpdateDeliveryStatus } from "../Service/Shipper/OrderShipperApi";
import useAuth from "../Hooks/useAuth";

export default function OrderManagerShipper() {
  const [orders, setOrders] = useState([]);
  const { ensureTokenValid } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
  const fetchOrders = async () => {
    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const result = await GetOrdersForShipper(token, pageNumber, pageSize);
      if (result.isSuccess) {
        setOrders(result.data.items || []);
         setTotalPages(result.data.totalPages || 1); // ✅ Lưu tổng số trang
      } else {
        alert(result.message || "Không thể lấy danh sách đơn hàng.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn:", err);
    }
  };

  fetchOrders();
}, [pageNumber, pageSize]); // ✅ thêm dependency để gọi lại khi đổi trang


  const handleStartShipping = async (orderId) => {
    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const result = await StartShipping(orderId, token);
      if (result.isSuccess) {
        alert("Bắt đầu giao hàng thành công!");
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, status: "Shipping", shippingStartAt: new Date() } : o
          )
        );
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDelivery = async (orderId, success) => {
    const token = await ensureTokenValid();
    if (!token) return;

    let failReason = "";
    if (!success) {
      failReason = prompt("Nhập lý do giao thất bại:");
      if (!failReason) return;
    }

    try {
      const result = await UpdateDeliveryStatus(orderId, success, failReason, token);
      if (result.isSuccess) {
        alert(result.data?.message || "Cập nhật kết quả thành công!");
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? { ...o, status: success ? "Delivered" : "FailedDelivery" }
              : o
          )
        );
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusMap = {
    Assigned: "Đã được gán",
    Shipping: "Đang giao hàng",
    Delivered: "Đã giao thành công",
    FailedDelivery: "Giao thất bại",
    Received: "Khách hàng đã nhận hàng",
    Cancelled: "Đã hủy "
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">🚚 Quản lý đơn hàng của Shipper</h4>
      <table className="table table-bordered align-middle text-center">
        <thead className="table-info">
          <tr>
            <th>Mã đơn</th>
            <th>Tên KH</th>
            <th>Địa chỉ</th>
            <th>SĐT</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày giao</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Không có đơn hàng nào
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.orderId}>
                <td>{o.orderId}</td>
                <td>{o.customerName}</td>
                <td>{o.address}</td>
                <td>{o.phoneNumber}</td>
                <td>{o.totalAmount.toLocaleString("vi-VN")}₫</td>
                <td>{statusMap[o.status] || o.status}</td>
                <td>
                  {o.deliveredAt
                    ? new Date(o.deliveredAt).toLocaleDateString("vi-VN")
                    : o.shippingStartAt
                      ? new Date(o.shippingStartAt).toLocaleDateString("vi-VN")
                      : "—"}
                </td>
                <td>
                  {o.status === "Assigned" && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleStartShipping(o.orderId)}
                    >
                      Bắt đầu giao
                    </button>
                  )}
                  {o.status === "Shipping" && (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleUpdateDelivery(o.orderId, true)}
                      >
                        Giao thành công
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleUpdateDelivery(o.orderId, false)}
                      >
                        Giao thất bại
                      </button>
                    </>
                  )}
                  {(o.status === "Delivered" || o.status === "FailedDelivery" || o.status === "Received") && (
                    <span className="text-muted">Hoàn tất</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    <div className="d-flex justify-content-between align-items-center mt-3">
  <button
    className="btn btn-outline-primary"
    disabled={pageNumber === 1}
    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
  >
    ◀ Trang trước
  </button>

  <span>
    Trang <strong>{pageNumber}</strong> / {totalPages}
  </span>

  <button
    className="btn btn-outline-primary"
    disabled={pageNumber >= totalPages} // ✅ Không cho sang nếu đã tới trang cuối
    onClick={() => setPageNumber((prev) => prev + 1)}
  >
    Trang sau ▶
  </button>
</div>


    </div>
  );
}
