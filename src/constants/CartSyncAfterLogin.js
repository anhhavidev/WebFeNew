// Component tự động đồng bộ giỏ hàng local lên server sau khi đăng nhập
import { useEffect } from "react";
import { getLocalCart, clearLocalCart } from "../utils/cartStorage";
import { syncCartToServer, getCartItems } from "../Service/cartApi";
import useAuth from "../Hooks/useAuth";
import { useCart } from "./CartContext";

export default function CartSyncAfterLogin() {
  const { user, ensureTokenValid } = useAuth();
  const { setCartCount, setCartItems } = useCart();

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

      try {
        const result = await getCartItems(token);
        if (result.isSuccess && result.data?.sellerGroups) {
          setCartItems(result.data.sellerGroups); // Lưu luôn sellerGroups
          const totalCount = result.data.sellerGroups.reduce(
            (sum, seller) => sum + seller.cartItems.reduce((s, item) => s + item.soLuong, 0),
            0
          );
          setCartCount(totalCount);
        }
      } catch (err) {
        console.error("❌ Không lấy được giỏ hàng sau sync:", err);
      }
    };

    syncCart();
  }, [user]);

  return null;
}
