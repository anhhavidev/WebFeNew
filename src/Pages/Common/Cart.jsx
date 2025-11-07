import React, { useEffect, useState } from 'react';
import UserLayout from '../../layout1/UserLayout';
import { getCartItems, updateCartItem, removeFromCart } from "../../Service/cartApi";
import UpdateType from "../../constants/updateTypes";
import useAuth from '../../Hooks/useAuth';
import { useCart } from "../../constants/CartContext";
import { useNavigate } from "react-router-dom";

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
      alert("❌ Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    navigate("/checkout", { state: { selectedItems: selected } });
  };
  // 👉 Hàm này được tách ra để có thể tái sử dụng
  const fetchCartItems = async () => {
    const token = await ensureTokenValid();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await getCartItems(token);
      const sellerGroups = res.data?.sellerGroups || [];

      const itemsWithChecked = sellerGroups.flatMap(group =>
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

      setCartItems(itemsWithChecked);
      setSelectAll(true);

      const totalQuantity = itemsWithChecked.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      } else {
        alert("Đã xảy ra lỗi khi tải giỏ hàng.");
      }
    }
  };

  // Lấy giỏ hàng lần đầu
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Debounce khi thay đổi quantity
  useEffect(() => {
    if (!debouncedItem) return;
    const timer = setTimeout(async () => {
      const token = await ensureTokenValid();
      if (!token) return;

      await updateCartItem(debouncedItem.itemId, debouncedItem.quantity, token, debouncedItem.updateType)
        .catch(err => alert("Cập nhật thất bại: " + err.message));

      setDebouncedItem(null);
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedItem]);

  // Lấy giỏ hàng từ server
  useEffect(() => {
    const fetchCartItems = async () => {
      const token = await ensureTokenValid();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await getCartItems(token);
        const sellerGroups = res.data?.sellerGroups || [];

        const itemsWithChecked = sellerGroups.flatMap(group => // làm phảng mảng lồng nhau 
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
             weight: item.weight || 0,   // ✅ thêm đây
              storeName: group.storeName ,  // ✅ Thêm tên cửa hàng
              
          }))
        );

        setCartItems(itemsWithChecked);
        setSelectAll(true);

        const totalQuantity = itemsWithChecked.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalQuantity);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
        } else {
          alert("Đã xảy ra lỗi khi tải giỏ hàng.");
        }
      }
    };

    fetchCartItems();
  }, []);

  const totalPrice = cartItems.filter(item => item.isChecked)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

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
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;

    const updatedItems = cartItems.filter(item => item.cartItemId !== itemId);
    setCartItems(updatedItems);
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalQuantity);

    try {
      const token = await ensureTokenValid();
      if (!token) return;
      await removeFromCart(itemId, token);
    } catch (err) {
      alert("Xóa thất bại: " + err.message);
    }
  };

  const handleQuantityChange = async (itemId, quantity, type) => {
    const item = cartItems.find(i => i.cartItemId === itemId);
    if (!item) return;

    if (quantity <= 0) {
      if (window.confirm("Số lượng ≤ 0. Bạn có muốn xóa sản phẩm này khỏi giỏ không?")) {
        const token = await ensureTokenValid();
        if (token) await removeFromCart(itemId, token);
        await fetchCartItems(); // ✅ Gọi lại giỏ hàng sau khi xóa
      }
      return;
    }
    if (quantity > item.availableStock) {
      alert(`Chỉ còn ${item.availableStock} sản phẩm`);
      return;
    }

    const newQuantity = type === UpdateType.SET ? quantity : type === UpdateType.INCREASE ? item.quantity + 1 : item.quantity - 1;

    setCartItems(cartItems.map(i =>
      i.cartItemId === itemId ? { ...i, quantity: newQuantity, localQuantity: newQuantity } : i
    ));

    setCartCount(cartItems.reduce((sum, i) => sum + (i.cartItemId === itemId ? newQuantity : i.quantity), 0));

    setDebouncedItem({ itemId, quantity: newQuantity, updateType: type });
  };

  // Danh sách seller
  const sellerIds = [...new Set(cartItems.map(i => i.sellerId))];

  return (
    <UserLayout>
      <div className="container mt-4">
        {cartItems.length === 0 ? (
          <div className="alert alert-info mt-4">
            🛒 Giỏ hàng của bạn đang trống. Hãy <a href="/" className="fw-bold">mua sắm ngay</a>!
          </div>
        ) : (
          <>
            {sellerIds.map(sellerId => {
              const items = cartItems.filter(i => i.sellerId === sellerId);
              return (
                <div key={sellerId} className="mb-4">
                 <h6>🏬 {items[0]?.storeName}</h6>
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={items.every(i => i.isChecked)}
                            onChange={() => {
                              const newStatus = !items.every(i => i.isChecked);
                              const updated = cartItems.map(i =>
                                i.sellerId === sellerId ? { ...i, isChecked: newStatus } : i
                              );
                              setCartItems(updated);
                              setSelectAll(cartItems.every(i => i.isChecked));
                            }}
                          />{" "}
                          TẤT CẢ ({items.length} sản phẩm)
                        </th>
                        <th>GIÁ</th>
                        <th>SỐ LƯỢNG</th>
                        <th>THÀNH TIỀN</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.cartItemId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={item.isChecked}
                              onChange={() => handleCheck(item.cartItemId)}
                            />
                            <img src={item.productImage} alt={item.productName} style={{ width: 60, marginLeft: 10 }} />
                            <span className="ms-2">{item.productName}</span>
                          </td>
                          <td>
                            <div>{item.unitPrice.toLocaleString()} đ</div>
                            {item.discountPercent > 0 && (
                              <small className="text-muted text-decoration-line-through">
                                {item.originalPrice.toLocaleString()} đ
                              </small>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1, UpdateType.DECREASE)}>-</button>
                              <input
                                type="number"
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
                                style={{ width: 60, margin: "0 5px" }}
                              />
                              <button onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1, UpdateType.INCREASE)}>+</button>
                            </div>
                          </td>
                          <td className="text-danger fw-bold">{(item.unitPrice * item.quantity).toLocaleString()} đ</td>
                          <td>
                            <button className="btn btn-link text-danger" onClick={() => handleDelete(item.cartItemId)}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <div className="d-flex justify-content-end align-items-center">
              <span className="me-3 fw-bold">Tạm tính: <span className="text-danger">{totalPrice.toLocaleString()} đ</span></span>
              <button className="btn btn-dark mt-2" onClick={handleBuyNow}>MUA NGAY</button>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
