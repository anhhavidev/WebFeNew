import React, { useEffect, useState } from 'react';
import UserLayout from '../../layout1/UserLayout';
import { getCartItems, updateCartItem, removeFromCart } from "../../Service/cartApi";
import UpdateType from "../../constants/updateTypes";
import useAuth from '../../Hooks/useAuth';
import { useCart } from "../../constants/CartContext";
import { ROUTES } from "../../constants/routePaths";
import { useNavigate } from "react-router-dom";
import CartSummary from './CartSummary';
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import './CustomerPages.css';

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
      <div className="cp-container">
        <h1 className="cp-page-title">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="cp-cart-empty">
            <div className="cp-cart-empty-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <a href="/" className="cp-btn cp-btn-primary" style={{ borderRadius: '9999px', padding: '14px 32px' }}>
              Tiếp tục mua sắm →
            </a>
          </div>
        ) : (
          <div className="cp-cart-layout">
            <div>
              {sellerIds.map(sellerId => {
                const items = cartItems.filter(i => i.sellerId === sellerId);
                return (
                  <div key={sellerId} className="cp-seller-group">
                    <div className="cp-seller-header">
                      <input
                        type="checkbox"
                        checked={items.every(i => i.isChecked)}
                        onChange={() => {
                          const newStatus = !items.every(i => i.isChecked);
                          const updated = cartItems.map(i =>
                            i.sellerId === sellerId ? { ...i, isChecked: newStatus } : i
                          );
                          setCartItems(updated);
                          setSelectAll(updated.every(i => i.isChecked));
                        }}
                      />
                      <span className="cp-seller-name">🏬 {items[0]?.storeName}</span>
                      <span className="cp-seller-count">({items.length} sản phẩm)</span>
                    </div>

                    {items.map(item => (
                      <div key={item.cartItemId} className="cp-cart-item">
                        <div className="cp-cart-item-inner">
                          <input
                            type="checkbox"
                            className="cp-cart-item-check"
                            checked={item.isChecked}
                            onChange={() => handleCheck(item.cartItemId)}
                          />
                          <div className="cp-cart-item-img">
                            <img src={item.productImage} alt={item.productName} />
                          </div>
                          <div className="cp-cart-item-details">
                            <h4 className="cp-cart-item-name">{item.productName}</h4>
                            <div className="cp-cart-item-price">
                              {item.unitPrice.toLocaleString()} đ
                              {item.discountPercent > 0 && (
                                <span className="cp-cart-item-price-original">
                                  {item.originalPrice.toLocaleString()} đ
                                </span>
                              )}
                            </div>
                            <div className="cp-cart-item-actions">
                              <div className="cp-qty-controls">
                                <button className="cp-qty-btn" onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1, UpdateType.DECREASE)}>−</button>
                                <input
                                  type="number"
                                  className="cp-qty-input"
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
                                <button className="cp-qty-btn" onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1, UpdateType.INCREASE)}>+</button>
                              </div>
                              <div>
                                <div className="cp-cart-item-total">
                                  {(item.unitPrice * item.quantity).toLocaleString()} đ
                                </div>
                                {item.quantity > 1 && (
                                  <div className="cp-cart-item-unit">{item.unitPrice.toLocaleString()}đ / sp</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button className="cp-btn-danger" onClick={() => handleDelete(item.cartItemId)} title="Xóa">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <CartSummary selectedCount={selectedCount} totalPrice={totalPrice} onBuyNow={handleBuyNow} />
          </div>
        )}
      </div>
    </UserLayout>
  );
}
