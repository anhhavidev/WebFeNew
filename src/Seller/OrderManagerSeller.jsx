import React, { useEffect, useState } from "react";
import { GetAllOrderSeller, getOrderDetaiSeller } from "../Service/Seller/OrderSellerAPI";
import { GetAvailableShippers, AssignShipperToOrder } from "../Service/Shipper/OrderShipperApi";
import { UpdateOrderStatus } from "../Service/Seller/OrderSellerAPI";
import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function OrderManagerSeller() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempStatuses, setTempStatuses] = useState({});
  const [selectedShippers, setSelectedShippers] = useState({});
  const [shippers, setShippers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { ensureTokenValid } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = await ensureTokenValid();
      if (!token) return;

      try {
        const data = await GetAllOrderSeller(currentPage, 5, token);
        setOrders(
          data.items.map((item) => ({
            ...item,
            originalStatus: item.status, // thêm trường 
          }))
        );
        setTotalPages(data.totalPages);

        // Lấy danh sách shipper khả dụng
        const shipperList = await GetAvailableShippers(token);
        setShippers(shipperList.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleViewOrder = async (orderId) => {
    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const res = await getOrderDetaiSeller(orderId, token);
      if (res.isSuccess) {
        setSelectedOrder(res.data);
        setShowModal(true); // mở modal
      } else {
        alert(res.message || "Không thể lấy chi tiết đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lấy chi tiết đơn hàng.");
    }
  };

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

      default:
        return status;
    }
  }
  const handleUpdateStatus = async (orderId, newStatus, originalStatus, index) => {
    if (newStatus === originalStatus) {
      alert("Bạn chưa thay đổi trạng thái.");
      return;
    }

    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const result = await UpdateOrderStatus(orderId, newStatus, token);
      if (result.isSuccess) {
        alert("Cập nhật trạng thái thành công!");
        setOrders((prev) => {
          const updated = [...prev]; //tạo bảng sao mảng 
          updated[index].status = newStatus; //tại vị trí index hình như là được chọn 
          updated[index].originalStatus = newStatus;
          return updated;
        });
        setTempStatuses((prev) => {
          const clone = { ...prev }; // tạo bản sao object , lưu trajgn thái cập nhập tạm thời khi người dùng chưa bấm lưu 
          delete clone[index];
          return clone;
        });
      } else {
        alert(result.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại.");
    }
  };

  const handleAssignShipper = async (orderId, shipperId, index) => {
    if (!shipperId) {
      alert("Vui lòng chọn shipper!");
      return;
    }

    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const result = await AssignShipperToOrder(orderId, shipperId, token);
      if (result.isSuccess) {
        alert("Gán shipper thành công!");
        setOrders((prev) => {
          const updated = [...prev];
          updated[index].assignedShipper = result.data?.fullName || "Đã gán shipper";
          updated[index].status = "Assigned"; // ✅ vì backend set Assigned, không phải ReadyToShip
          updated[index].originalStatus = "Assigned";
          return updated;
        });
        // ✅ Cập nhật activeOrderCount của shipper trong dropdown
      setShippers((prev) =>
        prev.map((s) =>
          s.shipperId === shipperId
            ? { ...s, activeOrderCount: (s.activeOrderCount || 0) + 1 }
            : s
        )
      );
      } else {
        alert(result.message || "Không thể gán shipper.");
      }
    } catch (err) {
      console.error(err);
      alert("Gán shipper thất bại.");
    }
  };

  const handleTempStatusChange = (index, newStatus) => {
    setTempStatuses((prev) => ({
      ...prev,
      [index]: newStatus,
    }));
  };
  const statusMap = {
    Pending: "Chờ xác nhận",
    Confirmed: "Đã xác nhận",
    ReadyToShip: "Sẵn sàng giao",
    Assigned: "Đã gán shipper",
    Shipping: "Đang giao hàng",
    Delivered: "Đã giao",
    Received: "Đã nhận hàng",
    FailedDelivery: "Giao thất bại",
    Cancelled: "Đã hủy",
  };


  const getNextValidStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Confirmed"];
      case "Confirmed":
        return ["ReadyToShip"];
      case "ReadyToShip":
        return ["Assigned"];

      default:
        return [];
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">📦 Quản lý đơn hàng</h4>
      <table className="table table-bordered align-middle text-center">
        <thead className="table-primary">
          <tr>
            <th>Mã đơn</th>
            <th>Email KH</th>

            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Shipper</th>
            <th>Hành động</th>
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
            orders.map((item, index) => ( //index thao tác với dòng nào 
              <tr key={item.orderId}>
                <td>{item.orderId}</td>
                <td>{item.buyerEmail}</td>

                <td>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>{item.totalAmount.toLocaleString("vi-VN")}₫</td>
                <td>{getPaymentStatusText(item.paymentStatus)}</td>
                <td>
                  <select
                    className="form-select w-auto mx-auto"
                    value={tempStatuses[index] || item.status}
                    onChange={(e) => handleTempStatusChange(index, e.target.value)}
                    disabled={
                      ["ReadyToShip", "Shipping", "Delivered", "FailedDelivery", "Canceled"].includes(item.status)
                      || item.paymentStatus === "Failed" // ❌ khóa khi thanh toán thất bại
                    }
                  >
                    <option value={item.status}>{statusMap[item.status]}</option>
                    {getNextValidStatuses(item.status)
                      .filter((status) => status !== item.status)
                      .map((status) => (
                        <option key={status} value={status}>
                          {statusMap[status]}
                        </option>
                      ))}
                  </select>
                </td>


                {/* Phân công shipper */}
                <td>
                  {item.assignedShipper ? (
                    <span className="text-success">{item.assignedShipper}</span>
                  ) : item.status === "ReadyToShip" ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={selectedShippers[index] || ""}
                        onChange={(e) =>
                          setSelectedShippers((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Chọn shipper --</option>
                        {shippers.map((s) => (
                          <option key={s.shipperId} value={s.shipperId}>
                            {s.fullName} ({s.activeOrderCount} đơn đang giao)
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() =>
                          handleAssignShipper(item.orderId, selectedShippers[index], index)
                        }
                        disabled={item.status !== "ReadyToShip"} // ✅ chỉ cho phép gán khi đã sẵn sàng giao
                      >
                        Gán
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>


                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => handleViewOrder(item.orderId)}
                  >
                    🔍 Xem
                  </button>

                  {["Pending", "Confirmed"].includes(item.status) && item.paymentStatus !== "Failed" && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() =>
                        handleUpdateStatus(
                          item.orderId,
                          tempStatuses[index] || item.status,
                          item.originalStatus,
                          index
                        )
                      }
                    >
                      Cập nhật
                    </button>
                  )}

                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng #{selectedOrder.orderId}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>👤 Khách hàng:</strong> {selectedOrder.buyerName}</p>
                <p><strong>📧 Email:</strong> {selectedOrder.buyerEmail}</p>
                <p><strong>📞 SĐT:</strong> {selectedOrder.buyerPhone}</p>
                <p><strong>📦 Trạng thái:</strong> {getStatusText(selectedOrder.status)}</p>
                <p><strong>💰 Thanh toán:</strong> {getPaymentStatusText(selectedOrder.paymentStatus)}</p>
                <p><strong>🚚 Phí vận chuyển:</strong> {selectedOrder.shippingFee.toLocaleString("vi-VN")}₫</p>
                <p><strong>🏠 Địa chỉ:</strong> {selectedOrder.deliveryAddress}</p>

                <h6 className="mt-3">🛒 Sản phẩm:</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.productId}>
                        <td><img src={item.productImage} alt={item.productName} style={{ width: "60px", borderRadius: "8px" }} /></td>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unitPrice.toLocaleString("vi-VN")}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="text-end"><strong>Tổng cộng:</strong> {selectedOrder.totalAmount.toLocaleString("vi-VN")}₫</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-center">
        <button
          className="btn btn-sm btn-primary me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trang trước
        </button>
        <span className="align-self-center">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          className="btn btn-sm btn-primary ms-2"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
