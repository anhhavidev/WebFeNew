import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import UserLayout from '../../layout1/UserLayout';
import { getPaginatedProducts } from '../../Service/ProductApi';
import { FaChevronLeft, FaChevronRight, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import { addToLocalCart } from '../../utils/cartStorage';
import { useCart } from '../../constants/CartContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CustomerPages.css';
import { getCartItems, addProductToCart } from "../../Service/cartApi";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PrevArrow = ({ onClick }) => (
  <div onClick={onClick} style={{
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
    left: '16px', width: '44px', height: '44px',
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'white', fontSize: '18px', transition: 'all 0.2s'
  }}>
    <FaChevronLeft />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div onClick={onClick} style={{
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
    right: '16px', width: '44px', height: '44px',
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'white', fontSize: '18px', transition: 'all 0.2s'
  }}>
    <FaChevronRight />
  </div>
);

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, pageSize, keyword, category, sortedby, isAdding, minprice, maxprice });
  };

  const handleSortChange = (value) => {
    let [sortKey, direction] = value.split("-");
    setSearchParams({ page: 1, pageSize, keyword, category, sortedby: sortKey, isAdding: direction === "asc" ? "true" : "false", minprice, maxprice });
  };

  const handleFilterPrice = () => {
    setSearchParams({ page: 1, pageSize, keyword, category, sortedby, isAdding, minprice: minPriceInput, maxprice: maxPriceInput });
  };

  const handleResetFilter = () => {
    navigate("/", { replace: true });
    setMinPriceInput("");
    setMaxPriceInput("");
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
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#64748b",
        borderRadius: "15px"
      });

      if (result.isConfirmed) {
        navigate("/login");
      }
      return;
    }

    const loadingToast = toast.loading("Đang thêm vào giỏ...");
    try {
      const token = await ensureTokenValid();
      if (!token) {
        toast.error("Phiên đăng nhập hết hạn.", { id: loadingToast });
        navigate("/login");
        return;
      }

      const result = await addProductToCart(product.productId, 1, token);
      if (result.isSuccess) {
        const res = await getCartItems(token);
        const sellerGroups = res.data?.sellerGroups || [];
        let totalQuantity = 0;
        sellerGroups.forEach(group => {
          if (group.cartItems) {
            group.cartItems.forEach(item => {
              totalQuantity += item.soLuong;
            });
          }
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
      .then(data => { setProducts(data.items); setTotalItems(data.totalItems); })
      .catch(err => console.error("Lỗi:", err));
  }, [searchParams]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <UserLayout>
      {/* Alert Toast */}
      {toastAlert.visible && (
        <div className={`cp-alert ${toastAlert.type} ${toastAlert.fading ? "fading" : ""}`}>
          {toastAlert.message}
          <button className="cp-alert-close" onClick={() => setToastAlert({ ...toastAlert, visible: false })}>✕</button>
        </div>
      )}

      <div className="cp-container">
        {/* Hero Slider */}
        <div className="cp-slider-wrap">
          <Slider {...sliderSettings}>
            {['/img/slider1.webp', '/img/slider2.webp', '/img/slider3.webp', '/img/slider4.webp', '/img/slider5.webp'].map((img, i) => (
              <div key={i}>
                <img src={img} alt={`Slide ${i + 1}`} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Filter & Sort Bar */}
        <div className="cp-filter-bar">
          <div className="cp-filter-group">
            <label>Sắp xếp:</label>
            <select onChange={(e) => handleSortChange(e.target.value)} value={`${sortedby}-${isAdding === "true" ? "asc" : "desc"}`}>
              <option value="">Mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>

          <div className="cp-filter-group">
            <label>Giá từ:</label>
            <input type="number" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} placeholder="0" />
          </div>

          <div className="cp-filter-group">
            <label>Đến:</label>
            <input type="number" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} placeholder="999.999" />
          </div>

          <button className="cp-btn-filter primary" onClick={handleFilterPrice}>Lọc</button>
          <button className="cp-btn-filter secondary" onClick={handleResetFilter}>Đặt lại</button>
        </div>

        {/* Section Header */}
        <div className="cp-section-header">
          <h2 className="cp-section-title">Tất cả sản phẩm</h2>
          <span className="cp-section-count">{totalItems} sản phẩm</span>
        </div>

        {/* Product Grid */}
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
                      <span style={{ color: '#9ca3af' }}>Chưa có đánh giá</span>
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
              <div style={{ padding: '0 20px 20px' }}>
                <button className="cp-btn-add-cart" onClick={() => handleAddToCart(product)}>
                  <FaShoppingCart /> Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: '18px' }}>
            Không tìm thấy sản phẩm nào
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cp-pagination">
            <button className="cp-page-btn" disabled={pageNumber === 1} onClick={() => handlePageChange(pageNumber - 1)}>
              ‹ Trước
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`cp-page-btn ${pageNumber === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button className="cp-page-btn" disabled={pageNumber === totalPages} onClick={() => handlePageChange(pageNumber + 1)}>
              Sau ›
            </button>
          </div>
        )}
      </div>

      {/* Add to Cart Modal */}
      {showModal && selectedProduct && (
        <div className="cp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h5>✅ Đã thêm vào giỏ hàng</h5>
              <button className="cp-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="cp-modal-body">
              <img src={selectedProduct.linkImage} alt={selectedProduct.name} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '16px', color: '#2C2C2C', margin: '0 0 4px' }}>{selectedProduct.name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>{selectedProduct.description}</p>
                <div className="cp-product-prices">
                  {selectedProduct.discountPercent > 0 && (
                    <span className="cp-price-original">{selectedProduct.originalPrice.toLocaleString()}đ</span>
                  )}
                  <span className="cp-price-current" style={{ fontSize: '18px' }}>
                    {(selectedProduct.discountPercent > 0 ? selectedProduct.disCountPrice : selectedProduct.originalPrice).toLocaleString()}đ
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#f59e0b', marginTop: '6px' }}>
                  ⭐ {selectedProduct.rating ?? "Chưa có"} ({selectedProduct.reviewCount} đánh giá)
                </p>
              </div>
            </div>
            <div className="cp-modal-footer">
              <button className="cp-btn cp-btn-secondary" onClick={() => setShowModal(false)}>Tiếp tục mua sắm</button>
              <Link to="/cart" className="cp-btn cp-btn-primary">Đi đến giỏ hàng →</Link>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
