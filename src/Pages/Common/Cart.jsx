import React, { useEffect, useState } from 'react';
import UserLayout from '../../layout1/UserLayout';
import { getCartItems, updateCartItem, removeFromCart } from "../../Service/cartApi";
import UpdateType from "../../constants/updateTypes";
import useAuth from '../../Hooks/useAuth';
import { useCart } from "../../constants/CartContext";
import { ROUTES } from "../../constants/routePaths";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import './CustomerPages.css';

function formatVND(amount) {
  return amount.toLocaleString() + '₫';
}

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [debouncedItem, setDebouncedItem] = useState(null);
  const { ensureTokenValid } = useAuth();
  const { setCartCount } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = () => {
    const selected = cartItems.filter(item => item.isChecked);
    if (selected.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    navigate(ROUTES.CHECKOUT, { state: { selectedItems: selected } });
  };

  const mapCartResponse = (sellerGroups) =>
    sellerGroups.flatMap(group =>
      group.cartItems.map(item => ({
        cartItemId: item.productId,
        productName: item.productName,
        productImage: item.linkImage,
        originalPrice: item.originalPrice,
        unitPrice: item.originalPrice * (1 - (item.discountPercent || 0) / 100),
        discountPercent: item.discountPercent || 0,
        quantity: item.soLuong,
        localQuantity: item.soLuong,
        availableStock: item.soLuongTonKho || 100,
        isChecked: true,
        sellerId: group.sellerId,
        weight: item.weight || 0,
        storeName: group.storeName,
      }))
    );

  const fetchCartItems = async () => {
    const token = await ensureTokenValid();
    if (!token) { window.location.href = "/login"; return; }
    try {
      const res = await getCartItems(token);
      const sellerGroups = res.data?.sellerGroups || [];
      const itemsWithChecked = mapCartResponse(sellerGroups);
      setCartItems(itemsWithChecked);
      setSelectAll(true);
      const totalQuantity = itemsWithChecked.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      } else {
        toast.error("Đã xảy ra lỗi khi tải giỏ hàng.");
      }
    }
  };

  useEffect(() => { fetchCartItems(); }, []);

  useEffect(() => {
    if (!debouncedItem) return;
    const timer = setTimeout(async () => {
      const token = await ensureTokenValid();
      if (!token) return;
      await updateCartItem(debouncedItem.itemId, debouncedItem.quantity, token, debouncedItem.updateType)
        .catch(err => toast.error("Cập nhật thất bại: " + err.message));
      setDebouncedItem(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedItem]);

  const totalPrice = cartItems.filter(item => item.isChecked)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const selectedCount = cartItems.filter(item => item.isChecked).length;

  const handleCheck = (itemId) => {
    const updated = cartItems.map(item =>
      item.cartItemId === itemId ? { ...item, isChecked: !item.isChecked } : item
    );
    setCartItems(updated);
    setSelectAll(updated.every(item => item.isChecked));
  };

  const handleCheckAll = () => {
    const newStatus = !selectAll;
    const updated = cartItems.map(item => ({ ...item, isChecked: newStatus }));
    setCartItems(updated);
    setSelectAll(newStatus);
  };

  const handleDelete = async (itemId) => {
    const confirm = await Swal.fire({
      title: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });
    if (!confirm.isConfirmed) return;
    const updatedItems = cartItems.filter(item => item.cartItemId !== itemId);
    setCartItems(updatedItems);
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalQuantity);
    try {
      const token = await ensureTokenValid();
      if (!token) return;
      await removeFromCart(itemId, token);
      toast.success("Đã xoá khỏi giỏ hàng!");
    } catch (err) {
      toast.error("Xóa thất bại: " + err.message);
    }
  };

  const handleQuantityChange = async (itemId, quantity, type) => {
    const item = cartItems.find(i => i.cartItemId === itemId);
    if (!item) return;
    if (quantity <= 0) {
      const confirm = await Swal.fire({
        title: 'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?',
        text: 'Số lượng không thể nhỏ hơn 1.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý xóa',
        cancelButtonText: 'Hủy'
      });
      if (confirm.isConfirmed) {
        try {
          const token = await ensureTokenValid();
          if (token) await removeFromCart(itemId, token);
          await fetchCartItems();
          toast.success("Đã xoá khỏi giỏ hàng!");
        } catch (err) {
          toast.error("Xóa thất bại: " + err.message);
        }
      }
      return;
    }
    if (quantity > item.availableStock) {
      toast.error(`Chỉ còn ${item.availableStock} sản phẩm`);
      return;
    }
    const newQuantity = type === UpdateType.SET ? quantity
      : type === UpdateType.INCREASE ? item.quantity + 1
      : item.quantity - 1;
    setCartItems(cartItems.map(i =>
      i.cartItemId === itemId ? { ...i, quantity: newQuantity, localQuantity: newQuantity } : i
    ));
    setCartCount(cartItems.reduce((sum, i) => sum + (i.cartItemId === itemId ? newQuantity : i.quantity), 0));
    setDebouncedItem({ itemId, quantity: newQuantity, updateType: type });
  };

  const sellerIds = [...new Set(cartItems.map(i => i.sellerId))];

  return (
    <UserLayout>
      <div className="ed-page">
        {/* Breadcrumb */}
        <div className="ed-cart-breadcrumb">
          <button onClick={() => navigate(ROUTES.HOME)} className="ed-cart-back-link">
            ← Tiếp tục mua sắm
          </button>
          <span className="ed-cart-title">Giỏ Hàng ({cartItems.length} sản phẩm)</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="ed-cart-empty">
            <div className="ed-cart-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <h2 className="ed-cart-empty-title">Giỏ hàng của bạn đang trống</h2>
            <p className="ed-cart-empty-desc">Hãy chọn những sản phẩm ưng ý nhất từ bộ sưu tập Aura để thêm vào giỏ hàng của bạn.</p>
            <button onClick={() => navigate(ROUTES.HOME)} className="ed-btn-primary">
              Khám Phá Sản Phẩm Ngay
            </button>
          </div>
        ) : (
          <div className="ed-cart-grid">
            {/* Left - Items */}
            <div className="ed-cart-items-col">
              {/* Store header */}
              {sellerIds.map(sellerId => {
                const items = cartItems.filter(i => i.sellerId === sellerId);
                const allChecked = items.every(i => i.isChecked);
                return (
                  <div key={sellerId} className="ed-cart-store-group">
                    <div className="ed-cart-store-header">
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = !allChecked;
                          const updated = cartItems.map(i =>
                            i.sellerId === sellerId ? { ...i, isChecked: newStatus } : i
                          );
                          setCartItems(updated);
                          setSelectAll(updated.every(i => i.isChecked));
                        }}
                        className={`ed-cart-checkbox ${allChecked ? 'checked' : ''}`}
                      >
                        {allChecked && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                        )}
                      </button>
                      <span className="ed-cart-store-name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                        {items[0]?.storeName || 'Cửa hàng'}
                      </span>
                      <span className="ed-cart-store-count">({items.length} sản phẩm)</span>
                    </div>

                    {items.map(item => (
                      <div key={item.cartItemId} className="ed-cart-item">
                        <div className="ed-cart-item-left">
                          <button
                            type="button"
                            onClick={() => handleCheck(item.cartItemId)}
                            className={`ed-cart-checkbox ${item.isChecked ? 'checked' : ''}`}
                          >
                            {item.isChecked && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                            )}
                          </button>
                          <img src={item.productImage} alt={item.productName} className="ed-cart-item-img" />
                          <div className="ed-cart-item-info">
                            <h4 className="ed-cart-item-name">{item.productName}</h4>
                            <div className="ed-cart-item-price-row">
                              <span className="ed-cart-item-price">{formatVND(item.unitPrice)}</span>
                              {item.discountPercent > 0 && (
                                <span className="ed-cart-item-price-old">{formatVND(item.originalPrice)}</span>
                              )}
                            </div>
                            {/* Mobile stepper */}
                            <div className="ed-cart-item-stepper-mobile">
                              <div className="ed-stepper">
                                <button className="ed-stepper-btn" onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1, UpdateType.DECREASE)}>−</button>
                                <input
                                  type="number"
                                  className="ed-stepper-input"
                                  min="1"
                                  value={item.localQuantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    setCartItems(cartItems.map(i =>
                                      i.cartItemId === item.cartItemId
                                        ? { ...i, localQuantity: isNaN(value) ? "" : value }
                                        : i
                                    ));
                                  }}
                                  onBlur={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) handleQuantityChange(item.cartItemId, value, UpdateType.SET);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) handleQuantityChange(item.cartItemId, value, UpdateType.SET);
                                    }
                                  }}
                                />
                                <button className="ed-stepper-btn" onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1, UpdateType.INCREASE)}>+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ed-cart-item-right">
                          <div className="ed-stepper ed-stepper-desktop">
                            <button className="ed-stepper-btn" onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1, UpdateType.DECREASE)}>−</button>
                            <input
                              type="number"
                              className="ed-stepper-input"
                              min="1"
                              value={item.localQuantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setCartItems(cartItems.map(i =>
                                  i.cartItemId === item.cartItemId
                                    ? { ...i, localQuantity: isNaN(value) ? "" : value }
                                    : i
                                ));
                              }}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) handleQuantityChange(item.cartItemId, value, UpdateType.SET);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) handleQuantityChange(item.cartItemId, value, UpdateType.SET);
                                }
                              }}
                            />
                            <button className="ed-stepper-btn" onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1, UpdateType.INCREASE)}>+</button>
                          </div>
                          <span className="ed-cart-item-total">{formatVND(item.unitPrice * item.quantity)}</span>
                          <button className="ed-cart-item-del" onClick={() => handleDelete(item.cartItemId)} title="Xóa">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Right - Summary */}
            <div className="ed-cart-summary-col">
              <div className="ed-cart-summary-card">
                <h3 className="ed-cart-summary-title">Tóm Tắt Đơn Hàng</h3>
                <div className="ed-cart-summary-rows">
                  <div className="ed-cart-summary-row">
                    <span>Sản phẩm đã chọn</span>
                    <span className="ed-cart-summary-value">{selectedCount} sản phẩm</span>
                  </div>
                  <div className="ed-cart-summary-row">
                    <span>Tạm tính</span>
                    <span className="ed-cart-summary-value">{formatVND(totalPrice)}</span>
                  </div>
                  <div className="ed-cart-summary-row">
                    <span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Giao hàng toàn quốc
                    </span>
                    <span className="ed-cart-summary-free">Miễn phí</span>
                  </div>
                </div>
                <div className="ed-cart-summary-total">
                  <span>Tổng cộng</span>
                  <span className="ed-cart-summary-total-value">{formatVND(totalPrice)}</span>
                </div>
                <button className="ed-btn-primary ed-btn-cart-checkout" onClick={handleBuyNow} disabled={selectedCount === 0}>
                  MUA NGAY ({selectedCount})
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button className="ed-btn-cart-continue" onClick={() => navigate(ROUTES.HOME)}>
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
