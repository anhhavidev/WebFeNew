import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import UserLayout from '../../layout1/UserLayout';
import { getPaginatedProducts } from '../../Service/ProductApi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { addProductToCart } from '../../Service/cartApi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import { addToLocalCart } from '../../utils/cartStorage';
import { useCart } from '../../constants/CartContext'; // ✅
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Home.css';
import { getCartItems } from "../../Service/cartApi"; // đảm bảo đã import
const arrowStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  fontSize: '24px',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  padding: '8px',
  cursor: 'pointer',
};

const PrevArrow = ({ onClick }) => (
  <div onClick={onClick} style={{ ...arrowStyle, left: '10px' }}>
    <FaChevronLeft />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div onClick={onClick} style={{ ...arrowStyle, right: '10px' }}>
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
  const { setCartCount } = useCart(); // ✅

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
    setSearchParams({
      page: newPage,
      pageSize,
      keyword,
      category,
      sortedby,
      isAdding,
      minprice,
      maxprice,
    });
  };

  const handleSortChange = (value) => {
    let [sortKey, direction] = value.split("-");
    setSearchParams({
      page: 1,
      pageSize,
      keyword,
      category,
      sortedby: sortKey,
      isAdding: direction === "asc" ? "true" : "false",
      minprice,
      maxprice,
    });
  };

  const handleFilterPrice = () => {
    setSearchParams({
      page: 1,
      pageSize,
      keyword,
      category,
      sortedby,
      isAdding,
      minprice: minPriceInput,
      maxprice: maxPriceInput,
    });
  };

  const handleResetFilter = () => {
    navigate("/", { replace: true });
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const handleAddToCart = async (product) => {
    // 👉 nó sẽ dừng ở đây khi bạn click
    try {
      if (!user) {
        addToLocalCart(product.productId, 1, (newCount) => {
          setCartCount(newCount); // ✅ cập nhật context luôn
        });
        setSelectedProduct(product);
        setShowModal(true);
        return;
      }

      const token = await ensureTokenValid();
      if (!token) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }
      // 👇 Dừng ở đây để kiểm tra token, product
      //debugger;
      const result = await addProductToCart(product.productId, 1, token);
      if (result.isSuccess) {
        // ✅ GỌI LẠI API để lấy số lượng giỏ hàng thực sự từ server
        const res = await getCartItems(token);
        const totalQuantity = res.data?.cartItems?.reduce(
          (sum, item) => sum + item.soLuong,
          0
        );
        setCartCount(totalQuantity || 0);

         setSelectedProduct(product);
        // **Thay đổi selectedProduct để lấy giá đã tính sẵn từ BE**
        // setSelectedProduct({ // sửa 
        //   ...product,
        //   donGia: result.data.donGia ?? product.originalPrice
        // });
        setShowModal(true);
      } else {
        alert(result.message || "Thêm vào giỏ hàng thất bại.");
      }
    } catch (error) {
      alert(error.message || "Thêm vào giỏ hàng thất bại.");
    }
  };

  useEffect(() => {
    const filter = {
      pageNumber,
      pageSize,
      keyword,
      categoryId: category,
      sortedby,
      isAdding: isAdding === "true",
      minprice,
      maxprice,
    };

    getPaginatedProducts(filter)
      .then(data => {
        setProducts(data.items);
        setTotalItems(data.totalItems);
      })
      .catch(err => console.error("Lỗi:", err));
  }, [searchParams]);

  return (
    <UserLayout>
      {/* Slider */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
        <Slider {...sliderSettings} className="custom-slider" dotsClass="slick-dots">
          {['/img/slider1.webp', '/img/slider2.webp', '/img/slider3.webp', '/img/slider4.webp', '/img/slider5.webp'].map((img, i) => (
            <div key={i}>
              <img src={img} alt={`Slide ${i + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />
            </div>
          ))}
        </Slider>
      </div>

      {/* Bộ lọc và sắp xếp */}
      <div className="container mt-4">
        <div className="row mb-3">
          <div className="col-md-3">
            <label>Sắp xếp:</label>
            <select className="form-select" onChange={(e) => handleSortChange(e.target.value)} value={`${sortedby}-${isAdding === "true" ? "asc" : "desc"}`}>
              <option value="">Mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Giá từ:</label>
            <input type="number" className="form-control" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} />
          </div>

          <div className="col-md-3">
            <label>Đến:</label>
            <input type="number" className="form-control" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={handleFilterPrice}>
              Lọc
            </button>
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-outline-secondary w-100" onClick={handleResetFilter}>
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className='container mt-4'>
        <div className='row'>
          {products.map(product => (
            <div key={product.productId} className='col-md-3 mb-4'>
              <div className='card h-100'>
                <Link to={`/product/${product.productId}`} className="text-decoration-none text-dark">
                  <img src={product.linkImage} className='card-img-top' alt={product.name} />
                  <div className='card-body'>
                    <h5 className='card-title'>{product.name}</h5>
                    <p className='card-text'>{product.description}</p>
                    {product.rating ? (
                      <div className='text-warning'>
                        {product.rating} / 5 ({product.reviewCount} đánh giá)
                      </div>
                    ) : (
                      <div className='text-muted'>Chưa có đánh giá</div>
                    )}
                    {product.discountPercent ? (
                      <>
                        <span className="text-danger fw-bold">
                          {product.disCountPrice.toLocaleString()}đ
                        </span>
                        <span className='text-muted text-decoration-line-through ms-2'>
                          {product.originalPrice.toLocaleString()}đ
                        </span>
                      </>
                    ) : (
                      <span className='text-danger fw-bold'>{product.originalPrice.toLocaleString()}đ</span>
                    )}

                    {product.discountPercent && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">-{product.discountPercent}%</span>
                    )}
                  </div>
                </Link>
                <button className='btn btn-primary mt-auto' onClick={() => handleAddToCart(product)}>
                  Thêm hàng vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phân trang */}
      <div className="text-center mt-4">
        <button className="btn btn-outline-secondary me-2" disabled={pageNumber === 1} onClick={() => handlePageChange(pageNumber - 1)}>
          Trang trước
        </button>
        {[...Array(Math.ceil(totalItems / pageSize))].map((_, index) => (
          <button key={index} className={`btn btn-sm mx-1 ${pageNumber === index + 1 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
        <button className="btn btn-outline-secondary ms-2" disabled={pageNumber === Math.ceil(totalItems / pageSize)} onClick={() => handlePageChange(pageNumber + 1)}>
          Trang sau
        </button>
      </div>

      {/* Modal thông báo */}
      {showModal && selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đã thêm vào giỏ hàng</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body d-flex align-items-center">
                <img src={selectedProduct.linkImage} alt={selectedProduct.name} style={{ width: "100px", marginRight: "16px" }} />
                <div>
                  <p className="mb-1"><strong>{selectedProduct.name}</strong></p>
                  <p className="mb-1 text-muted">{selectedProduct.description}</p>
                  <p className="mb-1">
                    <span className="text-danger fw-bold">
                      {selectedProduct.discountPercent ? (
                        <>
                          <span className="text-danger fw-bold">
                            {selectedProduct.disCountPrice.toLocaleString()}đ
                          </span>
                          <span className='text-muted text-decoration-line-through ms-2'>
                            {selectedProduct.originalPrice.toLocaleString()}đ
                          </span>
                        </>
                      ) : (
                        <span className='text-danger fw-bold'>{selectedProduct.originalPrice.toLocaleString()}đ</span>
                      )}
                    </span>
                  </p>

                  <p className="mb-1">
                    ⭐ {selectedProduct.rating ?? "Chưa có"} ({selectedProduct.reviewCount} đánh giá)
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Tiếp tục mua sắm</button>
                <Link to="/cart" className="btn btn-primary">Đi đến giỏ hàng</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
