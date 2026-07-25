import React, { useEffect, useState } from 'react';
import UserLayout from '../../layout1/UserLayout';
import HeroSlider from './HeroSlider';
import FilterBar from './FilterBar';
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

const MySwal = withReactContent(Swal);

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
    navigate(ROUTES.HOME, { replace: true });
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
        navigate(ROUTES.LOGIN);
      }
      return;
    }

    const loadingToast = toast.loading("Đang thêm vào giỏ...");
    try {
      const token = await ensureTokenValid();
      if (!token) {
        toast.error("Phiên đăng nhập hết hạn.", { id: loadingToast });
        navigate(ROUTES.LOGIN);
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
      .then(data => { setProducts(data.items || data.data?.items || []); setTotalItems(data.totalItems || data.data?.totalItems || 0); })
      .catch(err => console.error("Lỗi:", err));
  }, [searchParams]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <UserLayout>
      <ToastAlert alert={toastAlert} onClose={() => setToastAlert({ ...toastAlert, visible: false })} />

      <div className="cp-container">
        <HeroSlider />

        <FilterBar
          minPriceInput={minPriceInput}
          maxPriceInput={maxPriceInput}
          onMinPriceChange={setMinPriceInput}
          onMaxPriceChange={setMaxPriceInput}
          sortValue={`${sortedby}-${isAdding === "true" ? "asc" : "desc"}`}
          onSortChange={handleSortChange}
          onFilter={handleFilterPrice}
          onReset={handleResetFilter}
        />

        <div className="cp-section-header">
          <h2 className="cp-section-title">Tất cả sản phẩm</h2>
          <span className="cp-section-count">{totalItems} sản phẩm</span>
        </div>

        <ProductGrid products={products} onAddToCart={handleAddToCart} />

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

      <AddToCartModal product={selectedProduct} onClose={() => setShowModal(false)} />
    </UserLayout>
  );
}
