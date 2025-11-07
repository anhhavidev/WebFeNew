import { useEffect } from "react";
import { getLocalCart, clearLocalCart } from "../utils/cartStorage";
import { syncCartToServer, getCartItems } from "../Service/cartApi";
import useAuth from "../Hooks/useAuth";
import { useCart } from "./CartContext";

export default function CartSyncAfterLogin() {
  const { user, ensureTokenValid } = useAuth();
  const { setCartCount } = useCart();

  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;

      const token = await ensureTokenValid();
      if (!token) return;

      const localCart = getLocalCart();

      if (localCart.length > 0) {
        try {
          await syncCartToServer(localCart, token);
          clearLocalCart();
          console.log("✅ Đồng bộ giỏ hàng xong");
        } catch (err) {
          console.error("❌ Lỗi sync:", err);
        }
      }

      // ✅ Sau khi sync, lấy lại giỏ hàng và đếm tổng số lượng thực sự
      try {
        const result = await getCartItems(token);
        if (result.success && result.data?.cartItems) {
          setCartCount(result.data.cartItems.length); // số dòng 
          
        
        }
      } catch (err) {
        console.error("❌ Không lấy được giỏ hàng sau sync:", err);
      }
    };

    syncCart();
  }, [user]);

  return null;
}
