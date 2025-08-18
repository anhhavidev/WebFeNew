import React, { useEffect, useState } from 'react';
import { GetAllOrder, UpdateOrderStatus } from "../Service/Admin/OrderAdminApi";
import useAuth from '../Hooks/useAuth';

export default function ManagerDonHang() {
    const [orders, setOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const { ensureTokenValid } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            const token = await ensureTokenValid();
            if (!token) return;

            try {
                const data = await GetAllOrder(currentPage, 5, token);
                setOrders(data.items.map(item => ({
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

    const handleStatusChange = (index, newStatus) => {
        const updated = [...orders];
        updated[index].status = newStatus;
        setOrders(updated);
    };


    const handleUpdateStatus = async (orderId, newStatus, originalStatus, index) => {

        if (newStatus === originalStatus) {
            alert("Bạn chưa thay đổi trạng thái.");
            return;
        }

        const token = await ensureTokenValid();
        if (!token) return;

        try {
            await UpdateOrderStatus(orderId, newStatus, token);
            alert("Cập nhật trạng thái thành công!");

            // ✅ Cập nhật lại orders một cách an toàn
            setOrders(prevOrders => {
                const updated = [...prevOrders];
                updated[index] = {
                    ...updated[index],
                    status: newStatus,
                    originalStatus: newStatus
                };
                return updated;
            });

            // ✅ Xóa tempStatus theo cách an toàn
            setTempStatuses(prev => {
                const clone = { ...prev };
                delete clone[index];
                return clone;
            });

        } catch (err) {
            console.error(err);
            alert("Cập nhật thất bại.");
        }
    };

    // object ánh xạ từ tiếng an hsang teiesng viet  để hiển thị 
    const statusMap = {
        Pending: "Chờ xác nhận",
        Confirm: "Đang xử lý",
        Shipping: "Đang giao hàng",
        Delivery: "Đã giao",
        Canceled: "Đã hủy"
    };
    // xác định trạng thái hợp lệ tiếp theo 
    const getNextValidStatuses = (currentStatus) => {
        switch (currentStatus) {
            case "Pending":
                return ["Confirm", "Canceled"];
            case "Confirm":
                return ["Shipping", "Canceled"];
            // case "Shipping":
            //     return ["Delivery"];
            case "Shipping":
                return []; // Admin KHÔNG được phép chuyển tiếp

            default:
                return [];
        }
    };
    //dùng để luuw trạng thái mới ng dùng chọm truoc khi cap nhap 
    const [tempStatuses, setTempStatuses] = useState({});
    const handleTempStatusChange = (index, newStatus) => {
        setTempStatuses(prev => ({
            ...prev,
            [index]: newStatus
        }));
    };


    return (
        <div className='container mt-4'>
            <h4 className='mb-3'>Quản lý đơn hàng</h4>
            <table className='table table-bordered'>
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Thông tin KH</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr><td colSpan="8" className='text-center'>Không có đơn hàng nào</td></tr>
                    ) : (
                        orders.map((item, index) => (
                            <tr key={item.orderId}>
                                <td>{item.orderId}</td>
                                <td>{item.information}</td>
                                <td>{new Date(item.orderDat).toLocaleDateString("vi-VN")}</td>
                                <td>{item.totalAmount.toLocaleString("vi-VN")}₫</td>
                                <td>{item.paymentStatus}</td>
                                <td>
                                    {["Delivery", "Canceled"].includes(item.status) ? (
                                        <span className={`badge ${item.status === "Delivery" ? "bg-success" : "bg-danger"}`}>
                                            {statusMap[item.status]}
                                        </span>
                                    ) : (
                                        <select
                                            className="form-select w-auto"
                                            value={tempStatuses[index] || item.status}
                                            onChange={(e) => handleTempStatusChange(index, e.target.value)}
                                        >
                                            <option value={item.status} >
                                                {statusMap[item.status]}
                                            </option>
                                            {getNextValidStatuses(item.status)
                                                .filter(status => status !== item.status)
                                                .map((status) => (
                                                    <option key={status} value={status}>
                                                        {statusMap[status]}
                                                    </option>
                                                ))}
                                        </select>

                                    )}
                                </td>

                                <td>{item.note}</td>
                                <td>
                                    <button className="btn btn-sm btn-primary me-1">🔍</button>
                                    <button className="btn btn-sm btn-danger me-1">🗑️</button>
                                    {["Delivery", "Canceled"].includes(item.status) ? null : (
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

            <div className='d-flex justify-content-center'>
                <button className='btn btn-sm btn-primary me-2' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Trang trước
                </button>
                <span className='align-self-center'>Trang {currentPage} / {totalPages}</span>
                <button className='btn btn-sm btn-primary ms-2' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Trang sau
                </button>
            </div>
        </div>
    );
}
