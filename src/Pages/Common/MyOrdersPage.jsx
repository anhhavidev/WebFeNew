import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OrderApi } from "../../Service/OrderAPI"
import UserLayout from "../../layout1/UserLayout";
import CountdownTimer from "../../utils/CountdownTimer"; // hoặc đúng đường dẫn bạn lưu

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8);
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await OrderApi(pageNumber, pageSize);
        setOrders(data.items);
        setTotalPages(data.totalPages); // cần backend trả về
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [pageNumber]);
  async function handleConfirmDelivery(orderId) {
    if (!window.confirm("Bạn chắc chắn đã nhận được hàng?")) return;

    try {
      const res = await fetch(`/api/Order/user-confirm/${orderId}`, {
        method: "PUT",
      });

      const data = await res.json();
      if (res.ok) {
        alert("Cảm ơn bạn đã xác nhận!");
        // reload lại đơn hàng
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, status: "Delivery" } : o
          )
        );
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  }
  async function handleCancelOrder(orderId) {
    if (!window.confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;

    try {
      const res = await fetch(`/api/Order/cancel/${orderId}`, {
        method: "PUT",
      });

      const data = await res.json();
      if (res.ok) {
        alert("Đã huỷ đơn hàng");

        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? {
                ...o,
                status: "Cancelled",
                paymentStatus: o.paymentStatus === "Paid"
                  ? o.paymentStatus
                  : "Failed",
              }
              : o
          )
        );
      } else {
        alert(data.message || "Không thể huỷ đơn");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  }


  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.orderStatus === selectedStatus));
    }
  }, [selectedStatus, orders]);

  return (
    <UserLayout>
      <div className="container mt-5">
        <h2 className="mb-4">🧾 Đơn hàng của tôi</h2>

        {/* Bộ lọc trạng thái */}
        <div className="mb-3">
          <label className="form-label">Lọc theo trạng thái:</label>
          <select
            className="form-select w-auto"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Shipping">Đang giao</option>
            <option value="Completed">Đã giao</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>

        {loading && <div className="alert alert-info">Đang tải...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && filteredOrders.length === 0 && (
          <div className="alert alert-warning">Không có đơn hàng nào phù hợp.</div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <table className="table table-bordered table-hover text-center">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Phương thức thanh toán  </th>
                <th>Thanh toán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{new Date(order.orderDat).toLocaleDateString("vi-VN")}</td>
                  <td>{order.totalAmount.toLocaleString()}đ</td>
                  <td>{order.status}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {order.paymentStatus === "Paid"
                      ? "Đã thanh toán"
                      : order.paymentStatus === "Failed"
                        ? "Thanh toán thất bại"
                        : "Chưa thanh toán"}
                  </td>


                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Link
                        to={`/user/orders/${order.orderId}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Xem chi tiết
                      </Link>
                      {order.status === "Pending" && order.paymentStatus !== "Paid" && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelOrder(order.orderId)}
                        >
                          Huỷ đơn
                        </button>
                      )}
                      {order.paymentStatus !== "Paid" && order.status === "Pending" && order.paymentMethod ==="VnPay"  ? (
                        <div className="text-center">
                          <Link to={`/payment/retry/${order.orderId}`} className="btn btn-sm btn-primary mb-1">
                            Thanh toán lại
                            <div style={{ fontSize: "0.85rem" }}>
                              Còn lại:{" "}
                              <CountdownTimer
                                expireTime={order.orderExpireTime}
                                onExpire={() => {
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o.orderId === order.orderId
                                        ? {
                                          ...o,
                                          status: "Cancelled",
                                          paymentStatus: "Failed",
                                        }
                                        : o
                                    )
                                  );
                                }}
                              />
                            </div>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {order.status === "Cancelled" && (
                            <span className="btn badge bg-danger">Đã hủy</span>
                          )}
                        </>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPageNumber(p => p - 1)}>Trước</button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${pageNumber === index + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPageNumber(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${pageNumber === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPageNumber(p => p + 1)}>Tiếp</button>
              </li>
            </ul>
          </nav>
        </div>

      </div>
    </UserLayout>
  );
}
