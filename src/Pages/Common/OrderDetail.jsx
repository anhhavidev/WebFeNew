import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetail } from "../../Service/OrderAPI";
import "./OrderDetail.css";
import UserLayout from "../../layout1/UserLayout";
import useAuth from '../../Hooks/useAuth';

export default function OrderDetail() {
  const { orderId } = useParams();
  const [orderItems, setOrderItems] = useState([]);
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
        const data = await getOrderDetail(orderId, token);
        console.log("Dữ liệu API trả về:", data);
        setOrderItems(data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (orderItems.length === 0) return <div>Đang tải đơn hàng...</div>;

  const firstItem = orderItems[0];
  const tongTienSanPham = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tongCong = tongTienSanPham + firstItem.phiGiaoHang;

  return (
    <UserLayout>
      <div className="container mt-4">
        <h3>🧾 Chi tiết đơn hàng #{firstItem.orderId}</h3>
        <form className="border p-4 rounded shadow-sm bg-light">
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Mã đơn hàng:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={`#${firstItem.orderId}`} />
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Trạng thái:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value="🔴 Đang xử lý" />
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Phương thức thanh toán:</label>
            <div className="col-sm-10">
              <input type="text" readOnly className="form-control" value={`${firstItem.payMethodName} - Chưa thanh toán`} />
            </div>
          </div>

          <hr />

          <h5>📦 Danh sách sản phẩm</h5>
          {orderItems.map((item, index) => (
            <div key={index} className="d-flex border p-2 mb-2 rounded align-items-center bg-white">
              <img
                src={item.productImage}
                alt={item.productName}
                style={{ width: "80px", height: "80px", objectFit: "cover", marginRight: "15px", border: "1px solid #ddd" }}
              />
              <div className="flex-grow-1">
                <div><strong>{item.productName}</strong></div>
                <div>Số lượng: {item.quantity} × {item.unitPrice.toLocaleString()}đ</div>
                <div>= {item.totalPrice.toLocaleString()}đ</div>
              </div>
            </div>
          ))}


          <div className="row mb-3">
            <label className="col-sm-2 col-form-label">Địa chỉ giao:</label>
            <div className="col-sm-10">
              <textarea className="form-control" readOnly value={firstItem.diaChiGiao} rows={2}></textarea>
            </div>
          </div>

          <hr />

          <h5>💰 Tổng kết</h5>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Tổng sản phẩm:</label>
            <div className="col-sm-10">
              <input readOnly className="form-control" value={`${tongTienSanPham.toLocaleString()}đ`} />
            </div>
          </div>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Phí giao hàng:</label>
            <div className="col-sm-10">
              <input readOnly className="form-control" value={`${firstItem.phiGiaoHang.toLocaleString()}đ`} />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label fw-bold">Tổng cộng:</label>
            <div className="col-sm-10">
              <input readOnly className="form-control fw-bold" value={`${tongCong.toLocaleString()}đ`} />
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button className="btn btn-danger me-2">Hủy đơn</button>
            <button className="btn btn-secondary">Xem vận đơn</button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
