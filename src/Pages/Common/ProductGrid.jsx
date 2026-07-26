import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaEye, FaShoppingCart } from 'react-icons/fa';

export default function ProductGrid({ products, onAddToCart, onToggleWishlist, wishlistIds }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        Không tìm thấy sản phẩm nào
      </div>
    );
  }

  return (
    <div className="ed-product-grid">
      {products.map(product => (
        <div key={product.productId} className="ed-prod-card">
          <div className="ed-prod-img-wrap">
            <Link to={`/product/${product.productId}`}>
              <img src={product.linkImage} alt={product.name} />
            </Link>

            {product.discountPercent > 0 && (
              <div className="ed-prod-badges">
                <span className="ed-prod-badge">-{product.discountPercent}%</span>
              </div>
            )}

            <div className="ed-prod-actions">
              <button
                className={`ed-prod-action-btn ${wishlistIds?.includes(product.productId) ? 'fav' : ''}`}
                onClick={(e) => { e.preventDefault(); onToggleWishlist?.(product); }}
                title="Yêu thích"
              >
                <FaHeart />
              </button>
              <Link to={`/product/${product.productId}`} className="ed-prod-action-btn" title="Xem chi tiết">
                <FaEye />
              </Link>
            </div>

            <div className="ed-prod-overlay-btn">
              <button onClick={() => onAddToCart(product)}>
                <FaShoppingCart /> Thêm Vào Giỏ
              </button>
            </div>
          </div>

          <div className="ed-prod-info">
            <div>
              <span className="ed-prod-category">{product.categoryName || ''}</span>
              <Link to={`/product/${product.productId}`} style={{ textDecoration: 'none' }}>
                <h3 className="ed-prod-name">{product.name}</h3>
              </Link>
              <div className="ed-prod-rating">
                <div className="ed-prod-stars">
                  {product.rating ? (
                    <><FaStar /> <span className="ed-prod-rating-num">{product.rating}</span></>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--ed-text-muted)' }}>Chưa có đánh giá</span>
                  )}
                </div>
                {product.reviewCount > 0 && (
                  <span className="ed-prod-rating-count">({product.reviewCount})</span>
                )}
              </div>
            </div>

            <div className="ed-prod-footer">
              <div>
                <div className="ed-prod-price">
                  {(product.discountPercent > 0 ? product.disCountPrice : product.originalPrice).toLocaleString()}₫
                </div>
                {product.discountPercent > 0 && (
                  <span className="ed-prod-price-original">{product.originalPrice.toLocaleString()}₫</span>
                )}
              </div>
              <button className="ed-prod-mobile-cart" onClick={() => onAddToCart(product)}>
                <FaShoppingCart />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
