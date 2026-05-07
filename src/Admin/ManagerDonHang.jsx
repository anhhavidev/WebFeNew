import React, { useEffect, useState } from 'react';
import { GetAllOrder, CancelOrderAdmin, GetOrderDetailAdmin } from "../Service/Admin/OrderAdminApi";
import { useDashboardApi } from "../Service/Admin/DashboardApi";
import useAuth from '../Hooks/useAuth';
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { FiSearch, FiFilter, FiDownload, FiEye, FiTrash2 } from "react-icons/fi";

export default function ManagerDonHang() {
    const { getOrderStatus, getSummary } = useDashboardApi();
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [orderDetail, setOrderDetail] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { ensureTokenValid } = useAuth();
    const navigate = useNavigate();

    // Stats
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });

    // Filter states
    const [searchTerm, setSearchTerm] = useState(""); // Local input state
    const [keyword, setKeyword] = useState("");      // State that triggers API
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Fetch real stats from Dashboard API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [summaryRes, statusRes] = await Promise.all([
                    getSummary(),
                    getOrderStatus()
                ]);
                
                const sumData = summaryRes?.data || {};
                const statItems = statusRes?.data?.items || [];
                
                let pendingCount = 0;
                let completedCount = 0;
                let cancelledCount = 0;
                
                statItems.forEach(item => {
                    const lbl = item.label;
                    if (['Pending', 'ReadyToShip', 'Assigned', 'Chờ xác nhận', 'Chờ lấy hàng', 'Đã gán shipper'].includes(lbl)) {
                        pendingCount += item.count;
                    } else if (['Delivered', 'Received', 'Đã giao thành công', 'Khách đã nhận'].includes(lbl)) {
                        completedCount += item.count;
                    } else if (['Cancelled', 'FailedDelivery', 'PartiallyCancelled', 'Đã hủy', 'Giao thất bại'].includes(lbl)) {
                        cancelledCount += item.count;
                    }
                });
                
                setStats({
                    total: sumData.totalOrders || 0,
                    pending: pendingCount,
                    completed: completedCount,
                    cancelled: cancelledCount
                });
            } catch (error) {
                console.error("Lỗi khi lấy thống kê đơn hàng:", error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const token = await ensureTokenValid();
            if (!token) return;

            try {
                const filters = {
                    keyword,
                    status: statusFilter,
                    fromDate,
                    toDate
                };
                const data = await GetAllOrder(currentPage, 10, token, filters);
                const fetchedOrders = data.items.map(item => ({
                    ...item,
                    originalStatus: item.status
                }));
                setOrders(fetchedOrders);
                setTotalPages(data.totalPages);
                
                // Nếu chưa có stats tổng quan, cập nhật tạm tổng số đơn từ kết quả trả về
                setStats(prev => ({
                    ...prev,
                    total: prev.total > 0 ? prev.total : (data.totalCount || 0)
                }));

            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            }
        };

        fetchData();
    }, [currentPage, keyword, statusFilter, fromDate, toDate]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewOrder = async (orderId) => {
        const token = await ensureTokenValid();
        if (!token) return;

        try {
            const result = await GetOrderDetailAdmin(orderId, token);
            if (!result.isSuccess) {
                alert(result.message || "Lấy chi tiết đơn thất bại");
                return;
            }
            setOrderDetail(result.data);
            setShowDetailModal(true);
        } catch (err) {
            console.error(err);
            alert("Lấy chi tiết đơn thất bại");
        }
    };

    const handleCancelOrder = async (orderId, index) => {
        const reason = prompt("Nhập lý do hủy đơn:");
        if (!reason) return;

        const token = await ensureTokenValid();
        if (!token) return;

        try {
            const result = await CancelOrderAdmin(orderId, reason, token)
            if (!result.isSuccess) {
                alert(result.message || "Hủy đơn thất bại.");
                return;
            }

            alert(result.message);

            setOrders(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    status: result.data.status,
                    originalStatus: result.data.status,
                };
                return updated;
            });
        } catch (err) {
            console.error(err);
            alert("Hủy đơn thất bại.");
        }
    };

    const renderOrderStatusBadge = (status) => {
        const statusMap = {
            Pending: "Chờ xác nhận",
            Confirmed: "Đã xác nhận",
            ReadyToShip: "Chờ lấy hàng",
            Assigned: "Đã gán shipper",
            Shipping: "Đang giao",
            Delivered: "Đã giao thành công",
            Received: "Khách đã nhận",
            FailedDelivery: "Giao thất bại",
            Cancelled: "Đã hủy",
            PartiallyReceived: "Đã nhận một phần",
            PartiallyCancelled: "Đã hủy một phần"
        };

        let badgeClass = "badge bg-secondary";
        
        if (["Pending", "ReadyToShip", "Assigned"].includes(status)) badgeClass = "status-badge warning";
        else if (["Confirmed", "Shipping"].includes(status)) badgeClass = "status-badge info";
        else if (["Delivered", "Received"].includes(status)) badgeClass = "status-badge success";
        else if (["FailedDelivery", "Cancelled", "PartiallyCancelled"].includes(status)) badgeClass = "status-badge danger";
        else if (["PartiallyReceived"].includes(status)) badgeClass = "status-badge warning";

        return (
            <span className={badgeClass}>
                {statusMap[status] || status}
            </span>
        );
    };

    return (
        <div>
            <div className="mb-6 mt-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 page-title">Quản lý đơn hàng</h2>
                <p className="text-gray-600 page-subtitle">Theo dõi và quản lý tất cả đơn hàng</p>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-card-title text-muted mb-1">Tổng đơn hàng</p>
                    <p className="stat-card-value text-dark fs-4 mb-0 fw-bold">{stats.total.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card-title text-muted mb-1">Đang xử lý</p>
                    <p className="stat-card-value text-primary fs-4 mb-0 fw-bold">{stats.pending.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card-title text-muted mb-1">Hoàn thành</p>
                    <p className="stat-card-value text-success fs-4 mb-0 fw-bold">{stats.completed.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card-title text-muted mb-1">Đã hủy</p>
                    <p className="stat-card-value text-danger fs-4 mb-0 fw-bold">{stats.cancelled.toLocaleString()}</p>
                </div>
            </div>

        <div className="container-fluid px-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <h4 className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                    📋 <span className="text-dark">Quản lý tất cả đơn hàng</span>
                </h4>
                
                {/* Premium Filter Bar */}
                <div className="filter-bar-premium rounded shadow-sm border">
                    <div className="search-group-premium">
                        <FiSearch className="text-muted" />
                        <input
                            type="text"
                            placeholder="Mã đơn, khách, email..."
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
                            <option value="ReadyToShip">Chờ lấy hàng</option>
                            <option value="Shipping">Đang giao</option>
                            <option value="Delivered">Đã giao thành công</option>
                            <option value="Received">Khách đã nhận</option>
                            <option value="Cancelled">Đã hủy</option>
                            <option value="FailedDelivery">Giao thất bại</option>
                        </select>

                        <div className="date-range-premium">
                            <span>Từ</span>
                            <input 
                                type="date" 
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                            <span>Đến</span>
                            <input 
                                type="date" 
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <button 
                            className="btn-clear-premium" 
                            onClick={() => {
                                setSearchTerm("");
                                setKeyword("");
                                setStatusFilter("");
                                setFromDate("");
                                setToDate("");
                            }}
                        >
                            Xóa lọc
                        </button>
                    </div>
                </div>
            </div>

                {/* Orders Table */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Email KH</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">Không có đơn hàng nào</td>
                                </tr>
                            ) : (
                                orders.map((item, index) => (
                                    <tr key={item.parentOrderId}>
                                        <td className="fw-medium">{item.parentOrderId}</td>
                                        <td>{item.buyerEmail}</td>
                                        <td>{new Date(item.orderDate).toLocaleDateString("vi-VN")}</td>
                                        <td className="fw-medium">{item.totalAmount.toLocaleString("vi-VN")}₫</td>
                                        <td>
                                            {item.paymentStatus === "Paid" ? "Đã thanh toán" :
                                             item.paymentStatus === "Failed" ? "Thất bại" : "Chưa thanh toán"}
                                        </td>
                                        <td>{renderOrderStatusBadge(item.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon view" 
                                                    title="Xem chi tiết"
                                                    onClick={() => handleViewOrder(item.parentOrderId)}
                                                >
                                                    <FiEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 mb-4">
                    <nav>
                        <ul className="pagination admin-pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    Trước
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <li key={num} className={`page-item ${currentPage === num ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => handlePageChange(num)}>{num}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Order Detail Modal */}
            {showDetailModal && orderDetail && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold text-dark">
                                    Chi tiết đơn <span className="text-primary">#{orderDetail.parentOrderId}</span>
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="text-muted text-uppercase fs-7 fw-bold mb-3">Thông tin khách hàng</h6>
                                        <p className="mb-1"><strong>Họ tên:</strong> {orderDetail.buyerName}</p>
                                        <p className="mb-1"><strong>Email:</strong> {orderDetail.buyerEmail}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted text-uppercase fs-7 fw-bold mb-3">Thông tin đơn hàng</h6>
                                        <p className="mb-1"><strong>Trạng thái:</strong> {renderOrderStatusBadge(orderDetail.status)}</p>
                                        <p className="mb-1"><strong>Tổng tiền:</strong> <span className="text-danger fw-bold">{orderDetail.totalAmount.toLocaleString("vi-VN")}₫</span></p>
                                        <p className="mb-1"><strong>Phí giao hàng:</strong> {orderDetail.totalShippingFee.toLocaleString("vi-VN")}₫</p>
                                    </div>
                                </div>

                                <h6 className="text-muted text-uppercase fs-7 fw-bold mb-3">Danh sách đơn con</h6>
                                {orderDetail.childOrders.map((child, i) => (
                                    <div key={i} className="border rounded-3 p-3 mb-3 bg-white shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                            <div>
                                                <span className="fw-bold me-2">Cửa hàng: {child.sellerName}</span>
                                                <span className="text-muted fs-7">({child.sellerEmail})</span>
                                            </div>
                                            <div>{renderOrderStatusBadge(child.status)}</div>
                                        </div>
                                        
                                        <div className="row mb-3 fs-7">
                                            <div className="col-md-6">
                                                <p className="mb-1"><strong>Giao đến:</strong> <span className="text-muted">{child.diaDiemGiaoToi}</span></p>
                                            </div>
                                            <div className="col-md-6 text-md-end">
                                                <p className="mb-1"><strong>SĐT nhận:</strong> <span className="text-muted">{child.buyerPhone}</span></p>
                                                <p className="mb-0"><strong>Phí ship:</strong> <span className="text-muted">{child.shippingFee.toLocaleString("vi-VN")}₫</span></p>
                                            </div>
                                        </div>

                                        <table className="table table-sm table-borderless mt-2 mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="py-2 px-3 text-muted fw-medium rounded-start">Sản phẩm</th>
                                                    <th className="py-2 px-3 text-muted fw-medium text-center">SL</th>
                                                    <th className="py-2 px-3 text-muted fw-medium text-end rounded-end">Đơn giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {child.items.map((item, j) => (
                                                    <tr key={j} className="border-bottom">
                                                        <td className="py-3 px-3">
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={item.productImage}
                                                                    alt={item.productName}
                                                                    className="rounded bg-light border"
                                                                    style={{ width: '48px', height: '48px', objectFit: 'cover', marginRight: '12px' }}
                                                                />
                                                                <span className="fw-medium">{item.productName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3 text-center align-middle">{item.quantity}</td>
                                                        <td className="py-3 px-3 text-end align-middle fw-medium">{item.unitPrice.toLocaleString("vi-VN")}₫</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer bg-light border-top-0">
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
