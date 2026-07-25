import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';

export default function AddToCartModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cp-modal-header">
          <h5>✅ Đã thêm vào giỏ hàng</h5>
          <button className="cp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cp-modal-body">
          <img src={product.linkImage} alt={product.name} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#2C2C2C', margin: '0 0 4px' }}>{product.name}</p>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>{product.description}</p>
            <div className="cp-product-prices">
              {product.discountPercent > 0 && (
                <span className="cp-price-original">{product.originalPrice.toLocaleString()}đ</span>
              )}
              <span className="cp-price-current" style={{ fontSize: '18px' }}>
                {(product.discountPercent > 0 ? product.disCountPrice : product.originalPrice).toLocaleString()}đ
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#f59e0b', marginTop: '6px' }}>
              ⭐ {product.rating ?? "Chưa có"} ({product.reviewCount} đánh giá)
            </p>
          </div>
        </div>
        <div className="cp-modal-footer">
          <button className="cp-btn cp-btn-secondary" onClick={onClose}>Tiếp tục mua sắm</button>
          <Link to={ROUTES.CART} className="cp-btn cp-btn-primary">Đi đến giỏ hàng →</Link>
        </div>
      </div>
    </div>
  );
}
