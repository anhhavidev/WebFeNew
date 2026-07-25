import React from "react";

export default function OrderSummary({ sellerGroupsArray, shippingFees, total, totalShipping, onOrder, onBackToCart }) {
  return (
    <div className="cp-order-summary">
      <h2>🛍️ Đơn hàng</h2>

      <div className="cp-checkout-items">
        {sellerGroupsArray.map((group, idx) => (
          <div key={idx} className="cp-checkout-seller">
            <div className="cp-checkout-seller-name">🏬 {group.storeName}</div>
            {shippingFees[group.sellerId] && (
              <div className="cp-checkout-shipping">
                🚚 Phí ship: {shippingFees[group.sellerId].shippingFee.toLocaleString()} đ · Trọng lượng: {group.totalWeight}g
              </div>
            )}
            {group.items.map((item, index) => (
              <div key={index} className="cp-checkout-item">
                <div className="cp-checkout-item-img">
                  <img src={item.productImage} alt={item.productName} />
                </div>
                <div className="cp-checkout-item-info">
                  <div className="cp-checkout-item-name">{item.productName}</div>
                  <div className="cp-checkout-item-qty">
                    x{item.soLuong} · {item.donGia.toLocaleString()} đ
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Trọng lượng: {item.weight} kg</div>
                </div>
                <div className="cp-checkout-item-price">
                  {(item.soLuong * item.donGia).toLocaleString()} đ
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <hr className="cp-summary-divider" />
      <div className="cp-summary-row">
        <span>Tạm tính</span>
        <span>{total.toLocaleString()} đ</span>
      </div>
      <div className="cp-summary-row">
        <span>Vận chuyển</span>
        <span>{totalShipping.toLocaleString()} đ</span>
      </div>
      <div className="cp-summary-row" style={{ fontSize: '12px' }}>
        <span>Đơn vị vận chuyển</span>
        <span>GHTK</span>
      </div>
      <hr className="cp-summary-divider" />
      <div className="cp-summary-total">
        <span className="cp-summary-total-label">Tổng cộng</span>
        <span className="cp-summary-total-value">{(total + totalShipping).toLocaleString()}đ</span>
      </div>

      <button className="cp-btn-checkout" onClick={onOrder}>
        🛒 ĐẶT HÀNG NGAY
      </button>
      <button className="cp-btn-continue" onClick={onBackToCart}>
        🔙 Quay lại giỏ hàng
      </button>
    </div>
  );
}
