import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OrderApi } from "../../Service/OrderAPI"
import UserLayout from "../../layout1/UserLayout";
import CountdownTimer from "../../utils/CountdownTimer"; 
import useAuth from "../../Hooks/useAuth"; 
import Swal from "sweetalert2";
import axiosClient from "../../Service/axiosClient";
export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ensureTokenValid } = useAuth(); // ✅ lấy hàm từ hook
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8);
  function getStatusText(status) {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";
      case "Confirmed":
        return "Đã xác nhận";
      case "ReadyToShip":
        return "Đang chờ Shipper lấy hàng ";
      case "Assigned":
        return "Shipper đã nhận hàng ";
      case "Shipping":
        return "Đang giao hàng";
      case "Delivered":
        return "Đã giao hàng";
      case "Received":
        return "Đã nhận hàng";
      case "FailedDelivery":
        return "Giao thất bại";
      case "Cancelled":
        return "Đã hủy";
      case "PartiallyReceived":
        return "Một phần giao thành công ";
      case "PartiallyCancelled":
        return "Một phần giao thất bại ";
      default:
        return status;
    }
  }
  useEffect(() => {
    async function fetchOrders() {
      try {
        const statusParam = selectedStatus === "all" ? null : selectedStatus;
        const data = await OrderApi(pageNumber, pageSize, statusParam);
        setOrders(data.data?.items || []);
        setTotalPages(data.data?.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [pageNumber, selectedStatus]);
  async function handleConfirmDelivery(orderId) {
    const result = await Swal.fire({
      title: 'Xác nhận nhận hàng?',
      text: "Bạn chắc chắn đã nhận được toàn bộ gói hàng này?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đã nhận hàng',
      cancelButtonText: 'Chưa',
      background: '#fff',
      borderRadius: '15px'
    });

    if (!result.isConfirmed) return;

    try {
      const token = await ensureTokenValid();
      if (!token) return;

      const data = await axiosClient.put(`/Order/user-confirm/${orderId}`);
      if (data.isSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cảm ơn bạn đã xác nhận nhận hàng!',
          timer: 2000,
          showConfirmButton: false
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? { ...o, status: data.data.status, paymentStatus: data.data.paymentStatus }
              : o
          )
        );
      } else {
        Swal.fire('Lỗi', data.message || "Có lỗi xảy ra", 'error');
      }
    } catch (err) {
      Swal.fire('Lỗi', "Lỗi kết nối máy chủ", 'error');
    }
  }

  async function handleCancelOrder(orderId) {
    const result = await Swal.fire({
      title: 'Huỷ đơn hàng?',
      text: "Bạn có chắc chắn muốn huỷ đơn hàng này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đúng, huỷ ngay',
      cancelButtonText: 'Không, giữ lại',
      background: '#fff',
      borderRadius: '15px'
    });

    if (!result.isConfirmed) return;

    try {
      const token = await ensureTokenValid();
      if (!token) return;

      const data = await axiosClient.put(`/Order/cancel/${orderId}`);

      if (data.isSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Đã huỷ',
          text: 'Đơn hàng của bạn đã được huỷ thành công.',
          timer: 2000,
          showConfirmButton: false
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.parentOrderId === orderId
              ? { ...o, status: data.data.status, paymentStatus: data.data.paymentStatus }
              : o
          )
        );
      } else {
        Swal.fire('Thất bại', data.message || "Không thể huỷ đơn", 'error');
      }
    } catch (err) {
      Swal.fire('Lỗi', "Lỗi kết nối máy chủ", 'error');
    }
  }



  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);
  function handleExpire(orderId) {
    setOrders((prev) =>
      prev.map((o) =>
        o.parentOrderId === orderId
          ? { ...o, status: "Cancelled", paymentStatus: "Failed" }
          : o
      )
    );

    // Nếu dùng filteredOrders để hiển thị, cũng cập nhật luôn:
    setFilteredOrders((prev) =>
      prev.map((o) =>
        o.parentOrderId === orderId
          ? { ...o, status: "Cancelled", paymentStatus: "Failed" }
          : o
      )
    );
  }
  return (
    <UserLayout>
      <div className="cp-container">
        <h2 className="mb-4">🧾 Đơn hàng của tôi</h2>

        {/* Bộ lọc trạng thái */}
        <div className="mb-3">
          <label className="form-label">Lọc theo trạng thái:</label>
          <select
            className="form-select w-auto"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="all">Tất cả</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Shipping">Đang giao</option>
            <option value="Confirmed">Đang xử lý</option>
            <option value="Delivered">Đã giao</option>
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

                <th>Thanh toán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.parentOrderId}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString("vi-VN")}</td>
                  <td>{order.totalAmount.toLocaleString()}đ</td>
                  <td>{getStatusText(order.status)}</td>

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
                        to={`/user/orders/${order.parentOrderId}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Xem chi tiết
                      </Link>
                      {order.status === "Pending" && order.paymentStatus !== "Paid" && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelOrder(order.parentOrderId)}
                        >
                          Huỷ đơn
                        </button>
                      )}


                      {order.paymentStatus !== "Paid" && order.status === "Pending" && order.paymentMethod === "VnPay" ? (
                        <div className="text-center">
                          <Link to={`/payment/retry/${order.parentOrderId}`} className="btn btn-sm btn-primary mb-1">
                            Thanh toán lại
                            <div style={{ fontSize: "0.85rem" }}>
                              Còn lại:{" "}
                              <CountdownTimer
                                expireTime={order.orderExpireTime}
                                onExpire={() => handleExpire(order.parentOrderId)} // ✅ dùng order.parentOrderId
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
