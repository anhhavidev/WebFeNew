const CART_KEY = 'local_cart';

export function getLocalCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function saveLocalCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToLocalCart(productId, quantity = 1, notifyCallback = null) {
  const cart = getLocalCart();
  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  saveLocalCart(cart);

  // ✅ Nếu có callback thì cập nhật tổng số lượng sản phẩm
  if (typeof notifyCallback === "function") {
 const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    notifyCallback(totalCount);
  }

  return cart;
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
}
