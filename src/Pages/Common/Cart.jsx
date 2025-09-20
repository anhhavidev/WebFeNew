import React, { useEffect, useState } from 'react';
import UserLayout from '../../layout1/UserLayout';
import {
  getCartItems,
  updateCartItem,
  removeFromCart,
} from "../../Service/cartApi";
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


  useEffect(() => {
    if (!debouncedItem) return;

    const timer = setTimeout(async () => {
      const token = await ensureTokenValid();
      if (!token) return;

      updateCartItem(
        debouncedItem.itemId,
        debouncedItem.quantity,
        token,
        debouncedItem.updateType
      ).catch(err => alert("Cập nhật thất bại: " + err.message));

      setDebouncedItem(null);
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedItem]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = await ensureTokenValid();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await getCartItems(token);
        const items = res.data?.cartItems;

        // ✅ Nếu không phải mảng thì cho về mảng rỗng
        const safeItems = Array.isArray(items) ? items : [];

        const itemsWithChecked = safeItems.map((item) => {
          const quantity = item.soLuong > 0 ? item.soLuong : 1;
          return {
            cartItemId: item.productId,
            productName: item.productName,
            productImage: item.linkImage,
            originalPrice: item.originalPrice,
            unitPrice: item.donGia,   // dùng giá giảm đã tính
            discountPercent: item.discountPercent,
            quantity,
            localQuantity: quantity,
            availableStock: item.soLuongTonKho || 100,
            isChecked: true,
          };
        });

        setCartItems(itemsWithChecked);
        setSelectAll(true);

        const totalQuantity = itemsWithChecked.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(totalQuantity);
      } catch (err) {
        console.error("Lỗi khi tải giỏ hàng:", err);

        // ✅ Chỉ hiện alert khi là lỗi xác thực hoặc lỗi server thật
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

  const totalPrice = cartItems
    .filter(item => item.isChecked)
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
    // ✅ Tính lại tổng số lượng
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

  const handleIncrease = async (itemId, currentQuantity) => {
    const item = cartItems.find(i => i.cartItemId === itemId);
    if (!item) return;

    if (currentQuantity + 1 > item.availableStock) {
      alert(`Chỉ còn ${item.availableStock} sản phẩm`);
      return;
    }

    try {
      const token = await ensureTokenValid();
      if (!token) return;

      await updateCartItem(itemId, 1, token, UpdateType.INCREASE);

      const newQuantity = currentQuantity + 1;
      const updated = cartItems.map(item =>
        item.cartItemId === itemId
          ? { ...item, quantity: newQuantity, localQuantity: newQuantity }
          : item
      );
      setCartItems(updated);
      // ✅ Tính lại total
      const totalQuantity = updated.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(totalQuantity);
    } catch (err) {
      alert("Cập nhật thất bại: " + err.message);
    }
  };

  const handleDecrease = async (itemId, currentQuantity) => {
    if (currentQuantity <= 1) {
      alert("Số lượng tối thiểu là 1");
      return;
    }

    try {
      const token = await ensureTokenValid();
      if (!token) return;

      await updateCartItem(itemId, 1, token, UpdateType.DECREASE);

      const newQuantity = currentQuantity - 1;
      const updated = cartItems.map(item =>
        item.cartItemId === itemId
          ? { ...item, quantity: newQuantity, localQuantity: newQuantity }
          : item
      );
      setCartItems(updated);
      // ✅ Tính lại total
      const totalQuantity = updated.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(totalQuantity);

    } catch (err) {
      alert("Cập nhật thất bại: " + err.message);
    }
  };

  const handleSetQuantity = async (itemId, quantity) => {
    const item = cartItems.find(i => i.cartItemId === itemId);
    if (!item) return;

    if (quantity <= 0) {
      alert("Số lượng tối thiểu là 1");
      return;
    }

    if (quantity > item.availableStock) {
      alert(`Chỉ còn lại ${item.availableStock} sản phẩm trong kho`);
      const updated = cartItems.map(i =>
        i.cartItemId === itemId
          ? { ...i, localQuantity: 1 }
          : i
      );
      setCartItems(updated);
      return;
    }

    try {
      const token = await ensureTokenValid();
      if (!token) return;

      await updateCartItem(itemId, quantity, token, UpdateType.SET);

      const updated = cartItems.map(i =>
        i.cartItemId === itemId
          ? { ...i, quantity, localQuantity: quantity }
          : i
      );
      setCartItems(updated);

      // ✅ Thêm phần này để cập nhật biểu tượng giỏ hàng
      const totalQuantity = updated.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(totalQuantity);

    } catch (err) {
      alert("Cập nhật thất bại: " + err.message);
    }
  };


  return (
    <UserLayout>
      <div className="container mt-4">


        {cartItems.length === 0 ? (
          // ✅ Nếu giỏ hàng trống
          <div className="alert alert-info mt-4">
            🛒 Giỏ hàng của bạn đang trống. Hãy <a href="/" className="fw-bold">mua sắm ngay</a>!
          </div>
        ) : (
          // ✅ Nếu có sản phẩm trong giỏ hàng
          <>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "6px 12px",
                backgroundColor: "#ddd",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              🔙 Quay lại Trang Chủ
            </button>
            <h5>🛒 Giỏ hàng của bạn</h5>
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleCheckAll}
                    />{" "}
                    TẤT CẢ ({cartItems.length} sản phẩm)
                  </th>
                  <th>GIÁ</th>
                  <th>SỐ LƯỢNG</th>
                  <th>THÀNH TIỀN</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map(item => (
                  <tr key={item.cartItemId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => handleCheck(item.cartItemId)}
                      />
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        style={{ width: 60, marginLeft: 10 }}
                      />
                      <span className="ms-2">{item.productName} </span>
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
                        <button onClick={() => handleDecrease(item.cartItemId, item.quantity)}>-</button>
                        <input
                          type="number"
                          min="1"
                          value={item.localQuantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const updated = cartItems.map(i =>
                              i.cartItemId === item.cartItemId
                                ? { ...i, localQuantity: isNaN(value) ? "" : value }
                                : i
                            );
                            setCartItems(updated);
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleSetQuantity(item.cartItemId, value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value)) {
                                handleSetQuantity(item.cartItemId, value);
                              }
                            }
                          }}
                          style={{ width: 60, margin: "0 5px" }}
                        />
                        <button onClick={() => handleIncrease(item.cartItemId, item.quantity)}>+</button>
                      </div>
                    </td>
                    <td className="text-danger fw-bold">
                      {(item.unitPrice * item.quantity).toLocaleString()} đ
                    </td>
                    <td>
                      <button
                        className="btn btn-link text-danger"
                        onClick={() => handleDelete(item.cartItemId)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-end align-items-center">
              <span className="me-3 fw-bold">
                Tạm tính: <span className="text-danger">{totalPrice.toLocaleString()} đ</span>
              </span>
              <button className="btn btn-dark mt-2" onClick={handleBuyNow}>
                MUA NGAY
              </button>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
