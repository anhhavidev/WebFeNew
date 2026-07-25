import React from "react";
import { FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";

export default function ProductTable({ products, loading, onViewDetail, onToggleStatus, onDelete }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Loại</th>
            <th>Giá gốc</th>
            <th>Giá KM</th>
            <th>Tồn</th>
            <th>Trạng thái</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="8" className="text-center py-4">Đang tải sản phẩm...</td></tr>
          ) : products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="product-img-wrapper" style={{ position: 'relative' }}>
                    <img
                      src={p.linkImage}
                      alt={p.name}
                      style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "10px", border: "1px solid #eee" }}
                    />
                    {!p.isActive && <div className="status-indicator-red"></div>}
                  </div>
                </td>
                <td className="fw-medium text-dark">{p.name}</td>
                <td className="text-muted">{p.categoryName}</td>
                <td className="text-muted">{p.originalPrice.toLocaleString()}đ</td>
                <td className="text-danger fw-bold">
                  {p.disCountPrice < p.originalPrice ? p.disCountPrice.toLocaleString() + "đ" : "—"}
                </td>
                <td className="fw-medium">{p.stockQuantity}</td>
                <td>
                  {p.statuss === "ConHang" && <span className="status-badge success">Còn hàng</span>}
                  {p.statuss === "HetHang" && <span className="status-badge danger">Hết hàng</span>}
                  {p.statuss === "NgungKinhDoanh" && <span className="status-badge secondary">Khóa</span>}
                </td>
                <td>
                  <div className="action-buttons justify-content-center">
                    <button className="btn-icon view" title="Xem chi tiết" onClick={() => onViewDetail(p)}>
                      <FiEye />
                    </button>
                    <button className="btn-icon edit" title={p.isActive ? "Ẩn sản phẩm" : "Bật sản phẩm"} onClick={() => onToggleStatus(p)}>
                      {p.isActive ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button className="btn-icon delete" title="Xóa" onClick={() => onDelete(p.productId, p.name)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-5 text-muted">Không có sản phẩm nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
