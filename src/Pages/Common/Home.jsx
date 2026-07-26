import React, { useEffect, useState } from 'react';
import UserLayout from '../../layout1/UserLayout';
import HeroSlider from './HeroSlider';
import ProductGrid from './ProductGrid';
import ToastAlert from './ToastAlert';
import AddToCartModal from './AddToCartModal';
import { getPaginatedProducts } from '../../Service/ProductApi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import { addToLocalCart } from '../../utils/cartStorage';
import { useCart } from '../../constants/CartContext';
import { ROUTES } from '../../constants/routePaths';
import { getCartItems, addProductToCart } from "../../Service/cartApi";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CustomerPages.css';
import { FaChevronLeft, FaChevronRight, FaStar, FaTruck, FaShieldAlt, FaSyncAlt, FaHeadset, FaClock, FaArrowRight, FaFire } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const FEATURES = [
  { icon: 'FaTruck', title: 'Giao Hàng Miễn Phí', desc: 'Cho đơn hàng từ 500.000đ' },
  { icon: 'FaShieldAlt', title: 'Cam Kết Chính Hãng', desc: 'Hoàn tiền 200% nếu phát hiện hàng giả' },
  { icon: 'FaSyncAlt', title: 'Đổi Trả 30 Ngày', desc: 'Đổi trả miễn phí không cần lý do' },
  { icon: 'FaHeadset', title: 'Hỗ Trợ 24/7', desc: 'Tư vấn tận tâm qua Hotline & Chat' },
];

const CATEGORIES_DATA = [
  { id: 'fashion', name: 'Thời Trang & May Mặc', count: 42, desc: 'Trang phục hiện đại, tinh tế', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop' },
  { id: 'tech', name: 'Công Nghệ & Phụ Kiện', count: 28, desc: 'Thiết bị điện tử cao cấp', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
  { id: 'home', name: 'Nhà Cửa & Đời Sống', count: 35, desc: 'Đồ trang trí tối giản cho không gian sống', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop' },
];

const TESTIMONIALS = [
  { name: 'Đặng Mai Phương', role: 'Khách hàng thân thiết', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', comment: 'Tôi rất thích phong cách thiết kế tối giản. Áo khoác mua đợt trước chất lượng siêu đẹp!', rating: 5 },
  { name: 'Nguyễn Tiến Dũng', role: 'Tech Enthusiast', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', comment: 'Giao hàng cực kỳ nhanh. Mua tai nghe Acoustic Pro chiều hôm trước sáng hôm sau đã nhận được.', rating: 5 },
  { name: 'Hoàng Kim Anh', role: 'Interior Designer', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop', comment: 'Giao diện web mượt mà. Đèn bàn cảm ứng mua về đặt ở phòng làm việc ai đến cũng khen.', rating: 5 },
];

const HERO_SLIDES = [
  { id: 1, title: 'Bộ Sưu Tập Mùa Hè 2026', tag: 'Mới Ra Mắt', badge: 'Giảm tới 30%', desc: 'Khám phá các thiết kế thời trang & phụ kiện hiện đại với đường nét tinh tế, chất liệu thân thiện môi trường.', btnText: 'Khám Phá Ngay', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop' },
  { id: 2, title: 'Thiết Bị Âm Thanh Cao Cấp', tag: 'Xu Hướng Tech', badge: 'Freeship Toàn Quốc', desc: 'Tai nghe chống ồn chủ động, loa bluetooth hiện đại đem cả không gian âm nhạc vào cuộc sống của bạn.', btnText: 'Mua Ngay', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop' },
  { id: 3, title: 'Nội Thất Nordic Tối Giản', tag: 'Nội Thất Độc Quyền', badge: 'Ưu Đãi Đặt Trước', desc: 'Kiến tạo tổ ấm với dòng sản phẩm bàn ghế, đèn chiếu sáng và đồ trang trí phong cách Bắc Âu.', btnText: 'Xem Bộ Sưu Tập', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user, ensureTokenValid } = useAuth();
  const { setCartCount } = useCart();
  const [toastAlert, setToastAlert] = useState({ message: "", type: "", visible: false, fading: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });

  const pageNumber = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 12;
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const minprice = searchParams.get("minprice") || "";
  const maxprice = searchParams.get("maxprice") || "";
  const sortedby = searchParams.get("sortedby") || "";
  const isAdding = searchParams.get("isAdding") || "true";

  const [minPriceInput, setMinPriceInput] = useState(minprice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxprice);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, pageSize, keyword, category, sortedby, isAdding, minprice, maxprice });
  };

  const showAlert = (message, type = "success", duration = 3000) => {
    setToastAlert({ message, type, visible: true, fading: false });
    setTimeout(() => setToastAlert((prev) => ({ ...prev, fading: true })), duration - 500);
    setTimeout(() => setToastAlert((prev) => ({ ...prev, visible: false, fading: false })), duration);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      const result = await MySwal.fire({
        title: "Bạn chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập ngay",
        cancelButtonText: "Để sau",
      });
      if (result.isConfirmed) navigate(ROUTES.LOGIN);
      return;
    }
    const loadingToast = toast.loading("Đang thêm vào giỏ...");
    try {
      const token = await ensureTokenValid();
      if (!token) { toast.error("Phiên đăng nhập hết hạn.", { id: loadingToast }); navigate(ROUTES.LOGIN); return; }
      const result = await addProductToCart(product.productId, 1, token);
      if (result.isSuccess) {
        const res = await getCartItems(token);
        const sellerGroups = res.data?.sellerGroups || [];
        let totalQuantity = 0;
        sellerGroups.forEach(group => {
          if (group.cartItems) group.cartItems.forEach(item => { totalQuantity += item.soLuong; });
        });
        setCartCount(totalQuantity);
        setSelectedProduct(product);
        setShowModal(true);
        toast.success("Đã thêm vào giỏ hàng!", { id: loadingToast });
      } else {
        toast.error(result.message || "Không thể thêm sản phẩm.", { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra.", { id: loadingToast });
    }
  };

  useEffect(() => {
    const filter = {
      pageNumber, pageSize, keyword, categoryId: category,
      sortedby, isAdding: isAdding === "true", minprice, maxprice,
    };
    getPaginatedProducts(filter)
      .then(data => { setProducts(data.items || data.data?.items || []); setTotalItems(data.totalItems || data.data?.totalItems || 0); })
      .catch(err => console.error("Lỗi:", err));
  }, [searchParams]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const filteredProducts = products.filter(p => {
    if (activeTab === 'featured') return p.discountPercent > 10;
    if (activeTab === 'new') return p.discountPercent === 0;
    return true;
  });

  return (
    <UserLayout>
      <ToastAlert alert={toastAlert} onClose={() => setToastAlert({ ...toastAlert, visible: false })} />
      <div className="ed-space-y-16 ed-pb-16" style={{ background: '#FDFCFB' }}>
        {/* Editorial Hero */}
        <section className="ed-hero">
          {HERO_SLIDES.map((slide, idx) => {
            if (idx !== currentSlide) return null;
            return (
              <div key={slide.id} className="ed-hero-slide" style={{ opacity: idx === currentSlide ? 1 : 0, transition: 'opacity 0.6s' }}>
                <div className="ed-hero-bg">
                  <img src={slide.img} alt={slide.title} referrerPolicy="no-referrer" />
                </div>
                <div className="ed-hero-overlay" />
                <div className="ed-hero-content">
                  <div className="ed-hero-tag">
                    <span>{slide.tag}</span>
                    <span className="ed-hero-badge">{slide.badge}</span>
                  </div>
                  <h1 className="ed-hero-title">{slide.title}</h1>
                  <p className="ed-hero-desc">{slide.desc}</p>
                  <div className="ed-hero-actions">
                    <button className="ed-btn-primary" onClick={() => navigate(ROUTES.HOME)}>
                      <span>{slide.btnText}</span>
                      <FaArrowRight />
                    </button>
                    <button className="ed-btn-outline" onClick={() => navigate('/product/prod-1')}>
                      Sản Phẩm Nổi Bật
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="ed-hero-controls">
            <button className="ed-hero-btn" onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>
              <FaChevronLeft />
            </button>
            <span className="ed-hero-counter">0{currentSlide + 1} / 0{HERO_SLIDES.length}</span>
            <button className="ed-hero-btn" onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}>
              <FaChevronRight />
            </button>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="ed-features">
          <div className="ed-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="ed-feature-item">
                <div className="ed-feature-icon">
                  {f.icon === 'FaTruck' && <FaTruck />}
                  {f.icon === 'FaShieldAlt' && <FaShieldAlt />}
                  {f.icon === 'FaSyncAlt' && <FaSyncAlt />}
                  {f.icon === 'FaHeadset' && <FaHeadset />}
                </div>
                <div>
                  <h4 className="ed-feature-title">{f.title}</h4>
                  <p className="ed-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="ed-section">
          <div className="ed-section-header">
            <div>
              <span className="ed-section-label">Curation / 01</span>
              <h2 className="ed-section-title">Bộ Sưu Tập Cốt Lõi</h2>
            </div>
            <button className="ed-section-link" onClick={() => navigate('/')}>
              <span>Khám phá tất cả</span>
              <FaArrowRight />
            </button>
          </div>
          <div className="ed-cat-grid">
            {CATEGORIES_DATA.map((cat, index) => (
              <div key={cat.id} className="ed-cat-card" style={index === 0 ? { gridColumn: 'span 1' } : {}}>
                <img src={cat.img} alt={cat.name} referrerPolicy="no-referrer" />
                <div className="ed-cat-overlay" />
                <div className="ed-cat-info">
                  <span className="ed-cat-count">{cat.count} Items</span>
                  <h3 className="ed-cat-name">{cat.name}</h3>
                  <p className="ed-cat-desc">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        <section className="ed-flash">
          <div className="ed-flash-inner">
            <div className="ed-flash-header">
              <div>
                <span className="ed-flash-label">Exclusive Selection</span>
                <h2 className="ed-flash-title">Flash Sale — Ưu Đãi Giới Hạn</h2>
              </div>
              <div className="ed-countdown">
                <FaClock className="ed-countdown-icon" />
                <span className="ed-countdown-label">Kết thúc sau:</span>
                <div className="ed-countdown-nums">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span>:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span>:</span>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
            <div className="ed-flash-grid">
              {products.slice(0, 4).map(product => (
                <div key={product.productId} className="ed-prod-card">
                  <div className="ed-prod-img-wrap">
                    <img src={product.linkImage} alt={product.name} referrerPolicy="no-referrer" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.productId}`)} />
                    {product.discountPercent > 0 && (
                      <div className="ed-prod-badges">
                        <span className="ed-prod-badge">-{product.discountPercent}%</span>
                      </div>
                    )}
                  </div>
                  <div className="ed-prod-info" style={{ padding: 12 }}>
                    <span className="ed-prod-category">{product.categoryName || ''}</span>
                    <h3 className="ed-prod-name" onClick={() => navigate(`/product/${product.productId}`)}>{product.name}</h3>
                    <div className="ed-prod-footer" style={{ border: 'none', padding: 0, marginTop: 8 }}>
                      <div>
                        <div className="ed-prod-price">{(product.discountPercent > 0 ? product.disCountPrice : product.originalPrice).toLocaleString()}₫</div>
                        {product.discountPercent > 0 && <span className="ed-prod-price-original">{product.originalPrice.toLocaleString()}₫</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="ed-section">
          <div className="ed-section-header">
            <div>
              <span className="ed-section-label">Curation / 02</span>
              <h2 className="ed-section-title">Sản Phẩm Được Mua Nhiều</h2>
            </div>
            <div className="ed-tabs">
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'featured', label: 'Nổi Bật' },
                { id: 'new', label: 'Mới Về' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`ed-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  style={{
                    minWidth: 40, height: 40, padding: '0 12px',
                    border: '1px solid var(--ed-border)', background: pageNumber === index + 1 ? 'var(--ed-dark)' : 'transparent',
                    color: pageNumber === index + 1 ? 'white' : 'var(--ed-dark)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Lookbook Banner */}
        <section className="ed-lookbook">
          <div className="ed-lookbook-inner">
            <div className="ed-lookbook-text">
              <span className="ed-lookbook-label">AURA EDITORIAL LOOKBOOK</span>
              <h2 className="ed-lookbook-title">Sự Tinh Tế Trong Từng Chi Tiết Tối Giản</h2>
              <p className="ed-lookbook-desc">
                AURA cam kết mang đến những thiết kế vượt thời gian, chú trọng chất liệu tự nhiên, sự tỉ mỉ trong khâu may đo & chế tác, nhằm định hình phong cách sống tự do và thanh lịch.
              </p>
              <button className="ed-btn-primary" onClick={() => navigate('/')}>
                <span>Khám Phá Lookbook</span>
                <FaArrowRight />
              </button>
            </div>
            <div className="ed-lookbook-img">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop" alt="Lookbook" referrerPolicy="no-referrer" />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="ed-testimonials">
          <div className="ed-testimonials-header">
            <span className="ed-section-label">Phản Hồi Từ Khách Hàng</span>
            <h2 className="ed-section-title">Trải Nghiệm Đáng Giá</h2>
          </div>
          <div className="ed-testimonials-grid">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="ed-testimonial-card">
                <div>
                  <div className="ed-testimonial-stars">
                    {[...Array(t.rating)].map((_, i) => <FaStar key={i} />)}
                  </div>
                  <p className="ed-testimonial-text">"{t.comment}"</p>
                </div>
                <div className="ed-testimonial-author">
                  <img src={t.avatar} alt={t.name} className="ed-testimonial-avatar" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="ed-testimonial-name">{t.name}</h4>
                    <span className="ed-testimonial-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <AddToCartModal product={selectedProduct} onClose={() => setShowModal(false)} />
    </UserLayout>
  );
}
