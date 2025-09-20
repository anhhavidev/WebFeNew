import React, { useEffect, useState } from "react";
import { useParams,useNavigate  } from "react-router-dom";
import { getOrderDetailAdmin } from "../Service/Admin/OrderAdminApi";
import "../Pages/Common/OrderDetail.css";
import AdminLayout from "../layout1/Dashboard";
import useAuth from '../Hooks/useAuth';

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [orderDetail, setOrderDetail] = useState(null);
const navigate = useNavigate(); // dùng để điều hướng back
  const { ensureTokenValid } = useAuth();

  useEffect(() => {
    async function fetchOrder() {
      const token = await ensureTokenValid();
      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      try {
        if (!orderId) return;
        const data = await getOrderDetailAdmin(orderId, token);
        setOrderDetail(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      }
    }

    fetchOrder();
  }, [orderId]);
 if (!orderDetail) return <div>Đang tải chi tiết đơn hàng...</div>; // ✅ check null
  function getStatusText(status) {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";
      case "Confirm":
        return "Đã xác nhận";
      case "Shipping":
        return "Đang giao hàng";
      case "Delivery":
        return "Hoàn thành";
      case "Canceled":
        return "Đã hủy";
      default:
        return status;
    }
  }



  

  return (
   
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-2 "> 
        <h3>🧾 Chi tiết đơn hàng #{orderDetail.orderId}</h3>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/dashboard/orders")}
          >
            ← Quay lại
          </button>
        </div>
        <form className="border p-4 rounded shadow-sm bg-light">

          {/* Thông tin đơn hàng */}
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Mã đơn hàng:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={`#${orderDetail.orderId}`} />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Trạng thái:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={getStatusText(orderDetail.orderStatus)} />
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <h5>👤 Khách hàng</h5>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Tên khách hàng:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={orderDetail.hoTen} />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Email:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={orderDetail.email} />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Số điện thoại:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={orderDetail.sdt} />
            </div>
          </div>

          <hr />

          {/* Danh sách sản phẩm */}
          <h5>📦 Danh sách sản phẩm</h5>
          {orderDetail.items.map((item, index) => (
            <div key={index} className="d-flex border p-2 mb-2 rounded align-items-center bg-white">
              <img
                src={item.productImage}
                alt={item.productName}
                style={{ width: "80px", height: "80px", objectFit: "cover", marginRight: "15px", border: "1px solid #ddd" }}
              />
              <div className="flex-grow-1">
                <div><strong>{item.productName}</strong></div>
                <div>Số lượng: {item.quantity} × {item.unitPrice.toLocaleString()}đ</div>
                <div>{item.totalPrice.toLocaleString()}đ</div>
              </div>
            </div>
          ))}

          <hr />

          {/* Thanh toán & địa chỉ */}
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Phương thức thanh toán:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={`${orderDetail.payMethodName} - ${orderDetail.paymentStatus}`} />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Địa chỉ giao:</label>
            <div className="col-sm-10">
              <textarea className="form-control" readOnly value={orderDetail.diaChiGiao} rows={2}></textarea>
            </div>
          </div>
          {orderDetail.note && (
            <div className="row mb-3">
              <label className="col-sm-2 col-form-label">Ghi chú:</label>
              <div className="col-sm-10">
                <textarea className="form-control" readOnly value={orderDetail.note} rows={2}></textarea>
              </div>
            </div>
          )}
          {orderDetail.cancelReason && (
            <div className="row mb-3">
              <label className="col-sm-2 col-form-label">Lý do hủy:</label>
              <div className="col-sm-10">
                <textarea className="form-control" readOnly value={orderDetail.cancelReason} rows={2}></textarea>
              </div>
            </div>
          )}

          <hr />

          {/* Tổng kết */}
          <h5>💰 Tổng kết</h5>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Tổng sản phẩm:</label>
            <div className="col-sm-10">
              <input readOnly className="form-control" value={`${orderDetail.totalPriceProducts.toLocaleString()}đ`} />
            </div>
          </div>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Phí giao hàng:</label>
            <div className="col-sm-10">
              <input readOnly className="form-control" value={`${orderDetail.phiGiaoHang.toLocaleString()}đ`} />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label fw-bold">Tổng cộng:</label>
            <div className="col-sm-10">
              <input readOnly className="form-control fw-bold" value={`${orderDetail.totalAmount.toLocaleString()}đ`} />
            </div>
          </div>

         
          

          
         
        </form>
      </div>
   
  );
}
