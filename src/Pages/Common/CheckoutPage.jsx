import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layout1/UserLayout";
import AddressSection from "./AddressSection";
import { getCartItems } from "../../Service/cartApi";
import { calculateShippingBySeller } from "../../Service/shippingApi";
import { checkoutOrder } from "../../Service/CheckoutApi";
import { createPaymentUrl } from "../../Service/paymentApi";
import { ROUTES } from "../../constants/routePaths";
import './CustomerPages.css';
import toast from "react-hot-toast";
import Swal from "sweetalert2";

function formatVND(amount) {
  return (amount || 0).toLocaleString() + '₫';
}

export default function SimpleCheckoutPage() {
  const token = localStorage.getItem("token");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [shippingFees, setShippingFees] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  const sellerGroups = cartItems.reduce((groups, item) => {
    const key = item.sellerId;
    if (!groups[key]) {
      groups[key] = { sellerId: key, storeName: item.storeName, items: [], totalWeight: 0 };
    }
    groups[key].items.push(item);
    groups[key].totalWeight += (item.weight || 0) * item.soLuong;
    return groups;
  }, {});

  const sellerGroupsArray = Object.values(sellerGroups);
  const total = cartItems.reduce((acc, item) => acc + item.soLuong * item.donGia, 0);
  const totalShipping = Object.values(shippingFees).reduce((sum, fee) => sum + (fee?.shippingFee || 0), 0);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setCartItems(selectedItems.map(item => ({
        ...item, soLuong: item.quantity, donGia: item.unitPrice, weight: item.weight
      })));
    } else {
      fetchCartItems();
    }
  }, [selectedItems]);

  async function fetchCartItems() {
    const res = await getCartItems(token);
    const data = res?.data?.cartItems;
    if (data) setCartItems(data);
  }

  useEffect(() => {
    if (selectedAddress?.province && selectedAddress?.district) {
      const fetchShipping = async () => {
        const newFees = {};
        for (const group of sellerGroupsArray) {
          const res = await calculateShippingBySeller(group.sellerId, selectedAddress.province, selectedAddress.district, token);
          if (res) newFees[group.sellerId] = res;
        }
        setShippingFees(newFees);
      };
      fetchShipping();
    }
  }, [selectedAddress, cartItems]);

  const handleOrder = async () => {
    if (!selectedAddress) return toast.error("Vui lòng chọn địa chỉ!");
    const payload = {
      adressId: selectedAddress.userAdressId,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      province: selectedAddress.province,
      district: selectedAddress.district,
      ward: selectedAddress.ward,
      address: selectedAddress.addressDetail,
      paymentMethod: method,
      note,
      productIds: cartItems.map(item => item.cartItemId),
    };
    try {
      const res = await checkoutOrder(payload, token);
      if (!res.isSuccess) return toast.error(" " + res.message);
      const result = res.message;
      if (method === "COD") {
        await Swal.fire({
          icon: 'success',
          title: 'Đặt hàng thành công!',
          text: 'Thanh toán khi nhận hàng.',
          confirmButtonColor: '#28a745'
        });
        const match = result.match(/#(\d+)/);
        const newOrderId = match ? match[1] : null;
        navigate(ROUTES.COD_RESULT, { state: { orderId: newOrderId } });
      } else {
        if (!result || typeof result !== "string") return toast.error("Không nhận được URL thanh toán hợp lệ.");
        window.location.href = result;
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      toast.error("Đặt hàng thất bại!");
    }
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await createPaymentUrl(orderId, method, token);
      const url = res?.data?.url || res?.url || res;
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi thanh toán.");
    }
  };

  return (
    <UserLayout>
      <div className="ed-page">
        {/* Breadcrumb */}
        <div className="ed-cart-breadcrumb">
          <button onClick={() => navigate(ROUTES.CART)} className="ed-cart-back-link">
            ← Quay lại giỏ hàng
          </button>
          <span className="ed-cart-title">Đặt Hàng & Thanh Toán</span>
        </div>

        <div className="ed-checkout-grid">
          {/* Left Column */}
          <div className="ed-checkout-left">
            {/* Address Card */}
            <div className="ed-checkout-card">
              <h3 className="ed-checkout-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Địa chỉ giao hàng
              </h3>
              <AddressSection token={token} onAddressChange={setSelectedAddress} />
            </div>

            {/* Payment Card */}
            <div className="ed-checkout-card">
              <h3 className="ed-checkout-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Phương thức thanh toán
              </h3>
              <div className="ed-payment-options">
                <div
                  className={`ed-payment-option ${method === "COD" ? "selected" : ""}`}
                  onClick={() => setMethod("COD")}
                >
                  <div className="ed-payment-radio">
                    {method === "COD" && <div className="ed-payment-radio-dot" />}
                  </div>
                  <div className="ed-payment-option-content">
                    <div className="ed-payment-option-header">
                      <span className="ed-payment-option-icon">📦</span>
                      <h4 className="ed-payment-option-name">Thanh toán khi nhận hàng (COD)</h4>
                    </div>
                    <p className="ed-payment-option-desc">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </div>
                <div
                  className={`ed-payment-option ${method === "VNPAY" ? "selected" : ""}`}
                  onClick={() => setMethod("VNPAY")}
                >
                  <div className="ed-payment-radio">
                    {method === "VNPAY" && <div className="ed-payment-radio-dot" />}
                  </div>
                  <div className="ed-payment-option-content">
                    <div className="ed-payment-option-header">
                      <span className="ed-payment-option-icon">🌐</span>
                      <h4 className="ed-payment-option-name">VNPAY (Ví/QR)</h4>
                    </div>
                    <p className="ed-payment-option-desc">Thanh toán qua ví VNPAY hoặc quét mã QR</p>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="ed-checkout-notes">
                <label className="ed-checkout-notes-label">Ghi chú đơn hàng</label>
                <textarea
                  className="ed-checkout-notes-input"
                  rows={2}
                  placeholder="Ghi chú cho đơn hàng (ví dụ: giao giờ hành chính)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="ed-checkout-right">
            <div className="ed-checkout-summary-card">
              <h3 className="ed-checkout-summary-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                Đơn Hàng
              </h3>

              {sellerGroupsArray.map((group, idx) => (
                <div key={idx} className="ed-checkout-store-box">
                  <div className="ed-checkout-store-name">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                    {group.storeName}
                  </div>
                  {group.items.map((item, index) => (
                    <div key={index} className="ed-checkout-item">
                      <img src={item.productImage} alt={item.productName} className="ed-checkout-item-img" />
                      <div className="ed-checkout-item-info">
                        <p className="ed-checkout-item-name">{item.productName}</p>
                        <p className="ed-checkout-item-qty">x{item.soLuong} · {formatVND(item.donGia)}</p>
                        <p className="ed-checkout-item-weight">Trọng lượng: {((item.weight || 0) * item.soLuong)}g</p>
                      </div>
                      <span className="ed-checkout-item-price">{formatVND(item.soLuong * item.donGia)}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="ed-checkout-summary-rows">
                <div className="ed-checkout-summary-row">
                  <span>Tạm tính</span>
                  <span className="ed-checkout-summary-value">{formatVND(total)}</span>
                </div>
                <div className="ed-checkout-summary-row">
                  <span>Vận chuyển</span>
                  <span className="ed-checkout-summary-value">{formatVND(totalShipping)}</span>
                </div>
                <div className="ed-checkout-summary-row">
                  <span>Đơn vị vận chuyển</span>
                  <span className="ed-checkout-summary-value">GHTK</span>
                </div>
              </div>
              <div className="ed-checkout-summary-total">
                <span>Tổng cộng</span>
                <span className="ed-checkout-summary-total-value">{formatVND(total + totalShipping)}</span>
              </div>

              <button className="ed-btn-primary ed-btn-checkout-order" onClick={handleOrder}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                ĐẶT HÀNG NGAY
              </button>
              <button className="ed-btn-checkout-back" onClick={() => navigate(ROUTES.CART)}>
                ← Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
