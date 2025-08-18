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

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCartItems(token);
      setCartItems(data);
    } catch (err) {
      setError("Không thể tải giỏ hàng.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity) => {
    try {
      await addToCart(productId, quantity, token);
      await fetchCart(); // refetch lại giỏ hàng
    } catch (err) {
      console.error("❌ Thêm sản phẩm thất bại:", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await removeFromCart(productId, token);
      await fetchCart();
    } catch (err) {
      console.error("❌ Xoá sản phẩm thất bại:", err);
    }
  };

  const updateItem = async (productId, newQty) => {
    try {
      await updateCartItem(productId, newQty, token);
      await fetchCart();
    } catch (err) {
      console.error("❌ Cập nhật thất bại:", err);
    }
  };

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
