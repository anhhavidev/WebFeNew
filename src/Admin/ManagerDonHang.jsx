import React, { useEffect, useState } from 'react';
import { GetAllOrder, CancelOrderAdmin, GetOrderDetailAdmin } from "../Service/Admin/OrderAdminApi";

import useAuth from '../Hooks/useAuth';
import { useNavigate } from "react-router-dom";
export default function ManagerDonHang() {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [orderDetail, setOrderDetail] = useState(null); // lưu chi tiết đơn hàng
    const [showDetailModal, setShowDetailModal] = useState(false); // để hiện modal/hiển thị
    const { ensureTokenValid } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            const token = await ensureTokenValid();
            if (!token) return;

            try {
                const data = await GetAllOrder(currentPage, 5, token);
                setOrders(data.items.map(item => ({ //sao chép 
                    ...item,
                    originalStatus: item.status // lưu trạng thái ban đầu để so sánh
                })));
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            }
        };

        fetchData();
    }, [currentPage]);

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
            setOrderDetail(result.data); // lưu dữ liệu chi tiết
            setShowDetailModal(true);    // bật modal/hiển thị
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


    // Hàm nhận status dạng string (ví dụ "Pending", "Confirmed") và trả về JSX badge
    const renderOrderStatusBadge = (status) => {
        const statusMap = {
            Pending: "Chờ xác nhận",
            Confirmed: "Đã xác nhận",
            ReadyToShip: "Chờ lấy hàng",
            Assigned: "Đơn hàng đã được gán cho shipper",
            Shipping: "Đang giao",
            Delivered: "Đã giao thành công",
            Received: "Khách hàng đã nhận hàng",
            FailedDelivery: "Giao thất bại",
            Cancelled: "Đã hủy",
            PartiallyReceived: "Đã nhận một phần",
            PartiallyCancelled: "Đã hủy một phần"
        };

        const badgeClass = {
            Delivered: "bg-success",
            Received: "bg-success",
            FailedDelivery: "bg-warning",
            Cancelled: "bg-danger",
            PartiallyCancelled: "bg-danger",
            PartiallyReceived: "bg-warning"
        };

        return (
            <span className={`badge ${badgeClass[status] || "bg-secondary"}`}>
                {statusMap[status] || status}
            </span>
        );
    };



    return (
        <div className='container mt-4'>
            <h4 className='mb-3'>Quản lý đơn hàng</h4>
            <table className='table table-bordered'>
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Email KH</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr><td colSpan="8" className='text-center'>Không có đơn hàng nào</td></tr>
                    ) : (
                        orders.map((item, index) => (
                            <tr key={item.parentOrderId}>
                                <td>{item.parentOrderId}</td>
                                <td>{item.buyerEmail}</td>
                                <td>{new Date(item.orderDate).toLocaleDateString("vi-VN")}</td>
                                <td>{item.totalAmount.toLocaleString("vi-VN")}₫</td>
                                <td>
                                    {item.paymentStatus === "Paid"
                                        ? "Đã thanh toán"
                                        : item.paymentStatus === "Failed"
                                            ? "Thanh toán thất bại"
                                            : "Chưa thanh toán"}
                                </td>
                                <td>{renderOrderStatusBadge(item.status)}</td>

                                <td>
                                    <button
                                        className="btn btn-sm btn-primary me-1"
                                        onClick={() => handleViewOrder(item.parentOrderId)} // chú ý item.parentOrderId
                                    >
                                        🔍Xem
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger me-1"
                                        onClick={() => handleCancelOrder(item.parentOrderId, index)}
                                        disabled={
                                            !["Pending", "Confirmed"].includes(item.status) ||
                                            item.paymentStatus !== "Unpaid"
                                        } // chỉ cho hủy Pending và Confirm
                                    >
                                        🗑️Hủy Đơn
                                    </button>



                                </td>

                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className='d-flex justify-content-center'>
                <button className='btn btn-sm btn-primary me-2' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Trang trước
                </button>
                <span className='align-self-center'>Trang {currentPage} / {totalPages}</span>
                <button className='btn btn-sm btn-primary ms-2' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Trang sau
                </button>
            </div>
            {showDetailModal && orderDetail && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết đơn {orderDetail.parentOrderId}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Người mua:</strong> {orderDetail.buyerName} ({orderDetail.buyerEmail})</p>

                                <p><strong>Tổng tiền:</strong> {orderDetail.totalAmount.toLocaleString("vi-VN")}₫</p>
                                <p><strong>Tổng phí ship:</strong> {orderDetail.totalShippingFee.toLocaleString("vi-VN")}₫</p>
                                <p><strong>Trạng thái:</strong> {renderOrderStatusBadge(orderDetail.status)}</p>

                                {orderDetail.childOrders.map((child, i) => (
                                    <div key={i} className="border p-2 mb-2">
                                        <p><strong>Người bán:</strong> {child.sellerName} ({child.sellerEmail})</p>
                                        <p><strong>Trạng thái:</strong> {renderOrderStatusBadge(child.status)}</p>
                                        <p><strong>Phí vận chuyển:</strong> {child.shippingFee.toLocaleString("vi-VN")}₫</p>
                                        <p><strong>Địa chỉ giao đến :</strong> {child.diaDiemGiaoToi}</p>
                                        <p><strong>SĐT Người mua :</strong> {child.buyerPhone}</p>
                                        <table className="table table-sm mt-2">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>SL</th>
                                                    <th>Đơn giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {child.items.map((item, j) => (
                                                    <tr key={j}>
                                                        <td>
                                                            <img
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '8px' }}
                                                            />
                                                            {item.productName}
                                                        </td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.unitPrice.toLocaleString("vi-VN")}₫</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}
