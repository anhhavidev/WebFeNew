import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

export default function ProductGrid({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        Không tìm thấy sản phẩm nào
      </div>
    );
  }

  return (
    <div className="cp-product-grid">
      {products.map(product => (
        <div key={product.productId} className="cp-product-card">
          <Link to={`/product/${product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="cp-product-img-wrap">
              <img src={product.linkImage} alt={product.name} />
              {product.discountPercent > 0 && (
                <span className="cp-discount-badge">-{product.discountPercent}%</span>
              )}
            </div>
            <div className="cp-product-info">
              <span className="cp-product-category">{product.categoryName || ''}</span>
              <h3 className="cp-product-name">{product.name}</h3>
              <p className="cp-product-desc">{product.description}</p>
              <div className="cp-product-rating">
                {product.rating ? (
                  <><FaStar /> {product.rating} / 5 ({product.reviewCount} đánh giá)</>
                ) : (
                  <span className="text-muted">Chưa có đánh giá</span>
                )}
              </div>
              <div className="cp-product-prices">
                {product.discountPercent > 0 && (
                  <span className="cp-price-original">{product.originalPrice.toLocaleString()}đ</span>
                )}
                <span className="cp-price-current">
                  {(product.discountPercent > 0 ? product.disCountPrice : product.originalPrice).toLocaleString()}đ
                </span>
              </div>
            </div>
          </Link>
          <div className="p-3">
            <button className="cp-btn-add-cart" onClick={() => onAddToCart(product)}>
              <FaShoppingCart /> Thêm vào giỏ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
