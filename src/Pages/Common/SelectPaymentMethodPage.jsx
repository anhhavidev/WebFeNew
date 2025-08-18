import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPaymentUrl } from "../../Service/paymentApi";
import UserLayout from "../../layout1/UserLayout";

export default function PaymentMethodPage() {
  const { orderId } = useParams();
  const [method, setMethod] = useState("VNPAY");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = await createPaymentUrl(orderId, method, token);
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi thanh toán.");
    }
  };

  return (
  
    <div className="container py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <h3 className="text-center mb-4 fw-bold text-primary">
                Thanh Toán Đơn Hàng
              </h3>
              <p className="text-center text-muted mb-4">
                Mã đơn hàng: <strong>#{orderId}</strong>
              </p>

              <div className="form-group mb-4">
                <label className="form-label fw-semibold">Phương thức:</label>
                <select
                  className="form-select"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="VNPAY">🌐 VNPAY (Quét mã QR / Ví)</option>
                  <option value="COD">📦 COD (Khi nhận hàng)</option>
                </select>
              </div>

              {/* Thông báo lỗi */}
              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}

              <button
                className="btn btn-primary w-100 py-2 fw-bold"
                onClick={handlePayment}
              >
                ✅ Tiến hành thanh toán
              </button>

              <button
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() => navigate("/checkout")}
              >
                ⬅ Quay lại
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <img
              src="https://i.imgur.com/3u1OgMb.png"
              alt="Payment methods"
              className="img-fluid"
              style={{ maxHeight: "60px" }}
            />
            <p className="mt-2 text-muted small">Được hỗ trợ bởi VNPAY</p>
          </div>
        </div>
      </div>
    </div>
    
  );
}
