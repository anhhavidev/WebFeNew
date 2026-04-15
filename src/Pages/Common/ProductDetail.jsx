import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserLayout from '../../layout1/UserLayout';
import { getProductById } from '../../Service/ProductApi';
import { addProductToCart } from '../../Service/cartApi';
import { addToLocalCart } from '../../utils/cartStorage';
import { useCart } from '../../constants/CartContext';
import { getCartItems } from '../../Service/cartApi';
import useAuth from '../../Hooks/useAuth';
import {
  FiShoppingCart, FiArrowLeft, FiStar, FiCheckCircle,
  FiPackage, FiTruck, FiShield, FiHeart, FiShare2, FiChevronRight
} from 'react-icons/fi';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, ensureTokenValid } = useAuth();
  const { setCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [alert, setAlert] = useState({ msg: '', type: '', visible: false });

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(data => {
        setProduct(data);
        setActiveImg(0);
      })
      .catch(() => setError('Không tìm thấy sản phẩm.'))
      .finally(() => setLoading(false));
  }, [id]);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type, visible: true });
    setTimeout(() => setAlert(a => ({ ...a, visible: false })), 3000);
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        addToLocalCart(product.productId, qty, newCount => setCartCount(newCount));
        setAddedToCart(true);
        showAlert('Đã thêm vào giỏ hàng!');
        return;
      }
      const token = await ensureTokenValid();
      if (!token) { navigate('/login'); return; }
      const result = await addProductToCart(product.productId, qty, token);
      if (result.isSuccess) {
        const res = await getCartItems(token);
        const total = res.data?.cartItems?.reduce((s, i) => s + i.soLuong, 0);
        setCartCount(total || 0);
        setAddedToCart(true);
        showAlert('Đã thêm vào giỏ hàng!');
      } else {
        showAlert('Hết hàng hoặc có lỗi xảy ra.', 'error');
      }
    } catch {
      showAlert('Có lỗi khi thêm vào giỏ hàng.', 'error');
    }
  };

  /* ───────── Loading ───────── */
  if (loading) return (
    <UserLayout>
      <div className="pd-loading-screen">
        <div className="pd-loader" />
        <p>Đang tải sản phẩm...</p>
      </div>
    </UserLayout>
  );

  /* ───────── Error ───────── */
  if (error || !product) return (
    <UserLayout>
      <div className="pd-error-screen">
        <p>{error || 'Không có dữ liệu.'}</p>
        <button onClick={() => navigate(-1)} className="pd-back-btn">
          <FiArrowLeft /> Quay lại
        </button>
      </div>
    </UserLayout>
  );

  /* ───────── Compute ───────── */
  const images = [
    product.linkImage,
    ...(product.imageGallery || []),
  ].filter(Boolean);

  const finalPrice  = product.discountPercent > 0 ? product.disCountPrice : product.originalPrice;
  const ratingStars = Math.round(product.rating || 0);
  const inStock     = (product.stockQuantity ?? 0) > 0;

  return (
    <UserLayout>
      {/* ── Toast Alert ── */}
      {alert.visible && (
        <div className={`pd-toast ${alert.type}`}>{alert.msg}</div>
      )}

      <div className="pd-wrapper">

        {/* ── Breadcrumb ── */}
        <nav className="pd-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <FiChevronRight size={13} />
          {product.categoryName && (
            <>
              <Link to={`/?category=${product.categoryId}`}>{product.categoryName}</Link>
              <FiChevronRight size={13} />
            </>
          )}
          <span>{product.name}</span>
        </nav>

        {/* ── Main content ── */}
        <div className="pd-main">

          {/* ── LEFT: Image gallery ── */}
          <div className="pd-gallery">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="pd-main-img-wrap">
              <img
                className="pd-main-img"
                src={images[activeImg]}
                alt={product.name}
              />
              {product.discountPercent > 0 && (
                <span className="pd-discount-badge">-{product.discountPercent}%</span>
              )}
              <button
                className={`pd-wishlist-btn ${wishlist ? 'active' : ''}`}
                onClick={() => setWishlist(w => !w)}
                title="Yêu thích"
              >
                <FiHeart size={18} />
              </button>
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="pd-info">

            {/* Category pill */}
            {product.categoryName && (
              <span className="pd-category-pill">{product.categoryName}</span>
            )}

            <h1 className="pd-product-name">{product.name}</h1>

            {/* Rating */}
            <div className="pd-rating-row">
              <div className="pd-stars">
                {[1,2,3,4,5].map(s => (
                  <FiStar
                    key={s}
                    size={16}
                    className={s <= ratingStars ? 'star-filled' : 'star-empty'}
                  />
                ))}
              </div>
              <span className="pd-rating-count">
                {product.rating
                  ? `${product.rating}/5 · ${product.reviewCount} đánh giá`
                  : 'Chưa có đánh giá'}
              </span>
            </div>

            {/* Price */}
            <div className="pd-price-block">
              <span className="pd-price-final">
                {finalPrice?.toLocaleString('vi-VN')}₫
              </span>
              {product.discountPercent > 0 && (
                <span className="pd-price-origin">
                  {product.originalPrice?.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* Description */}
            <p className="pd-desc">{product.description}</p>

            {/* Stock status */}
            <div className={`pd-stock ${inStock ? 'in' : 'out'}`}>
              <FiCheckCircle size={15} />
              {inStock
                ? `Còn hàng · ${product.stockQuantity} sản phẩm`
                : 'Hết hàng'}
            </div>

            {/* Quantity + Add to cart */}
            <div className="pd-actions">
              <div className="pd-qty-control">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >−</button>
                <span className="pd-qty-val">{qty}</span>
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}
                  disabled={qty >= product.stockQuantity}
                >+</button>
              </div>

              <button
                className={`pd-add-btn ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <FiShoppingCart size={17} />
                {addedToCart ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
              </button>

              <Link to="/cart" className="pd-buy-btn">Mua ngay</Link>
            </div>

            {/* Trust badges */}
            <div className="pd-trust-row">
              <div className="pd-trust-item">
                <FiTruck size={18} /> <span>Giao hàng toàn quốc</span>
              </div>
              <div className="pd-trust-item">
                <FiShield size={18} /> <span>Bảo hành 30 ngày</span>
              </div>
              <div className="pd-trust-item">
                <FiPackage size={18} /> <span>Đổi trả dễ dàng</span>
              </div>
            </div>

            {/* Share */}
            <button className="pd-share-btn" onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showAlert('Đã sao chép link!');
            }}>
              <FiShare2 size={14} /> Chia sẻ sản phẩm
            </button>
          </div>
        </div>

        {/* ── Back button ── */}
        <button onClick={() => navigate(-1)} className="pd-back-link">
          <FiArrowLeft size={15} /> Quay lại danh sách
        </button>
      </div>
    </UserLayout>
  );
}
