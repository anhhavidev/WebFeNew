import React, { useEffect, useState } from "react";
import { OrderApi } from "../../Service/OrderAPI";
import UserLayout from "../../layout1/UserLayout";
import CountdownTimer from "../../utils/CountdownTimer";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import axiosClient from "../../Service/axiosClient";
import { getOrderDetail } from "../../Service/OrderAPI";
import { ROUTES } from "../../constants/routePaths";
import { useNavigate } from "react-router-dom";
import "./CustomerPages.css";

function formatVND(amount) {
  return (amount || 0).toLocaleString() + "₫";
}

function getStatusText(status) {
  switch (status) {
    case "Pending": return "Chờ xác nhận";
    case "Confirmed": return "Đã xác nhận";
    case "ReadyToShip": return "Đang chờ lấy hàng";
    case "Assigned": return "Shipper đã nhận hàng";
    case "Shipping": return "Đang giao hàng";
    case "Delivered": return "Đã giao hàng";
    case "Received": return "Đã nhận hàng";
    case "FailedDelivery": return "Giao thất bại";
    case "Cancelled": return "Đã hủy";
    case "PartiallyReceived": return "Giao một phần";
    case "PartiallyCancelled": return "Hủy một phần";
    default: return status;
  }
}

function getStatusBadge(status) {
  const map = {
    Pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Chờ xác nhận" },
    Confirmed: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Đã xác nhận" },
    ReadyToShip: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Đang chờ lấy hàng" },
    Assigned: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Shipper đã nhận" },
    Shipping: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Đang giao hàng" },
    Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Đã giao hàng" },
    Received: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Đã nhận hàng" },
    Cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Đã hủy" },
    FailedDelivery: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Giao thất bại" },
    PartiallyReceived: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Giao một phần" },
    PartiallyCancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Hủy một phần" },
  };
  const s = map[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
  return <span className={`ed-order-badge ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>;
}

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "Pending", label: "Chờ xác nhận" },
  { key: "Confirmed", label: "Đang xử lý" },
  { key: "Shipping", label: "Đang giao" },
  { key: "Delivered", label: "Đã giao" },
  { key: "Cancelled", label: "Đã hủy" },
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ensureTokenValid } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
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
    });
    if (!result.isConfirmed) return;
    try {
      const token = await ensureTokenValid();
      if (!token) return;
      const data = await axiosClient.put(`/Order/user-confirm/${orderId}`);
      if (data.isSuccess) {
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Cảm ơn bạn đã xác nhận nhận hàng!', timer: 2000, showConfirmButton: false });
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: data.data.status, paymentStatus: data.data.paymentStatus } : o));
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
    });
    if (!result.isConfirmed) return;
    try {
      const token = await ensureTokenValid();
      if (!token) return;
      const data = await axiosClient.put(`/Order/cancel/${orderId}`);
      if (data.isSuccess) {
        Swal.fire({ icon: 'success', title: 'Đã huỷ', text: 'Đơn hàng của bạn đã được huỷ thành công.', timer: 2000, showConfirmButton: false });
        setOrders(prev => prev.map(o => o.parentOrderId === orderId ? { ...o, status: data.data.status, paymentStatus: data.data.paymentStatus } : o));
      } else {
        Swal.fire('Thất bại', data.message || "Không thể huỷ đơn", 'error');
      }
    } catch (err) {
      Swal.fire('Lỗi', "Lỗi kết nối máy chủ", 'error');
    }
  }

  function handleExpire(orderId) {
    setOrders(prev => prev.map(o => o.parentOrderId === orderId ? { ...o, status: "Cancelled", paymentStatus: "Failed" } : o));
  }

  async function openDetail(orderId) {
    try {
      const res = await getOrderDetail(orderId);
      setSelectedOrderDetail(res.data || res);
    } catch (_) {
      const order = orders.find(o => o.orderId === orderId || o.parentOrderId === orderId);
      if (order) setSelectedOrderDetail(order);
    }
  }

  const filteredOrders = searchQuery.trim()
    ? orders.filter(o =>
        (o.parentOrderId || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.orderId || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const filteredTotalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(0, pageSize);

  return (
    <UserLayout>
      <div className="ed-page">
        {/* Header */}
        <div className="ed-order-header">
          <div>
            <button className="ed-order-back" onClick={() => navigate(ROUTES.GETINFOR)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Quay lại tài khoản
            </button>
            <h1 className="ed-order-title">Đơn Hàng Của Tôi</h1>
          </div>
          <div className="ed-order-stats">
            <span>Tổng số đơn: <strong>{orders.length}</strong></span>
            <span>·</span>
            <span>Đã hoàn thành: <strong className="ed-order-green">{orders.filter(o => o.status === "Delivered" || o.status === "Received").length}</strong></span>
          </div>
        </div>

        {/* Search */}
        <div className="ed-order-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ed-order-search-icon"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPageNumber(1); }}
          />
          {searchQuery && <button className="ed-order-search-clear" onClick={() => setSearchQuery("")}>✕</button>}
        </div>

        {/* Status Tabs */}
        <div className="ed-order-tabs">
          {STATUS_TABS.map(tab => {
            const count = tab.key === "all" ? orders.length : orders.filter(o => o.status === tab.key).length;
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                className={`ed-order-tab ${isActive ? "active" : ""}`}
                onClick={() => { setSelectedStatus(tab.key); setPageNumber(1); }}
              >
                {tab.label}
                <span className={`ed-order-tab-count ${isActive ? "active" : ""}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading && <div className="ed-order-loading">Đang tải...</div>}
        {error && <div className="ed-order-error">{error}</div>}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="ed-order-empty">
            <div className="ed-order-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <h3>Không có đơn hàng nào phù hợp</h3>
            <p>Hiện chưa có đơn hàng nào trong danh mục này hoặc khớp với từ khóa tìm kiếm của bạn.</p>
            <div className="ed-order-empty-actions">
              {(selectedStatus !== "all" || searchQuery) && (
                <button className="ed-btn-order-filter" onClick={() => { setSelectedStatus("all"); setSearchQuery(""); }}>Xóa bộ lọc</button>
              )}
              <button className="ed-btn-primary" onClick={() => navigate(ROUTES.HOME)}>Khám Phá Sản Phẩm Ngay</button>
            </div>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="ed-order-list">
            {paginatedOrders.map(order => (
              <div key={order.orderId} className="ed-order-card">
                {/* Header */}
                <div className="ed-order-card-header">
                  <div className="ed-order-card-id-row">
                    <span className="ed-order-card-id">#{order.parentOrderId || order.orderId}</span>
                    <span className="ed-order-card-date">• Ngày đặt: {new Date(order.orderDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Items (simplified - just count since we don't have item details in list) */}
                <div className="ed-order-card-body">
                  <div className="ed-order-card-item">
                    <div className="ed-order-card-item-info">
                      <p className="ed-order-card-item-name">{order.items ? `${order.items.length} sản phẩm` : `Đơn hàng #${order.parentOrderId || order.orderId}`}</p>
                      <p className="ed-order-card-item-qty">{getStatusText(order.status)}</p>
                    </div>
                    <span className="ed-order-card-item-total">{formatVND(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="ed-order-card-footer">
                  <p className="ed-order-card-shipping">
                    Thanh toán: <strong>{order.paymentMethod || "COD"}</strong> ({order.paymentStatus === "Paid" ? "Đã thanh toán" : order.paymentStatus === "Failed" ? "Thất bại" : "Chưa thanh toán"})
                  </p>
                  <div className="ed-order-card-actions">
                    {order.status === "Delivered" && (
                      <button className="ed-order-action-btn ed-order-action-confirm" onClick={() => handleConfirmDelivery(order.orderId)}>Đã nhận hàng</button>
                    )}
                    {order.status === "Pending" && (
                      <button className="ed-order-action-btn ed-order-action-cancel" onClick={() => handleCancelOrder(order.parentOrderId || order.orderId)}>Hủy đơn</button>
                    )}
                    {order.paymentStatus !== "Paid" && order.status === "Pending" && order.paymentMethod === "VnPay" && (
                      <button className="ed-order-action-btn ed-order-action-retry" onClick={() => navigate(`/payment/retry/${order.parentOrderId || order.orderId}`)}>
                        Thanh toán lại
                        <CountdownTimer expireTime={order.orderExpireTime} onExpire={() => handleExpire(order.parentOrderId || order.orderId)} />
                      </button>
                    )}
                    <button className="ed-order-action-btn ed-order-action-detail" onClick={() => openDetail(order.orderId)}>Chi tiết</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="ed-order-pagination">
              <button className={`ed-page-btn ${pageNumber === 1 ? "disabled" : ""}`} onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}>Trước</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`ed-page-btn ${pageNumber === i + 1 ? "active" : ""}`} onClick={() => setPageNumber(i + 1)}>{i + 1}</button>
              ))}
              <button className={`ed-page-btn ${pageNumber === totalPages ? "disabled" : ""}`} onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages}>Tiếp</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrderDetail && (
        <div className="ed-modal-overlay">
          <div className="ed-modal ed-modal-lg">
            <div className="ed-modal-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                Chi tiết đơn hàng #{selectedOrderDetail.parentOrderId || selectedOrderDetail.orderId}
              </h3>
              <button className="ed-modal-close" onClick={() => setSelectedOrderDetail(null)}>✕</button>
            </div>
            <div className="ed-order-detail-status">
              <div><span className="ed-order-detail-label">Ngày đặt:</span><strong>{new Date(selectedOrderDetail.orderDate).toLocaleDateString("vi-VN")}</strong></div>
              {getStatusBadge(selectedOrderDetail.status)}
            </div>
            <div className="ed-order-detail-total">
              <span>Tổng thanh toán:</span>
              <span className="ed-order-detail-total-value">{formatVND(selectedOrderDetail.totalAmount)}</span>
            </div>
            <div className="ed-modal-actions">
              <button className="ed-btn-modal-save" onClick={() => { setSelectedOrderDetail(null); navigate(`/user/orders/${selectedOrderDetail.parentOrderId || selectedOrderDetail.orderId}`); }}>Xem chi tiết đầy đủ</button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
