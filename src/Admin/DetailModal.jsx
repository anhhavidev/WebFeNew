import React from "react";
import { FiInfo } from "react-icons/fi";

export default function DetailModal({ product, onClose, onEdit }) {
  if (!product) return null;
  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content overflow-hidden border-0 shadow-2xl">
          <div className="modal-header bg-light border-0 py-3">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <FiInfo className="text-primary" /> Chi tiết sản phẩm
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-0">
            <div className="p-4">
              <div className="d-flex gap-4 mb-4">
                <img
                  src={product.linkImage}
                  alt={product.name}
                  className="rounded-3 shadow-sm border"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <h4 className="fw-bold text-dark mb-1">{product.name}</h4>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                      {product.categoryName}
                    </span>
                    <span className={`status-badge ${product.isActive ? 'success' : 'danger'}`}>
                      {product.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
                    </span>
                  </div>
                  <p className="text-muted small mb-0">Cung cấp bởi: <span className="text-dark fw-medium">{product.sellerName}</span></p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <label className="text-muted fs-7 d-block mb-1">Giá gốc</label>
                    <span className="fw-bold text-dark fs-5">{product.originalPrice.toLocaleString()}đ</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <label className="text-muted fs-7 d-block mb-1">Giá khuyến mãi</label>
                    <span className="fw-bold text-danger fs-5">
                      {product.disCountPrice < product.originalPrice ? product.disCountPrice.toLocaleString() + "đ" : "Không có"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <label className="text-muted fs-7 d-block mb-1">Tồn kho</label>
                    <span className="fw-bold text-dark fs-5">{product.stockQuantity} sản phẩm</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <label className="text-muted fs-7 d-block mb-1">Trạng thái kho</label>
                    <span className="fw-bold text-dark fs-5">
                      {product.statuss === "ConHang" ? "Còn hàng" : (product.statuss === "HetHang" ? "Hết hàng" : "Khóa")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer bg-light border-0">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Đóng</button>
            <button type="button" className="btn btn-primary px-4 border-0" style={{ backgroundColor: '#2563eb' }}
              onClick={() => { onClose(); onEdit(product); }}>Chỉnh sửa</button>
          </div>
        </div>
      </div>
    </div>
  );
}
