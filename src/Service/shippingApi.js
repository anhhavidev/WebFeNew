// Service/shippingApi.js
export const calculateShipping = async (province, district, token) => {
  if (!province || !district || !token) {
    console.warn("⚠️ Thiếu dữ liệu khi gọi tính phí:", { province, district, token });
    return null;
  }

  try {
    const res = await fetch("http://localhost:5230/api/shipping/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ province, district }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ GHTK API trả về lỗi:", res.status, errorText);
      throw new Error("Tính phí vận chuyển thất bại");
    }

    const data = await res.json(); // ✅ Trả về toàn bộ response: { shippingFee, totalWeight, totalItems, ... }
    return data;
  } catch (err) {
    console.error("❌ Lỗi gọi API tính phí:", err.message);
    return null;
  }
};
// ✅ Tính phí ship theo Seller cụ thể
export const calculateShippingBySeller = async (sellerId, province, district, token) => {
  if (!sellerId || !province || !district || !token) {
    console.warn("⚠️ Thiếu dữ liệu khi gọi tính phí theo seller:", { sellerId, province, district, token });
    return null;
  }

  try {
    const res = await fetch("http://localhost:5230/api/shipping/calculate-by-seller", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sellerId, province, district }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ GHTK API (seller) trả về lỗi:", res.status, errorText);
      throw new Error("Tính phí vận chuyển theo seller thất bại");
    }

    return await res.json(); // { SellerId, ShippingFee, Province, District }
  } catch (err) {
    console.error("❌ Lỗi gọi API tính phí theo seller:", err.message);
    return null;
  }
};