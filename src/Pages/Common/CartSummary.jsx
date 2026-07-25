import React from 'react';

export default function CartSummary({ selectedCount, totalPrice, onBuyNow }) {
  return (
    <div className="cp-order-summary">
      <h2>Tóm tắt đơn hàng</h2>
      <div className="cp-summary-row">
        <span>Sản phẩm đã chọn</span>
        <span>{selectedCount} sản phẩm</span>
      </div>
      <div className="cp-summary-row">
        <span>Tạm tính</span>
        <span>{totalPrice.toLocaleString()} đ</span>
      </div>
      <hr className="cp-summary-divider" />
      <div className="cp-summary-total">
        <span className="cp-summary-total-label">Tổng cộng</span>
        <span className="cp-summary-total-value">{totalPrice.toLocaleString()}đ</span>
      </div>
      <button className="cp-btn-checkout" onClick={onBuyNow}>
        MUA NGAY ({selectedCount}) →
      </button>
      <a href="/" className="cp-btn-continue">Tiếp tục mua sắm</a>
    </div>
  );
}
