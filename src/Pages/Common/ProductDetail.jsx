import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getPaginatedProducts } from "../../Service/ProductApi";
import UserLayout from "../../layout1/UserLayout";
import useAuth from "../../Hooks/useAuth";
import { useCart } from "../../constants/CartContext";
import { ROUTES } from "../../constants/routePaths";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./CustomerPages.css";
import { FaStar, FaShoppingBag, FaHeart, FaTruck, FaShieldAlt, FaSyncAlt, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa";

const MySwal = withReactContent(Swal);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, ensureTokenValid } = useAuth();
  const { setCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isFav, setIsFav] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(res => {
        const p = res.data || res;
        setProduct(p);
        setSelectedImg(0);
        getPaginatedProducts({ pageSize: 4, categoryId: p.categoryId || "" })
          .then(data => {
            const all = data.items || data.data?.items || [];
            setRelatedProducts(all.filter(item => item.productId !== p.productId).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(() => setError("Không tìm thấy sản phẩm."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      const result = await MySwal.fire({
        title: "Bạn chưa đăng nhập", text: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", icon: "info",
        showCancelButton: true, confirmButtonText: "Đăng nhập ngay", cancelButtonText: "Để sau",
      });
      if (result.isConfirmed) navigate(ROUTES.LOGIN);
      return;
    }
    const loadingToast = toast.loading("Đang thêm vào giỏ...");
    try {
      const token = await ensureTokenValid();
      if (!token) { toast.error("Phiên đăng nhập hết hạn.", { id: loadingToast }); navigate(ROUTES.LOGIN); return; }
      const { addProductToCart, getCartItems } = await import("../../Service/cartApi");
      const result = await addProductToCart(product.productId, quantity, token);
      if (result.isSuccess) {
        const res = await getCartItems(token);
        const sellerGroups = res.data?.sellerGroups || [];
        let total = 0;
        sellerGroups.forEach(g => g.cartItems?.forEach(i => total += i.soLuong));
        setCartCount(total);
        toast.success("Đã thêm vào giỏ hàng!", { id: loadingToast });
      } else {
        toast.error(result.message || "Không thể thêm sản phẩm.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra.", { id: loadingToast });
    }
  };

  if (loading) return <UserLayout><div className="ed-pd"><div style={{ textAlign: 'center', padding: '80px 0', fontSize: 14, color: 'var(--ed-text-muted)' }}>Đang tải...</div></div></UserLayout>;
  if (error || !product) return <UserLayout><div className="ed-pd"><div style={{ textAlign: 'center', padding: '80px 0', fontSize: 14, color: 'var(--ed-red)' }}>{error || "Không tìm thấy sản phẩm"}</div></div></UserLayout>;

  const images = product.linkImage ? [product.linkImage, ...(product.images || [])] : (product.images || [product.linkImage || 'https://via.placeholder.com/600']);

  return (
    <UserLayout>
      <div className="ed-pd">
        {/* Breadcrumb */}
        <div className="ed-pd-breadcrumb">
          <button className="ed-pd-back" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Quay lại
          </button>
          <nav className="ed-pd-breadcrumb-nav" style={{ display: window.innerWidth < 640 ? 'none' : 'flex' }}>
            <button onClick={() => navigate(ROUTES.HOME)}>Trang Chủ</button>
            <span>/</span>
            <button onClick={() => navigate('/')}>{product.categoryName || 'Danh mục'}</button>
            <span>/</span>
            <span>{product.name}</span>
          </nav>
        </div>

        {/* Main Product Section */}
        <div className="ed-pd-main">
          {/* Gallery */}
          <div className="ed-pd-gallery">
            <div className="ed-pd-main-img">
              <img src={images[selectedImg]} alt={product.name} referrerPolicy="no-referrer" />
              {product.discountPercent > 0 && (
                <span className="ed-pd-discount-badge">-{product.discountPercent}% OFF</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="ed-pd-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`ed-pd-thumb ${selectedImg === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImg(idx)}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="ed-pd-details">
            <div>
              <div className="ed-pd-meta">
                <span className="ed-pd-category">{product.categoryName || 'Sản phẩm'}</span>
                <span className="ed-pd-stock">Còn {product.stockQuantity || 'Liên hệ'} sản phẩm</span>
              </div>
              <h1 className="ed-pd-name">{product.name}</h1>
              <div className="ed-pd-rating">
                <div className="ed-pd-rating-stars">
                  {product.rating ? <><FaStar /> <span className="ed-pd-rating-num">{product.rating}</span></> : <span>Chưa có đánh giá</span>}
                </div>
                {product.reviewCount > 0 && <><span className="ed-pd-rating-divider">|</span><span>({product.reviewCount} đánh giá)</span></>}
                <span className="ed-pd-rating-divider">|</span>
                <span className="ed-pd-sku">Mã SP: AUR-{product.productId}</span>
              </div>
            </div>

            <div className="ed-pd-price-box">
              <span className="ed-pd-price">{(product.discountPercent > 0 ? product.disCountPrice : product.originalPrice).toLocaleString()}₫</span>
              {product.discountPercent > 0 && (
                <span className="ed-pd-price-original">{product.originalPrice.toLocaleString()}₫</span>
              )}
            </div>

            <p className="ed-pd-desc">{product.description}</p>

            <div className="ed-pd-qty-area">
              <label className="ed-pd-qty-label">Số Lượng:</label>
              <div className="ed-pd-qty">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FaMinus /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><FaPlus /></button>
              </div>
            </div>

            <div className="ed-pd-actions">
              <div className="ed-pd-action-row">
                <button className="ed-btn-primary" onClick={handleAddToCart}>
                  <FaShoppingBag /> Thêm Vào Giỏ Hàng
                </button>
                <button className="ed-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAddToCart}>
                  Mua Ngay
                </button>
                <button
                  className={`ed-pd-wishlist-btn ${isFav ? 'fav' : ''}`}
                  onClick={() => setIsFav(!isFav)}
                  title="Yêu thích"
                >
                  <FaHeart />
                </button>
              </div>
              <div className="ed-pd-guarantees">
                <div><FaTruck /><span>Freeship</span></div>
                <div><FaShieldAlt /><span>Chính Hãng</span></div>
                <div><FaSyncAlt /><span>30 Ngày Đổi Trả</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="ed-pd-tabs">
          <div className="ed-pd-tab-bar">
            <button className={`ed-pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Mô Tả Chi Tiết</button>
            <button className={`ed-pd-tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Thông Số Kỹ Thuật</button>
            <button className={`ed-pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Đánh Giá</button>
          </div>

          {activeTab === 'description' && (
            <div className="ed-pd-tab-content">
              <p>{product.description}</p>
              <h4 style={{ marginTop: 24 }}>Điểm nổi bật của sản phẩm:</h4>
              <ul>
                <li>Thiết kế hiện đại mang lại vẻ ngoài lịch lãm và sang trọng.</li>
                <li>Chất liệu được tuyển chọn kỹ lưỡng, gia công tỉ mỉ từng đường kim mũi chỉ.</li>
                <li>Thích hợp làm quà tặng cao cấp hoặc sử dụng thường ngày.</li>
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="ed-pd-tab-content">
              <table className="ed-pd-specs-table">
                <tbody>
                  <tr><td>Chất liệu</td><td>Cao cấp</td></tr>
                  <tr><td>Bảo hành</td><td>12 tháng</td></tr>
                  <tr><td>Xuất xứ</td><td>Việt Nam</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="ed-pd-tab-content">
              <div className="ed-pd-reviews">
                <p style={{ color: 'var(--ed-text-muted)', fontStyle: 'italic' }}>Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="ed-related">
            <h2 className="ed-related-title">Sản Phẩm Tương Tự</h2>
            <div className="ed-related-grid">
              {relatedProducts.map(p => (
                <div key={p.productId} className="ed-prod-card" onClick={() => { window.scrollTo(0, 0); navigate(`/product/${p.productId}`); }}>
                  <div className="ed-prod-img-wrap">
                    <img src={p.linkImage} alt={p.name} referrerPolicy="no-referrer" />
                    {p.discountPercent > 0 && (
                      <div className="ed-prod-badges"><span className="ed-prod-badge">-{p.discountPercent}%</span></div>
                    )}
                  </div>
                  <div className="ed-prod-info" style={{ padding: 12 }}>
                    <span className="ed-prod-category">{p.categoryName || ''}</span>
                    <h3 className="ed-prod-name">{p.name}</h3>
                    <div className="ed-prod-footer" style={{ border: 'none', padding: 0, marginTop: 8 }}>
                      <div className="ed-prod-price">{(p.discountPercent > 0 ? p.disCountPrice : p.originalPrice).toLocaleString()}₫</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
