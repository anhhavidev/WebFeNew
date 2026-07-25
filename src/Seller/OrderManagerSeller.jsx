import React, { useEffect, useState } from "react";
import { GetAllOrderSeller, getOrderDetaiSeller } from "../Service/Seller/OrderSellerAPI";
import { GetAvailableShippers, AssignShipperToOrder } from "../Service/Shipper/OrderShipperApi";
import { UpdateOrderStatus } from "../Service/Seller/OrderSellerAPI";
import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../Admin/AdminDashboard.css";
import { FiUser, FiMail, FiPhone, FiPackage, FiCreditCard, FiTruck, FiMapPin, FiShoppingCart, FiEye, FiCheck, FiSearch } from "react-icons/fi";
import Pagination from "../Components/Pagination";
import toast from "react-hot-toast";

export default function OrderManagerSeller() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempStatuses, setTempStatuses] = useState({});
  const [selectedShippers, setSelectedShippers] = useState({});
  const [shippers, setShippers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { ensureTokenValid } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = await ensureTokenValid();
      if (!token) return;

      try {
        const filters = { keyword, status: statusFilter, fromDate, toDate };
        const data = await GetAllOrderSeller(currentPage, 5, token, filters);
        setOrders(
          data.items.map((item) => ({
            ...item,
            originalStatus: item.status,
          }))
        );
        setTotalPages(data.totalPages);

        const shipperList = await GetAvailableShippers(token);
        setShippers(shipperList.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        toast.error("Không thể tải danh sách đơn hàng");
      }
    };

    fetchData();
  }, [currentPage, keyword, statusFilter, fromDate, toDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleViewOrder = async (orderId) => {
    const loadingToast = toast.loading("Đang lấy chi tiết...");
    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const res = await getOrderDetaiSeller(orderId, token);
      if (res.isSuccess) {
        setSelectedOrder(res.data);
        setShowModal(true);
        toast.dismiss(loadingToast);
      } else {
        toast.error(res.message || "Không thể lấy chi tiết đơn hàng.", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lấy chi tiết đơn hàng.", { id: loadingToast });
    }
  };

  function getPaymentStatusText(status) {
    switch (status) {
      case "Unpaid": return "Chưa thanh toán";
      case "Paid": return "Đã thanh toán";
      case "Failed": return "Thanh toán thất bại";
      default: return status;
    }
  }

  function getStatusText(status) {
    const map = {
        Pending: "Chờ xác nhận",
        Confirmed: "Đã xác nhận",
        ReadyToShip: "Chờ lấy hàng",
        Assigned: "Đã gán shipper",
        Shipping: "Đang giao",
        Delivered: "Đã giao hàng",
        Received: "Đã nhận hàng",
        FailedDelivery: "Giao thất bại",
        Cancelled: "Đã hủy"
    };
    return map[status] || status;
  }

  const handleUpdateStatus = async (orderId, newStatus, originalStatus, index) => {
    if (newStatus === originalStatus) {
      toast.error("Bạn chưa thay đổi trạng thái!");
      return;
    }

    const token = await ensureTokenValid();
    const loadingToast = toast.loading("Đang cập nhật trạng thái...");

    try {
      const result = await UpdateOrderStatus(orderId, newStatus, token);
      if (result.isSuccess) {
        toast.success("Cập nhật trạng thái thành công!", { id: loadingToast });
        setOrders((prev) => {
          const updated = [...prev];
          updated[index].status = newStatus;
          updated[index].originalStatus = newStatus;
          return updated;
        });
        setTempStatuses((prev) => {
          const clone = { ...prev };
          delete clone[index];
          return clone;
        });
      } else {
        toast.error(result.message || "Cập nhật thất bại.", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại.", { id: loadingToast });
    }
  };

  const handleAssignShipper = async (orderId, shipperId, index) => {
    if (!shipperId) {
      toast.error("Vui lòng chọn shipper!");
      return;
    }

    const token = await ensureTokenValid();
    const loadingToast = toast.loading("Đang gán shipper...");

    try {
      const result = await AssignShipperToOrder(orderId, shipperId, token);
      if (result.isSuccess) {
        toast.success("Gán shipper thành công!", { id: loadingToast });
        setOrders((prev) => {
          const updated = [...prev];
          updated[index].assignedShipper = result.data?.fullName || "Đã gán shipper";
          updated[index].status = "Assigned";
          updated[index].originalStatus = "Assigned";
          return updated;
        });
        
        setShippers((prev) =>
          prev.map((s) =>
            s.shipperId === shipperId
              ? { ...s, activeOrderCount: (s.activeOrderCount || 0) + 1 }
              : s
          )
        );
      } else {
        toast.error(result.message || "Không thể gán shipper.", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Gán shipper thất bại.", { id: loadingToast });
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
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.25rem", fontWeight: "700" }}>
          <FiPackage className="text-primary"/> <span className="text-dark">Quản lý đơn hàng</span>
        </h4>
        
        <div className="filter-bar-premium rounded shadow-sm border">
          <div className="search-group-premium">
            <FiSearch className="text-muted" />
            <input 
              type="text" 
              placeholder="Mã đơn, khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setKeyword(searchTerm)}
            />
            <button className="btn-search" onClick={() => setKeyword(searchTerm)}>
              Tìm
            </button>
          </div>

          <div className="filter-controls-premium">
            <select 
              className="select-premium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Trạng thái</option>
              <option value="Pending">Chờ xác nhận</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="ReadyToShip">Sẵn sàng giao</option>
              <option value="Shipping">Đang giao</option>
              <option value="Delivered">Đã giao</option>
              <option value="Received">Khách đã nhận</option>
              <option value="Cancelled">Đã hủy</option>
              <option value="FailedDelivery">Giao thất bại</option>
            </select>

            <div className="date-range-premium">
              <span>Từ</span>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <span>Đến</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <button 
              className="btn-clear-premium" 
              onClick={() => { setSearchTerm(""); setKeyword(""); setStatusFilter(""); setFromDate(""); setToDate(""); }}
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <table className="table table-bordered align-middle text-center shadow-sm bg-white">
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
                    <FiEye className="me-1" /> Xem
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
                <p><strong><FiUser className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> Khách hàng:</strong> {selectedOrder.buyerName}</p>
                <p><strong><FiMail className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> Email:</strong> {selectedOrder.buyerEmail}</p>
                <p><strong><FiPhone className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> SĐT:</strong> {selectedOrder.buyerPhone}</p>
                <p><strong><FiPackage className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> Trạng thái:</strong> {getStatusText(selectedOrder.status)}</p>
                <p><strong><FiCreditCard className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> Thanh toán:</strong> {getPaymentStatusText(selectedOrder.paymentStatus)}</p>
                <p><strong><FiTruck className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> Phí vận chuyển:</strong> {selectedOrder.shippingFee.toLocaleString("vi-VN")}₫</p>
                <p><strong><FiMapPin className="text-primary me-2" style={{ fontSize: '1.1rem' }} /> Địa chỉ:</strong> {selectedOrder.deliveryAddress}</p>

                <h6 className="mt-4 mb-3" style={{ fontWeight: 700, color: '#0f172a' }}>
                  <FiShoppingCart className="text-primary me-2" style={{ fontSize: '1.2rem' }} /> 
                  Sản phẩm:
                </h6>
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}
