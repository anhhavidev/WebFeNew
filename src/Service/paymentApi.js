export async function createVnpayUrl(orderId, token) {
  const res = await fetch(`http://localhost:5230/api/payment/create-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      orderId: orderId,
      orderType: "other" // đúng theo BE yêu cầu
    })
  });

  const data = await res.json();
  return data.paymentUrl;
}
// Gọi API tạo URL thanh toán
export async function createPaymentUrl(orderId, method, token) {
  const res = await fetch(`http://localhost:5230/api/Paymentest/create?method=${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId: orderId,
      orderType: "other", // Hoặc bạn có thể lấy từ giao diện
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Tạo URL thất bại: " + errorText);
  }

  const data = await res.json();
  return data.url;
}
