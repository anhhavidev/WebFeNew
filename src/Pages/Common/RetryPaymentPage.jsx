import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function RetryPaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function createPaymentUrl() {
      try {
        const token = localStorage.getItem("token");

        // 🧾 Lấy thông tin đơn hàng để lấy amount
      const orderRes = await fetch(`http://localhost:5230/api/order/detail/user/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!orderRes.ok) {
          throw new Error("Không tìm thấy đơn hàng");
        }

        const order = await orderRes.json();

        // 🌐 Gọi API tạo URL thanh toán VNPAY
        const res = await fetch(`http://localhost:5230/api/Paymentest/create?method=vnpay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderId,
            orderType: "other",
            amount: order.totalAmount, // hoặc order.TotalAmount
            orderDescription: `Thanh toán lại đơn hàng #${orderId}`,
          }),
        });

      if (!res.ok) {
  const errorText = await res.text();
  console.error("🧨 Server response:", res.status, errorText);
  throw new Error("Không thể tạo URL thanh toán");
}

        const data = await res.json();

        if (data?.url) {
          window.location.href = data.url;
        } else {
          alert("Không tạo được URL thanh toán");
          navigate("/orders");
        }
      } catch (err) {
        console.error("❌ Lỗi khi tạo URL thanh toán:", err);
        alert("Có lỗi xảy ra khi tạo thanh toán");
        navigate("/orders");
      }
    }

    createPaymentUrl();
  }, [orderId, navigate]);

  return (
    <div className="container mt-5">
      <div className="alert alert-info">Đang chuyển hướng đến cổng thanh toán...</div>
    </div>
  );
}
