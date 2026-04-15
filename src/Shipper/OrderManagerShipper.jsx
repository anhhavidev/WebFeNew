import React, { useEffect, useState } from "react";
import { GetOrdersForShipper, StartShipping, UpdateDeliveryStatus } from "../Service/Shipper/OrderShipperApi";
import useAuth from "../Hooks/useAuth";
import { FiPackage, FiTruck, FiCheck, FiX, FiMapPin, FiPhone, FiUser, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

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
          setTotalPages(result.data.totalPages || 1);
        } else {
          toast.error(result.message || "Không thể lấy danh sách đơn hàng.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn:", err);
        toast.error("Lỗi kết nối máy chủ");
      }
    };

    fetchOrders();
  }, [pageNumber, pageSize]);


  const handleStartShipping = async (orderId) => {
    const result = await MySwal.fire({
      title: "Bắt đầu giao hàng?",
      text: "Xác nhận bạn đã nhận hàng và bắt đầu di chuyển!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Bắt đầu ngay",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#2563eb",
      borderRadius: "15px"
    });

    if (result.isConfirmed) {
      const token = await ensureTokenValid();
      const loadingToast = toast.loading("Đang cập nhật...");
      try {
        const result = await StartShipping(orderId, token);
        if (result.isSuccess) {
          toast.success("Đã chuyển trạng thái Đang giao hàng!", { id: loadingToast });
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === orderId ? { ...o, status: "Shipping", shippingStartAt: new Date() } : o
            )
          );
        } else {
          toast.error(result.message, { id: loadingToast });
        }
      } catch (err) {
        console.error(err);
        toast.error("Thao tác thất bại", { id: loadingToast });
      }
    }
  };

  const handleUpdateDelivery = async (orderId, success) => {
    let failReason = "";
    
    if (!success) {
      const { value: reason } = await MySwal.fire({
        title: "Lý do giao thất bại",
        input: "textarea",
        inputLabel: "Vui lòng nhập lý do cụ thể",
        inputPlaceholder: "Ví dụ: Khách không nghe máy, Sai địa chỉ...",
        inputAttributes: {
          'aria-label': 'Nhập lý do của bạn'
        },
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Quay lại",
        confirmButtonColor: "#dc2626",
        borderRadius: "15px",
        inputValidator: (value) => {
          if (!value) {
            return 'Bạn cần nhập lý do để tiếp tục!';
          }
        }
      });
      
      if (reason) {
        failReason = reason;
      } else {
        return; // Người dùng nhấn hủy
      }
    } else {
      const confirm = await MySwal.fire({
        title: "Xác nhận thành công?",
        text: "Bạn chắc chắn đã giao hàng đến tay khách?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        borderRadius: "15px"
      });
      if (!confirm.isConfirmed) return;
    }

    const token = await ensureTokenValid();
    const loadingToast = toast.loading("Đang cập nhật kết quả...");
    try {
      const result = await UpdateDeliveryStatus(orderId, success, failReason, token);
      if (result.isSuccess) {
        toast.success(success ? "Giao hàng thành công!" : "Đã ghi nhận giao thất bại", { id: loadingToast });
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? { ...o, status: success ? "Delivered" : "FailedDelivery" }
              : o
          )
        );
      } else {
        toast.error(result.message, { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại", { id: loadingToast });
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
