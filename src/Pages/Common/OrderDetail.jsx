import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetail, ConfirmReceivedOrder } from "../../Service/OrderAPI";
import "./OrderDetail.css";
import UserLayout from "../../layout1/UserLayout";
import useAuth from "../../Hooks/useAuth";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function OrderDetail() {
  const { orderId } = useParams(); // lấy từ URL (parentOrderId)
  const [orderDetail, setOrderDetail] = useState(null);

  const { ensureTokenValid } = useAuth();

  useEffect(() => {
    async function fetchOrder() {
      const token = await ensureTokenValid();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        if (!orderId) return;
        const res = await getOrderDetail(orderId, token);
        console.log("API trả về:", res);
        setOrderDetail(res.data || res);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      }
    }

    fetchOrder();
  }, [orderId]);

  // 🔹 Hàm hiển thị trạng thái tiếng Việt
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
  function getPaymentStatusText(status) {
    switch (status) {
      case "Unpaid":
        return "Chưa thanh toán";
      case "Paid":
        return "Đã thanh toán";
      case "Failed":
        return "Thanh toán thất bại ";
      default:
        return status;
    }
  }
  // 🔹 Hàm xử lý khi người dùng xác nhận đã nhận hàng
  // 🔹 Hàm xử lý khi người dùng xác nhận đã nhận hàng
  async function handleConfirmReceived(orderChildId) {
    const confirm = await Swal.fire({
      title: 'Xác nhận nhận hàng',
      text: 'Bạn có chắc chắn đã nhận được đơn hàng này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đã nhận hàng',
      cancelButtonText: 'Chưa',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    });

    if (!confirm.isConfirmed) return;

    try {
      const result = await ConfirmReceivedOrder(orderChildId);
      toast.success(result.message || "Xác nhận đơn hàng thành công!");

      // ✅ Cập nhật lại trạng thái đơn ngay trên giao diện
      setOrderDetail((prev) => ({
        ...prev,
        childOrders: prev.childOrders.map((child) =>
          child.orderId === orderChildId
            ? {
              ...child,
              orderStatus: result.data.status, // cập nhật trạng thái đơn con
              paymentStatus: result.data.paymentStatus, // nếu có
            }
            : child
        ),
      }));
    } catch (error) {
      toast.error("❌ Xác nhận thất bại: " + error.message);
    }
  }


  if (!orderDetail) return <div>Đang tải đơn hàng...</div>;

  return (
    <UserLayout>
      <div className="cp-container">
        <h3>🧾 Chi tiết đơn hàng #{orderDetail.parentOrderId}</h3>
        <form className="border p-4 rounded shadow-sm bg-light">
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Mã đơn hàng cha:</label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control"
                value={`#${orderDetail.parentOrderId}`}
              />
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Trạng thái:</label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control"
                value={getStatusText(orderDetail.status)}
              />
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Thanh toán:</label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control"
                value={getPaymentStatusText(orderDetail.paymentStatus)}
              />
            </div>
          </div>
          {/* 🔹 Thêm lý do huỷ của đơn hàng cha */}
          {orderDetail.status === "Cancelled" && (
            <p className="text-red-600">
              <strong>Lý do hủy: </strong>
              {orderDetail.cancelReason || "Không có lý do"}
            </p>
          )}

          <hr />
          <h5>📦 Đơn hàng con</h5>

          {orderDetail.childOrders.map((child, idx) => (
            <div key={idx} className="mb-4 p-3 border rounded bg-white">
              <h6>🛍️ Cửa hàng: {child.tenCuaHang}</h6>
              <p>Mã đơn con: #{child.orderId}</p>
              <p>Người nhận: {child.hoTen} - {child.sdt}</p>
              <p>Trạng thái: {getStatusText(child.orderStatus)}</p>
              <p>Trạng thái thanh toán  : {getPaymentStatusText(child.paymentStatus)}</p>
              {/* 🔹 Hiển thị lý do hủy từng đơn con (nếu có) */}
              {child.orderStatus === "Cancelled" && (
                <p className="text-red-500">
                  Lý do huỷ: {child.cancelReason || "Không có lý do"}
                </p>
              )}
              <h6>Sản phẩm:</h6>
              {child.items.map((item, index) => (
                <div key={index} className="d-flex border p-2 mb-2 rounded align-items-center">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      marginRight: "15px",
                      border: "1px solid #ddd",
                    }}
                  />
                  <div className="flex-grow-1">
                    <div>
                      <strong>{item.productName}</strong>
                    </div>
                    <div>
                      Số lượng: {item.quantity} ×{" "}
                      {item.unitPrice.toLocaleString()}đ
                    </div>
                    <div>
                      {(item.quantity * item.unitPrice).toLocaleString()}đ
                    </div>
                  </div>
                </div>
              ))}

              <p className="mt-2">Tổng sản phẩm: {child.totalPriceProducts.toLocaleString()}đ</p>
              <p>Phí giao hàng: {child.phiGiaoHang.toLocaleString()}đ</p>
              <p><strong>Tổng cộng: {child.totalAmount.toLocaleString()}đ</strong></p>
              {/* --- Nút xác nhận nhận hàng nếu đã giao --- */}
              {child.orderStatus === "Delivered" && (
                <button
                  className="btn btn-success mt-2"
                  onClick={() => handleConfirmReceived(child.orderId)}
                >
                  ✅ Xác nhận đã nhận hàng
                </button>
              )}
            </div>
          ))}

          <hr />
          <h5>💰 Tổng kết đơn hàng cha</h5>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Phí giao hàng:</label>
            <div className="col-sm-10">
              <input
                readOnly
                className="form-control"
                value={`${orderDetail.totalShippingFee.toLocaleString()}đ`}
              />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label fw-bold">Tổng cộng:</label>
            <div className="col-sm-10">
              <input
                readOnly
                className="form-control fw-bold"
                value={`${orderDetail.totalAmount.toLocaleString()}đ`}
              />
            </div>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
