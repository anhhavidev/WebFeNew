// Hook quản lý giỏ hàng (lấy, thêm, sửa, xóa sản phẩm)
import { useEffect, useState } from "react";
import {
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} from "../Service/cartApi";

export default function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Lấy dữ liệu giỏ hàng từ server
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCartItems(token);
      setCartItems(data.data?.sellerGroups || data || []);
    } catch (err) {
      setError("Không thể tải giỏ hàng.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addItem = async (productId, quantity) => {
    try {
      await addToCart(productId, quantity, token);
      await fetchCart(); // refetch lại giỏ hàng
    } catch (err) {
      console.error("❌ Thêm sản phẩm thất bại:", err);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = async (productId) => {
    try {
      await removeFromCart(productId, token);
      await fetchCart();
    } catch (err) {
      console.error("❌ Xoá sản phẩm thất bại:", err);
    }
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateItem = async (productId, newQty) => {
    try {
      await updateCartItem(productId, newQty, token);
      await fetchCart();
    } catch (err) {
      console.error("❌ Cập nhật thất bại:", err);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clear = async () => {
    try {
      await clearCart(token);
      await fetchCart();
    } catch (err) {
      console.error("❌ Xoá toàn bộ thất bại:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  return {
    cartItems,
    loading,
    error,
    refetch: fetchCart,
    addItem,
    removeItem,
    updateItem,
    clear,
  };
}
