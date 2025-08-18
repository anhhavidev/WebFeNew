const BASE_URL = "http://localhost:5230/api/Cart";

export async function addProductToCart(productId, quantity, token) {
  const response = await fetch(`${BASE_URL}/add-to-cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Thêm sản phẩm thất bại");
  }

  return await response.json(); // Trả về ResponeDTO<CartItemDto>
}

export async function syncCartToServer(localCart, token) {
  console.log("🔁 Syncing cart to server:", localCart);

  const res = await fetch(`${BASE_URL}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(localCart),
  });

  const data = await res.json();
  console.log("🧪 Sync response:", data);
  return data;
}

export async function getCartItems(token) {
  const response = await fetch(`${BASE_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Lỗi khi tải giỏ hàng");
  }

  return await response.json();
}

export async function removeFromCart(productId, token) {
  await fetch(`${BASE_URL}/remove/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateCartItem(productId, quantity, token, updateType = "Set") {
  const response = await fetch(`${BASE_URL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity, updateType }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Lỗi cập nhật giỏ hàng");
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function clearCart(token) {
  await fetch(`${BASE_URL}/clear`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function checkoutOrder(data, token) {
  const response = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Lỗi khi đặt hàng");
  }

  return await response.json();
}
